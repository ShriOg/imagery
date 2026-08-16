"use client";

import { useEffect } from "react";
import FabricCanvas from "./FabricCanvas";
import { useCanvasStore } from "@/lib/store/canvas-store";

export default function CanvasWorkspace() {
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const removeElement = useCanvasStore((s) => s.removeElement);
  const canvasState = useCanvasStore((s) => s.canvas);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl+Shift+Z, Cmd+Shift+Z, or Ctrl+Y
      if (((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key === "y")) {
        e.preventDefault();
        redo();
      }
      // Delete selected elements
      // Note: Since Fabric Canvas is not controlled fully reactively for selection yet,
      // a robust delete requires finding the active object on the fabric instance,
      // but for Phase 2, we can just let Fabric handle deletion if we have access to it.
      // Wait, let's keep it simple: we can do the delete directly in FabricCanvas, 
      // or export a helper. To keep it clean, we'll implement it inside FabricCanvas or here if we expose the active object.
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px", overflow: "hidden" }}>
      <FabricCanvas />
    </div>
  );
}
