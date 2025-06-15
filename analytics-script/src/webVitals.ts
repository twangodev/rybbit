import { getCLS, getFCP, getINP, getLCP, getTTFB } from "web-vitals";
import type {
  WebVitalsData,
  WebVitalsMetric,
  TrackingPayload,
} from "./types.js";

export class WebVitalsCollector {
  private data: WebVitalsData = {
    lcp: null,
    cls: null,
    inp: null,
    fcp: null,
    ttfb: null,
  };

  private sent = false;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private onSend: (payload: Partial<TrackingPayload>) => void;

  constructor(onSend: (payload: Partial<TrackingPayload>) => void) {
    this.onSend = onSend;
  }

  /**
   * Initialize Web Vitals collection
   */
  public init(): void {
    if (this.sent) return;

    try {
      // Track Core Web Vitals
      getLCP(this.collectMetric.bind(this));
      getCLS(this.collectMetric.bind(this));
      getINP(this.collectMetric.bind(this));

      // Track additional metrics
      getFCP(this.collectMetric.bind(this));
      getTTFB(this.collectMetric.bind(this));

      // Set a timeout to send metrics even if not all are collected
      // This handles cases where some metrics might not fire (e.g., no user interactions for INP)
      this.timeout = setTimeout(() => {
        if (!this.sent) {
          this.sendMetrics();
        }
      }, 20000);

      // Also send on page unload to capture any remaining metrics
      window.addEventListener("beforeunload", () => {
        if (!this.sent) {
          this.sendMetrics();
        }
      });
    } catch (e) {
      console.warn("Error initializing web vitals tracking:", e);
    }
  }

  /**
   * Collect individual metric
   */
  private collectMetric(metric: WebVitalsMetric): void {
    if (this.sent) return;

    const metricName = metric.name.toLowerCase() as keyof WebVitalsData;
    this.data[metricName] = metric.value;

    this.checkAndSendMetrics();
  }

  /**
   * Check if all metrics are collected and send if ready
   */
  private checkAndSendMetrics(): void {
    if (this.sent) return;

    const allMetricsCollected = Object.values(this.data).every(
      (value) => value !== null
    );

    if (allMetricsCollected) {
      this.sendMetrics();
    }
  }

  /**
   * Send web vitals data in a single request
   */
  private sendMetrics(): void {
    if (this.sent) return;
    this.sent = true;

    // Clear timeout if it exists
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    const payload: Partial<TrackingPayload> = {
      type: "performance",
      event_name: "web-vitals",
      // Include all collected metrics
      lcp: this.data.lcp,
      cls: this.data.cls,
      inp: this.data.inp,
      fcp: this.data.fcp,
      ttfb: this.data.ttfb,
    };

    this.onSend(payload);
  }

  /**
   * Get current metrics data (for testing)
   */
  public getData(): WebVitalsData {
    return { ...this.data };
  }

  /**
   * Check if metrics have been sent (for testing)
   */
  public isSent(): boolean {
    return this.sent;
  }

  /**
   * Reset collector state (for testing)
   */
  public reset(): void {
    this.data = {
      lcp: null,
      cls: null,
      inp: null,
      fcp: null,
      ttfb: null,
    };
    this.sent = false;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}
