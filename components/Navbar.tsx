"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, LayoutDashboard } from "lucide-react";

const moreDropdown = [
  { label: "Classes Timetable", href: "/timetable" },
  { label: "BMI Calculate", href: "/bmi" },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Classes", href: "/classes" },
  { label: "Services", href: "/services" },
  { label: "Our Team", href: "/team" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  {
    label: "Facebook",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <polygon fill="currentColor" stroke="none" points="10,9 16,12 10,15" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
];

function getActiveLabel(pathname: string) {
  if (pathname === "/about") return "About Us";
  if (pathname.startsWith("/classes")) return "Classes";
  if (pathname === "/services") return "Services";
  if (pathname === "/team") return "Our Team";
  if (pathname === "/timetable" || pathname === "/bmi") return "More";
  if (pathname.startsWith("/contact")) return "Contact";
  return "Home";
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreOpenMobile, setMoreOpenMobile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const active = getActiveLabel(pathname);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("adminToken"));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/95 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-black italic">
              <span className="text-yellow-400">CEN</span>
              <span className="text-orange-500">TRUM</span>
              <span className="text-white font-bold ml-2">GYM</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`nav-link text-sm font-semibold tracking-widest uppercase transition-colors ${
                  active === link.label ? "text-orange-500" : "text-white hover:text-orange-400"
                }`}
              >
                {link.label}
              </a>
            ))}

            {/* More dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={`flex items-center gap-1 text-sm font-semibold tracking-widest uppercase transition-colors ${
                  active === "More" ? "text-orange-500" : "text-white hover:text-orange-400"
                }`}
              >
                More
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
                />
              </button>

              {moreOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 shadow-xl z-50">
                  {moreDropdown.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className="block px-5 py-3 text-sm text-white hover:text-orange-500 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Social Icons + Admin */}
          <div className="hidden lg:flex items-center gap-3 text-white">
            {socialLinks.map((s) => (
              <a key={s.label} href="#" aria-label={s.label} className="hover:text-orange-400 transition-colors">
                {s.svg}
              </a>
            ))}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1.5 ml-2 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                <LayoutDashboard size={13} />
                Dashboard
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-black/95 border-t border-zinc-800 px-4 pb-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block py-3 text-sm font-semibold tracking-widest uppercase border-b border-zinc-800 ${
                active === link.label ? "text-orange-500" : "text-white"
              }`}
            >
              {link.label}
            </a>
          ))}

          {/* More mobile */}
          <div className="border-b border-zinc-800">
            <button
              onClick={() => setMoreOpenMobile((v) => !v)}
              className={`flex items-center justify-between w-full py-3 text-sm font-semibold tracking-widest uppercase ${
                active === "More" ? "text-orange-500" : "text-white"
              }`}
            >
              More
              <ChevronDown size={14} className={`transition-transform ${moreOpenMobile ? "rotate-180" : ""}`} />
            </button>
            {moreOpenMobile && (
              <div className="pl-4 pb-2">
                {moreDropdown.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => { setOpen(false); setMoreOpenMobile(false); }}
                    className="block py-2 text-sm text-gray-300 hover:text-orange-500 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mt-4 text-white">
            {socialLinks.map((s) => (
              <a key={s.label} href="#" aria-label={s.label} className="hover:text-orange-400 transition-colors">
                {s.svg}
              </a>
            ))}
          </div>
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold uppercase tracking-wider rounded-lg transition-colors"
            >
              <LayoutDashboard size={15} />
              Go to Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
