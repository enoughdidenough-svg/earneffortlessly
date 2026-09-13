export type AdminCommand = {
  intent: 'ban'|'unban'|'suspend'|'approve'|'decline'|'recheck'|'rollback'|'diagnose'|'upgrade'|'optimize'|'inspect'|'repair'|'report'|'unknown';
  target?: string;
  raw: string;
  requestedAutofix: boolean;
  risky: boolean;
};

const riskyWords = /\b(ban|unban|refund|payout|payment|delete|remove permanently|role|permission|ownership|production|deploy|release|security breach)\b/i;
const repairWords = /\b(fix|repair|debug|resolve|heal|correct|restore|broken|error|failure|crash|issue|problem)\b/i;

export function parseAdminCommand(raw: string): AdminCommand {
  const s = raw.trim();
  const lower = s.toLowerCase();
  const target = s.replace(/^\s*(please\s+)?(ban|unban|suspend|approve|decline|recheck|rollback|diagnose|upgrade|optimize|inspect|repair|fix|report)\b/i, '').trim();
  const requestedAutofix = repairWords.test(s) && !/just tell me|only inspect|do not change/i.test(s);
  const risky = riskyWords.test(s);

  if (/^\s*(please\s+)?ban\b/i.test(s)) return { intent:'ban', target, raw:s, requestedAutofix:false, risky:true };
  if (/^\s*(please\s+)?unban\b/i.test(s)) return { intent:'unban', target, raw:s, requestedAutofix:false, risky:true };
  if (/^\s*(please\s+)?suspend\b/i.test(s)) return { intent:'suspend', target, raw:s, requestedAutofix:false, risky:true };
  if (/\bapprove\b/i.test(lower)) return { intent:'approve', target, raw:s, requestedAutofix:false, risky };
  if (/\bdecline\b|\breject\b/i.test(lower)) return { intent:'decline', target, raw:s, requestedAutofix:false, risky:true };
  if (/\brecheck\b|scan again|verify again/i.test(lower)) return { intent:'recheck', target, raw:s, requestedAutofix:false, risky:false };
  if (/\brollback\b|revert/i.test(lower)) return { intent:'rollback', target, raw:s, requestedAutofix:false, risky:true };
  if (/\bupgrade\b|add a feature|change the website|improve the site/i.test(lower)) return { intent:'upgrade', target, raw:s, requestedAutofix, risky };
  if (/\boptimi[sz]e\b|improve|make .*better|simplify/i.test(lower)) return { intent:'optimize', target, raw:s, requestedAutofix, risky };
  if (/\binspect\b|review|analy[sz]e|audit/i.test(lower)) return { intent:'inspect', target, raw:s, requestedAutofix:false, risky:false };
  if (/\brepair\b|\bfix\b|\bdebug\b|\bheal\b|\bresolve\b/i.test(lower)) return { intent:'repair', target, raw:s, requestedAutofix:true, risky };
  if (/\breport\b|summary|what happened|status/i.test(lower)) return { intent:'report', target, raw:s, requestedAutofix:false, risky:false };
  if (/\bdiagnos|health check|debug/i.test(lower)) return { intent:'diagnose', target, raw:s, requestedAutofix:false, risky:false };
  return { intent:'unknown', raw:s, requestedAutofix, risky };
}
