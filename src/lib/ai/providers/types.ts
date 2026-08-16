import { CanvasState } from "@/lib/types";

export interface AIEditResponse {
  canvas: CanvasState;
  summary?: string;
}

export interface AIProvider {
  name: string;
  edit(
    prompt: string,
    currentCanvas: CanvasState,
    history: Array<{ role: 'user' | 'assistant', content: string }>
  ): Promise<AIEditResponse>;
}
