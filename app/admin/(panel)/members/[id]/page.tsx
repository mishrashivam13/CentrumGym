import { API } from "@/lib/api";
"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Trash2, User, Activity, IndianRupee,
  Phone, MapPin, Mail, Calendar, Ruler, Dumbbell,
  Heart, AlertTriangle, CheckCircle, Clock, TrendingUp, Download, FileText, RefreshCw,
} from "lucide-react";
import { useDialog } from "@/components/admin/Dialog";
import RenewModal from "@/components/admin/RenewModal";

/* ── types ── */
interface FeePayment { amount: number; date: string; method: string; note?: string; }
interface EmergencyContact { name: string; phone: string; relation: string; }
interface Member {
  _id: string;
  name: string; email?: string; phone: string; address?: string;
  plan: string; planPrice: number;
  startDate: string; endDate: string; status: string; joiningDate: string;
  feeHistory: FeePayment[];
  dateOfBirth?: string; gender?: string;
  height?: number; weight?: number;
  fitnessGoal?: string; activityLevel?: string; healthNotes?: string;
  emergencyContact?: EmergencyContact;
}
type Tab = "info" | "profile" | "fees";

/* ── constants ── */
const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  active:  { label: "Active",  dot: "bg-green-400",  badge: "text-green-400 bg-green-400/10 border-green-400/20" },
  expired: { label: "Expired", dot: "bg-red-400",    badge: "text-red-400 bg-red-400/10 border-red-400/20" },
  paused:  { label: "Paused",  dot: "bg-yellow-400", badge: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
};
const FITNESS_GOALS: Record<string, string> = {
  weight_loss: "Weight Loss", muscle_gain: "Muscle Gain",
  maintenance: "Maintenance", endurance: "Endurance", flexibility: "Flexibility",
};
const ACTIVITY_LEVELS: Record<string, string> = {
  sedentary: "Sedentary", light: "Light", moderate: "Moderate", active: "Active",
};
const PLAN_COLORS: Record<string, string> = {
  basic: "text-zinc-300 bg-zinc-700/50 border-zinc-600",
  standard: "text-blue-300 bg-blue-500/10 border-blue-500/30",
  premium: "text-yellow-300 bg-yellow-500/10 border-yellow-500/30",
  yearly: "text-purple-300 bg-purple-500/10 border-purple-500/30",
};

/* ── helpers ── */
function bmi(h?: number, w?: number) {
  if (!h || !w) return null;
  return +(w / ((h / 100) ** 2)).toFixed(1);
}
function bmiInfo(b: number) {
  if (b < 18.5) return { label: "Underweight", color: "text-blue-400",   bar: "bg-blue-400",   pct: 20 };
  if (b < 25)   return { label: "Normal",      color: "text-green-400",  bar: "bg-green-400",  pct: 45 };
  if (b < 30)   return { label: "Overweight",  color: "text-yellow-400", bar: "bg-yellow-400", pct: 65 };
  return               { label: "Obese",        color: "text-red-400",    bar: "bg-red-400",    pct: 85 };
}
function calcAge(dob?: string) {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}
function daysLeft(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / (86400000));
}
function fmt(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function initials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

/* ── Field row ── */
function Field({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: React.ElementType }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-zinc-800/60 last:border-0">
      <span className="flex items-center gap-2 text-zinc-500 text-sm shrink-0">
        {Icon && <Icon size={13} className="text-zinc-600" />}{label}
      </span>
      <span className="text-white text-sm font-medium text-right capitalize">{value || "—"}</span>
    </div>
  );
}

/* ── Section card ── */
function Card({ title, icon: Icon, children, className = "" }: { title: string; icon: React.ElementType; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800 bg-zinc-800/40">
        <div className="w-7 h-7 rounded-lg bg-yellow-400/10 flex items-center justify-center">
          <Icon size={14} className="text-yellow-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ── receipt download ── */
function downloadReceipt(memberId: string, index?: number) {
  const token = localStorage.getItem("adminToken");
  const url = index !== undefined
    ? `$\{API\}/api/members/${memberId}/receipt/${index}`
    : `$\{API\}/api/members/${memberId}/receipt`;
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.blob())
    .then((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = index !== undefined
        ? `receipt-payment-${index + 1}.pdf`
        : `membership-receipt.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
}

/* ── Input ── */
function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs text-zinc-500 mb-1.5 font-medium">{label}</label>
      <input {...props}
        className="w-full bg-zinc-800 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition" />
    </div>
  );
}

/* ── Select ── */
function Select({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-zinc-500 mb-1.5 font-medium">{label}</label>
      <select {...props}
        className="w-full bg-zinc-800 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition">
        {children}
      </select>
    </div>
  );
}

/* ════════════════════════════════════════ */
export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();
  const { dialog, show } = useDialog();
  const [showRenew, setShowRenew] = useState(false);

  const [member,  setMember]  = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<Tab>("info");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const [pf, setPf] = useState({
    dateOfBirth: "", gender: "", height: "", weight: "",
    fitnessGoal: "", activityLevel: "", healthNotes: "",
    ecName: "", ecPhone: "", ecRelation: "",
  });

  /* Due payment */
  const [showDueModal, setShowDueModal] = useState(false);
  const [dueForm, setDueForm] = useState({ amount: "", method: "cash", date: new Date().toISOString().split("T")[0], note: "" });
  const [payingDue, setPayingDue] = useState(false);

  /* Max DOB = 7 years ago */
  const maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 7);
    return d.toISOString().split("T")[0];
  })();

  function authH() {
    return { Authorization: `Bearer ${localStorage.getItem("adminToken")}`, "Content-Type": "application/json" };
  }

  function loadMember() {
    fetch(`$\{API\}/api/members/${id}`, { headers: authH() })
      .then((r) => r.json())
      .then((m: Member) => {
        if (!m._id) return;
        m.feeHistory = m.feeHistory ?? [];
        setMember(m);
        setPf({
          dateOfBirth:   m.dateOfBirth?.split("T")[0] ?? "",
          gender:        m.gender        ?? "",
          height:        m.height        ? String(m.height) : "",
          weight:        m.weight        ? String(m.weight) : "",
          fitnessGoal:   m.fitnessGoal   ?? "",
          activityLevel: m.activityLevel ?? "",
          healthNotes:   m.healthNotes   ?? "",
          ecName:        m.emergencyContact?.name     ?? "",
          ecPhone:       m.emergencyContact?.phone    ?? "",
          ecRelation:    m.emergencyContact?.relation ?? "",
        });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadMember(); }, [id]);

  async function saveProfile() {
    if (!member) return;
    setSaving(true);
    const body = {
      dateOfBirth:   pf.dateOfBirth   || undefined,
      gender:        pf.gender        || undefined,
      height:        pf.height        ? Number(pf.height)  : undefined,
      weight:        pf.weight        ? Number(pf.weight)  : undefined,
      fitnessGoal:   pf.fitnessGoal   || undefined,
      activityLevel: pf.activityLevel || undefined,
      healthNotes:   pf.healthNotes   || undefined,
      emergencyContact: (pf.ecName || pf.ecPhone)
        ? { name: pf.ecName, phone: pf.ecPhone, relation: pf.ecRelation }
        : undefined,
    };
    const res     = await fetch(`$\{API\}/api/members/${id}`, { method: "PUT", headers: authH(), body: JSON.stringify(body) });
    const updated = await res.json() as Member;
    setMember(updated);
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  async function deleteMember() {
    if (!await show({ type: "confirm-delete", title: "Delete Member", message: "This will permanently delete the member and all their records. This cannot be undone." })) return;
    await fetch(`$\{API\}/api/members/${id}`, { method: "DELETE", headers: authH() });
    router.push("/admin/members");
  }

  async function payDue(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!member) return;
    setPayingDue(true);
    await fetch(`$\{API\}/api/members/${id}/fee`, {
      method: "POST", headers: authH(),
      body: JSON.stringify({ amount: Number(dueForm.amount), method: dueForm.method, date: dueForm.date, note: dueForm.note }),
    });
    setPayingDue(false);
    setShowDueModal(false);
    setDueForm({ amount: "", method: "cash", date: new Date().toISOString().split("T")[0], note: "" });
    /* Refresh member data */
    const res = await fetch(`$\{API\}/api/members/${id}`, { headers: authH() });
    const m = await res.json() as Member;
    m.feeHistory = m.feeHistory ?? [];
    setMember(m);
  }

  /* ── loading ── */
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!member) return <p className="text-red-400 p-6">Member not found.</p>;

  const bmiVal   = bmi(member.height, member.weight);
  const bmiMeta  = bmiVal ? bmiInfo(bmiVal) : null;
  const age      = calcAge(member.dateOfBirth);
  const days     = daysLeft(member.endDate);
  const totalPaid = member.feeHistory.reduce((s, f) => s + f.amount, 0);
  const sc       = STATUS_CONFIG[member.status] ?? STATUS_CONFIG.expired;
  const hasProfile = !!(member.height || member.weight || member.fitnessGoal);

  /* ── live bmi preview from form ── */
  const previewBmi     = bmi(Number(pf.height), Number(pf.weight));
  const previewBmiMeta = previewBmi ? bmiInfo(previewBmi) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {dialog}
      {showRenew && member && (
        <RenewModal
          memberId={member._id}
          memberName={member.name}
          currentPlan={member.plan}
          currentEndDate={member.endDate}
          onClose={() => setShowRenew(false)}
          onSuccess={() => { setShowRenew(false); loadMember(); }}
        />
      )}

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button onClick={() => router.push("/admin/members")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Members
        </button>
        <div className="flex items-center gap-2">
          {member && (member.status === "expired" || (member.status === "active" && new Date(member.endDate) <= new Date(Date.now() + 7 * 86400000))) && (
            <button onClick={() => setShowRenew(true)}
              className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 border border-green-500/25 hover:border-green-500/50 hover:bg-green-500/5 px-4 py-2 rounded-xl transition-all">
              <RefreshCw size={14} /> Renew Plan
            </button>
          )}
          <button onClick={deleteMember}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-500/25 hover:border-red-500/50 hover:bg-red-500/5 px-4 py-2 rounded-xl transition-all">
            <Trash2 size={14} /> Delete Member
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Coloured accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500" />

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-yellow-400/20">
              <span className="text-2xl font-black text-black">{initials(member.name)}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-white tracking-tight">{member.name}</h1>
                <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold capitalize ${sc.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} animate-pulse`} />
                  {sc.label}
                </span>
                {!hasProfile && (
                  <span className="text-xs px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full font-semibold">
                    Profile Incomplete
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
                {member.phone && <span className="flex items-center gap-1.5"><Phone size={12} />{member.phone}</span>}
                {member.email && <span className="flex items-center gap-1.5"><Mail size={12} />{member.email}</span>}
                {member.address && <span className="flex items-center gap-1.5"><MapPin size={12} />{member.address}</span>}
                {age && <span className="flex items-center gap-1.5"><User size={12} />{age} yrs{member.gender ? `, ${member.gender}` : ""}</span>}
              </div>
            </div>

            {/* Plan badge */}
            <div className={`shrink-0 px-4 py-3 rounded-xl border text-center ${PLAN_COLORS[member.plan] ?? PLAN_COLORS.basic}`}>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-0.5">Plan</p>
              <p className="font-black capitalize text-lg leading-none">{member.plan}</p>
              <p className="text-xs mt-1 opacity-70">₹{member.planPrice}</p>
            </div>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
            <div className="text-center">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Joined</p>
              <p className="text-white font-bold text-sm">{fmt(member.joiningDate)}</p>
            </div>
            <div className="text-center">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Start</p>
              <p className="text-white font-bold text-sm">{fmt(member.startDate)}</p>
            </div>
            <div className="text-center">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Expires</p>
              <p className="text-white font-bold text-sm">{fmt(member.endDate)}</p>
              {member.status === "active" && days >= 0 && days <= 14 && (
                <p className={`text-xs font-semibold mt-0.5 ${days <= 3 ? "text-red-400" : "text-orange-400"}`}>
                  {days === 0 ? "Expires today!" : `${days}d left`}
                </p>
              )}
            </div>
            <div className="text-center">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Total Paid</p>
              <p className="text-green-400 font-black text-sm">₹{totalPaid.toLocaleString("en-IN")}</p>
              <p className="text-zinc-600 text-xs">{member.feeHistory.length} payment(s)</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5">
        {([
          { key: "info",    label: "Member Info",     icon: User },
          { key: "profile", label: "Fitness Profile", icon: Activity },
          { key: "fees",    label: "Fee History",     icon: IndianRupee },
        ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${tab === key
                ? "bg-yellow-400 text-black shadow-sm"
                : "text-zinc-500 hover:text-white hover:bg-zinc-800"}`}>
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ══════ INFO TAB ══════ */}
      {tab === "info" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Card title="Personal Info" icon={User}>
            <Field label="Full Name"    value={member.name} />
            <Field label="Phone"        value={member.phone}        icon={Phone} />
            <Field label="Email"        value={member.email}        icon={Mail} />
            <Field label="Address"      value={member.address}      icon={MapPin} />
            <Field label="Gender"       value={member.gender} />
            <Field label="Date of Birth" value={fmt(member.dateOfBirth)} icon={Calendar} />
            <Field label="Age"          value={age ? `${age} years` : undefined} />
          </Card>

          <Card title="Membership" icon={Calendar}>
            <Field label="Plan"       value={member.plan} />
            <Field label="Plan Price" value={`₹${member.planPrice}`} />
            <Field label="Start Date" value={fmt(member.startDate)} />
            <Field label="End Date"   value={fmt(member.endDate)} />
            <Field label="Joined On"  value={fmt(member.joiningDate)} />
            <div className="flex items-center justify-between pt-3">
              <span className="text-zinc-500 text-sm">Status</span>
              <span className={`text-xs px-3 py-1 rounded-full border font-semibold capitalize ${sc.badge}`}>
                {sc.label}
              </span>
            </div>
          </Card>

          {/* BMI card */}
          {(member.height || member.weight) && (
            <Card title="Physical Stats" icon={Ruler}>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Height", value: member.height ? `${member.height} cm` : "—" },
                  { label: "Weight", value: member.weight ? `${member.weight} kg` : "—" },
                  { label: "BMI",    value: bmiVal ? String(bmiVal) : "—" },
                ].map((s) => (
                  <div key={s.label} className="bg-zinc-800 rounded-xl p-3 text-center">
                    <p className={`text-xl font-black ${s.label === "BMI" && bmiMeta ? bmiMeta.color : "text-white"}`}>{s.value}</p>
                    <p className="text-zinc-500 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              {bmiVal && bmiMeta && (
                <div>
                  <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                    <span>BMI Category</span>
                    <span className={`font-semibold ${bmiMeta.color}`}>{bmiMeta.label}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${bmiMeta.bar}`} style={{ width: `${bmiMeta.pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                    <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Fitness snapshot */}
          {(member.fitnessGoal || member.activityLevel || member.healthNotes) && (
            <Card title="Fitness" icon={Dumbbell}>
              <Field label="Goal"           value={member.fitnessGoal ? FITNESS_GOALS[member.fitnessGoal] : undefined} />
              <Field label="Activity Level" value={member.activityLevel ? ACTIVITY_LEVELS[member.activityLevel] : undefined} />
              {member.healthNotes && (
                <div className="mt-3">
                  <p className="text-zinc-500 text-xs mb-2 flex items-center gap-1.5"><AlertTriangle size={12} />Health Notes</p>
                  <p className="text-white text-sm bg-zinc-800 rounded-xl px-4 py-3 leading-relaxed">{member.healthNotes}</p>
                </div>
              )}
            </Card>
          )}

          {/* Emergency contact */}
          {member.emergencyContact?.phone && (
            <Card title="Emergency Contact" icon={Heart}>
              <Field label="Name"     value={member.emergencyContact.name} icon={User} />
              <Field label="Phone"    value={member.emergencyContact.phone} icon={Phone} />
              <Field label="Relation" value={member.emergencyContact.relation} />
            </Card>
          )}
        </div>
      )}

      {/* ══════ PROFILE TAB ══════ */}
      {tab === "profile" && (
        <div className="space-y-5">
          {saved && (
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
              <CheckCircle size={16} /> Fitness profile saved successfully!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Personal */}
            <Card title="Personal Details" icon={User}>
              <div className="space-y-4">
                <Input label="Date of Birth" type="date" value={pf.dateOfBirth}
                  max={maxDob}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && val > maxDob) return; // block < 7 years
                    setPf({ ...pf, dateOfBirth: val });
                  }} />
                {pf.dateOfBirth && calcAge(pf.dateOfBirth) !== null && (calcAge(pf.dateOfBirth) ?? 0) < 7 ? (
                  <p className="text-xs text-red-400 -mt-2">Minimum age must be 7 years</p>
                ) : pf.dateOfBirth ? (
                  <p className="text-xs text-zinc-500 -mt-2">
                    Age: <span className="text-yellow-400 font-semibold">{calcAge(pf.dateOfBirth)} years</span>
                  </p>
                ) : null}
                <Select label="Gender" value={pf.gender} onChange={(e) => setPf({ ...pf, gender: (e.target as HTMLSelectElement).value })}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </Card>

            {/* Physical */}
            <Card title="Physical Measurements" icon={Ruler}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Height (cm)" type="number" placeholder="e.g. 170" value={pf.height}
                    onChange={(e) => setPf({ ...pf, height: e.target.value })} />
                  <Input label="Weight (kg)" type="number" placeholder="e.g. 70" value={pf.weight}
                    onChange={(e) => setPf({ ...pf, weight: e.target.value })} />
                </div>
                {pf.height && pf.weight && previewBmi && previewBmiMeta && (
                  <div className="bg-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-400 text-sm">BMI</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-xl ${previewBmiMeta.color}`}>{previewBmi}</span>
                        <span className={`text-xs font-semibold ${previewBmiMeta.color}`}>— {previewBmiMeta.label}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${previewBmiMeta.bar}`}
                        style={{ width: `${previewBmiMeta.pct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Fitness */}
            <Card title="Fitness Details" icon={Dumbbell}>
              <div className="space-y-4">
                <Select label="Fitness Goal" value={pf.fitnessGoal}
                  onChange={(e) => setPf({ ...pf, fitnessGoal: (e.target as HTMLSelectElement).value })}>
                  <option value="">Select goal</option>
                  {Object.entries(FITNESS_GOALS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Select>
                <Select label="Activity Level" value={pf.activityLevel}
                  onChange={(e) => setPf({ ...pf, activityLevel: (e.target as HTMLSelectElement).value })}>
                  <option value="">Select level</option>
                  {Object.entries(ACTIVITY_LEVELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Select>
              </div>
            </Card>

            {/* Health Notes */}
            <Card title="Health Notes" icon={AlertTriangle}>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Medical Conditions / Injuries / Allergies</label>
                <textarea rows={5} placeholder="e.g. knee injury, diabetes, allergic to nuts…"
                  value={pf.healthNotes} onChange={(e) => setPf({ ...pf, healthNotes: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700/80 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 resize-none transition" />
              </div>
            </Card>

            {/* Emergency contact */}
            <Card title="Emergency Contact" icon={Heart} className="md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Name" placeholder="e.g. Ramesh Sharma" value={pf.ecName}
                  onChange={(e) => setPf({ ...pf, ecName: e.target.value })} />
                <Input label="Phone" placeholder="e.g. 9876543210" value={pf.ecPhone}
                  onChange={(e) => setPf({ ...pf, ecPhone: e.target.value })} />
                <Input label="Relation" placeholder="e.g. Father, Wife, Friend" value={pf.ecRelation}
                  onChange={(e) => setPf({ ...pf, ecRelation: e.target.value })} />
              </div>
            </Card>
          </div>

          <button onClick={saveProfile} disabled={saving}
            className="w-full flex items-center justify-center gap-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold py-4 rounded-2xl text-sm uppercase tracking-wider transition-colors shadow-lg shadow-yellow-400/10">
            <Save size={16} />
            {saving ? "Saving…" : "Save Fitness Profile"}
          </button>
        </div>
      )}

      {/* ══════ FEES TAB ══════ */}
      {tab === "fees" && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Paid",    value: `₹${totalPaid.toLocaleString("en-IN")}`, color: "text-green-400",  icon: TrendingUp,  bg: "bg-green-400/10" },
              { label: "Payments Made", value: String(member.feeHistory.length),         color: "text-yellow-400", icon: CheckCircle, bg: "bg-yellow-400/10" },
              { label: "Plan Price",    value: `₹${member.planPrice}`,                   color: "text-zinc-300",   icon: IndianRupee, bg: "bg-zinc-700/50" },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon size={18} className={s.color} />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-0.5">{s.label}</p>
                  <p className={`font-black text-xl ${s.color}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Full membership receipt download */}
          <button
            onClick={() => downloadReceipt(member._id)}
            className="w-full flex items-center justify-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-yellow-400/50 text-white font-semibold py-3.5 rounded-2xl text-sm transition-all group"
          >
            <FileText size={16} className="text-yellow-400" />
            Download Full Membership Receipt
            <Download size={14} className="text-zinc-500 group-hover:text-yellow-400 transition-colors" />
          </button>

          {/* Payment history table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                  <Clock size={14} className="text-yellow-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Payment History</h3>
              </div>
              <p className="text-zinc-600 text-xs">{member.feeHistory.length} record(s)</p>
            </div>

            {member.feeHistory.length === 0 ? (
              <div className="py-16 text-center text-zinc-600">No payments recorded yet</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {[...member.feeHistory].reverse().map((f, reversedIdx) => {
                  // map back to original index for receipt API
                  const originalIdx = member.feeHistory.length - 1 - reversedIdx;
                  return (
                    <div key={reversedIdx} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors group">
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl bg-green-400/10 flex items-center justify-center shrink-0">
                        <IndianRupee size={14} className="text-green-400" />
                      </div>

                      {/* Amount + note */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold">₹{f.amount.toLocaleString("en-IN")}</p>
                        {f.note && <p className="text-zinc-500 text-xs truncate">{f.note}</p>}
                      </div>

                      {/* Method + date */}
                      <div className="text-right shrink-0">
                        <p className="text-zinc-300 text-sm capitalize font-medium">{f.method}</p>
                        <p className="text-zinc-600 text-xs">{fmt(f.date)}</p>
                      </div>

                      {/* Download button */}
                      <button
                        onClick={() => downloadReceipt(member._id, originalIdx)}
                        title="Download Receipt"
                        className="shrink-0 p-2 rounded-lg text-zinc-600 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Download size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending balance + Clear Due */}
          {member.planPrice - totalPaid > 0 ? (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} className="text-orange-400 shrink-0" />
                  <div>
                    <p className="text-orange-300 font-semibold text-sm">Pending Due</p>
                    <p className="text-orange-400/70 text-xs mt-0.5">
                      ₹{(member.planPrice - totalPaid).toLocaleString("en-IN")} remaining · Plan: ₹{member.planPrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDueForm((f) => ({ ...f, amount: String(member.planPrice - totalPaid) }));
                    setShowDueModal(true);
                  }}
                  className="flex items-center gap-2 bg-orange-400 hover:bg-orange-300 text-black font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0">
                  <IndianRupee size={12} /> Clear Due
                </button>
              </div>
            </div>
          ) : totalPaid > 0 ? (
            <div className="flex items-center gap-3 px-5 py-3.5 bg-green-400/10 border border-green-400/20 rounded-2xl">
              <CheckCircle size={15} className="text-green-400 shrink-0" />
              <p className="text-green-400 text-sm font-semibold">All dues cleared — Fully paid</p>
            </div>
          ) : null}
        </div>
      )}

      {/* ── Due Payment Modal ── */}
      {showDueModal && member && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/75" onClick={() => setShowDueModal(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white">Clear Due Payment</h2>
                <p className="text-zinc-500 text-xs mt-0.5">{member.name} · Due: ₹{(member.planPrice - totalPaid).toLocaleString("en-IN")}</p>
              </div>
              <button onClick={() => setShowDueModal(false)} className="text-zinc-500 hover:text-white">
                <AlertTriangle size={18} className="text-orange-400" />
              </button>
            </div>
            <form onSubmit={payDue} className="p-6 space-y-4">
              {/* Quick — full due */}
              <button type="button"
                onClick={() => setDueForm((f) => ({ ...f, amount: String(member.planPrice - totalPaid) }))}
                className="w-full py-2.5 rounded-xl border border-orange-400/30 text-orange-400 text-sm font-bold hover:bg-orange-400/10 transition-colors">
                Pay Full Due — ₹{(member.planPrice - totalPaid).toLocaleString("en-IN")}
              </button>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Amount (₹) *</label>
                <input required type="number" min="1" max={member.planPrice - totalPaid}
                  value={dueForm.amount}
                  onChange={(e) => setDueForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Method</label>
                  <select value={dueForm.method} onChange={(e) => setDueForm((f) => ({ ...f, method: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400">
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank">Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Date</label>
                  <input type="date" value={dueForm.date}
                    onChange={(e) => setDueForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Note (optional)</label>
                <input value={dueForm.note} onChange={(e) => setDueForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. Due cleared via UPI"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400" />
              </div>

              <button type="submit" disabled={payingDue}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold py-3 rounded-xl text-sm uppercase tracking-wider transition-colors">
                {payingDue ? "Processing…" : "Confirm Payment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
