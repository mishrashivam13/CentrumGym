"use client";
import { API } from "@/lib/api";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, X, Trash2, Phone, Mail, Edit3, LogIn, LogOut,
  CheckCircle, Clock, Calendar, Camera, Search,
} from "lucide-react";
import { useDialog } from "@/components/admin/Dialog";

interface Trainer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  specialization?: string;
  experience?: number;
  salary?: number;
  joiningDate: string;
  status: "active" | "inactive";
  imageUrl?: string;
  address?: string;
  note?: string;
}
interface TrainerRef { _id: string; name: string; phone: string; specialization?: string; imageUrl?: string; }
interface AttendanceRecord { _id: string; trainerId: TrainerRef; checkIn: string; checkOut?: string; date: string; }

const SPEC_COLORS: Record<string, string> = {
  "Weight Training": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  "Cardio":          "text-red-400 bg-red-400/10 border-red-400/20",
  "Yoga":            "text-purple-400 bg-purple-400/10 border-purple-400/20",
  "CrossFit":        "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "Zumba":           "text-pink-400 bg-pink-400/10 border-pink-400/20",
};

function fmtTime(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function duration(ci: string, co?: string) {
  if (!co) return null;
  const m = Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 60000);
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

const EMPTY_FORM = {
  name: "", phone: "", email: "", specialization: "",
  experience: "", salary: "", joiningDate: new Date().toISOString().split("T")[0],
  address: "", note: "", status: "active",
};

export default function TrainersPage() {
  const { dialog, show } = useDialog();
  const [tab, setTab]             = useState<"trainers" | "attendance">("trainers");
  const [trainers, setTrainers]   = useState<Trainer[]>([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Trainer | null>(null);

  /* Add / Edit modal */
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Trainer | null>(null);
  const [form, setForm]           = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* Attendance */
  const [todayAtt, setTodayAtt]   = useState<AttendanceRecord[]>([]);
  const [history, setHistory]     = useState<AttendanceRecord[]>([]);
  const [histTotal, setHistTotal] = useState(0);
  const [histPage, setHistPage]   = useState(1);
  const [histPages, setHistPages] = useState(1);
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo, setDateTo]       = useState("");
  const [attLoading, setAttLoading] = useState(false);
  const [busy, setBusy]           = useState<string | null>(null);

  function authH() {
    return { Authorization: `Bearer ${localStorage.getItem("adminToken")}` };
  }

  const fetchTrainers = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    const res  = await fetch(`${API}/api/trainers?${p}`, { headers: authH() });
    const data = await res.json() as Trainer[];
    setTrainers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search]);

  const fetchAttendance = useCallback(async () => {
    setAttLoading(true);
    const [tRes, hRes] = await Promise.all([
      fetch(`${API}/api/trainers/attendance/today`, { headers: authH() }),
      fetch(`${API}/api/trainers/attendance/history?page=${histPage}&limit=20${dateFrom ? `&from=${dateFrom}` : ""}${dateTo ? `&to=${dateTo}` : ""}`, { headers: authH() }),
    ]);
    const tData = await tRes.json() as AttendanceRecord[];
    const hData = await hRes.json() as { records: AttendanceRecord[]; total: number; pages: number };
    setTodayAtt(tData ?? []);
    setHistory(hData.records ?? []);
    setHistTotal(hData.total ?? 0);
    setHistPages(hData.pages ?? 1);
    setAttLoading(false);
  }, [histPage, dateFrom, dateTo]);

  useEffect(() => { fetchTrainers(); }, [fetchTrainers]);
  useEffect(() => { if (tab === "attendance") fetchAttendance(); }, [tab, fetchAttendance]);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  }

  function openEdit(t: Trainer) {
    setEditing(t);
    setForm({
      name: t.name, phone: t.phone, email: t.email ?? "",
      specialization: t.specialization ?? "", experience: t.experience ? String(t.experience) : "",
      salary: t.salary ? String(t.salary) : "", joiningDate: t.joiningDate?.split("T")[0] ?? "",
      address: t.address ?? "", note: t.note ?? "", status: t.status,
    });
    setImageFile(null);
    setImagePreview(t.imageUrl ? `${API}${t.imageUrl}` : null);
    setShowForm(true);
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (imageFile) fd.append("image", imageFile);

    const url    = editing ? `${API}/api/trainers/${editing._id}` : `${API}/api/trainers`;
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: authH(), body: fd });

    setShowForm(false);
    setEditing(null);
    setSubmitting(false);
    fetchTrainers();
  }

  async function deleteTrainer(id: string) {
    if (!await show({ type: "confirm-delete", title: "Delete Trainer", message: "This trainer and all their data will be permanently deleted." })) return;
    await fetch(`${API}/api/trainers/${id}`, { method: "DELETE", headers: authH() });
    if (selected?._id === id) setSelected(null);
    fetchTrainers();
  }

  async function checkIn(trainerId: string) {
    setBusy(trainerId);
    const res = await fetch(`${API}/api/trainers/attendance/check-in`, {
      method: "POST",
      headers: { ...authH(), "Content-Type": "application/json" },
      body: JSON.stringify({ trainerId }),
    });
    if (res.status === 409) { show({ type: "alert-warn", title: "Already Checked In", message: "This trainer has already been checked in today." }); }
    setBusy(null);
    fetchAttendance();
  }

  async function checkOut(recordId: string) {
    setBusy(recordId);
    await fetch(`${API}/api/trainers/attendance/${recordId}/check-out`, {
      method: "PATCH", headers: authH(),
    });
    setBusy(null);
    fetchAttendance();
  }

  async function deleteAtt(id: string) {
    if (!await show({ type: "confirm-delete", title: "Delete Record", message: "This attendance record will be permanently deleted." })) return;
    await fetch(`${API}/api/trainers/attendance/${id}`, { method: "DELETE", headers: authH() });
    fetchAttendance();
  }

  const todayMap = new Map(todayAtt.map((r) => [r.trainerId._id, r]));
  const activeTrainers = trainers.filter((t) => t.status === "active");

  return (
    <div className="space-y-6">
      {dialog}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Trainers</h1>
          <p className="text-zinc-500 text-sm mt-1">{trainers.length} total · {activeTrainers.length} active</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Plus size={16} /> Add Trainer
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5">
        {([
          { key: "trainers",   label: "All Trainers",  icon: Camera },
          { key: "attendance", label: "Attendance",     icon: Clock },
        ] as { key: "trainers"|"attendance"; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${tab === key ? "bg-yellow-400 text-black" : "text-zinc-500 hover:text-white hover:bg-zinc-800"}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* ── TRAINERS TAB ── */}
      {tab === "trainers" && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trainer…"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-7 h-7 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : trainers.length === 0 ? (
            <div className="text-center py-20 text-zinc-600">No trainers yet — add one!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {trainers.map((t) => {
                const specStyle = SPEC_COLORS[t.specialization ?? ""] ?? "text-zinc-400 bg-zinc-700/50 border-zinc-700";
                return (
                  <div key={t._id}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group">
                    {/* Image */}
                    <div className="relative h-48 bg-zinc-800">
                      {t.imageUrl ? (
                        <img src={`${API}${t.imageUrl}`} alt={t.name}
                          className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                            <span className="text-2xl font-black text-black">
                              {t.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                            </span>
                          </div>
                        </div>
                      )}
                      {/* Status dot */}
                      <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full border-2 border-zinc-900 ${t.status === "active" ? "bg-green-400" : "bg-zinc-500"}`} />
                      {/* Edit overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button onClick={() => openEdit(t)}
                          className="p-2 bg-yellow-400 rounded-xl text-black hover:bg-yellow-300 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => deleteTrainer(t._id)}
                          className="p-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-white font-bold text-base leading-tight">{t.name}</h3>
                        {t.specialization && (
                          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-semibold ${specStyle}`}>
                            {t.specialization}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5 text-sm text-zinc-500">
                        <p className="flex items-center gap-2"><Phone size={12} />{t.phone}</p>
                        {t.email && <p className="flex items-center gap-2"><Mail size={12} />{t.email}</p>}
                        {t.experience && <p className="flex items-center gap-2"><Clock size={12} />{t.experience} yrs experience</p>}
                        {t.salary && <p className="flex items-center gap-2 text-green-400 font-medium">₹{t.salary.toLocaleString("en-IN")}/mo</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ATTENDANCE TAB ── */}
      {tab === "attendance" && (
        <div className="space-y-6">
          {/* Mark attendance */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-800/40 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <LogIn size={14} className="text-yellow-400" /> Today's Attendance
              </h2>
              <p className="text-zinc-500 text-xs">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</p>
            </div>
            {attLoading ? (
              <div className="flex items-center justify-center h-24">
                <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activeTrainers.length === 0 ? (
              <div className="py-10 text-center text-zinc-600 text-sm">No active trainers</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {activeTrainers.map((t) => {
                  const rec    = todayMap.get(t._id);
                  const isBusy = busy === t._id || busy === rec?._id;
                  return (
                    <div key={t._id} className="flex items-center gap-4 px-5 py-3.5">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
                        {t.imageUrl
                          ? <img src={`${API}${t.imageUrl}`} alt={t.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                              <span className="text-xs font-black text-black">{t.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                            </div>
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{t.name}</p>
                        {t.specialization && <p className="text-zinc-500 text-xs">{t.specialization}</p>}
                      </div>

                      {rec && (
                        <div className="text-right shrink-0 hidden sm:block">
                          <p className="text-green-400 text-xs font-medium">{fmtTime(rec.checkIn)}</p>
                          {rec.checkOut && <p className="text-blue-400 text-xs">{fmtTime(rec.checkOut)}</p>}
                          {duration(rec.checkIn, rec.checkOut) && <p className="text-yellow-400 text-xs">{duration(rec.checkIn, rec.checkOut)}</p>}
                        </div>
                      )}

                      <div className="shrink-0">
                        {!rec ? (
                          <button onClick={() => checkIn(t._id)} disabled={!!isBusy}
                            className="flex items-center gap-1.5 text-xs bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold px-3 py-1.5 rounded-lg transition-colors">
                            <LogIn size={12} />{isBusy ? "…" : "Check In"}
                          </button>
                        ) : !rec.checkOut ? (
                          <button onClick={() => checkOut(rec._id)} disabled={!!isBusy}
                            className="flex items-center gap-1.5 text-xs bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold px-3 py-1.5 rounded-lg transition-colors">
                            <LogOut size={12} />{isBusy ? "…" : "Check Out"}
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-green-400 font-semibold px-3 py-1.5 bg-green-400/10 rounded-lg">
                            <CheckCircle size={11} /> Done
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* History */}
          <div className="space-y-3">
            <div className="flex gap-3 flex-wrap items-center">
              <h2 className="text-sm font-semibold text-zinc-400 flex items-center gap-2 uppercase tracking-wider"><Calendar size={13} />Attendance History</h2>
              <div className="flex items-center gap-2">
                <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setHistPage(1); }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-400" />
                <span className="text-zinc-600">—</span>
                <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setHistPage(1); }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-400" />
              </div>
              <span className="text-zinc-600 text-xs">{histTotal} records</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              {history.length === 0 ? (
                <div className="py-12 text-center text-zinc-600">No records</div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {history.map((r) => (
                    <div key={r._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/30 transition-colors group">
                      <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
                        {r.trainerId.imageUrl
                          ? <img src={`${API}${r.trainerId.imageUrl}`} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                              <span className="text-xs font-black text-black">{r.trainerId.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                            </div>
                        }
                      </div>
                      <div className="w-10 text-center shrink-0">
                        <p className="text-white font-bold text-sm">{new Date(r.date).getDate()}</p>
                        <p className="text-zinc-500 text-xs">{new Date(r.date).toLocaleDateString("en-IN", { month: "short" })}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{r.trainerId.name}</p>
                        {r.trainerId.specialization && <p className="text-zinc-500 text-xs">{r.trainerId.specialization}</p>}
                      </div>
                      <div className="text-right shrink-0 text-sm">
                        <p className="text-green-400 font-medium">{fmtTime(r.checkIn)} <span className="text-zinc-600 text-xs">in</span></p>
                        <p className={r.checkOut ? "text-blue-400 font-medium" : "text-zinc-600 text-xs"}>
                          {r.checkOut ? `${fmtTime(r.checkOut)} out` : "Still inside"}
                        </p>
                        {duration(r.checkIn, r.checkOut) && <p className="text-yellow-400 text-xs">{duration(r.checkIn, r.checkOut)}</p>}
                      </div>
                      <button onClick={() => deleteAtt(r._id)}
                        className="shrink-0 p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {histPages > 1 && (
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Page {histPage} of {histPages}</span>
                <div className="flex gap-2">
                  <button disabled={histPage === 1} onClick={() => setHistPage(histPage - 1)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-40 text-xs">Prev</button>
                  <button disabled={histPage === histPages} onClick={() => setHistPage(histPage + 1)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-40 text-xs">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/75" onClick={() => setShowForm(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-lg font-bold text-white">{editing ? "Edit Trainer" : "Add Trainer"}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image upload */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                  {imagePreview
                    ? <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-zinc-600"><Camera size={24} /></div>
                  }
                </div>
                <div>
                  <label className="cursor-pointer flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
                    <Camera size={14} /> {imagePreview ? "Change Photo" : "Upload Photo"}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setImageFile(f);
                        setImagePreview(URL.createObjectURL(f));
                      }} />
                  </label>
                  <p className="text-zinc-600 text-xs mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Full Name *",      key: "name",    required: true },
                  { label: "Phone *",          key: "phone",   required: true },
                  { label: "Email",            key: "email",   required: false },
                  { label: "Specialization",   key: "specialization", required: false },
                  { label: "Experience (yrs)", key: "experience",    required: false },
                  { label: "Salary (₹/month)", key: "salary",        required: false },
                ].map((f) => (
                  <div key={f.key} className={f.key === "name" || f.key === "phone" ? "" : ""}>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                    <input required={f.required} placeholder=""
                      value={(form as Record<string, string>)[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Joining Date</label>
                  <input type="date" value={form.joiningDate}
                    onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Note</label>
                <textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 resize-none" />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold py-3 rounded-xl text-sm uppercase tracking-wider transition-colors">
                {submitting ? "Saving…" : editing ? "Update Trainer" : "Add Trainer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
