"use client";

import React from "react";
import {
  Undo2,
  Redo2,
  Download,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  Layers,
} from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";
import { useHistory } from "@/hooks/useHistory";
import { TooltipButton } from "@/components/ui/TooltipButton";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const ZOOM_PRESETS = [0.25, 0.5, 0.68, 0.75, 1.0, 1.25, 1.5, 2.0];

export function TopBar() {
  const document = useCanvasStore((s) => s.document);
  const updateDocumentProps = useCanvasStore((s) => s.updateDocumentProps);
  const { canUndo, canRedo, undo, redo } = useHistory();

  const zoom = useToolStore((s) => s.zoom);
  const setZoom = useToolStore((s) => s.setZoom);
  const zoomIn = useToolStore((s) => s.zoomIn);
  const zoomOut = useToolStore((s) => s.zoomOut);
  const resetViewport = useToolStore((s) => s.resetViewport);
  const setExportModalOpen = useToolStore((s) => s.setExportModalOpen);
  const toggleLayerDrawer = useToolStore((s) => s.toggleLayerDrawer);
  const isLayerDrawerOpen = useToolStore((s) => s.isLayerDrawerOpen);

  return (
    <header className="h-14 w-full flex items-center justify-between px-4 bg-zinc-900/75 backdrop-blur-2xl border-b border-zinc-800/80 z-30 select-none">
      {/* Left: Branding & Document Title */}
      <div className="flex items-center gap-3">
        {/* Studio Emblem */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-white/20">
            <Sparkles className="w-4 h-4 text-zinc-950" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-100 hidden sm:inline">
            Imagery
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            Studio
          </span>
        </div>

        <div className="w-px h-4 bg-zinc-800 hidden sm:block" />

        {/* Editable Title */}
        <input
          type="text"
          value={document.title}
          onChange={(e) => updateDocumentProps({ title: e.target.value })}
          className="text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-transparent hover:bg-zinc-800/50 px-2 py-1 rounded-lg border border-transparent hover:border-zinc-700/50 transition-all outline-none max-w-[160px] sm:max-w-[220px] truncate"
          placeholder="Untitled Design"
        />

        {/* Canvas Dimension Badge */}
        <span className="text-[11px] font-mono text-zinc-500 hidden md:inline px-2 py-0.5 rounded-md bg-zinc-800/40 border border-zinc-800">
          {document.width} × {document.height}
        </span>
      </div>

      {/* Center: Undo / Redo */}
      <div className="flex items-center gap-1 bg-zinc-800/60 p-1 rounded-xl border border-zinc-700/40">
        <TooltipButton
          tooltip="Undo"
          shortcut="Ctrl+Z"
          size="sm"
          disabled={!canUndo}
          onClick={undo}
        >
          <Undo2 className="w-3.5 h-3.5" />
        </TooltipButton>

        <TooltipButton
          tooltip="Redo"
          shortcut="Ctrl+Shift+Z"
          size="sm"
          disabled={!canRedo}
          onClick={redo}
        >
          <Redo2 className="w-3.5 h-3.5" />
        </TooltipButton>
      </div>

      {/* Right: Viewport Zoom, Layers, Export Trigger */}
      <div className="flex items-center gap-2">
        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 bg-zinc-800/60 p-1 rounded-xl border border-zinc-700/40">
          <TooltipButton tooltip="Zoom Out" size="sm" onClick={zoomOut}>
            <ZoomOut className="w-3.5 h-3.5" />
          </TooltipButton>

          {/* Zoom Preset Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-zinc-300 hover:text-zinc-100 rounded-lg hover:bg-zinc-700/50 outline-none transition-colors">
                <span>{Math.round(zoom * 100)}%</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={6}
                className="z-50 w-32 p-1 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700/60 rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95"
              >
                {ZOOM_PRESETS.map((preset) => (
                  <DropdownMenu.Item
                    key={preset}
                    onClick={() => setZoom(preset)}
                    className="flex items-center justify-between px-2.5 py-1.5 text-xs font-mono text-zinc-300 hover:bg-amber-500/20 hover:text-amber-300 rounded-lg cursor-pointer outline-none transition-colors"
                  >
                    <span>{Math.round(preset * 100)}%</span>
                    {preset === 1.0 && (
                      <span className="text-[10px] font-sans text-zinc-500">100%</span>
                    )}
                    {preset === 0.68 && (
                      <span className="text-[10px] font-sans text-amber-400">Fit</span>
                    )}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <TooltipButton tooltip="Zoom In" size="sm" onClick={zoomIn}>
            <ZoomIn className="w-3.5 h-3.5" />
          </TooltipButton>

          <TooltipButton tooltip="Fit to Screen" size="sm" onClick={resetViewport}>
            <Maximize2 className="w-3.5 h-3.5" />
          </TooltipButton>
        </div>

        {/* Layers Drawer Toggle */}
        <TooltipButton
          tooltip="Layer Stack"
          size="md"
          isActive={isLayerDrawerOpen}
          onClick={toggleLayerDrawer}
        >
          <Layers className="w-4 h-4" />
        </TooltipButton>

        {/* High-Res Export Action */}
        <button
          onClick={() => setExportModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.96] outline-none"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}
