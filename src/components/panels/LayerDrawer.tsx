"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
        return "text_fields";
      case "shape":
        return "category";
      case "image":
        return "image";
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
          className="absolute right-4 top-28 bottom-4 w-72 bg-surface-container-high/95 backdrop-blur-2xl border border-outline-variant/20 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-30 flex flex-col overflow-hidden select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-primary">layers</span>
              <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
                Layers
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-md">
                {document.elements.length}
              </span>
            </div>
            <button
              onClick={() => setLayerDrawerOpen(false)}
              className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors outline-none"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Layer List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {layersDescending.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant/50 mb-2">layers_clear</span>
                <span className="font-body-md text-on-surface-variant">No layers yet</span>
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
                      "group flex items-center justify-between p-3 rounded-2xl text-xs transition-all cursor-pointer border",
                      isSelected
                        ? "bg-primary-container border-primary/20 text-on-primary-container"
                        : "bg-surface-variant/40 hover:bg-surface-variant border-transparent text-on-surface-variant",
                      !el.visible && "opacity-40",
                      el.locked && "border-outline-variant/10"
                    )}
                  >
                    {/* Left: Icon & Label */}
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                      <div className="flex-shrink-0">
                        <span className="material-symbols-outlined text-[16px]">
                          {getElementIcon(el)}
                        </span>
                      </div>

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
                            className="w-full px-2 py-1 text-xs font-body-sm text-on-surface bg-surface-container border border-primary/50 rounded outline-none"
                          />
                          <button
                            onClick={() => handleSaveRename(el.id)}
                            className="p-1 text-primary hover:text-primary-fixed"
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          </button>
                        </div>
                      ) : (
                        <span
                          onDoubleClick={() => handleStartRename(el)}
                          className={cn(
                            "truncate font-label-md flex-1",
                            isSelected ? "text-on-primary-container" : "text-on-surface"
                          )}
                        >
                          {el.name || `${el.type} (${el.zIndex})`}
                        </span>
                      )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Bring Forward"
                        onClick={(e) => {
                          e.stopPropagation();
                          bringForward(el.id);
                        }}
                        className="p-1 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-high outline-none"
                      >
                        <span className="material-symbols-outlined text-[16px]">keyboard_arrow_up</span>
                      </button>

                      <button
                        title="Send Backward"
                        onClick={(e) => {
                          e.stopPropagation();
                          sendBackward(el.id);
                        }}
                        className="p-1 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-high outline-none"
                      >
                        <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
                      </button>

                      <button
                        title={el.visible ? "Hide" : "Show"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVisibility(el.id);
                        }}
                        className="p-1 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-high outline-none"
                      >
                        <span className="material-symbols-outlined text-[16px]">{el.visible ? "visibility" : "visibility_off"}</span>
                      </button>

                      <button
                        title={el.locked ? "Unlock" : "Lock"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLock(el.id);
                        }}
                        className="p-1 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-high outline-none"
                      >
                        <span className="material-symbols-outlined text-[16px]">{el.locked ? "lock" : "lock_open"}</span>
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
