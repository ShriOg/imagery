"use client";

import React, { useState } from "react";
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
      ? "p-3 text-primary bg-surface-variant rounded-xl shadow-inner transition-all outline-none"
      : "p-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-xl transition-all outline-none";

  return (
    <div className="absolute top-6 left-6 bottom-6 w-16 bg-surface-container/90 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/50 z-20 flex flex-col items-center py-6 gap-2">
      <button 
        className={getButtonClass(activeTool === "select")}
        onClick={() => handleToolSelect("select")}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTool === "select" ? "'FILL' 1" : "'FILL' 0" }}>
          arrow_selector_tool
        </span>
      </button>

      {/* Since hand tool wasn't in HTML, I'll add it below select or skip it. Let's add it cleanly. */}
      <button 
        className={getButtonClass(activeTool === "hand")}
        onClick={() => handleToolSelect("hand")}
        title="Pan Tool (H)"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTool === "hand" ? "'FILL' 1" : "'FILL' 0" }}>
          pan_tool
        </span>
      </button>

      <button 
        className={getButtonClass(activeTool === "text")}
        onClick={() => handleToolSelect("text")}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTool === "text" ? "'FILL' 1" : "'FILL' 0" }}>
          text_fields
        </span>
      </button>

      <Popover.Root open={isShapeMenuOpen} onOpenChange={setIsShapeMenuOpen}>
        <Popover.Trigger asChild>
          <button 
            className={getButtonClass(activeTool === "shape")}
            onClick={() => {
              setActiveTool("shape");
              setIsShapeMenuOpen(true);
            }}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTool === "shape" ? "'FILL' 1" : "'FILL' 0" }}>
              category
            </span>
          </button>
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
                <button
                  key={shape.kind}
                  onClick={() => {
                    setActiveShapeKind(shape.kind);
                    setIsShapeMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-xl transition-all outline-none",
                    isSelected && "bg-primary-container text-on-primary-container"
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">{shape.icon}</span>
                  <span>{shape.label}</span>
                </button>
              );
            })}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <button 
        className={getButtonClass(false)}
        onClick={() => handleToolSelect("image")}
      >
        <span className="material-symbols-outlined">image</span>
      </button>

      <div className="flex-1"></div>

      <button 
        className={getButtonClass(isLayerDrawerOpen)}
        onClick={toggleLayerDrawer}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isLayerDrawerOpen ? "'FILL' 1" : "'FILL' 0" }}>
          layers
        </span>
      </button>
    </div>
  );
}
