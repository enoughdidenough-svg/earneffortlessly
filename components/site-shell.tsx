'use client'
import Link from 'next/link'
import {useState} from 'react'

export default function SiteShell({children}:{children:React.ReactNode}){
  const [q,setQ]=useState('')
  function submit(e:React.FormEvent){e.preventDefault();const value=q.trim();if(value)window.location.href=`/search?q=${encodeURIComponent(value)}`}
  return <>
    <header className="nav"><div className="navin">
      <Link className="brand" href="/">Digital Salvage</Link>
      <nav className="links"><Link href="/marketplace">Marketplace</Link><Link href="/seller">Sell</Link><Link href="/how-it-works">How it works</Link><Link href="/trust">Trust</Link></nav>
      <form className="global-search" onSubmit={submit}><input aria-label="Search marketplace" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)}/></form>
      <div className="spacer"/>
      <div className="links"><Link href="/login">Login</Link><Link className="button primary" href="/register">Sign up</Link></div>
    </div></header>{children}<footer className="footer"><div className="container">© 2026 Digital Salvage · Legal digital goods only · <Link href="/trust">Trust & system status</Link></div></footer>
  </>
}
