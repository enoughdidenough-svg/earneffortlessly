import Link from 'next/link'

const categories = ['Graphics','Game Assets','Templates','UI Kits','Fonts','3D Assets','Audio','Video','Code','Education','Productivity','Social Assets']

export default function Home() {
  return <main>
    <section className="hero shell">
      <div className="eyebrow">DIGITAL SALVAGE MARKETPLACE</div>
      <h1>Useful digital work,<br/><span>carefully checked.</span></h1>
      <p className="lead">Discover creator-made digital resources. Sellers explain, submit and get reviewed. Buyers search, inspect and purchase with clear access and licensing.</p>
      <div className="hero-actions"><Link className="button primary" href="/marketplace">Explore marketplace</Link><Link className="button" href="/seller/submit">Submit a resource</Link></div>
      <div className="trust-row"><span>Private asset storage</span><span>Admin-reviewed publishing</span><span>Protected delivery</span></div>
    </section>
    <section className="shell section"><div className="section-head"><div><div className="eyebrow">DISCOVER</div><h2>Start with what you need</h2></div><Link href="/marketplace">View all →</Link></div><div className="category-grid">{categories.map((c,i)=><Link className="category" href={`/marketplace?category=${encodeURIComponent(c)}`} key={c}><b>{String(i+1).padStart(2,'0')}</b><strong>{c}</strong><span>Explore resources</span></Link>)}</div></section>
    <section className="dark-section"><div className="shell split"><div><div className="eyebrow">HOW IT WORKS</div><h2>Simple for people.<br/>Serious underneath.</h2></div><div className="steps"><div><b>01</b><span>Explain</span><p>Tell us what you made in plain language.</p></div><div><b>02</b><span>Check</span><p>Automated inspection builds a report; suspicious items stay private.</p></div><div><b>03</b><span>Review</span><p>Admin approval is required before publishing.</p></div><div><b>04</b><span>Sell</span><p>Approved products can be discovered, purchased and delivered securely.</p></div></div></div></section>
    <section className="shell section"><div className="callout"><div><div className="eyebrow">BUILT FOR TRUST</div><h2>No fake buttons. No hidden publishing.</h2><p>Every important action is designed around persistent server state, audit trails, permissions and honest integration status.</p></div><Link className="button primary" href="/how-it-works">How it works</Link></div></section>
  </main>
}
