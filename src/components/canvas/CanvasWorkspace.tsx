"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFabricCanvas } from "@/hooks/useFabricCanvas";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useToolStore } from "@/store/useToolStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAILogStore } from "@/store/useAILogStore";
import { ImageElement } from "@/types/canvas";

export function CanvasWorkspace() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Initialize Fabric v6 canvas & synchronization engine
  const { fabricCanvas } = useFabricCanvas(canvasElRef);

  const document = useCanvasStore((s) => s.document);
  const addElement = useCanvasStore((s) => s.addElement);
  const zoom = useToolStore((s) => s.zoom);
  const setZoom = useToolStore((s) => s.setZoom);
  const pan = useToolStore((s) => s.pan);
  const setPan = useToolStore((s) => s.setPan);
  const activeTool = useToolStore((s) => s.activeTool);
  const isSpacePressed = useToolStore((s) => s.isSpacePressed);

  const setDocument = useCanvasStore((s) => s.setDocument);

  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Rehydrate persisted document from IndexedDB on initial load
  useEffect(() => {
    import("@/lib/storage/db").then(({ getActiveDocument }) => {
      getActiveDocument().then((savedDoc) => {
        if (savedDoc && savedDoc.elements) {
          // Purge any old legacy template elements
          const cleanElements = savedDoc.elements.filter(
            (el) => el.id !== "el_title_1" && el.id !== "el_subtitle_1" && el.id !== "el_accent_box"
          );
          if (cleanElements.length > 0) {
            const currentDoc = useCanvasStore.getState().document;
            if (currentDoc.elements.length === 0) {
              setDocument({
                ...savedDoc,
                elements: cleanElements,
              });
            }
          }
        }
      });
    });
  }, [setDocument]);

  // Store fabric instance on window for export access
  useEffect(() => {
    if (fabricCanvas) {
      (window as any).__imageryFabricCanvas = fabricCanvas;
      
      // Update Fabric selection theme to match the new static UI design tokens
      fabricCanvas.set({
        selectionColor: "rgba(255, 226, 171, 0.1)", // primary with opacity
        selectionBorderColor: "#fbbc00", // surface-tint / primary-fixed-dim
        selectionLineWidth: 1,
      });
    }
  }, [fabricCanvas]);

  // Smooth mouse wheel zoom / pan
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.08 : -0.08;
        setZoom((prev) => Math.min(3.0, Math.max(0.15, Number((prev + delta).toFixed(2)))));
      } else {
        // Trackpad two-finger pan
        setPan((prev) => ({
          x: prev.x - e.deltaX * 0.8,
          y: prev.y - e.deltaY * 0.8,
        }));
      }
    },
    [setZoom, setPan]
  );

  // Panning mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === "hand" || isSpacePressed || e.button === 1) {
      setIsPanning(true);
      startPanRef.current = {
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          const src = event.target.result;
          const img = new window.Image();
          img.src = src;
          img.onload = () => {
            const nativeW = img.width;
            const nativeH = img.height;

            const maxW = document.width * 0.8;
            const maxH = document.height * 0.8;

            let targetW = nativeW;
            let targetH = nativeH;

            if (targetW > maxW || targetH > maxH) {
              const scale = Math.min(maxW / nativeW, maxH / nativeH);
              targetW = nativeW * scale;
              targetH = nativeH * scale;
            }

            const x = document.width / 2;
            const y = document.height / 2;

            const id = `el_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
            const imageEl: ImageElement = {
              id,
              name: file.name.replace(/\.[^/.]+$/, ""),
              type: "image",
              src,
              x,
              y,
              width: targetW,
              height: targetH,
              aspectRatio: nativeW / nativeH,
              rotation: 0,
              opacity: 1,
              zIndex: 0,
              locked: false,
              visible: true,
              flipX: false,
              flipY: false,
            };
            addElement(imageEl);
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isGenerating = useToolStore((s) => s.isGenerating);
  const isHandActive = activeTool === "hand" || isSpacePressed;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`absolute inset-0 z-0 flex items-center justify-center select-none ${
        isHandActive
          ? isPanning
            ? "cursor-grabbing"
            : "cursor-grab"
          : (activeTool === "shape" || activeTool === "text")
          ? "cursor-crosshair"
          : "cursor-default"
      }`}
    >
      {/* Subtle Studio Vignette Focus Overlay */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_140px_rgba(0,0,0,0.8)] z-10" />

      {/* Stage Pan/Zoom Transform Container */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: isPanning ? "none" : "transform 0.05s ease-out",
        }}
        className="relative flex items-center justify-center pointer-events-auto"
      >
        {/* Document Boundary Frame */}
        <div
          style={{
            width: document.width,
            height: document.height,
            backgroundColor: document.backgroundColor,
          }}
          className={`rounded-md relative overflow-hidden transition-all duration-500 ${
            isGenerating
              ? "ring-2 ring-primary shadow-[0_0_80px_rgba(251,188,0,0.6)] animate-breathe"
              : "ring-1 ring-white/10 shadow-[0_0_60px_rgba(255,226,171,0.08),0_20px_60px_rgba(0,0,0,0.9),0_0_1px_1px_rgba(255,255,255,0.08)]"
          }`}
        >
          {/* HTML5 Canvas instance for Fabric.js v6 */}
          <canvas ref={canvasElRef} id="fabric-canvas" />

          {/* AI Generating shimmer overlay */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-10 ai-shimmer-overlay"
            />
          )}
        </div>
      </div>

      <AIAuditDrawer />
    </div>
  );
}

function AIAuditDrawer() {
  const { logs, isOpen, setIsOpen, clearLogs } = useAILogStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed top-16 right-0 bottom-0 w-80 bg-surface-container-low/95 backdrop-blur-3xl border-l border-outline-variant/20 z-50 shadow-2xl flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-outline-variant/15">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <span className="material-symbols-outlined text-[18px]">history_edu</span>
              <span className="text-sm">AI Audit Log</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearLogs}
                title="Clear Logs"
                className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-60">
                <span className="material-symbols-outlined text-[32px] mb-2">auto_awesome</span>
                <span className="text-xs">No AI actions recorded yet.</span>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex flex-col gap-2 p-3 bg-surface-container rounded-xl border border-outline-variant/10">
                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-mono">
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span>ID: {log.elementId.substring(0, 8)}...</span>
                  </div>
                  <div className="text-xs text-on-surface font-medium bg-surface-variant/30 p-2 rounded-lg italic">
                    "{log.prompt}"
                  </div>
                  <div className="mt-1">
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1 block">Config Generated</span>
                    <pre className="text-[9px] font-mono text-on-surface-variant bg-black/40 p-2 rounded-lg overflow-x-auto">
                      {JSON.stringify(log.config, null, 2)}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

