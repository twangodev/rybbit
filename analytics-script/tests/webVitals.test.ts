import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WebVitalsCollector } from "../src/webVitals.js";

// Mock web-vitals library
vi.mock("web-vitals", () => ({
  getCLS: vi.fn(),
  getFCP: vi.fn(),
  getINP: vi.fn(),
  getLCP: vi.fn(),
  getTTFB: vi.fn(),
}));

import { getCLS, getFCP, getINP, getLCP, getTTFB } from "web-vitals";

describe("WebVitalsCollector", () => {
  let mockOnSend: ReturnType<typeof vi.fn>;
  let collector: WebVitalsCollector;

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnSend = vi.fn();
    collector = new WebVitalsCollector(mockOnSend);

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    collector.reset();
  });

  describe("init", () => {
    it("should initialize web vitals collection", () => {
      collector.init();

      expect(getLCP).toHaveBeenCalledWith(expect.any(Function));
      expect(getCLS).toHaveBeenCalledWith(expect.any(Function));
      expect(getINP).toHaveBeenCalledWith(expect.any(Function));
      expect(getFCP).toHaveBeenCalledWith(expect.any(Function));
      expect(getTTFB).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should set timeout for sending metrics", () => {
      collector.init();

      expect(vi.getTimerCount()).toBe(1);
    });

    it("should not initialize twice", () => {
      collector.init();
      collector.init();

      // Should only be called once
      expect(getLCP).toHaveBeenCalledTimes(1);
    });

    it("should handle web vitals library errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Mock getLCP to throw error
      (getLCP as any).mockImplementation(() => {
        throw new Error("Web vitals error");
      });

      expect(() => collector.init()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error initializing web vitals tracking:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("metric collection", () => {
    beforeEach(() => {
      collector.init();
    });

    it("should collect individual metrics", () => {
      const mockMetric = {
        name: "LCP",
        value: 1500,
        id: "test-id",
        delta: 1500,
        entries: [],
      };

      // Get the callback function passed to getLCP
      const lcpCallback = (getLCP as any).mock.calls[0][0];
      lcpCallback(mockMetric);

      const data = collector.getData();
      expect(data.lcp).toBe(1500);
    });

    it("should send metrics when all are collected", () => {
      const metrics = [
        { name: "LCP", value: 1500 },
        { name: "CLS", value: 0.1 },
        { name: "INP", value: 100 },
        { name: "FCP", value: 1000 },
        { name: "TTFB", value: 200 },
      ];

      // Simulate collecting all metrics
      const callbacks = [
        (getLCP as any).mock.calls[0][0],
        (getCLS as any).mock.calls[0][0],
        (getINP as any).mock.calls[0][0],
        (getFCP as any).mock.calls[0][0],
        (getTTFB as any).mock.calls[0][0],
      ];

      // Collect first 4 metrics - should not send yet
      for (let i = 0; i < 4; i++) {
        callbacks[i](metrics[i]);
        expect(mockOnSend).not.toHaveBeenCalled();
      }

      // Collect last metric - should trigger send
      callbacks[4](metrics[4]);

      expect(mockOnSend).toHaveBeenCalledTimes(1);
      expect(mockOnSend).toHaveBeenCalledWith({
        type: "performance",
        event_name: "web-vitals",
        lcp: 1500,
        cls: 0.1,
        inp: 100,
        fcp: 1000,
        ttfb: 200,
      });
    });

    it("should not collect metrics after already sent", () => {
      // Manually mark as sent
      const lcpCallback = (getLCP as any).mock.calls[0][0];

      // Collect all metrics to trigger send
      const metrics = [
        { name: "LCP", value: 1500 },
        { name: "CLS", value: 0.1 },
        { name: "INP", value: 100 },
        { name: "FCP", value: 1000 },
        { name: "TTFB", value: 200 },
      ];

      const callbacks = [
        (getLCP as any).mock.calls[0][0],
        (getCLS as any).mock.calls[0][0],
        (getINP as any).mock.calls[0][0],
        (getFCP as any).mock.calls[0][0],
        (getTTFB as any).mock.calls[0][0],
      ];

      // Collect all metrics
      metrics.forEach((metric, i) => callbacks[i](metric));

      expect(mockOnSend).toHaveBeenCalledTimes(1);

      // Try to collect another metric - should be ignored
      lcpCallback({ name: "LCP", value: 2000 });

      expect(mockOnSend).toHaveBeenCalledTimes(1); // Still only called once
      expect(collector.getData().lcp).toBe(1500); // Value unchanged
    });
  });

  describe("timeout behavior", () => {
    beforeEach(() => {
      collector.init();
    });

    it("should send metrics after timeout even if not all collected", () => {
      const lcpCallback = (getLCP as any).mock.calls[0][0];
      lcpCallback({ name: "LCP", value: 1500 });

      // Advance timer to trigger timeout
      vi.advanceTimersByTime(20000);

      expect(mockOnSend).toHaveBeenCalledTimes(1);
      expect(mockOnSend).toHaveBeenCalledWith({
        type: "performance",
        event_name: "web-vitals",
        lcp: 1500,
        cls: null,
        inp: null,
        fcp: null,
        ttfb: null,
      });
    });

    it("should clear timeout when all metrics collected", () => {
      const metrics = [
        { name: "LCP", value: 1500 },
        { name: "CLS", value: 0.1 },
        { name: "INP", value: 100 },
        { name: "FCP", value: 1000 },
        { name: "TTFB", value: 200 },
      ];

      const callbacks = [
        (getLCP as any).mock.calls[0][0],
        (getCLS as any).mock.calls[0][0],
        (getINP as any).mock.calls[0][0],
        (getFCP as any).mock.calls[0][0],
        (getTTFB as any).mock.calls[0][0],
      ];

      // Collect all metrics
      metrics.forEach((metric, i) => callbacks[i](metric));

      expect(mockOnSend).toHaveBeenCalledTimes(1);

      // Advance timer - should not trigger another send
      vi.advanceTimersByTime(20000);

      expect(mockOnSend).toHaveBeenCalledTimes(1); // Still only called once
    });
  });

  describe("beforeunload event", () => {
    beforeEach(() => {
      collector.init();
    });

    it("should send metrics on beforeunload if not already sent", () => {
      const lcpCallback = (getLCP as any).mock.calls[0][0];
      lcpCallback({ name: "LCP", value: 1500 });

      // Simulate beforeunload event
      window.dispatchEvent(new Event("beforeunload"));

      expect(mockOnSend).toHaveBeenCalledTimes(1);
      expect(mockOnSend).toHaveBeenCalledWith({
        type: "performance",
        event_name: "web-vitals",
        lcp: 1500,
        cls: null,
        inp: null,
        fcp: null,
        ttfb: null,
      });
    });

    it("should not send metrics on beforeunload if already sent", () => {
      // Collect all metrics to trigger send
      const metrics = [
        { name: "LCP", value: 1500 },
        { name: "CLS", value: 0.1 },
        { name: "INP", value: 100 },
        { name: "FCP", value: 1000 },
        { name: "TTFB", value: 200 },
      ];

      const callbacks = [
        (getLCP as any).mock.calls[0][0],
        (getCLS as any).mock.calls[0][0],
        (getINP as any).mock.calls[0][0],
        (getFCP as any).mock.calls[0][0],
        (getTTFB as any).mock.calls[0][0],
      ];

      metrics.forEach((metric, i) => callbacks[i](metric));

      expect(mockOnSend).toHaveBeenCalledTimes(1);

      // Simulate beforeunload event
      window.dispatchEvent(new Event("beforeunload"));

      expect(mockOnSend).toHaveBeenCalledTimes(1); // Still only called once
    });
  });

  describe("utility methods", () => {
    it("should return current data", () => {
      const data = collector.getData();
      expect(data).toEqual({
        lcp: null,
        cls: null,
        inp: null,
        fcp: null,
        ttfb: null,
      });
    });

    it("should return sent status", () => {
      expect(collector.isSent()).toBe(false);

      collector.init();

      // Collect all metrics to trigger send
      const metrics = [
        { name: "LCP", value: 1500 },
        { name: "CLS", value: 0.1 },
        { name: "INP", value: 100 },
        { name: "FCP", value: 1000 },
        { name: "TTFB", value: 200 },
      ];

      const callbacks = [
        (getLCP as any).mock.calls[0][0],
        (getCLS as any).mock.calls[0][0],
        (getINP as any).mock.calls[0][0],
        (getFCP as any).mock.calls[0][0],
        (getTTFB as any).mock.calls[0][0],
      ];

      metrics.forEach((metric, i) => callbacks[i](metric));

      expect(collector.isSent()).toBe(true);
    });

    it("should reset collector state", () => {
      collector.init();

      const lcpCallback = (getLCP as any).mock.calls[0][0];
      lcpCallback({ name: "LCP", value: 1500 });

      collector.reset();

      expect(collector.getData()).toEqual({
        lcp: null,
        cls: null,
        inp: null,
        fcp: null,
        ttfb: null,
      });
      expect(collector.isSent()).toBe(false);
    });
  });
});
