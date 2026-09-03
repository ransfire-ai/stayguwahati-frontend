import Link from "next/link";
import React from "react";

export default function PageShell({children}:{children:React.ReactNode}){
 return <div className="sg-shell">
  <header className="sg-header"><div className="sg-container">
   <div className="sg-header-inner">
    <Link href="/" className="sg-brand"><span className="sg-brand-mark">⌂</span><span>Stay<span style={{color:"#287b72"}}>Guwahati</span></span></Link>
    <nav className="sg-nav"><Link href="/">Home</Link><Link href="/explore">Explore</Link><Link href="/list-property">List a stay</Link><Link href="/support">Support</Link><Link href="/profile" className="active">My account</Link></nav>
   </div>
   <nav className="sg-mobile-nav"><Link href="/explore">Explore</Link><Link href="/wishlist">Saved</Link><Link href="/book-stay">Book stay</Link><Link href="/profile">Profile</Link></nav>
  </div></header>
  <main>{children}</main>
  <footer className="sg-footer"><div className="sg-container sg-footer-grid"><div><div className="sg-brand" style={{color:"white"}}>⌂ StayGuwahati</div><p>Handpicked local stays and neighbourhood experiences across Guwahati.</p></div><div><h4>Discover</h4><p><Link href="/explore">Explore stays</Link><br/><Link href="/map">Explore map</Link><br/><Link href="/wishlist">Saved stays</Link></p></div><div><h4>Hosts & help</h4><p><Link href="/list-property">List your property</Link><br/><Link href="/dashboard">Host dashboard</Link><br/><Link href="/support">Support centre</Link></p></div></div></footer>
 </div>
}