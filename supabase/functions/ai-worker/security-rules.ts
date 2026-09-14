export type Indicator={code:string;family:string;severity:'LOW'|'MEDIUM'|'HIGH'|'CRITICAL';label:string;explanation:string};
const r=(code:string,family:string,severity:Indicator['severity'],label:string,explanation:string):Indicator=>({code,family,severity,label,explanation});
export const INDICATORS:Indicator[]=[
 r('EXTENSION_MAGIC_MISMATCH','integrity','CRITICAL','File type mismatch','Claimed extension and detected signature disagree.'),
 r('RWX_SECTION','execution','HIGH','Writable + executable section','Can support self-modifying or injected code.'),
 r('HIGH_ENTROPY','obfuscation','MEDIUM','High entropy','Can indicate packing/encryption; never malicious by itself.'),
 r('PACKER_SIGNATURE','obfuscation','MEDIUM','Packer/cryptor indicator','Known packing/crypting signature requires deeper inspection.'),
 r('DYNAMIC_API_RESOLUTION','evasion','MEDIUM','Dynamic API resolution','Loader APIs may hide runtime capabilities.'),
 r('PROCESS_INJECTION_API','execution','CRITICAL','Process injection capability','Remote memory/thread injection indicators found.'),
 r('CREDENTIAL_ACCESS_API','credential_theft','CRITICAL','Credential access capability','Browser/OS secret access indicators found.'),
 r('KEYLOGGING_API','surveillance','CRITICAL','Input/screen surveillance capability','Keyboard, foreground-window or capture APIs found.'),
 r('C2_NETWORK_API','network','HIGH','Network/C2 capability','Outbound/download/beaconing primitives found.'),
 r('AUTORUN_SCRIPT','persistence','HIGH','Automatic execution script/macro','Auto-open or command-spawning content found.'),
 r('PDF_ACTIVE_CONTENT','document','HIGH','Active PDF content','Automatic action/script/launch feature found.'),
 r('TRACKER_FORM_GRAB','tracking','HIGH','Browser tracking/form capture','DOM form, storage or clipboard interception found.'),
 r('WEBHOOK_EXFIL','exfiltration','HIGH','Webhook/exfiltration endpoint','Known webhook/collection endpoint found.'),
 r('LOLBIN_USAGE','execution','HIGH','Living-off-the-land execution','PowerShell/WMI/mshta/regsvr32/rundll32 path found.'),
 r('RANSOMWARE_BEHAVIOR','impact','CRITICAL','Ransomware-like pattern','Bulk encryption/shadow deletion/ransom-note pattern found.'),
 r('ANTI_ANALYSIS','evasion','HIGH','Anti-analysis indicator','VM/sandbox/debugger detection pattern found.'),
 r('INVALID_SIGNATURE','integrity','MEDIUM','Missing/invalid signature','Executable provenance could not be validated.'),
 r('SUSPICIOUS_TIMESTAMP','integrity','LOW','Timestamp anomaly','Timestamp appears inconsistent or manipulated.'),
];
const P:[string,RegExp,string][]=[
 ['PROCESS_INJECTION_API',/(VirtualAllocEx|WriteProcessMemory|CreateRemoteThread|NtQueueApcThread|process hollowing)/ig,'process injection'],
 ['CREDENTIAL_ACCESS_API',/(CryptUnprotectData|VaultEnumerateItems|LSASS|Login Data|Web Credentials|browser cookies)/ig,'credential access'],
 ['KEYLOGGING_API',/(SetWindowsHookExA|SetWindowsHookExW|GetAsyncKeyState|GetKeyboardState|BitBlt|GetForegroundWindow)/ig,'surveillance'],
 ['C2_NETWORK_API',/(InternetOpenA|InternetOpenUrl|WinHttpConnect|WinHttpOpen|URLDownloadToFileA|WSAStartup|socket\s*\()/ig,'network/C2'],
 ['AUTORUN_SCRIPT',/(AutoOpen\s*\(|Workbook_Open\s*\(|Document_Open\s*\(|WScript\.Shell|Win32_Process|Shell\s*\()/ig,'auto-execution'],
 ['PDF_ACTIVE_CONTENT',/(\/JS\b|\/JavaScript\b|\/AA\b|\/OpenAction\b|\/Launch\b)/ig,'PDF active content'],
 ['TRACKER_FORM_GRAB',/(addEventListener\s*\(\s*[\'\"]submit|localStorage\b|sessionStorage\b|navigator\.clipboard|document\.cookie)/ig,'browser tracking'],
 ['WEBHOOK_EXFIL',/(discord\.com\/api\/webhooks\/|hooks\.slack\.com\/services\/|telegram\.me\/bot)/ig,'webhook exfiltration'],
 ['LOLBIN_USAGE',/(powershell(?:\.exe)?\b|wmic\b|wmi(?:\.exe)?\b|mshta(?:\.exe)?\b|regsvr32(?:\.exe)?\b|rundll32(?:\.exe)?\b)/ig,'LOLBIN'],
 ['RANSOMWARE_BEHAVIOR',/(vssadmin(?:\.exe)?\s+delete\s+shadows|delete\s+shadow|encrypt(?:ed|ing)?\s+(files|documents)|ransom note)/ig,'ransomware'],
 ['ANTI_ANALYSIS',/(IsDebuggerPresent|CheckRemoteDebuggerPresent|VMware|VirtualBox|sandbox|GetTickCount\s*\(\).*sleep)/ig,'anti-analysis'],
 ['PACKER_SIGNATURE',/(UPX0|UPX1|UPX2|Themida|VMProtect|ASPack|FSG|MEW\b|\.packed\b)/ig,'packer'],
 ['DYNAMIC_API_RESOLUTION',/(LoadLibraryA|LoadLibraryW|GetProcAddress)/ig,'dynamic API resolution']
];
export function normalizeText(text:string){return text.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim()}
export function tokens(text:string){return [...new Set(normalizeText(text).split(' ').filter(x=>x.length>=3))]}
export function contentScores(title:string,description:string){const words=tokens(`${title} ${description}`);const completeness=Math.min(100,Math.round(description.trim().length/8));const specificity=Math.min(100,Math.round(new Set(words).size/0.6));const spam=/(buy now!!!|guaranteed money|free money|click here|100% free|limited time!!!)/i.test(`${title} ${description}`)?25:0;return {contentScore:Math.max(0,Math.min(100,Math.round(completeness*.55+specificity*.45-spam))),wordCount:words.length,spamPenalty:spam}}
export function inspect(input:{name?:string;extension?:string;mime?:string;magic?:string;entropy?:number;sectionEntropies?:number[];sections?:Array<{characteristics?:string;entropy?:number}>;imports?:string[];exports?:string[];strings?:string[];metadata?:Record<string,unknown>}){const blob=[input.name,input.extension,input.mime,input.magic,...(input.imports??[]),...(input.exports??[]),...(input.strings??[])].filter(Boolean).join('\n');const found:Indicator[]=[];const evidence:Record<string,unknown>={};const add=(c:string,n?:string)=>{const i=INDICATORS.find(x=>x.code===c);if(i&&!found.some(x=>x.code===c)){found.push(i);if(n)evidence[c]=n}};if(input.extension&&input.magic&&/\.(exe|dll|sys)$/i.test(input.extension)&&!/^(MZ|4d5a)/i.test(input.magic))add('EXTENSION_MAGIC_MISMATCH');if(typeof input.entropy==='number'&&input.entropy>7.2)add('HIGH_ENTROPY',`overall=${input.entropy}`);if((input.sectionEntropies??[]).some(x=>x>7.5)||(input.sections??[]).some(x=>typeof x.entropy==='number'&&x.entropy>7.5))add('HIGH_ENTROPY','section>7.5');for(const s of input.sections??[])if(/RWX|EXECUTE.*WRITE|WRITE.*EXECUTE/i.test(String(s.characteristics??'')))add('RWX_SECTION');for(const [c,rx,n] of P)if(rx.test(blob))add(c,n);if((input.metadata as any)?.signature_valid===false)add('INVALID_SIGNATURE');if((input.metadata as any)?.timestamp_anomaly===true)add('SUSPICIOUS_TIMESTAMP');const cr=found.filter(x=>x.severity==='CRITICAL').length,hi=found.filter(x=>x.severity==='HIGH').length,me=found.filter(x=>x.severity==='MEDIUM').length,lo=found.filter(x=>x.severity==='LOW').length;const score=Math.min(100,cr*34+hi*18+me*8+lo*2);const level=cr?'CRITICAL':hi>=2||score>=70?'HIGH':me||score>=30?'MEDIUM':lo?'LOW':'INFO';const verdict=cr||score>=80?'REJECTED':score>=35?'REVIEW':'APPROVED';return {indicators:found,evidence,threatScore:score,threatLevel:level,verdict}}
