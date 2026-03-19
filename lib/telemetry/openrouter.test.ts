import { describe, expect, it } from "vitest";
import {
  recordOpenRouterCall,
  type OpenRouterTelemetryDependencies,
} from "@/lib/telemetry/openrouter";

class FakeSpan {
  public attributes: Record<string, string> = {};
  public exceptions: unknown[] = [];
  public status:
    | {
        code: number;
        message?: string;
      }
    | undefined;
  public ended = false;

  setAttributes(attributes: Record<string, string>) {
    this.attributes = {
      ...this.attributes,
      ...attributes,
    };
  }

  recordException(error: unknown) {
    this.exceptions.push(error);
  }

  setStatus(status: { code: number; message?: string }) {
    this.status = status;
  }

  end() {
    this.ended = true;
  }
}

function createDependencies(nowValues: number[]): {
  calls: Array<{ value: number; attributes: Record<string, string> }>;
  durations: Array<{ value: number; attributes: Record<string, string> }>;
  spans: FakeSpan[];
  dependencies: OpenRouterTelemetryDependencies;
} {
  const calls: Array<{ value: number; attributes: Record<string, string> }> = [];
  const durations: Array<{ value: number; attributes: Record<string, string> }> =
    [];
  const spans: FakeSpan[] = [];

  return {
    calls,
    durations,
    spans,
    dependencies: {
      now: () => {
        const value = nowValues.shift();

        if (value === undefined) {
          throw new Error("No more fake time values available");
        }

        return value;
      },
      startActiveSpan: async (_name, fn) => {
        const span = new FakeSpan();
        spans.push(span);
        return fn(span);
      },
      incrementCalls: (value, attributes) => {
        calls.push({ value, attributes });
      },
      recordDuration: (value, attributes) => {
        durations.push({ value, attributes });
      },
    },
  };
}

describe("recordOpenRouterCall", () => {
  it("returns the operation result and records success telemetry", async () => {
    const { calls, dependencies, durations, spans } = createDependencies([
      100,
      145,
    ]);

    const result = await recordOpenRouterCall(
      {
        route: "/api/chat",
        model: "google/gemini-2.5-flash-lite",
      },
      async () => "ok",
      dependencies,
    );

    expect(result).toBe("ok");
    expect(spans).toHaveLength(1);
    expect(spans[0].ended).toBe(true);
    expect(spans[0].attributes).toEqual({
      "external.api.model": "google/gemini-2.5-flash-lite",
      "external.api.outcome": "success",
      "external.api.provider": "openrouter",
      "http.route": "/api/chat",
    });
    expect(calls).toEqual([
      {
        value: 1,
        attributes: {
          model: "google/gemini-2.5-flash-lite",
          outcome: "success",
          provider: "openrouter",
          route: "/api/chat",
        },
      },
    ]);
    expect(durations).toEqual([
      {
        value: 45,
        attributes: {
          model: "google/gemini-2.5-flash-lite",
          outcome: "success",
          provider: "openrouter",
          route: "/api/chat",
        },
      },
    ]);
  });

  it("records failed calls and rethrows the original error", async () => {
    const { calls, dependencies, durations, spans } = createDependencies([
      10,
      40,
    ]);
    const error = new Error("provider exploded");

    await expect(
      recordOpenRouterCall(
        {
          route: "/api/chat/post",
          model: "google/gemini-2.5-flash-lite",
          provider: "openrouter",
        },
        async () => {
          throw error;
        },
        dependencies,
      ),
    ).rejects.toThrow("provider exploded");

    expect(spans).toHaveLength(1);
    expect(spans[0].exceptions).toEqual([
      expect.objectContaining({
        message: "provider exploded",
        name: "Error",
      }),
    ]);
    expect(spans[0].attributes).toEqual({
      "external.api.model": "google/gemini-2.5-flash-lite",
      "external.api.outcome": "error",
      "external.api.provider": "openrouter",
      "http.route": "/api/chat/post",
    });
    expect(calls).toEqual([
      {
        value: 1,
        attributes: {
          model: "google/gemini-2.5-flash-lite",
          outcome: "error",
          provider: "openrouter",
          route: "/api/chat/post",
        },
      },
    ]);
    expect(durations).toEqual([
      {
        value: 30,
        attributes: {
          model: "google/gemini-2.5-flash-lite",
          outcome: "error",
          provider: "openrouter",
          route: "/api/chat/post",
        },
      },
    ]);
  });

  it("only records low-cardinality attributes", async () => {
    const { calls, dependencies, spans } = createDependencies([0, 5]);

    await recordOpenRouterCall(
      {
        route: "/api/chat",
        model: "google/gemini-2.5-flash-lite",
      },
      async () => "ok",
      dependencies,
    );

    expect(Object.keys(calls[0].attributes).sort()).toEqual([
      "model",
      "outcome",
      "provider",
      "route",
    ]);
    expect(Object.keys(spans[0].attributes).sort()).toEqual([
      "external.api.model",
      "external.api.outcome",
      "external.api.provider",
      "http.route",
    ]);
  });
});
