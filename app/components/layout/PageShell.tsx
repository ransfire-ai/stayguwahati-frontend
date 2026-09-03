import Link from 'next/link';
import type { ReactNode } from 'react';

export default function PageShell({ children }: { children: ReactNode }) {
  return <div className="sg-shell">
    <header className="sg-header"><div className="sg-container sg-header-inner">
      <Link href="/" className="sg-brand">⌂ Stay<span style={{color:'var(--sg-teal)'}}>Guwahati</span></Link>
      <nav className="sg-nav"><Link href="/">Home</Link><Link href="/explore">Explore</Link><Link href="/list-property">List Property</Link><Link href="/support">Support</Link><Link href="/map" className="sg-btn sg-btn-dark">Explore Map</Link></nav>
      <Link href="/explore" className="sg-mobile-menu sg-btn sg-btn-dark">Explore</Link>
    </div></header>
    {children}
    <footer className="sg-footer"><div className="sg-container"><b>StayGuwahati</b><p style={{margin:'10px 0 0',color:'#b9cbc5'}}>Local stays. Real neighbourhoods. Guwahati.</p></div></footer>
  </div>;
}
