"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [signedIn, setSignedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("stayguwahati_token") ||
        localStorage.getItem("userToken");

      setSignedIn(Boolean(token));
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);
    window.addEventListener("focus", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("focus", checkAuth);
    };
  }, []);

  const accountHref = "/profile";
  const accountLabel = signedIn ? "My account" : "Sign in";

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="sg-shell">
      <header className="sg-header">
        <div className="sg-container">
          <div className="sg-header-inner">
            {/* BRAND */}
            <Link
              href="/"
              className="sg-brand"
              aria-label="StayGuwahati home"
              onClick={closeMenu}
            >
              <span className="sg-brand-mark">⌂</span>

              <span>
                Stay
                <span style={{ color: "#287b72" }}>Guwahati</span>
              </span>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <nav className="sg-nav" aria-label="Primary navigation">
              <Link href="/">Home</Link>
              <Link href="/explore">Explore</Link>
              <Link href="/support">Support</Link>
              <Link href="/refer-a-host">Refer a host</Link>

              <Link href={accountHref} className="sg-account-link">
                {accountLabel}
              </Link>
            </nav>

            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              className={`sg-menu-button ${menuOpen ? "is-open" : ""}`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
            >
              <span className="sg-menu-line" />
              <span className="sg-menu-line" />
              <span className="sg-menu-line" />
            </button>
          </div>

          {/* MOBILE QUICK ACTIONS */}
          <nav
            className="sg-mobile-nav"
            aria-label="Quick navigation"
          >
            <Link href="/explore">
              <span className="sg-mobile-nav-icon">⌕</span>
              Explore
            </Link>

            <Link href="/wishlist">
              <span className="sg-mobile-nav-icon">♡</span>
              Saved
            </Link>

            <Link href="/book-stay">
              <span className="sg-mobile-nav-icon">⌂</span>
              Book stay
            </Link>

            <Link
              href={accountHref}
              className="sg-mobile-nav-account"
            >
              <span className="sg-mobile-nav-icon">○</span>
              {signedIn ? "Account" : "Sign in"}
            </Link>
          </nav>

          {/* MOBILE MENU */}
          {menuOpen && (
            <div className="sg-mobile-menu" role="dialog" aria-label="Mobile menu">
              <div className="sg-mobile-menu-head">
                <div>
                  <span className="sg-mobile-menu-eyebrow">StayGuwahati</span>
                  <strong>Where would you like to go?</strong>
                </div>

                <button
                  type="button"
                  className="sg-mobile-menu-close"
                  aria-label="Close menu"
                  onClick={closeMenu}
                >
                  ×
                </button>
              </div>

              <div className="sg-mobile-menu-links">
                <Link href="/" onClick={closeMenu}>
                  <span className="sg-mobile-menu-symbol">⌂</span>
                  <span>
                    <strong>Home</strong>
                    <small>Return to StayGuwahati home</small>
                  </span>
                  <span className="sg-mobile-menu-arrow">→</span>
                </Link>

                <Link href="/explore" onClick={closeMenu}>
                  <span className="sg-mobile-menu-symbol">⌕</span>
                  <span>
                    <strong>Explore stays</strong>
                    <small>Find local stays in Guwahati</small>
                  </span>
                  <span className="sg-mobile-menu-arrow">→</span>
                </Link>

                <Link href="/wishlist" onClick={closeMenu}>
                  <span className="sg-mobile-menu-symbol">♡</span>
                  <span>
                    <strong>Saved stays</strong>
                    <small>View the places you saved</small>
                  </span>
                  <span className="sg-mobile-menu-arrow">→</span>
                </Link>

                <Link href="/book-stay" onClick={closeMenu}>
                  <span className="sg-mobile-menu-symbol">✓</span>
                  <span>
                    <strong>Book a stay</strong>
                    <small>Continue with your booking</small>
                  </span>
                  <span className="sg-mobile-menu-arrow">→</span>
                </Link>

                <Link href="/refer-a-host" onClick={closeMenu}>
                  <span className="sg-mobile-menu-symbol">♡</span>
                  <span>
                    <strong>Refer a host</strong>
                    <small>Help a local host join us</small>
                  </span>
                  <span className="sg-mobile-menu-arrow">→</span>
                </Link>

                <Link href="/support" onClick={closeMenu}>
                  <span className="sg-mobile-menu-symbol">?</span>
                  <span>
                    <strong>Support</strong>
                    <small>Get help from StayGuwahati</small>
                  </span>
                  <span className="sg-mobile-menu-arrow">→</span>
                </Link>
              </div>

              <Link
                href={accountHref}
                className="sg-mobile-menu-account"
                onClick={closeMenu}
              >
                <span>{signedIn ? "My account" : "Sign in"}</span>
                <span>→</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main>{children}</main>

      <footer className="sg-footer">
        <div className="sg-container sg-footer-grid">
          <div>
            <div className="sg-brand" style={{ color: "white" }}>
              ⌂ StayGuwahati
            </div>

            <p>
              Handpicked local stays and neighbourhood
              experiences across Guwahati.
            </p>
          </div>

          <div>
            <h4>Discover</h4>
            <p>
              <Link href="/explore">Explore stays</Link>
              <br />
              <Link href="/map">Explore map</Link>
              <br />
              <Link href="/wishlist">Saved stays</Link>
            </p>
          </div>

          <div>
            <h4>Hosts &amp; help</h4>
            <p>
              <Link href="/dashboard">Host dashboard</Link>
              <br />
              <Link href="/refer-a-host">Refer a host</Link>
              <br />
              <Link href="/support">Support centre</Link>
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .sg-mobile-nav {
          display: none;
        }

        .sg-menu-button {
          position: relative;
          width: 42px;
          height: 42px;
          display: none;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
          border: 1px solid #d3dfda;
          border-radius: 13px;
          background: #ffffff;
          color: #0c3431;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .sg-menu-button:hover,
        .sg-menu-button.is-open {
          background: #eaf3ef;
          border-color: #a9c7bf;
        }

        .sg-menu-line {
          width: 17px;
          height: 1.8px;
          border-radius: 99px;
          background: #0c3431;
          transition: 0.2s ease;
        }

        .sg-menu-button.is-open .sg-menu-line:nth-child(1) {
          transform: translateY(6.8px) rotate(45deg);
        }

        .sg-menu-button.is-open .sg-menu-line:nth-child(2) {
          opacity: 0;
        }

        .sg-menu-button.is-open .sg-menu-line:nth-child(3) {
          transform: translateY(-6.8px) rotate(-45deg);
        }

        .sg-mobile-menu {
          display: none;
        }

        @media (max-width: 700px) {
          .sg-header-inner {
            min-height: 70px;
            gap: 12px;
          }

          .sg-brand {
            min-width: 0;
          }

          .sg-brand-mark {
            width: 38px !important;
            height: 38px !important;
            min-width: 38px !important;
            border-radius: 12px !important;
          }

          .sg-menu-button {
            display: flex;
            flex-shrink: 0;
          }

          .sg-nav {
            display: none !important;
          }

          /*
            The old mobile navigation used very large pill buttons.
            This keeps the useful shortcuts, but makes them compact,
            calmer and closer to the desktop visual language.
          */
          .sg-mobile-nav {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 7px;
            padding: 8px 0 11px;
            border-top: 1px solid #e3e9e6;
          }

          .sg-mobile-nav a {
            min-width: 0;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            border: 1px solid #dce6e2;
            border-radius: 12px;
            background: #ffffff;
            color: #234a45;
            font-size: 10px;
            font-weight: 700;
            line-height: 1;
            text-decoration: none;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(12, 52, 49, 0.04);
          }

          .sg-mobile-nav a:active {
            transform: scale(0.98);
          }

          .sg-mobile-nav-icon {
            font-size: 14px;
            line-height: 1;
            color: #176d63;
          }

          .sg-mobile-nav-account {
            background: #0c3431 !important;
            border-color: #0c3431 !important;
            color: #ffffff !important;
          }

          .sg-mobile-nav-account .sg-mobile-nav-icon {
            color: #f2bf45;
          }

          .sg-mobile-menu {
            display: block;
            position: absolute;
            z-index: 100;
            left: 10px;
            right: 10px;
            top: 65px;
            padding: 13px;
            border: 1px solid #d4dfda;
            border-radius: 20px;
            background: #ffffff;
            box-shadow: 0 18px 45px rgba(12, 52, 49, 0.16);
          }

          .sg-mobile-menu-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 5px 5px 13px;
            border-bottom: 1px solid #e7ece9;
          }

          .sg-mobile-menu-eyebrow {
            display: block;
            margin-bottom: 3px;
            color: #287b72;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }

          .sg-mobile-menu-head strong {
            display: block;
            color: #0c3431;
            font-size: 14px;
            line-height: 1.25;
          }

          .sg-mobile-menu-close {
            width: 34px;
            height: 34px;
            flex-shrink: 0;
            border: 1px solid #d9e2df;
            border-radius: 10px;
            background: #f5f8f6;
            color: #0c3431;
            font-size: 22px;
            line-height: 1;
            cursor: pointer;
          }

          .sg-mobile-menu-links {
            display: grid;
            gap: 3px;
            padding: 7px 0;
          }

          .sg-mobile-menu-links a {
            display: grid;
            grid-template-columns: 36px minmax(0, 1fr) 18px;
            align-items: center;
            gap: 9px;
            min-height: 56px;
            padding: 7px 8px;
            border-radius: 13px;
            color: #173f3a;
            text-decoration: none;
          }

          .sg-mobile-menu-links a:hover {
            background: #f3f8f5;
          }

          .sg-mobile-menu-symbol {
            width: 36px;
            height: 36px;
            display: grid;
            place-items: center;
            border-radius: 11px;
            background: #eaf4f0;
            color: #176d63;
            font-size: 16px;
            font-weight: 700;
          }

          .sg-mobile-menu-links strong {
            display: block;
            color: #173f3a;
            font-size: 12px;
            line-height: 1.2;
          }

          .sg-mobile-menu-links small {
            display: block;
            margin-top: 3px;
            color: #7a8985;
            font-size: 9px;
            line-height: 1.25;
          }

          .sg-mobile-menu-arrow {
            color: #83a09a;
            font-size: 14px;
          }

          .sg-mobile-menu-account {
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-height: 46px;
            padding: 0 14px;
            border-radius: 12px;
            background: #0c3431;
            color: #ffffff !important;
            font-size: 11px;
            font-weight: 800;
            text-decoration: none;
          }

          .sg-footer-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 390px) {
          .sg-mobile-nav {
            gap: 5px;
          }

          .sg-mobile-nav a {
            height: 40px;
            font-size: 9px;
            gap: 3px;
          }

          .sg-mobile-nav-icon {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
