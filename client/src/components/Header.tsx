import React, { useState, useEffect, useRef } from "react"; // 1. Import useRef
import { Link, useLocation, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { clsx } from "clsx";
import {
  AUTH_STATE_EVENT,
  clearAuthSession,
  getStoredToken,
  getStoredUser,
} from "../utils/auth";
import type { StoredUser } from "../utils/auth";

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
    window.addEventListener("scroll", handleScroll);

    const checkAuth = () => {
      const token = getStoredToken();
      const userData = getStoredUser();
      setIsAuthenticated(!!token);
      setUser(userData);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener(AUTH_STATE_EVENT, checkAuth);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener(AUTH_STATE_EVENT, checkAuth);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [location]);

  const handleLogout = () => {
    clearAuthSession();
    setIsAuthenticated(false);
    setUser(null);
    setIsMenuOpen(false);

    navigate("/login");
  };

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        scrolled
          ? "bg-[#f7f8f5]/85 dark:bg-[#0c1110]/85 backdrop-blur-xl border-slate-200/80 dark:border-white/10"
          : "bg-[#f7f8f5]/60 dark:bg-[#0c1110]/60 border-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* LEFT: Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-[#123b36] dark:bg-teal-400 text-white dark:text-[#08241f] shadow-sm transition-all duration-300 group-hover:scale-105">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              Deepak's <span className="text-teal-700 dark:text-teal-300">Sheet</span>
            </span>
          </Link>

          {/* CENTER: Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              icon={<LayoutGrid size={16} />}
              text="Home"
              active={location.pathname === "/"}
            />
            <NavLink
              to="/topics"
              icon={<BookMarked size={16} />}
              text="Topics"
              active={location.pathname.includes("/topic")}
            />
            <NavLink
              to="/leaderboard"
              icon={<Trophy size={16} />}
              text="Leaderboard"
              active={location.pathname === "/leaderboard"}
            />
            <NavLink
              to="/potd"
              icon={
                <Flame
                  size={16}
                  className={
                    location.pathname === "/potd"
                      ? "text-orange-500"
                      : "text-slate-400 group-hover:text-orange-500"
                  }
                />
              }
              text="Daily"
              active={location.pathname === "/potd"}
            />
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/deepak2k03/Deepak-s-DSA-Sheet"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition-all"
            >
              <Github size={20} />
            </a>

            <ThemeToggle />

            <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block"></div>

            {isAuthenticated ? (
              // 4. ATTACH THE REF TO THIS WRAPPER
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  // 5. REMOVED THE ONBLUR HERE (It was causing the bug)
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-[#dceee9] dark:bg-teal-400 flex items-center justify-center text-[#123b36] dark:text-[#08241f] font-bold text-xs uppercase">
                    {user?.username ? user.username.charAt(0) : "U"}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-500 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        @{user?.username || "User"}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {user?.email || "No email"}
                      </p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)} // Close menu on click
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <UserIcon size={16} /> Profile
                      </Link>
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Shield size={16} /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-left transition-colors"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#123b36] dark:bg-teal-400 text-white dark:text-[#08241f] text-sm font-bold hover:opacity-90 transition-all"
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
      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
      active
        ? "bg-[#dceee9] text-[#123b36] dark:bg-teal-400/15 dark:text-teal-200"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5",
    )}
  >
    <span
      className={clsx(
        active ? "text-teal-700 dark:text-teal-300" : "opacity-70",
      )}
    >
      {icon}
    </span>
    {text}
  </Link>
);

export default Header;
