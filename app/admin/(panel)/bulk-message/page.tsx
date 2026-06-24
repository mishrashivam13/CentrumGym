import { API } from "@/lib/api";
"use client";

import { useEffect, useState } from "react";
import {
  Send, Users, CheckCircle, XCircle, AlertTriangle,
  Zap, UserX, Clock, Dumbbell, RefreshCw,
} from "lucide-react";
import { useDialog } from "@/components/admin/Dialog";

type TargetGroup = "active" | "expired" | "expiring-soon" | "plan" | "all";

const TARGET_OPTIONS: { key: TargetGroup; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { key: "active",        label: "All Active Members",     desc: "Members with active plan",             icon: CheckCircle,  color: "text-green-400 border-green-400/30 bg-green-400/5" },
  { key: "expired",       label: "Expired Members",        desc: "Members whose plan has expired",       icon: UserX,        color: "text-red-400 border-red-400/30 bg-red-400/5" },
  { key: "expiring-soon", label: "Expiring in 7 Days",     desc: "Members expiring within next 7 days",  icon: Clock,        color: "text-orange-400 border-orange-400/30 bg-orange-400/5" },
  { key: "plan",          label: "By Plan",                desc: "Target a specific membership plan",     icon: Dumbbell,     color: "text-blue-400 border-blue-400/30 bg-blue-400/5" },
  { key: "all",           label: "All Members",            desc: "Every member in the database",         icon: Users,        color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5" },
];

const TEMPLATES = [
  {
    label: "Festival Offer",
    body: `🎉 *Special Festival Offer!*\n\nHi {name}, Centrum Gym has an exclusive offer for you!\n\nRenew your *{plan}* plan this week and get special discounts.\n\n📞 Call: +91 78780 58724\n📍 2nd Floor, LN Plaza, Jhotwara, Jaipur`,
  },
  {
    label: "Renewal Reminder",
    body: `⏰ *Membership Renewal Reminder*\n\nHi {name}, your *{plan}* plan expires on *{endDate}*.\n\nRenew now to keep your fitness journey going! 💪\n\n📞 +91 78780 58724`,
  },
  {
    label: "New Batch Announcement",
    body: `🏋️ *New Batch Starting!*\n\nHi {name}, we're starting a new morning batch at Centrum Gym.\n\nJoin us for a fresh start! Limited seats available.\n\n📞 +91 78780 58724\n📍 Jhotwara, Jaipur`,
  },
  {
    label: "Holiday Notice",
    body: `📢 *Important Notice*\n\nDear {name},\n\nCentrum Gym will remain closed on [DATE] due to [REASON].\n\nWe'll resume on [DATE]. Sorry for the inconvenience.\n\n– Team Centrum Gym`,
  },
];

const VARIABLES = ["{name}", "{plan}", "{endDate}"];

export default function BulkMessagePage() {
  const { dialog, show } = useDialog();
  const [targetGroup, setTargetGroup] = useState<TargetGroup>("active");
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [message, setMessage]       = useState("");
  const [preview, setPreview]       = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sending, setSending]       = useState(false);
  const [result, setResult]         = useState<{ sent: number; failed: number; total: number; errors: string[] } | null>(null);
  const [error, setError]           = useState("");

  function authH() {
    return { Authorization: `Bearer ${localStorage.getItem("adminToken")}`, "Content-Type": "application/json" };
  }

  /* Fetch preview count whenever target changes */
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
    if (!preview) { setError("No members match this filter"); return; }
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

  const samplePreview = message
    .replace(/\{name\}/gi, "Rahul Sharma")
    .replace(/\{plan\}/gi, "Standard")
    .replace(/\{endDate\}/gi, "30 June 2026");

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {dialog}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-400/10 flex items-center justify-center">
            <Send size={18} className="text-green-400" />
          </div>
          Bulk WhatsApp Message
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Send WhatsApp messages to a group of members at once</p>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`rounded-2xl border p-5 ${result.failed === 0 ? "bg-green-400/10 border-green-400/20" : "bg-orange-400/10 border-orange-400/20"}`}>
          <div className="flex items-center gap-3 mb-3">
            {result.failed === 0
              ? <CheckCircle size={20} className="text-green-400" />
              : <AlertTriangle size={20} className="text-orange-400" />}
            <p className="font-bold text-white">
              {result.failed === 0 ? "All messages sent!" : "Partially sent"}
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <div><p className="text-zinc-500">Sent</p><p className="text-green-400 font-black text-xl">{result.sent}</p></div>
            <div><p className="text-zinc-500">Failed</p><p className="text-red-400 font-black text-xl">{result.failed}</p></div>
            <div><p className="text-zinc-500">Total</p><p className="text-white font-black text-xl">{result.total}</p></div>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-3 bg-black/20 rounded-xl p-3">
              <p className="text-xs text-zinc-400 mb-1 font-semibold">Failed numbers:</p>
              {result.errors.map((e, i) => <p key={i} className="text-xs text-red-400">{e}</p>)}
            </div>
          )}
          <button onClick={() => { setResult(null); setMessage(""); }}
            className="mt-3 flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors">
            <RefreshCw size={12} /> Send another message
          </button>
        </div>
      )}

      {!result && (
        <>
          {/* Step 1 — Target group */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Step 1 — Who to send to</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TARGET_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = targetGroup === opt.key;
                return (
                  <button key={opt.key} onClick={() => setTargetGroup(opt.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all
                      ${active ? opt.color + " border-current" : "border-zinc-800 hover:border-zinc-700 text-zinc-400"}`}>
                    <Icon size={16} className={active ? "" : "text-zinc-600"} />
                    <div>
                      <p className={`text-sm font-semibold ${active ? "" : "text-zinc-300"}`}>{opt.label}</p>
                      <p className="text-xs text-zinc-500">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Plan selector */}
            {targetGroup === "plan" && (
              <div className="flex gap-2 flex-wrap pt-1">
                {["basic", "standard", "premium", "yearly"].map((p) => (
                  <button key={p} onClick={() => setSelectedPlan(p)}
                    className={`text-sm px-4 py-2 rounded-xl border font-semibold capitalize transition-all
                      ${selectedPlan === p ? "bg-yellow-400 text-black border-yellow-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Preview count */}
            <div className="flex items-center gap-2 pt-1">
              <Users size={14} className="text-zinc-500" />
              {previewLoading ? (
                <span className="text-zinc-500 text-sm">Loading…</span>
              ) : preview !== null ? (
                <span className="text-sm">
                  <span className="text-yellow-400 font-black text-lg">{preview}</span>
                  <span className="text-zinc-500"> member{preview !== 1 ? "s" : ""} will receive this message</span>
                </span>
              ) : null}
            </div>
          </div>

          {/* Step 2 — Templates */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Step 2 — Choose a template (optional)</h2>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.label} onClick={() => setMessage(t.body)}
                  className="text-left px-4 py-3 rounded-xl border border-zinc-800 hover:border-yellow-400/40 hover:bg-yellow-400/5 text-zinc-300 text-sm font-medium transition-all">
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3 — Message */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Step 3 — Write your message</h2>
              <div className="flex gap-1.5">
                {VARIABLES.map((v) => (
                  <button key={v} onClick={() => setMessage((m) => m + v)}
                    className="text-xs px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-yellow-400 font-mono transition-colors">
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <textarea rows={8}
              placeholder="Type your message here…&#10;&#10;Use {name} for member name, {plan} for plan, {endDate} for expiry date."
              value={message}
              onChange={(e) => { setMessage(e.target.value); setError(""); }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 resize-none font-mono transition" />
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <span>{message.length} chars</span>
              <span>Supports *bold*, _italic_ (WhatsApp format)</span>
            </div>
          </div>

          {/* Step 4 — Preview */}
          {message.trim() && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Preview (sample for "Rahul Sharma")</h2>
              <div className="bg-[#0b141a] rounded-2xl p-4 border border-zinc-700">
                <div className="bg-[#202c33] rounded-xl rounded-tl-none px-4 py-3 max-w-xs">
                  <p className="text-[#e9edef] text-sm whitespace-pre-wrap leading-relaxed">{samplePreview}</p>
                  <p className="text-[#8696a0] text-[10px] text-right mt-1">11:25 AM ✓✓</p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <XCircle size={15} /> {error}
            </div>
          )}

          {/* Send button */}
          <button onClick={handleSend}
            disabled={sending || !message.trim() || !preview}
            className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-sm uppercase tracking-wider transition-colors shadow-lg shadow-green-500/10">
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending… (this may take a while)
              </>
            ) : (
              <>
                <Send size={16} />
                Send to {preview ?? 0} Member{(preview ?? 0) !== 1 ? "s" : ""}
              </>
            )}
          </button>

          <p className="text-center text-xs text-zinc-600">
            Messages are sent one by one with a small delay to avoid rate limits. Do not close this page while sending.
          </p>
        </>
      )}
    </div>
  );
}
