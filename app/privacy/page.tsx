'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';

const sections = [
  {
    title: '1. Introduction',
    body: `Welcome to StayGuwahati. We are committed to protecting your personal information and your right to privacy. This Privacy Policy applies to all information collected through our website and any related services, sales, or events.`,
  },
  {
    title: '2. Information We Collect',
    body: `We collect personal information that you voluntarily provide to us when you register on the website or interact with our services.`,
    bullets: [
      ['Personal Data', 'Name, email address, and phone number.'],
      ['Authentication Data', 'Credentials to manage your session security.'],
      ['Usage Data', 'IP address, browser type, and interaction metrics.'],
    ],
  },
  {
    title: '3. How We Use Your Information',
    body: `We use the data we collect to facilitate account creation, provide our booking services, improve website performance, and send necessary administrative notifications.`,
  },
  {
    title: '4. Data Security',
    body: `We implement technical and organizational measures, such as SSL/TLS encryption and access controls, to protect your data. Please note that no method of transmission over the internet is 100% secure.`,
  },
  {
    title: '5. Third-Party Sharing',
    body: `We do not sell your personal information. We may share data only with essential service providers (such as hosting) or where legally required to comply with applicable laws.`,
  },
  {
    title: '6. Your Rights',
    body: `Depending on your location, you may have the right to access, rectify, or request the deletion of your personal data. To exercise these rights, please contact us.`,
  },
  {
    title: '7. Contact Us',
    body: `If you have questions about this policy, please contact the StayGuwahati Team at the email address provided in your registration or support portal.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#173f3a] antialiased">
      <header className="sticky top-0 z-50 border-b border-[#d9e0dc] bg-[#f7f4ed]/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0c3431] text-white shadow-sm">
              <span className="text-base">⌂</span>
            </span>
            <span className="text-[17px] font-extrabold tracking-tight text-[#0c3431]">
              Stay<span className="text-[#14766c]">Guwahati</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-[11px] font-semibold text-[#526762] sm:flex">
            <Link href="/" className="hover:text-[#0c3431]">Home</Link>
            <Link href="/explore" className="hover:text-[#0c3431]">Explore</Link>
            <Link href="/refer-a-host" className="hover:text-[#0c3431]">Refer a host</Link>
            <Link href="/support" className="hover:text-[#0c3431]">Support</Link>
          </nav>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#cbd7d2] bg-white px-3.5 py-2 text-[11px] font-bold text-[#315c56] transition hover:border-[#8fb5ab]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-6 flex items-center gap-2 text-[10px] text-[#788983]">
          <Link href="/" className="hover:text-[#28655c]">Home</Link>
          <span>/</span>
          <span>Privacy Policy</span>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-[#d4ddd8] bg-white shadow-[0_5px_24px_rgba(22,55,49,0.05)]">
          <div className="bg-[#0c3431] px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#f2bf45]">
                  <FileText className="h-3.5 w-3.5" />
                  Legal & privacy
                </div>
                <h1 className="text-3xl font-black tracking-[-1px] text-white sm:text-4xl">
                  Privacy Policy
                </h1>
                <p className="mt-2 text-xs text-[#c4d5d1]">
                  Last Updated: July 3, 2026
                </p>
              </div>

              <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-4 sm:block">
                <ShieldCheck className="h-6 w-6 text-[#f2bf45]" />
                <p className="mt-2 text-[10px] font-bold text-white">Your privacy matters</p>
                <p className="mt-1 max-w-[150px] text-[9px] leading-4 text-[#b6ccc7]">
                  We aim to handle your information responsibly and transparently.
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[190px_1fr]">
            <aside className="border-b border-[#e1e7e4] bg-[#f5f8f6] p-5 lg:border-b-0 lg:border-r">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#2d756b]">
                On this page
              </p>
              <div className="mt-4 space-y-2">
                {sections.map((section, index) => (
                  <a
                    key={section.title}
                    href={`#privacy-${index + 1}`}
                    className="block rounded-lg px-2.5 py-2 text-[10px] font-semibold leading-4 text-[#61736e] hover:bg-white hover:text-[#0c3431]"
                  >
                    {section.title.replace(/^\d+\.\s*/, '')}
                  </a>
                ))}
              </div>
            </aside>

            <article className="px-6 py-7 sm:px-10 sm:py-9">
              <div className="mb-8 rounded-2xl border border-[#dbe8e2] bg-[#eef6f2] px-5 py-4">
                <p className="text-xs font-bold text-[#214b46]">A quick note</p>
                <p className="mt-1 text-[11px] leading-5 text-[#637671]">
                  This policy explains what information StayGuwahati collects, why it
                  is used, how it is protected, and the choices available to you.
                </p>
              </div>

              <div className="space-y-9">
                {sections.map((section, index) => (
                  <section
                    key={section.title}
                    id={`privacy-${index + 1}`}
                    className={index === sections.length - 1 ? 'pt-8 border-t border-[#e4e9e6]' : ''}
                  >
                    <div className="flex gap-3">
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#e8f3ef] text-[9px] font-black text-[#28655c]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-[17px] font-black tracking-[-.2px] text-[#173f3a]">
                          {section.title}
                        </h2>
                        <p className="mt-2 text-[13px] leading-6 text-[#657570]">
                          {section.body}
                        </p>

                        {section.bullets && (
                          <ul className="mt-4 space-y-3">
                            {section.bullets.map(([label, description]) => (
                              <li
                                key={label}
                                className="rounded-xl border border-[#e0e7e3] bg-[#fafcfb] px-4 py-3"
                              >
                                <p className="text-[11px] font-black text-[#315c56]">
                                  {label}
                                </p>
                                <p className="mt-1 text-[11px] leading-5 text-[#71817c]">
                                  {description}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d9e0dc]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-[10px] text-[#7b8985] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© 2026 StayGuwahati. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/support" className="hover:text-[#28655c]">Support</Link>
            <Link href="/refer-a-host" className="hover:text-[#28655c]">Refer a host</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
