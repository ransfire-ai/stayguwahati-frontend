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

  const accountHref = signedIn ? "/profile" : "/login";
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
              <span className="sg-brand-mark" aria-hidden="true">
                <img
                  src="/favicon.ico"
                  alt=""
                  width={38}
                  height={38}
                />
              </span>

              <span className="sg-brand-name">
                Stay<span>Guwahati</span>
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

          {/* MOBILE MENU */}
          {menuOpen && (
            <>
              <button
                className="sg-mobile-overlay"
                type="button"
                aria-label="Close menu"
                onClick={closeMenu}
              />

              <div
                className="sg-mobile-menu"
                role="dialog"
                aria-label="StayGuwahati mobile menu"
              >
                <div className="sg-mobile-menu-head">
                  <div>
                    <span className="sg-mobile-menu-eyebrow">
                      StayGuwahati
                    </span>
                    <strong>Explore StayGuwahati</strong>
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
                    <span className="sg-mobile-menu-copy">
                      <strong>Home</strong>
                      <small>Return to StayGuwahati home</small>
                    </span>
                    <span className="sg-mobile-menu-arrow">→</span>
                  </Link>

                  <Link href="/refer-a-host" onClick={closeMenu}>
                    <span className="sg-mobile-menu-symbol">♡</span>
                    <span className="sg-mobile-menu-copy">
                      <strong>Refer a host</strong>
                      <small>Help a local host join us</small>
                    </span>
                    <span className="sg-mobile-menu-arrow">→</span>
                  </Link>

                  <Link href="/support" onClick={closeMenu}>
                    <span className="sg-mobile-menu-symbol">?</span>
                    <span className="sg-mobile-menu-copy">
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
                  <span>{accountLabel}</span>
                  <span>→</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="sg-main">{children}</main>

      <footer className="sg-footer">
        <div className="sg-container sg-footer-grid">
          <div className="sg-footer-brand">
            <Link href="/" className="sg-footer-logo">
              <span className="sg-footer-mark">⌂</span>
              <span>
                Stay<span>Guwahati</span>
              </span>
            </Link>

            <p>
              Handpicked local stays and neighbourhood experiences across
              Guwahati.
            </p>
          </div>

          <div>
            <h4>Discover</h4>
            <p>
              <Link href="/explore">Explore stays</Link>
              <br />
              <Link href="/map">Explore map</Link>
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
        .sg-shell {
          min-height: 100vh;
          background: #f7f5ef;
          color: #0c3431;
        }

        .sg-container {
          width: min(1280px, calc(100% - 48px));
          margin: 0 auto;
        }

        .sg-header {
          position: relative;
          z-index: 200;
          background: #f7f5ef;
          border-bottom: 1px solid #d9e2de;
        }

        .sg-header-inner {
          min-height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .sg-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-width: 190px;
          color: #0c3431;
          text-decoration: none;
        }

        .sg-brand-mark {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 12px;
          background: #0c4a45;
          box-shadow: 0 5px 14px rgba(12, 52, 49, 0.13);
        }

        .sg-brand-mark img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sg-brand-name {
          font-size: 17px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.045em;
          white-space: nowrap;
        }

        .sg-brand-name span {
          color: #287b72;
        }

        .sg-nav {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 28px;
        }

        .sg-nav a {
          color: #173f3a;
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          transition: color 0.18s ease;
        }

        .sg-nav a:hover {
          color: #287b72;
        }

        .sg-account-link {
          min-width: 104px;
          padding: 10px 15px;
          border-radius: 11px;
          background: #0c4a45;
          color: #ffffff !important;
          text-align: center;
          box-shadow: 0 5px 14px rgba(12, 52, 49, 0.12);
        }

        .sg-account-link:hover {
          background: #0a3e3a;
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
          flex-shrink: 0;
          border: 1px solid #c9d9d4;
          border-radius: 13px;
          background: #ffffff;
          color: #0c3431;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .sg-menu-button:hover,
        .sg-menu-button.is-open {
          background: #eaf3ef;
          border-color: #9fc3ba;
        }

        .sg-menu-line {
          width: 17px;
          height: 1.8px;
          border-radius: 99px;
          background: #0c3431;
          transition: transform 0.2s ease, opacity 0.2s ease;
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

        .sg-mobile-overlay {
          display: none;
        }

        .sg-mobile-menu {
          display: none;
        }

        .sg-main {
          min-height: 60vh;
        }

        .sg-footer {
          margin-top: 64px;
          padding: 48px 0;
          background: #0c3431;
          color: #dce9e5;
        }

        .sg-footer-grid {
          display: grid;
          grid-template-columns: 1.7fr 1fr 1fr;
          gap: 48px;
        }

        .sg-footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #ffffff;
          text-decoration: none;
          font-size: 17px;
          font-weight: 900;
        }

        .sg-footer-logo > span:last-child span {
          color: #6fc0b5;
        }

        .sg-footer-mark {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 9px;
          font-size: 17px;
        }

        .sg-footer p {
          margin: 13px 0 0;
          max-width: 390px;
          color: #b9d0ca;
          font-size: 12px;
          line-height: 1.7;
        }

        .sg-footer h4 {
          margin: 0 0 12px;
          color: #ffffff;
          font-size: 12px;
          letter-spacing: 0.03em;
        }

        .sg-footer a {
          color: #b9d0ca;
          text-decoration: none;
          line-height: 2.1;
          font-size: 12px;
        }

        .sg-footer a:hover {
          color: #ffffff;
        }

        @media (max-width: 800px) {
          .sg-container {
            width: min(100% - 32px, 680px);
          }

          .sg-header-inner {
            min-height: 68px;
            gap: 12px;
          }

          .sg-brand {
            min-width: 0;
          }

          .sg-brand-mark {
            width: 38px;
            height: 38px;
            flex-basis: 38px;
            border-radius: 12px;
          }

          .sg-brand-name {
            font-size: 16px;
          }

          .sg-nav {
            display: none;
          }

          .sg-menu-button {
            display: flex;
          }

          .sg-mobile-overlay {
            display: block;
            position: fixed;
            z-index: 299;
            inset: 68px 0 0;
            width: 100%;
            height: calc(100vh - 68px);
            border: 0;
            padding: 0;
            background: rgba(12, 52, 49, 0.12);
            cursor: pointer;
          }

          .sg-mobile-menu {
            display: block;
            position: absolute;
            z-index: 300;
            top: 76px;
            left: 0;
            right: 0;
            width: min(100%, 620px);
            margin: 0 auto;
            padding: 15px;
            border: 1px solid #d4dfda;
            border-radius: 22px;
            background: #ffffff;
            box-shadow: 0 22px 55px rgba(12, 52, 49, 0.18);
          }

          .sg-mobile-menu-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 5px 5px 14px;
            border-bottom: 1px solid #e7ece9;
          }

          .sg-mobile-menu-eyebrow {
            display: block;
            margin-bottom: 4px;
            color: #287b72;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 0.17em;
            text-transform: uppercase;
          }

          .sg-mobile-menu-head strong {
            display: block;
            color: #0c3431;
            font-size: 15px;
            line-height: 1.25;
          }

          .sg-mobile-menu-close {
            width: 36px;
            height: 36px;
            display: grid;
            place-items: center;
            flex-shrink: 0;
            border: 1px solid #d6e1dd;
            border-radius: 11px;
            background: #f4f8f6;
            color: #0c3431;
            font-size: 23px;
            line-height: 1;
            cursor: pointer;
          }

          .sg-mobile-menu-links {
            display: grid;
            gap: 4px;
            padding: 8px 0;
          }

          .sg-mobile-menu-links a {
            display: grid;
            grid-template-columns: 40px minmax(0, 1fr) 20px;
            align-items: center;
            gap: 10px;
            min-height: 61px;
            padding: 7px 9px;
            border-radius: 14px;
            color: #173f3a;
            text-decoration: none;
          }

          .sg-mobile-menu-links a:hover,
          .sg-mobile-menu-links a:active {
            background: #f2f8f5;
          }

          .sg-mobile-menu-symbol {
            width: 40px;
            height: 40px;
            display: grid;
            place-items: center;
            border-radius: 12px;
            background: #eaf4f0;
            color: #176d63;
            font-size: 18px;
            font-weight: 700;
          }

          .sg-mobile-menu-copy {
            min-width: 0;
          }

          .sg-mobile-menu-links strong {
            display: block;
            color: #173f3a;
            font-size: 13px;
            line-height: 1.2;
          }

          .sg-mobile-menu-links small {
            display: block;
            margin-top: 4px;
            color: #7a8985;
            font-size: 10px;
            line-height: 1.25;
          }

          .sg-mobile-menu-arrow {
            color: #83a09a;
            font-size: 16px;
            text-align: right;
          }

          .sg-mobile-menu-account {
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-height: 48px;
            padding: 0 15px;
            border-radius: 13px;
            background: #0c4a45;
            color: #ffffff !important;
            font-size: 12px;
            font-weight: 800;
            text-decoration: none;
          }

          .sg-footer {
            margin-top: 40px;
            padding: 38px 0;
          }

          .sg-footer-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
        }

        @media (max-width: 390px) {
          .sg-container {
            width: calc(100% - 24px);
          }

          .sg-brand-name {
            font-size: 15px;
          }

          .sg-mobile-menu {
            border-radius: 19px;
          }
        }
      `}</style>
    </div>
  );
}
