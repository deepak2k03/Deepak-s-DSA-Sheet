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
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-[var(--glass-bg)] backdrop-blur-md border-b border-[var(--border-subtle)] shadow-[var(--shadow-sm)]'
          : 'bg-transparent border-b border-transparent shadow-none'
      )}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
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
