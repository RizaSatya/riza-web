import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { buildSystemPrompt } from "@/lib/context";
import { recordOpenRouterCall } from "@/lib/telemetry/openrouter";

export const runtime = "nodejs";
const model = "google/gemini-2.5-flash-lite";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await recordOpenRouterCall(
    {
      model,
      route: "/api/chat",
    },
    async () =>
      streamText({
        model: openrouter(model),
        // model: openrouter("qwen/qwen3.5-flash-02-23"),
        system: buildSystemPrompt(),
        messages,
        maxOutputTokens: 1024,
      }),
  );

  return result.toTextStreamResponse();
}
