import { NextResponse } from "next/server";
import { AIImageModificationSchema } from "@/types/ai-config";
import { CONFIG_SYSTEM_PROMPT } from "@/lib/ai/configPrompt";
import { zodToJsonSchema } from "zod-to-json-schema";

export const maxDuration = 60; // Allow 60s for AI responses

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const NIM_API_KEY = process.env.NEXT_PUBLIC_NIM_API_KEY || process.env.NIM_API_KEY;
    const NIM_BASE_URL = process.env.NEXT_PUBLIC_NIM_BASE_URL || process.env.NIM_BASE_URL || "https://integrate.api.nvidia.com/v1";
    let NIM_MODEL = process.env.NEXT_PUBLIC_NIM_MODEL || process.env.NIM_MODEL;

    if (!NIM_API_KEY) {
      throw new Error("Missing NVIDIA NIM configuration in environment variables");
    }

    if (!NIM_MODEL || NIM_MODEL === "<model selected after benchmark>") {
      NIM_MODEL = "meta/llama-3.1-70b-instruct";
    }

    const schema = zodToJsonSchema(AIImageModificationSchema as any, "image_config");

    const response = await fetch(`${NIM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NIM_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: NIM_MODEL,
        messages: [
          { role: "system", content: CONFIG_SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        response_format: { 
          type: "json_schema", 
          json_schema: {
             name: "image_config",
             schema: schema.definitions ? schema.definitions["image_config"] : schema
          }
        },
        temperature: 0,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`NIM API Error (${response.status}): ${text}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Invalid response from NIM: empty content");
    }

    // Strip markdown ticks in case the model hallucinates them despite instructions
    let cleanContent = content.trim();
    if (cleanContent.startsWith("\`\`\`json")) {
      cleanContent = cleanContent.slice(7);
    }
    if (cleanContent.endsWith("\`\`\`")) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();
    
    const parsed = JSON.parse(cleanContent);
    
    // Validate with Zod before sending back to frontend
    const validation = AIImageModificationSchema.safeParse(parsed);
    if (!validation.success) {
      console.error("Zod Validation Failed", validation.error);
      return NextResponse.json({ error: "AI generated invalid configuration" }, { status: 500 });
    }

    return NextResponse.json({ config: validation.data });
  } catch (error: any) {
    console.error("AI Image Config Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
