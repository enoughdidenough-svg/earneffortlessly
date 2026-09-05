export type AdminCommand={intent:'ban'|'unban'|'suspend'|'approve'|'decline'|'recheck'|'rollback'|'diagnose'|'unknown';target?:string;duration?:string;raw:string};

export function parseAdminCommand(raw:string):AdminCommand{
 const s=raw.trim();const lower=s.toLowerCase();
 const target=s.replace(/^(please\s+)?(ban|unban|suspend|approve|decline|recheck|rollback|diagnose)\b/i,'').trim();
 if(/^\s*(please\s+)?ban\b/i.test(s))return {intent:'ban',target,raw:s};
 if(/^\s*(please\s+)?unban\b/i.test(s))return {intent:'unban',target,raw:s};
 if(/^\s*(please\s+)?suspend\b/i.test(s))return {intent:'suspend',target,raw:s};
 if(/\bapprove\b/i.test(lower))return {intent:'approve',target,raw:s};
 if(/\bdecline\b|reject/i.test(lower))return {intent:'decline',target,raw:s};
 if(/\brecheck\b|scan again/i.test(lower))return {intent:'recheck',target,raw:s};
 if(/\brollback\b|revert/i.test(lower))return {intent:'rollback',target,raw:s};
 if(/\bdiagnos|health check|debug/i.test(lower))return {intent:'diagnose',target,raw:s};
 return {intent:'unknown',raw:s};
}
