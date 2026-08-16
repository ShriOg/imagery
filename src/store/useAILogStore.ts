import { create } from 'zustand';

export interface AILogEntry {
  id: string;
  timestamp: number;
  prompt: string;
  elementId: string;
  config: any;
}

interface AILogStore {
  logs: AILogEntry[];
  addLog: (entry: Omit<AILogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useAILogStore = create<AILogStore>((set) => ({
  logs: [],
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  addLog: (entry) => set((state) => ({
    logs: [
      {
        ...entry,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      },
      ...state.logs
    ].slice(0, 100) // Keep last 100 logs
  })),
  clearLogs: () => set({ logs: [] })
}));
