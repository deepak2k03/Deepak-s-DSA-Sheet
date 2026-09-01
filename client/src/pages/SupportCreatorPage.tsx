import React, { useState } from 'react';
import { Check, Copy, Heart, ShieldCheck } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';

const UPI_ID = '9569467784@slc';

const SupportCreatorPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Could not copy UPI ID', error);
    }
  };

  return (
    <div className="page-shell">
      <AnimatedBackground />
      <main className="page-wrap flex min-h-[calc(100vh-72px)] max-w-5xl items-center py-14 sm:py-20">
        <section className="grid w-full overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-2xl shadow-teal-950/5 dark:border-white/10 dark:bg-[#121917] lg:grid-cols-[.9fr_1.1fr]">
          <div className="bg-[#123b36] p-8 text-white sm:p-12">
            <p className="eyebrow text-teal-200"><Heart size={14} className="fill-current" /> Keep the project growing</p>
            <h1 className="mt-6 text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">Support the creator.</h1>
            <p className="mt-6 max-w-sm leading-7 text-teal-100">If this sheet has helped your preparation, a small contribution helps keep it maintained, improved, and free for everyone.</p>
            <div className="mt-12 flex items-center gap-3 border-t border-white/15 pt-6 text-sm text-teal-100"><ShieldCheck size={18} className="text-teal-300" /> Pay securely through any UPI app</div>
          </div>
          <div className="p-7 sm:p-10">
            <p className="text-sm font-extrabold text-[#123b36] dark:text-teal-300">Scan to contribute</p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Open any UPI app, scan the QR code, and enter the amount you’d like to contribute.</p>
            <div className="mt-7 flex justify-center rounded-2xl border border-slate-200 bg-[#fbfcfa] p-5 dark:border-white/10 dark:bg-white/[.025]">
              <img src="/assets/deepak-singh-upi-qr.jpeg" alt="UPI QR code for Deepak Singh" className="aspect-square w-full max-w-[280px] rounded-xl object-contain mix-blend-multiply dark:mix-blend-normal" />
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-white/10"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-400">UPI ID</p><div className="mt-2 flex items-center justify-between gap-3"><code className="font-mono text-sm font-medium text-[#123b36] dark:text-teal-200">{UPI_ID}</code><button type="button" onClick={copyUpiId} className="button-secondary !px-3 !py-2 text-xs">{copied ? <><Check size={15} className="text-teal-600" /> Copied</> : <><Copy size={15} /> Copy</>}</button></div></div>
            <p className="mt-5 text-center text-xs text-slate-400">Account holder: Deepak Singh</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SupportCreatorPage;
