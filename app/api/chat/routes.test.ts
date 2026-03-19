import { beforeEach, describe, expect, it, vi } from "vitest";

const mockBuildPostSystemPrompt = vi.fn(() => "post-system");
const mockBuildSystemPrompt = vi.fn(() => "system");
const mockRecordOpenRouterCall = vi.fn(
  async (_attributes: unknown, operation: () => Promise<unknown>) => operation(),
);
const mockStreamText = vi.fn();

vi.mock("@openrouter/ai-sdk-provider", () => ({
  createOpenRouter: () => (model: string) => `model:${model}`,
}));

vi.mock("ai", () => ({
  streamText: (...args: unknown[]) => mockStreamText(...args),
}));

vi.mock("@/lib/context", () => ({
  buildPostSystemPrompt: (...args: unknown[]) => mockBuildPostSystemPrompt(...args),
  buildSystemPrompt: () => mockBuildSystemPrompt(),
}));

vi.mock("@/lib/telemetry/openrouter", () => ({
  recordOpenRouterCall: (...args: Parameters<typeof mockRecordOpenRouterCall>) =>
    mockRecordOpenRouterCall(...args),
}));

describe("chat route telemetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    mockStreamText.mockReturnValue({
      toTextStreamResponse: () => new Response("ok"),
    });
  });

  it("wraps /api/chat OpenRouter calls with telemetry", async () => {
    const { POST } = await import("@/app/api/chat/route");

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ content: "hello", role: "user" }],
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockRecordOpenRouterCall).toHaveBeenCalledTimes(1);
    expect(mockRecordOpenRouterCall).toHaveBeenCalledWith(
      {
        model: "google/gemini-2.5-flash-lite",
        route: "/api/chat",
      },
      expect.any(Function),
    );
  });

  it("wraps /api/chat/post OpenRouter calls with telemetry", async () => {
    const { POST } = await import("@/app/api/chat/post/route");

    const response = await POST(
      new Request("http://localhost/api/chat/post", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ content: "hello", role: "user" }],
          postContent: "post body",
          postTitle: "post title",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockRecordOpenRouterCall).toHaveBeenCalledTimes(1);
    expect(mockRecordOpenRouterCall).toHaveBeenCalledWith(
      {
        model: "google/gemini-2.5-flash-lite",
        route: "/api/chat/post",
      },
      expect.any(Function),
    );
  });

  it("keeps the post route validation before telemetry", async () => {
    const { POST } = await import("@/app/api/chat/post/route");

    const response = await POST(
      new Request("http://localhost/api/chat/post", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ content: "hello", role: "user" }],
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mockRecordOpenRouterCall).not.toHaveBeenCalled();
  });
});
