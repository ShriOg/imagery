"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export function ToastProvider() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center gap-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface shadow-[0_8px_30px_rgba(0,0,0,0.4)] px-4 py-2.5 rounded-xl pointer-events-auto select-none"
          >
            <span className="text-sm font-medium">{toast.message}</span>
            {toast.action && (
              <>
                <div className="w-px h-4 bg-outline-variant/30" />
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    removeToast(toast.id);
                  }}
                  className="text-xs font-bold text-primary hover:text-primary-fixed hover:underline transition-colors cursor-pointer"
                >
                  {toast.action.label}
                </button>
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
