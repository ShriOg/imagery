"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";

export function ContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const duplicateSelected = useCanvasStore((s) => s.duplicateSelected);
  const removeSelected = useCanvasStore((s) => s.removeSelected);
  const bringForward = useCanvasStore((s) => s.bringForward);
  const sendBackward = useCanvasStore((s) => s.sendBackward);
  const setAiPaletteOpen = useToolStore((s) => s.setAiPaletteOpen);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Only show context menu if clicking inside the editor canvas area
      const target = e.target as HTMLElement;
      const isCanvasArea = target.closest('.canvas-workspace-container') || target.tagName === 'CANVAS' || target.closest('#fabric-canvas') || target.id === 'fabric-canvas';
      
      if (isCanvasArea) {
        e.preventDefault();
        setIsOpen(true);
        // Ensure menu doesn't go off-screen
        const x = Math.min(e.clientX, window.innerWidth - 220);
        const y = Math.min(e.clientY, window.innerHeight - 250);
        setPosition({ x, y });
      } else {
        setIsOpen(false);
      }
    };

    const handleClick = () => {
      if (isOpen) setIsOpen(false);
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("click", handleClick);
    };
  }, [isOpen]);

  const hasSelection = selectedIds.length > 0;

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          style={{ top: position.y, left: position.x }}
          className="fixed z-[100] w-52 bg-surface-container/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1.5"
        >
          {hasSelection ? (
            <>
              <MenuItem
                icon="content_copy"
                label="Duplicate"
                shortcut="⌘D"
                onClick={() => handleAction(duplicateSelected)}
              />
              <MenuItem
                icon="delete"
                label="Delete"
                shortcut="⌫"
                onClick={() => handleAction(removeSelected)}
                destructive
              />
              <div className="h-px bg-white/10 my-1.5 mx-2" />
              <MenuItem
                icon="flip_to_front"
                label="Bring Forward"
                shortcut="⌘]"
                onClick={() => handleAction(() => bringForward(selectedIds[0]))}
              />
              <MenuItem
                icon="flip_to_back"
                label="Send Backward"
                shortcut="⌘["
                onClick={() => handleAction(() => sendBackward(selectedIds[0]))}
              />
            </>
          ) : (
            <>
              <MenuItem
                icon="auto_awesome"
                label="AI Command Palette"
                shortcut="⌘K"
                onClick={() => handleAction(() => setAiPaletteOpen(true))}
              />
              <div className="h-px bg-white/10 my-1.5 mx-2" />
              <div className="px-3 py-2 text-xs text-on-surface-variant/50 text-center">
                Select an element for more options
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuItem({
  icon,
  label,
  shortcut,
  onClick,
  destructive = false,
}: {
  icon: string;
  label: string;
  shortcut?: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors cursor-pointer hover:bg-white/10 ${
        destructive ? "text-red-400 hover:text-red-300" : "text-on-surface"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
        <span>{label}</span>
      </div>
      {shortcut && (
        <span className="text-xs text-on-surface-variant/50">{shortcut}</span>
      )}
    </button>
  );
}
