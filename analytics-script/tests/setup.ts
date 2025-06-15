// Test setup file for analytics script tests
import { beforeEach } from "vitest";

beforeEach(() => {
  // Reset DOM state
  document.head.innerHTML = "";
  document.body.innerHTML = "";

  // Reset window.rybbit
  delete (window as any).rybbit;
  delete (window as any).__RYBBIT_OPTOUT__;

  // Clear localStorage
  localStorage.clear();

  // Create a mock script tag with required attributes
  const mockScript = document.createElement("script");
  mockScript.setAttribute("src", "https://analytics.example.com/script.js");
  mockScript.setAttribute("data-site-id", "123");
  mockScript.setAttribute("data-auto-track-pageview", "false"); // Prevent auto-tracking in tests
  document.head.appendChild(mockScript);

  // Mock document.currentScript to return our mock script
  Object.defineProperty(document, "currentScript", {
    value: mockScript,
    writable: true,
    configurable: true,
  });

  console.log("Test setup: DOM and globals reset, mock script created");
  console.log("Mock script src:", mockScript.getAttribute("src"));
  console.log("Mock script site-id:", mockScript.getAttribute("data-site-id"));
  console.log("document.currentScript:", document.currentScript);
});
