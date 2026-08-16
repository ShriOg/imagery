"use client";

import React from "react";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

interface TooltipButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip: string;
  shortcut?: string;
  side?: "top" | "right" | "bottom" | "left";
  isActive?: boolean;
  variant?: "ghost" | "amber" | "panel" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function TooltipButton({
  tooltip,
  shortcut,
  side = "top",
  isActive = false,
  variant = "ghost",
  size = "md",
  className,
  children,
  onClick,
  disabled,
  ...props
}: TooltipButtonProps) {
  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg p-1.5 text-xs",
    md: "w-10 h-10 rounded-xl p-2 text-sm",
    lg: "w-12 h-12 rounded-2xl p-2.5 text-base",
  }[size];

  const variantClasses = {
    ghost: cn(
      "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors",
      isActive && "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-amber-glow"
    ),
    amber: "bg-amber-500 text-zinc-950 font-medium hover:bg-amber-400 shadow-lg shadow-amber-500/20",
    panel: cn(
      "bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700/80 border border-zinc-700/50",
      isActive && "bg-amber-500/20 text-amber-300 border-amber-500/40"
    ),
    danger: "text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10",
  }[variant];

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <motion.button
            whileHover={!disabled ? { scale: 1.04 } : undefined}
            whileTap={!disabled ? { scale: 0.94 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "relative flex items-center justify-center cursor-pointer select-none outline-none disabled:opacity-40 disabled:pointer-events-none",
              sizeClasses,
              variantClasses,
              className
            )}
            onClick={onClick}
            disabled={disabled}
            {...(props as any)}
          >
            {children}
          </motion.button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            sideOffset={8}
            className="z-50 flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-200 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/60 rounded-lg shadow-xl shadow-black/50 animate-in fade-in-0 zoom-in-95"
          >
            <span>{tooltip}</span>
            {shortcut && (
              <span className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 rounded border border-zinc-700/50">
                {shortcut}
              </span>
            )}
            <Tooltip.Arrow className="fill-zinc-800" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
