import Link from 'next/link';
import { requireAdmin } from '@/lib/server/admin';

export default async function AdminSection({params}:{params:Promise<{section?:string[]}>}){
 const {supabase}=await requireAdmin();
 const {section=[]}=await params;
 const key=section.join('/')||'dashboard';
 let data:any[]=[];
 let error:any=null;

 if(key==='submissions'){
  const result=await supabase.from('seller_submissions').select('id,title,status,ai_state,quality_score,risk_score,created_at,seller_id').order('created_at',{ascending:false}).limit(100);
  data=result.data ?? []; error=result.error;
 } else if(key==='payments'){
  const result=await supabase.from('payments').select('*').order('created_at',{ascending:false}).limit(100);
  data=result.data ?? []; error=result.error;
 } else if(key==='royalties'){
  const result=await supabase.from('canonical_royalty_ledger').select('*').order('created_at',{ascending:false}).limit(100);
  data=result.data ?? []; error=result.error;
 } else if(key==='reports'){
  const result=await supabase.from('moderation_flags').select('*').order('created_at',{ascending:false}).limit(100);
  data=result.data ?? []; error=result.error;
 } else if(key==='rentals'){
  const result=await supabase.from('rental_listings').select('*').order('created_at',{ascending:false}).limit(100);
  data=result.data ?? []; error=result.error;
 } else if(key==='health'){
  const result=await supabase.from('diagnostics').select('*').order('checked_at',{ascending:false}).limit(100);
  data=result.data ?? []; error=result.error;
 } else if(key==='ai/queue'){
  const result=await supabase.from('ai_tasks').select('*').order('priority',{ascending:false}).order('created_at',{ascending:true}).limit(100);
  data=result.data ?? []; error=result.error;
 } else if(key==='ai/memory'){
  const result=await supabase.from('ai_memory').select('*').order('created_at',{ascending:false}).limit(100);
  data=result.data ?? []; error=result.error;
 } else if(key==='upgrades'){
  const result=await supabase.from('upgrade_requests').select('*').order('created_at',{ascending:false}).limit(100);
  data=result.data ?? []; error=result.error;
 } else if(['preview','rollback','deployments'].includes(key)){
  const result=await supabase.from('site_versions').select('*').order('version_no',{ascending:false}).limit(100);
  data=result.data ?? []; error=result.error;
 } else if(key==='payouts'){
  const result=await supabase.from('manual_royalty_payments').select('*').order('payment_date',{ascending:false}).limit(100);
  data=result.data ?? []; error=result.error;
 }

 const title=key.replaceAll('/',' / ').replace(/\b\w/g,c=>c.toUpperCase());
 return <main className='container'><p><Link href='/admin'>← Admin</Link></p><div className='card wide'><div className='eyebrow'>ADMIN</div><h1>{title}</h1><p className='muted'>Persistent server state. Financial and destructive operations require explicit confirmation.</p>{error&&<p className='error'>Unable to load this section.</p>}{key==='submissions'&&<div className='grid'>{data.map((r:any)=><Link className='card soft' href={`/admin/submissions/${r.id}`} key={r.id}><b>{r.title}</b><p>{r.status} · AI {r.ai_state}</p><small>Quality {r.quality_score??'—'} · Risk {r.risk_score??'—'}</small></Link>)}</div>}{key!=='submissions'&&(data.length?<pre style={{whiteSpace:'pre-wrap',overflowX:'auto'}}>{JSON.stringify(data,null,2)}</pre>:<div className='notice'>No records yet.</div>)}</div></main>;
}
