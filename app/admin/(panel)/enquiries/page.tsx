"use client";
import { API } from "@/lib/api";

import { useEffect, useState } from "react";
import { Search, Trash2, ChevronLeft, ChevronRight, X, Phone, Mail, MessageSquare, Bot } from "lucide-react";
import { useDialog } from "@/components/admin/Dialog";

interface Enquiry {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  status: "new" | "contacted" | "closed";
  note?: string;
  source?: "walk-in" | "online" | "referral" | "chatbot" | "other";
  createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  new: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  contacted: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  closed: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
};

export default function EnquiriesPage() {
  const { dialog, show } = useDialog();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  function authHeader() {
    return { Authorization: `Bearer ${localStorage.getItem("adminToken")}`, "Content-Type": "application/json" };
  }

  async function fetchEnquiries() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (search) params.set("search", search);
    if (filterStatus) params.set("status", filterStatus);
    const res = await fetch(`${API}/api/enquiries?${params}`, { headers: authHeader() });
    const data = await res.json() as { enquiries: Enquiry[]; total: number; pages: number };
    setEnquiries(data.enquiries ?? []);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    setLoading(false);
  }

  useEffect(() => { fetchEnquiries(); }, [page, search, filterStatus]);

  async function updateStatus(id: string, status: string, noteText?: string) {
    setUpdatingId(id);
    const res = await fetch(`${API}/api/enquiries/${id}/status`, {
      method: "PATCH",
      headers: authHeader(),
      body: JSON.stringify({ status, note: noteText }),
    });
    const updated = await res.json() as Enquiry;
    setEnquiries((prev) => prev.map((e) => (e._id === id ? updated : e)));
    if (selected?._id === id) setSelected(updated);
    setUpdatingId(null);
  }

  async function deleteEnquiry(id: string) {
    if (!await show({ type: "confirm-delete", title: "Delete Enquiry", message: "This enquiry will be permanently deleted." })) return;
    await fetch(`${API}/api/enquiries/${id}`, { method: "DELETE", headers: authHeader() });
    if (selected?._id === id) setSelected(null);
    fetchEnquiries();
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="space-y-6">
      {dialog}
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Enquiries</h1>
          <p className="text-zinc-500 text-sm mt-1">{total} total enquiries</p>
        </div>
        {/* Status summary */}
        <div className="flex gap-2 flex-wrap">
          {["new", "contacted", "closed"].map((s) => (
            <button key={s}
              onClick={() => { setFilterStatus(filterStatus === s ? "" : s); setPage(1); }}
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold capitalize transition-all ${filterStatus === s ? STATUS_STYLE[s] : "text-zinc-500 border-zinc-700 hover:border-zinc-500"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search name, phone, email…"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400" />
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : enquiries.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">No enquiries found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-4">Person</th>
                  <th className="text-left px-5 py-4 hidden md:table-cell">Message</th>
                  <th className="text-left px-5 py-4">Status</th>
                  <th className="text-left px-5 py-4 hidden lg:table-cell">Received</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {enquiries.map((e) => (
                  <tr key={e._id} onClick={() => { setSelected(e); setNote(e.note ?? ""); }}
                    className="hover:bg-zinc-800/50 cursor-pointer transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">{e.name}</p>
                        {e.source === "chatbot" && (
                          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full font-semibold">
                            <Bot size={9} />AI
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-500 text-xs">{e.phone}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-zinc-400 text-xs max-w-xs truncate">{e.message}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold capitalize ${STATUS_STYLE[e.status]}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-500 text-xs hidden lg:table-cell">{timeAgo(e.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-center" onClick={(ev) => ev.stopPropagation()}>
                        {e.status === "new" && (
                          <button onClick={() => updateStatus(e._id, "contacted")}
                            disabled={updatingId === e._id}
                            className="text-xs text-yellow-400 hover:text-yellow-300 border border-yellow-400/30 hover:border-yellow-400/60 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50">
                            Mark Contacted
                          </button>
                        )}
                        {e.status === "contacted" && (
                          <button onClick={() => updateStatus(e._id, "closed")}
                            disabled={updatingId === e._id}
                            className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50">
                            Close
                          </button>
                        )}
                        <button onClick={() => deleteEnquiry(e._id)}
                          className="text-zinc-600 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Enquiry Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <aside className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-lg font-bold text-white">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Contact info */}
              <div className="space-y-3">
                <a href={`tel:${selected.phone}`}
                  className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors">
                  <Phone size={15} className="text-yellow-400" /> {selected.phone}
                </a>
                {selected.email && (
                  <a href={`mailto:${selected.email}`}
                    className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors">
                    <Mail size={15} className="text-yellow-400" /> {selected.email}
                  </a>
                )}
              </div>

              {/* Message */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MessageSquare size={13} /> Message
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-800 rounded-xl p-4">{selected.message}</p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold capitalize ${STATUS_STYLE[selected.status]}`}>
                  {selected.status}
                </span>
                <span className="text-zinc-600 text-xs">{timeAgo(selected.createdAt)}</span>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Admin Note</label>
                <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note about this enquiry…"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400 resize-none" />
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {selected.status === "new" && (
                  <button onClick={() => updateStatus(selected._id, "contacted", note)}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl text-sm uppercase tracking-wider transition-colors">
                    Mark as Contacted
                  </button>
                )}
                {selected.status === "contacted" && (
                  <button onClick={() => updateStatus(selected._id, "closed", note)}
                    className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-xl text-sm uppercase tracking-wider transition-colors">
                    Close Enquiry
                  </button>
                )}
                {note !== selected.note && (
                  <button onClick={() => updateStatus(selected._id, selected.status, note)}
                    className="w-full border border-yellow-400/40 hover:border-yellow-400 text-yellow-400 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                    Save Note
                  </button>
                )}
                <button onClick={() => deleteEnquiry(selected._id)}
                  className="w-full border border-red-500/30 hover:border-red-500/60 text-red-400 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  Delete Enquiry
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
