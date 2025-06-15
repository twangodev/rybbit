import type { CustomEventProperties } from "./types.js";

/**
 * Helper function to convert wildcard pattern to regex
 */
export function patternToRegex(pattern: string): RegExp {
  // Use a safer approach by replacing wildcards with unique tokens first
  const DOUBLE_WILDCARD_TOKEN = "__DOUBLE_ASTERISK_TOKEN__";
  const SINGLE_WILDCARD_TOKEN = "__SINGLE_ASTERISK_TOKEN__";

  // Replace wildcards with tokens
  let tokenized = pattern
    .replace(/\*\*/g, DOUBLE_WILDCARD_TOKEN)
    .replace(/\*/g, SINGLE_WILDCARD_TOKEN);

  // Escape special regex characters
  let escaped = tokenized.replace(/[.+?^${}()|[\]\\]/g, "\\$&");

  // Escape forward slashes
  escaped = escaped.replace(/\//g, "\\/");

  // Replace tokens with appropriate regex patterns
  let regexPattern = escaped
    .replace(new RegExp(DOUBLE_WILDCARD_TOKEN, "g"), ".*")
    .replace(new RegExp(SINGLE_WILDCARD_TOKEN, "g"), "[^/]+");

  return new RegExp("^" + regexPattern + "$");
}

/**
 * Find matching pattern in array of patterns
 */
export function findMatchingPattern(
  path: string,
  patterns: string[]
): string | null {
  for (const pattern of patterns) {
    try {
      const regex = patternToRegex(pattern);
      if (regex.test(path)) {
        return pattern; // Return the pattern string itself
      }
    } catch (e) {
      console.error(`Invalid pattern: ${pattern}`, e);
    }
  }
  return null;
}

/**
 * Debounce function to limit function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if a URL is an outbound link
 */
export function isOutboundLink(url: string): boolean {
  try {
    const currentHost = window.location.hostname;
    const linkHost = new URL(url).hostname;
    return linkHost !== currentHost && linkHost !== "";
  } catch (e) {
    return false;
  }
}

/**
 * Parse JSON safely with fallback
 */
export function safeJsonParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;

  try {
    const parsed = JSON.parse(jsonString);
    // Only return parsed if it matches the expected type structure
    if (Array.isArray(fallback) && Array.isArray(parsed)) {
      return parsed as T;
    }
    return fallback;
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return fallback;
  }
}

/**
 * Get attribute value with fallback
 */
export function getAttributeValue(
  element: Element | null,
  ...attributeNames: string[]
): string | null {
  if (!element) return null;

  for (const attrName of attributeNames) {
    const value = element.getAttribute(attrName);
    if (value !== null) return value;
  }

  return null;
}

/**
 * Collect custom event properties from data attributes
 */
export function collectCustomProperties(
  element: Element
): CustomEventProperties {
  const properties: CustomEventProperties = {};

  for (const attr of element.attributes) {
    if (attr.name.startsWith("data-rybbit-prop-")) {
      const propName = attr.name.replace("data-rybbit-prop-", "");
      properties[propName] = attr.value;
    }
  }

  return properties;
}
/**
 * Alias for collectCustomProperties to match import name
 */
export const collectCustomEventProperties = collectCustomProperties;

/**
 * Safe localStorage operations
 */
export function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

export function safeLocalStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("Could not persist to localStorage:", e);
  }
}

export function safeLocalStorageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // localStorage not available, ignore
  }
}

/**
 * Safe localStorage operations
 */
export const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },

  set(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn(`Could not persist ${key} to localStorage`);
      return false;
    }
  },

  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },
};
