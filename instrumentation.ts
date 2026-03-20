import { registerOTel } from "@vercel/otel";
import { registerMetrics } from "@/lib/telemetry/metrics";

export function register() {
  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME ?? "web-riza",
  });

  if (process.env.NEXT_RUNTIME === "nodejs") {
    registerMetrics();
  }
}
