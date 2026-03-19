# OpenTelemetry Instrumentation Design

Date: 2026-03-19
Status: Approved in conversation, written for implementation

## Summary

Instrument the Next.js application with OpenTelemetry using `@vercel/otel` so the self-hosted container exports traces and metrics over OTLP HTTP to the shared in-cluster OpenTelemetry Collector.

The base integration should cover framework-level server tracing and add app-specific telemetry for OpenRouter calls in the chat API routes, including a success/error metric and request duration metric.

## Goals

- Add OpenTelemetry instrumentation that works in the existing standalone Docker deployment.
- Export traces and metrics over OTLP HTTP to the in-cluster collector on port `4318`.
- Keep collector configuration environment-driven instead of hardcoding deployment details in the app.
- Add custom OpenRouter telemetry that can support a success-rate SLI.
- Preserve normal request behavior if telemetry export is unavailable.

## Non-Goals

- No client-side OpenTelemetry SDK in this iteration.
- No collector manifests or Kubernetes deployment changes in this repository.
- No prompt or message body logging in traces or metrics.
- No full collector integration tests inside the app test suite.

## Recommended Approach

Use a root-level `instrumentation.ts` file that initializes `@vercel/otel` with a stable service name for the application.

Export behavior should be configured through standard `OTEL_*` environment variables in the container runtime so the same app image can be reused across environments.

For application-specific telemetry, add a small server-only helper that owns custom spans and metrics for outbound OpenRouter requests made by the existing chat API routes.

## Architecture

### Framework instrumentation

- Add `instrumentation.ts` at the repository root.
- Call `registerOTel({ serviceName: "web-riza" })`.
- Rely on Next.js and `@vercel/otel` for framework-level server spans.

### Application instrumentation

- Add a helper module under `lib/telemetry/` to centralize custom instrumentation logic.
- Wrap the OpenRouter `streamText` call in each chat route with a child span.
- Record attributes such as provider, model, route, and outcome.

### Deployment configuration

- Keep OTLP endpoint and protocol settings in environment variables.
- Target the shared in-cluster collector on port `4318`.
- Support metrics export to the collector's OTLP HTTP metrics path.

## Runtime Configuration

The application should document and rely on environment variables for export behavior rather than embedding collector details in code.

Expected configuration:

- `OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf`
- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://<collector-service>:4318/v1/traces`
- `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://<collector-service>:4318/v1/metrics`

Optional configuration:

- `OTEL_SERVICE_NAME=web-riza` when deployment wants to override the default code-level service name

## Telemetry Model

### Traces

- Use the framework span created for the incoming request as the parent span.
- Create a child span around the outbound OpenRouter operation.
- Mark the child span as errored when the OpenRouter call fails.

### Metrics

Add application metrics that are not guaranteed by default framework instrumentation:

- `external_api.calls`
  - Counter
  - Attributes: `provider`, `route`, `model`, `outcome`
- `external_api.duration`
  - Histogram
  - Attributes: `provider`, `route`, `model`, `outcome`

This allows the observability backend to derive OpenRouter success rate from `outcome=success|error` rather than depending on generic HTTP spans alone.

Attribute values should stay low-cardinality and must not include request payloads, prompts, or user identifiers.

## Success Semantics

Because the chat routes use `streamText(...)`, the design must define what a successful external call means.

For this iteration:

- Count `outcome=success` when the OpenRouter request is accepted and the stream response is created successfully.
- Count `outcome=error` when `streamText(...)` throws or the route cannot create the response stream.
- Treat the duration metric as time-to-stream-start for the OpenRouter request, not full end-to-end client streaming time.

This keeps the first implementation simple and avoids coupling the metric to downstream client disconnect behavior. If full stream completion metrics are needed later, add separate stream lifecycle instrumentation instead of overloading the initial success-rate metric.

## Data Flow

1. A request enters `/api/chat` or `/api/chat/post`.
2. Next.js creates the server request span.
3. Route code starts a child span for the OpenRouter operation.
4. The route calls `streamText(...)`.
5. The helper records counter and duration measurements with success or error attributes.
6. The SDK exports traces and metrics over OTLP HTTP to the in-cluster collector.

## Error Handling

- Telemetry failures must not fail the request path.
- OpenRouter failures should be reflected in both span status and the `outcome=error` metric series.
- Telemetry attributes must not include prompt content, message content, or other sensitive request payloads.
- Mid-stream response failures are out of scope for the first success-rate metric unless they prevent the response stream from being created.

## Required Repository Changes

- Add `@vercel/otel` as a dependency.
- Add a root `instrumentation.ts` file.
- Add a telemetry helper module under `lib/telemetry/`.
- Update `app/api/chat/route.ts` to emit custom OpenRouter telemetry.
- Update `app/api/chat/post/route.ts` to emit custom OpenRouter telemetry.
- Update `README.md` with required OpenTelemetry environment variables and a short validation workflow.

## Verification

- Add focused tests for the telemetry helper behavior.
- Run the relevant test command first to establish a failing baseline before implementation.
- Run the test command again after implementation to confirm green behavior.
- Run `npm run build` to verify the standalone production build still succeeds with the new instrumentation file.
- Validate in a running environment by sending requests to the chat routes and confirming both traces and the custom OpenRouter metrics arrive in the collector.

## References

- Next.js OpenTelemetry guide
- Vercel tracing and instrumentation documentation
- OpenTelemetry JavaScript exporter documentation
