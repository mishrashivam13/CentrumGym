import { API } from "@/lib/api";
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, X, Search, Trash2, UserCheck, ChevronLeft, ChevronRight,
  Phone, Clock, Zap, Calendar, HelpCircle, ArrowRight,
} from "lucide-react";
import { useDialog } from "@/components/admin/Dialog";

interface VisitEnquiry {
  _id: string;
  name: string;
  phone: string;
  intent: "immediate" | "1-2days" | "this-week" | "undecided";
  status: "pending" | "followed-up" | "converted" | "lost";
  note?: string;
  createdAt: string;
}

const INTENT_CONFIG = {
  immediate:  { label: "Immediate",   icon: Zap,         color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20" },
  "1-2days":  { label: "1–2 Days",    icon: Clock,       color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  "this-week":{ label: "This Week",   icon: Calendar,    color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20" },
  undecided:  { label: "Undecided",   icon: HelpCircle,  color: "text-zinc-400",   bg: "bg-zinc-700/50 border-zinc-700" },
};

const STATUS_CONFIG = {
  pending:     { label: "Pending",     color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  "followed-up":{ label: "Followed Up", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  converted:   { label: "Converted",   color: "text-green-400 bg-green-400/10 border-green-400/20" },
  lost:        { label: "Lost",        color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

const PLAN_DURATIONS: Record<string, number> = { basic: 1, standard: 3, premium: 6, yearly: 12 };

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function WalkInsPage() {
  const router = useRouter();
  const { dialog, show } = useDialog();
  const [visits, setVisits]           = useState<VisitEnquiry[]>([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [pages, setPages]             = useState(1);
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterIntent, setFilterIntent] = useState("");
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<VisitEnquiry | null>(null);
  const [noteText, setNoteText]       = useState("");

  /* Add form */
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", phone: "", intent: "undecided", note: "" });
  const [submitting, setSubmitting] = useState(false);

  /* Convert modal */
  const [showConvert, setShowConvert] = useState(false);
  const [convertForm, setConvertForm] = useState({
    plan: "basic", planPrice: "", paymentMethod: "cash",
    startDate: new Date().toISOString().split("T")[0], email: "", address: "",
  });
  const [converting, setConverting] = useState(false);

  function authH() {
    return { Authorization: `Bearer ${localStorage.getItem("adminToken")}`, "Content-Type": "application/json" };
  }

  async function fetchVisits() {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), limit: "15" });
    if (search)       p.set("search", search);
    if (filterStatus) p.set("status", filterStatus);
    if (filterIntent) p.set("intent", filterIntent);
    const res  = await fetch(`${API}/api/visit-enquiries?${p}`, { headers: authH() });
    const data = await res.json() as { enquiries: VisitEnquiry[]; total: number; pages: number };
    setVisits(data.enquiries ?? []);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    setLoading(false);
  }

  useEffect(() => { fetchVisits(); }, [page, search, filterStatus, filterIntent]);

  async function handleAdd(e: { preventDefault(): void }) {
    e.preventDefault();
    setSubmitting(true);
    await fetch(`${API}/api/visit-enquiries`, {
      method: "POST", headers: authH(),
      body: JSON.stringify(addForm),
    });
    setShowAdd(false);
    setAddForm({ name: "", phone: "", intent: "undecided", note: "" });
    setSubmitting(false);
    fetchVisits();
  }

  async function updateStatus(id: string, status: string, note?: string) {
    const res = await fetch(`${API}/api/visit-enquiries/${id}`, {
      method: "PATCH", headers: authH(),
      body: JSON.stringify({ status, note }),
    });
    const updated = await res.json() as VisitEnquiry;
    setVisits((prev) => prev.map((v) => (v._id === id ? updated : v)));
    if (selected?._id === id) setSelected(updated);
  }

  async function deleteVisit(id: string) {
    if (!await show({ type: "confirm-delete", title: "Delete Walk-in Record", message: "This walk-in record will be permanently deleted." })) return;
    await fetch(`${API}/api/visit-enquiries/${id}`, { method: "DELETE", headers: authH() });
    if (selected?._id === id) setSelected(null);
    fetchVisits();
  }

  function computeEndDate(start: string, plan: string) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + (PLAN_DURATIONS[plan] ?? 1));
    return d.toISOString().split("T")[0];
  }

  async function handleConvert(e: { preventDefault(): void }) {
    if (!selected) return;
    e.preventDefault();
    setConverting(true);
    const endDate = computeEndDate(convertForm.startDate, convertForm.plan);
    const res = await fetch(`${API}/api/visit-enquiries/${selected._id}/convert`, {
      method: "POST", headers: authH(),
      body: JSON.stringify({ ...convertForm, planPrice: Number(convertForm.planPrice), endDate }),
    });
    const { member } = await res.json() as { member: { _id: string } };
    setConverting(false);
    setShowConvert(false);
    setSelected(null);
    fetchVisits();
    router.push(`/admin/members/${member._id}`);
  }

  const counts = {
    pending:    visits.filter((v) => v.status === "pending").length,
    followedUp: visits.filter((v) => v.status === "followed-up").length,
  };

  return (
    <div className="space-y-6">
      {dialog}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Walk-in Visits</h1>
          <p className="text-zinc-500 text-sm mt-1">{total} total walk-ins · {counts.pending} pending follow-up</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Plus size={16} /> Add Walk-in
        </button>
      </div>

      {/* Intent quick-filter chips */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(INTENT_CONFIG) as [string, typeof INTENT_CONFIG.immediate][]).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const active = filterIntent === key;
          return (
            <button key={key}
              onClick={() => { setFilterIntent(active ? "" : key); setPage(1); }}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold transition-all
                ${active ? cfg.bg + " " + cfg.color : "text-zinc-500 border-zinc-700 hover:border-zinc-500"}`}>
              <Icon size={12} />{cfg.label}
            </button>
          );
        })}
        <div className="h-6 w-px bg-zinc-800 self-center mx-1" />
        {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG.pending][]).map(([key, cfg]) => (
          <button key={key}
            onClick={() => { setFilterStatus(filterStatus === key ? "" : key); setPage(1); }}
            className={`text-xs px-3 py-1.5 rounded-full border font-semibold capitalize transition-all
              ${filterStatus === key ? cfg.color : "text-zinc-500 border-zinc-700 hover:border-zinc-500"}`}>
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search name or phone…"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400" />
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visits.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">No walk-in records found</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {visits.map((v) => {
              const intent = INTENT_CONFIG[v.intent];
              const status = STATUS_CONFIG[v.status];
              const IntentIcon = intent.icon;
              return (
                <div key={v._id}
                  onClick={() => { setSelected(v); setNoteText(v.note ?? ""); }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/40 cursor-pointer transition-colors group">

                  {/* Intent badge */}
                  <div className={`shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border font-semibold ${intent.bg} ${intent.color}`}>
                    <IntentIcon size={11} />{intent.label}
                  </div>

                  {/* Name + phone */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold">{v.name}</p>
                    <p className="text-zinc-500 text-xs flex items-center gap-1"><Phone size={10} />{v.phone}</p>
                  </div>

                  {/* Status */}
                  <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full border font-semibold hidden sm:inline-flex ${status.color}`}>
                    {status.label}
                  </span>

                  {/* Time */}
                  <span className="shrink-0 text-zinc-600 text-xs hidden md:block">{timeAgo(v.createdAt)}</span>

                  {/* Delete */}
                  <button onClick={(e) => { e.stopPropagation(); deleteVisit(v._id); }}
                    className="shrink-0 p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-40 hover:border-zinc-600 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button disabled={page === pages} onClick={() => setPage(page + 1)}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-40 hover:border-zinc-600 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Add Walk-in Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowAdd(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white">Add Walk-in Visit</h2>
              <button onClick={() => setShowAdd(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input required placeholder="Rahul Sharma" value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Phone *</label>
                <input required placeholder="9876543210" value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Planning to Join</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(INTENT_CONFIG) as [string, typeof INTENT_CONFIG.immediate][]).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const active = addForm.intent === key;
                    return (
                      <button type="button" key={key}
                        onClick={() => setAddForm({ ...addForm, intent: key })}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all
                          ${active ? `${cfg.bg} ${cfg.color} border-current` : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                        <Icon size={14} />{cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Note (optional)</label>
                <textarea rows={2} placeholder="Any additional info…" value={addForm.note}
                  onChange={(e) => setAddForm({ ...addForm, note: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400 resize-none" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold py-3 rounded-xl text-sm uppercase tracking-wider transition-colors">
                {submitting ? "Saving…" : "Save Walk-in"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {selected && !showConvert && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <aside className="relative w-full max-w-sm bg-zinc-900 border-l border-zinc-800 h-full overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <div>
                <h2 className="text-lg font-bold text-white">{selected.name}</h2>
                <p className="text-zinc-500 text-xs flex items-center gap-1 mt-0.5"><Phone size={10} />{selected.phone}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-5 flex-1">
              {/* Intent + Status */}
              <div className="flex gap-2 flex-wrap">
                {(() => { const cfg = INTENT_CONFIG[selected.intent]; const Icon = cfg.icon;
                  return <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold ${cfg.bg} ${cfg.color}`}><Icon size={11} />{cfg.label}</span>;
                })()}
                <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${STATUS_CONFIG[selected.status].color}`}>
                  {STATUS_CONFIG[selected.status].label}
                </span>
                <span className="text-zinc-600 text-xs self-center">{timeAgo(selected.createdAt)}</span>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Note</label>
                <textarea rows={3} value={noteText} onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note…"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400 resize-none" />
                {noteText !== (selected.note ?? "") && (
                  <button onClick={() => updateStatus(selected._id, selected.status, noteText)}
                    className="mt-2 w-full border border-yellow-400/40 hover:border-yellow-400 text-yellow-400 font-semibold py-2 rounded-xl text-sm transition-colors">
                    Save Note
                  </button>
                )}
              </div>

              {/* Status actions */}
              <div className="space-y-2">
                {selected.status === "pending" && (
                  <button onClick={() => updateStatus(selected._id, "followed-up")}
                    className="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                    Mark as Followed Up
                  </button>
                )}
                {selected.status !== "converted" && selected.status !== "lost" && (
                  <button onClick={() => updateStatus(selected._id, "lost")}
                    className="w-full border border-red-500/20 hover:border-red-500/40 text-red-400 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                    Mark as Lost
                  </button>
                )}
              </div>
            </div>

            {/* Convert to Member CTA */}
            {selected.status !== "converted" && (
              <div className="p-6 border-t border-zinc-800">
                <button onClick={() => setShowConvert(true)}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider transition-colors shadow-lg shadow-yellow-400/10">
                  <UserCheck size={16} /> Convert to Member
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ── Convert to Member Modal ── */}
      {showConvert && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowConvert(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <div>
                <h2 className="text-lg font-bold text-white">Convert to Member</h2>
                <p className="text-zinc-500 text-xs mt-0.5">{selected.name} · {selected.phone}</p>
              </div>
              <button onClick={() => setShowConvert(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleConvert} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email (optional)</label>
                <input type="email" placeholder="rahul@email.com" value={convertForm.email}
                  onChange={(e) => setConvertForm({ ...convertForm, email: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Address (optional)</label>
                <input placeholder="Jaipur, Rajasthan" value={convertForm.address}
                  onChange={(e) => setConvertForm({ ...convertForm, address: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Plan *</label>
                  <select required value={convertForm.plan} onChange={(e) => setConvertForm({ ...convertForm, plan: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400">
                    <option value="basic">Basic (1 Month)</option>
                    <option value="standard">Standard (3 Months)</option>
                    <option value="premium">Premium (6 Months)</option>
                    <option value="yearly">Yearly (12 Months)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Amount (₹) *</label>
                  <input type="number" required placeholder="1500" value={convertForm.planPrice}
                    onChange={(e) => setConvertForm({ ...convertForm, planPrice: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Start Date *</label>
                  <input type="date" required value={convertForm.startDate}
                    onChange={(e) => setConvertForm({ ...convertForm, startDate: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Payment Method</label>
                  <select value={convertForm.paymentMethod} onChange={(e) => setConvertForm({ ...convertForm, paymentMethod: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400">
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              </div>
              {convertForm.startDate && (
                <p className="text-xs text-zinc-500">
                  Plan ends: <span className="text-yellow-400 font-semibold">
                    {new Date((() => { const d = new Date(convertForm.startDate); d.setMonth(d.getMonth() + (PLAN_DURATIONS[convertForm.plan] ?? 1)); return d; })()).toLocaleDateString("en-IN")}
                  </span>
                </p>
              )}
              <button type="submit" disabled={converting}
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider transition-colors">
                <UserCheck size={16} />
                {converting ? "Creating Member…" : "Create Member & Go to Profile →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
