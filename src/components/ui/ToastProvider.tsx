"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export function ToastProvider() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: any; onRemove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), toast.duration || 3500);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, onRemove]);

  const isError = toast.message?.toLowerCase().includes("fail") || toast.message?.toLowerCase().includes("error");
  const isAI = toast.message?.toLowerCase().includes("ai") || toast.message?.toLowerCase().includes("enchant");
  const isUndo = !!toast.action;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 32, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.94, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-2xl pointer-events-auto select-none overflow-hidden
        border shadow-[0_12px_40px_rgba(0,0,0,0.5)]
        ${isError
          ? "bg-[#1f0a0a] border-red-500/25 text-red-200"
          : isAI
          ? "bg-[#12111a] border-purple-500/20 text-purple-100"
          : "bg-surface-container-highest/95 border-outline-variant/20 text-on-surface"
        }
      `}
      style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
    >
      {/* Progress bar auto-dismiss */}
      <motion.div
        className={`absolute bottom-0 left-0 h-[2px] rounded-b-2xl ${
          isError ? "bg-red-500/50" : isAI ? "bg-purple-500/50" : "bg-primary/40"
        }`}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: (toast.duration || 3500) / 1000, ease: "linear" }}
      />

      {/* Icon */}
      <div className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center ${
        isError ? "bg-red-500/15" : isAI ? "bg-purple-500/15" : "bg-primary/12"
      }`}>
        <span className={`material-symbols-outlined text-[16px] ${
          isError ? "text-red-400" : isAI ? "text-purple-400" : "text-primary"
        }`}>
          {isError ? "error" : isAI ? "auto_awesome" : "check_circle"}
        </span>
      </div>

      <span className="text-[13px] font-medium leading-tight flex-1">{toast.message}</span>

      {toast.action && (
        <>
          <div className="w-px h-4 bg-outline-variant/30 shrink-0" />
          <button
            onClick={() => {
              toast.action?.onClick();
              onRemove(toast.id);
            }}
            className="text-xs font-bold text-primary hover:text-primary-fixed transition-colors cursor-pointer shrink-0 px-1 py-0.5 rounded hover:bg-primary/10"
          >
            {toast.action.label}
          </button>
        </>
      )}

      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 text-on-surface-variant/40 hover:text-on-surface/70 transition-colors cursor-pointer ml-1"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    </motion.div>
  );
}
