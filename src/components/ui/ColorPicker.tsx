"use client";

import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const STUDIO_SWATCHES = [
  { name: "Obsidian", color: "#18181B" },
  { name: "Warm Amber", color: "#F59E0B" },
  { name: "Soft Cream", color: "#F5F5F0" },
  { name: "Muted Zinc", color: "#71717A" },
  { name: "Rose Quartz", color: "#F43F5E" },
  { name: "Sage Green", color: "#10B981" },
  { name: "Sky Azure", color: "#0EA5E9" },
  { name: "Studio Violet", color: "#8B5CF6" },
  { name: "Warm Coral", color: "#FB923C" },
  { name: "Pure Sand", color: "#D6C0B3" },
  { name: "Deep Charcoal", color: "#09090B" },
  { name: "Transparent", color: "transparent" },
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(val) || val === "transparent") {
      onChange(val);
    }
  };

  const isTransparent = value === "transparent" || value === "rgba(0,0,0,0)";

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/50 text-xs font-medium text-zinc-200 transition-all outline-none",
            className
          )}
        >
          <div
            className="w-4 h-4 rounded-full border border-white/20 shadow-sm relative overflow-hidden flex-shrink-0"
            style={{ backgroundColor: isTransparent ? undefined : value }}
          >
            {isTransparent && (
              <div className="absolute inset-0 bg-[linear-gradient(45deg,#27272a_25%,transparent_25%,transparent_75%,#27272a_75%,#27272a),linear-gradient(45deg,#27272a_25%,transparent_25%,transparent_75%,#27272a_75%,#27272a)] bg-[size:4px_4px]" />
            )}
          </div>
          {label && <span className="text-zinc-400">{label}</span>}
          <span className="font-mono uppercase text-[11px] text-zinc-300">
            {isTransparent ? "None" : value.slice(0, 7)}
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          className="z-50 w-56 p-3 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/70 animate-in fade-in-0 zoom-in-95"
        >
          <div className="flex flex-col gap-3">
            {/* Header & Native Color Picker */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Studio Swatches</span>
              <label className="flex items-center gap-1.5 text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer font-medium">
                <span>Custom</span>
                <input
                  type="color"
                  value={value.startsWith("#") ? value : "#F59E0B"}
                  onChange={(e) => {
                    onChange(e.target.value);
                    setHexInput(e.target.value);
                  }}
                  className="w-4 h-4 opacity-0 absolute pointer-events-none"
                />
              </label>
            </div>

            {/* Swatches Grid */}
            <div className="grid grid-cols-6 gap-2">
              {STUDIO_SWATCHES.map((swatch) => {
                const isSelected = value.toLowerCase() === swatch.color.toLowerCase();
                const isNone = swatch.color === "transparent";

                return (
                  <button
                    key={swatch.name}
                    title={swatch.name}
                    onClick={() => {
                      onChange(swatch.color);
                      setHexInput(swatch.color);
                    }}
                    className={cn(
                      "w-6 h-6 rounded-lg relative overflow-hidden transition-transform hover:scale-110 flex-shrink-0 border",
                      isSelected ? "border-amber-400 ring-2 ring-amber-400/30 scale-105" : "border-white/10"
                    )}
                    style={{ backgroundColor: isNone ? undefined : swatch.color }}
                  >
                    {isNone && (
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,#3f3f46_25%,transparent_25%,transparent_75%,#3f3f46_75%,#3f3f46)] bg-[size:4px_4px]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* HEX Input */}
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-500">HEX</span>
              <input
                type="text"
                value={hexInput}
                onChange={handleHexChange}
                placeholder="#FFFFFF"
                className="w-full px-2 py-1 text-xs font-mono text-zinc-200 bg-zinc-800/80 border border-zinc-700/60 rounded-lg focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>
          <Popover.Arrow className="fill-zinc-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
