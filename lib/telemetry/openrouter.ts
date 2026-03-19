import type { Attributes, Exception, SpanStatus } from "@opentelemetry/api";
import { metrics, SpanStatusCode, trace } from "@opentelemetry/api";

type OpenRouterOutcome = "error" | "success";

type OpenRouterMetricAttributes = {
  model: string;
  outcome: OpenRouterOutcome;
  provider: string;
  route: string;
};

export type OpenRouterTelemetryDependencies = {
  now?: () => number;
  startActiveSpan?: <T>(
    name: string,
    fn: (span: OpenRouterSpanLike) => Promise<T>,
  ) => Promise<T>;
  incrementCalls?: (
    value: number,
    attributes: OpenRouterMetricAttributes,
  ) => void;
  recordDuration?: (
    value: number,
    attributes: OpenRouterMetricAttributes,
  ) => void;
};

type OpenRouterSpanLike = {
  end: () => void;
  recordException: (error: Exception) => void;
  setAttributes: (attributes: Attributes) => void;
  setStatus: (status: SpanStatus) => void;
};

const tracer = trace.getTracer("web-riza.telemetry");
const meter = metrics.getMeter("web-riza.telemetry");
const callsCounter = meter.createCounter("external_api.calls", {
  description: "Counts external API calls by provider, route, model, and outcome.",
});
const durationHistogram = meter.createHistogram("external_api.duration", {
  description:
    "Records time-to-stream-start for external API calls in milliseconds.",
  unit: "ms",
});

const defaultDependencies: Required<OpenRouterTelemetryDependencies> = {
  now: () => Date.now(),
  startActiveSpan: async (name, fn) =>
    tracer.startActiveSpan(name, async (span) => fn(span)),
  incrementCalls: (value, attributes) => {
    callsCounter.add(value, attributes);
  },
  recordDuration: (value, attributes) => {
    durationHistogram.record(value, attributes);
  },
};

export async function recordOpenRouterCall<T>(
  {
    model,
    provider = "openrouter",
    route,
  }: {
    model: string;
    provider?: string;
    route: string;
  },
  operation: () => Promise<T>,
  dependencies: OpenRouterTelemetryDependencies = {},
): Promise<T> {
  const resolvedDependencies = {
    ...defaultDependencies,
    ...dependencies,
  };
  const baseAttributes = {
    model,
    provider,
    route,
  };

  return resolvedDependencies.startActiveSpan("openrouter.request", async (span) => {
    const startedAt = resolvedDependencies.now();
    span.setAttributes({
      "external.api.model": model,
      "external.api.provider": provider,
      "http.route": route,
    });

    try {
      const result = await operation();
      const attributes = buildMetricAttributes(baseAttributes, "success");

      span.setAttributes(buildSpanAttributes(attributes));
      resolvedDependencies.incrementCalls(1, attributes);
      resolvedDependencies.recordDuration(
        resolvedDependencies.now() - startedAt,
        attributes,
      );

      return result;
    } catch (error) {
      const attributes = buildMetricAttributes(baseAttributes, "error");

      span.recordException(toException(error));
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "OpenRouter call failed",
      });
      span.setAttributes(buildSpanAttributes(attributes));
      resolvedDependencies.incrementCalls(1, attributes);
      resolvedDependencies.recordDuration(
        resolvedDependencies.now() - startedAt,
        attributes,
      );

      throw error;
    } finally {
      span.end();
    }
  });
}

function buildMetricAttributes(
  attributes: {
    model: string;
    provider: string;
    route: string;
  },
  outcome: OpenRouterOutcome,
): OpenRouterMetricAttributes {
  return {
    model: attributes.model,
    outcome,
    provider: attributes.provider,
    route: attributes.route,
  };
}

function buildSpanAttributes(attributes: OpenRouterMetricAttributes) {
  return {
    "external.api.model": attributes.model,
    "external.api.outcome": attributes.outcome,
    "external.api.provider": attributes.provider,
    "http.route": attributes.route,
  };
}

function toException(error: unknown): Exception {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  return "OpenRouter call failed";
}
