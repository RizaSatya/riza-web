This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Run In Docker

Build the production image:

```bash
docker build -t web-riza .
```

Run the container on port `3000`:

```bash
docker run --rm -p 3000:3000 web-riza
```

The image uses a multi-stage build and serves the Next.js standalone output with Node 22.

## OpenTelemetry

The app registers server-side OpenTelemetry via `instrumentation.ts` and exports telemetry over OTLP HTTP when the container is started with the appropriate environment variables.

Example runtime configuration for an in-cluster collector on port `4318`:

```bash
OTEL_SERVICE_NAME=web-riza
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://otel-collector.default.svc.cluster.local:4318/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://otel-collector.default.svc.cluster.local:4318/v1/metrics
```

Custom application telemetry is emitted for the OpenRouter-backed chat routes:

- `external_api.calls`
- `external_api.duration`

Both metrics use low-cardinality attributes:

- `provider`
- `route`
- `model`
- `outcome`

### Validate Telemetry

1. Deploy the container with the OTLP HTTP variables above.
2. Send traffic to `/api/chat` or `/api/chat/post`.
3. Confirm request traces arrive in your collector/backend.
4. Confirm `external_api.calls` and `external_api.duration` appear with `provider=openrouter` and route labels for the two chat endpoints.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
