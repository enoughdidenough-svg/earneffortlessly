import Link from 'next/link';
import { requireAdmin } from '@/lib/server/admin';
export default async function Admin(){
 const {supabase}=await requireAdmin();
 const [subs,orders,payments,users,flags,appeals,tasks,rentals,health]=await Promise.all([
  supabase.from('seller_submissions').select('id,title,status,ai_state,quality_score,risk_score,created_at').order('created_at',{ascending:false}).limit(30),
  supabase.from('orders').select('id',{count:'exact',head:true}).eq('status','pending'),
  supabase.from('payments').select('id',{count:'exact',head:true}).in('status',['submitted','verifying']),
  supabase.from('profiles').select('id',{count:'exact',head:true}),
  supabase.from('moderation_flags').select('id',{count:'exact',head:true}).eq('resolved',false),
  supabase.from('appeals').select('id',{count:'exact',head:true}).eq('status','open'),
  supabase.from('ai_tasks').select('id',{count:'exact',head:true}).eq('status','queued'),
  supabase.from('rental_listings').select('id',{count:'exact',head:true}).eq('status','pending_admin'),
  supabase.from('diagnostics').select('id',{count:'exact',head:true}).in('status',['WARNING','ERROR','CRITICAL'])
 ]);
 const stats=[['Submissions','/admin/submissions',subs.data?.length||0],['Pending orders','/admin/orders',orders.count||0],['Payment verification','/admin/payments',payments.count||0],['Users','/admin/users',users.count||0],['Open flags','/admin/reports',flags.count||0],['Appeals','/admin/appeals',appeals.count||0],['AI queue','/admin/ai/queue',tasks.count||0],['Rental approvals','/admin/rentals',rentals.count||0],['Health alerts','/admin/health',health.count||0]];
 return <main className='container'><div className='eyebrow'>PRIVATE ADMIN</div><h1>Control center</h1><p className='muted'>Server-authorized operations, moderation evidence, financial verification and safe site management.</p><div className='grid3'>{stats.map(([label,href,count])=><Link className='card' href={String(href)} key={String(href)}><p className='muted'>{label}</p><div className='stat'>{String(count)}</div></Link>)}</div><section className='card wide' style={{marginTop:20}}><h2>Latest submissions</h2>{!subs.data?.length?<p className='muted'>No submissions.</p>:subs.data.map(r=><Link href={`/admin/submissions/${r.id}`} className='row' key={r.id}><div><b>{r.title}</b><small>{r.status} · AI {r.ai_state}</small></div><span>Q {r.quality_score??'—'} · R {r.risk_score??'—'}</span></Link>)}</section><section className='card wide'><h2>Management</h2><div className='chips'>{[['Royalties','/admin/royalties'],['Royalty adjustments','/admin/royalty-adjustments'],['Manual royalty payments','/admin/payouts'],['Reviews','/admin/reviews'],['Wishlist','/admin/wishlists'],['Rentals','/admin/rentals'],['Social connections','/admin/social'],['Advertising','/admin/advertising'],['AI memory','/admin/ai/memory'],['AI decisions','/admin/ai/decisions'],['Upgrade manager','/admin/upgrades'],['Preview','/admin/preview'],['Rollback','/admin/rollback'],['Incidents','/admin/incidents'],['Audit','/admin/audit'],['Security','/admin/security'],['Settings','/admin/settings'],['Backup','/admin/backup'],['Maintenance','/admin/maintenance']].map(([n,h])=><Link href={h} key={h}>{n}</Link>)}</div></section></main>
}