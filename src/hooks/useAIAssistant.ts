import { useCallback } from "react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";
import { NIMProvider } from "@/lib/ai/providers/nim-provider";
import { CanvasDocumentSchema } from "@/types/canvas";

const nimProvider = new NIMProvider();

export function useAIAssistant() {
  const document = useCanvasStore((s) => s.document);
  const setDocument = useCanvasStore((s) => s.setDocument);
  const setIsGenerating = useToolStore((s) => s.setIsGenerating);
  const setAiPaletteOpen = useToolStore((s) => s.setAiPaletteOpen);

  const executePrompt = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return;
      
      setIsGenerating(true);
      try {
        const response = await nimProvider.edit(prompt, document, []);
        
        // Zod validation
        const validatedDoc = CanvasDocumentSchema.parse(response.canvas);
        
        // Update the Zustand state.
        setDocument(validatedDoc);
        
        // Close palette on success
        setAiPaletteOpen(false);
      } catch (error) {
        console.error("AI Generation failed:", error);
      } finally {
        setIsGenerating(false);
      }
    },
    [document, setDocument, setIsGenerating, setAiPaletteOpen]
  );

  return { executePrompt };
}
