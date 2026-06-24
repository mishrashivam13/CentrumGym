"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, CheckCircle, Info, X, Trash2, Send } from "lucide-react";

/* ── Types ── */
type DialogType = "confirm-delete" | "confirm" | "confirm-send" | "alert" | "alert-success" | "alert-warn";

interface DialogState {
  type:           DialogType;
  title:          string;
  message:        string;
  confirmLabel?:  string;
  cancelLabel?:   string;
  onConfirm?:     () => void;
  onCancel?:      () => void;
  onClose?:       () => void;
}

/* ── Config per type ── */
const TYPE_CONFIG: Record<DialogType, { icon: React.ElementType; iconClass: string; btnClass: string; defaultConfirm: string }> = {
  "confirm-delete": { icon: Trash2,        iconClass: "text-red-400 bg-red-400/10",      btnClass: "bg-red-500 hover:bg-red-400 text-white",           defaultConfirm: "Delete" },
  "confirm":        { icon: AlertTriangle,  iconClass: "text-yellow-400 bg-yellow-400/10", btnClass: "bg-yellow-400 hover:bg-yellow-300 text-black",     defaultConfirm: "Confirm" },
  "confirm-send":   { icon: Send,           iconClass: "text-green-400 bg-green-400/10",   btnClass: "bg-green-500 hover:bg-green-400 text-white",       defaultConfirm: "Send" },
  "alert":          { icon: Info,           iconClass: "text-blue-400 bg-blue-400/10",     btnClass: "bg-blue-500 hover:bg-blue-400 text-white",         defaultConfirm: "OK" },
  "alert-success":  { icon: CheckCircle,    iconClass: "text-green-400 bg-green-400/10",   btnClass: "bg-green-500 hover:bg-green-400 text-white",       defaultConfirm: "OK" },
  "alert-warn":     { icon: AlertTriangle,  iconClass: "text-orange-400 bg-orange-400/10", btnClass: "bg-orange-400 hover:bg-orange-300 text-black",     defaultConfirm: "OK" },
};

/* ── Dialog UI ── */
export function Dialog({ state, onResolve }: { state: DialogState; onResolve: (ok: boolean) => void }) {
  const cfg  = TYPE_CONFIG[state.type];
  const Icon = cfg.icon;
  const isAlert = state.type.startsWith("alert");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => onResolve(false)} />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Close */}
        <button onClick={() => onResolve(false)}
          className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors">
          <X size={16} />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${cfg.iconClass}`}>
            <Icon size={22} />
          </div>

          {/* Text */}
          <h3 className="text-white font-bold text-base mb-2">{state.title}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{state.message}</p>

          {/* Buttons */}
          <div className={`flex gap-2 mt-6 ${isAlert ? "" : "flex-row-reverse"}`}>
            <button onClick={() => onResolve(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${cfg.btnClass}`}>
              {state.confirmLabel ?? cfg.defaultConfirm}
            </button>
            {!isAlert && (
              <button onClick={() => onResolve(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-zinc-700">
                {state.cancelLabel ?? "Cancel"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Hook ── */
export function useDialog() {
  const [state, setState] = useState<(DialogState & { resolve: (ok: boolean) => void }) | null>(null);

  const show = useCallback((opts: Omit<DialogState, "onConfirm" | "onCancel" | "onClose">): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...opts, resolve });
    });
  }, []);

  const dialog = state ? (
    <Dialog
      state={state}
      onResolve={(ok) => { state.resolve(ok); setState(null); }}
    />
  ) : null;

  return { dialog, show };
}
