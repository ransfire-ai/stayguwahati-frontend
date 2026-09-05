 "use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function PageShell({children}:{children:React.ReactNode}){
  const [signedIn, setSignedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("stayguwahati_token") ||
        localStorage.getItem("userToken");
      setSignedIn(!!token);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("focus", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("focus", checkAuth);
    };
  }, []);

  const accountHref = signedIn ? "/profile" : "/login";
  const accountLabel = signedIn ? "My account" : "Sign in";

  return (
    <div className="sg-shell">
      <header className="sg-header">
        <div className="sg-container">
          <div className="sg-header-inner">
            <Link href="/" className="sg-brand" aria-label="StayGuwahati home">
              <span className="sg-brand-mark">⌂</span>
              <span>Stay<span style={{color:"#287b72"}}>Guwahati</span></span>
            </Link>

            <nav className="sg-nav" aria-label="Primary navigation">
              <Link href="/">Home</Link>
              <Link href="/explore">Explore</Link>
              <Link href="/list-property">List a stay</Link>
              <Link href="/support">Support</Link>
              <Link href={accountHref} className="sg-account-link">{accountLabel}</Link>
            </nav>

            <button
              type="button"
              className="sg-menu-button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>
          </div>

          {menuOpen && (
            <div className="sg-mobile-menu">
              <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href="/explore" onClick={() => setMenuOpen(false)}>Explore</Link>
              <Link href="/wishlist" onClick={() => setMenuOpen(false)}>Saved stays</Link>
              <Link href="/book-stay" onClick={() => setMenuOpen(false)}>Book a stay</Link>
              <Link href="/list-property" onClick={() => setMenuOpen(false)}>List a stay</Link>
              <Link href="/support" onClick={() => setMenuOpen(false)}>Support</Link>
              <Link href={accountHref} className="sg-mobile-account" onClick={() => setMenuOpen(false)}>
                {accountLabel}
              </Link>
            </div>
          )}

          <nav className="sg-mobile-nav" aria-label="Mobile navigation">
            <Link href="/explore">Explore</Link>
            <Link href="/wishlist">Saved</Link>
            <Link href="/book-stay">Book stay</Link>
            <Link href={accountHref}>{signedIn ? "Account" : "Sign in"}</Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="sg-footer">
        <div className="sg-container sg-footer-grid">
          <div>
            <div className="sg-brand" style={{color:"white"}}>⌂ StayGuwahati</div>
            <p>Handpicked local stays and neighbourhood experiences across Guwahati.</p>
          </div>
          <div>
            <h4>Discover</h4>
            <p>
              <Link href="/explore">Explore stays</Link><br/>
              <Link href="/map">Explore map</Link><br/>
              <Link href="/wishlist">Saved stays</Link>
            </p>
          </div>
          <div>
            <h4>Hosts & help</h4>
            <p>
              <Link href="/list-property">List your property</Link><br/>
              <Link href="/dashboard">Host dashboard</Link><br/>
              <Link href="/support">Support centre</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
