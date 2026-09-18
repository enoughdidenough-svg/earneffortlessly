import { createServerAdminSupabase } from '@/lib/supabase-server';

export type PersistentMemory={
  userId?:string|null;
  scope:'system'|'user'|'seller'|'buyer'|'product'|'decision'|'upgrade';
  memoryType:string;
  title:string;
  content:string;
  memoryKey?:string|null;
  importance?:number;
  confidence?:number;
  sourceRef?:string|null;
  tags?:string[];
  sensitivity?:'normal'|'private'|'restricted';
  expiresAt?:string|null;
};

export async function savePersistentMemory(input:PersistentMemory){
  const db=await createServerAdminSupabase();
  const {data,error}=await db.from('ai_memory').insert({
    user_id:input.userId??null,
    scope:input.scope,
    memory_type:input.memoryType,
    title:input.title,
    content:input.content,
    memory_key:input.memoryKey??null,
    importance:input.importance??0.5,
    confidence:input.confidence??0.8,
    source_ref:input.sourceRef??null,
    tags:input.tags??[],
    sensitivity:input.sensitivity??'normal',
    expires_at:input.expiresAt??null,
    active:true
  }).select('id').single();
  if(error) throw error;
  return data.id;
}

export async function getRelevantUserMemories(userId:string,limit=20){
  const db=await createServerAdminSupabase();
  const {data,error}=await db.from('ai_memory')
    .select('id,scope,memory_type,title,content,memory_key,importance,confidence,tags,created_at,updated_at')
    .eq('user_id',userId).eq('active',true)
    .order('importance',{ascending:false})
    .order('updated_at',{ascending:false}).limit(limit);
  if(error) throw error;
  return data??[];
}
