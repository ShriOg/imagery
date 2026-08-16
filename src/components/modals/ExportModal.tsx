"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Download, X, Check, Image as ImageIcon, Sparkles } from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";
import * as fabric from "fabric";

export function ExportModal() {
  const isExportModalOpen = useToolStore((s) => s.isExportModalOpen);
  const setExportModalOpen = useToolStore((s) => s.setExportModalOpen);
  const document = useCanvasStore((s) => s.document);

  const [format, setFormat] = useState<"png" | "jpeg" | "svg" | "webp">("png");
  const [multiplier, setMultiplier] = useState<number>(2); // 2x Retina default
  const [transparentBg, setTransparentBg] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      try {
        // Find the active HTML canvas
        const canvasEl = window.document.querySelector("canvas.lower-canvas") as HTMLCanvasElement;
        const fabricCanvas = (canvasEl as any)?.__fabric || (window as any).__imageryFabricCanvas;

        const dateStr = new Date().toISOString().split("T")[0];
        const filename = `${document.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${dateStr}`;

        if (fabricCanvas) {
          // Store and discard active selection to avoid exporting bounding boxes
          const activeObj = fabricCanvas.getActiveObject();
          fabricCanvas.discardActiveObject();
          
          const origBg = fabricCanvas.backgroundColor;
          if (transparentBg && (format === "png" || format === "webp")) {
            fabricCanvas.backgroundColor = "transparent";
          }
          fabricCanvas.requestRenderAll();

          if (format === "svg") {
            const svgData = fabricCanvas.toSVG();
            const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = window.document.createElement("a");
            link.download = `${filename}.svg`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          } else {
            const dataURL = fabricCanvas.toDataURL({
              format,
              multiplier,
              quality: 0.95,
            });
            const link = window.document.createElement("a");
            link.download = `${filename}.${format}`;
            link.href = dataURL;
            link.click();
          }

          // Restore background and selection
          fabricCanvas.backgroundColor = origBg;
          if (activeObj) {
            fabricCanvas.setActiveObject(activeObj);
          }
          fabricCanvas.requestRenderAll();
        } else if (canvasEl) {
          // Fallback direct canvas export
          const dataURL = canvasEl.toDataURL(`image/${format}`, 0.95);
          const link = window.document.createElement("a");
          link.download = `${filename}.${format}`;
          link.href = dataURL;
          link.click();
        }

        setIsExporting(false);
        setExportModalOpen(false);
      } catch (err) {
        console.error("Export failed:", err);
        setIsExporting(false);
      }
    }, 150);
  };

  return (
    <Dialog.Root open={isExportModalOpen} onOpenChange={setExportModalOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md bg-zinc-900/95 backdrop-blur-3xl border border-zinc-700/60 rounded-3xl shadow-2xl p-6 flex flex-col gap-5 text-zinc-100 animate-in fade-in-0 zoom-in-95 outline-none select-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-semibold tracking-tight">
                  Export Studio Design
                </Dialog.Title>
                <Dialog.Description className="text-xs text-zinc-400">
                  Save high-resolution retina assets without selection handles.
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Format Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-zinc-400">Format</span>
            <div className="grid grid-cols-4 gap-2">
              {(["png", "jpeg", "svg", "webp"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`py-2 px-3 rounded-xl text-xs font-mono uppercase font-semibold transition-all border ${
                    format === fmt
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                      : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-zinc-700/40"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Scale Multiplier */}
          {format !== "svg" && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-zinc-400">Resolution Scale</span>
                <span className="font-mono text-zinc-400">
                  {document.width * multiplier} × {document.height * multiplier} px
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mult: 1, label: "1x Standard" },
                  { mult: 2, label: "2x Retina" },
                  { mult: 3, label: "3x Ultra Print" },
                ].map(({ mult, label }) => (
                  <button
                    key={mult}
                    onClick={() => setMultiplier(mult)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all border text-center ${
                      multiplier === mult
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                        : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-zinc-700/40"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transparent Background Option */}
          {(format === "png" || format === "webp") && (
            <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={transparentBg}
                onChange={(e) => setTransparentBg(e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>Transparent Background</span>
            </label>
          )}

          {/* Export Action Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.98] outline-none disabled:opacity-50 mt-1"
          >
            {isExporting ? (
              <span>Rendering Asset...</span>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>
                  Download {format.toUpperCase()}{" "}
                  {format !== "svg" ? `(${multiplier}x)` : ""}
                </span>
              </>
            )}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
