export type MemoryItem={id:string;kind:'fact'|'decision'|'lesson'|'task'|'preference'|'incident'|'solution';text:string;tags:string[];createdAt:string;importance:number;source?:string;confidence?:number};
export type AgentPlan={goal:string;steps:string[];risk:'low'|'medium'|'high'|'critical';needsApproval:boolean;rollbackRequired:boolean;autofixEligible:boolean;verification:string[]};
export type HealthSignal={kind:'error'|'warning'|'stale'|'latency'|'availability'|'security'|'data';message:string;severity:number;reversible:boolean;safeToAutofix:boolean};

const STOP=new Set(['the','and','for','with','that','this','from','have','will','your','into','then','than','are','was','but','not','you','use','make','more','only','please','site','system']);

export function keywords(text:string,limit=16){return [...new Set((text.toLowerCase().match(/[a-z0-9_]{3,}/g)||[]).filter(x=>!STOP.has(x)))].slice(0,limit)}

export function remember(text:string,kind:MemoryItem['kind']='fact',importance=5,source='agent',confidence=0.8):MemoryItem{
 const clean=text.trim().replace(/\s+/g,' ').slice(0,2000);
 return {id:crypto.randomUUID(),kind,text:clean,tags:keywords(clean),createdAt:new Date().toISOString(),importance:Math.max(1,Math.min(10,importance)),source,confidence:Math.max(0,Math.min(1,confidence))};
}

export function classifyHealthSignal(message:string):HealthSignal{
 const m=message.trim();
 const security=/credential|token leak|unauthorized|permission bypass|security breach/i.test(m);
 const data=/data loss|corrupt|truncate|wrong balance|orphan record/i.test(m);
 const severe=security||data;
 const stale=/stale|timeout|hung|expired|queue/i.test(m);
 const latency=/slow|latency|response time|performance/i.test(m);
 const availability=/down|unavailable|crash|failed to load|500|503/i.test(m);
 const safe=!severe && !/payment|refund|payout|ownership|role|delete|production deploy/i.test(m);
 return {kind:security?'security':data?'data':stale?'stale':latency?'latency':availability?'availability':/warning/i.test(m)?'warning':'error',message:m,severity:severe?95:availability?85:stale?65:latency?55:45,reversible:safe,safeToAutofix:safe && (stale||latency||availability||/broken link|configuration mismatch|failed check|diagnostic/i.test(m))};
}

export function planAutonomousWork(goal:string):AgentPlan{
 const g=goal.trim().replace(/\s+/g,' ').slice(0,2000);
 const risky=/publish|delete|refund|payout|ban|unban|payment|permission|security|production|deploy|ownership|role/i.test(g);
 const destructive=/delete|drop|truncate|remove permanently|payout|refund|ownership/i.test(g);
 const healthRepair=/fix|repair|debug|heal|resolve|restore|broken|error|failure|crash|issue|problem/i.test(g);
 const risk:AgentPlan['risk']=destructive?'critical':risky?'high':healthRepair?'low':'low';
 return {
  goal:g,
  steps:['understand the requested outcome','inspect live system state and relevant history','retrieve useful prior memory','break the goal into small verifiable tasks','select the least risky reversible action','execute eligible safe changes automatically','run diagnostics and targeted validation','record the result and learned lesson','create rollback information for every change','escalate only irreversible or ownership/financial/security actions'],
  risk,
  needsApproval:risky,
  rollbackRequired:risky||healthRepair,
  autofixEligible:healthRepair && !risky,
  verification:['typecheck/build where applicable','targeted health check','database/integration consistency check','post-change smoke check']
 };
}

export function shouldAutoFix(message:string){return classifyHealthSignal(message).safeToAutofix}

export function rankMemories(items:MemoryItem[],query:string){const q=new Set(keywords(query,40));return [...items].map(x=>({...x,score:[...new Set([...x.tags,...keywords(x.text)])].filter(t=>q.has(t)).length*4+x.importance*1.5+(x.confidence??0.8)*2})).sort((a,b)=>b.score-a.score)}

export function dedupeMemory(items:MemoryItem[]):MemoryItem[]{
 const seen=new Set<string>();
 return items.filter(item=>{const key=item.text.toLowerCase().replace(/\s+/g,' ').slice(0,240);if(seen.has(key))return false;seen.add(key);return true;});
}
