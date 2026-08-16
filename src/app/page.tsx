"use client";

import React from "react";
import { TopBar } from "@/components/panels/TopBar";
import { LeftRail } from "@/components/panels/LeftRail";
import { CanvasWorkspace } from "@/components/canvas/CanvasWorkspace";
import { LayerDrawer } from "@/components/panels/LayerDrawer";
import { AssetPickerModal } from "@/components/panels/AssetPickerModal";
import { ExportModal } from "@/components/modals/ExportModal";

export default function ImageryStudioPage() {
  return (
    <div className="flex flex-col w-screen h-screen bg-workspace overflow-hidden select-none">
      {/* Studio Header */}
      <TopBar />

      {/* Main Studio Workspace Container */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Left Floating Tool Rail */}
        <LeftRail />

        {/* Viewport Canvas Stage */}
        <CanvasWorkspace />

        {/* Sliding Layer Stack Drawer */}
        <LayerDrawer />
      </div>

      {/* Modals */}
      <AssetPickerModal />
      <ExportModal />
    </div>
  );
}
