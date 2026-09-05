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
  CalendarCheck,
  CreditCard,
  House,
  ShieldAlert,
  Search,
  ArrowRight,
  MessageCircle,
  Clock3,
  CheckCircle2,
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
    <div className="min-h-screen overflow-x-hidden bg-[#f5f1e9] text-[#173f3a]">
      <nav className="sticky top-0 z-50 border-b border-[#d8dfd8] bg-[#f5f1e9]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 font-black"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#173f3a] text-white"><Building2 className="h-5 w-5"/></span><span>Stay<span className="text-[#28655c]">Guwahati</span></span></Link>
          <div className="hidden items-center gap-7 text-sm font-semibold md:flex"><Link href="/">Home</Link><Link href="/explore">Explore</Link><Link href="/dashboard">Dashboard</Link><select value={lang} onChange={e=>setLang(e.target.value as Language)} className="rounded-xl border border-[#cbd7d1] bg-white px-3 py-2 outline-none"><option value="en">English</option><option value="as">অসমীয়া</option><option value="hi">हिंदी</option></select></div>
          <button onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#cbd7d1] md:hidden">{mobileMenuOpen?<X/>:<Menu/>}</button>
        </div>
        {mobileMenuOpen && <div className="border-t border-[#d8dfd8] bg-[#f5f1e9] px-5 py-4 md:hidden"><div className="flex flex-col gap-4 text-sm font-semibold"><Link href="/">Home</Link><Link href="/explore">Explore</Link><Link href="/dashboard">Dashboard</Link><select value={lang} onChange={e=>setLang(e.target.value as Language)} className="rounded-xl border border-[#cbd7d1] bg-white px-3 py-2"><option value="en">English</option><option value="as">অসমীয়া</option><option value="hi">हिंदी</option></select></div></div>}
      </nav>

      <main>
        <section className="relative overflow-hidden bg-[#123f39] px-5 py-14 text-white sm:py-20">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#3d766c]/40 blur-3xl"/>
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#e8b84c]/10 blur-3xl"/>
          <div className="relative mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-[#d7e9e2]"><MessageCircle className="h-4 w-4"/>StayGuwahati Help Centre</div>
              <h1 className="text-4xl font-black leading-[1.05] sm:text-6xl">Your local stay,<br/><span className="text-[#f1c75b]">backed by real help.</span></h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[#c6d8d2] sm:text-lg">Whether you are planning a stay, managing a booking or hosting a home, start here and we will point you in the right direction.</p>
            </div>
            <div className="mt-9 grid max-w-4xl gap-3 rounded-[24px] border border-white/15 bg-white/10 p-3 backdrop-blur sm:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-3 px-3"><Search className="h-5 w-5 text-[#f1c75b]"/><span className="text-sm text-[#d7e9e2]">What do you need help with?</span></div>
              <a href="#support-desk" className="rounded-2xl bg-[#f1c75b] px-6 py-3 text-center text-sm font-black text-[#173f3a]">Get support <ArrowRight className="ml-1 inline h-4 w-4"/></a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:py-16">
          <div className="mb-7 flex items-end justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#28655c]">Choose your path</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">What can we help with?</h2></div><p className="hidden max-w-xs text-sm leading-6 text-[#71827d] md:block">Choose a topic to quickly find the answers most relevant to your StayGuwahati journey.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [CalendarCheck,'Booking & stays','Check-ins, changes, cancellations and reservation questions.','booking'],
              [CreditCard,'Payments & refunds','Invoices, payment issues, refunds and booking charges.','payment'],
              [House,'Hosting & properties','Listing, verification and managing your property.','host'],
              [ShieldAlert,'Safety & account','Account access, verification and staying safely.','safety']
            ].map(([Icon,title,desc,key])=>{
              const active=subject===key;
              return <button key={String(key)} onClick={()=>{setSubject(String(key));document.getElementById('support-desk')?.scrollIntoView({behavior:'smooth'})}} className={`group min-h-[230px] rounded-[28px] border p-6 text-left transition duration-300 hover:-translate-y-1 ${active?'border-[#28655c] bg-[#173f3a] text-white shadow-xl':'border-[#d6ded9] bg-white hover:border-[#9eb8ae]'}`}>
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${active?'bg-[#f1c75b] text-[#173f3a]':'bg-[#e6f0ea] text-[#28655c]'}`}>{React.createElement(Icon as any,{className:'h-6 w-6'})}</span>
                <h3 className="mt-8 text-lg font-black">{title as string}</h3><p className={`mt-2 text-sm leading-6 ${active?'text-[#d4e4de]':'text-[#71827d]'}`}>{desc as string}</p><div className={`mt-5 text-xs font-black ${active?'text-[#f1c75b]':'text-[#28655c]'}`}>GET HELP <ArrowRight className="ml-1 inline h-3.5 w-3.5"/></div>
              </button>
            })}
          </div>
        </section>

        <section className="border-y border-[#d8dfd8] bg-[#e8eee9] px-5 py-12">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.8fr_1.2fr]">
            <div className="rounded-[28px] bg-[#173f3a] p-7 text-white sm:p-9"><p className="text-xs font-black uppercase tracking-[.18em] text-[#f1c75b]">Popular right now</p><h2 className="mt-4 text-3xl font-black leading-tight">Quick answers for common stay questions.</h2><p className="mt-4 text-sm leading-6 text-[#c8d8d3]">Shortcuts to the topics guests and hosts ask about most often.</p>
              <div className="mt-8 space-y-3"><a href="#faq" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold">Self check-in guide <ArrowRight className="float-right h-4 w-4 text-[#f1c75b]"/></a><a href="#faq" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold">Cancellation policy <ArrowRight className="float-right h-4 w-4 text-[#f1c75b]"/></a><a href="#support-desk" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold">Report a payment issue <ArrowRight className="float-right h-4 w-4 text-[#f1c75b]"/></a></div>
            </div>
            <div className="rounded-[28px] border border-[#d6ded9] bg-white p-5 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#28655c]">Local support, clearer stays</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f6f8f6] p-5"><UserCheck className="h-6 w-6 text-[#28655c]"/><h3 className="mt-4 font-black">Verified listings</h3><p className="mt-2 text-sm leading-6 text-[#71827d]">Understand how active StayGuwahati homes are reviewed.</p></div>
                <div className="rounded-2xl bg-[#f6f8f6] p-5"><ShieldCheck className="h-6 w-6 text-[#28655c]"/><h3 className="mt-4 font-black">Safer journeys</h3><p className="mt-2 text-sm leading-6 text-[#71827d]">Find practical help around account and stay safety.</p></div>
                <div className="rounded-2xl bg-[#f6f8f6] p-5 sm:col-span-2"><Clock3 className="h-6 w-6 text-[#28655c]"/><h3 className="mt-4 font-black">Support that starts with context</h3><p className="mt-2 text-sm leading-6 text-[#71827d]">Select a support path above and your ticket topic will be preselected below.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-7xl px-5 py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#28655c]">Answer library</p><h2 className="mt-3 text-4xl font-black leading-tight">A few answers before you open a ticket.</h2><p className="mt-4 text-sm leading-7 text-[#71827d]">Open a question to read the full guidance. If your situation is different, our support desk is just below.</p></div>
            <div className="space-y-3">
              {[
                ['01',t.faq1_q,t.faq1_a],
                ['02',t.faq2_q,t.faq2_a],
                ['03',t.faq3_q,t.faq3_a],
              ].map(([id,q,a])=><div key={id} className={`overflow-hidden rounded-3xl border transition ${openFaq===id?'border-[#28655c] bg-[#173f3a] text-white':'border-[#d6ded9] bg-white'}`}><button onClick={()=>toggleAccordion(id)} className="flex w-full items-center gap-4 p-5 text-left sm:p-6"><span className={`text-xs font-black ${openFaq===id?'text-[#f1c75b]':'text-[#28655c]'}`}>{id}</span><span className="flex-1 text-base font-black">{q}</span><ChevronDown className={`h-5 w-5 transition ${openFaq===id?'rotate-180 text-[#f1c75b]':''}`}/></button>{openFaq===id&&<div className="border-t border-white/10 px-6 pb-6 pl-16 text-sm leading-7 text-[#d5e2de]">{a}</div>}</div>)}
            </div>
          </div>
        </section>

        <section id="support-desk" className="bg-[#173f3a] px-5 py-14 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
            <div className="text-white"><div className="inline-flex rounded-full bg-[#f1c75b] px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-[#173f3a]">Support Desk</div><h2 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">Still need a hand?<br/>Tell us what happened.</h2><p className="mt-5 max-w-lg text-base leading-7 text-[#c8d8d3]">Send your issue with a little context. Your selected help path is carried into the support ticket.</p><div className="mt-8 space-y-4 text-sm text-[#d7e9e2]"><div className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-[#f1c75b]"/>Bookings, payments, hosting and account support</div><div className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-[#f1c75b]"/>Simple ticket submission from one place</div><div className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-[#f1c75b]"/>Built around StayGuwahati's existing support workflow</div></div></div>
            <form onSubmit={handleSubmit} className="rounded-[32px] bg-[#f7f8f6] p-5 shadow-2xl sm:p-8">
              <p className="text-xs font-black uppercase tracking-[.16em] text-[#28655c]">New support request</p><h3 className="mt-2 text-2xl font-black">Open a ticket</h3>
              <label className="mt-7 block text-xs font-black uppercase tracking-wide text-[#526662]">{t.lbl_subject}</label>
              <select value={subject} onChange={e=>setSubject(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#cbd7d1] bg-white px-4 py-4 text-sm outline-none focus:border-[#28655c] focus:ring-4 focus:ring-[#28655c]/10"><option value="booking">{t.opt_booking}</option><option value="verification">{t.opt_verification}</option><option value="payment">{t.opt_payment}</option><option value="other">{t.opt_other}</option><option value="host">Hosting & property support</option><option value="safety">Safety & account support</option></select>
              <label className="mt-6 block text-xs font-black uppercase tracking-wide text-[#526662]">{t.lbl_description}</label>
              <textarea value={description} onChange={e=>setDescription(e.target.value)} required rows={7} placeholder={t.placeholder_desc} className="mt-2 w-full resize-none rounded-2xl border border-[#cbd7d1] bg-white px-4 py-4 text-sm leading-6 outline-none focus:border-[#28655c] focus:ring-4 focus:ring-[#28655c]/10"/>
              <button disabled={submitting} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f1c75b] px-5 py-4 text-sm font-black text-[#173f3a] transition hover:bg-[#ffd878] disabled:opacity-60">{submitting?<><Loader2 className="h-4 w-4 animate-spin"/>Sending your ticket...</>:<>{t.btn_submit}<Send className="h-4 w-4"/></>}</button>
              <p className="mt-4 text-center text-xs leading-5 text-[#71827d]">Please include enough detail for our team to understand your issue.</p>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
