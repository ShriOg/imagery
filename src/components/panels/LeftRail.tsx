"use client";

import React, { useState } from "react";
import {
  MousePointer,
  Hand,
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  Minus,
  Image as ImageIcon,
  Layers,
  ChevronRight,
} from "lucide-react";
import { useToolStore, ToolType } from "@/store/useToolStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { ShapeKind } from "@/types/canvas";
import { TooltipButton } from "@/components/ui/TooltipButton";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const SHAPES: Array<{ kind: ShapeKind; label: string; icon: React.ReactNode }> = [
  { kind: "rectangle", label: "Rectangle", icon: <Square className="w-4 h-4" /> },
  { kind: "circle", label: "Circle", icon: <Circle className="w-4 h-4" /> },
  { kind: "ellipse", label: "Ellipse", icon: <div className="w-4 h-3 rounded-full border border-current" /> },
  { kind: "triangle", label: "Triangle", icon: <Triangle className="w-4 h-4" /> },
  { kind: "star", label: "Star", icon: <Star className="w-4 h-4" /> },
  { kind: "line", label: "Line / Arrow", icon: <Minus className="w-4 h-4" /> },
];

export function LeftRail() {
  const activeTool = useToolStore((s) => s.activeTool);
  const activeShapeKind = useToolStore((s) => s.activeShapeKind);
  const setActiveTool = useToolStore((s) => s.setActiveTool);
  const setActiveShapeKind = useToolStore((s) => s.setActiveShapeKind);
  const setAssetModalOpen = useToolStore((s) => s.setAssetModalOpen);
  const toggleLayerDrawer = useToolStore((s) => s.toggleLayerDrawer);
  const isLayerDrawerOpen = useToolStore((s) => s.isLayerDrawerOpen);
  const document = useCanvasStore((s) => s.document);

  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);

  const handleToolSelect = (tool: ToolType) => {
    if (tool === "image") {
      setAssetModalOpen(true);
    } else {
      setActiveTool(tool);
    }
  };

  return (
    <aside className="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 p-2 bg-zinc-900/90 backdrop-blur-2xl border border-zinc-700/60 rounded-3xl shadow-floating select-none">
      {/* Select Tool */}
      <TooltipButton
        tooltip="Select & Transform"
        shortcut="V"
        side="right"
        isActive={activeTool === "select"}
        onClick={() => handleToolSelect("select")}
      >
        <MousePointer className="w-4 h-4" />
      </TooltipButton>

      {/* Hand Tool */}
      <TooltipButton
        tooltip="Hand / Pan Tool"
        shortcut="H / Space"
        side="right"
        isActive={activeTool === "hand"}
        onClick={() => handleToolSelect("hand")}
      >
        <Hand className="w-4 h-4" />
      </TooltipButton>

      <div className="w-6 h-px bg-zinc-800 self-center my-0.5" />

      {/* Text Tool */}
      <TooltipButton
        tooltip="Insert Text"
        shortcut="T"
        side="right"
        isActive={activeTool === "text"}
        onClick={() => handleToolSelect("text")}
      >
        <Type className="w-4 h-4" />
      </TooltipButton>

      {/* Shape Tool with Popover */}
      <Popover.Root open={isShapeMenuOpen} onOpenChange={setIsShapeMenuOpen}>
        <Popover.Trigger asChild>
          <div className="relative">
            <TooltipButton
              tooltip="Shapes"
              shortcut="S"
              side="right"
              isActive={activeTool === "shape"}
              onClick={() => {
                setActiveTool("shape");
                setIsShapeMenuOpen(true);
              }}
            >
              {activeShapeKind === "rectangle" && <Square className="w-4 h-4" />}
              {activeShapeKind === "circle" && <Circle className="w-4 h-4" />}
              {activeShapeKind === "ellipse" && <div className="w-4 h-3 rounded-full border border-current" />}
              {activeShapeKind === "triangle" && <Triangle className="w-4 h-4" />}
              {activeShapeKind === "star" && <Star className="w-4 h-4" />}
              {activeShapeKind === "line" && <Minus className="w-4 h-4" />}
            </TooltipButton>
          </div>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="right"
            sideOffset={12}
            className="z-50 w-44 p-1.5 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700/60 rounded-2xl shadow-2xl flex flex-col gap-0.5 animate-in fade-in-0 zoom-in-95"
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
                    "flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-xl transition-all outline-none",
                    isSelected && "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  )}
                >
                  <div className="text-zinc-400">{shape.icon}</div>
                  <span>{shape.label}</span>
                </button>
              );
            })}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Image Tool */}
      <TooltipButton
        tooltip="Stock & Upload Image"
        shortcut="I"
        side="right"
        onClick={() => handleToolSelect("image")}
      >
        <ImageIcon className="w-4 h-4" />
      </TooltipButton>

      <div className="w-6 h-px bg-zinc-800 self-center my-0.5" />

      {/* Layer Stack Drawer Toggle */}
      <div className="relative">
        <TooltipButton
          tooltip="Layer Stack"
          shortcut="L"
          side="right"
          isActive={isLayerDrawerOpen}
          onClick={toggleLayerDrawer}
        >
          <Layers className="w-4 h-4" />
        </TooltipButton>
        {document.elements.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold flex items-center justify-center pointer-events-none shadow-sm">
            {document.elements.length}
          </span>
        )}
      </div>
    </aside>
  );
}
