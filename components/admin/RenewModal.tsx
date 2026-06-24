"use client";
import { API } from "@/lib/api";

import { useState, useEffect } from "react";
import { X, RefreshCw, CheckCircle, AlertCircle, IndianRupee } from "lucide-react";

const PLAN_PRICES: Record<string, number> = {
  basic: 1000, standard: 2500, premium: 4500, yearly: 8000,
};

const DURATIONS = [
  { label: "1 Month",   months: 1 },
  { label: "3 Months",  months: 3 },
  { label: "6 Months",  months: 6 },
  { label: "12 Months", months: 12 },
];

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function toDateInput(d: Date) {
  return d.toISOString().split("T")[0];
}

interface Props {
  memberId: string;
  memberName: string;
  currentPlan: string;
  currentEndDate: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RenewModal({ memberId, memberName, currentPlan, currentEndDate, onClose, onSuccess }: Props) {
  const today     = new Date();
  const afterExp  = new Date(currentEndDate) > today ? new Date(currentEndDate) : today;

  const [plan,          setPlan]          = useState(currentPlan);
  const [planPrice,     setPlanPrice]     = useState(PLAN_PRICES[currentPlan] ?? 1000);
  const [duration,      setDuration]      = useState(1);
  const [startDate,     setStartDate]     = useState(toDateInput(afterExp));
  const [endDate,       setEndDate]       = useState(toDateInput(addMonths(afterExp, 1)));
  const [amountPaid,    setAmountPaid]    = useState(String(PLAN_PRICES[currentPlan] ?? 1000));
  const [payMethod,     setPayMethod]     = useState("cash");
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState("");

  /* Recalculate endDate whenever startDate or duration changes */
  useEffect(() => {
    const s = new Date(startDate);
    if (!isNaN(s.getTime())) setEndDate(toDateInput(addMonths(s, duration)));
  }, [startDate, duration]);

  /* Auto-fill price when plan changes */
  function handlePlanChange(p: string) {
    setPlan(p);
    const price = PLAN_PRICES[p] ?? 1000;
    setPlanPrice(price);
    setAmountPaid(String(price));
  }

  const due = Math.max(0, planPrice - (Number(amountPaid) || 0));

  function authH() {
    const token = localStorage.getItem("gym_token");
    return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!startDate || !endDate) { setError("Please set start and end date"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/members/${memberId}/renew`, {
        method: "POST",
        headers: authH(),
        body: JSON.stringify({ plan, planPrice, startDate, endDate, amountPaid: Number(amountPaid), paymentMethod: payMethod }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.message ?? "Failed"); return; }
      onSuccess();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
              <RefreshCw size={17} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Renew Membership</h2>
              <p className="text-zinc-500 text-xs">{memberName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Plan */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Plan</label>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.keys(PLAN_PRICES).map((p) => (
                <button type="button" key={p} onClick={() => handlePlanChange(p)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${plan === p ? "bg-green-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Plan Price */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Plan Price (₹)</label>
            <div className="relative">
              <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="number" value={planPrice} onChange={(e) => setPlanPrice(Number(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 pl-8 pr-3 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Duration</label>
            <div className="grid grid-cols-4 gap-1.5">
              {DURATIONS.map((d) => (
                <button type="button" key={d.months} onClick={() => setDuration(d.months)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${duration === d.months ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start / End dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
          </div>

          {/* Amount Paid */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Amount Paid Now (₹)</label>
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={() => setAmountPaid(String(planPrice))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${Number(amountPaid) === planPrice ? "bg-green-500/20 border-green-500 text-green-400" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-green-600"}`}>
                <CheckCircle size={11} className="inline mr-1" />Full Payment
              </button>
              <button type="button" onClick={() => setAmountPaid("0")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${Number(amountPaid) === 0 ? "bg-orange-500/20 border-orange-500 text-orange-400" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-orange-600"}`}>
                <AlertCircle size={11} className="inline mr-1" />Mark as Due
              </button>
            </div>
            <div className="relative">
              <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 pl-8 pr-3 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
            {/* Due summary */}
            <div className={`mt-2 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${due > 0 ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"}`}>
              {due > 0 ? <AlertCircle size={12} /> : <CheckCircle size={12} />}
              {due > 0 ? `Due remaining: ₹${due.toLocaleString("en-IN")}` : "Fully paid — no dues"}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Payment Method</label>
            <div className="grid grid-cols-4 gap-1.5">
              {["cash", "upi", "card", "bank"].map((m) => (
                <button type="button" key={m} onClick={() => setPayMethod(m)}
                  className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${payMethod === m ? "bg-violet-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl font-bold text-sm bg-green-500 hover:bg-green-400 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <RefreshCw size={15} className={saving ? "animate-spin" : ""} />
            {saving ? "Renewing..." : "Renew Membership"}
          </button>
        </form>
      </div>
    </div>
  );
}
