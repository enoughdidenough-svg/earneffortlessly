import Link from 'next/link';
import { requireAdmin } from '@/lib/server/admin';

export default async function AdminReportDetail({params}:{params:Promise<{id:string}>}){
 const {supabase}=await requireAdmin(); const {id}=await params;
 const {data:r,error}=await supabase.from('ai_security_reports').select('*').eq('id',id).single();
 if(error||!r)return <main className='container'><div className='error'>Report not found.</div></main>;
 const indicators=Array.isArray(r.indicators)?r.indicators:[]; const p=r.provenance||{}; const c=r.content_analysis||{};
 return <main className='container'><p><Link href='/admin/reports'>← Reports</Link></p>
  <div className='section-head'><div><div className='eyebrow'>FULL AI ANALYSIS</div><h1>{r.verdict}</h1><p className='muted'>{r.summary_en}</p></div><span className='badge'>{r.threat_level} · {r.threat_score}/100</span></div>
  <div className='grid3'><div className='card'><p className='muted'>Threat</p><div className='stat'>{r.threat_score}</div></div><div className='card'><p className='muted'>Quality</p><div className='stat'>{r.quality_score}</div></div><div className='card'><p className='muted'>Originality</p><div className='stat'>{r.originality_score}</div></div></div>
  <section className='card wide'><h2>Admin-ready summary</h2><div className='report-language'><div><b>English</b><p className='muted'>{r.summary_en}</p></div><div><b>বাংলা</b><p className='muted'>{r.summary_bn||'বাংলা সারাংশ এখনো তৈরি হয়নি।'}</p></div></div></section>
  <section className='card wide'><h2>Threat indicators</h2>{!indicators.length?<div className='notice'>No deterministic security indicators fired.</div>:<div className='stack'>{indicators.map((x:any,i:number)=><div className='row' key={x.code||i}><div><b>{x.label}</b><small>{x.family} · {x.code}</small></div><span className='badge'>{x.severity}</span><p className='muted'>{x.explanation}</p></div>)}</div>}</section>
  <section className='grid2 wide'><div className='card'><h2>Content analysis</h2><pre className='report-pre'>{JSON.stringify(c,null,2)}</pre></div><div className='card'><h2>Provenance & originality</h2><p><b>Local duplicate:</b> {p.local_duplicate?'YES':'NO'}</p><p><b>External web/social:</b> {p.external_status}</p><p><b>Scope:</b> {(p.scope||[]).join(', ')}</p><div className='notice'>{p.note}</div></div></section>
  <section className='card wide'><h2>Evidence, recommendations & audit</h2><pre className='report-pre'>{JSON.stringify({evidence:r.evidence,recommendations:r.recommendations,audit:r.source_research_version},null,2)}</pre></section>
 </main>
}
