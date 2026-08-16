"use client";

import { useEffect } from "react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";

export function useKeyboardShortcuts() {
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const removeSelected = useCanvasStore((s) => s.removeSelected);
  const duplicateSelected = useCanvasStore((s) => s.duplicateSelected);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const setSelectedIds = useCanvasStore((s) => s.setSelectedIds);
  const bringForward = useCanvasStore((s) => s.bringForward);
  const sendBackward = useCanvasStore((s) => s.sendBackward);
  const bringToFront = useCanvasStore((s) => s.bringToFront);
  const sendToBack = useCanvasStore((s) => s.sendToBack);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const document = useCanvasStore((s) => s.document);

  const setActiveTool = useToolStore((s) => s.setActiveTool);
  const setIsSpacePressed = useToolStore((s) => s.setIsSpacePressed);
  const zoom = useToolStore((s) => s.zoom);
  const setZoom = useToolStore((s) => s.setZoom);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.classList.contains("fabric-text-editing");

      // Spacebar Hand Tool (Hold)
      if (e.code === "Space" && !isInput && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      }

      // If user is actively typing in a standard HTML input, bypass hotkeys
      if (isInput) return;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo / Redo
      if (cmdOrCtrl && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (cmdOrCtrl && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        redo();
        return;
      }

      // Duplicate: Cmd/Ctrl + D
      if (cmdOrCtrl && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      // Delete: Backspace / Delete
      if (e.key === "Backspace" || e.key === "Delete") {
        if (selectedIds.length > 0) {
          e.preventDefault();
          removeSelected();
        }
        return;
      }

      // Escape: Deselect / Reset Tool
      if (e.key === "Escape") {
        e.preventDefault();
        setSelectedIds([]);
        setActiveTool("select");
        return;
      }

      // Layer Shortcuts: [ and ]
      if (selectedIds.length === 1) {
        const id = selectedIds[0];
        if (e.key === "[") {
          e.preventDefault();
          if (e.shiftKey) {
            sendToBack(id);
          } else {
            sendBackward(id);
          }
          return;
        }
        if (e.key === "]") {
          e.preventDefault();
          if (e.shiftKey) {
            bringToFront(id);
          } else {
            bringForward(id);
          }
          return;
        }
      }

      // Arrow Key Nudging (1px or Shift: 10px)
      if (
        selectedIds.length > 0 &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;

        if (e.key === "ArrowUp") dy = -step;
        if (e.key === "ArrowDown") dy = step;
        if (e.key === "ArrowLeft") dx = -step;
        if (e.key === "ArrowRight") dx = step;

        selectedIds.forEach((id) => {
          const el = document.elements.find((item) => item.id === id);
          if (el && !el.locked) {
            updateElement(id, { x: el.x + dx, y: el.y + dy }, false);
          }
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    undo,
    redo,
    removeSelected,
    duplicateSelected,
    selectedIds,
    setSelectedIds,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    updateElement,
    document.elements,
    setActiveTool,
    setIsSpacePressed,
  ]);
}
