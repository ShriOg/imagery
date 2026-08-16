import { create } from 'zustand';
import { ShapeKind } from '@/types/canvas';

export type ToolType = 'select' | 'text' | 'shape' | 'image' | 'hand';

interface ToolStoreState {
  activeTool: ToolType;
  activeShapeKind: ShapeKind;
  zoom: number;
  pan: { x: number; y: number };
  isSpacePressed: boolean;
  
  // Drawer & Modal States
  isLayerDrawerOpen: boolean;
  isAssetModalOpen: boolean;
  isExportModalOpen: boolean;
  isCropModalOpen: boolean;
  isAiPaletteOpen: boolean;
  isProjectsModalOpen: boolean;
  isGenerating: boolean;

  // Actions
  setActiveTool: (tool: ToolType) => void;
  setActiveShapeKind: (shape: ShapeKind) => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  resetViewport: () => void;
  setIsSpacePressed: (pressed: boolean) => void;
  
  setLayerDrawerOpen: (open: boolean) => void;
  toggleLayerDrawer: () => void;
  setAssetModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setCropModalOpen: (open: boolean) => void;
  setAiPaletteOpen: (open: boolean) => void;
  setProjectsModalOpen: (open: boolean) => void;
  setIsGenerating: (generating: boolean) => void;
}

export const useToolStore = create<ToolStoreState>((set) => ({
  activeTool: 'select',
  activeShapeKind: 'rectangle',
  zoom: 0.68,
  pan: { x: 0, y: 0 },
  isSpacePressed: false,

  isLayerDrawerOpen: false,
  isAssetModalOpen: false,
  isExportModalOpen: false,
  isCropModalOpen: false,
  isAiPaletteOpen: false,
  isProjectsModalOpen: false,
  isGenerating: false,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveShapeKind: (shape) => set({ activeShapeKind: shape, activeTool: 'shape' }),
  
  setZoom: (zoomOrFn) => set((state) => {
    const nextZoom = typeof zoomOrFn === 'function' ? zoomOrFn(state.zoom) : zoomOrFn;
    return { zoom: Math.min(3.0, Math.max(0.15, Number(nextZoom.toFixed(2)))) };
  }),

  zoomIn: () => set((state) => ({
    zoom: Math.min(3.0, Number((state.zoom + 0.15).toFixed(2)))
  })),

  zoomOut: () => set((state) => ({
    zoom: Math.max(0.15, Number((state.zoom - 0.15).toFixed(2)))
  })),

  resetZoom: () => set({ zoom: 1.0 }),

  setPan: (panOrFn) => set((state) => ({
    pan: typeof panOrFn === 'function' ? panOrFn(state.pan) : panOrFn
  })),

  resetViewport: () => set({ zoom: 0.68, pan: { x: 0, y: 0 } }),

  setIsSpacePressed: (pressed) => set({ isSpacePressed: pressed }),

  setLayerDrawerOpen: (open) => set({ isLayerDrawerOpen: open }),
  toggleLayerDrawer: () => set((state) => ({ isLayerDrawerOpen: !state.isLayerDrawerOpen })),
  
  setAssetModalOpen: (open) => set({ isAssetModalOpen: open }),
  setExportModalOpen: (open) => set({ isExportModalOpen: open }),
  setCropModalOpen: (open) => set({ isCropModalOpen: open }),
  setAiPaletteOpen: (open) => set({ isAiPaletteOpen: open }),
  setProjectsModalOpen: (open) => set({ isProjectsModalOpen: open }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
}));
