import Link from 'next/link'

const features = [
  ['01','Describe','Tell the system what you want to sell in your own words.'],
  ['02','Prepare','The submission assistant explains exactly what to provide, with an all-items fallback.'],
  ['03','Inspect','Automated checks queue the content for safety, quality, completeness and duplication review.'],
  ['04','Approve','You receive the short report and decide the final price, royalty and publication.'],
]

export default function Home(){
 return <main className="shell">
  <nav className="nav"><div className="brand">DIGITAL <span>SALVAGE</span></div><div className="navlinks"><Link href="/marketplace">Browse</Link><Link href="/login">Sign in</Link><Link className="pill" href="/register">Join</Link></div></nav>
  <section className="hero"><div className="eyebrow">SELLER-FIRST • CLOUD • SAFETY GATED</div><h1>Turn unused digital work into a <em>real listing.</em></h1><p>Describe it. Submit it. Our inspection pipeline organizes the details, checks the submission, and prepares a simple report for approval.</p><div className="actions"><Link className="primary" href="/seller/submit">Start a submission →</Link><Link className="secondary" href="/how-it-works">How it works</Link></div></section>
  <section className="steps">{features.map(([n,t,d])=><article key={n}><small>{n}</small><h3>{t}</h3><p>{d}</p></article>)}</section>
  <section className="notice"><div><strong>Nothing goes public automatically.</strong><span>Automated inspection prepares evidence; the admin approval gate controls publication and final pricing.</span></div><Link href="/seller/submit">Submit content</Link></section>
  <footer>Digital Salvage · lawful digital goods only · privacy · terms · seller rules</footer>
 </main>
}