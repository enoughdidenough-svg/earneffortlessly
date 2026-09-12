import Link from 'next/link';
import { requireAdmin } from '@/lib/server/admin';

export default async function AdminAdvertisingPage(){
 const {supabase}=await requireAdmin();
 const [{data: campaigns},{data: properties}]=await Promise.all([
  supabase.from('ad_campaigns').select('id,campaign_type,keyword,copy_text,target_group,status,metrics,created_at').order('created_at',{ascending:false}).limit(50),
  supabase.from('ad_platform_connections').select('id,platform,account_label,page_id,status,metadata,updated_at').order('updated_at',{ascending:false}).limit(50),
 ]);
 return <main className='container'>
  <p><Link href='/admin'>← Admin</Link></p>
  <div className='section-head'><div><div className='eyebrow'>ADVERTISING</div><h1>Advertising control</h1><p className='muted'>Campaign planning and approved platform connections. Posting remains disabled until a real official social connection and permitted property exist.</p></div></div>
  <section className='card wide'><h2>Connected properties</h2>{!properties?.length?<p className='muted'>No advertising property is connected. Connect one from <Link href='/admin/social'>Social connections</Link>.</p>:properties.map((p:any)=><div className='row' key={p.id}><div><b>{p.account_label}</b><small>{p.platform} · Page {p.page_id||'not selected'}</small></div><span>{p.status}</span></div>)}</section>
  <section className='card wide'><h2>Campaigns</h2>{!campaigns?.length?<p className='muted'>No campaigns have been created yet.</p>:campaigns.map((c:any)=><div className='row' key={c.id}><div><b>{c.keyword||c.campaign_type}</b><small>{c.target_group||'General'} · {c.copy_text||'No copy yet'}</small></div><span>{c.status}</span></div>)}</section>
  <section className='card wide'><h2>Safety</h2><p className='muted'>Only official APIs are allowed. The advertising subsystem must enforce permission checks, cooldowns, duplicate detection, rate limits, audit logging and the global advertising kill switch before any real posting action.</p></section>
 </main>;
}
