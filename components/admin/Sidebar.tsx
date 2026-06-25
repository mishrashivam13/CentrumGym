"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, MessageSquare, LogOut, Dumbbell,
  X, Globe, UserSearch, ClipboardCheck, PersonStanding,
  Send, TrendingUp, Briefcase, Sun, Moon, MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const NAV = [
  { label: "Dashboard",      href: "/admin/dashboard",    icon: LayoutDashboard },
  { label: "Members",        href: "/admin/members",      icon: Users },
  { label: "Trainers",       href: "/admin/trainers",     icon: PersonStanding },
  { label: "Attendance",     href: "/admin/attendance",   icon: ClipboardCheck },
  { label: "Finance",        href: "/admin/finance",      icon: TrendingUp },
  { label: "Staff",          href: "/admin/staff",        icon: Briefcase },
  { label: "Bulk Message",   href: "/admin/bulk-message", icon: Send },
  { label: "Walk-in Visits", href: "/admin/walk-ins",     icon: UserSearch },
  { label: "Enquiries",      href: "/admin/enquiries",    icon: MessageSquare },
];

/* Bottom bar shows these 4 + "More" */
const BOTTOM_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Members",   href: "/admin/members",   icon: Users },
  { label: "Finance",   href: "/admin/finance",   icon: TrendingUp },
  { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
];

export default function Sidebar() {
  const pathname            = usePathname();
  const router              = useRouter();
  const { theme, toggle }   = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isLight = theme === "light";

  /* ── Peach / Dark tokens ── */
  const P = {
    sidebar:    isLight ? "bg-[#fff4ea] border-[#f0c8a8]" : "bg-zinc-900 border-zinc-800",
    text:       isLight ? "text-[#2d1206]"                : "text-white",
    sub:        isLight ? "text-[#b07050]"                : "text-zinc-600",
    divider:    isLight ? "border-[#f0c8a8]"              : "border-zinc-800",
    linkBase:   isLight
      ? "text-[#7a4025] hover:bg-[#fde8d4] hover:text-[#2d1206]"
      : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
    logoutBase: isLight
      ? "text-[#7a4025] hover:bg-red-50 hover:text-red-500"
      : "text-zinc-400 hover:bg-zinc-800 hover:text-red-400",
    toggleBg:   isLight
      ? "bg-[#fde8d4] text-[#7a4025] hover:bg-[#f8d5bb]"
      : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
    badge:      isLight ? "bg-orange-100 text-orange-600" : "bg-zinc-700 text-zinc-400",
    closeBtn:   isLight ? "text-[#b07050] hover:text-[#2d1206]" : "text-zinc-500 hover:text-white",
    /* Mobile bottom bar */
    bottomBar:  isLight ? "bg-[#fff4ea] border-[#f0c8a8]" : "bg-zinc-900 border-zinc-800",
    tabActive:  isLight ? "text-[#e07030]"                : "text-yellow-400",
    tabInactive:isLight ? "text-[#b07050]"                : "text-zinc-500",
    tabActiveBg:isLight ? "bg-[#fde8d4]"                 : "bg-zinc-800",
    sheet:      isLight ? "bg-[#fff4ea]"                  : "bg-zinc-900",
    sheetItem:  isLight
      ? "text-[#5a2d14] hover:bg-[#fde8d4]"
      : "text-zinc-300 hover:bg-zinc-800",
    sheetActive:isLight
      ? "bg-[#fde8d4] text-[#e07030] font-semibold"
      : "bg-zinc-800 text-yellow-400 font-semibold",
  };

  function logout() {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  }

  /* ── Desktop nav links ── */
  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              active ? "bg-yellow-400 text-black" : P.linkBase
            }`}>
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  /* ── Theme toggle ── */
  const ThemeToggle = ({ compact = false }) => (
    <button onClick={toggle}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${P.toggleBg}`}>
      {isLight
        ? <Moon size={18} className="text-indigo-500" />
        : <Sun  size={18} className="text-yellow-400" />}
      {!compact && (isLight ? "Dark Mode" : "Light Mode")}
      <span className={`${compact ? "" : "ml-auto"} text-[10px] font-bold px-2 py-0.5 rounded-full ${P.badge}`}>
        {isLight ? "LIGHT" : "OFF"}
      </span>
    </button>
  );

  return (
    <>
      {/* ════════════════════════════════════
          DESKTOP SIDEBAR (lg+)
      ════════════════════════════════════ */}
      <aside className={`hidden lg:flex flex-col w-64 border-r min-h-screen fixed left-0 top-0 z-30 transition-colors duration-200 ${P.sidebar}`}>
        <div className={`px-6 py-5 border-b ${P.divider}`}>
          <div className="flex items-center gap-2">
            <Dumbbell size={20} className="text-yellow-400" />
            <span className={`font-black tracking-widest uppercase text-lg ${P.text}`}>
              Centrum<span className="text-yellow-400">Gym</span>
            </span>
          </div>
          <p className={`text-xs mt-1 tracking-wider uppercase ${P.sub}`}>Admin Panel</p>
        </div>

        <NavLinks />

        <div className={`px-3 pb-5 border-t ${P.divider} pt-4 space-y-1`}>
          <ThemeToggle />
          <Link href="/" target="_blank"
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${P.linkBase}`}>
            <Globe size={18} /> Home Page
          </Link>
          <button onClick={logout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${P.logoutBase}`}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════
          MOBILE — Top header strip
      ════════════════════════════════════ */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-40 border-b px-4 py-3 flex items-center justify-between transition-colors duration-200 ${P.bottomBar}`}>
        <div className="flex items-center gap-2">
          <Dumbbell size={18} className="text-yellow-400" />
          <span className={`font-black tracking-widest uppercase text-sm ${P.text}`}>
            Centrum<span className="text-yellow-400">Gym</span>
          </span>
        </div>
        {/* Theme icon in header */}
        <button onClick={toggle}
          className={`p-2 rounded-xl transition-colors ${P.toggleBg}`}>
          {isLight
            ? <Moon size={17} className="text-indigo-500" />
            : <Sun  size={17} className="text-yellow-400" />}
        </button>
      </div>

      {/* ════════════════════════════════════
          MOBILE — Bottom Tab Bar
      ════════════════════════════════════ */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t transition-colors duration-200 ${P.bottomBar}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-stretch">
          {BOTTOM_NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all relative ${
                  active ? P.tabActive : P.tabInactive
                }`}>
                {active && (
                  <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full ${isLight ? "bg-[#e07030]" : "bg-yellow-400"}`} />
                )}
                <div className={`p-1.5 rounded-xl transition-colors ${active ? P.tabActiveBg : ""}`}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                </div>
                <span className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}>{label}</span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setSheetOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all ${
              sheetOpen ? P.tabActive : P.tabInactive
            }`}>
            <div className={`p-1.5 rounded-xl transition-colors ${sheetOpen ? P.tabActiveBg : ""}`}>
              <MoreHorizontal size={20} strokeWidth={1.8} />
            </div>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════
          MOBILE — Bottom Sheet (More)
      ════════════════════════════════════ */}
      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)} />

          {/* Sheet panel */}
          <div className={`relative rounded-t-3xl shadow-2xl transition-colors duration-200 ${P.sheet}`}
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 72px)" }}>

            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className={`w-10 h-1 rounded-full ${isLight ? "bg-[#f0c8a8]" : "bg-zinc-700"}`} />
            </div>

            {/* Sheet header */}
            <div className={`flex items-center justify-between px-5 py-3 border-b ${P.divider}`}>
              <span className={`font-bold text-sm ${P.text}`}>Menu</span>
              <button onClick={() => setSheetOpen(false)} className={P.closeBtn}>
                <X size={18} />
              </button>
            </div>

            {/* Secondary nav items */}
            <div className="px-4 py-3 grid grid-cols-2 gap-2">
              {NAV.filter((n) => !BOTTOM_NAV.some((b) => b.href === n.href)).map(({ label, href, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href}
                    onClick={() => setSheetOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all ${
                      active ? P.sheetActive : P.sheetItem
                    }`}>
                    <Icon size={17} />
                    {label}
                    {active && <ChevronRight size={13} className="ml-auto opacity-60" />}
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className={`mx-4 border-t ${P.divider}`} />

            {/* Bottom actions */}
            <div className="px-4 py-3 space-y-1">
              <ThemeToggle />
              <Link href="/" target="_blank"
                onClick={() => setSheetOpen(false)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all ${P.sheetItem}`}>
                <Globe size={17} /> Home Page
              </Link>
              <button onClick={logout}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all ${P.logoutBase}`}>
                <LogOut size={17} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
