import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { buildSystemPrompt } from "@/lib/context";

export const runtime = "nodejs";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openrouter("google/gemini-2.5-flash-lite"),
    // model: openrouter("qwen/qwen3.5-flash-02-23"),
    system: buildSystemPrompt(),
    messages,
    maxOutputTokens: 1024,
  });

  return result.toTextStreamResponse();
}
