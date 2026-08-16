import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CanvasState, CanvasElement } from '../types';

interface CanvasStoreState {
  canvas: CanvasState;
  past: CanvasState[];
  future: CanvasState[];
  
  // AI Status
  aiStatus: 'idle' | 'thinking' | 'error';
  setAiStatus: (status: 'idle' | 'thinking' | 'error') => void;
  aiErrorMessage: string | null;
  setAiError: (msg: string | null) => void;
  
  // Conversation History
  messages: Array<{ role: 'user' | 'assistant', content: string }>;
  addMessage: (msg: { role: 'user' | 'assistant', content: string }) => void;
  
  // Animation state
  isAnimating: boolean;
  setAnimating: (val: boolean) => void;

  // Export trigger
  exportRequested: number;
  requestExport: () => void;

  // Actions
  updateCanvas: (newState: CanvasState) => void;
  updateCanvasFromAI: (newState: CanvasState) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  
  // History Actions
  commit: () => void;
  undo: () => void;
  redo: () => void;
  
  // Internal flag to prevent infinite loops when syncing from Fabric
  isInternalUpdate: boolean;
  setInternalUpdate: (val: boolean) => void;
}

const defaultCanvasState: CanvasState = {
  width: 800,
  height: 1100,
  background: { type: 'solid', color: '#ffffff' },
  elements: [
    {
      id: 'el_title',
      type: 'text',
      content: 'Imagery',
      x: 400,
      y: 550,
      width: 400,
      height: 100,
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      visible: true,
      locked: false,
      semantic: { role: 'title' },
      fontFamily: 'Inter',
      fontSize: 64,
      fontWeight: '700',
      fontStyle: 'normal',
      textAlign: 'center',
      lineHeight: 1.2,
      letterSpacing: 0,
      color: '#000000',
      textDecoration: 'none',
    },
  ],
};

const MAX_HISTORY = 50;

export const useCanvasStore = create<CanvasStoreState>()(
  immer((set, get) => ({
    canvas: defaultCanvasState,
    past: [],
    future: [],
    isInternalUpdate: false,
    aiStatus: 'idle',
    aiErrorMessage: null,
    messages: [],
    isAnimating: false,
    exportRequested: 0,

    setAiStatus: (status) => set((state) => { state.aiStatus = status; }),
    setAiError: (msg) => set((state) => { state.aiErrorMessage = msg; }),
    addMessage: (msg) => set((state) => { state.messages.push(msg); }),
    setAnimating: (val) => set((state) => { state.isAnimating = val; }),
    requestExport: () => set((state) => { state.exportRequested += 1; }),

    setInternalUpdate: (val) => set((state) => { state.isInternalUpdate = val; }),

    commit: () => set((state) => {
      state.past.push(JSON.parse(JSON.stringify(state.canvas)));
      if (state.past.length > MAX_HISTORY) {
        state.past.shift();
      }
      state.future = []; // Clear future on new action
    }),

    updateCanvas: (newState) => set((state) => {
      get().commit();
      state.canvas = newState;
    }),

    updateCanvasFromAI: (newState) => set((state) => {
      get().commit();
      state.canvas = newState;
      state.isAnimating = true; // Tell FabricCanvas to animate to this state rather than instant redraw
      console.log("[DEBUG 5] Zustand canvas updated from AI.");
      console.log("[DEBUG 6] Number of elements in Zustand:", state.canvas.elements.length);
    }),

    updateElement: (id, updates) => set((state) => {
      // Don't commit here, commit should happen on drag start or drop end
      const el = state.canvas.elements.find(e => e.id === id);
      if (el) {
        Object.assign(el, updates);
      }
    }),

    removeElement: (id) => set((state) => {
      get().commit();
      state.canvas.elements = state.canvas.elements.filter(e => e.id !== id);
    }),

    undo: () => set((state) => {
      if (state.past.length > 0) {
        const previous = state.past.pop()!;
        state.future.push(JSON.parse(JSON.stringify(state.canvas)));
        state.canvas = previous;
        state.isInternalUpdate = false; // Force resync to fabric
      }
    }),

    redo: () => set((state) => {
      if (state.future.length > 0) {
        const next = state.future.pop()!;
        state.past.push(JSON.parse(JSON.stringify(state.canvas)));
        state.canvas = next;
        state.isInternalUpdate = false; // Force resync to fabric
      }
    }),
  }))
);
