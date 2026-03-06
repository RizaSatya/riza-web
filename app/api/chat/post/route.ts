import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { buildPostSystemPrompt } from "@/lib/context";

export const runtime = "nodejs";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages, postTitle, postContent } = await req.json();

  if (!postTitle || !postContent) {
    return new Response("Missing postTitle or postContent", { status: 400 });
  }

  const result = streamText({
    model: openrouter("google/gemini-2.5-flash-lite"),
    system: buildPostSystemPrompt(postTitle, postContent),
    messages,
    maxOutputTokens: 1024,
  });

  return result.toTextStreamResponse();
}
