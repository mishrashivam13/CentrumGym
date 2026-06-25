"use client";
import { API } from "@/lib/api";

import { useEffect, useRef, useState } from "react";
import {
  Send, Users, CheckCircle, XCircle, AlertTriangle,
  UserX, Clock, Dumbbell, RefreshCw, ChevronRight,
  MessageSquare, Sparkles, Phone, Zap,
} from "lucide-react";
import { useDialog } from "@/components/admin/Dialog";

type TargetGroup = "active" | "expired" | "expiring-soon" | "plan" | "all";

const TARGET_OPTIONS: {
  key: TargetGroup; label: string; desc: string;
  icon: React.ElementType; accent: string; dot: string;
}[] = [
  { key: "active",        label: "Active Members",    desc: "Members with active plan",            icon: CheckCircle, accent: "green",  dot: "bg-green-400"  },
  { key: "expired",       label: "Expired Members",   desc: "Plan has expired",                    icon: UserX,       accent: "red",    dot: "bg-red-400"    },
  { key: "expiring-soon", label: "Expiring in 7 Days",desc: "Expiring within next 7 days",         icon: Clock,       accent: "orange", dot: "bg-orange-400" },
  { key: "plan",          label: "By Plan",           desc: "Specific membership plan",            icon: Dumbbell,    accent: "blue",   dot: "bg-blue-400"   },
  { key: "all",           label: "All Members",       desc: "Every member in the database",        icon: Users,       accent: "yellow", dot: "bg-yellow-400" },
];

const ACCENT_CLASSES: Record<string, { ring: string; bg: string; text: string; border: string }> = {
  green:  { ring: "ring-green-400/30",  bg: "bg-green-400/10",  text: "text-green-400",  border: "border-green-400/40"  },
  red:    { ring: "ring-red-400/30",    bg: "bg-red-400/10",    text: "text-red-400",    border: "border-red-400/40"    },
  orange: { ring: "ring-orange-400/30", bg: "bg-orange-400/10", text: "text-orange-400", border: "border-orange-400/40" },
  blue:   { ring: "ring-blue-400/30",   bg: "bg-blue-400/10",   text: "text-blue-400",   border: "border-blue-400/40"   },
  yellow: { ring: "ring-yellow-400/30", bg: "bg-yellow-400/10", text: "text-yellow-400", border: "border-yellow-400/40" },
};

const TEMPLATES = [
  {
    label: "Festival Offer",
    emoji: "🎉",
    body: `🎉 *Special Festival Offer!*\n\nHi {name}, Centrum Gym has an exclusive offer for you!\n\nRenew your *{plan}* plan this week and get special discounts.\n\n📞 Call: +91 78780 58724\n📍 2nd Floor, LN Plaza, Jhotwara, Jaipur`,
  },
  {
    label: "Renewal Reminder",
    emoji: "⏰",
    body: `⏰ *Membership Renewal Reminder*\n\nHi {name}, your *{plan}* plan expires on *{endDate}*.\n\nRenew now to keep your fitness journey going! 💪\n\n📞 +91 78780 58724`,
  },
  {
    label: "New Batch",
    emoji: "🏋️",
    body: `🏋️ *New Batch Starting!*\n\nHi {name}, we're starting a new morning batch at Centrum Gym.\n\nJoin us for a fresh start! Limited seats available.\n\n📞 +91 78780 58724\n📍 Jhotwara, Jaipur`,
  },
  {
    label: "Holiday Notice",
    emoji: "📢",
    body: `📢 *Important Notice*\n\nDear {name},\n\nCentrum Gym will remain closed on [DATE] due to [REASON].\n\nWe'll resume on [DATE]. Sorry for the inconvenience.\n\n– Team Centrum Gym`,
  },
];

const VARIABLES = [
  { tag: "{name}",    label: "Name"    },
  { tag: "{plan}",    label: "Plan"    },
  { tag: "{endDate}", label: "Expiry"  },
];

/* Render *bold* and _italic_ as styled spans for preview */
function WhatsAppText({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*|_[^_]+_)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("*") && part.endsWith("*"))
          return <strong key={i} className="font-bold">{part.slice(1, -1)}</strong>;
        if (part.startsWith("_") && part.endsWith("_"))
          return <em key={i} className="italic">{part.slice(1, -1)}</em>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function BulkMessagePage() {
  const { dialog, show }              = useDialog();
  const [targetGroup, setTargetGroup] = useState<TargetGroup>("active");
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [message, setMessage]         = useState("");
  const [preview, setPreview]         = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sending, setSending]         = useState(false);
  const [result, setResult]           = useState<{ sent: number; failed: number; total: number; errors: string[] } | null>(null);
  const [error, setError]             = useState("");
  const textareaRef                   = useRef<HTMLTextAreaElement>(null);

  function authH() {
    return { Authorization: `Bearer ${localStorage.getItem("adminToken")}`, "Content-Type": "application/json" };
  }

  useEffect(() => {
    setResult(null);
    setPreviewLoading(true);
    const p = new URLSearchParams({ targetGroup });
    if (targetGroup === "plan") p.set("plan", selectedPlan);
    fetch(`${API}/api/bulk-whatsapp/preview?${p}`, { headers: authH() })
      .then((r) => r.json())
      .then((d: { count: number }) => setPreview(d.count))
      .catch(() => setPreview(null))
      .finally(() => setPreviewLoading(false));
  }, [targetGroup, selectedPlan]);

  async function handleSend() {
    if (!message.trim()) { setError("Message cannot be empty"); return; }
    if (!preview)         { setError("No members match this filter"); return; }
    if (!await show({ type: "confirm-send", title: "Send Bulk Message", message: `Send WhatsApp message to ${preview} member(s)? This action cannot be undone.` })) return;

    setError("");
    setSending(true);
    setResult(null);
    try {
      const res  = await fetch(`${API}/api/bulk-whatsapp/send`, {
        method: "POST", headers: authH(),
        body: JSON.stringify({ targetGroup, plan: selectedPlan, message }),
      });
      const data = await res.json() as { sent: number; failed: number; total: number; errors: string[] };
      setResult(data);
    } catch {
      setError("Failed to send. Check backend connection.");
    } finally {
      setSending(false);
    }
  }

  function insertVariable(tag: string) {
    const el = textareaRef.current;
    if (!el) { setMessage((m) => m + tag); return; }
    const start = el.selectionStart ?? message.length;
    const end   = el.selectionEnd   ?? message.length;
    const next  = message.slice(0, start) + tag + message.slice(end);
    setMessage(next);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + tag.length, start + tag.length); }, 0);
  }

  const samplePreview = message
    .replace(/\{name\}/gi,    "Rahul Sharma")
    .replace(/\{plan\}/gi,    "Standard")
    .replace(/\{endDate\}/gi, "30 Jun 2026");

  const activeOpt  = TARGET_OPTIONS.find((o) => o.key === targetGroup)!;
  const accentCls  = ACCENT_CLASSES[activeOpt.accent];

  /* ── Result Screen ── */
  if (result) {
    const allOk = result.failed === 0;
    return (
      <div className="max-w-2xl mx-auto pt-6 pb-16 space-y-6">
        {dialog}
        <div className={`rounded-3xl border p-8 text-center space-y-4 ${allOk ? "bg-green-400/8 border-green-400/20" : "bg-orange-400/8 border-orange-400/20"}`}>
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${allOk ? "bg-green-400/15" : "bg-orange-400/15"}`}>
            {allOk
              ? <CheckCircle size={32} className="text-green-400" />
              : <AlertTriangle size={32} className="text-orange-400" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{allOk ? "All messages sent!" : "Partially sent"}</h2>
            <p className="text-zinc-500 text-sm mt-1">{allOk ? "WhatsApp messages delivered successfully." : "Some messages could not be delivered."}</p>
          </div>
          <div className="flex justify-center gap-8 pt-2">
            <div className="text-center">
              <p className="text-3xl font-black text-green-400">{result.sent}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Sent</p>
            </div>
            <div className="w-px bg-zinc-800" />
            <div className="text-center">
              <p className="text-3xl font-black text-red-400">{result.failed}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Failed</p>
            </div>
            <div className="w-px bg-zinc-800" />
            <div className="text-center">
              <p className="text-3xl font-black text-white">{result.total}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Total</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-black/20 rounded-2xl p-4 text-left max-h-32 overflow-y-auto">
              <p className="text-xs font-semibold text-zinc-400 mb-2">Failed numbers:</p>
              {result.errors.map((e, i) => <p key={i} className="text-xs text-red-400">{e}</p>)}
            </div>
          )}
          <button onClick={() => { setResult(null); setMessage(""); }}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm text-zinc-300 font-medium transition-colors">
            <RefreshCw size={14} /> Send another message
          </button>
        </div>
      </div>
    );
  }

  /* ── Main Layout ── */
  return (
    <div className="pb-16">
      {dialog}

      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <MessageSquare size={20} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Bulk WhatsApp</h1>
            <p className="text-zinc-500 text-xs">Send messages to multiple members at once</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ── LEFT COLUMN (composer) ── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Step 1 — Target */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-yellow-400 text-black text-[10px] font-black flex items-center justify-center">1</span>
              <h2 className="text-sm font-semibold text-white">Select Recipients</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TARGET_OPTIONS.map((opt) => {
                  const Icon    = opt.icon;
                  const cls     = ACCENT_CLASSES[opt.accent];
                  const isActive = targetGroup === opt.key;
                  return (
                    <button key={opt.key} onClick={() => setTargetGroup(opt.key)}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all
                        ${isActive
                          ? `${cls.bg} ${cls.border} ring-1 ${cls.ring}`
                          : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                        }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                        ${isActive ? cls.bg : "bg-zinc-800 group-hover:bg-zinc-700"}`}>
                        <Icon size={15} className={isActive ? cls.text : "text-zinc-500"} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold leading-tight ${isActive ? "text-white" : "text-zinc-300"}`}>{opt.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 truncate">{opt.desc}</p>
                      </div>
                      {isActive && <ChevronRight size={14} className={`ml-auto shrink-0 ${cls.text}`} />}
                    </button>
                  );
                })}
              </div>

              {/* Plan filter */}
              {targetGroup === "plan" && (
                <div className="flex gap-2 flex-wrap pt-1">
                  {["basic", "standard", "premium", "yearly"].map((p) => (
                    <button key={p} onClick={() => setSelectedPlan(p)}
                      className={`text-xs px-3.5 py-1.5 rounded-lg border font-semibold capitalize transition-all
                        ${selectedPlan === p ? "bg-yellow-400 text-black border-yellow-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Recipient count pill */}
              <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${accentCls.bg} ${accentCls.border}`}>
                <div className={`w-2 h-2 rounded-full ${activeOpt.dot} animate-pulse`} />
                {previewLoading ? (
                  <span className="text-zinc-500 text-sm">Counting…</span>
                ) : preview !== null ? (
                  <span className="text-sm text-zinc-300">
                    <span className={`font-black text-lg ${accentCls.text}`}>{preview}</span>
                    {" "}member{preview !== 1 ? "s" : ""} will receive this message
                  </span>
                ) : (
                  <span className="text-zinc-500 text-sm">Unable to fetch count</span>
                )}
              </div>
            </div>
          </div>

          {/* Step 2 — Templates */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-yellow-400 text-black text-[10px] font-black flex items-center justify-center">2</span>
              <h2 className="text-sm font-semibold text-white">Choose Template</h2>
              <span className="ml-auto text-[10px] text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">optional</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.label} onClick={() => setMessage(t.body)}
                  className={`group text-left p-3.5 rounded-xl border transition-all
                    ${message === t.body
                      ? "border-yellow-400/50 bg-yellow-400/8 ring-1 ring-yellow-400/20"
                      : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60"
                    }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{t.emoji}</span>
                    <span className={`text-sm font-semibold ${message === t.body ? "text-yellow-400" : "text-zinc-300"}`}>{t.label}</span>
                    {message === t.body && <CheckCircle size={12} className="ml-auto text-yellow-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed">{t.body.replace(/[*_]/g, "").slice(0, 60)}…</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3 — Compose */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2 flex-wrap">
              <span className="w-5 h-5 rounded-full bg-yellow-400 text-black text-[10px] font-black flex items-center justify-center">3</span>
              <h2 className="text-sm font-semibold text-white">Write Message</h2>
              <div className="ml-auto flex gap-1.5 flex-wrap">
                {VARIABLES.map((v) => (
                  <button key={v.tag} onClick={() => insertVariable(v.tag)}
                    className="text-[11px] px-2.5 py-1 bg-zinc-800 hover:bg-yellow-400/10 border border-zinc-700 hover:border-yellow-400/40 rounded-lg text-yellow-400 font-mono transition-colors">
                    {v.tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 space-y-3">
              <textarea
                ref={textareaRef}
                rows={9}
                placeholder={"Type your message here…\n\nUse {name} for member name, {plan} for plan type, {endDate} for expiry date.\n\nTip: Use *bold* and _italic_ for WhatsApp formatting."}
                value={message}
                onChange={(e) => { setMessage(e.target.value); setError(""); }}
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/10 resize-none font-mono transition leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-zinc-600">
                <span>{message.length} characters</span>
                <span className="flex items-center gap-1">
                  <Sparkles size={10} /> *bold* · _italic_ · WhatsApp format
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <XCircle size={15} className="shrink-0" /> {error}
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN (preview + send) ── */}
        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-6">

          {/* WhatsApp Preview */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
              <Phone size={13} className="text-green-400" />
              <span className="text-sm font-semibold text-white">Live Preview</span>
              <span className="ml-auto text-[10px] text-zinc-600">as "Rahul Sharma"</span>
            </div>

            {/* WhatsApp mockup */}
            <div className="bg-[#0b141a] p-4 min-h-[220px] flex flex-col">
              {/* WA header */}
              <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Dumbbell size={14} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Centrum Gym</p>
                  <p className="text-[10px] text-[#8696a0]">Business Account</p>
                </div>
              </div>

              {message.trim() ? (
                <div className="flex justify-start">
                  <div className="bg-[#202c33] rounded-xl rounded-tl-none px-3.5 py-2.5 max-w-[90%]">
                    <p className="text-[#e9edef] text-xs whitespace-pre-wrap leading-relaxed">
                      <WhatsAppText text={samplePreview} />
                    </p>
                    <p className="text-[#8696a0] text-[10px] text-right mt-1.5">11:25 AM ✓✓</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MessageSquare size={28} className="text-zinc-700 mx-auto" />
                    <p className="text-zinc-600 text-xs">Preview will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Send card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Recipients</span>
                <span className={`font-bold ${previewLoading ? "text-zinc-600" : accentCls.text}`}>
                  {previewLoading ? "…" : (preview ?? 0)} members
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Target</span>
                <span className="text-zinc-300 font-medium text-xs">{activeOpt.label}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Message</span>
                <span className="text-zinc-300 text-xs">{message.length > 0 ? `${message.length} chars` : "—"}</span>
              </div>
            </div>

            <div className="h-px bg-zinc-800" />

            <button onClick={handleSend}
              disabled={sending || !message.trim() || !preview}
              className="w-full flex items-center justify-center gap-2.5 bg-green-500 hover:bg-green-400 active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-green-500/20">
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send size={15} />
                  Send to {preview ?? 0} Member{(preview ?? 0) !== 1 ? "s" : ""}
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-zinc-600 leading-relaxed">
              Messages are sent one by one to avoid rate limits.<br />Do not close this page while sending.
            </p>
          </div>

          {/* Format tips */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-xs font-semibold text-zinc-500 mb-2.5 flex items-center gap-1.5"><Zap size={11} /> WhatsApp Formatting</p>
            <div className="space-y-1.5 text-xs text-zinc-600">
              <div className="flex items-center gap-2"><code className="text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">*text*</code><span>→</span><strong className="text-zinc-400">bold</strong></div>
              <div className="flex items-center gap-2"><code className="text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">_text_</code><span>→</span><em className="text-zinc-400">italic</em></div>
              <div className="flex items-center gap-2"><code className="text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">{"~text~"}</code><span>→</span><s className="text-zinc-400">strikethrough</s></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
