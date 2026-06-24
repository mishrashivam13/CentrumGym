"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  LogOut,
  Dumbbell,
  X,
  Menu,
  Globe,
  UserSearch,
  ClipboardCheck,
  PersonStanding,
  Send,
  TrendingUp,
  Briefcase,
} from "lucide-react";
import { useState } from "react";

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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function logout() {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  }

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              active
                ? "bg-yellow-400 text-black"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 min-h-screen fixed left-0 top-0 z-30">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Dumbbell size={20} className="text-yellow-400" />
            <span className="text-white font-black tracking-widest uppercase text-lg">
              Centrum<span className="text-yellow-400">Gym</span>
            </span>
          </div>
          <p className="text-zinc-600 text-xs mt-1 tracking-wider uppercase">Admin Panel</p>
        </div>

        <NavLinks />

        {/* Bottom actions */}
        <div className="px-3 pb-5 border-t border-zinc-800 pt-4 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
          >
            <Globe size={18} />
            Home Page
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-900 border-b border-zinc-800 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell size={18} className="text-yellow-400" />
          <span className="text-white font-black tracking-widest uppercase">
            Centrum<span className="text-yellow-400">Gym</span>
          </span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-zinc-400 hover:text-white">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-white font-black tracking-widest uppercase">
                Centrum<span className="text-yellow-400">Gym</span>
              </span>
              <button onClick={() => setMobileOpen(false)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <NavLinks />
            <div className="px-3 pb-5 border-t border-zinc-800 pt-4 space-y-1">
              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
              >
                <Globe size={18} />
                Home Page
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
