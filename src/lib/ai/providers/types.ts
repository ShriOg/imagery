import { CanvasDocument } from "@/types/canvas";

export interface AIEditResponse {
  canvas: CanvasDocument;
  summary?: string;
}

export interface AIProvider {
  name: string;
  edit(
    prompt: string,
    currentCanvas: CanvasDocument,
    history: Array<{ role: 'user' | 'assistant', content: string }>
  ): Promise<AIEditResponse>;
}
