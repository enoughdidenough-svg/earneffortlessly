import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase';

export default async function AdminFinance() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin/finance');
  const { data: admin } = await supabase.from('profiles').select('is_admin,status').eq('id', user.id).single();
  if (!admin?.is_admin || admin.status !== 'active') return <main className="container"><div className="error">Admin access required.</div></main>;
  const { data: reports } = await supabase.from('financial_reports').select('*').order('period_end', { ascending: false }).limit(24);
  return <main className="container"><h1>Finance</h1><p className="muted">Verified-payment reporting only. No financial record is deleted by reporting.</p><div className="grid grid2">{(reports || []).map(r => <div className="card" key={r.id}><span className="badge">{r.period_type}</span><h3>{new Date(r.period_start).toLocaleDateString()} — {new Date(r.period_end).toLocaleDateString()}</h3><p>Gross: <b>{r.gross_amount ?? 0}</b></p><p>Royalty: <b>{r.royalty_amount ?? 0}</b></p><p>Referral: <b>{r.referral_amount ?? 0}</b></p><p>Net: <b>{r.net_amount ?? 0}</b></p></div>)}</div>{(!reports || reports.length===0)&&<div className="notice">No reports generated yet.</div>}</main>;
}
