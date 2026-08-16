"use client";

import React from "react";
import * as Slider from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  className,
}: SliderControlProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400 font-medium">{label}</span>
        <span className="text-[11px] font-mono text-zinc-300 px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/40">
          {value}
          {unit}
        </span>
      </div>

      <Slider.Root
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([val]) => onChange(val)}
        className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
      >
        <Slider.Track className="bg-zinc-800 relative grow rounded-full h-1 overflow-hidden border border-zinc-700/30">
          <Slider.Range className="absolute bg-amber-500 h-full rounded-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-3.5 h-3.5 bg-zinc-100 border border-zinc-300 rounded-full shadow-md hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-transform"
          aria-label={label}
        />
      </Slider.Root>
    </div>
  );
}
