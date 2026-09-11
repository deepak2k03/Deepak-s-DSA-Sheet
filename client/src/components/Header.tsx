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
                  className={clsx(
                    "flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border transition-all",
                    isMenuOpen
                      ? "border-teal-600/40 bg-[#dceee9]/50 dark:bg-white/10 dark:border-teal-400/30"
                      : "border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-[#dceee9] dark:bg-teal-400 flex items-center justify-center text-[#123b36] dark:text-[#08241f] font-bold text-xs uppercase">
                    {user?.username ? user.username.charAt(0) : "U"}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isMenuOpen ? "rotate-180 text-[#123b36] dark:text-teal-300" : ""}`}
                  />
                </button>

                {isMenuOpen && (
                  <div className="surface absolute right-0 mt-2 w-60 origin-top-right rounded-2xl shadow-xl shadow-teal-950/5 dark:shadow-black/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
                    <div className="px-4 py-3.5 border-b border-slate-100 dark:border-white/10 bg-[#fbfcfa]/80 dark:bg-white/[0.03]">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          @{user?.username || "User"}
                        </p>
                        {user?.role === "admin" && (
                          <span className="shrink-0 rounded-full bg-[#dceee9] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-teal-800 dark:bg-teal-400/10 dark:text-teal-300">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {user?.email || "No email"}
                      </p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)} // Close menu on click
                        className="group flex items-center gap-2.5 px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#dceee9]/60 hover:text-[#123b36] dark:hover:bg-teal-400/10 dark:hover:text-teal-200 rounded-xl transition-all"
                      >
                        <UserIcon size={16} className="text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors" /> Profile
                      </Link>
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="group flex items-center gap-2.5 px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#dceee9]/60 hover:text-[#123b36] dark:hover:bg-teal-400/10 dark:hover:text-teal-200 rounded-xl transition-all"
                        >
                          <Shield size={16} className="text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors" /> Admin Panel
                        </Link>
                      )}
                      <div className="my-1 border-t border-slate-100 dark:border-white/10" />
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
