import {NextResponse} from 'next/server'
import {createServerSupabase} from '@/lib/supabase'

function classify(text:string){
 const t=text.toLowerCase();
 const rules:[string,string[]][]=[['code',['code','script','javascript','python','typescript','source']],['design',['design','ui','logo','graphic','illustration']],['video',['video','movie','reel','footage']],['audio',['audio','sound','voice','podcast']],['3d-assets',['3d','model','blender','mesh']],['game-assets',['game asset','sprite','texture','unity','unreal']],['education',['course','lesson','worksheet','tutorial']],['templates',['template','notion','figma','canva']],['documents',['document','pdf','ebook','guide']],['data',['dataset','csv','json','data']]]
 for(const [slug,words] of rules) if(words.some(w=>t.includes(w))) return slug
 return 'other'
}
function requirements(category:string){
 const map:Record<string,string[]>= {code:['source files','README/instructions','license/ownership note'],design:['preview image','source/editable files','license/ownership note'],video:['preview/sample','original media file','license/ownership note'],audio:['audio sample','original audio file','license/ownership note'], '3d-assets':['preview renders','3D source/export files','license/ownership note'],'game-assets':['preview images/video','asset package','engine/version details','license/ownership note'],education:['sample pages','complete material','license/ownership note'],templates:['preview','editable template file','license/ownership note'],documents:['preview/pages','complete document','license/ownership note'],data:['sample rows','dataset file','schema/description','license/ownership note'],other:['best preview','main content file(s)','instructions','license/ownership note']}; return map[category]||map.other
}
export async function POST(req:Request){
 const supabase=await createServerSupabase(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:'Please sign in first.'},{status:401});
 const body=await req.json(); const title=String(body.title||'').trim(); const description=String(body.description||'').trim(); if(title.length<3||description.length<10)return NextResponse.json({error:'Please give a title and a little more detail.'},{status:400});
 const category=classify(title+' '+description); const required=requirements(category);
 const {data:submission,error}=await supabase.from('seller_submissions').insert({seller_id:user.id,title,seller_description:description,required_submission:{category,items:required},secondary_submission:{mode:'submit_everything',note:'Seller may provide all relevant files, text, images, audio or other evidence.'},status:'submitted',ai_state:'queued'}).select('id').single();
 if(error)return NextResponse.json({error:error.message},{status:500});
 await supabase.from('ai_tasks').insert({task_type:'submission_inspection',target_type:'seller_submission',target_id:submission.id,priority:10,input:{title,description,category,required}});
 return NextResponse.json({ok:true,id:submission.id,category,required});
}