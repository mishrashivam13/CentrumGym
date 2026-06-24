"use client";
import { API } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, X, Trash2, ChevronLeft, ChevronRight, Eye, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useDialog } from "@/components/admin/Dialog";
import RenewModal from "@/components/admin/RenewModal";

interface Member {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  plan: string;
  planPrice: number;
  endDate: string;
  status: string;
  height?: number;
  weight?: number;
  fitnessGoal?: string;
  feeHistory: { amount: number }[];
}

const STATUS_COLOR: Record<string, string> = {
  active:  "text-green-400 bg-green-400/10 border-green-400/20",
  expired: "text-red-400 bg-red-400/10 border-red-400/20",
  paused:  "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
};

const PLAN_DURATIONS: Record<string, number> = { basic: 1, standard: 3, premium: 6, yearly: 12 };
const PLAN_DEFAULT_PRICE: Record<string, number> = { basic: 1000, standard: 2500, premium: 4500, yearly: 8000 };

function daysBetween(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function MembersPage() {
  const router = useRouter();
  const { dialog, show } = useDialog();
  const [renewTarget, setRenewTarget] = useState<{ id: string; name: string; plan: string; endDate: string } | null>(null);
  const [members, setMembers]       = useState<Member[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [pages, setPages]           = useState(1);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlan, setFilterPlan]     = useState("");
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "", phone: "", email: "", address: "",
    plan: "basic", planPrice: "",
    amountPaid: "",
    startDate: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
  });

  function authHeader() {
    return { Authorization: `Bearer ${localStorage.getItem("adminToken")}`, "Content-Type": "application/json" };
  }

  async function fetchMembers() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (search)       params.set("search", search);
    if (filterStatus) params.set("status", filterStatus);
    if (filterPlan)   params.set("plan", filterPlan);
    const res  = await fetch(`${API}/api/members?${params}`, { headers: authHeader() });
    const data = await res.json() as { members: Member[]; total: number; pages: number };
    const safe = (data.members ?? []).map((m) => ({ ...m, feeHistory: m.feeHistory ?? [] }));
    setMembers(safe);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    setLoading(false);
  }

  useEffect(() => { fetchMembers(); }, [page, search, filterStatus, filterPlan]);

  function computeEndDate(start: string, plan: string) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + (PLAN_DURATIONS[plan] ?? 1));
    return d.toISOString().split("T")[0];
  }

  async function handleAddSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setSubmitting(true);
    const endDate = computeEndDate(addForm.startDate, addForm.plan);
    const res = await fetch(`${API}/api/members`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({ ...addForm, planPrice: Number(addForm.planPrice), amountPaid: Number(addForm.amountPaid), endDate }),
    });
    const created = await res.json() as { _id: string };
    setShowModal(false);
    setSubmitting(false);
    setAddForm({ name: "", phone: "", email: "", address: "", plan: "basic", planPrice: "", amountPaid: "", startDate: new Date().toISOString().split("T")[0], paymentMethod: "cash" });
    // redirect to detail page → profile tab auto-opens via hash
    router.push(`/admin/members/${created._id}`);
  }

  async function deleteMember(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const ok = await show({ type: "confirm-delete", title: "Delete Member", message: "This will permanently delete the member and all their data. This action cannot be undone." });
    if (!ok) return;
    await fetch(`${API}/api/members/${id}`, { method: "DELETE", headers: authHeader() });
    fetchMembers();
  }

  return (
    <div className="space-y-6">
      {dialog}
      {renewTarget && (
        <RenewModal
          memberId={renewTarget.id}
          memberName={renewTarget.name}
          currentPlan={renewTarget.plan}
          currentEndDate={renewTarget.endDate}
          onClose={() => setRenewTarget(null)}
          onSuccess={() => { setRenewTarget(null); fetchMembers(); }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Members</h1>
          <p className="text-zinc-500 text-sm mt-1">{total} total members</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, phone, email…"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400" />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="paused">Paused</option>
        </select>
        <select value={filterPlan} onChange={(e) => { setFilterPlan(e.target.value); setPage(1); }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400">
          <option value="">All Plans</option>
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">No members found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-4">Name</th>
                  <th className="text-left px-5 py-4 hidden md:table-cell">Phone</th>
                  <th className="text-left px-5 py-4">Plan</th>
                  <th className="text-left px-5 py-4">Status</th>
                  <th className="text-left px-5 py-4 hidden lg:table-cell">Expires</th>
                  <th className="text-left px-5 py-4 hidden lg:table-cell">Paid</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {members.map((m) => {
                  const days = daysBetween(m.endDate);
                  const totalPaid = m.feeHistory.reduce((s, f) => s + f.amount, 0);
                  const hasProfile = !!(m.height || m.weight || m.fitnessGoal);
                  return (
                    <tr key={m._id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-semibold">{m.name}</p>
                          {!hasProfile && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full">
                              Profile pending
                            </span>
                          )}
                        </div>
                        {m.email && <p className="text-zinc-500 text-xs">{m.email}</p>}
                      </td>
                      <td className="px-5 py-4 text-zinc-400 hidden md:table-cell">{m.phone}</td>
                      <td className="px-5 py-4 capitalize text-white font-medium">{m.plan}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold capitalize ${STATUS_COLOR[m.status] ?? ""}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="text-zinc-300 text-xs">{new Date(m.endDate).toLocaleDateString("en-IN")}</p>
                        {days >= 0 && days <= 7 && m.status === "active" && (
                          <p className="text-orange-400 text-xs">{days}d left</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-green-400 font-semibold hidden lg:table-cell">
                        ₹{totalPaid.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {(m.status === "expired" || (m.status === "active" && days >= 0 && days <= 7)) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setRenewTarget({ id: m._id, name: m.name, plan: m.plan, endDate: m.endDate }); }}
                              title="Renew Membership"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-green-400 hover:bg-green-400/10 transition-all"
                            >
                              <RefreshCw size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/admin/members/${m._id}`)}
                            title="View Details"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={(e) => deleteMember(e, m._id)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

      {/* ── Add Member Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <div>
                <h2 className="text-lg font-bold text-white">Add New Member</h2>
                <p className="text-zinc-500 text-xs mt-0.5">Basic info — fitness profile on the next page</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {[
                { label: "Full Name *",  key: "name",    type: "text",  required: true,  placeholder: "Rahul Sharma" },
                { label: "Phone *",      key: "phone",   type: "tel",   required: true,  placeholder: "9876543210" },
                { label: "Email",        key: "email",   type: "email", required: false, placeholder: "rahul@email.com" },
                { label: "Address",      key: "address", type: "text",  required: false, placeholder: "Jaipur, Rajasthan" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                  <input type={f.type} required={f.required} placeholder={f.placeholder}
                    value={(addForm as Record<string, string>)[f.key]}
                    onChange={(e) => setAddForm({ ...addForm, [f.key]: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400" />
                </div>
              ))}
              {/* Plan + Plan Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Plan *</label>
                  <select required value={addForm.plan}
                    onChange={(e) => {
                      const plan = e.target.value;
                      const price = String(PLAN_DEFAULT_PRICE[plan] ?? "");
                      setAddForm((f) => ({ ...f, plan, planPrice: price, amountPaid: price }));
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400">
                    <option value="basic">Basic (1 Month)</option>
                    <option value="standard">Standard (3 Months)</option>
                    <option value="premium">Premium (6 Months)</option>
                    <option value="yearly">Yearly (12 Months)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Plan Price (₹) *</label>
                  <input type="number" required placeholder="1000" value={addForm.planPrice}
                    onChange={(e) => setAddForm((f) => ({ ...f, planPrice: e.target.value, amountPaid: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400" />
                </div>
              </div>

              {/* Payment quick buttons */}
              {addForm.planPrice && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Payment Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button"
                      onClick={() => setAddForm((f) => ({ ...f, amountPaid: f.planPrice }))}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all
                        ${addForm.amountPaid === addForm.planPrice && addForm.amountPaid !== ""
                          ? "bg-green-400 border-green-400 text-black"
                          : "border-zinc-700 text-zinc-400 hover:border-green-400/50 hover:text-green-400"}`}>
                      <CheckCircle size={14} /> Full Payment
                    </button>
                    <button type="button"
                      onClick={() => setAddForm((f) => ({ ...f, amountPaid: "0" }))}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all
                        ${addForm.amountPaid === "0"
                          ? "bg-orange-400 border-orange-400 text-black"
                          : "border-zinc-700 text-zinc-400 hover:border-orange-400/50 hover:text-orange-400"}`}>
                      <AlertCircle size={14} /> Mark as Due
                    </button>
                  </div>

                  {/* Amount Paid input */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Amount Paid Now (₹)
                    </label>
                    <input type="number" min="0" max={addForm.planPrice} value={addForm.amountPaid}
                      onChange={(e) => setAddForm((f) => ({ ...f, amountPaid: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400" />
                  </div>

                  {/* Due summary */}
                  {(() => {
                    const price = Number(addForm.planPrice) || 0;
                    const paid  = Number(addForm.amountPaid) || 0;
                    const due   = price - paid;
                    return due > 0 ? (
                      <div className="flex items-center justify-between px-4 py-2.5 bg-orange-400/10 border border-orange-400/20 rounded-xl">
                        <span className="text-orange-400 text-sm font-semibold flex items-center gap-1.5">
                          <AlertCircle size={13} /> Due Amount
                        </span>
                        <span className="text-white font-black">₹{due.toLocaleString("en-IN")}</span>
                      </div>
                    ) : due === 0 && price > 0 ? (
                      <div className="flex items-center justify-between px-4 py-2.5 bg-green-400/10 border border-green-400/20 rounded-xl">
                        <span className="text-green-400 text-sm font-semibold flex items-center gap-1.5">
                          <CheckCircle size={13} /> Fully Paid
                        </span>
                        <span className="text-green-400 font-black">₹{price.toLocaleString("en-IN")}</span>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Start Date *</label>
                  <input type="date" required value={addForm.startDate}
                    onChange={(e) => setAddForm({ ...addForm, startDate: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Payment Method</label>
                  <select value={addForm.paymentMethod} onChange={(e) => setAddForm({ ...addForm, paymentMethod: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400">
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              </div>
              {addForm.startDate && addForm.plan && (
                <p className="text-xs text-zinc-500">
                  Plan ends: <span className="text-yellow-400 font-semibold">
                    {new Date(computeEndDate(addForm.startDate, addForm.plan)).toLocaleDateString("en-IN")}
                  </span>
                </p>
              )}
              <button type="submit" disabled={submitting}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold py-3 rounded-xl text-sm uppercase tracking-wider transition-colors">
                {submitting ? "Adding…" : "Add Member & Fill Profile →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
