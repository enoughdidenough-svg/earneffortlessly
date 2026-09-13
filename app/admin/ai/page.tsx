'use client';
import AIAssistant from '@/components/ai-assistant';
import { useState } from 'react';

export default function AIControl(){
 const [cmd,setCmd]=useState('');
 const [result,setResult]=useState('');
 const [busy,setBusy]=useState(false);
 async function run(){
  if(!cmd.trim())return;
  setBusy(true);setResult('');
  try{
   const r=await fetch('/api/admin/ai/command',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({command:cmd.trim()})});
   const j=await r.json().catch(()=>({}));
   setResult(r.ok?JSON.stringify(j,null,2):j.error||'The AI could not complete that request.');
  }catch{setResult('The AI connection failed. Please try again.');}
  finally{setBusy(false)}
 }
 return <main className='container'>
   <div className='ai-hero card'>
    <div><div className='eyebrow'>AUTONOMOUS AI</div><h1>Your AI operations assistant</h1><p className='muted'>You do not need to understand code. Describe the result you want in ordinary language.</p></div>
    <div className='ai-status'><span className='ai-pulse'/> Always-on architecture</div>
   </div>
   <AIAssistant/>
   <section className='card wide ai-help'>
    <div className='eyebrow'>HOW IT WORKS</div><h2>Simple for you, careful behind the scenes</h2>
    <div className='ai-flow'><div><b>1</b><strong>Tell</strong><span>Say what you want changed or checked.</span></div><div><b>2</b><strong>Inspect</strong><span>AI checks the relevant system state and history.</span></div><div><b>3</b><strong>Act</strong><span>Safe, reversible maintenance can run automatically.</span></div><div><b>4</b><strong>Verify</strong><span>Diagnostics run after a change and the result is recorded.</span></div></div>
    <div className='notice'>Financial, ownership, permissions, destructive and production-release actions remain protected instead of being silently changed.</div>
   </section>
   <section className='card wide'>
    <div className='eyebrow'>ADVANCED COMMAND</div><h2>Direct command</h2><p className='muted'>For precise requests. Normal language is supported.</p>
    <textarea className='input ai-input' rows={5} value={cmd} onChange={e=>setCmd(e.target.value)} placeholder='Example: Check the marketplace and fix any safe problems you find.'/>
    <div className='ai-actions'><button className='primary' disabled={busy||!cmd.trim()} onClick={run}>{busy?'Working…':'Run command'}</button><span className='muted'>No coding required.</span></div>
    {result&&<pre className='ai-console'>{result}</pre>}
   </section>
 </main>
}
