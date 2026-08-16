"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useFabricCanvas } from "@/hooks/useFabricCanvas";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useToolStore } from "@/store/useToolStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { FloatingContextToolbar } from "./FloatingContextToolbar";
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

  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Store fabric instance on window for export access
  useEffect(() => {
    if (fabricCanvas) {
      (window as any).__imageryFabricCanvas = fabricCanvas;
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

  // Drag and drop image files directly onto canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          const id = `el_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
          const imageEl: ImageElement = {
            id,
            name: file.name.replace(/\.[^/.]+$/, ""),
            type: "image",
            src: event.target.result,
            x: 540,
            y: 540,
            width: 480,
            height: 480,
            aspectRatio: 1,
            rotation: 0,
            opacity: 1,
            zIndex: 0,
            locked: false,
            visible: true,
            flipX: false,
            flipY: false,
          };
          addElement(imageEl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isHandActive = activeTool === "hand" || isSpacePressed;

  return (
    <main
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`relative w-full h-[calc(100vh-3.5rem)] overflow-hidden studio-dot-grid flex items-center justify-center select-none ${
        isHandActive
          ? isPanning
            ? "cursor-grabbing"
            : "cursor-grab"
          : "cursor-default"
      }`}
    >
      {/* Floating Context Toolbar */}
      <FloatingContextToolbar />

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
          className="canvas-shadow-frame rounded-sm relative overflow-hidden transition-colors"
        >
          {/* HTML5 Canvas instance for Fabric.js v6 */}
          <canvas ref={canvasElRef} />
        </div>
      </div>
    </main>
  );
}
