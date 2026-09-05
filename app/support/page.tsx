'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Menu,
  X,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Send,
  Loader2,
} from 'lucide-react';

const BACKEND_URL = 'https://stayguwahati-backend.onrender.com';

type Language = 'en' | 'as' | 'hi';

const translations = {
  en: {
    nav_home: 'Home',
    nav_dashboard: 'Dashboard',
    hub_badge: 'Trust & Security Hub',
    hub_heading: 'How can we help you stay safe and comfortable?',
    hub_subheading:
      'Explore local property dynamics, safety guardrails, self check-in systems, or get in touch with our local site administrators.',
    faq_title: 'Frequently Asked Questions',
    faq1_q: 'How does the self check-in system work?',
    faq1_a:
      'Once your reservation is confirmed, your host will send a unique smart-lock code or key-box instructions directly to your email tracker 24 hours before your check-in time.',
    faq2_q: "What is the platform's cancellation policy?",
    faq2_a:
      "We offer free cancellation up to 48 hours before your scheduled check-in time. Cancellations made inside the 48-hour window will incur a service fee equal to the first night's value.",
    faq3_q: 'Are all homestays verified?',
    faq3_a:
      'Yes. Every active listing on StayGuwahati goes through an individual profile and on-site physical credentials evaluation by our verification pipeline team before going live.',
    feat_secure_title: 'Secure Architecture',
    feat_secure_desc:
      'Encrypted matching network protects passwords, active profiles, and invoice history pipelines.',
    feat_reviews_title: 'Verified Reviews',
    feat_reviews_desc:
      'Guest feedback can only be written after checking out from a valid transaction receipt stay.',
    form_title: 'Contact Support',
    form_subtitle: "Can't find an answer? Shoot us a message.",
    lbl_subject: 'Issue Subject',
    opt_booking: 'Booking Query',
    opt_verification: 'Host Verification Match',
    opt_payment: 'Invoice or Payment Failures',
    opt_other: 'Other technical issue',
    lbl_description: 'Description',
    placeholder_desc: 'Explain your situation...',
    btn_submit: 'Submit Ticket',
  },
  as: {
    nav_home: 'গৃহমঞ্চ (Home)',
    nav_dashboard: 'ড্যাশ্ববৰ্ড',
    hub_badge: 'বিশ্বাস আৰু সুৰক্ষা কেন্দ্ৰ',
    hub_heading: 'আমি আপোনাক কেনেকৈ সুৰক্ষিত আৰু আৰামদায়ক ৰাখিব পাৰোঁ?',
    hub_subheading:
      'স্থানীয় সম্পত্তিৰ ধাৰণা, সুৰক্ষা নিয়ম, স্বয়ংক্ৰিয় চেক-ইন প্ৰণালী আদি চাওক বা স্থানীয় প্ৰশাসকৰ সৈতে যোগাযোগ কৰক।',
    faq_title: 'সঘনাই সোধা প্ৰশ্নসমূহ',
    faq1_q: 'স্বয়ংক্ৰিয় চেক-ইন ব্যৱস্থা কেনেকৈ কাম কৰে?',
    faq1_a:
      'আপোনাৰ বুকিং নিশ্চিত হোৱাৰ পিছত, ঘৰৰ মালিকে চেক-ইন সময়ৰ ২৪ ঘণ্টা পূৰ্বে স্মাৰ্ট-লক ক’ড প্ৰেৰণ কৰিব।',
    faq2_q: 'বাতিলকৰণ নীতি (Cancellation Policy) কি?',
    faq2_a: 'চেক-ইনৰ ৪৮ ঘণ্টা পূৰ্বে বিনামূলীয়াকৈ বুকিং বাতিল কৰিব পাৰিব।',
    faq3_q: 'সকলো হোমষ্টে পৰীক্ষিতনে?',
    faq3_a: 'হয়, প্ৰতিটো হোমষ্টে আমাৰ দলৰ দ্বাৰা ভৌতিকভাৱে পৰীক্ষা কৰা হয়।',
    feat_secure_title: 'সুৰক্ষিত প্ৰণালী',
    feat_secure_desc: 'এনক্ৰিপ্ট কৰা এনভায়ৰনমেণ্টে আপোনাৰ সকলো তথ্য সুৰক্ষিত ৰাখে।',
    feat_reviews_title: 'পৰীক্ষিত সমীক্ষা',
    feat_reviews_desc: 'কেৱল বুকিং সম্পূৰ্ণ কৰা অতিথিসকলেহে সমীক্ষা দিব পাৰে।',
    form_title: 'সহায়তাৰ বাবে যোগাযোগ কৰক',
    form_subtitle: 'উত্তৰ পোৱা নাইনে? আমালৈ বাৰ্তা প্ৰেৰণ কৰক।',
    lbl_subject: 'বিষয়',
    opt_booking: 'বুকিং সংক্ৰান্তিয় প্ৰশ্ন',
    opt_verification: 'হোষ্ট সত্যাপন',
    opt_payment: 'প্ৰদান আৰু ইনভইচৰ সমস্যা',
    opt_other: 'অন্যান্য কাৰিকৰী সমস্যা',
    lbl_description: 'বিৱৰণ',
    placeholder_desc: 'আপোনাৰ সমস্যাটো বিৱৰি লিখক...',
    btn_submit: 'টিকট দাখিল কৰক',
  },
  hi: {
    nav_home: 'होम',
    nav_dashboard: 'डैशबोर्ड',
    hub_badge: 'ट्रस्ट और सुरक्षा केंद्र',
    hub_heading: 'हम आपकी सुरक्षा और सुविधा के लिए क्या कर सकते हैं?',
    hub_subheading:
      'स्थानीय संपत्ति विवरण, सुरक्षा नियम, सेल्फ चेक-इन सिस्टम देखें या हमारे स्थानीय प्रशासक से संपर्क करें।',
    faq_title: 'अक्सर पूछे जाने वाले प्रश्न',
    faq1_q: 'सेल्फ चेक-इन सिस्टम कैसे काम करता है?',
    faq1_a:
      'आपकी बुकिंग कन्फर्म होने के बाद, होस्ट चेक-इन से 24 घंटे पहले आपके ईमेल पर स्मार्ट-लॉक कोड भेजेगा।',
    faq2_q: 'रद्दीकरण नीति (Cancellation Policy) क्या है?',
    faq2_a: '체क-इन समय से 48 घंटे पहले तक मुफ्त रद्द करने की सुविधा उपलब्ध है।',
    faq3_q: 'क्या सभी होमस्टे सत्यापित हैं?',
    faq3_a: 'हाँ, हमारी टीम द्वारा सभी होमस्टे का भौतिक सत्यापन किया जाता है।',
    feat_secure_title: 'सुरक्षित आर्किटेक्चर',
    feat_secure_desc: 'एनक्रिप्टेड नेटवर्क आपकी व्यक्तिगत जानकारी और भुगतानों को सुरक्षित रखता है।',
    feat_reviews_title: 'सत्यापित समीक्षाएं',
    feat_reviews_desc: 'केवल वैध स्टे पूरा करने वाले अतिथि ही समीक्षा छोड़ सकते हैं।',
    form_title: 'सहायता संपर्क',
    form_subtitle: 'क्या उत्तर नहीं मिला? हमें संदेश भेजें।',
    lbl_subject: 'विषय',
    opt_booking: 'बुकिंग संबंधी प्रश्न',
    opt_verification: 'होस्ट सत्यापन',
    opt_payment: 'भुगतान या चालान समस्या',
    opt_other: 'अन्य तकनीकी समस्या',
    lbl_description: 'विवरण',
    placeholder_desc: 'अपनी स्थिति का वर्णन करें...',
    btn_submit: 'टिकट जमा करें',
  },
};

export default function TrustSupportPage() {
  const [lang, setLang] = useState<Language>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const [subject, setSubject] = useState('booking');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const t = translations[lang];

  const toggleAccordion = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const ticketData = {
      subject,
      description,
      category: 'Support Hub Ticket',
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Success! Your ticket has been submitted.');
        setDescription('');
        setSubject('booking');
      } else {
        alert('Error: ' + (result.message || 'Failed to submit ticket'));
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Could not connect to the server. Please check if the backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f6f3ed] text-slate-800 font-sans antialiased min-h-screen w-full overflow-x-hidden">
      {/* Sticky Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-[#e3e9e5] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-[#28655c]" />
            <span className="text-lg sm:text-xl font-black text-[#173f3a] tracking-tight">
              Stay<span className="text-[#28655c]">Guwahati</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#526662]">
            <Link href="/" className="hover:text-[#28655c] transition">
              {t.nav_home}
            </Link>
            <Link href="/login" className="hover:text-[#28655c] transition">
              {t.nav_dashboard}
            </Link>

            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-[#f6f3ed] border border-[#d6ded9] text-xs rounded-lg p-1.5 focus:outline-none focus:border-teal-500 font-semibold text-[#35544e] cursor-pointer transition"
            >
              <option value="en">English</option>
              <option value="as">অসমীয়া (Assamese)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-3">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-[#f6f3ed] border border-[#d6ded9] text-xs rounded-lg p-1.5 focus:outline-none focus:border-teal-500 font-semibold text-[#35544e] cursor-pointer transition"
            >
              <option value="en">EN</option>
              <option value="as">অসমীয়া</option>
              <option value="hi">हिंदी</option>
            </select>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#526662] hover:text-[#28655c] focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#e3e9e5] bg-white px-4 pt-3 pb-4 space-y-3">
            <Link
              href="/"
              className="block text-sm font-semibold text-[#35544e] hover:text-[#28655c] py-1"
            >
              {t.nav_home}
            </Link>
            <Link
              href="/login"
              className="block text-sm font-semibold text-[#35544e] hover:text-[#28655c] py-1"
            >
              {t.nav_dashboard}
            </Link>
          </div>
        )}
      </nav>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="bg-[#e6f0ea] text-[#28655c] text-xs font-bold px-3 py-1 rounded-full border border-[#b9d2c8] inline-block">
            {t.hub_badge}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#173f3a] tracking-tight mt-3 mb-3 leading-tight">
            {t.hub_heading}
          </h1>
          <p className="text-sm sm:text-base text-[#71827d] font-medium leading-relaxed">
            {t.hub_subheading}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Left Side: FAQs and Features */}
          <div className="md:col-span-2 space-y-6 sm:space-y-8">
            {/* FAQ Card */}
            <div className="bg-white border border-[#e3e9e5] rounded-2xl p-4 sm:p-6 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-[#173f3a] mb-4 sm:mb-6 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#28655c]" />
                <span>{t.faq_title}</span>
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {/* FAQ 1 */}
                <div className="border-b border-[#e3e9e5] pb-3 sm:pb-4">
                  <button
                    onClick={() => toggleAccordion('faq1')}
                    className="w-full flex justify-between items-center text-left font-bold text-slate-800 hover:text-[#28655c] transition py-2 gap-2"
                  >
                    <span className="text-sm sm:text-base">{t.faq1_q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                        openFaq === 'faq1' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === 'faq1' && (
                    <div className="mt-2 text-xs sm:text-sm text-[#526662] leading-relaxed">
                      {t.faq1_a}
                    </div>
                  )}
                </div>

                {/* FAQ 2 */}
                <div className="border-b border-[#e3e9e5] pb-3 sm:pb-4">
                  <button
                    onClick={() => toggleAccordion('faq2')}
                    className="w-full flex justify-between items-center text-left font-bold text-slate-800 hover:text-[#28655c] transition py-2 gap-2"
                  >
                    <span className="text-sm sm:text-base">{t.faq2_q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                        openFaq === 'faq2' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === 'faq2' && (
                    <div className="mt-2 text-xs sm:text-sm text-[#526662] leading-relaxed">
                      {t.faq2_a}
                    </div>
                  )}
                </div>

                {/* FAQ 3 */}
                <div className="border-b border-[#e3e9e5] pb-3 sm:pb-4">
                  <button
                    onClick={() => toggleAccordion('faq3')}
                    className="w-full flex justify-between items-center text-left font-bold text-slate-800 hover:text-[#28655c] transition py-2 gap-2"
                  >
                    <span className="text-sm sm:text-base">{t.faq3_q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                        openFaq === 'faq3' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === 'faq3' && (
                    <div className="mt-2 text-xs sm:text-sm text-[#526662] leading-relaxed">
                      {t.faq3_a}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Features Cards Grid */}
            <div className="bg-white border border-[#e3e9e5] rounded-2xl p-4 sm:p-6 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#f6f3ed] border border-[#e3e9e5]/50 flex gap-3 items-start">
                <ShieldCheck className="w-6 h-6 text-[#28655c] mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-[#173f3a]">{t.feat_secure_title}</h4>
                  <p className="text-xs text-[#71827d] mt-1 leading-normal">
                    {t.feat_secure_desc}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#f6f3ed] border border-[#e3e9e5]/50 flex gap-3 items-start">
                <UserCheck className="w-6 h-6 text-[#28655c] mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-[#173f3a]">{t.feat_reviews_title}</h4>
                  <p className="text-xs text-[#71827d] mt-1 leading-normal">
                    {t.feat_reviews_desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Support Form */}
          <div className="bg-white border border-[#d6ded9]/80 rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-100/50 w-full">
            <h3 className="text-base sm:text-lg font-black text-[#173f3a] tracking-tight mb-1">
              {t.form_title}
            </h3>
            <p className="text-xs font-semibold text-slate-400 mb-5">{t.form_subtitle}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#71827d] mb-1 tracking-wide uppercase">
                  {t.lbl_subject}
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#f6f3ed] border border-[#d6ded9] focus:border-teal-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium transition outline-none"
                >
                  <option value="booking">{t.opt_booking}</option>
                  <option value="verification">{t.opt_verification}</option>
                  <option value="payment">{t.opt_payment}</option>
                  <option value="other">{t.opt_other}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#71827d] mb-1 tracking-wide uppercase">
                  {t.lbl_description}
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.placeholder_desc}
                  className="w-full bg-[#f6f3ed] border border-[#d6ded9] focus:border-teal-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium transition outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full bg-slate-900 hover:bg-[#28655c] text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-md flex justify-center items-center gap-2 text-sm ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <span>{t.btn_submit}</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}