"use client";
import { API } from "@/lib/api";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Dumbbell, Phone, MapPin, Clock, Loader2, CheckCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  leadCaptured?: boolean;
}

const SUGGESTIONS = [
  "What are the membership plans?",
  "What are the gym timings?",
  "Where is the gym located?",
  "Is a personal trainer available?",
  "Is there a free trial?",
];

export default function ChatPage() {
  const [messages, setMessages]       = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! 👋 I'm Shivam, your gym counselor at Centrum Gym, Jaipur.\n\nI can help you with membership plans, timings, facilities, or any gym-related questions. What would you like to know?",
    },
  ]);
  const [input,    setInput]          = useState("");
  const [loading,  setLoading]        = useState(false);
  const [leadDone, setLeadDone]       = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome" || m.role === "assistant")
        .map(({ role, content }) => ({ role, content }));

      const res  = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json() as { reply: string; leadCaptured: boolean };

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "_bot", role: "assistant", content: data.reply, leadCaptured: data.leadCaptured },
      ]);

      if (data.leadCaptured) setLeadDone(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "_err", role: "assistant", content: "Sorry, abhi server se connect nahi ho pa raha. Thodi der baad try karein ya directly call karein: +91 78780 58724" },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <div className="w-10 h-10 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center">
          <Dumbbell size={18} className="text-yellow-400" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">Centrum Gym — Shivam</p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-zinc-500 text-xs">Online · Gym Counselor</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4 text-zinc-600 text-xs">
          <span className="hidden sm:flex items-center gap-1"><Clock size={12} /> 5:30–11:30 AM · 4–10:30 PM</span>
          <span className="hidden sm:flex items-center gap-1"><Phone size={12} /> +91 78780 58724</span>
        </div>
      </div>

      {/* Lead captured banner */}
      {leadDone && (
        <div className="bg-green-500/10 border-b border-green-500/20 px-4 py-2.5 flex items-center gap-2 text-green-400 text-sm font-semibold">
          <CheckCircle size={15} />
          Your enquiry has been saved! Our team will contact you soon.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-2xl mx-auto w-full">
        {/* Gym info pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-2">
          {[
            { icon: MapPin,  text: "LN Plaza, Jhotwara, Jaipur" },
            { icon: Clock,   text: "5:30–11:30 AM · 4–10:30 PM" },
            { icon: Phone,   text: "+91 78780 58724" },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
              <Icon size={11} className="text-yellow-400" />{text}
            </span>
          ))}
        </div>

        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
              m.role === "assistant"
                ? "bg-yellow-400/10 border border-yellow-400/20"
                : "bg-blue-500/10 border border-blue-500/20"
            }`}>
              {m.role === "assistant"
                ? <Bot size={14} className="text-yellow-400" />
                : <User size={14} className="text-blue-400" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] space-y-1 ${m.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "assistant"
                  ? "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm"
                  : "bg-blue-600 text-white rounded-tr-sm"
              }`}>
                {m.content}
              </div>
              {m.leadCaptured && (
                <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
                  <CheckCircle size={11} /> Enquiry saved
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-yellow-400" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
              <Loader2 size={14} className="text-yellow-400 animate-spin" />
              <span className="text-zinc-500 text-sm">Typing…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && !loading && (
        <div className="px-4 pb-2 max-w-2xl mx-auto w-full">
          <div className="flex gap-2 flex-wrap">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)}
                className="text-xs bg-zinc-900 border border-zinc-700 hover:border-yellow-400/50 hover:text-yellow-400 text-zinc-400 px-3 py-1.5 rounded-full transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-3 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your message…"
            disabled={loading}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400 disabled:opacity-50 transition-colors"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors shrink-0"
          >
            <Send size={16} className="text-black" />
          </button>
        </div>
        <p className="text-center text-zinc-700 text-xs mt-2">Centrum Gym · 2nd Floor, LN Plaza, Niwaru Link Road, Jhotwara, Jaipur</p>
      </div>
    </div>
  );
}
