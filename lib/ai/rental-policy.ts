export const RENTAL_RULES={durationHours:24,requiresAdminApproval:true,autoRevokeAtExpiry:true,destructiveBuyerAction:'revoke_and_review',ownerDestructiveAction:'revoke_and_review',illegalOrAdultContent:'revoke_and_ban_review'} as const;
export function rentalExpiry(start:Date){return new Date(start.getTime()+RENTAL_RULES.durationHours*60*60*1000);}
