/*
 Digital Salvage inspection worker.
 This worker deliberately has no external AI dependency. It consumes queued ai_tasks,
 applies deterministic safety/quality rules, and writes evidence back to Supabase.
 A future local model can be plugged into the same task contract without changing the site.
*/
export type InspectionResult={category:string;quality:number;risk:number;flags:string[];keywords:string[];primaryKeyword:string}
export function inspectSubmission(title:string,description:string):InspectionResult{
 const text=(title+' '+description).toLowerCase(); const flags:string[]=[]
 if(description.trim().length<20)flags.push('too_little_description')
 if(/free money|password dump|stolen account|credit card|malware|trojan|ransomware|adult|porn/.test(text))flags.push('high_risk_terms')
 const category=text.includes('code')||text.includes('script')?'Code':text.includes('video')?'Video':text.includes('image')||text.includes('design')?'Design':text.includes('audio')||text.includes('voice')?'Audio':text.includes('game')?'Games':text.includes('course')||text.includes('lesson')?'Education':'Other'
 const quality=flags.length?35:Math.min(95,60+Math.floor(description.length/20)); const risk=flags.length?75:10
 const keywords=Array.from(new Set((title+' '+description).split(/[^a-zA-Z0-9]+/).filter(x=>x.length>2))).slice(0,25)
 return {category,quality,risk,flags,keywords,primaryKeyword:keywords[0]||category.toLowerCase()}
}
