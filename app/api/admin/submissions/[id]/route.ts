import { NextResponse } from 'next/server';
import { requireAdmin, adminErrorResponse } from '@/lib/server/admin';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const decision = String(body.decision || '');
    const note = String(body.note || '').trim();
    if (!['approve','reject','changes','hold'].includes(decision)) return NextResponse.json({error:'Invalid decision.'},{status:400});
    const state = decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : decision === 'changes' ? 'changes_requested' : 'under_review';
    const { data: submission, error } = await supabase.from('seller_submissions').update({status:state,admin_decision:decision,admin_note:note||null,updated_at:new Date().toISOString()}).eq('id',id).select('id,seller_id,title,status').single();
    if (error) return NextResponse.json({error:error.message},{status:400});
    if (decision === 'approve') {
      await supabase.from('products').insert({seller_id:submission.seller_id,title:submission.title,description:'Published from approved seller submission.',category:'Other',status:'active'});
    }
    await supabase.from('AuditLog').insert({id:crypto.randomUUID(),action:`submission_${decision}`,actorId:user.id,targetId:id,metadata:{note}}).then(()=>{}).catch(()=>{});
    await supabase.from('notifications').insert({user_id:submission.seller_id,title:`Submission ${decision}`,message:note||`Your submission was ${decision}.`}).then(()=>{}).catch(()=>{});
    return NextResponse.json({ok:true,submission});
  } catch (e) { return adminErrorResponse(e); }
}
