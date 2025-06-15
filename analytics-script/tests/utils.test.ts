import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  patternToRegex,
  findMatchingPattern,
  debounce,
  isOutboundLink,
  safeJsonParse,
  safeLocalStorageGet,
  safeLocalStorageSet,
  safeLocalStorageRemove,
  collectCustomEventProperties,
} from "../src/utils.js";

describe("patternToRegex", () => {
  it("should convert simple wildcard patterns", () => {
    const regex = patternToRegex("/api/*");
    expect(regex.test("/api/users")).toBe(true);
    expect(regex.test("/api/posts")).toBe(true);
    expect(regex.test("/api/users/123")).toBe(false);
    expect(regex.test("/other/users")).toBe(false);
  });

  it("should convert double wildcard patterns", () => {
    const regex = patternToRegex("/api/**");
    expect(regex.test("/api/users")).toBe(true);
    expect(regex.test("/api/users/123")).toBe(true);
    expect(regex.test("/api/users/123/posts")).toBe(true);
    expect(regex.test("/other/users")).toBe(false);
  });

  it("should escape special regex characters", () => {
    const regex = patternToRegex("/api/v1.0/users");
    expect(regex.test("/api/v1.0/users")).toBe(true);
    expect(regex.test("/api/v1x0/users")).toBe(false);
  });

  it("should handle mixed patterns", () => {
    const regex = patternToRegex("/api/*/users/**");
    expect(regex.test("/api/v1/users")).toBe(true);
    expect(regex.test("/api/v1/users/123")).toBe(true);
    expect(regex.test("/api/v1/users/123/posts")).toBe(true);
    expect(regex.test("/api/v1/v2/users")).toBe(false);
  });
});

describe("findMatchingPattern", () => {
  const patterns = ["/admin/*", "/api/**", "/private"];

  it("should find matching pattern", () => {
    expect(findMatchingPattern("/admin/users", patterns)).toBe("/admin/*");
    expect(findMatchingPattern("/api/v1/users", patterns)).toBe("/api/**");
    expect(findMatchingPattern("/private", patterns)).toBe("/private");
  });

  it("should return null for non-matching paths", () => {
    expect(findMatchingPattern("/public/page", patterns)).toBe(null);
    expect(findMatchingPattern("/home", patterns)).toBe(null);
  });

  it("should handle empty patterns array", () => {
    expect(findMatchingPattern("/any/path", [])).toBe(null);
  });

  it("should handle invalid patterns gracefully", () => {
    const invalidPatterns = ["[invalid", "/valid/*"];
    // Should still match valid patterns despite invalid ones
    expect(findMatchingPattern("/valid/path", invalidPatterns)).toBe(
      "/valid/*"
    );
  });
});

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should debounce function calls", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn("arg1");
    debouncedFn("arg2");
    debouncedFn("arg3");

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("arg3");
  });

  it("should reset timer on subsequent calls", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn("arg1");
    vi.advanceTimersByTime(50);
    debouncedFn("arg2");
    vi.advanceTimersByTime(50);

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("arg2");
  });
});

describe("isOutboundLink", () => {
  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        hostname: "example.com",
      },
      writable: true,
    });
  });

  it("should identify outbound links", () => {
    expect(isOutboundLink("https://external.com/page")).toBe(true);
    expect(isOutboundLink("http://other-site.org")).toBe(true);
  });

  it("should identify internal links", () => {
    expect(isOutboundLink("https://example.com/page")).toBe(false);
    expect(isOutboundLink("/relative/path")).toBe(false);
    expect(isOutboundLink("#anchor")).toBe(false);
  });

  it("should handle invalid URLs gracefully", () => {
    expect(isOutboundLink("not-a-url")).toBe(false);
    expect(isOutboundLink("")).toBe(false);
  });
});

describe("safeJsonParse", () => {
  it("should parse valid JSON", () => {
    const result = safeJsonParse('["item1", "item2"]', []);
    expect(result).toEqual(["item1", "item2"]);
  });

  it("should return fallback for invalid JSON", () => {
    const fallback = ["default"];
    const result = safeJsonParse("invalid json", fallback);
    expect(result).toBe(fallback);
  });

  it("should return fallback for null input", () => {
    const fallback = ["default"];
    const result = safeJsonParse(null, fallback);
    expect(result).toBe(fallback);
  });

  it("should validate array type", () => {
    const fallback: string[] = [];
    const result = safeJsonParse('{"key": "value"}', fallback);
    expect(result).toBe(fallback); // Should return fallback since parsed is not array
  });
});

describe("localStorage utilities", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("safeLocalStorageGet", () => {
    it("should get value from localStorage", () => {
      localStorage.setItem("test-key", "test-value");
      expect(safeLocalStorageGet("test-key")).toBe("test-value");
    });

    it("should return null for non-existent key", () => {
      expect(safeLocalStorageGet("non-existent")).toBe(null);
    });

    it("should handle localStorage errors gracefully", () => {
      // Mock localStorage to throw error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error("localStorage error");
      });

      expect(safeLocalStorageGet("test-key")).toBe(null);

      // Restore original method
      localStorage.getItem = originalGetItem;
    });
  });

  describe("safeLocalStorageSet", () => {
    it("should set value in localStorage", () => {
      safeLocalStorageSet("test-key", "test-value");
      expect(localStorage.getItem("test-key")).toBe("test-value");
    });

    it("should handle localStorage errors gracefully", () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error("localStorage error");
      });

      expect(() => safeLocalStorageSet("test-key", "test-value")).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Could not persist to localStorage:",
        expect.any(Error)
      );

      // Restore original method
      localStorage.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe("safeLocalStorageRemove", () => {
    it("should remove value from localStorage", () => {
      localStorage.setItem("test-key", "test-value");
      safeLocalStorageRemove("test-key");
      expect(localStorage.getItem("test-key")).toBe(null);
    });

    it("should handle localStorage errors gracefully", () => {
      // Mock localStorage to throw error
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn().mockImplementation(() => {
        throw new Error("localStorage error");
      });

      expect(() => safeLocalStorageRemove("test-key")).not.toThrow();

      // Restore original method
      localStorage.removeItem = originalRemoveItem;
    });
  });
});

describe("collectCustomEventProperties", () => {
  it("should collect properties from data attributes", () => {
    // Create a mock element with data attributes
    const element = document.createElement("div");
    element.setAttribute("data-rybbit-prop-category", "button");
    element.setAttribute("data-rybbit-prop-action", "click");
    element.setAttribute("data-rybbit-prop-value", "123");
    element.setAttribute("data-other-attr", "ignored");

    const properties = collectCustomEventProperties(element);

    expect(properties).toEqual({
      category: "button",
      action: "click",
      value: "123",
    });
  });

  it("should return empty object for element without properties", () => {
    const element = document.createElement("div");
    element.setAttribute("data-other-attr", "ignored");

    const properties = collectCustomEventProperties(element);

    expect(properties).toEqual({});
  });

  it("should handle element with no attributes", () => {
    const element = document.createElement("div");

    const properties = collectCustomEventProperties(element);

    expect(properties).toEqual({});
  });
});
