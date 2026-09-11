import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr'

export async function createServerSupabase(){
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  return createServerClient(url,key,{cookies:{get(name:string){return cookieStore.get(name)?.value},set(name:string,value:string,options:CookieOptions){try{cookieStore.set({name,value,...options})}catch{}},remove(name:string,options:CookieOptions){try{cookieStore.set({name,value:'',...options})}catch{}}}})
}
