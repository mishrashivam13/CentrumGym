"use client";
import { API } from "@/lib/api";

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, AlertCircle,
  Plus, Trash2, ChevronLeft, ChevronRight, X,
  CreditCard, Receipt, PieChart, Users,
} from "lucide-react";
import { useDialog } from "@/components/admin/Dialog";

/* ── Types ── */
interface MonthData { month: number; total: number; basic: number; standard: number; premium: number; yearly: number; count: number; }
interface ExpMonth  { month: number; total: number; }
interface RevSummary { year: number; months: MonthData[]; expByMonth: ExpMonth[]; yearTotal: number; yearCount: number; yearExpenses: number; yearProfit: number; }
interface DueMember { _id: string; name: string; phone: string; plan: string; planPrice: number; paid: number; due: number; status: string; }
interface DueRes    { dues: DueMember[]; total: number; totalDue: number; }
interface Expense   { _id: string; category: string; amount: number; date: string; description?: string; paidTo?: string; }
interface ExpBreakdown { breakdown: { _id: string; total: number; count: number }[]; list: Expense[]; grandTotal: number; }
interface Transaction { memberId: string; name: string; phone: string; plan: string; amount: number; date: string; method: string; note?: string; }

/* ── Constants ── */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CAT_LABELS: Record<string, string> = {
  rent: "Rent", electricity: "Electricity", water: "Water", equipment: "Equipment",
  maintenance: "Maintenance", staff_salary: "Staff Salary", marketing: "Marketing",
  supplements: "Supplements", cleaning: "Cleaning", other: "Other",
};
const CAT_COLORS: Record<string, string> = {
  rent: "bg-red-400", electricity: "bg-yellow-400", water: "bg-blue-400",
  equipment: "bg-purple-400", maintenance: "bg-orange-400", staff_salary: "bg-green-400",
  marketing: "bg-pink-400", supplements: "bg-cyan-400", cleaning: "bg-indigo-400", other: "bg-zinc-400",
};

const PLAN_COLORS: Record<string, string> = {
  basic: "bg-zinc-400", standard: "bg-blue-400", premium: "bg-yellow-400", yearly: "bg-green-400",
};

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

export default function FinancePage() {
  const { dialog, show } = useDialog();
  const [tab, setTab] = useState<"overview" | "expenses" | "dues" | "transactions">("overview");
  const [year, setYear] = useState(new Date().getFullYear());
  const [rev, setRev]   = useState<RevSummary | null>(null);
  const [dues, setDues] = useState<DueRes | null>(null);
  const [expData, setExpData] = useState<ExpBreakdown | null>(null);
  const [txns, setTxns]   = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  /* Add expense modal */
  const [showAdd, setShowAdd] = useState(false);
  const [expForm, setExpForm] = useState({ category: "rent", amount: "", date: new Date().toISOString().split("T")[0], description: "", paidTo: "" });
  const [submitting, setSubmitting] = useState(false);

  function authH() {
    return { Authorization: `Bearer ${localStorage.getItem("adminToken")}`, "Content-Type": "application/json" };
  }

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [rRes, dRes, eRes, tRes] = await Promise.all([
      fetch(`${API}/api/finance/revenue?year=${year}`, { headers: authH() }),
      fetch(`${API}/api/finance/dues`,                 { headers: authH() }),
      fetch(`${API}/api/finance/expenses?year=${year}`,{ headers: authH() }),
      fetch(`${API}/api/finance/transactions?limit=30`,{ headers: authH() }),
    ]);
    const [rD, dD, eD, tD] = await Promise.all([rRes.json(), dRes.json(), eRes.json(), tRes.json()]);
    setRev(rD as RevSummary);
    setDues(dD as DueRes);
    setExpData(eD as ExpBreakdown);
    setTxns(tD as Transaction[]);
    setLoading(false);
  }, [year]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function addExpense(e: { preventDefault(): void }) {
    e.preventDefault();
    setSubmitting(true);
    await fetch(`${API}/api/finance/expenses`, {
      method: "POST", headers: authH(),
      body: JSON.stringify({ ...expForm, amount: Number(expForm.amount) }),
    });
    setShowAdd(false);
    setExpForm({ category: "rent", amount: "", date: new Date().toISOString().split("T")[0], description: "", paidTo: "" });
    setSubmitting(false);
    fetchAll();
  }

  async function delExpense(id: string) {
    if (!await show({ type: "confirm-delete", title: "Delete Expense", message: "This expense record will be permanently deleted." })) return;
    await fetch(`${API}/api/finance/expenses/${id}`, { method: "DELETE", headers: authH() });
    fetchAll();
  }

  if (loading) return (
    <div className="flex items-center justify-center h-60">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  /* Bar chart max */
  const maxBar = rev ? Math.max(...rev.months.map((m) => m.total + (rev.expByMonth[m.month - 1]?.total ?? 0)), 1) : 1;

  return (
    <div className="space-y-6 pb-10">
      {dialog}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 bg-green-400/10 rounded-xl flex items-center justify-center">
              <TrendingUp size={18} className="text-green-400" />
            </div>
            Revenue & Finance
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Financial overview of Centrum Gym</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear(y => y - 1)} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"><ChevronLeft size={16} /></button>
          <span className="text-white font-bold text-lg px-2">{year}</span>
          <button onClick={() => setYear(y => y + 1)} disabled={year >= new Date().getFullYear()}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",  value: fmt(rev?.yearTotal ?? 0),    icon: TrendingUp,   color: "text-green-400 bg-green-400/10" },
          { label: "Total Expenses", value: fmt(rev?.yearExpenses ?? 0), icon: TrendingDown, color: "text-red-400 bg-red-400/10" },
          { label: "Net Profit",     value: fmt(rev?.yearProfit ?? 0),   icon: DollarSign,   color: (rev?.yearProfit ?? 0) >= 0 ? "text-yellow-400 bg-yellow-400/10" : "text-red-400 bg-red-400/10" },
          { label: "Pending Dues",   value: fmt(dues?.totalDue ?? 0),    icon: AlertCircle,  color: "text-orange-400 bg-orange-400/10" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={17} />
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-zinc-500 text-xs mt-1">{label} · {year}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 overflow-x-auto">
        {([
          { key: "overview",     label: "Overview",     icon: TrendingUp },
          { key: "expenses",     label: "Expenses",     icon: Receipt },
          { key: "dues",         label: `Dues (${dues?.total ?? 0})`, icon: AlertCircle },
          { key: "transactions", label: "Transactions", icon: CreditCard },
        ] as { key: typeof tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
              ${tab === key ? "bg-yellow-400 text-black" : "text-zinc-500 hover:text-white hover:bg-zinc-800"}`}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && rev && (
        <div className="space-y-6">
          {/* Monthly bar chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-5">Monthly Revenue vs Expenses</h2>
            <div className="flex items-end gap-1.5 h-48">
              {rev.months.map((m, i) => {
                const expTotal = rev.expByMonth[i]?.total ?? 0;
                const revH  = (m.total / maxBar) * 100;
                const expH  = (expTotal / maxBar) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex items-end gap-0.5 h-40 justify-center">
                      {/* Revenue bar */}
                      <div className="relative flex-1 bg-green-400/20 rounded-t-lg transition-all group-hover:bg-green-400/30"
                        style={{ height: `${Math.max(revH, 2)}%` }}>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap z-10">
                          Rev: {fmt(m.total)}
                        </div>
                      </div>
                      {/* Expense bar */}
                      {expTotal > 0 && (
                        <div className="relative flex-1 bg-red-400/20 rounded-t-lg transition-all group-hover:bg-red-400/30"
                          style={{ height: `${Math.max(expH, 2)}%` }}>
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-red-300 whitespace-nowrap z-10">
                            Exp: {fmt(expTotal)}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-zinc-600 text-[10px]">{MONTHS[i]}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-400/40 inline-block" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400/40 inline-block" />Expenses</span>
            </div>
          </div>

          {/* Monthly table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-800/40">
              <h2 className="text-sm font-semibold text-white">Month-wise Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {["Month","Collections","Payments","Basic","Standard","Premium","Yearly","Expenses","Profit"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {rev.months.map((m, i) => {
                    const exp    = rev.expByMonth[i]?.total ?? 0;
                    const profit = m.total - exp;
                    return (
                      <tr key={m.month} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white">{MONTHS[i]}</td>
                        <td className="px-4 py-3 text-green-400 font-bold">{m.total > 0 ? fmt(m.total) : <span className="text-zinc-700">—</span>}</td>
                        <td className="px-4 py-3 text-zinc-400">{m.count > 0 ? m.count : <span className="text-zinc-700">—</span>}</td>
                        <td className="px-4 py-3 text-zinc-400">{m.basic > 0 ? fmt(m.basic) : "—"}</td>
                        <td className="px-4 py-3 text-zinc-400">{m.standard > 0 ? fmt(m.standard) : "—"}</td>
                        <td className="px-4 py-3 text-zinc-400">{m.premium > 0 ? fmt(m.premium) : "—"}</td>
                        <td className="px-4 py-3 text-zinc-400">{m.yearly > 0 ? fmt(m.yearly) : "—"}</td>
                        <td className="px-4 py-3 text-red-400">{exp > 0 ? fmt(exp) : "—"}</td>
                        <td className={`px-4 py-3 font-bold ${profit >= 0 ? "text-yellow-400" : "text-red-400"}`}>
                          {m.total > 0 || exp > 0 ? fmt(profit) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-zinc-700 bg-zinc-800/50">
                    <td className="px-4 py-3 font-black text-white">Total</td>
                    <td className="px-4 py-3 font-black text-green-400">{fmt(rev.yearTotal)}</td>
                    <td className="px-4 py-3 font-black text-zinc-300">{rev.yearCount}</td>
                    <td colSpan={4} />
                    <td className="px-4 py-3 font-black text-red-400">{fmt(rev.yearExpenses)}</td>
                    <td className={`px-4 py-3 font-black ${rev.yearProfit >= 0 ? "text-yellow-400" : "text-red-400"}`}>{fmt(rev.yearProfit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPENSES TAB ── */}
      {tab === "expenses" && expData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-zinc-500 text-sm">Total: <span className="text-white font-bold">{fmt(expData.grandTotal)}</span></p>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded-xl text-sm transition-colors">
              <Plus size={14} /> Add Expense
            </button>
          </div>

          {/* Category breakdown */}
          {expData.breakdown.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2"><PieChart size={13} />By Category</h2>
              <div className="space-y-3">
                {expData.breakdown.map((b) => {
                  const pct = expData.grandTotal > 0 ? (b.total / expData.grandTotal) * 100 : 0;
                  return (
                    <div key={b._id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${CAT_COLORS[b._id] ?? "bg-zinc-400"}`} />
                          <span className="text-sm text-zinc-300">{CAT_LABELS[b._id] ?? b._id}</span>
                          <span className="text-xs text-zinc-600">({b.count})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-semibold text-sm">{fmt(b.total)}</span>
                          <span className="text-zinc-600 text-xs ml-2">{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${CAT_COLORS[b._id] ?? "bg-zinc-400"} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expense list */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-800/40">
              <h2 className="text-sm font-semibold text-white">All Expenses · {year}</h2>
            </div>
            {expData.list.length === 0 ? (
              <div className="py-12 text-center text-zinc-600">No expenses recorded for {year}</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {expData.list.map((e) => (
                  <div key={e._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/30 transition-colors group">
                    <div className={`w-2 h-8 rounded-full shrink-0 ${CAT_COLORS[e.category] ?? "bg-zinc-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{CAT_LABELS[e.category] ?? e.category}</p>
                      <p className="text-zinc-500 text-xs">{e.description ?? ""} {e.paidTo ? `· Paid to: ${e.paidTo}` : ""}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-red-400 font-bold">{fmt(e.amount)}</p>
                      <p className="text-zinc-600 text-xs">{fmtDate(e.date)}</p>
                    </div>
                    <button onClick={() => delExpense(e._id)}
                      className="shrink-0 p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DUES TAB ── */}
      {tab === "dues" && dues && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-orange-400 mb-1"><Users size={14} /><span className="text-xs uppercase tracking-wider font-semibold">Members with dues</span></div>
              <p className="text-3xl font-black text-white">{dues.total}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-red-400 mb-1"><AlertCircle size={14} /><span className="text-xs uppercase tracking-wider font-semibold">Total pending</span></div>
              <p className="text-3xl font-black text-white">{fmt(dues.totalDue)}</p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-800/40">
              <h2 className="text-sm font-semibold text-white">Members with Pending Dues</h2>
            </div>
            {dues.dues.length === 0 ? (
              <div className="py-12 text-center text-green-400 text-sm font-semibold">All dues are clear!</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {dues.dues.map((m) => (
                  <div key={m._id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center shrink-0">
                      <span className="text-orange-400 font-black text-sm">{m.name.split(" ").map((w: string) => w[0]).slice(0,2).join("").toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{m.name}</p>
                      <p className="text-zinc-500 text-xs">{m.phone} · <span className="capitalize">{m.plan}</span></p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-green-400 text-xs">Paid: {fmt(m.paid)}</p>
                      <p className="text-red-400 font-bold text-sm">Due: {fmt(m.due)}</p>
                      <p className="text-zinc-600 text-xs">Plan: {fmt(m.planPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TRANSACTIONS TAB ── */}
      {tab === "transactions" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-800/40">
            <h2 className="text-sm font-semibold text-white">Recent Transactions (Last 30)</h2>
          </div>
          {txns.length === 0 ? (
            <div className="py-12 text-center text-zinc-600">No transactions found</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {txns.map((t, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/30 transition-colors">
                  <div className={`w-2 h-8 rounded-full shrink-0 ${PLAN_COLORS[t.plan] ?? "bg-zinc-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-zinc-500 text-xs">{t.phone} · <span className="capitalize">{t.plan}</span> · <span className="uppercase">{t.method}</span></p>
                    {t.note && <p className="text-zinc-600 text-xs">{t.note}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-green-400 font-bold">{fmt(t.amount)}</p>
                    <p className="text-zinc-600 text-xs">{fmtDate(t.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Add Expense Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/75" onClick={() => setShowAdd(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white">Add Expense</h2>
              <button onClick={() => setShowAdd(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={addExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Category *</label>
                <select required value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400">
                  {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Amount (₹) *</label>
                <input required type="number" min="1" value={expForm.amount}
                  onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                  placeholder="e.g. 15000"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Date</label>
                <input type="date" value={expForm.date} onChange={(e) => setExpForm({ ...expForm, date: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Description</label>
                <input value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  placeholder="e.g. Monthly rent for gym space"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Paid To</label>
                <input value={expForm.paidTo} onChange={(e) => setExpForm({ ...expForm, paidTo: e.target.value })}
                  placeholder="e.g. Landlord name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold py-3 rounded-xl text-sm uppercase tracking-wider transition-colors">
                {submitting ? "Adding…" : "Add Expense"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
