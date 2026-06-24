"use client";
import { API } from "@/lib/api";

import { useEffect, useState, useCallback } from "react";
import {
  Users, IndianRupee, CheckCircle, Clock, AlertCircle,
  ChevronLeft, ChevronRight, RefreshCw, X, Edit3, History,
} from "lucide-react";
import { useDialog } from "@/components/admin/Dialog";

/* ── Types ── */
interface TrainerRef { _id: string; name: string; phone: string; specialization?: string; imageUrl?: string; salary?: number; }
interface SalaryRecord {
  _id: string;
  trainerId: TrainerRef;
  month: number; year: number;
  baseSalary: number; workingDays: number; presentDays: number;
  calculatedAmount: number; bonus: number; deduction: number;
  netPayable: number; paidAmount: number;
  status: "paid" | "partial" | "unpaid";
  paidDate?: string; note?: string;
}
interface Summary {
  totalPayable: number; totalPaid: number; totalPending: number;
  count: number; paid: number; unpaid: number; partial: number;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }
function fmtDate(d?: string) { return d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—"; }

const STATUS_STYLE: Record<string, string> = {
  paid:    "text-green-400 bg-green-400/10 border-green-400/20",
  partial: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  unpaid:  "text-red-400 bg-red-400/10 border-red-400/20",
};
const STATUS_ICON: Record<string, React.ElementType> = { paid: CheckCircle, partial: Clock, unpaid: AlertCircle };

export default function StaffPage() {
  const { dialog, show } = useDialog();
  const now = new Date();
  const [month, setMonth]       = useState(now.getMonth() + 1);
  const [year, setYear]         = useState(now.getFullYear());
  const [records, setRecords]   = useState<SalaryRecord[]>([]);
  const [summary, setSummary]   = useState<Summary | null>(null);
  const [loading, setLoading]   = useState(true);
  const [generating, setGen]    = useState(false);

  /* Edit modal */
  const [editing, setEditing]   = useState<SalaryRecord | null>(null);
  const [editForm, setEditForm] = useState({ paidAmount: "", bonus: "", deduction: "", note: "", paidDate: "" });
  const [saving, setSaving]     = useState(false);

  /* History drawer */
  const [histTrainer, setHistTrainer] = useState<TrainerRef | null>(null);
  const [history, setHistory]         = useState<SalaryRecord[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  function authH() {
    return { Authorization: `Bearer ${localStorage.getItem("adminToken")}`, "Content-Type": "application/json" };
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [rRes, sRes] = await Promise.all([
      fetch(`${API}/api/salary/monthly?month=${month}&year=${year}`, { headers: authH() }),
      fetch(`${API}/api/salary/summary?month=${month}&year=${year}`, { headers: authH() }),
    ]);
    setRecords((await rRes.json()) as SalaryRecord[]);
    setSummary((await sRes.json()) as Summary);
    setLoading(false);
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  async function generate() {
    setGen(true);
    const res = await fetch(`${API}/api/salary/generate`, {
      method: "POST", headers: authH(),
      body: JSON.stringify({ month, year }),
    });
    const d = await res.json() as { generated: number };
    setGen(false);
    if (d.generated === 0) show({ type: "alert-warn", title: "No Salary Generated", message: "No active trainers with salary set. Add base salary to trainer profiles first." });
    else fetchData();
  }

  function openEdit(r: SalaryRecord) {
    setEditing(r);
    setEditForm({
      paidAmount: String(r.paidAmount),
      bonus:      String(r.bonus),
      deduction:  String(r.deduction),
      note:       r.note ?? "",
      paidDate:   r.paidDate ? new Date(r.paidDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    });
  }

  async function saveEdit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    await fetch(`${API}/api/salary/${editing._id}`, {
      method: "PATCH", headers: authH(),
      body: JSON.stringify({
        paidAmount: Number(editForm.paidAmount),
        bonus:      Number(editForm.bonus),
        deduction:  Number(editForm.deduction),
        note:       editForm.note,
        paidDate:   editForm.paidDate,
      }),
    });
    setSaving(false);
    setEditing(null);
    fetchData();
  }

  async function openHistory(trainer: TrainerRef) {
    setHistTrainer(trainer);
    setHistLoading(true);
    const res = await fetch(`${API}/api/salary/trainer/${trainer._id}`, { headers: authH() });
    setHistory((await res.json()) as SalaryRecord[]);
    setHistLoading(false);
  }

  const attendancePct = (r: SalaryRecord) =>
    r.workingDays > 0 ? Math.round((r.presentDays / r.workingDays) * 100) : 0;

  return (
    <div className="space-y-6 pb-10">
      {dialog}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-400/10 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-blue-400" />
            </div>
            Staff Management
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Trainer salary tracking & payroll</p>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <div className="text-center min-w-[130px]">
            <p className="text-white font-bold">{MONTHS[month - 1]}</p>
            <p className="text-zinc-500 text-xs">{year}</p>
          </div>
          <button onClick={nextMonth} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Payable",  value: fmt(summary.totalPayable), color: "text-white" },
            { label: "Total Paid",     value: fmt(summary.totalPaid),    color: "text-green-400" },
            { label: "Pending",        value: fmt(summary.totalPending), color: "text-orange-400" },
            { label: "Staff",          value: `${summary.paid}/${summary.count} paid`, color: "text-blue-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-zinc-500 text-xs mt-1">{label} · {MONTHS[month-1]} {year}</p>
            </div>
          ))}
        </div>
      )}

      {/* Generate / Refresh button */}
      <div className="flex items-center gap-3">
        <button onClick={generate} disabled={generating}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
          <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
          {generating ? "Calculating…" : records.length > 0 ? "Refresh Salary Data" : "Generate Salary Sheet"}
        </button>
        {records.length === 0 && !loading && (
          <p className="text-zinc-600 text-sm">Click to calculate salary from attendance records</p>
        )}
      </div>

      {/* Salary records */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl py-16 text-center">
          <IndianRupee size={32} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 font-semibold">No salary data for {MONTHS[month - 1]} {year}</p>
          <p className="text-zinc-600 text-sm mt-1">Click "Generate Salary Sheet" to calculate from attendance</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r) => {
            const t        = r.trainerId;
            const pct      = attendancePct(r);
            const StatusIcon = STATUS_ICON[r.status];
            return (
              <div key={r._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                {/* Top row */}
                <div className="flex items-center gap-4 px-5 py-4 border-b border-zinc-800">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
                    {t.imageUrl
                      ? <img src={`${API}${t.imageUrl}`} alt="" className="w-full h-full object-cover object-top" />
                      : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-xs font-black text-white">{t.name.split(" ").map((w) => w[0]).slice(0,2).join("")}</span>
                        </div>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold">{t.name}</p>
                    <p className="text-zinc-500 text-xs">{t.specialization ?? "Trainer"} · {t.phone}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${STATUS_STYLE[r.status]}`}>
                      <StatusIcon size={11} />
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                    <button onClick={() => openHistory(t)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors" title="Salary History">
                      <History size={14} />
                    </button>
                    <button onClick={() => openEdit(r)}
                      className="p-2 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 transition-colors" title="Edit">
                      <Edit3 size={14} />
                    </button>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y divide-zinc-800">
                  {[
                    { label: "Base Salary",   value: fmt(r.baseSalary),        sub: "monthly" },
                    { label: "Attendance",    value: `${r.presentDays}/${r.workingDays} days`, sub: `${pct}% present` },
                    { label: "Calculated",    value: fmt(r.calculatedAmount),  sub: `${pct}% of base` },
                    { label: "Net Payable",   value: fmt(r.netPayable),         sub: r.bonus > 0 || r.deduction > 0 ? `+${fmt(r.bonus)} bonus / -${fmt(r.deduction)} deduction` : "final amount" },
                  ].map(({ label, value, sub }) => (
                    <div key={label} className="px-5 py-3.5">
                      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-white font-bold text-sm">{value}</p>
                      <p className="text-zinc-600 text-xs">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Attendance bar */}
                <div className="px-5 py-3 bg-zinc-950/30 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 80 ? "bg-green-400" : pct >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-right shrink-0 text-xs">
                    {r.paidAmount > 0 && <span className="text-green-400 font-semibold">Paid: {fmt(r.paidAmount)} · </span>}
                    {r.paidDate && <span className="text-zinc-600">{fmtDate(r.paidDate)}</span>}
                    {r.note && <span className="text-zinc-600"> · {r.note}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edit / Pay Modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/75" onClick={() => setEditing(null)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white">Update Salary</h2>
                <p className="text-zinc-500 text-xs">{editing.trainerId.name} · {MONTHS[editing.month - 1]} {editing.year}</p>
              </div>
              <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={saveEdit} className="p-6 space-y-4">
              {/* Summary */}
              <div className="bg-zinc-800 rounded-xl p-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-zinc-500 text-xs">Calculated</p>
                  <p className="text-white font-bold">{fmt(editing.calculatedAmount)}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Attendance</p>
                  <p className="text-white font-bold">{editing.presentDays}/{editing.workingDays}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Base</p>
                  <p className="text-white font-bold">{fmt(editing.baseSalary)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Bonus (₹)</label>
                  <input type="number" min="0" value={editForm.bonus}
                    onChange={(e) => setEditForm({ ...editForm, bonus: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Deduction (₹)</label>
                  <input type="number" min="0" value={editForm.deduction}
                    onChange={(e) => setEditForm({ ...editForm, deduction: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
                </div>
              </div>

              {/* Net payable preview */}
              <div className="bg-blue-400/10 border border-blue-400/20 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-blue-400 text-sm font-semibold">Net Payable</span>
                <span className="text-white font-black text-lg">
                  {fmt(editing.calculatedAmount + Number(editForm.bonus || 0) - Number(editForm.deduction || 0))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Amount Paid (₹) *</label>
                <input required type="number" min="0" value={editForm.paidAmount}
                  onChange={(e) => setEditForm({ ...editForm, paidAmount: e.target.value })}
                  placeholder="Enter amount paid"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Payment Date</label>
                <input type="date" value={editForm.paidDate}
                  onChange={(e) => setEditForm({ ...editForm, paidDate: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Note</label>
                <input value={editForm.note} onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  placeholder="Optional note"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>

              {/* Quick pay full button */}
              <button type="button"
                onClick={() => setEditForm((f) => ({ ...f, paidAmount: String(editing.calculatedAmount + Number(f.bonus || 0) - Number(f.deduction || 0)) }))}
                className="w-full py-2 rounded-xl border border-green-400/30 text-green-400 text-sm font-semibold hover:bg-green-400/10 transition-colors">
                Pay Full Amount
              </button>

              <button type="submit" disabled={saving}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold py-3 rounded-xl text-sm uppercase tracking-wider transition-colors">
                {saving ? "Saving…" : "Save & Update"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── History Drawer ── */}
      {histTrainer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setHistTrainer(null)} />
          <div className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <div>
                <h2 className="text-lg font-bold text-white">{histTrainer.name}</h2>
                <p className="text-zinc-500 text-xs">Salary History</p>
              </div>
              <button onClick={() => setHistTrainer(null)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>

            {histLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="p-10 text-center text-zinc-600">No salary history</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {history.map((h) => {
                  const StatusIcon = STATUS_ICON[h.status];
                  return (
                    <div key={h._id} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white font-bold">{MONTHS[h.month - 1]} {h.year}</p>
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${STATUS_STYLE[h.status]}`}>
                          <StatusIcon size={10} />{h.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div><p className="text-zinc-600 text-xs">Present</p><p className="text-zinc-300">{h.presentDays}/{h.workingDays}</p></div>
                        <div><p className="text-zinc-600 text-xs">Calculated</p><p className="text-zinc-300">{fmt(h.calculatedAmount)}</p></div>
                        <div><p className="text-zinc-600 text-xs">Net Payable</p><p className="text-white font-semibold">{fmt(h.netPayable)}</p></div>
                        {h.bonus > 0 && <div><p className="text-zinc-600 text-xs">Bonus</p><p className="text-green-400">+{fmt(h.bonus)}</p></div>}
                        {h.deduction > 0 && <div><p className="text-zinc-600 text-xs">Deduction</p><p className="text-red-400">-{fmt(h.deduction)}</p></div>}
                        {h.paidAmount > 0 && <div><p className="text-zinc-600 text-xs">Paid</p><p className="text-green-400">{fmt(h.paidAmount)}</p></div>}
                      </div>
                      {h.paidDate && <p className="text-zinc-600 text-xs mt-2">Paid on {fmtDate(h.paidDate)}</p>}
                      {h.note && <p className="text-zinc-500 text-xs mt-1 italic">{h.note}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
