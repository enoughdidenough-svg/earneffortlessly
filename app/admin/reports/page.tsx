import Link from 'next/link';
import { requireAdmin } from '@/lib/server/admin';

function levelClass(v:string){return v==='CRITICAL'||v==='HIGH'?'error':v==='MEDIUM'?'warning':'notice'}
function short(v:string|null|undefined){return v? v.length>220?`${v.slice(0,220)}…`:v:'No summary available.'}
export default async function AdminReports(){
 const {supabase}=await requireAdmin();
 const {data,error}=await supabase.from('ai_security_reports').select('id,submission_id,verdict,threat_level,threat_score,confidence,quality_score,originality_score,indicator_count,summary_en,summary_bn,provenance,created_at').order('created_at',{ascending:false}).limit(100);
 return <main className='container'>
  <p><Link href='/admin'>← Admin</Link></p>
  <div className='section-head'><div><div className='eyebrow'>AI SECURITY & ORIGINALITY</div><h1>Smart reports</h1><p className='muted'>One compact view of quality, security, originality, provenance, evidence and recommended action. Reports are structured so the same facts can be rendered in different languages.</p></div><span className='badge'>APE-V2</span></div>
  {error&&<div className='error'>Report center could not load.</div>}
  <div className='grid'>
   {(data??[]).map((r:any)=><Link href={`/admin/reports/${r.id}`} className='card report-card' key={r.id}>
    <div className='report-top'><span className='badge'>{r.verdict}</span><span className='badge'>{r.threat_level} · {r.threat_score}/100</span></div>
    <h2>{r.summary_en?.split(':')[0]||'Inspection report'}</h2>
    <p className='muted'>{short(r.summary_en)}</p>
    <div className='report-metrics'><span>Quality <b>{r.quality_score}</b></span><span>Originality <b>{r.originality_score}</b></span><span>Confidence <b>{r.confidence}</b></span><span>Indicators <b>{r.indicator_count}</b></span></div>
    <div className={levelClass(r.threat_level)}>{r.provenance?.external_status==='UNVERIFIED'?'Web/social provenance not verified yet.':'Web/social provenance verified.'}</div>
   </Link>)}
   {!data?.length&&<div className='notice'>No AI security reports yet.</div>}
  </div>
 </main>
}
