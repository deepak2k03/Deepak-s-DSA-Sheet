import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Code2,
  Github,
  Shield,
  LayoutGrid,
  BookMarked,
  Trophy,
  LogOut,
  LogIn,
  User as UserIcon,
  ChevronDown,
  Flame,
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

  // 2. Create a Ref for the dropdown container
  const dropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener(AUTH_STATE_EVENT, checkAuth);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location]);

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
        'sticky top-0 z-50 w-full transition-all duration-500',
        scrolled
          ? 'backdrop-blur-xl backdrop-saturate-[1.8]'
          : 'backdrop-blur-md backdrop-saturate-[1.2]',
      )}
      style={{
        backgroundColor: scrolled
          ? 'var(--glass-bg)'
          : 'transparent',
        borderBottom: scrolled
          ? '1px solid var(--border-subtle)'
          : '1px solid transparent',
        boxShadow: scrolled ? 'var(--shadow-xs)' : 'none',
      }}
    >
      {/* Gradient bottom border accent (visible when scrolled) */}
      {scrolled && (
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--accent-surface), var(--accent), var(--accent-surface), transparent)',
            opacity: 0.4,
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* LEFT: Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="p-2 rounded-xl text-white shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md dark:text-[#08241f]"
              style={{
                background: 'var(--accent, #123b36)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Code2 className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Deepak's{' '}
              <span style={{ color: 'var(--accent)' }}>Sheet</span>
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
              to="/leaderboard"
              icon={<Trophy size={16} />}
              text="Leaderboard"
              active={location.pathname === '/leaderboard'}
            />
            <NavLink
              to="/potd"
              icon={
                <Flame
                  size={16}
                  className={
                    location.pathname === '/potd'
                      ? 'text-orange-500'
                      : 'text-slate-400 group-hover:text-orange-500'
                  }
                />
              }
              text="Daily"
              active={location.pathname === '/potd'}
            />
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/deepak2k03/Deepak-s-DSA-Sheet"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-surface)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <Github size={20} />
            </a>

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
          </div>
        </div>
      </div>
    </header>
  );
};

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
      'relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
    )}
    style={{
      backgroundColor: active ? 'var(--accent-surface)' : 'transparent',
      color: active ? 'var(--accent-text)' : 'var(--text-muted)',
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = 'var(--accent-muted)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--text-muted)';
      }
    }}
  >
    <span style={{ color: active ? 'var(--accent)' : undefined, opacity: active ? 1 : 0.7 }}>
      {icon}
    </span>
    {text}
    {/* Active indicator dot */}
    {active && (
      <span
        className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 h-[3px] w-5 rounded-full"
        style={{ backgroundColor: 'var(--accent)' }}
      />
    )}
  </Link>
);

export default Header;
