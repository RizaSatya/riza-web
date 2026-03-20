import { metrics } from "@opentelemetry/api";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";

let started = false;

export function registerMetrics() {
  if (started) return;
  started = true;

  const exporter = new OTLPMetricExporter();
  const reader = new PeriodicExportingMetricReader({
    exporter,
    exportIntervalMillis: 15000,
  });

  const provider = new MeterProvider({
    resource: resourceFromAttributes({
      "service.name": process.env.OTEL_SERVICE_NAME ?? "web-riza",
    }),
    readers: [reader],
  });

  metrics.setGlobalMeterProvider(provider);
}
