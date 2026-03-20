import { metrics } from "@opentelemetry/api";

type HttpRequestAttributes = {
  "http.request.method": string;
  "http.route": string;
};

type HttpResponseAttributes = HttpRequestAttributes & {
  "http.response.status_code": number;
};

export type HttpTelemetryDependencies = {
  now?: () => number;
  addActiveRequests?: (value: number, attributes: HttpRequestAttributes) => void;
  recordDuration?: (value: number, attributes: HttpResponseAttributes) => void;
};

const meter = metrics.getMeter("web-riza.http");

const activeRequests = meter.createUpDownCounter("http.server.active_requests", {
  description: "Number of in-flight HTTP requests.",
});

const requestDuration = meter.createHistogram("http.server.request.duration", {
  description: "Duration of inbound HTTP requests.",
  unit: "s",
});

const defaultDependencies: Required<HttpTelemetryDependencies> = {
  now: () => performance.now(),
  addActiveRequests: (value, attributes) => {
    activeRequests.add(value, attributes);
  },
  recordDuration: (value, attributes) => {
    requestDuration.record(value, attributes);
  },
};

export async function recordHttpServerRequest(
  request: Request,
  { route }: { route: string },
  handler: () => Promise<Response>,
  dependencies: HttpTelemetryDependencies = {},
): Promise<Response> {
  const resolvedDependencies = {
    ...defaultDependencies,
    ...dependencies,
  };

  const baseAttributes: HttpRequestAttributes = {
    "http.request.method": request.method,
    "http.route": route,
  };

  const startedAt = resolvedDependencies.now();
  resolvedDependencies.addActiveRequests(1, baseAttributes);

  try {
    const response = await handler();

    resolvedDependencies.recordDuration(
      (resolvedDependencies.now() - startedAt) / 1000,
      {
        ...baseAttributes,
        "http.response.status_code": response.status,
      },
    );

    return response;
  } catch (error) {
    resolvedDependencies.recordDuration(
      (resolvedDependencies.now() - startedAt) / 1000,
      {
        ...baseAttributes,
        "http.response.status_code": 500,
      },
    );

    throw error;
  } finally {
    resolvedDependencies.addActiveRequests(-1, baseAttributes);
  }
}
