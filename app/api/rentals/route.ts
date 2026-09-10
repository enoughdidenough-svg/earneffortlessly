import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
async function body(req:Request){const ct=req.headers.get('content-type')||'';return ct.includes('json')?req.json().catch(()=>({})):Object.fromEntries((await req.formData()).entries())}
export async function POST(req:Request){
 const supabase=await createServerSupabase();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.redirect(new URL('/login',req.url));
 const b=await body(req);const listingId=String(b.listingId||'').trim();if(!listingId)return NextResponse.json({error:'listingId is required.'},{status:400});
 const{data:listing,error:le}=await supabase.from('rental_listings').select('id,seller_id,platform,price,status').eq('id',listingId).single();if(le||!listing||listing.status!=='approved')return NextResponse.json({error:'Rental listing is not available.'},{status:404});
 if(listing.seller_id===user.id)return NextResponse.json({error:'You cannot rent your own account.'},{status:400});
 const now=new Date();const{data:active}=await supabase.from('rental_sessions').select('id').eq('listing_id',listing.id).in('status',['active','pending']).gt('ends_at',now.toISOString()).maybeSingle();if(active)return NextResponse.json({error:'This account already has an active/pending rental.'},{status:409});
 const ends=new Date(now.getTime()+86400000);const{data:session,error}=await supabase.from('rental_sessions').insert({listing_id:listing.id,buyer_id:user.id,starts_at:now.toISOString(),ends_at:ends.toISOString(),status:'pending'}).select('id,starts_at,ends_at,status').single();if(error||!session)return NextResponse.json({error:error?.message||'Could not create rental session.'},{status:400});
 const ref=`rental-${session.id}`;await supabase.from('payments').insert({provider:'manual',status:'created',amount:listing.price,currency:'USD',transaction_ref:ref,idempotency_key:ref});
 return req.headers.get('content-type')?.includes('form')?NextResponse.redirect(new URL('/buyer/rentals',req.url)):NextResponse.json({ok:true,session,paymentReference:ref,message:'Rental created pending payment verification.'});
}
export async function GET(){const s=await createServerSupabase();const{data:{user}}=await s.auth.getUser();if(!user)return NextResponse.json({error:'Sign in required'},{status:401});const{data,error}=await s.from('rental_sessions').select('id,listing_id,starts_at,ends_at,status,platform_access_id,rental_listings(platform,account_handle,price)').eq('buyer_id',user.id).order('created_at',{ascending:false});return NextResponse.json({data:data||[],error:error?.message});}
