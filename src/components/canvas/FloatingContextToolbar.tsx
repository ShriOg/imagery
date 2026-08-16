"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Popover from "@radix-ui/react-popover";
import * as Slider from "@radix-ui/react-slider";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";
import { TextElement, ShapeElement, ImageElement } from "@/types/canvas";
import { useAIImageModifier } from "@/hooks/useAIImageModifier";

export function FloatingContextToolbar() {
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const document = useCanvasStore((s) => s.document);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const duplicateSelected = useCanvasStore((s) => s.duplicateSelected);
  const bringForward = useCanvasStore((s) => s.bringForward);
  const sendBackward = useCanvasStore((s) => s.sendBackward);
  const removeSelected = useCanvasStore((s) => s.removeSelected);
  const setCropModalOpen = useToolStore((s) => s.setCropModalOpen);
  const { modifyImage, isGenerating } = useAIImageModifier();

  const isMulti = selectedIds.length > 1;
  const activeElement = selectedIds.length === 1 ? document.elements.find((e) => e.id === selectedIds[0]) : null;

  // Local state for AI input
  const [aiPrompt, setAiPrompt] = React.useState("");
  const [isAIPopoverOpen, setIsAIPopoverOpen] = React.useState(false);

  return (
    <AnimatePresence>
      {isMulti && (
        <motion.div
          key="toolbar-multi"
          layout
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 450, damping: 28 }}
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
      )}

      {!isMulti && activeElement && (
        <SingleElementToolbar activeElement={activeElement} />
      )}
    </AnimatePresence>
  );
}

function SingleElementToolbar({ activeElement }: { activeElement: any }) {
  const document = useCanvasStore((s) => s.document);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const duplicateSelected = useCanvasStore((s) => s.duplicateSelected);
  const bringForward = useCanvasStore((s) => s.bringForward);
  const sendBackward = useCanvasStore((s) => s.sendBackward);
  const removeSelected = useCanvasStore((s) => s.removeSelected);
  const setCropModalOpen = useToolStore((s) => s.setCropModalOpen);

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
    <motion.div
      key="toolbar-single"
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 450, damping: 28 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 sm:gap-5 px-6 sm:px-7 py-3 bg-surface-container-high/95 backdrop-blur-3xl rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-outline-variant/15 z-30 select-none max-w-[95vw] overflow-x-auto scrollbar-none"
    >
        {/* IMAGE SPECIFIC: Crop & Flip */}
        {isImage && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCropModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary font-semibold text-xs rounded-full shadow-md shadow-primary/20 hover:bg-primary-fixed transition-all cursor-pointer"
              title="Crop Image"
            >
              <span className="material-symbols-outlined text-[16px]">crop</span>
              <span>Crop</span>
            </motion.button>

            {/* AI Sparkle */}
            <Popover.Root open={isAIPopoverOpen} onOpenChange={setIsAIPopoverOpen}>
              <Popover.Trigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center p-1.5 bg-gradient-to-tr from-purple-500 to-pink-500 text-white rounded-full shadow-md hover:shadow-lg hover:shadow-purple-500/30 transition-all cursor-pointer"
                  title="AI Edit"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </motion.button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="top"
                  sideOffset={16}
                  className="z-[60] w-72 p-4 bg-surface-container-highest/98 backdrop-blur-3xl border border-outline-variant/20 rounded-3xl shadow-2xl animate-in fade-in-0 zoom-in-95 flex flex-col gap-3 text-on-surface"
                >
                  <div className="flex items-center justify-between border-b border-outline-variant/15 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">psychology</span>
                      AI Magic
                    </span>
                    <button
                      onClick={() => setIsAIPopoverOpen(false)}
                      className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. 'Make it look like a 90s vintage camera'"
                      className="w-full h-20 bg-surface-container/60 border border-outline-variant/20 rounded-xl p-3 text-[11px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 resize-none custom-scrollbar transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (aiPrompt.trim() && !isGenerating) {
                            modifyImage(aiPrompt.trim(), activeElement.id);
                            setIsAIPopoverOpen(false);
                            setAiPrompt("");
                          }
                        }
                      }}
                    />
                  </div>

                  <button
                    disabled={isGenerating || !aiPrompt.trim()}
                    onClick={() => {
                      modifyImage(aiPrompt.trim(), activeElement.id);
                      setIsAIPopoverOpen(false);
                      setAiPrompt("");
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isGenerating 
                        ? "bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-70"
                        : "bg-primary text-on-primary hover:bg-primary-fixed cursor-pointer shadow-md shadow-primary/20"
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            <Popover.Root>
              <Popover.Trigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    (imgEl.brightness || imgEl.contrast || imgEl.saturation || imgEl.blur)
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-surface-variant hover:bg-surface-variant-high text-on-surface"
                  }`}
                  title="Adjust Image"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Adjust</span>
                </motion.button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="top"
                  sideOffset={16}
                  className="z-[60] w-72 p-5 bg-surface-container-highest/98 backdrop-blur-3xl border border-outline-variant/20 rounded-3xl shadow-2xl animate-in fade-in-0 zoom-in-95 flex flex-col gap-4 text-on-surface"
                >
                  <div className="flex items-center justify-between border-b border-outline-variant/15 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Image Adjustments</span>
                    <button
                      onClick={() =>
                        updateElement(
                          activeElement.id,
                          { brightness: 0, contrast: 0, saturation: 0, blur: 0 },
                          true
                        )
                      }
                      className="text-[11px] text-primary hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Brightness */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant">
                      <span>Brightness</span>
                      <span className="font-mono">{Math.round((imgEl.brightness || 0) * 100)}%</span>
                    </div>
                    <Slider.Root
                      className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
                      value={[imgEl.brightness || 0]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={([val]) => updateElement(activeElement.id, { brightness: val }, false)}
                      onValueCommit={([val]) => updateElement(activeElement.id, { brightness: val }, true)}
                    >
                      <Slider.Track className="bg-surface-variant relative grow rounded-full h-1.5">
                        <Slider.Range className="absolute bg-primary rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-primary shadow-lg rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors" />
                    </Slider.Root>
                  </div>

                  {/* Contrast */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant">
                      <span>Contrast</span>
                      <span className="font-mono">{Math.round((imgEl.contrast || 0) * 100)}%</span>
                    </div>
                    <Slider.Root
                      className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
                      value={[imgEl.contrast || 0]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={([val]) => updateElement(activeElement.id, { contrast: val }, false)}
                      onValueCommit={([val]) => updateElement(activeElement.id, { contrast: val }, true)}
                    >
                      <Slider.Track className="bg-surface-variant relative grow rounded-full h-1.5">
                        <Slider.Range className="absolute bg-primary rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-primary shadow-lg rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors" />
                    </Slider.Root>
                  </div>

                  {/* Saturation */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant">
                      <span>Saturation</span>
                      <span className="font-mono">{Math.round((imgEl.saturation || 0) * 100)}%</span>
                    </div>
                    <Slider.Root
                      className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
                      value={[imgEl.saturation || 0]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={([val]) => updateElement(activeElement.id, { saturation: val }, false)}
                      onValueCommit={([val]) => updateElement(activeElement.id, { saturation: val }, true)}
                    >
                      <Slider.Track className="bg-surface-variant relative grow rounded-full h-1.5">
                        <Slider.Range className="absolute bg-primary rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-primary shadow-lg rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors" />
                    </Slider.Root>
                  </div>

                  {/* Blur */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant">
                      <span>Blur</span>
                      <span className="font-mono">{Math.round((imgEl.blur || 0) * 100)}%</span>
                    </div>
                    <Slider.Root
                      className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
                      value={[imgEl.blur || 0]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={([val]) => updateElement(activeElement.id, { blur: val }, false)}
                      onValueCommit={([val]) => updateElement(activeElement.id, { blur: val }, true)}
                    >
                      <Slider.Track className="bg-surface-variant relative grow rounded-full h-1.5">
                        <Slider.Range className="absolute bg-primary rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-primary shadow-lg rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors" />
                    </Slider.Root>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            {/* 12-Preset Filter Library */}
            <Popover.Root>
              <Popover.Trigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    (imgEl.presetFilter && imgEl.presetFilter !== "none")
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-surface-variant hover:bg-surface-variant-high text-on-surface"
                  }`}
                  title="Apply Filter Presets"
                >
                  <span className="material-symbols-outlined text-[16px]">auto_awesome_mosaic</span>
                  <span>Filters</span>
                </motion.button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="top"
                  sideOffset={16}
                  className="z-[60] w-80 p-5 bg-surface-container-highest/98 backdrop-blur-3xl border border-outline-variant/20 rounded-3xl shadow-2xl animate-in fade-in-0 zoom-in-95 flex flex-col gap-4 text-on-surface"
                >
                  <div className="flex items-center justify-between border-b border-outline-variant/15 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Preset Filters</span>
                    <button
                      onClick={() => updateElement(activeElement.id, { presetFilter: "none" }, true)}
                      className="text-[11px] text-primary hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {[
                      { id: "none", label: "Original" },
                      { id: "grayscale", label: "Grayscale" },
                      { id: "negative", label: "Negative" },
                      { id: "noir", label: "Noir" },
                      { id: "frosted", label: "Frosted" },
                      { id: "sepia", label: "Sepia" },
                      { id: "polaroid", label: "Polaroid" },
                      { id: "kodachrome", label: "Kodachrome" },
                      { id: "brownie", label: "Brownie" },
                      { id: "technicolor", label: "Technicolor" },
                      { id: "vintage", label: "Vintage" },
                      { id: "8-bit", label: "8-Bit" },
                      { id: "duotone", label: "Duotone" },
                    ].map((filter) => {
                      const isActive = (imgEl.presetFilter || "none") === filter.id;
                      return (
                        <button
                          key={filter.id}
                          onClick={() => updateElement(activeElement.id, { presetFilter: filter.id }, true)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                            isActive
                              ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(251,188,0,0.2)]"
                              : "bg-surface-container/60 border-outline-variant/20 hover:bg-surface-variant hover:border-outline-variant/40"
                          }`}
                        >
                          <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : "text-on-surface-variant"}`}>
                            {filter.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            {/* Cinematic Grade Library */}
            <Popover.Root>
              <Popover.Trigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    (imgEl.gradePreset && imgEl.gradePreset !== "none" || (imgEl.filmGrain && imgEl.filmGrain > 0) || (imgEl.temperature && imgEl.temperature !== 0))
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-surface-variant hover:bg-surface-variant-high text-on-surface"
                  }`}
                  title="Colour Grade Engine"
                >
                  <span className="material-symbols-outlined text-[16px]">movie</span>
                  <span>Grade</span>
                </motion.button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="top"
                  sideOffset={16}
                  className="z-[60] w-[340px] p-5 bg-surface-container-highest/98 backdrop-blur-3xl border border-outline-variant/20 rounded-3xl shadow-2xl animate-in fade-in-0 zoom-in-95 flex flex-col gap-4 text-on-surface"
                >
                  <div className="flex items-center justify-between border-b border-outline-variant/15 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Cinematic Grade</span>
                    <button
                      onClick={() => updateElement(activeElement.id, { gradePreset: "none", filmGrain: 0, temperature: 0 }, true)}
                      className="text-[11px] text-primary hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Horizontal Scroll List for Cinematic Presets */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {[
                      { id: "none", label: "Normal", icon: "image" },
                      { id: "golden-hour", label: "Golden Hour", icon: "wb_twilight" },
                      { id: "90s-camcorder", label: "90s Camcorder", icon: "videocam" },
                      { id: "cinematic-muted", label: "Cinematic Muted", icon: "camera_roll" },
                      { id: "vintage-fade", label: "Vintage Fade", icon: "monochrome_photos" },
                      { id: "monochrome-noir", label: "Noir", icon: "contrast" },
                    ].map((preset) => {
                      const isActive = (imgEl.gradePreset || "none") === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => updateElement(activeElement.id, { gradePreset: preset.id }, true)}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer min-w-[72px] ${
                            isActive
                              ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(251,188,0,0.2)]"
                              : "bg-surface-container/60 border-outline-variant/20 hover:bg-surface-variant hover:border-outline-variant/40"
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[20px] mb-1 ${isActive ? "text-primary" : "text-on-surface-variant"}`}>
                            {preset.icon}
                          </span>
                          <span className={`text-[9px] font-semibold text-center whitespace-nowrap ${isActive ? "text-primary" : "text-on-surface-variant"}`}>
                            {preset.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="h-px bg-outline-variant/15 w-full my-1" />

                  {/* Atmosphere Sliders */}
                  <div className="flex flex-col gap-4">
                    {/* Film Grain */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant">
                        <span>Film Grain</span>
                        <span className="font-mono">{imgEl.filmGrain || 0}%</span>
                      </div>
                      <Slider.Root
                        className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
                        value={[imgEl.filmGrain || 0]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([val]) => updateElement(activeElement.id, { filmGrain: val }, false)}
                        onValueCommit={([val]) => updateElement(activeElement.id, { filmGrain: val }, true)}
                      >
                        <Slider.Track className="bg-surface-variant relative grow rounded-full h-1.5">
                          <Slider.Range className="absolute bg-primary rounded-full h-full" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-4 h-4 bg-primary shadow-lg rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors" />
                      </Slider.Root>
                    </div>

                    {/* Temperature */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant">
                        <span>Temperature</span>
                        <span className="font-mono">{imgEl.temperature || 0}</span>
                      </div>
                      <Slider.Root
                        className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
                        value={[imgEl.temperature || 0]}
                        min={-100}
                        max={100}
                        step={1}
                        onValueChange={([val]) => updateElement(activeElement.id, { temperature: val }, false)}
                        onValueCommit={([val]) => updateElement(activeElement.id, { temperature: val }, true)}
                      >
                        <Slider.Track className="bg-gradient-to-r from-[#0066ff] via-surface-variant to-[#ffaa00] relative grow rounded-full h-1.5">
                          <Slider.Range className="absolute bg-transparent rounded-full h-full" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-4 h-4 bg-white shadow-lg rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors" />
                      </Slider.Root>
                    </div>
                  </div>

                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

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

        {/* SHADOW & BORDER (All Elements) */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`flex items-center gap-1.5 cursor-pointer group px-2 py-1 rounded-xl transition-colors ${
                activeElement.shadowEnabled
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "hover:bg-surface-variant/50 text-on-surface-variant group-hover:text-primary"
              }`}
              title="Shadow & Border Settings"
            >
              <span className="material-symbols-outlined text-[18px]">style</span>
            </motion.div>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="top"
              sideOffset={16}
              className="z-[60] w-72 p-5 bg-surface-container-highest/98 backdrop-blur-3xl border border-outline-variant/20 rounded-3xl shadow-2xl animate-in fade-in-0 zoom-in-95 flex flex-col gap-4 text-on-surface"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/15 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Drop Shadow</span>
                <button
                  onClick={() =>
                    updateElement(
                      activeElement.id,
                      {
                        shadowEnabled: !activeElement.shadowEnabled,
                        shadowBlur: activeElement.shadowBlur ?? 20,
                        shadowOffsetX: activeElement.shadowOffsetX ?? 8,
                        shadowOffsetY: activeElement.shadowOffsetY ?? 8,
                        shadowColor: activeElement.shadowColor ?? "rgba(0, 0, 0, 0.8)",
                      },
                      true
                    )
                  }
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                    activeElement.shadowEnabled ? "bg-primary" : "bg-surface-variant"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-surface-container-highest transition-all shadow-md ${
                      activeElement.shadowEnabled ? "left-4.5 bg-on-primary" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {activeElement.shadowEnabled && (
                <>
                  {/* Shadow Color & Presets */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-on-surface-variant">
                      <span>Shadow Color</span>
                      <span className="font-mono text-[10px] text-on-surface opacity-75">
                        {activeElement.shadowColor || "#000000"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-outline-variant/30 shadow-inner flex items-center justify-center shrink-0">
                        <input
                          type="color"
                          value={
                            activeElement.shadowColor?.startsWith("#")
                              ? activeElement.shadowColor
                              : "#000000"
                          }
                          onChange={(e) =>
                            updateElement(activeElement.id, { shadowColor: e.target.value }, true)
                          }
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: activeElement.shadowColor || "rgba(0,0,0,0.8)" }}
                        />
                      </div>

                      {/* Quick Palette Presets */}
                      <div className="flex items-center gap-1.5 grow">
                        {[
                          { label: "Dark", color: "rgba(0, 0, 0, 0.85)" },
                          { label: "Amber", color: "rgba(255, 226, 171, 0.8)" },
                          { label: "Red", color: "rgba(239, 68, 68, 0.8)" },
                          { label: "White", color: "rgba(255, 255, 255, 0.8)" },
                          { label: "Purple", color: "rgba(168, 85, 247, 0.8)" },
                        ].map((p) => (
                          <button
                            key={p.label}
                            onClick={() => updateElement(activeElement.id, { shadowColor: p.color }, true)}
                            title={p.label}
                            className="w-5 h-5 rounded-md border border-white/10 transition-transform hover:scale-110 cursor-pointer shadow-sm"
                            style={{ backgroundColor: p.color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Blur Slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant">
                      <span>Blur</span>
                      <span className="font-mono">{activeElement.shadowBlur ?? 20}px</span>
                    </div>
                    <Slider.Root
                      className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
                      value={[activeElement.shadowBlur ?? 20]}
                      min={0}
                      max={50}
                      step={1}
                      onValueChange={([val]) => updateElement(activeElement.id, { shadowBlur: val }, false)}
                      onValueCommit={([val]) => updateElement(activeElement.id, { shadowBlur: val }, true)}
                    >
                      <Slider.Track className="bg-surface-variant relative grow rounded-full h-1.5">
                        <Slider.Range className="absolute bg-primary rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-primary shadow-lg rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors" />
                    </Slider.Root>
                  </div>

                  {/* X Offset Slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant">
                      <span>X Offset</span>
                      <span className="font-mono">{activeElement.shadowOffsetX ?? 8}px</span>
                    </div>
                    <Slider.Root
                      className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
                      value={[activeElement.shadowOffsetX ?? 8]}
                      min={-30}
                      max={30}
                      step={1}
                      onValueChange={([val]) => updateElement(activeElement.id, { shadowOffsetX: val }, false)}
                      onValueCommit={([val]) => updateElement(activeElement.id, { shadowOffsetX: val }, true)}
                    >
                      <Slider.Track className="bg-surface-variant relative grow rounded-full h-1.5">
                        <Slider.Range className="absolute bg-primary rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-primary shadow-lg rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors" />
                    </Slider.Root>
                  </div>

                  {/* Y Offset Slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant">
                      <span>Y Offset</span>
                      <span className="font-mono">{activeElement.shadowOffsetY ?? 8}px</span>
                    </div>
                    <Slider.Root
                      className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
                      value={[activeElement.shadowOffsetY ?? 8]}
                      min={-30}
                      max={30}
                      step={1}
                      onValueChange={([val]) => updateElement(activeElement.id, { shadowOffsetY: val }, false)}
                      onValueCommit={([val]) => updateElement(activeElement.id, { shadowOffsetY: val }, true)}
                    >
                      <Slider.Track className="bg-surface-variant relative grow rounded-full h-1.5">
                        <Slider.Range className="absolute bg-primary rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-primary shadow-lg rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors" />
                    </Slider.Root>
                  </div>
                </>
              )}

              {isShape && shapeEl.shapeKind === "rectangle" && (
                <>
                  <div className="h-px bg-outline-variant/15 my-1" />
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant">
                      <span>Corner Radius</span>
                      <span className="font-mono">{shapeEl.cornerRadius || 0}px</span>
                    </div>
                    <Slider.Root
                      className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
                      value={[shapeEl.cornerRadius || 0]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([val]) => updateElement(activeElement.id, { cornerRadius: val }, false)}
                      onValueCommit={([val]) => updateElement(activeElement.id, { cornerRadius: val }, true)}
                    >
                      <Slider.Track className="bg-surface-variant relative grow rounded-full h-1.5">
                        <Slider.Range className="absolute bg-primary rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-primary shadow-lg rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors" />
                    </Slider.Root>
                  </div>
                </>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

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
  );
}

