import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/providers";
import { validateCanvasState } from "@/lib/validation/canvas-schema";

export const maxDuration = 60; // Allow 60s for AI responses

export async function POST(req: Request) {
  try {
    const { prompt, canvas, history } = await req.json();

    if (!prompt || !canvas || !history) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const provider = getAIProvider();
    const result = await provider.edit(prompt, canvas, history);
    
    const validation = validateCanvasState(result.canvas);
    console.log("[DEBUG 3] Zod validation result success:", validation.success);
    if (!validation.success) {
      console.error("Zod Validation Failed", validation.errors);
      return NextResponse.json({ error: "AI generated invalid canvas state" }, { status: 500 });
    }

    return NextResponse.json({ canvas: validation.data, summary: result.summary });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
