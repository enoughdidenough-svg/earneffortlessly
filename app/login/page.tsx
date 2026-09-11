'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [nextPath,setNextPath]=useState('/buyer');
  const router=useRouter();

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get('next');
    if (next && next.startsWith('/') && !next.startsWith('//')) setNextPath(next);
  }, []);

  async function submit(e:React.FormEvent){e.preventDefault();setError('');setBusy(true);const{error}=await createClient().auth.signInWithPassword({email,password});setBusy(false);if(error)setError(error.message);else router.push(nextPath);}
  return <main className="container"><div className="card" style={{maxWidth:520,margin:'50px auto'}}><h1>Welcome back</h1><p className="muted">Sign in to your Digital Salvage account.</p><form onSubmit={submit}><label className="label">Email</label><input className="input" autoComplete="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/><label className="label">Password</label><input className="input" autoComplete="current-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/><button className="btn" disabled={busy} style={{marginTop:18}}>{busy?'Signing in…':'Login'}</button></form>{error&&<p className="error" role="alert">{error}</p>}<p className="muted" style={{marginTop:18}}>New here? <Link href="/register">Create an account</Link></p></div></main>
}
