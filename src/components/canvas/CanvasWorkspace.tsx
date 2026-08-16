"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useFabricCanvas } from "@/hooks/useFabricCanvas";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useToolStore } from "@/store/useToolStore";
import { useCanvasStore } from "@/store/useCanvasStore";
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
          : "cursor-default"
      }`}
    >
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
          className="shadow-2xl shadow-black/80 rounded-sm relative overflow-hidden transition-colors"
        >
          {/* HTML5 Canvas instance for Fabric.js v6 */}
          <canvas ref={canvasElRef} id="fabric-canvas" />
        </div>
      </div>
    </div>
  );
}
