'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

type Connection = { id:string; platform:string; account_id:string; page_id:string|null; access_scope:string|null; status:string; metadata:Record<string, unknown>|null; created_at:string; updated_at:string };
type AdConnection = { id:string; platform:string; account_label:string; page_id:string|null; status:string; metadata:Record<string, unknown>|null; created_at:string; updated_at:string };

export default function SocialConnectionsPanel({connections,adConnections}:{connections:Connection[];adConnections:AdConnection[]}) {
  const [busy,setBusy]=useState<string|null>(null);
  const [message,setMessage]=useState('');
  const supabase=createClient();

  async function connect(functionName:string,label:string){
    setBusy(label); setMessage('');
    const {data,error}=await supabase.functions.invoke(functionName,{body:{}});
    if(error||!data?.authorization_url){ setMessage(error?.message||data?.error||`${label} is not configured yet.`); setBusy(null); return; }
    window.location.assign(data.authorization_url);
  }

  return <div className='grid'>
    <section className='card soft'>
      <div className='eyebrow'>OWNER CONNECTIONS</div>
      <h2>Facebook</h2>
      <p className='muted'>Separate owner-side OAuth connection for the Facebook properties the advertising engine is allowed to use.</p>
      <button className='button' disabled={busy!==null} onClick={()=>connect('facebook-oauth-start','Facebook')}>{busy==='Facebook'?'Opening Facebook…':'Connect Facebook'}</button>
      {connections.filter(c=>c.platform==='facebook').map(c=><div className='notice' key={c.id}><b>{String(c.metadata?.public_name||'Facebook account')}</b><br/><small>Status: {c.status} · Scopes: {c.access_scope||'—'}</small></div>)}
    </section>
    <section className='card soft'>
      <div className='eyebrow'>OWNER CONNECTIONS</div>
      <h2>YouTube</h2>
      <p className='muted'>Connect the YouTube/Google account through official OAuth for authorized channel operations.</p>
      <button className='button' disabled={busy!==null} onClick={()=>connect('youtube-oauth-start','YouTube')}>{busy==='YouTube'?'Opening Google…':'Connect YouTube'}</button>
      {connections.filter(c=>c.platform==='youtube').map(c=><div className='notice' key={c.id}><b>YouTube / Google account</b><br/><small>Status: {c.status} · Scopes: {c.access_scope||'—'}</small></div>)}
    </section>
    <section className='card soft wide'>
      <div className='eyebrow'>ADVERTISING CONTROL</div>
      <h2>Facebook advertising properties</h2>
      <p className='muted'>Advertising stays disabled until a real Facebook OAuth connection exists and the required Meta permissions are granted. The AI must use only explicitly connected properties.</p>
      {adConnections.length===0?<div className='notice'>No advertising property is connected yet.</div>:adConnections.map(c=><div className='row' key={c.id}><div><b>{c.account_label}</b><small>{c.platform} · Page {c.page_id||'not selected'}</small></div><span>{c.status}</span></div>)}
      <div className='notice'>AI advertising safety controls: permission check, cooldown, duplicate detection, rate limits, audit log and master kill switch.</div>
    </section>
    {message&&<p className='error'>{message}</p>}
  </div>;
}
