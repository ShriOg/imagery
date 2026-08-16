"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";
import { ImageElement } from "@/types/canvas";

interface AspectPreset {
  label: string;
  ratio: number | null; // null for freeform
}

const ASPECT_PRESETS: AspectPreset[] = [
  { label: "Freeform", ratio: null },
  { label: "1:1 Square", ratio: 1 },
  { label: "16:9 Landscape", ratio: 16 / 9 },
  { label: "9:16 Story", ratio: 9 / 16 },
  { label: "4:5 Portrait", ratio: 4 / 5 },
  { label: "4:3 Classic", ratio: 4 / 3 },
  { label: "3:2 Photo", ratio: 3 / 2 },
];

export function CropModal() {
  const isCropModalOpen = useToolStore((s) => s.isCropModalOpen);
  const setCropModalOpen = useToolStore((s) => s.setCropModalOpen);

  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const document = useCanvasStore((s) => s.document);
  const updateElement = useCanvasStore((s) => s.updateElement);

  const activeElement = document.elements.find(
    (e) => e.id === selectedIds[0] && e.type === "image"
  ) as ImageElement | undefined;

  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [cropBox, setCropBox] = useState({ x: 5, y: 5, width: 90, height: 90 }); // percentage (0-100)
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [initialCrop, setInitialCrop] = useState({ x: 5, y: 5, width: 90, height: 90 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Initialize crop state when opened
  useEffect(() => {
    if (isCropModalOpen && activeElement) {
      setSelectedRatio(null);
      setCropBox({ x: 5, y: 5, width: 90, height: 90 });
      setImageLoaded(false);
    }
  }, [isCropModalOpen, activeElement]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth || 1, height: img.naturalHeight || 1 });
    setImageLoaded(true);
  };

  // Adjust crop box when aspect ratio preset changes
  const handleSelectRatio = (ratio: number | null) => {
    setSelectedRatio(ratio);
    if (ratio === null) return;

    if (!naturalSize.width || !naturalSize.height) return;

    const imgAspect = naturalSize.width / naturalSize.height;
    let newW = 85;
    let newH = (newW / ratio) * imgAspect;

    if (newH > 85) {
      newH = 85;
      newW = (newH * ratio) / imgAspect;
    }

    const newX = Math.max(0, (100 - newW) / 2);
    const newY = Math.max(0, (100 - newH) / 2);

    setCropBox({
      x: Number(newX.toFixed(2)),
      y: Number(newY.toFixed(2)),
      width: Number(newW.toFixed(2)),
      height: Number(newH.toFixed(2)),
    });
  };

  // Dragging and Resizing Crop Box Handlers
  const handleMouseDown = (e: React.MouseEvent, handle: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragHandle(handle);
    setStartPos({ x: e.clientX, y: e.clientY });
    setInitialCrop({ ...cropBox });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - startPos.x) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - startPos.y) / rect.height) * 100;

      if (dragHandle === "move") {
        let nextX = initialCrop.x + deltaXPercent;
        let nextY = initialCrop.y + deltaYPercent;

        nextX = Math.max(0, Math.min(100 - initialCrop.width, nextX));
        nextY = Math.max(0, Math.min(100 - initialCrop.height, nextY));

        setCropBox((prev) => ({ ...prev, x: nextX, y: nextY }));
      } else if (dragHandle === "se") {
        let nextW = Math.max(10, Math.min(100 - initialCrop.x, initialCrop.width + deltaXPercent));
        let nextH = Math.max(10, Math.min(100 - initialCrop.y, initialCrop.height + deltaYPercent));

        if (selectedRatio !== null && naturalSize.width && naturalSize.height) {
          const imgAspect = naturalSize.width / naturalSize.height;
          nextH = (nextW / selectedRatio) * imgAspect;
          if (initialCrop.y + nextH > 100) {
            nextH = 100 - initialCrop.y;
            nextW = (nextH * selectedRatio) / imgAspect;
          }
        }
        setCropBox((prev) => ({ ...prev, width: nextW, height: nextH }));
      } else if (dragHandle === "nw") {
        let nextX = Math.min(initialCrop.x + initialCrop.width - 10, Math.max(0, initialCrop.x + deltaXPercent));
        let nextY = Math.min(initialCrop.y + initialCrop.height - 10, Math.max(0, initialCrop.y + deltaYPercent));
        let nextW = initialCrop.width - (nextX - initialCrop.x);
        let nextH = initialCrop.height - (nextY - initialCrop.y);

        if (selectedRatio !== null && naturalSize.width && naturalSize.height) {
          const imgAspect = naturalSize.width / naturalSize.height;
          nextH = (nextW / selectedRatio) * imgAspect;
        }
        setCropBox({ x: nextX, y: nextY, width: nextW, height: nextH });
      } else if (dragHandle === "ne") {
        let nextY = Math.min(initialCrop.y + initialCrop.height - 10, Math.max(0, initialCrop.y + deltaYPercent));
        let nextW = Math.max(10, Math.min(100 - initialCrop.x, initialCrop.width + deltaXPercent));
        let nextH = initialCrop.height - (nextY - initialCrop.y);
        setCropBox((prev) => ({ ...prev, y: nextY, width: nextW, height: nextH }));
      } else if (dragHandle === "sw") {
        let nextX = Math.min(initialCrop.x + initialCrop.width - 10, Math.max(0, initialCrop.x + deltaXPercent));
        let nextW = initialCrop.width - (nextX - initialCrop.x);
        let nextH = Math.max(10, Math.min(100 - initialCrop.y, initialCrop.height + deltaYPercent));
        setCropBox((prev) => ({ ...prev, x: nextX, width: nextW, height: nextH }));
      } else if (dragHandle === "n") {
        let nextY = Math.min(initialCrop.y + initialCrop.height - 10, Math.max(0, initialCrop.y + deltaYPercent));
        let nextH = initialCrop.height - (nextY - initialCrop.y);
        setCropBox((prev) => ({ ...prev, y: nextY, height: nextH }));
      } else if (dragHandle === "s") {
        let nextH = Math.max(10, Math.min(100 - initialCrop.y, initialCrop.height + deltaYPercent));
        setCropBox((prev) => ({ ...prev, height: nextH }));
      } else if (dragHandle === "e") {
        let nextW = Math.max(10, Math.min(100 - initialCrop.x, initialCrop.width + deltaXPercent));
        setCropBox((prev) => ({ ...prev, width: nextW }));
      } else if (dragHandle === "w") {
        let nextX = Math.min(initialCrop.x + initialCrop.width - 10, Math.max(0, initialCrop.x + deltaXPercent));
        let nextW = initialCrop.width - (nextX - initialCrop.x);
        setCropBox((prev) => ({ ...prev, x: nextX, width: nextW }));
      }
    },
    [isDragging, dragHandle, startPos, initialCrop, selectedRatio, naturalSize]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragHandle(null);
  };

  // Perform Image Crop and Commit
  const handleApplyCrop = () => {
    if (!activeElement || !imgRef.current) return;

    const img = imgRef.current;
    const naturalW = img.naturalWidth || activeElement.width;
    const naturalH = img.naturalHeight || activeElement.height;

    // Calculate exact pixel crop coordinates on original source bitmap
    const cropPixelX = Math.max(0, Math.round((cropBox.x / 100) * naturalW));
    const cropPixelY = Math.max(0, Math.round((cropBox.y / 100) * naturalH));
    const cropPixelW = Math.max(1, Math.min(naturalW - cropPixelX, Math.round((cropBox.width / 100) * naturalW)));
    const cropPixelH = Math.max(1, Math.min(naturalH - cropPixelY, Math.round((cropBox.height / 100) * naturalH)));

    const canvas = window.document.createElement("canvas");
    canvas.width = cropPixelW;
    canvas.height = cropPixelH;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Draw the cropped sub-region
    ctx.drawImage(
      img,
      cropPixelX,
      cropPixelY,
      cropPixelW,
      cropPixelH,
      0,
      0,
      cropPixelW,
      cropPixelH
    );

    const croppedDataUrl = canvas.toDataURL("image/png");
    const newAspect = cropPixelW / cropPixelH;

    // Scale proportional to current element size
    const newWidth = Math.round(activeElement.width * (cropBox.width / 100));
    const newHeight = Math.round(newWidth / newAspect);

    updateElement(
      activeElement.id,
      {
        src: croppedDataUrl,
        width: Math.max(50, newWidth),
        height: Math.max(50, newHeight),
        aspectRatio: newAspect,
      },
      true
    );

    setCropModalOpen(false);
  };

  if (!activeElement) return null;

  return (
    <Dialog.Root open={isCropModalOpen} onOpenChange={setCropModalOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 animate-in fade-in-0" />
        <Dialog.Content
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-4xl h-[92vh] max-h-[850px] bg-surface-container-high/95 backdrop-blur-3xl border border-outline-variant/20 rounded-3xl shadow-2xl flex flex-col text-on-surface animate-in fade-in-0 zoom-in-95 outline-none select-none overflow-hidden"
        >
          {/* Modal Header (Fixed Top) */}
          <div className="shrink-0 px-6 py-3.5 flex items-center justify-between border-b border-outline-variant/10 bg-surface-container-high/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">crop</span>
              </div>
              <div>
                <Dialog.Title className="text-sm font-semibold tracking-tight text-on-surface">
                  Crop & Frame Image
                </Dialog.Title>
                <Dialog.Description className="text-xs text-on-surface-variant">
                  Select aspect ratio or drag the handles to frame your image.
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors outline-none cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </Dialog.Close>
          </div>

          {/* Aspect Ratio Presets (Fixed Top) */}
          <div className="shrink-0 px-6 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-outline-variant/10 bg-surface-container/60">
            {ASPECT_PRESETS.map((preset) => {
              const isSelected = selectedRatio === preset.ratio;
              return (
                <button
                  key={preset.label}
                  onClick={() => handleSelectRatio(preset.ratio)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-primary text-on-primary font-semibold shadow-md shadow-primary/20"
                      : "bg-surface-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Main Visual Crop Workspace (Flex 1 - Never pushes footer off screen) */}
          <div className="flex-1 min-h-0 relative flex items-center justify-center p-4 bg-surface-container-lowest/90 overflow-hidden">
            <div
              ref={containerRef}
              className="relative inline-block max-w-full max-h-full"
              style={{ userSelect: "none" }}
            >
              <img
                ref={imgRef}
                crossOrigin="anonymous"
                src={activeElement.src}
                alt="Crop preview"
                onLoad={handleImageLoad}
                className="max-w-full max-h-[58vh] object-contain rounded-lg pointer-events-none block"
              />

              {imageLoaded && (
                <>
                  {/* Darkened Overlay mask outside crop area */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `rgba(0, 0, 0, 0.65)`,
                      clipPath: `polygon(
                        0% 0%, 0% 100%, 
                        ${cropBox.x}% 100%, 
                        ${cropBox.x}% ${cropBox.y}%, 
                        ${cropBox.x + cropBox.width}% ${cropBox.y}%, 
                        ${cropBox.x + cropBox.width}% ${cropBox.y + cropBox.height}%, 
                        ${cropBox.x}% ${cropBox.y + cropBox.height}%, 
                        ${cropBox.x}% 100%, 
                        100% 100%, 100% 0%
                      )`,
                    }}
                  />

                  {/* The Interactive Crop Box */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, "move")}
                    className="absolute border-2 border-primary shadow-[0_0_20px_rgba(251,188,0,0.5)] cursor-move"
                    style={{
                      left: `${cropBox.x}%`,
                      top: `${cropBox.y}%`,
                      width: `${cropBox.width}%`,
                      height: `${cropBox.height}%`,
                    }}
                  >
                    {/* Rule of Thirds Grid */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                      <div className="border-r border-b border-primary/50" />
                      <div className="border-r border-b border-primary/50" />
                      <div className="border-b border-primary/50" />
                      <div className="border-r border-b border-primary/50" />
                      <div className="border-r border-b border-primary/50" />
                      <div className="border-b border-primary/50" />
                      <div className="border-r border-primary/50" />
                      <div className="border-r border-primary/50" />
                      <div />
                    </div>

                    {/* Corner Handles */}
                    <div
                      onMouseDown={(e) => handleMouseDown(e, "nw")}
                      className="absolute -top-2 -left-2 w-4 h-4 bg-primary border-2 border-surface-container rounded-full cursor-nwse-resize shadow-md"
                      title="Resize Top-Left"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, "ne")}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-primary border-2 border-surface-container rounded-full cursor-nesw-resize shadow-md"
                      title="Resize Top-Right"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, "sw")}
                      className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary border-2 border-surface-container rounded-full cursor-nesw-resize shadow-md"
                      title="Resize Bottom-Left"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, "se")}
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary border-2 border-surface-container rounded-full cursor-nwse-resize shadow-md"
                      title="Resize Bottom-Right"
                    />

                    {/* Edge Handles */}
                    <div
                      onMouseDown={(e) => handleMouseDown(e, "n")}
                      className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-primary/80 border border-surface-container rounded-full cursor-ns-resize shadow-sm"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, "s")}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-primary/80 border border-surface-container rounded-full cursor-ns-resize shadow-sm"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, "w")}
                      className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-6 bg-primary/80 border border-surface-container rounded-full cursor-ew-resize shadow-sm"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, "e")}
                      className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-6 bg-primary/80 border border-surface-container rounded-full cursor-ew-resize shadow-sm"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer Actions (Guaranteed Fixed Bottom) */}
          <div className="shrink-0 px-6 py-3.5 border-t border-outline-variant/10 bg-surface-container-high flex items-center justify-between">
            <button
              onClick={() => {
                setCropBox({ x: 0, y: 0, width: 100, height: 100 });
                setSelectedRatio(null);
              }}
              className="px-4 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-xl transition-colors cursor-pointer"
            >
              Reset to Full Image
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCropModalOpen(false)}
                className="px-5 py-2 rounded-full text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCrop}
                className="px-6 py-2 bg-primary text-on-primary font-label-md text-xs font-semibold rounded-full shadow-lg shadow-primary/20 hover:bg-primary-fixed transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
