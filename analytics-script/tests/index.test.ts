import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock the modules before importing
vi.mock("../src/webVitals.js", () => ({
  WebVitalsCollector: vi.fn().mockImplementation(() => ({
    init: vi.fn(),
    getData: vi.fn(() => ({
      lcp: null,
      cls: null,
      inp: null,
      fcp: null,
      ttfb: null,
    })),
    isSent: vi.fn(() => false),
    reset: vi.fn(),
  })),
}));

vi.mock("../src/utils.js", () => ({
  patternToRegex: vi.fn(),
  findMatchingPattern: vi.fn(),
  debounce: vi.fn((fn) => fn),
  isOutboundLink: vi.fn(),
  safeJsonParse: vi.fn(),
  safeLocalStorageGet: vi.fn(),
  safeLocalStorageSet: vi.fn(),
  safeLocalStorageRemove: vi.fn(),
  collectCustomEventProperties: vi.fn(() => ({})),
}));

// Mock fetch globally
global.fetch = vi.fn();

describe("Analytics Script Integration", () => {
  let mockScriptTag: HTMLScriptElement;

  beforeEach(() => {
    // Reset DOM
    document.head.innerHTML = "";
    document.body.innerHTML = "";

    // Reset window.rybbit
    delete (window as any).rybbit;
    delete (window as any).__RYBBIT_OPTOUT__;

    // Clear localStorage
    localStorage.clear();

    // Reset all mocks
    vi.clearAllMocks();

    // Create mock script tag
    mockScriptTag = document.createElement("script");
    mockScriptTag.src = "https://analytics.example.com/script.js";
    mockScriptTag.setAttribute("data-site-id", "123");

    // Mock document.currentScript
    Object.defineProperty(document, "currentScript", {
      value: mockScriptTag,
      writable: true,
    });

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        hostname: "example.com",
        pathname: "/test-page",
        search: "?param=value",
        hash: "",
        href: "https://example.com/test-page?param=value",
      },
      writable: true,
    });

    // Mock window dimensions
    Object.defineProperty(window, "innerWidth", {
      value: 1920,
      writable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 1080,
      writable: true,
    });

    // Mock navigator
    Object.defineProperty(navigator, "language", {
      value: "en-US",
      writable: true,
    });

    // Mock document properties
    Object.defineProperty(document, "title", {
      value: "Test Page",
      writable: true,
    });
    Object.defineProperty(document, "referrer", {
      value: "https://referrer.com",
      writable: true,
    });

    // Mock fetch response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Opt-out functionality", () => {
    it("should create no-op API when __RYBBIT_OPTOUT__ is set", async () => {
      (window as any).__RYBBIT_OPTOUT__ = true;

      // Import and execute the script
      await import("../src/index.js");

      expect(window.rybbit).toBeDefined();
      expect(typeof window.rybbit.pageview).toBe("function");
      expect(typeof window.rybbit.event).toBe("function");
      expect(typeof window.rybbit.trackOutbound).toBe("function");
      expect(typeof window.rybbit.identify).toBe("function");
      expect(typeof window.rybbit.clearUserId).toBe("function");
      expect(typeof window.rybbit.getUserId).toBe("function");

      // Should return null for getUserId
      expect(window.rybbit.getUserId()).toBe(null);
    });

    it("should create no-op API when localStorage disable flag is set", async () => {
      const { safeLocalStorageGet } = await import("../src/utils.js");
      (safeLocalStorageGet as any).mockReturnValue("true");

      // Import and execute the script
      await import("../src/index.js");

      expect(window.rybbit).toBeDefined();
      expect(window.rybbit.getUserId()).toBe(null);
    });
  });

  describe("Configuration validation", () => {
    it("should handle missing analytics host", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockScriptTag.src = "/script.js"; // No host

      await import("../src/index.js");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Please provide a valid analytics host"
      );
      consoleSpy.mockRestore();
    });

    it("should handle missing site ID", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockScriptTag.removeAttribute("data-site-id");

      await import("../src/index.js");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Please provide a valid site ID using the data-site-id attribute"
      );
      consoleSpy.mockRestore();
    });

    it("should handle invalid site ID", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockScriptTag.setAttribute("data-site-id", "invalid");

      await import("../src/index.js");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Please provide a valid site ID using the data-site-id attribute"
      );
      consoleSpy.mockRestore();
    });
  });

  describe("Configuration parsing", () => {
    it("should parse configuration from script attributes", async () => {
      mockScriptTag.setAttribute("data-debounce", "1000");
      mockScriptTag.setAttribute("data-auto-track-pageview", "false");
      mockScriptTag.setAttribute("data-track-spa", "false");
      mockScriptTag.setAttribute("data-track-query", "false");
      mockScriptTag.setAttribute("data-track-outbound", "false");

      const { safeJsonParse } = await import("../src/utils.js");
      (safeJsonParse as any).mockReturnValue([]);

      await import("../src/index.js");

      // Verify the script executed without errors
      expect(window.rybbit).toBeDefined();
    });

    it("should parse skip and mask patterns", async () => {
      mockScriptTag.setAttribute("data-skip-patterns", '["admin/*"]');
      mockScriptTag.setAttribute("data-mask-patterns", '["user/*"]');

      const { safeJsonParse } = await import("../src/utils.js");
      (safeJsonParse as any).mockReturnValue(["admin/*"]);

      await import("../src/index.js");

      expect(safeJsonParse).toHaveBeenCalledWith('["admin/*"]', []);
      expect(window.rybbit).toBeDefined();
    });
  });

  describe("API functionality", () => {
    beforeEach(async () => {
      const { findMatchingPattern } = await import("../src/utils.js");
      (findMatchingPattern as any).mockReturnValue(null); // No pattern matches

      await import("../src/index.js");
    });

    it("should expose rybbit API", () => {
      expect(window.rybbit).toBeDefined();
      expect(typeof window.rybbit.pageview).toBe("function");
      expect(typeof window.rybbit.event).toBe("function");
      expect(typeof window.rybbit.trackOutbound).toBe("function");
      expect(typeof window.rybbit.identify).toBe("function");
      expect(typeof window.rybbit.clearUserId).toBe("function");
      expect(typeof window.rybbit.getUserId).toBe("function");
    });

    it("should track pageview", () => {
      window.rybbit.pageview();

      expect(global.fetch).toHaveBeenCalledWith(
        "https://analytics.example.com/track",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          keepalive: true,
        })
      );
    });

    it("should track custom events", () => {
      window.rybbit.event("button_click", { category: "ui", action: "click" });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://analytics.example.com/track",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"type":"custom_event"'),
        })
      );
    });

    it("should track outbound links", () => {
      window.rybbit.trackOutbound(
        "https://external.com",
        "External Link",
        "_blank"
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "https://analytics.example.com/track",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"type":"outbound"'),
        })
      );
    });

    it("should handle user identification", () => {
      const { safeLocalStorageSet } = require("../src/utils.js");

      window.rybbit.identify("user123");

      expect(safeLocalStorageSet).toHaveBeenCalledWith(
        "rybbit-user-id",
        "user123"
      );
      expect(window.rybbit.getUserId()).toBe("user123");
    });

    it("should clear user ID", () => {
      const { safeLocalStorageRemove } = require("../src/utils.js");

      window.rybbit.identify("user123");
      window.rybbit.clearUserId();

      expect(safeLocalStorageRemove).toHaveBeenCalledWith("rybbit-user-id");
      expect(window.rybbit.getUserId()).toBe(null);
    });

    it("should validate user ID input", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      window.rybbit.identify("");
      window.rybbit.identify("   ");

      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith(
        "User ID must be a non-empty string"
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Event handling", () => {
    beforeEach(async () => {
      const {
        findMatchingPattern,
        collectCustomEventProperties,
        isOutboundLink,
      } = await import("../src/utils.js");
      (findMatchingPattern as any).mockReturnValue(null);
      (collectCustomEventProperties as any).mockReturnValue({
        category: "button",
      });
      (isOutboundLink as any).mockReturnValue(true);

      await import("../src/index.js");
    });

    it("should handle custom event clicks", () => {
      const button = document.createElement("button");
      button.setAttribute("data-rybbit-event", "button_click");
      button.setAttribute("data-rybbit-prop-category", "ui");
      document.body.appendChild(button);

      button.click();

      expect(global.fetch).toHaveBeenCalledWith(
        "https://analytics.example.com/track",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"event_name":"button_click"'),
        })
      );
    });

    it("should handle outbound link clicks", () => {
      const link = document.createElement("a");
      link.href = "https://external.com";
      link.textContent = "External Link";
      link.target = "_blank";
      document.body.appendChild(link);

      link.click();

      expect(global.fetch).toHaveBeenCalledWith(
        "https://analytics.example.com/track",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"type":"outbound"'),
        })
      );
    });
  });

  describe("SPA tracking", () => {
    beforeEach(async () => {
      const { findMatchingPattern, debounce } = await import("../src/utils.js");
      (findMatchingPattern as any).mockReturnValue(null);
      (debounce as any).mockImplementation((fn) => fn);

      mockScriptTag.setAttribute("data-track-spa", "true");
      await import("../src/index.js");
    });

    it("should track pushState navigation", () => {
      const initialCallCount = (global.fetch as any).mock.calls.length;

      history.pushState({}, "", "/new-page");

      expect(global.fetch).toHaveBeenCalledTimes(initialCallCount + 1);
    });

    it("should track replaceState navigation", () => {
      const initialCallCount = (global.fetch as any).mock.calls.length;

      history.replaceState({}, "", "/replaced-page");

      expect(global.fetch).toHaveBeenCalledTimes(initialCallCount + 1);
    });

    it("should track popstate events", () => {
      const initialCallCount = (global.fetch as any).mock.calls.length;

      window.dispatchEvent(new PopStateEvent("popstate"));

      expect(global.fetch).toHaveBeenCalledTimes(initialCallCount + 1);
    });

    it("should track hashchange events", () => {
      const initialCallCount = (global.fetch as any).mock.calls.length;

      window.dispatchEvent(new HashChangeEvent("hashchange"));

      expect(global.fetch).toHaveBeenCalledTimes(initialCallCount + 1);
    });
  });

  describe("Web Vitals integration", () => {
    it("should initialize WebVitalsCollector when enabled", async () => {
      const { WebVitalsCollector } = await import("../src/webVitals.js");

      await import("../src/index.js");

      expect(WebVitalsCollector).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("Pattern matching", () => {
    it("should skip tracking when path matches skip pattern", async () => {
      const { findMatchingPattern } = await import("../src/utils.js");
      (findMatchingPattern as any).mockReturnValue("/admin/*");

      await import("../src/index.js");

      window.rybbit.pageview();

      // Should not make fetch call due to skip pattern
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
