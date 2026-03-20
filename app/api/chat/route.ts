import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { buildSystemPrompt } from "@/lib/context";
import { recordOpenRouterCall } from "@/lib/telemetry/openrouter";
import { recordHttpServerRequest } from "@/lib/telemetry/http";

export const runtime = "nodejs";
const model = "google/gemini-2.5-flash-lite";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  return recordHttpServerRequest(req, { route: "/api/chat" }, async () => {
    const { messages } = await req.json();

    const result = await recordOpenRouterCall(
      {
        model,
        route: "/api/chat",
      },
      async () =>
        streamText({
          model: openrouter(model),
          system: buildSystemPrompt(),
          messages,
          maxOutputTokens: 1024,
        }),
    );

    return result.toTextStreamResponse();
  });
}
