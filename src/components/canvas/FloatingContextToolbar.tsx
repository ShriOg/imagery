"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";
import { TextElement, ShapeElement, ImageElement } from "@/types/canvas";

export function FloatingContextToolbar() {
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const document = useCanvasStore((s) => s.document);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const duplicateSelected = useCanvasStore((s) => s.duplicateSelected);
  const bringForward = useCanvasStore((s) => s.bringForward);
  const sendBackward = useCanvasStore((s) => s.sendBackward);
  const removeSelected = useCanvasStore((s) => s.removeSelected);
  const setCropModalOpen = useToolStore((s) => s.setCropModalOpen);

  if (selectedIds.length === 0) return null;

  const activeElement = document.elements.find((e) => e.id === selectedIds[0]);
  if (!activeElement) return null;

  const isMulti = selectedIds.length > 1;

  if (isMulti) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-5 px-7 py-3.5 bg-surface-container-high/95 backdrop-blur-3xl rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-outline-variant/15 z-30 select-none"
        >
          <span className="font-body-md text-xs sm:text-sm font-medium text-on-surface">
            {selectedIds.length} Items Selected
          </span>
          <div className="w-px h-6 bg-surface-variant"></div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={duplicateSelected}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors cursor-pointer"
            title="Duplicate Selected"
          >
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={removeSelected}
            className="p-1.5 text-error hover:bg-error-container hover:text-on-error-container rounded-full transition-colors cursor-pointer"
            title="Delete Selected"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </motion.button>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Extract element properties
  const isText = activeElement.type === "text";
  const isShape = activeElement.type === "shape";
  const isImage = activeElement.type === "image";
  const opacity = Math.round(activeElement.opacity * 100);

  const textEl = activeElement as TextElement;
  const shapeEl = activeElement as ShapeElement;
  const imgEl = activeElement as ImageElement;

  const fill = isText ? textEl.fill : isShape ? shapeEl.fill : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 sm:gap-5 px-6 sm:px-7 py-3 bg-surface-container-high/95 backdrop-blur-3xl rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-outline-variant/15 z-30 select-none max-w-[95vw] overflow-x-auto scrollbar-none"
      >
        {/* IMAGE SPECIFIC: Crop & Flip */}
        {isImage && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCropModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-on-primary font-semibold text-xs rounded-full shadow-md shadow-primary/20 hover:bg-primary-fixed transition-all cursor-pointer"
              title="Crop Image"
            >
              <span className="material-symbols-outlined text-[16px]">crop</span>
              <span>Crop</span>
            </motion.button>

            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateElement(activeElement.id, { flipX: !imgEl.flipX }, true)}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  imgEl.flipX ? "text-primary bg-surface-variant" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant"
                }`}
                title="Flip Horizontal"
              >
                <span className="material-symbols-outlined text-[18px]">flip</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateElement(activeElement.id, { flipY: !imgEl.flipY }, true)}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  imgEl.flipY ? "text-primary bg-surface-variant" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant"
                }`}
                title="Flip Vertical"
              >
                <span className="material-symbols-outlined text-[18px] rotate-90">flip</span>
              </motion.button>
            </div>

            <div className="w-px h-6 bg-surface-variant"></div>
          </>
        )}

        {/* TEXT SPECIFIC: Font & Size */}
        {isText && (
          <>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2.5 cursor-pointer group px-2 py-1 rounded-xl hover:bg-surface-variant/50 transition-colors"
              onClick={() => {
                const fonts = ["Inter", "Playfair Display", "Space Grotesk", "Plus Jakarta Sans"];
                const nextFont = fonts[(fonts.indexOf(textEl.fontFamily || "Inter") + 1) % fonts.length];
                updateElement(activeElement.id, { fontFamily: nextFont }, true);
              }}
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] group-hover:text-primary transition-colors">
                match_case
              </span>
              <div className="flex flex-col">
                <span className="font-body-md text-xs font-semibold text-on-surface">{textEl.fontFamily || "Inter"}</span>
                <span className="text-[9px] text-on-surface-variant">Click to cycle</span>
              </div>
            </motion.div>

            <div className="w-px h-6 bg-surface-variant"></div>

            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateElement(activeElement.id, { fontSize: Math.max(8, textEl.fontSize - 4) }, true)}
                className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-colors cursor-pointer"
                title="Decrease Font Size"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </motion.button>
              <span className="text-xs font-mono font-medium text-on-surface min-w-[32px] text-center">
                {textEl.fontSize}px
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateElement(activeElement.id, { fontSize: textEl.fontSize + 4 }, true)}
                className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-colors cursor-pointer"
                title="Increase Font Size"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </motion.button>
            </div>

            <div className="w-px h-6 bg-surface-variant"></div>
          </>
        )}

        {/* COLOR (Text & Shape) */}
        {(isText || isShape) && (
          <>
            <div className="flex items-center gap-2 relative cursor-pointer group px-2 py-1 rounded-xl hover:bg-surface-variant/50 transition-colors">
              <input
                type="color"
                value={fill || "#ffffff"}
                onChange={(e) => updateElement(activeElement.id, { fill: e.target.value }, true)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div
                className="w-5 h-5 rounded-full shadow-inner border border-outline-variant/30 ring-1 ring-white/10"
                style={{ backgroundColor: fill || "transparent" }}
              />
              <span className="font-mono text-xs text-on-surface uppercase font-medium">
                {fill || "NONE"}
              </span>
            </div>
            <div className="w-px h-6 bg-surface-variant"></div>
          </>
        )}

        {/* OPACITY (All) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 cursor-pointer group px-2 py-1 rounded-xl hover:bg-surface-variant/50 transition-colors"
          onClick={() => {
            const nextOpacity = activeElement.opacity > 0.9 ? 0.6 : activeElement.opacity > 0.4 ? 0.25 : 1.0;
            updateElement(activeElement.id, { opacity: nextOpacity }, true);
          }}
          title="Click to toggle opacity"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[18px] group-hover:text-primary transition-colors">
            opacity
          </span>
          <span className="text-xs font-mono text-on-surface">{opacity}%</span>
        </motion.div>

        <div className="w-px h-6 bg-surface-variant"></div>

        {/* UNIVERSAL ACTIONS: Layering, Duplicate, Delete */}
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => bringForward(activeElement.id)}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors cursor-pointer"
            title="Bring Forward"
          >
            <span className="material-symbols-outlined text-[18px]">flip_to_front</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendBackward(activeElement.id)}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors cursor-pointer"
            title="Send Backward"
          >
            <span className="material-symbols-outlined text-[18px]">flip_to_back</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const el = activeElement;
              const maxZ = document.elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
              const clone = {
                ...JSON.parse(JSON.stringify(el)),
                id: `el_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
                name: `${el.name || el.type} (Copy)`,
                x: el.x + 30,
                y: el.y + 30,
                zIndex: maxZ + 1,
              };
              useCanvasStore.getState().addElement(clone);
            }}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors cursor-pointer"
            title="Duplicate (Clone)"
          >
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={removeSelected}
            className="p-1.5 text-error hover:bg-error-container hover:text-on-error-container rounded-full transition-colors cursor-pointer"
            title="Delete"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

