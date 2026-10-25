import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Code2,
  Shield,
  LayoutGrid,
  BookMarked,
  Trophy,
  LogOut,
  LogIn,
  User as UserIcon,
  ChevronDown,
  Flame,
  PlayCircle,
  Menu,
  X,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { clsx } from 'clsx';
import {
  AUTH_STATE_EVENT,
  clearAuthSession,
  getStoredToken,
  getStoredUser,
} from '../utils/auth';
import type { StoredUser } from '../utils/auth';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Refs for dropdowns and mobile menu
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);

    const checkAuth = () => {
      const token = getStoredToken();
      const userData = getStoredUser();
      setIsAuthenticated(!!token);
      setUser(userData);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener(AUTH_STATE_EVENT, checkAuth);

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener(AUTH_STATE_EVENT, checkAuth);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setIsAuthenticated(false);
    setUser(null);
    setIsMenuOpen(false);

    navigate('/login');
  };

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-[var(--glass-bg)] backdrop-blur-md border-b border-[var(--border-subtle)] shadow-[var(--shadow-sm)]'
          : 'bg-transparent border-b border-transparent shadow-none'
      )}
    >

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-[64px] sm:h-[68px]">
          {/* LEFT: Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">
              DSA Sheet
            </span>
          </Link>

          {/* CENTER: Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              icon={<LayoutGrid size={16} />}
              text="Home"
              active={location.pathname === '/'}
            />
            <NavLink
              to="/topics"
              icon={<BookMarked size={16} />}
              text="Topics"
              active={location.pathname.includes('/topic')}
            />
            <NavLink
              to="/visualizers"
              icon={<PlayCircle size={16} />}
              text="Visualizer"
              active={location.pathname.startsWith('/visualizer')}
            />
            <NavLink
              to="/leaderboard"
              icon={<Trophy size={16} />}
              text="Leaderboard"
              active={location.pathname === '/leaderboard'}
            />
            <NavLink
              to="/potd"
              icon={<Flame size={16} />}
              text="Daily"
              active={location.pathname === '/potd'}
            />
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div
              className="w-px h-6 mx-1 hidden sm:block"
              style={{ backgroundColor: 'var(--border-default)' }}
            />

            {isAuthenticated ? (
              // 4. ATTACH THE REF TO THIS WRAPPER
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={clsx(
                    'flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border transition-all duration-300',
                  )}
                  style={{
                    borderColor: isMenuOpen
                      ? 'var(--accent, rgba(94,234,212,0.3))'
                      : 'var(--border-default)',
                    backgroundColor: isMenuOpen
                      ? 'var(--accent-surface)'
                      : 'transparent',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase"
                    style={{
                      backgroundColor: 'var(--accent-surface)',
                      color: 'var(--accent-text)',
                    }}
                  >
                    {user?.username ? user.username.charAt(0) : 'U'}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                    style={{ color: isMenuOpen ? 'var(--accent)' : 'var(--text-muted)' }}
                  />
                </button>

                {isMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 origin-top-right rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                    style={{
                      background: 'var(--glass-bg)',
                      backdropFilter: 'blur(20px) saturate(1.6)',
                      WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
                      border: '1px solid var(--border-default)',
                      boxShadow: 'var(--shadow-xl)',
                    }}
                  >
                    <div
                      className="px-4 py-3.5"
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface-muted)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                          @{user?.username || 'User'}
                        </p>
                        {user?.role === 'admin' && (
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide"
                            style={{
                              backgroundColor: 'var(--accent-surface)',
                              color: 'var(--accent-text)',
                            }}
                          >
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {user?.email || 'No email'}
                      </p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="group flex items-center gap-2.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--accent-surface)';
                          e.currentTarget.style.color = 'var(--accent-text)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        <UserIcon size={16} style={{ color: 'var(--text-muted)' }} /> Profile
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="group flex items-center gap-2.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--accent-surface)';
                            e.currentTarget.style.color = 'var(--accent-text)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                        >
                          <Shield size={16} style={{ color: 'var(--text-muted)' }} /> Admin Panel
                        </Link>
                      )}
                      <div className="my-1" style={{ borderTop: '1px solid var(--border-subtle)' }} />
                      <button
                        onClick={handleLogout}
                        className="group w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl text-left transition-all"
                      >
                        <LogOut size={16} className="text-rose-400 group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="button-primary flex items-center gap-2 !px-4 !py-2 !rounded-xl text-sm font-bold"
              >
                <LogIn size={16} />
                <span>Log in</span>
              </Link>
            )}
            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              ref={mobileButtonRef}
              type="button"
              onClick={() => {
                setIsMobileMenuOpen((prev) => !prev);
                setIsMenuOpen(false);
              }}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-default)] transition-all duration-200 active:scale-95 ml-1"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X size={19} className="transition-transform duration-200" />
              ) : (
                <Menu size={19} className="transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-2xl shadow-[var(--shadow-xl)] animate-in slide-in-from-top-2 duration-200"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(24px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
          }}
        >
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-4 space-y-3 max-h-[calc(100vh-80px)] overflow-y-auto">
            {/* Primary Navigation Links */}
            <div className="space-y-1">
              <MobileNavLink
                to="/"
                icon={<LayoutGrid size={18} />}
                text="Home"
                active={location.pathname === '/'}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavLink
                to="/topics"
                icon={<BookMarked size={18} />}
                text="Topics"
                active={location.pathname.includes('/topic')}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavLink
                to="/visualizers"
                icon={<PlayCircle size={18} />}
                text="Visualizer"
                active={location.pathname.startsWith('/visualizer')}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavLink
                to="/leaderboard"
                icon={<Trophy size={18} />}
                text="Leaderboard"
                active={location.pathname === '/leaderboard'}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavLink
                to="/potd"
                icon={<Flame size={18} />}
                text="Daily Problem"
                active={location.pathname === '/potd'}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--border-subtle)] pt-2 space-y-1">

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <UserIcon size={18} className="text-[var(--text-muted)]" />
                    <span>My Profile (@{user?.username})</span>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Shield size={18} className="text-[var(--text-muted)]" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut size={18} />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <div className="pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="button-primary w-full flex items-center justify-center gap-2 !py-2.5 !rounded-xl text-sm font-bold shadow-md"
                  >
                    <LogIn size={16} />
                    <span>Log in / Sign up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const MobileNavLink = ({
  to,
  icon,
  text,
  active,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  text: string;
  active: boolean;
  onClick: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={clsx(
      'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
      active
        ? 'bg-[var(--accent-surface)] text-[var(--text-primary)] border border-[var(--accent-border, rgba(94,234,212,0.2))] shadow-sm'
        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
    )}
  >
    <div className="flex items-center gap-3">
      <span className={clsx('transition-colors', active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')}>
        {icon}
      </span>
      <span>{text}</span>
    </div>
    {active && (
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
    )}
  </Link>
);

const NavLink = ({
  to,
  icon,
  text,
  active,
}: {
  to: string;
  icon: React.ReactNode;
  text: string;
  active: boolean;
}) => (
  <Link
    to={to}
    className={clsx(
      'relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200',
      active 
        ? 'bg-[var(--accent-surface)] text-[var(--text-primary)]' 
        : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
    )}
  >
    <span className={active ? 'text-[var(--accent)]' : ''}>
      {icon}
    </span>
    {text}
  </Link>
);

export default Header;
