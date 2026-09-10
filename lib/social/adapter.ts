export type SocialAccessResult={status:'CONFIGURED'|'NOT_CONFIGURED'|'ERROR';message:string;externalId?:string};
export interface SocialPlatformAdapter{platform:string;connect(input:{authorizationCode:string,redirectUri:string}):Promise<SocialAccessResult>;grantManagerAccess(input:{accountId:string,userId:string,expiresAt:string}):Promise<SocialAccessResult>;revokeManagerAccess(input:{externalAccessId:string}):Promise<SocialAccessResult>;}

export const notConfiguredAdapter=(platform:string):SocialPlatformAdapter=>({
 platform,
 async connect(){return{status:'NOT_CONFIGURED',message:`${platform} official API/OAuth credentials are not configured.`}},
 async grantManagerAccess(){return{status:'NOT_CONFIGURED',message:`${platform} delegated manager access requires official API credentials.`}},
 async revokeManagerAccess(){return{status:'NOT_CONFIGURED',message:`${platform} delegated manager access integration is not configured.`}},
});
