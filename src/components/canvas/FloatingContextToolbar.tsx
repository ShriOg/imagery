"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Copy,
  Trash2,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Sparkles,
} from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";
import { TextElement, ShapeElement, ImageElement } from "@/types/canvas";
import { TooltipButton } from "@/components/ui/TooltipButton";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { SliderControl } from "@/components/ui/SliderControl";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";

const FONT_FAMILIES = [
  { name: "Inter", label: "Inter (Modern Sans)" },
  { name: "Playfair Display", label: "Playfair (Editorial Serif)" },
  { name: "Space Grotesk", label: "Space Grotesk (Tech)" },
  { name: "JetBrains Mono", label: "JetBrains Mono (Code)" },
  { name: "Plus Jakarta Sans", label: "Plus Jakarta (Clean)" },
];

export function FloatingContextToolbar() {
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const document = useCanvasStore((s) => s.document);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const removeSelected = useCanvasStore((s) => s.removeSelected);
  const duplicateSelected = useCanvasStore((s) => s.duplicateSelected);
  const bringForward = useCanvasStore((s) => s.bringForward);
  const sendBackward = useCanvasStore((s) => s.sendBackward);
  const toggleLock = useCanvasStore((s) => s.toggleLock);
  const setAssetModalOpen = useToolStore((s) => s.setAssetModalOpen);

  if (selectedIds.length === 0) return null;

  const activeElement = document.elements.find((e) => e.id === selectedIds[0]);
  if (!activeElement) return null;

  const isMulti = selectedIds.length > 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-2 bg-zinc-900/90 backdrop-blur-2xl border border-zinc-700/60 rounded-2xl shadow-floating text-zinc-200"
      >
        {/* Multi-Selection Banner */}
        {isMulti && (
          <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-amber-400 bg-amber-500/10 rounded-xl border border-amber-500/20 mr-1">
            <span>{selectedIds.length} items selected</span>
          </div>
        )}

        {/* Text Element Controls */}
        {!isMulti && activeElement.type === "text" && (
          <>
            {/* Font Family Dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-xl outline-none transition-colors max-w-[140px] truncate">
                  <span className="truncate">
                    {(activeElement as TextElement).fontFamily || "Inter"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  sideOffset={6}
                  className="z-50 w-52 p-1.5 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700/60 rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95"
                >
                  {FONT_FAMILIES.map((font) => (
                    <DropdownMenu.Item
                      key={font.name}
                      onClick={() =>
                        updateElement(activeElement.id, { fontFamily: font.name }, true)
                      }
                      className="flex items-center px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-amber-500/20 hover:text-amber-300 rounded-lg cursor-pointer outline-none transition-colors"
                      style={{ fontFamily: font.name }}
                    >
                      {font.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Font Size */}
            <div className="flex items-center gap-1 px-1.5 py-1 bg-zinc-800/80 rounded-xl border border-zinc-700/50">
              <button
                className="w-5 h-5 flex items-center justify-center text-xs text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-700"
                onClick={() =>
                  updateElement(
                    activeElement.id,
                    { fontSize: Math.max(8, (activeElement as TextElement).fontSize - 2) },
                    true
                  )
                }
              >
                -
              </button>
              <span className="text-xs font-mono text-zinc-200 w-7 text-center">
                {(activeElement as TextElement).fontSize}
              </span>
              <button
                className="w-5 h-5 flex items-center justify-center text-xs text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-700"
                onClick={() =>
                  updateElement(
                    activeElement.id,
                    { fontSize: Math.min(240, (activeElement as TextElement).fontSize + 2) },
                    true
                  )
                }
              >
                +
              </button>
            </div>

            {/* Text Color */}
            <ColorPicker
              value={(activeElement as TextElement).fill || "#F5F5F0"}
              onChange={(color) => updateElement(activeElement.id, { fill: color }, true)}
            />

            <div className="w-px h-5 bg-zinc-700/60 mx-1" />

            {/* Format Toggles */}
            <TooltipButton
              tooltip="Bold"
              size="sm"
              isActive={
                (activeElement as TextElement).fontWeight === 700 ||
                (activeElement as TextElement).fontWeight === "bold"
              }
              onClick={() => {
                const isBold =
                  (activeElement as TextElement).fontWeight === 700 ||
                  (activeElement as TextElement).fontWeight === "bold";
                updateElement(activeElement.id, { fontWeight: isBold ? 400 : 700 }, true);
              }}
            >
              <Bold className="w-3.5 h-3.5" />
            </TooltipButton>

            <TooltipButton
              tooltip="Italic"
              size="sm"
              isActive={(activeElement as TextElement).italic}
              onClick={() =>
                updateElement(
                  activeElement.id,
                  { italic: !(activeElement as TextElement).italic },
                  true
                )
              }
            >
              <Italic className="w-3.5 h-3.5" />
            </TooltipButton>

            <TooltipButton
              tooltip="Underline"
              size="sm"
              isActive={(activeElement as TextElement).underline}
              onClick={() =>
                updateElement(
                  activeElement.id,
                  { underline: !(activeElement as TextElement).underline },
                  true
                )
              }
            >
              <Underline className="w-3.5 h-3.5" />
            </TooltipButton>

            {/* Text Alignment */}
            <div className="flex items-center gap-0.5 bg-zinc-800/60 p-0.5 rounded-lg border border-zinc-700/40">
              <TooltipButton
                tooltip="Align Left"
                size="sm"
                className="w-6 h-6 rounded"
                isActive={(activeElement as TextElement).textAlign === "left"}
                onClick={() => updateElement(activeElement.id, { textAlign: "left" }, true)}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </TooltipButton>
              <TooltipButton
                tooltip="Align Center"
                size="sm"
                className="w-6 h-6 rounded"
                isActive={(activeElement as TextElement).textAlign === "center"}
                onClick={() => updateElement(activeElement.id, { textAlign: "center" }, true)}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </TooltipButton>
              <TooltipButton
                tooltip="Align Right"
                size="sm"
                className="w-6 h-6 rounded"
                isActive={(activeElement as TextElement).textAlign === "right"}
                onClick={() => updateElement(activeElement.id, { textAlign: "right" }, true)}
              >
                <AlignRight className="w-3.5 h-3.5" />
              </TooltipButton>
            </div>
          </>
        )}

        {/* Shape Element Controls */}
        {!isMulti && activeElement.type === "shape" && (
          <>
            <ColorPicker
              label="Fill"
              value={(activeElement as ShapeElement).fill || "transparent"}
              onChange={(color) => updateElement(activeElement.id, { fill: color }, true)}
            />

            <ColorPicker
              label="Stroke"
              value={(activeElement as ShapeElement).stroke || "#F59E0B"}
              onChange={(color) => updateElement(activeElement.id, { stroke: color }, true)}
            />

            {/* Shape Properties Popover (Stroke Width, Corner Radius, Opacity) */}
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-xl outline-none transition-colors">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Style</span>
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  sideOffset={8}
                  className="z-50 w-64 p-3.5 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700/60 rounded-2xl shadow-2xl flex flex-col gap-3 animate-in fade-in-0 zoom-in-95"
                >
                  <SliderControl
                    label="Stroke Width"
                    value={(activeElement as ShapeElement).strokeWidth || 0}
                    min={0}
                    max={20}
                    unit="px"
                    onChange={(val) => updateElement(activeElement.id, { strokeWidth: val }, true)}
                  />

                  {(activeElement as ShapeElement).shapeKind === "rectangle" && (
                    <SliderControl
                      label="Corner Radius"
                      value={(activeElement as ShapeElement).cornerRadius || 0}
                      min={0}
                      max={100}
                      unit="px"
                      onChange={(val) =>
                        updateElement(activeElement.id, { cornerRadius: val }, true)
                      }
                    />
                  )}

                  <SliderControl
                    label="Opacity"
                    value={Math.round(activeElement.opacity * 100)}
                    min={0}
                    max={100}
                    unit="%"
                    onChange={(val) =>
                      updateElement(activeElement.id, { opacity: val / 100 }, true)
                    }
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                    <span className="text-zinc-400 font-medium">Stroke Style</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          updateElement(activeElement.id, { strokeStyle: "solid" }, true)
                        }
                        className={`px-2 py-1 rounded text-[11px] font-medium ${
                          (activeElement as ShapeElement).strokeStyle !== "dashed"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        Solid
                      </button>
                      <button
                        onClick={() =>
                          updateElement(activeElement.id, { strokeStyle: "dashed" }, true)
                        }
                        className={`px-2 py-1 rounded text-[11px] font-medium ${
                          (activeElement as ShapeElement).strokeStyle === "dashed"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        Dashed
                      </button>
                    </div>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </>
        )}

        {/* Image Element Controls */}
        {!isMulti && activeElement.type === "image" && (
          <>
            <TooltipButton
              tooltip="Flip Horizontal"
              size="sm"
              onClick={() =>
                updateElement(
                  activeElement.id,
                  { flipX: !(activeElement as ImageElement).flipX },
                  true
                )
              }
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </TooltipButton>

            <TooltipButton
              tooltip="Flip Vertical"
              size="sm"
              onClick={() =>
                updateElement(
                  activeElement.id,
                  { flipY: !(activeElement as ImageElement).flipY },
                  true
                )
              }
            >
              <FlipVertical className="w-3.5 h-3.5" />
            </TooltipButton>

            <TooltipButton
              tooltip="Replace Image"
              size="sm"
              onClick={() => setAssetModalOpen(true)}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </TooltipButton>
          </>
        )}

        <div className="w-px h-5 bg-zinc-700/60 mx-1" />

        {/* Common Layer & Manipulation Controls */}
        <TooltipButton
          tooltip="Bring Forward"
          shortcut="]"
          size="sm"
          onClick={() => bringForward(activeElement.id)}
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </TooltipButton>

        <TooltipButton
          tooltip="Send Backward"
          shortcut="["
          size="sm"
          onClick={() => sendBackward(activeElement.id)}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </TooltipButton>

        <TooltipButton
          tooltip="Duplicate"
          shortcut="Ctrl+D"
          size="sm"
          onClick={duplicateSelected}
        >
          <Copy className="w-3.5 h-3.5" />
        </TooltipButton>

        <TooltipButton
          tooltip={activeElement.locked ? "Unlock" : "Lock"}
          size="sm"
          isActive={activeElement.locked}
          onClick={() => toggleLock(activeElement.id)}
        >
          {activeElement.locked ? (
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Unlock className="w-3.5 h-3.5" />
          )}
        </TooltipButton>

        <TooltipButton
          tooltip="Delete"
          shortcut="Del"
          variant="danger"
          size="sm"
          onClick={removeSelected}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </TooltipButton>
      </motion.div>
    </AnimatePresence>
  );
}
