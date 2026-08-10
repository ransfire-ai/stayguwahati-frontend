'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="bg-white py-4 px-4 sm:px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <span className="text-teal-600 text-xl sm:text-2xl">🏠</span>
            <h1 className="font-bold text-teal-800 text-base sm:text-lg">
              StayGuwahati
            </h1>
          </Link>
          <Link
            href="/dashboard"
            className="text-xs sm:text-sm text-gray-500 hover:text-teal-700 font-medium transition flex items-center gap-1"
          >
            <span>Back to Dashboard</span>
            <span className="text-[10px]">➔</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-12 flex-1">
        <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mb-8">
            Last Updated: July 3, 2026
          </p>

          <div className="space-y-6 text-gray-700 text-sm sm:text-base">
            <section>
              <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                1. Introduction
              </h2>
              <p className="leading-relaxed">
                Welcome to StayGuwahati. We are committed to protecting your
                personal information and your right to privacy. This Privacy Policy
                applies to all information collected through our website and any
                related services, sales, or events.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                2. Information We Collect
              </h2>
              <p className="leading-relaxed">
                We collect personal information that you voluntarily provide to us
                when you register on the website or interact with our services.
                This includes:
              </p>
              <ul className="list-disc list-inside ml-2 mt-2 space-y-1.5 text-xs sm:text-sm">
                <li>
                  <strong>Personal Data:</strong> Name, email address, and phone
                  number.
                </li>
                <li>
                  <strong>Authentication Data:</strong> Credentials to manage your
                  session security.
                </li>
                <li>
                  <strong>Usage Data:</strong> IP address, browser type, and
                  interaction metrics.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                3. How We Use Your Information
              </h2>
              <p className="leading-relaxed">
                We use the data we collect to facilitate account creation, provide
                our booking services, improve website performance, and send
                necessary administrative notifications.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                4. Data Security
              </h2>
              <p className="leading-relaxed">
                We implement technical and organizational measures, such as SSL/TLS
                encryption and access controls, to protect your data. Please note
                that no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                5. Third-Party Sharing
              </h2>
              <p className="leading-relaxed">
                We do not sell your personal information. We may share data only
                with essential service providers (such as hosting) or where
                legally required to comply with applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                6. Your Rights
              </h2>
              <p className="leading-relaxed">
                Depending on your location, you may have the right to access,
                rectify, or request the deletion of your personal data. To
                exercise these rights, please contact us.
              </p>
            </section>

            <section className="pt-6 border-t border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                7. Contact Us
              </h2>
              <p className="leading-relaxed">
                If you have questions about this policy, please contact the
                StayGuwahati Team at the email address provided in your
                registration or support portal.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto py-6 px-4 text-center text-xs text-gray-400 border-t border-gray-100 mt-8">
        &copy; 2026 StayGuwahati. All rights reserved.
      </footer>
    </div>
  );
}