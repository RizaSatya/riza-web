# OpenTelemetry Instrumentation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add self-hosted OpenTelemetry instrumentation with `@vercel/otel`, plus custom OpenRouter success/error and duration metrics for the chat API routes.

**Architecture:** Initialize framework telemetry from a root `instrumentation.ts` file and keep OTLP exporter details fully environment-driven. Add a focused server-side helper in `lib/telemetry/` that owns OpenRouter metric/span recording so both API routes share the same low-cardinality instrumentation behavior.

**Tech Stack:** Next.js 16 App Router, TypeScript, `@vercel/otel`, `@opentelemetry/api`, Vitest

---

## Chunk 1: Test Harness And Telemetry Helper

### Task 1: Add A Minimal Test Harness

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Write the failing test harness expectation**

Run: `npm test`
Expected: FAIL with `Missing script: "test"`.

- [ ] **Step 2: Add the minimal test harness**

Update `package.json` scripts to include:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Add dev dependencies:

```json
"vitest": "^3.2.4"
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`
Expected: `vitest` is added to `package-lock.json`.

- [ ] **Step 4: Run test to verify the harness is live**

Run: `npm test`
Expected: PASS with `No test files found`, or FAIL only because the next task's real tests are not added yet.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "test: add vitest harness for telemetry"
```

### Task 2: Add Telemetry Helper Tests

**Files:**
- Create: `lib/telemetry/openrouter.test.ts`
- Test: `lib/telemetry/openrouter.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/telemetry/openrouter.test.ts` with focused tests for:
- recording a successful call with `outcome=success`
- recording a failed call with `outcome=error`
- measuring duration in milliseconds
- avoiding high-cardinality/sensitive attributes

Use a fake tracer, fake meter, and a callback-based API such as:

```ts
await recordOpenRouterCall(
  {
    route: "/api/chat",
    model: "google/gemini-2.5-flash-lite",
  },
  async () => "ok",
);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/telemetry/openrouter.test.ts`
Expected: FAIL because `lib/telemetry/openrouter.ts` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `lib/telemetry/openrouter.ts` with:
- a server-only module boundary
- a `recordOpenRouterCall` helper that:
  - starts a child span
  - records `provider`, `route`, `model`, `outcome`
  - increments `external_api.calls`
  - records `external_api.duration`
  - rethrows errors after recording failure telemetry
- low-cardinality attribute normalization

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/telemetry/openrouter.test.ts`
Expected: PASS

- [ ] **Step 5: Refactor**

Keep the helper API small and reusable by both chat routes. Do not add stream-completion semantics in this iteration.

- [ ] **Step 6: Commit**

```bash
git add lib/telemetry/openrouter.ts lib/telemetry/openrouter.test.ts
git commit -m "feat: add openrouter telemetry helper"
```

## Chunk 2: Framework Wiring, Route Integration, And Docs

### Task 3: Add Framework OpenTelemetry Wiring

**Files:**
- Create: `instrumentation.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Test: `lib/telemetry/openrouter.test.ts`

- [ ] **Step 1: Write the failing test or check**

Run: `node -e "require('./instrumentation.ts')"`
Expected: FAIL because `instrumentation.ts` does not exist.

- [ ] **Step 2: Write minimal implementation**

Add dependencies:

```json
"@opentelemetry/api": "^1.9.0",
"@vercel/otel": "^1.11.0"
```

Create `instrumentation.ts`:

```ts
import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME ?? "web-riza",
  });
}
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`
Expected: lockfile updated with `@vercel/otel` and `@opentelemetry/api`.

- [ ] **Step 4: Run tests to verify no regression**

Run: `npm test -- lib/telemetry/openrouter.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add instrumentation.ts package.json package-lock.json
git commit -m "feat: add next opentelemetry registration"
```

### Task 4: Instrument The Chat Routes

**Files:**
- Modify: `app/api/chat/route.ts`
- Modify: `app/api/chat/post/route.ts`
- Test: `lib/telemetry/openrouter.test.ts`

- [ ] **Step 1: Write the failing test**

Extend `lib/telemetry/openrouter.test.ts` or add a narrow route-facing test that proves the helper can wrap an async OpenRouter call and preserve the original return value/error.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/telemetry/openrouter.test.ts`
Expected: FAIL for the new route integration behavior.

- [ ] **Step 3: Write minimal implementation**

Update both chat routes to wrap `streamText(...)` in `recordOpenRouterCall(...)` using:
- `route: "/api/chat"` or `"/api/chat/post"`
- `model: "google/gemini-2.5-flash-lite"`
- `provider: "openrouter"`

Keep the existing request/response behavior unchanged.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/telemetry/openrouter.test.ts`
Expected: PASS

- [ ] **Step 5: Refactor**

If the route code repeats model or provider setup in a brittle way, extract a tiny constant in the helper or route module without broad restructuring.

- [ ] **Step 6: Commit**

```bash
git add app/api/chat/route.ts app/api/chat/post/route.ts lib/telemetry/openrouter.ts lib/telemetry/openrouter.test.ts
git commit -m "feat: instrument openrouter chat routes"
```

### Task 5: Document Runtime Configuration And Verify

**Files:**
- Modify: `README.md`
- Test: `lib/telemetry/openrouter.test.ts`

- [ ] **Step 1: Write the failing check**

Run: `rg -n "OTEL_EXPORTER_OTLP_PROTOCOL|OTEL_EXPORTER_OTLP_TRACES_ENDPOINT|OTEL_EXPORTER_OTLP_METRICS_ENDPOINT" README.md`
Expected: FAIL because the README does not document these variables yet.

- [ ] **Step 2: Write minimal implementation**

Update `README.md` with:
- the required OTLP HTTP environment variables
- an example collector service URL on port `4318`
- a short validation flow for traces and custom OpenRouter metrics

- [ ] **Step 3: Run verification commands**

Run: `rg -n "OTEL_EXPORTER_OTLP_PROTOCOL|OTEL_EXPORTER_OTLP_TRACES_ENDPOINT|OTEL_EXPORTER_OTLP_METRICS_ENDPOINT" README.md`
Expected: PASS with all three variables present.

Run: `npm test -- lib/telemetry/openrouter.test.ts`
Expected: PASS

Run: `npm run build`
Expected: PASS in a network-enabled environment. In the Codex sandbox, document if the build is blocked by Google Fonts fetches.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add opentelemetry runtime configuration"
```

## Final Verification Checklist

- [ ] `npm test -- lib/telemetry/openrouter.test.ts`
- [ ] `npm run build`
- [ ] Confirm `instrumentation.ts` exists at the repo root
- [ ] Confirm `README.md` documents OTLP HTTP traces and metrics endpoints
- [ ] Confirm both chat routes call the shared telemetry helper

## Notes

- The current repo has no test harness, so the first red state is the missing `npm test` script.
- The current sandbox cannot fetch Google Fonts during `next build`, so build verification may require an escalated or network-enabled run for final proof.
- Do not add prompt content, user messages, or other sensitive payloads to span attributes or metric labels.
