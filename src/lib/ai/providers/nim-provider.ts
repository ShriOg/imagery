import { CanvasDocument, CanvasDocumentSchema } from "@/types/canvas";
import { AIProvider, AIEditResponse } from "./types";
import { SYSTEM_PROMPT, ASSET_LIBRARY, ALLOWED_FONTS } from "../systemPrompt";
import { zodToJsonSchema } from "zod-to-json-schema";

export class NIMProvider implements AIProvider {
  name = "nvidia-nim";

  private buildUserMessage(prompt: string, canvas: CanvasDocument): string {
    return `Current canvas state:
\`\`\`json
${JSON.stringify(canvas, null, 2)}
\`\`\`

User instruction: "${prompt}"

Return only the complete updated CanvasDocument as JSON matching the provided schema. Do not return markdown, prose, tool calls, or explanations.
Important rules:
- Preserve element IDs for elements you are modifying (do not regenerate IDs)
- Generate new IDs (format: "el_" + 4 random alphanumeric chars) only for new elements
- Remove elements by omitting them from the elements array
- Keep canvas dimensions unchanged unless the user explicitly asks to resize
- Use only these font families: ${ALLOWED_FONTS.join(", ")}
- For images, use only keys from the asset library: ${Object.keys(ASSET_LIBRARY).join(", ")}`;
  }

  async edit(
    prompt: string,
    currentCanvas: CanvasDocument,
    history: Array<{ role: 'user' | 'assistant', content: string }>
  ): Promise<AIEditResponse> {
    const NIM_API_KEY = process.env.NEXT_PUBLIC_NIM_API_KEY || process.env.NIM_API_KEY;
    const NIM_BASE_URL = process.env.NEXT_PUBLIC_NIM_BASE_URL || process.env.NIM_BASE_URL || "https://integrate.api.nvidia.com/v1";
    let NIM_MODEL = process.env.NEXT_PUBLIC_NIM_MODEL || process.env.NIM_MODEL;

    if (!NIM_API_KEY) {
      throw new Error("Missing NVIDIA NIM configuration in environment variables");
    }

    // Default fallback if not set
    if (!NIM_MODEL || NIM_MODEL === "<model selected after benchmark>") {
      NIM_MODEL = "meta/llama-3.1-70b-instruct";
    }

    const schema = zodToJsonSchema(CanvasDocumentSchema, "canvas_document");

    const response = await fetch(`${NIM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NIM_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: NIM_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: this.buildUserMessage(prompt, currentCanvas) }
        ],
        response_format: { 
          type: "json_schema", 
          json_schema: {
             name: "canvas_document",
             schema: schema.definitions ? schema.definitions["canvas_document"] : schema
          }
        },
        temperature: 0,
        max_tokens: 8192
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

    try {
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
      return { canvas: parsed, summary: "Updated canvas" };
    } catch (e) {
      throw new Error("Failed to parse AI response as JSON");
    }
  }
}
