import React from 'react';
import { Github, Twitter, Linkedin, Code2 } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-base)] mt-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Code2 size={18} />
          <span className="text-sm font-medium">DSA Sheet</span>
          <span className="text-xs">&copy; {currentYear}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <SocialLink href="https://github.com/deepak2k03" icon={<Github size={16} />} label="GitHub" />
          <SocialLink href="https://x.com/deepak2k03" icon={<Twitter size={16} />} label="Twitter" />
          <SocialLink href="https://www.linkedin.com/in/deepak-singh-1b8590257/" icon={<Linkedin size={16} />} label="LinkedIn" />
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
  >
    {icon}
  </a>
);

export default Footer;
