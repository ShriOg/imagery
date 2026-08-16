import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CanvasDocument, CanvasElement, TextElement, ShapeElement, ImageElement } from '@/types/canvas';

interface CanvasStoreState {
  document: CanvasDocument;
  past: CanvasDocument[];
  future: CanvasDocument[];
  selectedIds: string[];
  isInternalUpdate: boolean;

  // History Actions
  commitHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Selection & Guardrail
  setSelectedIds: (ids: string[]) => void;
  setInternalUpdate: (val: boolean) => void;

  // Document Properties
  updateDocumentProps: (props: Partial<Pick<CanvasDocument, 'title' | 'width' | 'height' | 'backgroundColor'>>) => void;
  setDocument: (doc: CanvasDocument) => void;
  createNewProject: (title?: string) => void;
  loadProject: (doc: CanvasDocument) => void;

  // Element Actions
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>, recordHistory?: boolean) => void;
  updateElements: (updates: Array<{ id: string; changes: Partial<CanvasElement> }>, recordHistory?: boolean) => void;
  removeElement: (id: string) => void;
  removeSelected: () => void;
  duplicateElement: (id: string) => void;
  duplicateSelected: () => void;

  // Layer Reordering (Canonical zIndex)
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  reorderLayer: (sourceIndex: number, destinationIndex: number) => void;

  // Element State Toggles
  toggleLock: (id: string) => void;
  toggleVisibility: (id: string) => void;
  renameElement: (id: string, name: string) => void;
}

const MAX_HISTORY = 50;

const initialDocument: CanvasDocument = {
  id: 'doc_default',
  title: 'Untitled Studio Design',
  width: 1920,
  height: 1080,
  backgroundColor: '#131313',
  elements: [],
};

export const useCanvasStore = create<CanvasStoreState>()(
  immer((set, get) => ({
    document: initialDocument,
    past: [],
    future: [],
    selectedIds: [],
    isInternalUpdate: false,

    commitHistory: () => set((state) => {
      // Sort elements by zIndex before saving snapshot
      state.document.elements.sort((a, b) => a.zIndex - b.zIndex);
      state.past.push(JSON.parse(JSON.stringify(state.document)));
      if (state.past.length > MAX_HISTORY) {
        state.past.shift();
      }
      state.future = [];
    }),

    undo: () => set((state) => {
      if (state.past.length === 0) return;
      const previous = state.past.pop()!;
      state.future.push(JSON.parse(JSON.stringify(state.document)));
      state.document = previous;
      // Filter out selection if selected element no longer exists
      const existingIds = new Set(previous.elements.map(e => e.id));
      state.selectedIds = state.selectedIds.filter(id => existingIds.has(id));
    }),

    redo: () => set((state) => {
      if (state.future.length === 0) return;
      const next = state.future.pop()!;
      state.past.push(JSON.parse(JSON.stringify(state.document)));
      state.document = next;
      const existingIds = new Set(next.elements.map(e => e.id));
      state.selectedIds = state.selectedIds.filter(id => existingIds.has(id));
    }),

    setSelectedIds: (ids) => set((state) => {
      state.selectedIds = ids;
    }),

    setInternalUpdate: (val) => set((state) => {
      state.isInternalUpdate = val;
    }),

    updateDocumentProps: (props) => set((state) => {
      get().commitHistory();
      Object.assign(state.document, props);
    }),

    setDocument: (doc) => set((state) => {
      get().commitHistory();
      state.document = doc;
      state.selectedIds = [];
    }),

    createNewProject: (title = 'Untitled Design') => set((state) => {
      const newDoc: CanvasDocument = {
        id: `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        title,
        width: 1920,
        height: 1080,
        backgroundColor: '#131313',
        elements: [],
      };
      state.document = newDoc;
      state.past = [];
      state.future = [];
      state.selectedIds = [];
    }),

    loadProject: (doc) => set((state) => {
      state.document = doc;
      state.past = [];
      state.future = [];
      state.selectedIds = [];
    }),

    addElement: (element) => set((state) => {
      get().commitHistory();
      const maxZ = state.document.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
      element.zIndex = maxZ + 1;
      if (!element.name) {
        element.name = `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} ${state.document.elements.length + 1}`;
      }
      state.document.elements.push(element);
      state.selectedIds = [element.id];
    }),

    updateElement: (id, updates, recordHistory = false) => set((state) => {
      if (recordHistory) {
        get().commitHistory();
      }
      const el = state.document.elements.find(e => e.id === id);
      if (el) {
        Object.assign(el, updates);
      }
    }),

    updateElements: (updates, recordHistory = false) => set((state) => {
      if (recordHistory) {
        get().commitHistory();
      }
      updates.forEach(({ id, changes }) => {
        const el = state.document.elements.find(e => e.id === id);
        if (el) {
          Object.assign(el, changes);
        }
      });
    }),

    removeElement: (id) => set((state) => {
      get().commitHistory();
      state.document.elements = state.document.elements.filter(e => e.id !== id);
      state.selectedIds = state.selectedIds.filter(selectedId => selectedId !== id);
    }),

    removeSelected: () => set((state) => {
      if (state.selectedIds.length === 0) return;
      get().commitHistory();
      const toRemove = new Set(state.selectedIds);
      state.document.elements = state.document.elements.filter(e => !toRemove.has(e.id));
      state.selectedIds = [];
    }),

    duplicateElement: (id) => set((state) => {
      const el = state.document.elements.find(e => e.id === id);
      if (!el) return;
      get().commitHistory();
      const maxZ = state.document.elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
      const newEl: CanvasElement = {
        ...JSON.parse(JSON.stringify(el)),
        id: `el_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        name: `${el.name || el.type} (Copy)`,
        x: el.x + 24,
        y: el.y + 24,
        zIndex: maxZ + 1,
      };
      state.document.elements.push(newEl);
      state.selectedIds = [newEl.id];
    }),

    duplicateSelected: () => set((state) => {
      if (state.selectedIds.length === 0) return;
      get().commitHistory();
      let maxZ = state.document.elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
      const newIds: string[] = [];
      state.selectedIds.forEach((id) => {
        const el = state.document.elements.find(e => e.id === id);
        if (!el) return;
        maxZ += 1;
        const newEl: CanvasElement = {
          ...JSON.parse(JSON.stringify(el)),
          id: `el_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
          name: `${el.name || el.type} (Copy)`,
          x: el.x + 24,
          y: el.y + 24,
          zIndex: maxZ,
        };
        state.document.elements.push(newEl);
        newIds.push(newEl.id);
      });
      state.selectedIds = newIds;
    }),

    bringForward: (id) => set((state) => {
      get().commitHistory();
      const elements = state.document.elements;
      const el = elements.find(e => e.id === id);
      if (!el) return;
      const above = elements.filter(e => e.zIndex > el.zIndex).sort((a, b) => a.zIndex - b.zIndex)[0];
      if (above) {
        const temp = el.zIndex;
        el.zIndex = above.zIndex;
        above.zIndex = temp;
        elements.sort((a, b) => a.zIndex - b.zIndex);
      }
    }),

    sendBackward: (id) => set((state) => {
      get().commitHistory();
      const elements = state.document.elements;
      const el = elements.find(e => e.id === id);
      if (!el) return;
      const below = elements.filter(e => e.zIndex < el.zIndex).sort((a, b) => b.zIndex - a.zIndex)[0];
      if (below) {
        const temp = el.zIndex;
        el.zIndex = below.zIndex;
        below.zIndex = temp;
        elements.sort((a, b) => a.zIndex - b.zIndex);
      }
    }),

    bringToFront: (id) => set((state) => {
      get().commitHistory();
      const elements = state.document.elements;
      const el = elements.find(e => e.id === id);
      if (!el) return;
      const maxZ = Math.max(...elements.map(e => e.zIndex), 0);
      el.zIndex = maxZ + 1;
      elements.sort((a, b) => a.zIndex - b.zIndex);
    }),

    sendToBack: (id) => set((state) => {
      get().commitHistory();
      const elements = state.document.elements;
      const el = elements.find(e => e.id === id);
      if (!el) return;
      const minZ = Math.min(...elements.map(e => e.zIndex), 0);
      el.zIndex = minZ - 1;
      elements.sort((a, b) => a.zIndex - b.zIndex);
    }),

    reorderLayer: (sourceIndex, destinationIndex) => set((state) => {
      get().commitHistory();
      // Descending order in UI, so convert to array
      const elementsDesc = [...state.document.elements].sort((a, b) => b.zIndex - a.zIndex);
      const [moved] = elementsDesc.splice(sourceIndex, 1);
      elementsDesc.splice(destinationIndex, 0, moved);
      // Reassign normalized ascending z-indices
      const total = elementsDesc.length;
      elementsDesc.forEach((el, index) => {
        const realEl = state.document.elements.find(e => e.id === el.id);
        if (realEl) {
          realEl.zIndex = total - index;
        }
      });
      state.document.elements.sort((a, b) => a.zIndex - b.zIndex);
    }),

    toggleLock: (id) => set((state) => {
      get().commitHistory();
      const el = state.document.elements.find(e => e.id === id);
      if (el) {
        el.locked = !el.locked;
        if (el.locked) {
          state.selectedIds = state.selectedIds.filter(selectedId => selectedId !== id);
        }
      }
    }),

    toggleVisibility: (id) => set((state) => {
      get().commitHistory();
      const el = state.document.elements.find(e => e.id === id);
      if (el) {
        el.visible = !el.visible;
      }
    }),

    renameElement: (id, name) => set((state) => {
      const el = state.document.elements.find(e => e.id === id);
      if (el) {
        el.name = name;
      }
    }),
  }))
);

// Auto-save debounce to IndexedDB
if (typeof window !== "undefined") {
  let saveTimer: any = null;
  useCanvasStore.subscribe((state) => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        const { saveActiveDocument, saveProject } = await import("@/lib/storage/db");
        await saveActiveDocument(state.document);
        if (state.document.id && state.document.id !== 'active_document') {
          await saveProject(state.document);
        }
      } catch (err) {
        console.warn("Auto-save to IndexedDB skipped:", err);
      }
    }, 300);
  });
}

