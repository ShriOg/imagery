"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCanvasStore } from "@/store/useCanvasStore";
import { TextElement, ShapeElement } from "@/types/canvas";

export function FloatingContextToolbar() {
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const document = useCanvasStore((s) => s.document);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const bringForward = useCanvasStore((s) => s.bringForward);
  const sendBackward = useCanvasStore((s) => s.sendBackward);
  const removeSelected = useCanvasStore((s) => s.removeSelected);

  if (selectedIds.length === 0) return null;

  const activeElement = document.elements.find((e) => e.id === selectedIds[0]);
  if (!activeElement) return null;

  const isMulti = selectedIds.length > 1;

  if (isMulti) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 bg-surface-container-high/95 backdrop-blur-3xl rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-30"
        >
          <span className="font-body-md text-on-surface">{selectedIds.length} Items Selected</span>
          <div className="w-px h-8 bg-surface-variant"></div>
          <button onClick={removeSelected} className="p-2 text-error hover:bg-surface-variant rounded-full transition-colors">
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Extract shared properties
  const isText = activeElement.type === "text";
  const isShape = activeElement.type === "shape";
  const opacity = Math.round(activeElement.opacity * 100);
  
  const textEl = activeElement as TextElement;
  const shapeEl = activeElement as ShapeElement;

  const fill = isText ? textEl.fill : isShape ? shapeEl.fill : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.96 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 bg-surface-container-high/95 backdrop-blur-3xl rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-30"
      >
        
        {/* TEXT SPECIFIC: Font & Size */}
        {isText && (
          <>
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {
              const fonts = ["Inter", "Playfair Display", "Space Grotesk"];
              const nextFont = fonts[(fonts.indexOf(textEl.fontFamily || "Inter") + 1) % fonts.length];
              updateElement(activeElement.id, { fontFamily: nextFont }, true);
            }}>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px] group-hover:text-primary transition-colors">match_case</span>
              <div className="flex flex-col">
                <span className="font-body-md text-body-md text-on-surface">{textEl.fontFamily || "Inter"}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Click to cycle</span>
              </div>
            </div>
            
            <div className="w-px h-8 bg-surface-variant"></div>
            
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {
              updateElement(activeElement.id, { fontSize: textEl.fontSize + 4 }, true);
            }} onContextMenu={(e) => {
              e.preventDefault();
              updateElement(activeElement.id, { fontSize: Math.max(8, textEl.fontSize - 4) }, true);
            }} title="Left click to increase, Right click to decrease">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px] group-hover:text-primary transition-colors">format_size</span>
              <span className="font-body-md text-body-md text-on-surface">{textEl.fontSize}px</span>
            </div>

            <div className="w-px h-8 bg-surface-variant"></div>
          </>
        )}

        {/* COLOR (Text & Shape) */}
        {(isText || isShape) && (
          <>
            <div className="flex items-center gap-3 relative">
              <input 
                type="color" 
                value={fill || "#ffffff"} 
                onChange={(e) => updateElement(activeElement.id, { fill: e.target.value }, true)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-6 h-6 rounded-full shadow-inner border border-outline-variant/30" style={{ backgroundColor: fill || "transparent" }}></div>
              <span className="font-label-md text-label-md text-on-surface uppercase">{fill || "NONE"}</span>
            </div>
            <div className="w-px h-8 bg-surface-variant"></div>
          </>
        )}

        {/* OPACITY (All) */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {
           const nextOpacity = activeElement.opacity > 0.9 ? 0.5 : activeElement.opacity > 0.4 ? 0.2 : 1.0;
           updateElement(activeElement.id, { opacity: nextOpacity }, true);
        }}>
          <span className="material-symbols-outlined text-on-surface-variant text-[20px] group-hover:text-primary transition-colors">opacity</span>
          <span className="font-body-md text-body-md text-on-surface">{opacity}%</span>
        </div>
        
        <div className="w-px h-8 bg-surface-variant"></div>
        
        {/* ORDERING (All) */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => bringForward(activeElement.id)}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors outline-none" title="Bring Forward">
            <span className="material-symbols-outlined text-[20px]">flip_to_front</span>
          </button>
          <button 
            onClick={() => sendBackward(activeElement.id)}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors outline-none" title="Send Backward">
            <span className="material-symbols-outlined text-[20px]">flip_to_back</span>
          </button>
          <button 
            onClick={removeSelected}
            className="p-2 text-error hover:bg-error-container hover:text-on-error-container rounded-full transition-colors outline-none" title="Delete">
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
