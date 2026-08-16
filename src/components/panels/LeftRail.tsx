"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useToolStore, ToolType } from "@/store/useToolStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { ShapeKind } from "@/types/canvas";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const SHAPES: Array<{ kind: ShapeKind; label: string; icon: string }> = [
  { kind: "rectangle", label: "Rectangle", icon: "square" },
  { kind: "circle", label: "Circle", icon: "circle" },
  { kind: "ellipse", label: "Ellipse", icon: "radio_button_unchecked" },
  { kind: "triangle", label: "Triangle", icon: "change_history" },
  { kind: "star", label: "Star", icon: "star" },
  { kind: "line", label: "Line / Arrow", icon: "horizontal_rule" },
];

export function LeftRail() {
  const activeTool = useToolStore((s) => s.activeTool);
  const activeShapeKind = useToolStore((s) => s.activeShapeKind);
  const setActiveTool = useToolStore((s) => s.setActiveTool);
  const setActiveShapeKind = useToolStore((s) => s.setActiveShapeKind);
  const setAssetModalOpen = useToolStore((s) => s.setAssetModalOpen);
  const toggleLayerDrawer = useToolStore((s) => s.toggleLayerDrawer);
  const isLayerDrawerOpen = useToolStore((s) => s.isLayerDrawerOpen);

  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);

  const handleToolSelect = (tool: ToolType) => {
    if (tool === "image") {
      setAssetModalOpen(true);
    } else {
      setActiveTool(tool);
    }
  };

  const getButtonClass = (isActive: boolean) => 
    isActive 
      ? "p-3 text-primary bg-surface-variant rounded-xl shadow-inner transition-all outline-none cursor-pointer"
      : "p-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-xl transition-all outline-none cursor-pointer";

  return (
    <div className="absolute top-6 left-6 bottom-6 w-16 bg-surface-container/90 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/50 z-20 flex flex-col items-center py-6 gap-2 select-none border border-outline-variant/10">
      {/* Select Tool */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative p-3 rounded-xl transition-colors outline-none cursor-pointer ${
          activeTool === "select" ? "text-primary" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40"
        }`}
        onClick={() => handleToolSelect("select")}
        title="Select Tool (V)"
      >
        {activeTool === "select" && (
          <motion.div
            layoutId="activeToolIndicator"
            className="absolute inset-0 bg-primary/20 border border-primary/40 rounded-xl shadow-[0_0_15px_rgba(251,188,0,0.15)]"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative z-10 material-symbols-outlined" style={{ fontVariationSettings: activeTool === "select" ? "'FILL' 1" : "'FILL' 0" }}>
          arrow_selector_tool
        </span>
      </motion.button>

      {/* Hand / Pan Tool */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative p-3 rounded-xl transition-colors outline-none cursor-pointer ${
          activeTool === "hand" ? "text-primary" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40"
        }`}
        onClick={() => handleToolSelect("hand")}
        title="Pan Tool (H or Spacebar)"
      >
        {activeTool === "hand" && (
          <motion.div
            layoutId="activeToolIndicator"
            className="absolute inset-0 bg-primary/20 border border-primary/40 rounded-xl shadow-[0_0_15px_rgba(251,188,0,0.15)]"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative z-10 material-symbols-outlined" style={{ fontVariationSettings: activeTool === "hand" ? "'FILL' 1" : "'FILL' 0" }}>
          pan_tool
        </span>
      </motion.button>

      {/* Text Tool */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative p-3 rounded-xl transition-colors outline-none cursor-pointer ${
          activeTool === "text" ? "text-primary" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40"
        }`}
        onClick={() => handleToolSelect("text")}
        title="Text Tool (T)"
      >
        {activeTool === "text" && (
          <motion.div
            layoutId="activeToolIndicator"
            className="absolute inset-0 bg-primary/20 border border-primary/40 rounded-xl shadow-[0_0_15px_rgba(251,188,0,0.15)]"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative z-10 material-symbols-outlined" style={{ fontVariationSettings: activeTool === "text" ? "'FILL' 1" : "'FILL' 0" }}>
          text_fields
        </span>
      </motion.button>

      {/* Shapes Tool */}
      <Popover.Root open={isShapeMenuOpen} onOpenChange={setIsShapeMenuOpen}>
        <Popover.Trigger asChild>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-3 rounded-xl transition-colors outline-none cursor-pointer ${
              activeTool === "shape" ? "text-primary" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40"
            }`}
            onClick={() => {
              setActiveTool("shape");
              setIsShapeMenuOpen(true);
            }}
            title="Shapes (U)"
          >
            {activeTool === "shape" && (
              <motion.div
                layoutId="activeToolIndicator"
                className="absolute inset-0 bg-primary/20 border border-primary/40 rounded-xl shadow-[0_0_15px_rgba(251,188,0,0.15)]"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10 material-symbols-outlined" style={{ fontVariationSettings: activeTool === "shape" ? "'FILL' 1" : "'FILL' 0" }}>
              category
            </span>
          </motion.button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="right"
            sideOffset={12}
            className="z-50 w-44 p-1.5 bg-surface-container-high/95 backdrop-blur-2xl border border-outline-variant/20 rounded-2xl shadow-2xl flex flex-col gap-0.5 animate-in fade-in-0 zoom-in-95"
          >
            {SHAPES.map((shape) => {
              const isSelected = activeTool === "shape" && activeShapeKind === shape.kind;
              return (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={shape.kind}
                  onClick={() => {
                    setActiveShapeKind(shape.kind);
                    setIsShapeMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-xl transition-all outline-none cursor-pointer",
                    isSelected && "bg-primary-container text-on-primary-container"
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">{shape.icon}</span>
                  <span>{shape.label}</span>
                </motion.button>
              );
            })}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Asset / Image Tool */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40 rounded-xl transition-colors outline-none cursor-pointer"
        onClick={() => handleToolSelect("image")}
        title="Asset Library / Upload"
      >
        <span className="relative z-10 material-symbols-outlined">image</span>
      </motion.button>

      <div className="flex-1"></div>

      {/* Layer Drawer Toggle */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative p-3 rounded-xl transition-colors outline-none cursor-pointer ${
          isLayerDrawerOpen ? "text-primary bg-primary/15 border border-primary/30" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40"
        }`}
        onClick={toggleLayerDrawer}
        title="Layer Stack Drawer"
      >
        <span className="relative z-10 material-symbols-outlined" style={{ fontVariationSettings: isLayerDrawerOpen ? "'FILL' 1" : "'FILL' 0" }}>
          layers
        </span>
      </motion.button>
    </div>
  );
}

