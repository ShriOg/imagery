import { useCanvasStore } from "@/lib/store/canvas-store";

export function useAIEdit() {
  const canvas = useCanvasStore((s) => s.canvas);
  const messages = useCanvasStore((s) => s.messages);
  const setAiStatus = useCanvasStore((s) => s.setAiStatus);
  const setAiError = useCanvasStore((s) => s.setAiError);
  const addMessage = useCanvasStore((s) => s.addMessage);
  const updateCanvasFromAI = useCanvasStore((s) => s.updateCanvasFromAI);

  const submitPrompt = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    addMessage({ role: 'user', content: prompt });
    setAiStatus('thinking');
    setAiError(null);

    try {
      const res = await fetch('/api/ai/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          canvas,
          history: messages
        })
      });

      const data = await res.json();
      console.log("[DEBUG 4] Received CanvasState from API. Elements count:", data.canvas?.elements?.length);
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to edit canvas');
      }

      updateCanvasFromAI(data.canvas);
      
      addMessage({ role: 'assistant', content: data.summary || 'Canvas updated successfully ✨' });
      setAiStatus('idle');

    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'An unknown error occurred');
      setAiStatus('error');
    }
  };

  return { submitPrompt };
}
