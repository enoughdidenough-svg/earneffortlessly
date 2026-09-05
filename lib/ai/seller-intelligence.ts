export type SubmissionInput={description:string;files:{name:string;mimeType:string;size:number}[]};
export type InspectionPlan={category:string;subcategories:string[];requiredInputs:string[];fallbackAllowed:boolean;checks:string[]};

const categories=['3D','Audio','Books','Code','Design','Documents','Education','Fonts','Games','Graphics','Marketing','Music','Photography','Plugins','Presets','Templates','Tools','Video','Writing','Other'];

export function createInspectionPlan(input:SubmissionInput):InspectionPlan{
 const text=input.description.toLowerCase();
 const category=text.match(/\b(game|unity|godot|unreal)\b/)?'Games':text.match(/\b(video|film|reel)\b/)?'Video':text.match(/\b(image|photo|graphic|design)\b/)?'Graphics':text.match(/\b(code|script|software|app)\b/)?'Code':text.match(/\b(audio|sound|voice|music)\b/)?'Audio':'Other';
 const types=new Set(input.files.map(f=>f.mimeType.split('/')[0]));
 return {category,subcategories:[],requiredInputs:Array.from(types.size?types:new Set(['text'])),fallbackAllowed:true,checks:['completeness','readability','accessibility','quality','duplicate/originality','malware safety','policy safety','seller history']};
}

export function buildAdminSummary(plan:InspectionPlan, description:string){
 return {category:plan.category,required:plan.requiredInputs,checks:plan.checks,summary:description.trim().slice(0,500)};
}
