import './globals.css'
import Link from 'next/link'

export default function Layout({children}:{children:React.ReactNode}){return <><header className="nav"><div className="navin"><Link className="brand" href="/">Digital Salvage</Link><nav className="links"><Link href="/marketplace">Marketplace</Link><Link href="/seller">Sell</Link><Link href="/how-it-works">How it works</Link></nav><div className="spacer"/><div className="links"><Link href="/login">Login</Link><Link className="button primary" href="/register">Sign up</Link></div></div></header>{children}<footer className="footer"><div className="container">© 2026 Digital Salvage · Legal digital goods only.</div></footer></>}
