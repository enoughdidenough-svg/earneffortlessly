import type {Config} from '@netlify/functions'

export default async () => {
  const url = Netlify.env.get('SUPABASE_URL')
  const key = Netlify.env.get('SUPABASE_PUBLISHABLE_KEY')
  if (!url || !key) return new Response(JSON.stringify({ok:false,reason:'AI heartbeat is not configured yet'}),{status:503,headers:{'content-type':'application/json'}})
  const response = await fetch(`${url}/functions/v1/ai-worker`,{method:'POST',headers:{Authorization:`Bearer ${key}`,apikey:key,'content-type':'application/json'},body:'{}'})
  const body = await response.text()
  return new Response(body,{status:response.status,headers:{'content-type':response.headers.get('content-type')||'application/json'}})
}

export const config:Config={schedule:'* * * * *'}
