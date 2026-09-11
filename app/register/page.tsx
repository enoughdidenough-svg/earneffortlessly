'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register(){
 const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const router=useRouter();
 async function submit(e:React.FormEvent){e.preventDefault();setError('');setMessage('');setBusy(true);const{data,error}=await createClient().auth.signUp({email,password});setBusy(false);if(error){setError(error.message);return}if(data.session) router.push('/buyer');else setMessage('Account created. Sign in to continue.');}
 return <main className="container"><div className="card" style={{maxWidth:520,margin:'50px auto'}}><div className="eyebrow">WELCOME</div><h1>Create your account</h1><p className="muted">Start browsing or build your seller inventory.</p><form onSubmit={submit}><label className="label">Email</label><input className="input" autoComplete="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/><label className="label">Password</label><input className="input" autoComplete="new-password" type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/><button className="btn" disabled={busy} style={{marginTop:18}}>{busy?'Creating…':'Create account'}</button></form>{error&&<p className="error" role="alert">{error}</p>}{message&&<p className="notice" role="status">{message}</p>}<p className="muted" style={{marginTop:18}}>Already have an account? <Link href="/login">Login</Link></p></div></main>
}
