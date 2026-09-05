export type ModerationResult={action:'allow'|'review'|'suspend'|'ban';flags:string[];reason:string};

const severe=['malware','virus','trojan','credential theft','child sexual abuse','terrorism'];
const prohibited=['adult','pornography','illegal'];

export function moderateText(text:string):ModerationResult{
 const value=text.toLowerCase();
 const severeHit=severe.find(x=>value.includes(x));
 if(severeHit)return {action:'ban',flags:[severeHit],reason:`Potentially harmful content: ${severeHit}`};
 const policyHit=prohibited.find(x=>value.includes(x));
 if(policyHit)return {action:'review',flags:[policyHit],reason:`Potential policy violation: ${policyHit}`};
 return {action:'allow',flags:[],reason:'No obvious policy signal detected.'};
}

export function escalationForHistory(history:string[]):'normal'|'cautious'|'strict'{
 const severeCount=history.filter(x=>/malware|virus|trojan|illegal|adult/i.test(x)).length;
 const lowCount=history.filter(x=>/low.?quality|blank|spam/i.test(x)).length;
 if(severeCount>=1)return 'strict';
 if(lowCount>=2)return 'cautious';
 return 'normal';
}
