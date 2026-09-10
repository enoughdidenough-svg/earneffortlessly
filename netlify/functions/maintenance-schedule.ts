import type { Context, Config } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

export default async (_req: Request, _context: Context) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return new Response(JSON.stringify({status:'NOT_CONFIGURED'}),{status:200,headers:{'content-type':'application/json'}});
  const supabase = createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
  const now = new Date().toISOString();
  const checks:any[]=[];
  const db = await supabase.from('ai_heartbeat').select('id').limit(1);
  checks.push({component:'database',status:db.error?'ERROR':'OK',message:db.error?.message||'Database reachable'});
  const expired = await supabase.from('rental_sessions').update({status:'expired'}).in('status',['active','pending']).lt('ends_at',now);
  checks.push({component:'rental_expiry',status:expired.error?'ERROR':'OK',message:expired.error?.message||'Expired sessions reconciled'});
  const queued = await supabase.from('ai_tasks').select('id').eq('status','queued').order('priority',{ascending:false}).limit(100);
  checks.push({component:'ai_queue',status:queued.error?'ERROR':'OK',message:queued.error?.message||`${queued.data?.length||0} queued tasks`});
  await supabase.from('diagnostics').insert(checks.map(x=>({component:x.component,status:x.status,message:x.message,details:{scheduled:true},checked_at:now})));
  await supabase.from('ai_heartbeat').update({last_run_at:now}).eq('id',(await supabase.from('ai_heartbeat').select('id').limit(1).single()).data?.id||'00000000-0000-0000-0000-000000000000');
  return new Response(JSON.stringify({ok:true,checked_at:now,checks}),{status:200,headers:{'content-type':'application/json'}});
};
export const config: Config = { schedule: '*/10 * * * *' };
