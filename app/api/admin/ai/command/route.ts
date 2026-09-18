import {NextResponse} from 'next/server';
import {requireAdmin,adminErrorResponse} from '@/lib/server/admin';
import {parseAdminCommand} from '@/lib/ai/command-router';

export async function POST(req:Request){
 try{
  const{supabase,user}=await requireAdmin();
  const b=await req.json().catch(()=>({}));
  const raw=String(b.command||'').trim();
  if(!raw)return NextResponse.json({error:'Command required'},{status:400});
  const parsed=parseAdminCommand(raw);
  const status=['ban','unban','suspend','approve','decline','rollback'].includes(parsed.intent)?'pending_approval':'queued';
  const{data:memoryRows}=await supabase.from('ai_memory')
    .select('id,scope,memory_type,title,content,importance,confidence,updated_at')
    .eq('user_id',user.id).eq('active',true)
    .order('importance',{ascending:false}).order('updated_at',{ascending:false}).limit(12);
  const memoryContext=(memoryRows??[]).map((m:any)=>({title:m.title,content:String(m.content).slice(0,500),confidence:m.confidence,scope:m.scope}));
  const{data,error}=await supabase.from('admin_commands').insert({
    admin_id:user.id,
    command:raw,
    parsed,
    status,
    result:{intent:parsed.intent,target:parsed.target||null,memory_context:memoryContext}
  }).select('id,status,parsed,result').single();
  if(error)return NextResponse.json({error:error.message},{status:400});
  await supabase.from('ai_memory').upsert({
    user_id:user.id,scope:'decision',memory_type:'admin_command',
    title:'Admin AI command',
    content:JSON.stringify({command:raw,intent:parsed.intent,target:parsed.target||null,status}),
    memory_key:'admin-command:'+data.id,
    importance:parsed.risky?.9:.65,
    confidence:.9,source_ref:data.id,active:true,updated_at:new Date().toISOString(),tags:['admin','ai-command']
  });

  return NextResponse.json({ok:true,command:data});
 }catch(e){return adminErrorResponse(e)}
}
