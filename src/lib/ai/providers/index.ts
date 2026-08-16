import { AIProvider } from "./types";
import { NIMProvider } from "./nim-provider";

export function getAIProvider(): AIProvider {
  // In the future, we could read process.env.AI_PROVIDER to return different implementations
  return new NIMProvider();
}
