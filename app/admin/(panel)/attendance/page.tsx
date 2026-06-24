import { API } from "@/lib/api";
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, LogIn, LogOut, Trash2, CheckCircle,
  Calendar, Clock, TrendingUp, Users, X, Sun, Moon,
} from "lucide-react";
import { useDialog } from "@/components/admin/Dialog";

type Shift = "morning" | "evening";

interface MemberRef  { _id: string; name: string; phone: string; plan: string; status: string; }
interface AttendanceRecord {
  _id: string; memberId: MemberRef;
  date: string; shift: Shift; checkIn: string; checkOut?: string;
}
interface ActiveMember { _id: string; name: string; phone: string; plan: string; }
interface Stats {
  todayCount: number; morningToday: number; eveningToday: number;
  monthCount: number; totalMembers: number;
}

const PLAN_COLOR: Record<string, string> = {
  basic: "text-zinc-400", standard: "text-blue-400",
  premium: "text-yellow-400", yearly: "text-purple-400",
};

const API_BASE = `${API}/api`;

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function authHeaders(token: string | null) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function apiJson<T>(path: string, token: string | null, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(token), ...(init?.headers ?? {}) },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? "Request failed");
  }

  return data as T;
}

function offlineMessage(err: unknown) {
  if (err instanceof ApiError) return err.message;
  return "Could not connect to the backend. Please check that the backend server is running on port 5000.";
}

const SHIFT_CONFIG = {
  morning: { label: "Morning Shift", time: "5:30 AM – 11:30 AM", Icon: Sun,  color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30", active: "bg-yellow-400 text-black" },
  evening: { label: "Evening Shift", time: "4:00 PM – 10:30 PM", Icon: Moon, color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/30", active: "bg-indigo-500 text-white" },
} as const;

function detectShift(): Shift {
  const mins = new Date().getHours() * 60 + new Date().getMinutes();
  if (mins >= 960 && mins <= 1350) return "evening"; // 16:00–22:30
  return "morning"; // default to morning
}

function fmtTime(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function duration(checkIn: string, checkOut?: string) {
  if (!checkOut) return null;
  const mins = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function AttendancePage() {
  const { dialog, show } = useDialog();
  const [tab,      setTab]      = useState<"mark" | "today" | "history">("mark");
  const [shift,    setShift]    = useState<Shift>(detectShift());

  const [stats,      setStats]      = useState<Stats | null>(null);
  const [todayRecords, setToday]    = useState<AttendanceRecord[]>([]);
  const [allMembers,   setAllMembers] = useState<ActiveMember[]>([]);
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(true);
  const [busy,       setBusy]       = useState<string | null>(null);

  /* history */
  const [history,      setHistory]     = useState<AttendanceRecord[]>([]);
  const [histTotal,    setHistTotal]   = useState(0);
  const [histPage,     setHistPage]    = useState(1);
  const [histPages,    setHistPages]   = useState(1);
  const [dateFrom,     setDateFrom]    = useState("");
  const [dateTo,       setDateTo]      = useState("");
  const [histShift,    setHistShift]   = useState<Shift | "all">("all");
  const [histLoading,  setHistLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const [tData, sData, mData] = await Promise.all([
        apiJson<AttendanceRecord[]>("/attendance/today", token),
        apiJson<Stats>("/attendance/stats", token),
        apiJson<{ members: ActiveMember[] }>("/members?status=active&limit=200", token),
      ]);
      setToday(tData ?? []);
      setStats(sData);
      setAllMembers(mData.members ?? []);
    } catch (err) {
      show({ type: "alert", title: "Attendance Not Loaded", message: offlineMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [show]);

  const fetchHistory = useCallback(async () => {
    setHistLoading(true);
    const p = new URLSearchParams({ page: String(histPage), limit: "25" });
    if (dateFrom)             p.set("from", dateFrom);
    if (dateTo)               p.set("to", dateTo);
    if (histShift !== "all")  p.set("shift", histShift);
    try {
      const data = await apiJson<{ records: AttendanceRecord[]; total: number; pages: number }>(
        `/attendance?${p}`,
        localStorage.getItem("adminToken")
      );
      setHistory(data.records ?? []);
      setHistTotal(data.total ?? 0);
      setHistPages(data.pages ?? 1);
    } catch (err) {
      show({ type: "alert", title: "History Not Loaded", message: offlineMessage(err) });
    } finally {
      setHistLoading(false);
    }
  }, [histPage, dateFrom, dateTo, histShift, show]);

  useEffect(() => { queueMicrotask(() => { void refresh(); }); }, [refresh]);
  useEffect(() => { if (tab === "history") queueMicrotask(() => { void fetchHistory(); }); }, [tab, fetchHistory]);

  async function checkIn(memberId: string) {
    setBusy(memberId);
    try {
      await apiJson<AttendanceRecord>("/attendance/check-in", localStorage.getItem("adminToken"), {
        method: "POST", body: JSON.stringify({ memberId, shift }),
      });
      await refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        show({ type: "alert-warn", title: "Already Checked In", message: `This member has already been checked in for the ${shift} shift today.` });
        await refresh();
      } else {
        show({ type: "alert", title: "Check-In Failed", message: offlineMessage(err) });
      }
    } finally {
      setBusy(null);
    }
  }

  async function checkOut(recordId: string) {
    setBusy(recordId);
    try {
      await apiJson<AttendanceRecord>(`/attendance/${recordId}/check-out`, localStorage.getItem("adminToken"), { method: "PATCH" });
      await refresh();
    } catch (err) {
      show({ type: "alert", title: "Check-Out Failed", message: offlineMessage(err) });
    } finally {
      setBusy(null);
    }
  }

  async function deleteRecord(id: string) {
    if (!await show({ type: "confirm-delete", title: "Delete Record", message: "This attendance record will be permanently deleted." })) return;
    try {
      await apiJson<{ message: string }>(`/attendance/${id}`, localStorage.getItem("adminToken"), { method: "DELETE" });
      await refresh();
      if (tab === "history") await fetchHistory();
    } catch (err) {
      show({ type: "alert", title: "Delete Failed", message: offlineMessage(err) });
    }
  }

  /* Per-shift today maps: memberId → record */
  const morningMap = new Map(todayRecords.filter((r) => r.memberId && r.shift === "morning").map((r) => [r.memberId._id, r]));
  const eveningMap = new Map(todayRecords.filter((r) => r.memberId && r.shift === "evening").map((r) => [r.memberId._id, r]));
  const shiftMap   = shift === "morning" ? morningMap : eveningMap;

  const filtered = allMembers.filter((m) =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search)
  );

  const cfg = SHIFT_CONFIG[shift];

  return (
    <div className="space-y-6">
      {dialog}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Attendance</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Morning Today",  value: stats.morningToday,  color: "text-yellow-400", bg: "bg-yellow-400/10", icon: Sun },
            { label: "Evening Today",  value: stats.eveningToday,  color: "text-indigo-400", bg: "bg-indigo-400/10", icon: Moon },
            { label: "This Month",     value: stats.monthCount,    color: "text-purple-400", bg: "bg-purple-400/10", icon: TrendingUp },
            { label: "Active Members", value: stats.totalMembers,  color: "text-green-400",  bg: "bg-green-400/10",  icon: Users },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon size={18} className={s.color} />
              </div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5">
        {([
          { key: "mark",    label: "Mark Attendance", icon: Users },
          { key: "today",   label: `Today's Log (${todayRecords.filter(r => r.memberId).length})`, icon: Clock },
          { key: "history", label: "History",         icon: Calendar },
        ] as { key: "mark"|"today"|"history"; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${tab === key ? "bg-yellow-400 text-black" : "text-zinc-500 hover:text-white hover:bg-zinc-800"}`}>
            <Icon size={14} /><span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── MARK TAB ── */}
      {tab === "mark" && (
        <div className="space-y-4">
          {/* Shift Selector */}
          <div className="grid grid-cols-2 gap-3">
            {(["morning", "evening"] as Shift[]).map((s) => {
              const c   = SHIFT_CONFIG[s];
              const cnt = s === "morning" ? morningMap.size : eveningMap.size;
              return (
                <button key={s} onClick={() => setShift(s)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                    shift === s
                      ? `${c.bg} ${c.border} border-2`
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${shift === s ? c.bg : "bg-zinc-800"}`}>
                    <c.Icon size={18} className={shift === s ? c.color : "text-zinc-600"} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className={`font-bold text-sm ${shift === s ? c.color : "text-zinc-400"}`}>{c.label}</p>
                    <p className="text-zinc-600 text-xs">{c.time}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${shift === s ? c.color : "text-zinc-600"}`}>{cnt} checked in</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active shift banner */}
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
            <cfg.Icon size={14} />
            Marking for: {cfg.label} &nbsp;·&nbsp; {cfg.time}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member by name or phone…"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-10 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                <X size={15} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-7 h-7 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/40">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                  {filtered.length} active members
                </span>
                <span className="text-xs text-zinc-600">{shiftMap.size} marked for {shift}</span>
              </div>
              <div className="divide-y divide-zinc-800 max-h-[60vh] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="py-12 text-center text-zinc-600">No members found</div>
                ) : filtered.map((m) => {
                  const rec    = shiftMap.get(m._id);
                  const isBusy = busy === m._id || busy === rec?._id;
                  return (
                    <div key={m._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/30 transition-colors">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        !rec ? "bg-zinc-700" : rec.checkOut ? "bg-blue-400" : "bg-green-400 animate-pulse"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{m.name}</p>
                        <p className="text-zinc-500 text-xs">
                          {m.phone} · <span className={`capitalize font-medium ${PLAN_COLOR[m.plan] ?? ""}`}>{m.plan}</span>
                        </p>
                      </div>
                      {rec && (
                        <div className="text-right shrink-0 hidden sm:block">
                          <p className="text-green-400 text-xs font-medium">{fmtTime(rec.checkIn)}</p>
                          {rec.checkOut && <p className="text-blue-400 text-xs">{fmtTime(rec.checkOut)}</p>}
                          {duration(rec.checkIn, rec.checkOut) && (
                            <p className="text-yellow-400 text-xs">{duration(rec.checkIn, rec.checkOut)}</p>
                          )}
                        </div>
                      )}
                      <div className="shrink-0">
                        {!rec ? (
                          <button onClick={() => checkIn(m._id)} disabled={!!isBusy}
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                              shift === "morning"
                                ? "bg-yellow-400 hover:bg-yellow-300 text-black"
                                : "bg-indigo-500 hover:bg-indigo-400 text-white"
                            }`}>
                            <LogIn size={12} />{isBusy ? "…" : "Check In"}
                          </button>
                        ) : !rec.checkOut ? (
                          <button onClick={() => checkOut(rec._id)} disabled={!!isBusy}
                            className="flex items-center gap-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-bold px-3 py-1.5 rounded-lg transition-colors">
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
            </div>
          )}
        </div>
      )}

      {/* ── TODAY'S LOG ── */}
      {tab === "today" && (
        <div className="space-y-4">
          {(["morning", "evening"] as Shift[]).map((s) => {
            const records = todayRecords.filter((r) => r.memberId && r.shift === s);
            const c = SHIFT_CONFIG[s];
            return (
              <div key={s} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                {/* Shift header */}
                <div className={`flex items-center gap-2 px-5 py-3 border-b border-zinc-800 ${c.bg}`}>
                  <c.Icon size={14} className={c.color} />
                  <span className={`text-sm font-bold ${c.color}`}>{c.label}</span>
                  <span className="text-zinc-600 text-xs ml-1">{c.time}</span>
                  <span className={`ml-auto text-xs font-semibold ${c.color}`}>{records.length} present</span>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center h-24">
                    <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : records.length === 0 ? (
                  <div className="py-8 text-center text-zinc-600 text-sm">No check-ins for this shift</div>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {records.map((r) => {
                      const dur = duration(r.checkIn, r.checkOut);
                      return (
                        <div key={r._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/30 transition-colors group">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${r.checkOut ? "bg-blue-400" : "bg-green-400 animate-pulse"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm">{r.memberId?.name ?? "Deleted Member"}</p>
                            <p className="text-zinc-500 text-xs">{r.memberId?.phone ?? ""}</p>
                          </div>
                          <div className="text-right shrink-0 flex gap-4 items-center">
                            <div>
                              <p className="text-xs text-zinc-600 mb-0.5">In</p>
                              <p className="text-green-400 font-semibold text-sm">{fmtTime(r.checkIn)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-600 mb-0.5">Out</p>
                              <p className={`font-semibold text-sm ${r.checkOut ? "text-blue-400" : "text-zinc-600"}`}>{fmtTime(r.checkOut)}</p>
                            </div>
                            {dur && (
                              <div>
                                <p className="text-xs text-zinc-600 mb-0.5">Time</p>
                                <p className="text-yellow-400 font-semibold text-sm">{dur}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {!r.checkOut && (
                              <button onClick={() => checkOut(r._id)} title="Check Out"
                                className="p-2 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                                <LogOut size={14} />
                              </button>
                            )}
                            <button onClick={() => deleteRecord(r._id)}
                              className="p-2 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap items-center">
            {/* Shift filter */}
            <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              {(["all", "morning", "evening"] as const).map((s) => (
                <button key={s} onClick={() => { setHistShift(s); setHistPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    histShift === s ? "bg-yellow-400 text-black" : "text-zinc-500 hover:text-white"
                  }`}>
                  {s === "all" ? "All Shifts" : s === "morning" ? "Morning" : "Evening"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-zinc-500 text-sm">From</label>
              <input type="date" value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setHistPage(1); }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-zinc-500 text-sm">To</label>
              <input type="date" value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setHistPage(1); }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400" />
            </div>
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); setHistPage(1); }}
                className="text-xs text-zinc-500 hover:text-white border border-zinc-700 px-3 py-2 rounded-xl transition-colors">
                Clear
              </button>
            )}
            <span className="text-zinc-600 text-sm">{histTotal} records</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {histLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-7 h-7 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="py-16 text-center text-zinc-600">No records found</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {history.filter((r) => r.memberId).map((r) => {
                  const dur  = duration(r.checkIn, r.checkOut);
                  const sc   = SHIFT_CONFIG[r.shift];
                  return (
                    <div key={r._id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors group">
                      <div className="shrink-0 text-center w-12">
                        <p className="text-white font-bold">{new Date(r.date).getDate()}</p>
                        <p className="text-zinc-500 text-xs">{new Date(r.date).toLocaleDateString("en-IN", { month: "short" })}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{r.memberId?.name ?? "Deleted Member"}</p>
                        <p className="text-zinc-500 text-xs">{r.memberId?.phone ?? ""}</p>
                      </div>
                      {/* Shift badge */}
                      <div className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${sc.bg} ${sc.color}`}>
                        <sc.Icon size={11} />
                        {r.shift === "morning" ? "AM" : "PM"}
                      </div>
                      <div className="text-right shrink-0 text-sm">
                        <p className="text-green-400 font-medium">{fmtTime(r.checkIn)} <span className="text-zinc-600 text-xs">in</span></p>
                        <p className={r.checkOut ? "text-blue-400 font-medium" : "text-zinc-600"}>
                          {r.checkOut ? `${fmtTime(r.checkOut)} out` : "Still inside"}
                        </p>
                        {dur && <p className="text-yellow-400 text-xs">{dur}</p>}
                      </div>
                      <button onClick={() => deleteRecord(r._id)}
                        className="shrink-0 p-2 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {histPages > 1 && (
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>Page {histPage} of {histPages}</span>
              <div className="flex gap-2">
                <button disabled={histPage === 1} onClick={() => setHistPage(histPage - 1)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-40 hover:border-zinc-600 transition-colors text-xs">Prev</button>
                <button disabled={histPage === histPages} onClick={() => setHistPage(histPage + 1)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-40 hover:border-zinc-600 transition-colors text-xs">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
