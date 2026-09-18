import Link from 'next/link';import{redirect}from'next/navigation';import{createServerSupabase,createServerAdminSupabase}from'@/lib/supabase-server';

export default async function BuyerGuide({params}:{params:Promise<{productId:string}>}){
 const{productId}=await params;
 const db=await createServerSupabase();const{data:{user}}=await db.auth.getUser();if(!user)redirect('/login');
 const admin=await createServerAdminSupabase();
 const{data:ownership}=await admin.from('product_ownerships').select('id,status').eq('buyer_id',user.id).eq('product_id',productId).eq('status','active').limit(1).maybeSingle();
 if(!ownership)return <main className='container'><div className='error'>Purchase verification required.</div></main>;
 const[{data:p},{data:g}]=await Promise.all([
  admin.from('products').select('id,title,description,file_types,compatible_with').eq('id',productId).single(),
  admin.from('product_usage_guides').select('buyer_steps,supported_formats,conversion_class,safety_notes').eq('product_id',productId).eq('approved',true).single()
 ]);
 if(!p||!g)return <main className='container'><div className='error'>Usage guide is not available yet.</div></main>;
 return <main className='container'><p><Link href='/buyer/library'>← Library</Link></p><div className='card wide'><div className='eyebrow'>BUYER-ONLY GUIDE</div><h1>{p.title}</h1><p className='muted'>{p.description}</p><h2>How to use it</h2><p style={{whiteSpace:'pre-wrap'}}>{g.buyer_steps}</p><h3>Supported formats</h3><p>{(g.supported_formats||p.file_types||[]).join?.(', ')||'See your download.'}</p>{g.conversion_class&&<p><b>Conversion:</b> {g.conversion_class}</p>}{g.safety_notes?.length&&<><h3>Safety notes</h3><ul>{g.safety_notes.map((x:string)=><li key={x}>{x}</li>)}</ul></>}</div></main>
}