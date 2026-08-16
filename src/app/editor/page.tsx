"use client";

import React from "react";
import { TopBar } from "@/components/panels/TopBar";
import { LeftRail } from "@/components/panels/LeftRail";
import { CanvasWorkspace } from "@/components/canvas/CanvasWorkspace";
import { FloatingContextToolbar } from "@/components/canvas/FloatingContextToolbar";
import { LayerDrawer } from "@/components/panels/LayerDrawer";
import { AssetPickerModal } from "@/components/panels/AssetPickerModal";
import { ExportModal } from "@/components/modals/ExportModal";
import { CropModal } from "@/components/modals/CropModal";
import { CommandPalette } from "@/components/modals/CommandPalette";
import { ContextMenu } from "@/components/modals/ContextMenu";
import { ProjectsModal } from "@/components/modals/ProjectsModal";

export default function EditorPage() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background select-none">
      {/* Top Header Bar with Hamburger Menu */}
      <TopBar />

      {/* Main Full-Width Canvas Workspace */}
      <main className="pt-16 flex-1 w-full h-full relative overflow-hidden flex items-center justify-center">
        <div
          className="relative w-full h-full bg-background overflow-hidden flex items-center justify-center"
          style={{
            backgroundImage: "radial-gradient(circle at center, #353534 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        >
          {/* Contextual Left Tool Rail */}
          <LeftRail />

          {/* The Fabric Canvas */}
          <CanvasWorkspace />

          {/* The Contextual Inspector */}
          <FloatingContextToolbar />

          {/* Layer Stack Drawer */}
          <LayerDrawer />
        </div>
      </main>

      {/* Global Modals & AI Palette */}
      <AssetPickerModal />
      <ExportModal />
      <CropModal />
      <CommandPalette />
      <ContextMenu />
      <ProjectsModal />
    </div>
  );
}

