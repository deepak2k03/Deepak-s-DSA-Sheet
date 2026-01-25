import React, { useState, useEffect, useRef } from "react"; // 1. Import useRef
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Code2,
  Github,
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

interface UserData {
  username: string;
  email: string;
}

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 2. Create a Ref for the dropdown container
  const dropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // Auth Check
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      setIsAuthenticated(!!token);
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      }
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);

    // 3. CLICK OUTSIDE LISTENER
    // If user clicks anywhere NOT inside the dropdownRef, close the menu
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
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup
    };
  }, [location]);

  const handleLogout = () => {
    // Clear everything
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Reset State
    setIsAuthenticated(false);
    setUser(null);
    setIsMenuOpen(false);

    // Redirect
    navigate("/login");
  };

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        scrolled
          ? "bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm"
          : "bg-transparent border-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT: Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-xl bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              Deepak's <span className="text-blue-600 dark:text-blue-400">Sheet</span>
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
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-all"
            >
              <Github size={20} />
            </a>

            <ThemeToggle />

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

            {isAuthenticated ? (
              // 4. ATTACH THE REF TO THIS WRAPPER
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  // 5. REMOVED THE ONBLUR HERE (It was causing the bug)
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-md shadow-blue-500/20">
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-blue-500/10"
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
      "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
      active
        ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5",
    )}
  >
    <span
      className={clsx(
        active ? "text-blue-600 dark:text-blue-400" : "opacity-70",
      )}
    >
      {icon}
    </span>
    {text}
  </Link>
);

export default Header;
