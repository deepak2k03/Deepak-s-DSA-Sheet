import React from 'react';
import { Instagram, Linkedin, Twitter, Mail, Code2, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20" style={{ backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(16px) saturate(1.4)', WebkitBackdropFilter: 'blur(16px) saturate(1.4)' }}>
      {/* Gradient top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, var(--accent-surface) 30%, var(--accent) 50%, var(--accent-surface) 70%, transparent 95%)',
          opacity: 0.5,
        }}
      />

      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">

        {/* LEFT SECTION: Brand & Tagline */}
        <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="p-1.5 rounded-lg"
              style={{ backgroundColor: 'var(--accent-surface)' }}
            >
              <Code2 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            </div>
            <span className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              DSA Sheet
            </span>
          </div>
          <p className="text-sm max-w-xs text-center md:text-left" style={{ color: 'var(--text-muted)' }}>
            A focused, structured practice space for engineers building real problem-solving confidence.
          </p>
        </div>

        {/* RIGHT SECTION: Social Actions */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex space-x-3">
            <SocialLink href="https://x.com/deepak2k03" icon={<Twitter className="h-4 w-4" />} label="Twitter" />
            <SocialLink href="https://www.linkedin.com/in/deepak-singh-1b8590257/" icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />
            <SocialLink href="https://instagram.com/deepak2k03" icon={<Instagram className="h-4 w-4" />} label="Instagram" />
            <SocialLink href="mailto:sman59472@gmail.com" icon={<Mail className="h-4 w-4" />} label="Email" />
          </div>

          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
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

// Reusable Social Button with theme-aware glow on hover
const SocialLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="group flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300"
    style={{
      border: '1px solid var(--border-default)',
      color: 'var(--text-muted)',
      backgroundColor: 'transparent',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'var(--accent-surface)';
      e.currentTarget.style.color = 'var(--accent-text)';
      e.currentTarget.style.borderColor = 'var(--accent)';
      e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = 'var(--text-muted)';
      e.currentTarget.style.borderColor = 'var(--border-default)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    {icon}
  </a>
);

export default Footer;
