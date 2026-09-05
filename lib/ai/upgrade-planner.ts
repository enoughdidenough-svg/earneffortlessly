export type UpgradeRequest={instruction:string;attachments?:{name:string;type:string}[]};
export type UpgradePlan={summary:string;steps:string[];requiresApproval:true;rollbackSupported:true;diagnosticsEnabled:true};

export function planUpgrade(request:UpgradeRequest):UpgradePlan{
 const summary=request.instruction.trim().replace(/\s+/g,' ').slice(0,1000);
 return {summary,steps:['capture request and attachments','store versioned specification','create isolated preview build','run automated checks','collect preview feedback','wait for admin approval','publish approved version','retain previous version for rollback','run post-release diagnostics'],requiresApproval:true,rollbackSupported:true,diagnosticsEnabled:true};
}
