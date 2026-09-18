import { NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/server/admin';
import { createServerAdminSupabase } from '@/lib/supabase-server';

function buildUsageGuide(title:string,description:string,files:Array<{original_name:string|null;mime_type:string|null}>){
 const names=files.map(x=>x.original_name||'file').join(', ');
 const lower=(title+' '+description+' '+names).toLowerCase();
 if(/chrome|chromium|browser extension|extension/.test(lower)){
  return {
   public_summary:'The purchased archive must be extracted and loaded as a browser extension in a compatible Chromium-based browser. Detailed steps are available after verified purchase.',
   buyer_steps:'1. Download the purchased ZIP.\n2. Extract the ZIP to a local folder.\n3. Open Chrome/Chromium and go to Extensions.\n4. Turn on Developer mode.\n5. Choose Load unpacked and select the extracted extension folder.\n6. Pin the extension if you want quick access.\n7. Keep the original ZIP as your backup.',
   supported_formats:['ZIP'],
   conversion_class:'Archive → extracted usable extension package',
   safety_notes:['Install only in a browser profile you control.','Review permissions before enabling an extension from an untrusted source.']
  };
 }
 return {
   public_summary:'The digital file is delivered in its original approved format. After purchase, the buyer receives the exact steps needed to open, extract, import or otherwise use it with a compatible application.',
   buyer_steps:'Use the delivered file with the compatible application shown on the listing. Keep the original download as your backup. Follow the product-specific conversion or import steps shown here when applicable.',
   supported_formats:Array.from(new Set(files.map(x=>String(x.original_name||'').split('.').pop()||x.mime_type||'unknown').filter(Boolean))),
   conversion_class:'Digital file → compatible usable form according to the approved format',
   safety_notes:['Keep the original file unchanged as a backup.']
  };
}

export async function POST(req: Request,{params}:{params:Promise<{id:string}>}){
 try{
  const {supabase,user}=await requireAdmin(); const {id}=await params;
  const ct=req.headers.get('content-type')||''; const body=ct.includes('application/json')?await req.json().catch(()=>({})):Object.fromEntries((await req.formData()).entries());
  const decision=String(body.decision||''); const note=String(body.note||'').trim();
  if(!['approve','reject','changes','hold'].includes(decision)) return NextResponse.json({error:'Invalid decision.'},{status:400});
  const state=decision==='approve'?'approved':decision==='reject'?'rejected':decision==='changes'?'changes_requested':'under_review';
  const {data:submission,error}=await supabase.from('seller_submissions').update({status:state,admin_decision:decision,admin_note:note||null,updated_at:new Date().toISOString()}).eq('id',id).select('id,seller_id,title,seller_description,required_submission,secondary_submission,status').single();
  if(error)return NextResponse.json({error:error.message},{status:400});

  let product:any=null;
  if(decision==='approve'){
    const admin=await createServerAdminSupabase();
    const {data:submissionFiles}=await admin.from('submission_files').select('id,storage_path,original_name,mime_type,size_bytes,sha256,scan_status').eq('submission_id',id).order('created_at',{ascending:true});
    const safeFiles=(submissionFiles||[]).filter((x:any)=>!x.scan_status||x.scan_status==='clean'||x.scan_status==='passed'||x.scan_status==='approved');
    const category=String((submission.required_submission as any)?.category||'Other');
    const description=submission.seller_description||'Published from an approved seller submission.';
    const {data:existing}=await admin.from('products').select('id').eq('source_submission_id',id).maybeSingle();
    if(existing?.id){product=existing}else{
      const inserted=await admin.from('products').insert({
        seller_id:submission.seller_id,title:submission.title,description,category,status:'active',
        price:0,currency:'USD',delivery_info:'Digital delivery after verified payment.',
        commercial_use:true,source_included:true,instant_delivery:true,
        file_types:safeFiles.map((x:any)=>String(x.original_name||'').split('.').pop()).filter(Boolean),
        tags:Array.from(new Set((submission.title+' '+description).toLowerCase().match(/[a-z0-9]{3,}/g)||[])).slice(0,24),
        contents_count:Math.max(1,safeFiles.length),source_submission_id:id,quality_label:'AI reviewed'
      }).select('id').single();
      if(inserted.error)return NextResponse.json({error:inserted.error.message},{status:400});
      product=inserted.data;
    }

    for(const file of safeFiles){
      const existingPf=await admin.from('product_files').select('id').eq('product_id',product.id).eq('storage_path',file.storage_path).maybeSingle();
      if(existingPf.data?.id)continue;
      const destination='published/'+product.id+'/'+(file.original_name||file.id);
      const copied=await admin.storage.from('submission-files').copy(file.storage_path,destination);
      if(!copied.error){
        await admin.from('product_files').insert({
          product_id:product.id,storage_path:destination,original_name:file.original_name,
          mime_type:file.mime_type,size_bytes:file.size_bytes,sha256:file.sha256,active:true
        });
      }
    }

    const guide=buildUsageGuide(submission.title,description,safeFiles);
    await admin.from('product_usage_guides').upsert({
      product_id:product.id,source_submission_id:id,public_summary:guide.public_summary,buyer_steps:guide.buyer_steps,
      supported_formats:guide.supported_formats,conversion_class:guide.conversion_class,
      safety_notes:guide.safety_notes,generated_by:'marketplace-ai',approved:true,buyer_only:true,updated_at:new Date().toISOString()
    },{onConflict:'product_id'});

    await admin.from('ai_memory').insert({
      user_id:submission.seller_id,scope:'seller',memory_type:'decision',
      title:'Submission approved and published',
      content:JSON.stringify({submission_id:id,product_id:product.id,title:submission.title,decision,admin_id:user.id}),
      memory_key:'submission:'+id+':approved',importance:0.85,confidence:1,source_ref:id,tags:['approved','published']
    });
  }

  await supabase.from('AuditLog').insert({id:crypto.randomUUID(),adminId:user.id,action:`submission_${decision}`,targetType:'seller_submission',targetId:id,metadata:JSON.stringify({note,product_id:product?.id||null})});
  await supabase.from('notifications').insert({user_id:submission.seller_id,title:`Submission ${decision}`,message:note||`Your submission was ${decision}.`});
  const destination=decision==='approve'?'/admin/submissions':`/admin/submissions/${id}`;
  if(ct.includes('form'))return NextResponse.redirect(new URL(destination,req.url));
  return NextResponse.json({ok:true,submission,product});
 }catch(e){return adminErrorResponse(e)}
}