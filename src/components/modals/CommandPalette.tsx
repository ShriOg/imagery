"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToolStore } from "@/store/useToolStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { TextElement, ShapeElement, ImageElement } from "@/types/canvas";
import { useAIAssistant } from "@/hooks/useAIAssistant";

const AI_SUGGESTIONS = [
  { icon: "auto_awesome", label: "Generate Editorial Poster Layout", prompt: "Create a modern editorial luxury layout with stylish typography" },
  { icon: "palette", label: "Apply Warm Amber Studio Lighting", prompt: "Add a soft amber backdrop glow and tint shapes" },
  { icon: "format_quote", label: "Add Luxury Typography Header", prompt: "Add an elegant Playfair Display headline with subtle subtitle" },
  { icon: "crop_square", label: "Add Minimal Geometric Frame", prompt: "Add subtle geometric framing and border accent" },
  { icon: "align_horizontal_center", label: "Align & Center Elements", prompt: "Center all active elements on the canvas symmetrically" },
];

export function CommandPalette() {
  const isAiPaletteOpen = useToolStore((s) => s.isAiPaletteOpen);
  const setAiPaletteOpen = useToolStore((s) => s.setAiPaletteOpen);
  const isGenerating = useToolStore((s) => s.isGenerating);
  const setIsGenerating = useToolStore((s) => s.setIsGenerating);

  const document = useCanvasStore((s) => s.document);
  const addElement = useCanvasStore((s) => s.addElement);
  const updateDocumentProps = useCanvasStore((s) => s.updateDocumentProps);
  const commitHistory = useCanvasStore((s) => s.commitHistory);

  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAiPaletteOpen(!useToolStore.getState().isAiPaletteOpen);
      }
      if (e.key === "Escape" && useToolStore.getState().isAiPaletteOpen) {
        setAiPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setAiPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isAiPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setPrompt("");
    }
  }, [isAiPaletteOpen]);

  const { executePrompt } = useAIAssistant();

  // Execute AI action on the canvas
  const handleExecutePrompt = async (userPrompt: string) => {
    if (!userPrompt.trim() || isGenerating) return;
    await executePrompt(userPrompt);
  };

  return (
    <AnimatePresence>
      {isAiPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isGenerating && setAiPaletteOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-md"
          />

          {/* Floating AI Command Modal */}
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative w-full max-w-2xl p-[1.5px] rounded-3xl bg-gradient-to-r from-primary-fixed-dim/60 via-purple-500/40 to-primary/60 shadow-[0_20px_70px_rgba(0,0,0,0.8),0_0_40px_rgba(251,188,0,0.2)] overflow-hidden"
          >
            <div className="relative bg-surface-container/95 backdrop-blur-3xl rounded-[23px] p-5 flex flex-col gap-4">
              {/* Top Row: AI Icon, Input, Shortcut Badge */}
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                  isGenerating 
                    ? "bg-primary text-on-primary animate-spin" 
                    : "bg-primary/20 text-primary"
                }`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {isGenerating ? "progress_activity" : "auto_awesome"}
                  </span>
                </div>

                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    disabled={isGenerating}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleExecutePrompt(prompt);
                    }}
                    placeholder={isGenerating ? "AI is styling your canvas..." : "Ask AI to generate, style, or arrange..."}
                    className={`w-full bg-transparent text-lg sm:text-xl font-medium outline-none transition-colors ${
                      isGenerating
                        ? "text-primary animate-pulse font-semibold"
                        : "text-on-surface placeholder:text-on-surface-variant/40"
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex text-[11px] font-mono font-medium text-on-surface-variant bg-surface-variant px-2.5 py-1 rounded-lg border border-outline-variant/20">
                    ↵ Return
                  </span>
                  <button
                    onClick={() => !isGenerating && setAiPaletteOpen(false)}
                    className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors outline-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>

              {/* Generating Animated Progress Bar */}
              {isGenerating && (
                <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                    className="w-1/2 h-full bg-gradient-to-r from-primary-fixed-dim via-primary to-purple-400 rounded-full"
                  />
                </div>
              )}

              {/* Suggestions Chips */}
              {!isGenerating && (
                <div className="pt-2 border-t border-outline-variant/10 flex flex-col gap-1.5">
                  <span className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold px-2">
                    Quick AI Actions
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {AI_SUGGESTIONS.map((sugg) => (
                      <button
                        key={sugg.label}
                        onClick={() => handleExecutePrompt(sugg.prompt)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-all cursor-pointer text-left group"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary group-hover:scale-110 transition-transform">
                          {sugg.icon}
                        </span>
                        <span className="truncate">{sugg.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
