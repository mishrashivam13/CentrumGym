import { API } from "@/lib/api";
"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, CheckCircle, Dumbbell } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
  leadCaptured?: boolean;
}

export default function ChatWidget() {
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState<Msg[]>([
    { role: "assistant", content: "Hello! 👋 I'm Shivam, your gym counselor at Centrum Gym, Jaipur.\n\nAsk me anything about membership plans, timings, or facilities!" },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  const [badge, setBadge]     = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  function openChat() {
    setOpen(true);
    setBadge(false);
    setTimeout(() => inputRef.current?.focus(), 200);
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content };
    const history = [...msgs, userMsg];
    setMsgs(history);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json() as { reply: string; leadCaptured: boolean };
      setMsgs((p) => [...p, { role: "assistant", content: data.reply, leadCaptured: data.leadCaptured }]);
      if (data.leadCaptured) setLeadDone(true);
    } catch {
      setMsgs((p) => [...p, { role: "assistant", content: "Unable to connect to server. Please call: +91 78780 58724" }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[9999] w-[350px] max-h-[540px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-zinc-700 bg-zinc-900"
          style={{ animation: "cgUp .2s ease" }}>

          {/* Header */}
          <div className="bg-zinc-950 px-4 py-3 flex items-center gap-3 border-b border-zinc-800 shrink-0">
            <div className="w-9 h-9 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center shrink-0">
              <Dumbbell size={16} className="text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Shivam — Centrum Gym</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                <span className="text-zinc-500 text-xs">Online · Gym Counselor</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Lead banner */}
          {leadDone && (
            <div className="bg-green-500/10 border-b border-green-500/20 px-4 py-2 flex items-center gap-2 text-green-400 text-xs font-semibold shrink-0">
              <CheckCircle size={13} /> Enquiry saved! Our team will contact you soon.
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0" style={{ maxHeight: 340 }}>
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs ${
                  m.role === "assistant"
                    ? "bg-yellow-400/10 border border-yellow-400/20"
                    : "bg-blue-500/10 border border-blue-500/20"
                }`}>
                  {m.role === "assistant"
                    ? <Bot size={13} className="text-yellow-400" />
                    : <User size={13} className="text-blue-400" />}
                </div>
                <div className={`max-w-[78%] flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-3 py-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === "assistant"
                      ? "bg-zinc-800 text-zinc-200 rounded-tl-sm"
                      : "bg-blue-600 text-white rounded-tr-sm"
                  }`}>
                    {m.content}
                  </div>
                  {m.leadCaptured && (
                    <span className="flex items-center gap-1 text-[10px] text-green-400 font-semibold mt-1">
                      <CheckCircle size={9} /> Enquiry saved
                    </span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center shrink-0">
                  <Bot size={13} className="text-yellow-400" />
                </div>
                <div className="bg-zinc-800 px-3 py-2.5 rounded-xl rounded-tl-sm flex items-center gap-1.5">
                  <Loader2 size={12} className="text-yellow-400 animate-spin" />
                  <span className="text-zinc-500 text-xs">Typing…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {msgs.length <= 1 && !loading && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {["Membership plans?", "Gym timings?", "Location?", "Free trial?"].map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-[11px] bg-zinc-800 border border-zinc-700 hover:border-yellow-400/50 hover:text-yellow-400 text-zinc-400 px-2.5 py-1 rounded-full transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-zinc-800 flex gap-2 shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Type your message…"
              disabled={loading}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-yellow-400 disabled:opacity-50 transition-colors"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={13} className="text-black" />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={openChat}
        aria-label="Chat with Shivam"
        className="fixed bottom-5 right-5 z-[9999] w-14 h-14 rounded-full bg-yellow-400 hover:bg-yellow-300 shadow-lg hover:shadow-yellow-400/40 flex items-center justify-center transition-all hover:scale-105"
        style={{ boxShadow: "0 4px 20px rgba(251,191,36,.45)" }}
      >
        {open
          ? <X size={22} className="text-black" />
          : <MessageCircle size={24} className="text-black" />}
        {badge && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-white text-[10px] font-bold flex items-center justify-center">
            1
          </span>
        )}
      </button>

      <style>{`@keyframes cgUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }`}</style>
    </>
  );
}
