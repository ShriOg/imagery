"use client";

import { useCanvasStore } from "@/store/useCanvasStore";

export function useHistory() {
  const past = useCanvasStore((s) => s.past);
  const future = useCanvasStore((s) => s.future);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);

  return {
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undoCount: past.length,
    redoCount: future.length,
    undo,
    redo,
  };
}
