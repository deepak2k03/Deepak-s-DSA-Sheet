import React from 'react';
import { Instagram, Linkedin, Twitter, Mail, Code2, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/30 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        
        {/* LEFT SECTION: Brand & Tagline */}
        <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-600/10 dark:bg-blue-500/10">
              <Code2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              DSA Sheet
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center md:text-left">
            Crafted for engineers chasing excellence. Master algorithms with clarity and style.
          </p>
        </div>

        {/* RIGHT SECTION: Social Actions */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex space-x-4">
            <SocialLink href="https://x.com/deepak2k03" icon={<Twitter className="h-4 w-4" />} label="Twitter" />
            <SocialLink href="https://www.linkedin.com/in/deepak-singh-1b8590257/" icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />
            <SocialLink href="https://instagram.com/deepak2k03" icon={<Instagram className="h-4 w-4" />} label="Instagram" />
            <SocialLink href="mailto:sman59472@gmail.com" icon={<Mail className="h-4 w-4" />} label="Email" />
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span>&copy; {currentYear} Deepak Singh.</span>
            <span className="hidden sm:inline">Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500/20 animate-pulse" />
            <span className="hidden sm:inline">in India.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Reusable Minimalist Social Button Component
const SocialLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="group flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
  >
    {icon}
  </a>
);

export default Footer;