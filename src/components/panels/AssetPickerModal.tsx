"use client";

import React, { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Upload, X, Sparkles, Image as ImageIcon } from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";
import { ImageElement } from "@/types/canvas";

const CURATED_STOCK_PHOTOS = [
  {
    id: "stock_1",
    title: "Minimal Studio Architecture",
    category: "Architecture",
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "stock_2",
    title: "Warm Amber Light & Shadow",
    category: "Editorial",
    src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "stock_3",
    title: "Velvety Dark Abstract",
    category: "Abstract",
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "stock_4",
    title: "Luxury Modern Interior",
    category: "Interior",
    src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "stock_5",
    title: "Editorial Fashion Silhouette",
    category: "Portrait",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "stock_6",
    title: "Organic Stone Texture",
    category: "Texture",
    src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "stock_7",
    title: "Golden Hour Botanical",
    category: "Nature",
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "stock_8",
    title: "Tactile Neutral Fabric",
    category: "Texture",
    src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop",
  },
];

export function AssetPickerModal() {
  const isAssetModalOpen = useToolStore((s) => s.isAssetModalOpen);
  const setAssetModalOpen = useToolStore((s) => s.setAssetModalOpen);
  const addElement = useCanvasStore((s) => s.addElement);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"stock" | "upload">("stock");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Architecture", "Editorial", "Abstract", "Interior", "Portrait", "Texture", "Nature"];

  const handleInsertImage = (src: string, title?: string) => {
    const id = `el_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const imageEl: ImageElement = {
      id,
      name: title || "Image",
      type: "image",
      src,
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
    setAssetModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        handleInsertImage(event.target.result, file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredStock =
    selectedCategory === "All"
      ? CURATED_STOCK_PHOTOS
      : CURATED_STOCK_PHOTOS.filter((photo) => photo.category === selectedCategory);

  return (
    <Dialog.Root open={isAssetModalOpen} onOpenChange={setAssetModalOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-2xl max-h-[85vh] bg-zinc-900/95 backdrop-blur-3xl border border-zinc-700/60 rounded-3xl shadow-2xl p-6 flex flex-col gap-5 text-zinc-100 animate-in fade-in-0 zoom-in-95 outline-none select-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-semibold tracking-tight">
                  Studio Asset Library
                </Dialog.Title>
                <Dialog.Description className="text-xs text-zinc-400">
                  Select curated aesthetic photography or upload local media.
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-zinc-800/60 p-1 rounded-xl border border-zinc-700/40">
              <button
                onClick={() => setActiveTab("stock")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "stock"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Curated Editorial
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "upload"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Local Upload
              </button>
            </div>

            {activeTab === "stock" && (
              <div className="flex gap-1 overflow-x-auto max-w-[340px] pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex-shrink-0 ${
                      selectedCategory === cat
                        ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content Body */}
          {activeTab === "stock" ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-y-auto max-h-[50vh] pr-1">
              {filteredStock.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => handleInsertImage(photo.src, photo.title)}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-zinc-800 hover:border-amber-500/50 cursor-pointer transition-all shadow-md hover:scale-[1.02]"
                >
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                    <span className="text-[11px] font-medium text-zinc-100 truncate">
                      {photo.title}
                    </span>
                    <span className="text-[9px] text-amber-400 font-mono">
                      {photo.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (typeof event.target?.result === "string") {
                      handleInsertImage(event.target.result, file.name.replace(/\.[^/.]+$/, ""));
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="flex flex-col items-center justify-center gap-3 h-64 border-2 border-dashed border-zinc-700 hover:border-amber-500/60 rounded-3xl bg-zinc-800/30 hover:bg-zinc-800/60 cursor-pointer transition-all p-6 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-medium text-zinc-200">
                  Click or drag image file here
                </span>
                <p className="text-xs text-zinc-500 mt-1">
                  Supports PNG, JPG, SVG, WebP up to 25MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
