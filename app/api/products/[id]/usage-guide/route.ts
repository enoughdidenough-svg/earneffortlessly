import {NextResponse} from 'next/server';
import {createServerSupabase,createServerAdminSupabase} from '@/lib/supabase-server';

export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const db=await createServerSupabase();
  const {data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});

  const admin=await createServerAdminSupabase();
  const {data:ownership}=await admin.from('product_ownerships')
    .select('id,status,order_id').eq('buyer_id',user.id).eq('product_id',id).eq('status','active').limit(1).maybeSingle();
  if(!ownership)return NextResponse.json({error:'Purchase verification required.'},{status:403});

  const {data:guide}=await admin.from('product_usage_guides')
    .select('id,public_summary,buyer_steps,supported_formats,conversion_class,safety_notes,approved')
    .eq('product_id',id).eq('approved',true).single();
  if(!guide)return NextResponse.json({error:'Usage guide is not available yet.'},{status:404});
  return NextResponse.json({ok:true,guide});
}
