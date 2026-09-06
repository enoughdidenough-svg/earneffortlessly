export type Decision={decision:'allow'|'review'|'reject'|'execute'|'plan';confidence:number;reasons:string[];actions:string[]};
export function decide(input:{risk:number;quality:number;flags:string[];request?:string}):Decision{
 const r=Math.max(0,Math.min(100,input.risk)),q=Math.max(0,Math.min(100,input.quality));
 const severe=input.flags.some(f=>/malware|credential|financial|illegal|adult|executable/i.test(f));
 if(severe||r>=85)return {decision:'reject',confidence:Math.min(99,80+r/5),reasons:['high-risk signal detected',...input.flags.slice(0,5)],actions:['quarantine','record evidence','require admin review']};
 if(r>=55||q<60||input.flags.length)return {decision:'review',confidence:75,reasons:['risk or quality threshold requires human review',...input.flags.slice(0,5)],actions:['collect more evidence','recheck files','prepare admin report']};
 if(input.request&&/upgrade|fix|diagnose|optimize/i.test(input.request))return {decision:'plan',confidence:82,reasons:['safe autonomous planning request'],actions:['inspect state','make reversible change','run diagnostics','retain rollback point']};
 return {decision:'allow',confidence:90,reasons:['no blocking risk signal','acceptable quality'],actions:['record decision','continue workflow']};
}
