/* Deterministic inspection only. Malware scanning is intentionally an external/deferred adapter. */
export const QUALITY_LABELS=['blank','corrupted','invalid','incomplete','extremely_low','low','below_average','average','medium','good','high','excellent','exceptional'] as const;
export const INSPECTION_FLAGS=[
 'blank_asset','corrupt_archive','invalid_format','missing_preview','unreadable','duplicate_content','incomplete_package','inconsistent_metadata','low_resolution','poor_audio_quality','broken_dependencies','placeholder_content','test_content','spam_submission','misleading_description','wrong_category','weak_documentation','poor_organization','unfinished','low_usability','low_compatibility','suspicious_origin','suspicious_license','repeated_submission','empty_archive','archive_too_large','unsupported_mime','extension_mismatch','missing_main_file','missing_license','missing_ownership_statement','missing_instructions','missing_sample','missing_schema','missing_engine_version','missing_source_file','missing_editable_file','missing_preview_media','missing_required_asset','unexpected_executable','script_in_archive','macro_indicator','password_protected_archive','encrypted_archive','external_dependency','broken_link_reference','language_mismatch','description_asset_mismatch','duplicate_filename','weak_metadata','manual_review_required','malware_scan_pending'
] as const;
export type InspectionResult={category:string;quality:number;qualityLabel:string;risk:number;flags:string[];keywords:string[];primaryKeyword:string;summary:string};
export type AssetMetadata={name?:string;mimeType?:string;sizeBytes?:number;sha256?:string;fileCount?:number;hasExecutable?:boolean;hasPreview?:boolean;hasLicense?:boolean;hasInstructions?:boolean;hasOwnership?:boolean;duplicate?:boolean;scanStatus?:string};

function classify(text:string){const t=text.toLowerCase();const rules:[string,string[]][]=[['Code',['code','script','javascript','python','typescript','source']],['Design',['design','ui','logo','graphic','illustration','vector']],['Video',['video','movie','reel','footage','animation']],['Audio',['audio','sound','voice','podcast','music']],['3D Assets',['3d','model','blender','mesh']],['Game Assets',['game','sprite','texture','unity','unreal']],['Education',['course','lesson','worksheet','tutorial','education']],['Templates',['template','notion','figma','canva']],['Documents',['document','pdf','ebook','guide']],['Data',['dataset','csv','json','spreadsheet','data']]];for(const [name,words] of rules)if(words.some(w=>t.includes(w)))return name;return 'Other'}

export function inspectSubmission(title:string,description:string,asset:AssetMetadata={}):InspectionResult{
 const text=(title+' '+description).toLowerCase();const flags:string[]=[];const category=classify(text);
 if(!description.trim()||description.trim().length<20)flags.push('too_little_description');
 if(/free money|password dump|stolen account|credit card|malware|trojan|ransomware|porn|child sexual abuse/.test(text))flags.push('high_risk_terms');
 if(asset.name&&/\.(exe|dll|scr|bat|cmd|ps1|msi)$/i.test(asset.name))flags.push('unexpected_executable');
 if(asset.hasExecutable)flags.push('unexpected_executable');
 if(asset.duplicate)flags.push('duplicate_content');
 if(asset.scanStatus==='pending'||!asset.scanStatus)flags.push('malware_scan_pending');
 if(asset.hasPreview===false)flags.push('missing_preview');
 if(asset.hasLicense===false)flags.push('missing_license');
 if(asset.hasOwnership===false)flags.push('missing_ownership_statement');
 if(asset.hasInstructions===false)flags.push('missing_instructions');
 if(asset.mimeType&&asset.name&&asset.name.includes('.')&&!asset.name.toLowerCase().endsWith('.'+asset.mimeType.split('/').pop()?.toLowerCase()))flags.push('extension_mismatch');
 if(asset.sizeBytes===0)flags.push('blank_asset');
 if(asset.fileCount===0)flags.push('empty_archive');
 const quality=Math.max(5,Math.min(98,75+Math.floor(description.length/30)-flags.length*4));
 const qualityLabel=quality<10?'blank':quality<25?'corrupted':quality<35?'invalid':quality<45?'incomplete':quality<50?'extremely_low':quality<60?'low':quality<68?'below_average':quality<75?'average':quality<82?'medium':quality<88?'good':quality<93?'high':quality<96?'excellent':quality<98?'exceptional':'exceptional';
 const risk=Math.min(100,flags.length*8+(/high_risk_terms|unexpected_executable|password_protected_archive/.test(flags.join('|'))?45:0));
 const keywords=Array.from(new Set(text.split(/[^a-z0-9]+/).filter(x=>x.length>2))).slice(0,30);
 const primaryKeyword=keywords[0]||category.toLowerCase();
 return {category,quality,qualityLabel,risk,flags,keywords,primaryKeyword,summary:`Deterministic inspection found ${flags.length} signal(s). Malware scan state is ${asset.scanStatus||'pending'} and is not claimed as antivirus coverage.`};
}