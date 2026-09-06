export type MemoryItem={id:string;kind:'fact'|'decision'|'lesson'|'task'|'preference';text:string;tags:string[];createdAt:string;importance:number};
export type AgentPlan={goal:string;steps:string[];risk:'low'|'medium'|'high';needsApproval:boolean;rollbackRequired:boolean};

const STOP=new Set(['the','and','for','with','that','this','from','have','will','your','into','then','than','are','was','but','not','you','use','make','more','only']);

export function keywords(text:string,limit=12){return [...new Set((text.toLowerCase().match(/[a-z0-9_]{3,}/g)||[]).filter(x=>!STOP.has(x)))].slice(0,limit)}

export function remember(text:string,kind:MemoryItem['kind']='fact',importance=5):MemoryItem{
 const clean=text.trim().replace(/\s+/g,' ').slice(0,2000);
 return {id:crypto.randomUUID(),kind,text:clean,tags:keywords(clean),createdAt:new Date().toISOString(),importance:Math.max(1,Math.min(10,importance))};
}

export function planAutonomousWork(goal:string):AgentPlan{
 const g=goal.trim().replace(/\s+/g,' ').slice(0,2000);
 const risky=/publish|delete|refund|payout|ban|unban|payment|permission|security|production|deploy/i.test(g);
 const destructive=/delete|drop|truncate|remove permanently|payout|refund/i.test(g);
 return {goal:g,steps:['understand the requested outcome','inspect relevant system state and prior memory','break the goal into small verifiable tasks','execute only safe reversible changes automatically','run diagnostics and validation after each change','record results, failures, and lessons','prepare a preview/diff for risky or irreversible actions','request explicit admin approval before final release'],risk:destructive?'high':risky?'medium':'low',needsApproval:risky,rollbackRequired:risky};
}

export function shouldAutoFix(message:string){return /timeout|stale|missing index|invalid state|failed check|diagnostic|broken link|configuration mismatch/i.test(message)&&!/data loss|credential|payment|security breach|delete/i.test(message)}

export function rankMemories(items:MemoryItem[],query:string){const q=new Set(keywords(query,30));return [...items].map(x=>({...x,score:[...new Set([...x.tags,...keywords(x.text)])].filter(t=>q.has(t)).length*3+x.importance})).sort((a,b)=>b.score-a.score)}
