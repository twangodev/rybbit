import { ScriptConfig, WebVitalsData } from "./types.js";

// Declare web-vitals types
declare global {
  interface Window {
    webVitals?: {
      onLCP: (callback: (metric: any) => void) => void;
      onCLS: (callback: (metric: any) => void) => void;
      onINP: (callback: (metric: any) => void) => void;
      onFCP: (callback: (metric: any) => void) => void;
      onTTFB: (callback: (metric: any) => void) => void;
    };
  }
}

interface Metric {
  name: string;
  value: number;
  id: string;
  delta: number;
  entries: any[];
}

export class WebVitalsCollector {
  private data: WebVitalsData = {
    lcp: null,
    cls: null,
    inp: null,
    fcp: null,
    ttfb: null,
  };

  private sent = false;
  private timeout: NodeJS.Timeout | null = null;
  private onReadyCallback: ((data: WebVitalsData) => void) | null = null;
  private initialized = false;
  private config: ScriptConfig;

  constructor(config: ScriptConfig, onReady: (data: WebVitalsData) => void) {
    this.config = config;
    this.onReadyCallback = onReady;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load web-vitals if not already loaded
    if (!window.webVitals) {
      await this.loadWebVitals();
    }

    if (!window.webVitals) {
      console.warn("Failed to load web-vitals, metrics collection disabled");
      return;
    }

    this.initialized = true;

    try {
      // Track Core Web Vitals
      window.webVitals.onLCP(this.collectMetric.bind(this));
      window.webVitals.onCLS(this.collectMetric.bind(this));
      window.webVitals.onINP(this.collectMetric.bind(this));

      // Track additional metrics
      window.webVitals.onFCP(this.collectMetric.bind(this));
      window.webVitals.onTTFB(this.collectMetric.bind(this));

      // Set timeout to send metrics even if not all are collected
      this.timeout = setTimeout(() => {
        if (!this.sent) {
          this.sendData();
        }
      }, 20000);

      // Send on page unload
      window.addEventListener("beforeunload", () => {
        if (!this.sent) {
          this.sendData();
        }
      });
    } catch (e) {
      console.warn("Error initializing web vitals tracking:", e);
    }
  }

  private async loadWebVitals(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      // Load from same origin to avoid CDN blocking
      script.src = `${this.config.analyticsHost}/metrics.js`;
      script.async = false;
      script.onload = () => {
        console.log("[Web Vitals] Library loaded successfully");
        resolve();
      };
      script.onerror = () => {
        console.error("[Web Vitals] Failed to load library");
        resolve(); // Resolve anyway to continue execution
      };
      document.head.appendChild(script);
    });
  }

  private collectMetric(metric: Metric): void {
    if (this.sent) return;

    const metricName = metric.name.toLowerCase() as keyof WebVitalsData;
    this.data[metricName] = metric.value;

    // Check if all metrics are collected
    const allCollected = Object.values(this.data).every(
      (value) => value !== null
    );
    if (allCollected) {
      this.sendData();
    }
  }

  private sendData(): void {
    if (this.sent) return;
    this.sent = true;

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.onReadyCallback) {
      this.onReadyCallback(this.data);
    }
  }

  getData(): WebVitalsData {
    return { ...this.data };
  }
}
