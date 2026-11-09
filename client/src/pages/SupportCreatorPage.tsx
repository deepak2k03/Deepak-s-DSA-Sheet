import React, { useState } from 'react';
import { Check, Copy, Heart, ShieldCheck, Sparkles, Server, BookOpen } from 'lucide-react';
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
    <div className="page-shell flex min-h-screen flex-col">
      <AnimatedBackground />
      
      {/* Centered Main Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex items-center justify-center">
        
        <section className="w-full overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-2xl flex flex-col md:flex-row">
          
          {/* Left Panel - Story & Reassurance */}
          <div className="flex-1 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/70 p-8 sm:p-10 md:p-12 md:border-b-0 md:border-r flex flex-col justify-between">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <Heart size={14} className="fill-rose-500 text-rose-500" />
                <span>Keep the project growing</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Support the creator.
              </h1>
              
              <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                If this sheet has helped your coding preparation, a small contribution helps keep it maintained, improved, and 100% free for everyone.
              </p>

              {/* Impact Highlights */}
              <div className="mt-8 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                    <Server size={14} />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-[var(--text-primary)]">Fast & Reliable Hosting</p>
                    <p className="text-[var(--text-muted)]">Powers interactive HTML5 visualizers and daily streaks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-teal-500 shrink-0 mt-0.5">
                    <BookOpen size={14} />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-[var(--text-primary)]">Curated Curriculum & Solutions</p>
                    <p className="text-[var(--text-muted)]">Expands problem approaches, test cases, and editorial notes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-amber-500 shrink-0 mt-0.5">
                    <Sparkles size={14} />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-[var(--text-primary)]">No Paywalls, Forever Free</p>
                    <p className="text-[var(--text-muted)]">Community-supported so learners anywhere can prepare freely.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-2.5 border-t border-[var(--border-subtle)] pt-5 text-xs font-medium text-[var(--text-muted)]">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" /> 
              <span>Direct, zero-fee transfer via any UPI application</span>
            </div>
          </div>
          
          {/* Right Panel - QR Code & UPI Copy */}
          <div className="p-8 sm:p-10 md:p-12 md:w-[380px] lg:w-[420px] flex flex-col justify-between bg-[var(--bg-surface)]">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Scan to Contribute
                </h2>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Instant UPI
                </span>
              </div>
              <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                Scan with Google Pay, PhonePe, Paytm, Slice, or any UPI app.
              </p>
              
              {/* QR Image Box */}
              <div className="mt-5 flex justify-center rounded-2xl border border-[var(--border-strong)] bg-white p-4 shadow-sm">
                <img 
                  src="/assets/deepak-singh-upi-qr.jpeg" 
                  alt="UPI QR code for Deepak Singh" 
                  className="aspect-square w-full max-w-[210px] rounded-xl object-contain" 
                />
              </div>
              
              {/* UPI ID Box */}
              <div className="mt-5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-muted)] p-3.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  <span>UPI ID</span>
                  <span>Tap to copy</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <code className="font-mono text-xs sm:text-sm font-bold text-[var(--text-primary)] select-all">
                    {UPI_ID}
                  </code>
                  <button 
                    type="button" 
                    onClick={copyUpiId} 
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                      copied
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center">
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                Account Holder: <span className="font-bold">Deepak Singh</span>
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Every bit of support is deeply appreciated! ❤️
              </p>
            </div>
          </div>

        </section>
        
      </main>
      
      <Footer />
    </div>
  );
};

export default SupportCreatorPage;
