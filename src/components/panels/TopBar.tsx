"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";
import { useHistory } from "@/hooks/useHistory";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const ZOOM_PRESETS = [0.25, 0.5, 0.68, 0.75, 1.0, 1.25, 1.5, 2.0];

const ARTBOARD_PRESETS = [
  { label: "Square", width: 1080, height: 1080 },
  { label: "Story", width: 1080, height: 1920 },
  { label: "Landscape", width: 1920, height: 1080 },
  { label: "Banner", width: 1200, height: 630 },
];

export function TopBar() {
  const document = useCanvasStore((s) => s.document);
  const updateDocumentProps = useCanvasStore((s) => s.updateDocumentProps);
  const { canUndo, canRedo, undo, redo } = useHistory();

  const zoom = useToolStore((s) => s.zoom);
  const setZoom = useToolStore((s) => s.setZoom);
  const setExportModalOpen = useToolStore((s) => s.setExportModalOpen);
  const setAiPaletteOpen = useToolStore((s) => s.setAiPaletteOpen);
  const setProjectsModalOpen = useToolStore((s) => s.setProjectsModalOpen);

  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-low/95 backdrop-blur-2xl z-40 px-6 flex items-center justify-between border-b border-outline-variant/10 select-none">
        {/* Left: Hamburger + Logo + Project Title + Projects Manager */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu Trigger */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsNavOpen(true)}
            className="p-2 -ml-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-xl transition-all outline-none cursor-pointer flex items-center justify-center"
            title="Open Navigation"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </motion.button>

          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              alt="Logo"
              className="h-7 w-auto transition-transform group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf9sJfkcZ6Hh5pMoK0637r0eaUSLpmVwRqf9u8UPJXTcSA34CuN56IEbHKjI98hn1CRX2eMZi-LVV_15YAPK5B7kNcMDSGVAxl-Y9TH7oWI0U0-LFaIfbke9RWCyFQp4X6UsqRRbBSvs7lFWv-rjZHJ2mguAVnH5dtBM2z2vIOX-o9cm49oYBzMDCGKVWuSoBcDnlFpCdernsXLnpqAQHExW_cTymRysWSuh_PaC5c3n67HhH5LIL9"
            />
            <span className="font-headline-sm text-base text-on-surface font-semibold hidden sm:inline">
              Imagery
            </span>
          </Link>

          <div className="w-px h-5 bg-outline-variant/20 mx-1 hidden sm:block"></div>

          {/* Project Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[16px]">brush</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[9px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Project
              </span>
              <input
                type="text"
                value={document.title}
                onChange={(e) => updateDocumentProps({ title: e.target.value })}
                className="font-body-md text-xs sm:text-sm text-on-surface font-medium bg-transparent outline-none border-b border-transparent hover:border-surface-variant focus:border-primary transition-colors max-w-[160px] sm:max-w-[220px]"
                placeholder="Untitled Project"
              />
            </div>
          </div>
          
          <div className="w-px h-5 bg-outline-variant/20 mx-1 hidden sm:block"></div>

          {/* Artboard Dimensions Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/60 px-2.5 py-1.5 rounded-xl border border-outline-variant/10 transition-colors outline-none cursor-pointer hidden md:flex"
              >
                <span className="material-symbols-outlined text-[16px]">crop_free</span>
                <span>{document.width} × {document.height}</span>
              </motion.button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={8}
                className="z-50 w-52 p-2 bg-surface-container-high/95 backdrop-blur-2xl border border-outline-variant/20 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 flex flex-col gap-1"
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  Artboard Presets
                </div>
                {ARTBOARD_PRESETS.map((preset) => (
                  <DropdownMenu.Item
                    key={preset.label}
                    onClick={() => {
                      updateDocumentProps({ width: preset.width, height: preset.height });
                      setZoom(0.5);
                      useToolStore.getState().setPan({ x: 0, y: 0 });
                    }}
                    className="flex items-center justify-between px-3 py-2 text-label-md font-label-md text-on-surface hover:bg-primary-container hover:text-on-primary-container rounded-xl cursor-pointer outline-none transition-colors"
                  >
                    <span>{preset.label}</span>
                    <span className="text-[10px] opacity-60 font-mono">
                      {preset.width}x{preset.height}
                    </span>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Projects Hub Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setProjectsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-variant/70 hover:bg-surface-variant text-on-surface-variant hover:text-on-surface rounded-xl font-medium text-xs border border-outline-variant/15 transition-all cursor-pointer hidden lg:flex"
            title="View All Saved Projects (IndexedDB)"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">folder_open</span>
            <span>Projects</span>
          </motion.button>
        </div>

        {/* Right: AI Palette, Actions, Zoom, Export, Search, Notifications, Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* AI Command Palette Trigger (Glowing ✨) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAiPaletteOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-amber-500/15 text-primary border border-primary/35 rounded-full font-semibold text-xs shadow-[0_0_20px_rgba(251,188,0,0.18)] hover:border-primary/70 transition-all cursor-pointer"
            title="Open AI Command Palette (Cmd+K)"
          >
            <span className="material-symbols-outlined text-[16px] text-primary animate-pulse">auto_awesome</span>
            <span className="hidden sm:inline">Ask AI</span>
            <span className="text-[10px] font-mono opacity-60 bg-surface-container px-1.5 py-0.5 rounded ml-0.5">⌘K</span>
          </motion.button>

          {/* AI Audit Log Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const { isOpen, setIsOpen } = require("@/store/useAILogStore").useAILogStore.getState();
              setIsOpen(!isOpen);
            }}
            className="flex items-center justify-center p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors cursor-pointer"
            title="View AI Audit Log"
          >
            <span className="material-symbols-outlined text-[18px]">history_edu</span>
          </motion.button>

          <div className="w-px h-5 bg-outline-variant/20 hidden sm:block"></div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 bg-surface-variant/40 p-1 rounded-xl">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">undo</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">redo</span>
            </motion.button>
          </div>

          <div className="w-px h-5 bg-outline-variant/20 hidden sm:block"></div>

          {/* Zoom */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 font-label-md text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/60 px-2.5 py-1.5 rounded-xl border border-outline-variant/10 transition-colors outline-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                <span>{Math.round(zoom * 100)}%</span>
              </motion.button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={8}
                className="z-50 w-32 p-2 bg-surface-container-high/95 backdrop-blur-2xl border border-outline-variant/20 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 flex flex-col gap-1"
              >
                {ZOOM_PRESETS.map((preset) => (
                  <DropdownMenu.Item
                    key={preset}
                    onClick={() => setZoom(preset)}
                    className="flex items-center justify-between px-3 py-2 text-label-md font-label-md text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container rounded-xl cursor-pointer outline-none transition-colors"
                  >
                    <span>{Math.round(preset * 100)}%</span>
                    {preset === 1.0 && (
                      <span className="text-[10px] opacity-50">100%</span>
                    )}
                    {preset === 0.68 && (
                      <span className="text-[10px] text-primary">Fit</span>
                    )}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setExportModalOpen(true)}
            className="px-5 py-1.5 bg-primary text-on-primary font-label-md text-xs font-semibold rounded-full shadow-lg shadow-primary/20 hover:bg-primary-fixed transition-all outline-none cursor-pointer"
          >
            Export
          </motion.button>

          <div className="w-px h-5 bg-outline-variant/20 hidden md:block"></div>

          {/* Search & Notifications & Profile */}
          <div className="flex items-center gap-1.5">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-1.5 hover:bg-surface-variant rounded-full text-on-surface-variant transition-colors hidden md:flex cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-1.5 hover:bg-surface-variant rounded-full text-on-surface-variant transition-colors hidden md:flex cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </motion.button>
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-fixed-dim/20 ml-1"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_d_iY_ZcmsZaivAKpm_unHS0JFH0vHQuZpWn8MKQbJtdx6ruoy8vM2W0X8eUrgHC4UE2tTAIafaiuGDzmZxSGVv99e6reXIUYvZGfFflaLm-tKYym8zlHQgqY5CkLntetpIFVOW8ajuS0bkN0TkJabvSoB6JiAhdt3zZLtjMI_9cQayibnIxZ3RSvcohBdAGFN-GmdMsLyfUtJZTn-W7vJiqIKTwaS-jOhfoKiIzXbkMXtSusa5Ah"
            />
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer */}
      <AnimatePresence>
        {isNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNavOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Slide-out Panel */}
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-surface-container-low border-r border-outline-variant/15 z-50 flex flex-col p-6 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <img
                    alt="Logo"
                    className="h-8"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf9sJfkcZ6Hh5pMoK0637r0eaUSLpmVwRqf9u8UPJXTcSA34CuN56IEbHKjI98hn1CRX2eMZi-LVV_15YAPK5B7kNcMDSGVAxl-Y9TH7oWI0U0-LFaIfbke9RWCyFQp4X6UsqRRbBSvs7lFWv-rjZHJ2mguAVnH5dtBM2z2vIOX-o9cm49oYBzMDCGKVWuSoBcDnlFpCdernsXLnpqAQHExW_cTymRysWSuh_PaC5c3n67HhH5LIL9"
                  />
                  <span className="font-headline-sm text-lg text-on-surface font-semibold">
                    Imagery
                  </span>
                </div>
                <button
                  onClick={() => setIsNavOpen(false)}
                  className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 py-6 space-y-2">
                <Link
                  href="/editor"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all bg-primary-container text-on-primary-container font-semibold text-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">brush</span>
                  <span>Studio Editor</span>
                </Link>
                <Link
                  href="/"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-on-surface-variant hover:bg-surface-variant transition-all hover:text-on-surface text-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">home</span>
                  <span>Home / Upload</span>
                </Link>
                <button
                  onClick={() => {
                    setIsNavOpen(false);
                    setProjectsModalOpen(true);
                  }}
                  className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-on-surface-variant hover:bg-surface-variant transition-all hover:text-on-surface text-sm w-full text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">folder_open</span>
                  <span>Projects</span>
                </button>
                <button
                  onClick={() => {
                    setIsNavOpen(false);
                    useToolStore.getState().setAssetModalOpen(true);
                  }}
                  className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-on-surface-variant hover:bg-surface-variant transition-all hover:text-on-surface text-sm w-full text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">image</span>
                  <span>Assets & Upload</span>
                </button>
              </nav>

              {/* Footer */}
              <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between text-xs text-on-surface-variant">
                <span>Imagery Studio v2.0</span>
                <span className="text-[10px] bg-surface-variant px-2 py-0.5 rounded-md font-mono">PRO</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


