"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  X,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Type,
  Square,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit2,
  Check,
} from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";
import { CanvasElement } from "@/types/canvas";
import { cn } from "@/lib/utils";

export function LayerDrawer() {
  const isLayerDrawerOpen = useToolStore((s) => s.isLayerDrawerOpen);
  const setLayerDrawerOpen = useToolStore((s) => s.setLayerDrawerOpen);

  const document = useCanvasStore((s) => s.document);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const setSelectedIds = useCanvasStore((s) => s.setSelectedIds);
  const toggleVisibility = useCanvasStore((s) => s.toggleVisibility);
  const toggleLock = useCanvasStore((s) => s.toggleLock);
  const bringForward = useCanvasStore((s) => s.bringForward);
  const sendBackward = useCanvasStore((s) => s.sendBackward);
  const removeElement = useCanvasStore((s) => s.removeElement);
  const renameElement = useCanvasStore((s) => s.renameElement);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameValue, setNameValue] = useState("");

  // Sort descending by zIndex for top-to-bottom visual hierarchy
  const layersDescending = [...document.elements].sort((a, b) => b.zIndex - a.zIndex);

  const handleStartRename = (el: CanvasElement) => {
    setEditingId(el.id);
    setNameValue(el.name || `${el.type} ${el.zIndex}`);
  };

  const handleSaveRename = (id: string) => {
    if (nameValue.trim()) {
      renameElement(id, nameValue.trim());
    }
    setEditingId(null);
  };

  const getElementIcon = (el: CanvasElement) => {
    switch (el.type) {
      case "text":
        return <Type className="w-3.5 h-3.5 text-amber-400" />;
      case "shape":
        return <Square className="w-3.5 h-3.5 text-emerald-400" />;
      case "image":
        return <ImageIcon className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isLayerDrawerOpen && (
        <motion.aside
          initial={{ opacity: 0, x: 280 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 280 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute right-4 top-18 bottom-4 w-72 bg-zinc-900/90 backdrop-blur-2xl border border-zinc-700/60 rounded-3xl shadow-floating z-30 flex flex-col overflow-hidden select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
                Layers
              </span>
              <span className="text-[11px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-md">
                {document.elements.length}
              </span>
            </div>
            <button
              onClick={() => setLayerDrawerOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Layer List */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
            {layersDescending.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                <Layers className="w-8 h-8 text-zinc-600 mb-2" />
                <span className="text-xs font-medium text-zinc-400">No layers yet</span>
                <span className="text-[11px] text-zinc-600 mt-1">
                  Add text, shapes, or images from the left rail.
                </span>
              </div>
            ) : (
              layersDescending.map((el) => {
                const isSelected = selectedIds.includes(el.id);
                const isEditing = editingId === el.id;

                return (
                  <div
                    key={el.id}
                    onClick={() => {
                      if (!el.locked) {
                        setSelectedIds([el.id]);
                      }
                    }}
                    className={cn(
                      "group flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer border",
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-200"
                        : "bg-zinc-800/40 hover:bg-zinc-800/80 border-transparent text-zinc-300",
                      !el.visible && "opacity-40",
                      el.locked && "border-zinc-700/40"
                    )}
                  >
                    {/* Left: Icon & Label */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                      <div className="flex-shrink-0">{getElementIcon(el)}</div>

                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="text"
                            value={nameValue}
                            onChange={(e) => setNameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(el.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            autoFocus
                            className="w-full px-1.5 py-0.5 text-xs text-zinc-100 bg-zinc-900 border border-amber-500 rounded outline-none"
                          />
                          <button
                            onClick={() => handleSaveRename(el.id)}
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span
                          onDoubleClick={() => handleStartRename(el)}
                          className="truncate font-medium flex-1"
                        >
                          {el.name || `${el.type} (${el.zIndex})`}
                        </span>
                      )}
                    </div>

                    {/* Right Actions: Reorder, Visibility, Lock, Delete */}
                    <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Bring Forward"
                        onClick={(e) => {
                          e.stopPropagation();
                          bringForward(el.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-700/50"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>

                      <button
                        title="Send Backward"
                        onClick={(e) => {
                          e.stopPropagation();
                          sendBackward(el.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-700/50"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      <button
                        title={el.visible ? "Hide Layer" : "Show Layer"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVisibility(el.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-700/50"
                      >
                        {el.visible ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-zinc-500" />
                        )}
                      </button>

                      <button
                        title={el.locked ? "Unlock Layer" : "Lock Layer"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLock(el.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-700/50"
                      >
                        {el.locked ? (
                          <Lock className="w-3 h-3 text-amber-400" />
                        ) : (
                          <Unlock className="w-3 h-3 text-zinc-500" />
                        )}
                      </button>

                      <button
                        title="Delete Layer"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeElement(el.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-rose-400 rounded hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
