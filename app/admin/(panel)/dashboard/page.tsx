"use client";
import { API } from "@/lib/api";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, UserCheck, UserX, MessageSquare, IndianRupee,
  AlertTriangle, TrendingUp, ClipboardCheck, PersonStanding,
  UserSearch, Cake, CreditCard, ArrowRight,
  Banknote, Smartphone, Building2, Send,
  HardHat, Dumbbell,
} from "lucide-react";

interface Stats {
  members:    { total: number; active: number; expired: number; paused: number; expiringThisWeek: number };
  enquiries:  { total: number; new: number };
  revenue:    { thisMonth: number; total: number; expenses: number };
  planBreakdown: { _id: string; count: number }[];
  attendance: { members: number; trainers: number };
  trainers:   { total: number; active: number };
  walkIns:    { pending: number };
  dues:       { count: number; total: number };
  chart6:     { label: string; total: number }[];
  recentMembers:     { _id: string; name: string; phone: string; plan: string; status: string; joiningDate: string }[];
  expiringMembers:   { _id: string; name: string; phone: string; plan: string; endDate: string }[];
  upcomingBirthdays: { _id: string; name: string; phone: string; plan: string; dateOfBirth: string; thisYearBday: string }[];
  recentTransactions: { _id: string; name: string; plan: string; feeHistory: { amount: number; date: string; method: string } }[];
}

const PLAN_COLORS: Record<string, string> = {
  basic: "bg-zinc-500", standard: "bg-blue-500", premium: "bg-yellow-400", yearly: "bg-green-500",
};
const PLAN_TEXT: Record<string, string> = {
  basic: "text-zinc-400", standard: "text-blue-400", premium: "text-yellow-400", yearly: "text-green-400",
};
function MethodIcon({ method, ...props }: { method?: string; size: number; className: string }) {
  if (method === "upi")  return <Smartphone {...props} />;
  if (method === "card") return <CreditCard {...props} />;
  if (method === "bank") return <Building2 {...props} />;
  return <Banknote {...props} />;
}

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }
function daysLeft(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
function initials(name: string) { return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase(); }

export default function DashboardPage() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    fetch(`${API}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
      .then((r) => { if (!r.ok) throw new Error("auth"); return r.json(); })
      .then((d: Stats) => { if (!d?.members) throw new Error("bad"); setStats(d); })
      .catch(() => setError("Failed to load. Make sure backend is running."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return <p className="text-red-400 p-4">{error}</p>;
  if (!stats) return null;

  const profit = stats.revenue.thisMonth - stats.revenue.expenses;
  const chart6Max = Math.max(...stats.chart6.map(c => c.total), 1);

  /* Plan bar widths */
  const planTotal = stats.planBreakdown.reduce((s, p) => s + p.count, 0) || 1;

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* ── Row 1: Key Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Members",    value: stats.members.active,        sub: `${stats.members.total} total`,      icon: UserCheck,      color: "text-green-400",  bg: "bg-green-400/10",  href: "/admin/members" },
          { label: "Revenue This Month", value: fmt(stats.revenue.thisMonth), sub: `${fmt(stats.revenue.expenses)} expenses`, icon: IndianRupee, color: "text-yellow-400", bg: "bg-yellow-400/10", href: "/admin/finance" },
          { label: "Today's Attendance", value: stats.attendance.members,    sub: `${stats.attendance.trainers} trainers in`, icon: ClipboardCheck, color: "text-blue-400",   bg: "bg-blue-400/10",  href: "/admin/attendance" },
          { label: "Pending Dues",       value: fmt(stats.dues.total),       sub: `${stats.dues.count} members`,       icon: AlertTriangle,  color: "text-orange-400", bg: "bg-orange-400/10", href: "/admin/finance" },
        ].map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all group">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={19} className={color} />
            </div>
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-zinc-600 text-xs mt-1">{sub}</p>
          </Link>
        ))}
      </div>

      {/* ── Row 2: Secondary Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Expiring This Week", value: stats.members.expiringThisWeek, icon: AlertTriangle, color: "text-red-400",    bg: "bg-red-400/10",    href: "/admin/members" },
          { label: "Walk-in Pending",    value: stats.walkIns.pending,          icon: UserSearch,    color: "text-purple-400", bg: "bg-purple-400/10", href: "/admin/walk-ins" },
          { label: "Expired Plans",      value: stats.members.expired,          icon: UserX,         color: "text-zinc-400",   bg: "bg-zinc-800",      href: "/admin/members" },
          { label: "New Enquiries",      value: stats.enquiries.new,            icon: MessageSquare, color: "text-cyan-400",   bg: "bg-cyan-400/10",   href: "/admin/enquiries" },
        ].map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={16} className={color} />
            </div>
            <div>
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-zinc-500 text-xs">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Row 3: Chart + Plan Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-Month Revenue Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2"><TrendingUp size={14} className="text-green-400" />Revenue — Last 6 Months</h2>
            <p className="text-xs text-zinc-500">Profit this month: <span className={profit >= 0 ? "text-green-400 font-bold" : "text-red-400 font-bold"}>{fmt(profit)}</span></p>
          </div>
          <div className="flex items-end gap-2 h-36">
            {stats.chart6.map((c) => (
              <div key={c.label} className="flex-1 flex flex-col items-center gap-1.5 group">
                <p className="text-xs text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{fmt(c.total)}</p>
                <div className="w-full bg-zinc-800 rounded-t-lg overflow-hidden" style={{ height: "100px" }}>
                  <div
                    className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg transition-all mt-auto"
                    style={{ height: `${Math.max((c.total / chart6Max) * 100, c.total > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <p className="text-zinc-500 text-[11px]">{c.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4"><Users size={14} className="text-blue-400" />Active by Plan</h2>
          {stats.planBreakdown.length === 0 ? (
            <p className="text-zinc-600 text-sm">No active members</p>
          ) : (
            <div className="space-y-3">
              {stats.planBreakdown.map((p) => {
                const pct = Math.round((p.count / planTotal) * 100);
                return (
                  <div key={p._id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-semibold capitalize ${PLAN_TEXT[p._id] ?? "text-zinc-300"}`}>{p._id}</span>
                      <span className="text-xs text-zinc-500">{p.count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${PLAN_COLORS[p._id] ?? "bg-zinc-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              <p className="text-zinc-600 text-xs pt-1">{stats.members.active} active members total</p>
            </div>
          )}

          {/* Quick trainers stat */}
          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-400/10 rounded-xl flex items-center justify-center">
              <PersonStanding size={14} className="text-purple-400" />
            </div>
            <div>
              <p className="text-white font-bold">{stats.trainers.active} <span className="text-zinc-500 font-normal text-xs">active trainers</span></p>
              <p className="text-zinc-600 text-xs">{stats.trainers.total} total · {stats.attendance.trainers} in today</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Alerts + Birthdays ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Expiring Soon */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={13} className="text-orange-400" />Expiring This Week
            </h2>
            <Link href="/admin/members" className="text-xs text-zinc-500 hover:text-yellow-400 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {stats.expiringMembers.length === 0 ? (
            <div className="py-8 text-center text-zinc-600 text-sm">No members expiring this week</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {stats.expiringMembers.map((m) => {
                const d = daysLeft(m.endDate);
                return (
                  <div key={m._id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-400/10 flex items-center justify-center shrink-0">
                      <span className="text-orange-400 font-black text-xs">{initials(m.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{m.name}</p>
                      <p className="text-zinc-500 text-xs capitalize">{m.plan} · {m.phone}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${d <= 2 ? "text-red-400 bg-red-400/10" : "text-orange-400 bg-orange-400/10"}`}>
                      {d === 0 ? "Today" : d === 1 ? "Tomorrow" : `${d}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Birthdays */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cake size={13} className="text-pink-400" />Upcoming Birthdays
            </h2>
          </div>
          {stats.upcomingBirthdays.length === 0 ? (
            <div className="py-8 text-center text-zinc-600 text-sm">No birthdays in next 7 days</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {stats.upcomingBirthdays.map((m) => {
                const d = daysLeft(m.thisYearBday);
                return (
                  <div key={m._id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-xl bg-pink-400/10 flex items-center justify-center shrink-0">
                      <span className="text-pink-400 font-black text-xs">{initials(m.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{m.name}</p>
                      <p className="text-zinc-500 text-xs capitalize">{m.plan} · {fmtDate(m.dateOfBirth)}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${d === 0 ? "text-pink-400 bg-pink-400/10 animate-pulse" : "text-zinc-400 bg-zinc-800"}`}>
                      {d === 0 ? <><Cake size={11} /> Today!</> : `in ${d}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 5: Recent Members + Transactions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Members */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2"><Users size={13} className="text-yellow-400" />New Joinings</h2>
            <Link href="/admin/members" className="text-xs text-zinc-500 hover:text-yellow-400 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {stats.recentMembers.length === 0 ? (
            <div className="py-8 text-center text-zinc-600 text-sm">No members yet</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {stats.recentMembers.map((m) => (
                <div key={m._id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0">
                    <span className="text-yellow-400 font-black text-xs">{initials(m.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{m.name}</p>
                    <p className="text-zinc-500 text-xs">{m.phone} · <span className="capitalize">{m.plan}</span></p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize
                    ${m.status === "active" ? "text-green-400 bg-green-400/10" : m.status === "expired" ? "text-red-400 bg-red-400/10" : "text-zinc-400 bg-zinc-800"}`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2"><CreditCard size={13} className="text-green-400" />Recent Payments</h2>
            <Link href="/admin/finance" className="text-xs text-zinc-500 hover:text-yellow-400 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {stats.recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-zinc-600 text-sm">No transactions yet</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {stats.recentTransactions.map((t, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                    <MethodIcon method={t.feeHistory?.method} size={14} className="text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-zinc-500 text-xs capitalize">{t.plan} · {fmtDate(t.feeHistory?.date)}</p>
                  </div>
                  <span className="text-green-400 font-bold text-sm">{fmt(t.feeHistory?.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Quick Access</h2>
        <div className="flex flex-wrap gap-2">
          {([
            { label: "Add Member",      href: "/admin/members",      Icon: Users },
            { label: "Mark Attendance", href: "/admin/attendance",   Icon: ClipboardCheck },
            { label: "Walk-ins",        href: "/admin/walk-ins",     Icon: UserSearch },
            { label: "Bulk Message",    href: "/admin/bulk-message", Icon: Send },
            { label: "Finance",         href: "/admin/finance",      Icon: IndianRupee },
            { label: "Staff Salary",    href: "/admin/staff",        Icon: HardHat },
            { label: "Trainers",        href: "/admin/trainers",     Icon: Dumbbell },
          ] as { label: string; href: string; Icon: React.ElementType }[]).map(({ label, href, Icon }) => (
            <Link key={label} href={href}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-xl text-sm text-zinc-300 hover:text-white transition-all">
              <Icon size={14} />{label}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
