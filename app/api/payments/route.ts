import {NextResponse} from 'next/server';
import {createServerSupabase} from '@/lib/supabase';

export async function POST(req:Request){
 const s=await createServerSupabase(); const {data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
 const b=await req.json().catch(()=>({})); const orderId=String(b.orderId||''); const reference=String(b.transactionReference||'').trim(); const proof=String(b.proofPath||'').trim();
 if(!orderId||!reference)return NextResponse.json({error:'Order and transaction reference are required.'},{status:400});
 const {data:o}=await s.from('orders').select('id,buyer_id,amount,currency,status').eq('id',orderId).single();
 if(!o||o.buyer_id!==user.id)return NextResponse.json({error:'Order not found.'},{status:404});
 if(['paid','completed'].includes(o.status))return NextResponse.json({error:'Order is already paid.'},{status:409});
 const {data:p,error}=await s.from('payments').upsert({order_id:orderId,provider:'manual',status:'submitted',amount:o.amount,currency:o.currency,transaction_ref:reference,proof_path:proof||null,idempotency_key:reference},{onConflict:'order_id,idempotency_key'}).select('id,status').single();
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({ok:true,payment:p,message:'Payment submitted for admin verification.'});
}
