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
      <main className="page-wrap flex min-h-[calc(100vh-72px)] max-w-4xl items-center py-14 sm:py-20">
        
        <section className="w-full overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] flex flex-col md:flex-row">
          
          {/* Left Panel */}
          <div className="flex-1 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-8 sm:p-12 md:border-b-0 md:border-r">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
              <Heart size={14} className="text-[var(--text-primary)]" />
              <span>Keep the project growing</span>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Support the creator.
            </h1>
            
            <p className="mt-4 max-w-sm text-lg text-[var(--text-secondary)]">
              If this sheet has helped your preparation, a small contribution helps keep it maintained, improved, and free for everyone.
            </p>
            
            <div className="mt-10 flex items-center gap-3 border-t border-[var(--border-subtle)] pt-6 text-sm font-medium text-[var(--text-muted)]">
              <ShieldCheck size={18} className="text-[var(--text-primary)]" /> 
              Pay securely through any UPI app
            </div>
          </div>
          
          {/* Right Panel */}
          <div className="p-8 sm:p-12 md:w-[400px]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">Scan to contribute</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Open any UPI app, scan the QR code, and enter the amount you’d like to contribute.</p>
            
            <div className="mt-6 flex justify-center rounded-xl border border-[var(--border-strong)] bg-white p-4">
              <img 
                src="/assets/deepak-singh-upi-qr.jpeg" 
                alt="UPI QR code for Deepak Singh" 
                className="aspect-square w-full max-w-[220px] rounded-lg object-contain" 
              />
            </div>
            
            <div className="mt-6 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-muted)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">UPI ID</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <code className="font-mono text-sm font-semibold text-[var(--text-primary)]">{UPI_ID}</code>
                <button 
                  type="button" 
                  onClick={copyUpiId} 
                  className="flex items-center gap-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                >
                  {copied ? (
                    <><Check size={14} className="text-[var(--text-primary)]" /> Copied</>
                  ) : (
                    <><Copy size={14} /> Copy</>
                  )}
                </button>
              </div>
            </div>
            
            <p className="mt-4 text-center text-xs font-medium text-[var(--text-muted)]">Account holder: Deepak Singh</p>
          </div>
        </section>
        
      </main>
      <Footer />
    </div>
  );
};

export default SupportCreatorPage;
