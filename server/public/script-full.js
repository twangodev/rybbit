"use strict";
(() => {
  // utils.ts
  function patternToRegex(pattern) {
    const DOUBLE_WILDCARD_TOKEN = "__DOUBLE_ASTERISK_TOKEN__";
    const SINGLE_WILDCARD_TOKEN = "__SINGLE_ASTERISK_TOKEN__";
    let tokenized = pattern.replace(/\*\*/g, DOUBLE_WILDCARD_TOKEN).replace(/\*/g, SINGLE_WILDCARD_TOKEN);
    let escaped = tokenized.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    escaped = escaped.replace(new RegExp(`/${DOUBLE_WILDCARD_TOKEN}/`, "g"), "/(?:.+/)?");
    escaped = escaped.replace(new RegExp(DOUBLE_WILDCARD_TOKEN, "g"), ".*");
    escaped = escaped.replace(/\//g, "\\/");
    let regexPattern = escaped.replace(new RegExp(SINGLE_WILDCARD_TOKEN, "g"), "[^/]+");
    return new RegExp("^" + regexPattern + "$");
  }
  function findMatchingPattern(path, patterns) {
    for (const pattern of patterns) {
      try {
        const regex = patternToRegex(pattern);
        if (regex.test(path)) {
          return pattern;
        }
      } catch (e) {
        console.error(`Invalid pattern: ${pattern}`, e);
      }
    }
    return null;
  }
  function debounce(func, wait) {
    let timeout = null;
    return (...args) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => func(...args), wait);
    };
  }
  function isOutboundLink(url) {
    try {
      const currentHost = window.location.hostname;
      const linkHost = new URL(url).hostname;
      return linkHost !== currentHost && linkHost !== "";
    } catch (e) {
      return false;
    }
  }
  function parseJsonSafely(value, fallback) {
    if (!value) return fallback;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(fallback) && !Array.isArray(parsed) ? fallback : parsed;
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return fallback;
    }
  }

  // config.ts
  function parseScriptConfig(scriptTag) {
    const src = scriptTag.getAttribute("src");
    if (!src) {
      console.error("Script src attribute is missing");
      return null;
    }
    const analyticsHost = src.split("/script.js")[0];
    if (!analyticsHost) {
      console.error("Please provide a valid analytics host");
      return null;
    }
    const siteId = scriptTag.getAttribute("data-site-id") || scriptTag.getAttribute("site-id");
    if (!siteId || isNaN(Number(siteId))) {
      console.error(
        "Please provide a valid site ID using the data-site-id attribute"
      );
      return null;
    }
    const debounceDuration = scriptTag.getAttribute("data-debounce") ? Math.max(0, parseInt(scriptTag.getAttribute("data-debounce"))) : 500;
    const skipPatterns = parseJsonSafely(
      scriptTag.getAttribute("data-skip-patterns"),
      []
    );
    const maskPatterns = parseJsonSafely(
      scriptTag.getAttribute("data-mask-patterns"),
      []
    );
    const apiKey = scriptTag.getAttribute("data-api-key") || void 0;
    const sessionReplayBatchSize = scriptTag.getAttribute(
      "data-replay-batch-size"
    ) ? Math.max(1, parseInt(scriptTag.getAttribute("data-replay-batch-size"))) : 3;
    const sessionReplayBatchInterval = scriptTag.getAttribute(
      "data-replay-batch-interval"
    ) ? Math.max(
      1e3,
      parseInt(scriptTag.getAttribute("data-replay-batch-interval"))
    ) : 2e3;
    console.info(scriptTag);
    return {
      analyticsHost,
      siteId,
      debounceDuration,
      autoTrackPageview: scriptTag.getAttribute("data-auto-track-pageview") !== "false",
      autoTrackSpa: scriptTag.getAttribute("data-track-spa") !== "false",
      trackQuerystring: scriptTag.getAttribute("data-track-query") !== "false",
      trackOutbound: scriptTag.getAttribute("data-track-outbound") !== "false",
      enableWebVitals: scriptTag.getAttribute("data-web-vitals") === "true",
      trackErrors: scriptTag.getAttribute("data-track-errors") === "true",
      enableSessionReplay: scriptTag.getAttribute("data-session-replay") === "true",
      sessionReplayBatchSize,
      sessionReplayBatchInterval,
      skipPatterns,
      maskPatterns,
      apiKey
    };
  }

  // sessionReplay.ts
  var SessionReplayRecorder = class {
    constructor(config, userId, sendBatch) {
      this.isRecording = false;
      this.eventBuffer = [];
      this.config = config;
      this.userId = userId;
      this.sendBatch = sendBatch;
    }
    async initialize() {
      if (!this.config.enableSessionReplay) {
        return;
      }
      if (!window.rrweb) {
        await this.loadRrweb();
      }
      if (window.rrweb) {
        this.startRecording();
      } else {
        console.warn("Failed to load rrweb, session replay disabled");
      }
    }
    async loadRrweb() {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "/rrweb.min.js";
        script.async = false;
        script.onload = () => {
          console.log("[Session Replay] rrweb loaded successfully");
          resolve();
        };
        script.onerror = () => reject(new Error("Failed to load rrweb"));
        document.head.appendChild(script);
      });
    }
    startRecording() {
      if (this.isRecording || !window.rrweb || !this.config.enableSessionReplay) {
        console.log("[Session Replay] Cannot start recording:", {
          isRecording: this.isRecording,
          hasRrweb: !!window.rrweb,
          enableSessionReplay: this.config.enableSessionReplay
        });
        return;
      }
      console.log(
        "[Session Replay] Starting recording at",
        (/* @__PURE__ */ new Date()).toISOString()
      );
      console.log("[Session Replay] Document ready state:", document.readyState);
      try {
        this.stopRecordingFn = window.rrweb.record({
          emit: (event) => {
            const eventTypeNames = {
              0: "DOMContentLoaded",
              1: "Load",
              2: "FullSnapshot",
              3: "IncrementalSnapshot",
              4: "Meta",
              5: "Custom",
              6: "Plugin"
            };
            const typeName = eventTypeNames[event.type] || `Unknown(${event.type})`;
            console.log(
              `[Session Replay] Event collected: Type ${event.type} (${typeName}) at ${new Date(event.timestamp || Date.now()).toISOString()}`
            );
            this.addEvent({
              type: event.type,
              data: event.data,
              timestamp: event.timestamp || Date.now()
            });
          },
          recordCanvas: true,
          // Record canvas elements
          collectFonts: true,
          // Collect font info for better replay
          checkoutEveryNms: 3e4,
          // Checkout every 30 seconds
          checkoutEveryNth: 200,
          // Checkout every 200 events
          maskAllInputs: true,
          // Mask all input values for privacy
          maskInputOptions: {
            password: true,
            email: true
          },
          slimDOMOptions: {
            script: false,
            comment: true,
            headFavicon: true,
            headWhitespace: true,
            headMetaDescKeywords: true,
            headMetaSocial: true,
            headMetaRobots: true,
            headMetaHttpEquiv: true,
            headMetaAuthorship: true,
            headMetaVerification: true
          },
          sampling: {
            // Optional: reduce recording frequency to save bandwidth
            mousemove: false,
            // Don't record every mouse move
            mouseInteraction: true,
            scroll: 150,
            // Sample scroll events every 150ms
            input: "last"
            // Only record the final input value
          }
        });
        this.isRecording = true;
        this.setupBatchTimer();
        console.log("Session replay recording started");
      } catch (error) {
        console.error("Failed to start session replay recording:", error);
      }
    }
    stopRecording() {
      if (!this.isRecording) {
        return;
      }
      if (this.stopRecordingFn) {
        this.stopRecordingFn();
      }
      this.isRecording = false;
      this.clearBatchTimer();
      if (this.eventBuffer.length > 0) {
        this.flushEvents();
      }
      console.log("Session replay recording stopped");
    }
    isActive() {
      return this.isRecording;
    }
    addEvent(event) {
      this.eventBuffer.push(event);
      console.log(
        `[Session Replay] Event added to buffer (${this.eventBuffer.length}/${this.config.sessionReplayBatchSize})`
      );
      if (this.eventBuffer.length >= this.config.sessionReplayBatchSize) {
        console.log(
          `[Session Replay] Buffer full, flushing ${this.eventBuffer.length} events`
        );
        this.flushEvents();
      }
    }
    setupBatchTimer() {
      this.clearBatchTimer();
      this.batchTimer = window.setInterval(() => {
        if (this.eventBuffer.length > 0) {
          console.log(
            `[Session Replay] Timer triggered, flushing ${this.eventBuffer.length} events`
          );
          this.flushEvents();
        }
      }, this.config.sessionReplayBatchInterval);
    }
    clearBatchTimer() {
      if (this.batchTimer) {
        clearInterval(this.batchTimer);
        this.batchTimer = void 0;
      }
    }
    async flushEvents() {
      if (this.eventBuffer.length === 0) {
        return;
      }
      const events = [...this.eventBuffer];
      this.eventBuffer = [];
      console.log(
        `[Session Replay] Sending batch with ${events.length} events to server`
      );
      console.log(
        `[Session Replay] Event types in batch:`,
        events.map((e) => `Type ${e.type}`).join(", ")
      );
      console.log(
        `[Session Replay] Batch size:`,
        JSON.stringify(events).length,
        "characters"
      );
      const batch = {
        userId: this.userId,
        events,
        metadata: {
          pageUrl: window.location.href,
          viewportWidth: screen.width,
          viewportHeight: screen.height,
          language: navigator.language
        }
      };
      try {
        await this.sendBatch(batch);
        console.log(
          `[Session Replay] Successfully sent batch with ${events.length} events`
        );
      } catch (error) {
        console.error("Failed to send session replay batch:", error);
        console.error("Failed batch details:", {
          eventCount: events.length,
          eventTypes: events.map((e) => e.type),
          batchSize: JSON.stringify(batch).length,
          userId: this.userId,
          url: window.location.href
        });
        console.log(
          `[Session Replay] Re-queuing ${events.length} failed events for retry`
        );
        this.eventBuffer.unshift(...events);
      }
    }
    // Update user ID when it changes
    updateUserId(userId) {
      this.userId = userId;
    }
    // Handle page navigation for SPAs
    onPageChange() {
      if (this.isRecording) {
        this.flushEvents();
      }
    }
    // Cleanup on page unload
    cleanup() {
      this.stopRecording();
    }
  };

  // tracking.ts
  var Tracker = class {
    constructor(config) {
      this.customUserId = null;
      this.config = config;
      this.loadUserId();
      if (config.enableSessionReplay) {
        this.initializeSessionReplay();
      }
    }
    loadUserId() {
      try {
        const storedUserId = localStorage.getItem("rybbit-user-id");
        if (storedUserId) {
          this.customUserId = storedUserId;
        }
      } catch (e) {
      }
    }
    async initializeSessionReplay() {
      try {
        this.sessionReplayRecorder = new SessionReplayRecorder(
          this.config,
          this.customUserId || "",
          (batch) => this.sendSessionReplayBatch(batch)
        );
        await this.sessionReplayRecorder.initialize();
      } catch (error) {
        console.error("Failed to initialize session replay:", error);
      }
    }
    async sendSessionReplayBatch(batch) {
      try {
        await fetch(
          `${this.config.analyticsHost}/session-replay/record/${this.config.siteId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(batch),
            mode: "cors",
            keepalive: false
            // Disable keepalive for large session replay requests
          }
        );
      } catch (error) {
        console.error("Failed to send session replay batch:", error);
        throw error;
      }
    }
    createBasePayload() {
      const url = new URL(window.location.href);
      let pathname = url.pathname;
      if (url.hash && url.hash.startsWith("#/")) {
        pathname = url.hash.substring(1);
      }
      if (findMatchingPattern(pathname, this.config.skipPatterns)) {
        return null;
      }
      const maskMatch = findMatchingPattern(pathname, this.config.maskPatterns);
      if (maskMatch) {
        pathname = maskMatch;
      }
      const payload = {
        site_id: this.config.siteId,
        hostname: url.hostname,
        pathname,
        querystring: this.config.trackQuerystring ? url.search : "",
        screenWidth: screen.width,
        screenHeight: screen.height,
        language: navigator.language,
        page_title: document.title,
        referrer: document.referrer
      };
      if (this.customUserId) {
        payload.user_id = this.customUserId;
      }
      if (this.config.apiKey) {
        payload.api_key = this.config.apiKey;
      }
      return payload;
    }
    async sendTrackingData(payload) {
      try {
        await fetch(`${this.config.analyticsHost}/track`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload),
          mode: "cors",
          keepalive: true
        });
      } catch (error) {
        console.error("Failed to send tracking data:", error);
      }
    }
    track(eventType, eventName = "", properties = {}) {
      if (eventType === "custom_event" && (!eventName || typeof eventName !== "string")) {
        console.error(
          "Event name is required and must be a string for custom events"
        );
        return;
      }
      const basePayload = this.createBasePayload();
      if (!basePayload) {
        return;
      }
      const payload = {
        ...basePayload,
        type: eventType,
        event_name: eventName,
        properties: eventType === "custom_event" || eventType === "outbound" || eventType === "error" ? JSON.stringify(properties) : void 0
      };
      this.sendTrackingData(payload);
    }
    trackPageview() {
      this.track("pageview");
    }
    trackEvent(name, properties = {}) {
      this.track("custom_event", name, properties);
    }
    trackOutbound(url, text = "", target = "_self") {
      this.track("outbound", "", { url, text, target });
    }
    trackWebVitals(vitals) {
      const basePayload = this.createBasePayload();
      if (!basePayload) {
        return;
      }
      const payload = {
        ...basePayload,
        type: "performance",
        event_name: "web-vitals",
        ...vitals
      };
      this.sendTrackingData(payload);
    }
    trackError(error, additionalInfo = {}) {
      const currentOrigin = window.location.origin;
      const filename = additionalInfo.filename || "";
      const errorStack = error.stack || "";
      if (filename) {
        try {
          const fileUrl = new URL(filename);
          if (fileUrl.origin !== currentOrigin) {
            return;
          }
        } catch (e) {
        }
      } else if (errorStack) {
        if (!errorStack.includes(currentOrigin)) {
          return;
        }
      }
      const errorProperties = {
        message: error.message?.substring(0, 500) || "Unknown error",
        // Truncate to 500 chars
        stack: errorStack.substring(0, 2e3) || ""
        // Truncate to 2000 chars
      };
      if (filename) {
        errorProperties.fileName = filename;
      }
      if (additionalInfo.lineno) {
        const lineNum = typeof additionalInfo.lineno === "string" ? parseInt(additionalInfo.lineno, 10) : additionalInfo.lineno;
        if (lineNum && lineNum !== 0) {
          errorProperties.lineNumber = lineNum;
        }
      }
      if (additionalInfo.colno) {
        const colNum = typeof additionalInfo.colno === "string" ? parseInt(additionalInfo.colno, 10) : additionalInfo.colno;
        if (colNum && colNum !== 0) {
          errorProperties.columnNumber = colNum;
        }
      }
      for (const key in additionalInfo) {
        if (!["lineno", "colno"].includes(key) && additionalInfo[key] !== void 0) {
          errorProperties[key] = additionalInfo[key];
        }
      }
      this.track("error", error.name || "Error", errorProperties);
    }
    identify(userId) {
      if (typeof userId !== "string" || userId.trim() === "") {
        console.error("User ID must be a non-empty string");
        return;
      }
      this.customUserId = userId.trim();
      try {
        localStorage.setItem("rybbit-user-id", this.customUserId);
      } catch (e) {
        console.warn("Could not persist user ID to localStorage");
      }
      if (this.sessionReplayRecorder) {
        this.sessionReplayRecorder.updateUserId(this.customUserId);
      }
    }
    clearUserId() {
      this.customUserId = null;
      try {
        localStorage.removeItem("rybbit-user-id");
      } catch (e) {
      }
    }
    getUserId() {
      return this.customUserId;
    }
    // Session Replay methods
    startSessionReplay() {
      if (this.sessionReplayRecorder) {
        this.sessionReplayRecorder.startRecording();
      } else {
        console.warn("Session replay not initialized");
      }
    }
    stopSessionReplay() {
      if (this.sessionReplayRecorder) {
        this.sessionReplayRecorder.stopRecording();
      }
    }
    isSessionReplayActive() {
      return this.sessionReplayRecorder?.isActive() ?? false;
    }
    // Handle page changes for SPA
    onPageChange() {
      if (this.sessionReplayRecorder) {
        this.sessionReplayRecorder.onPageChange();
      }
    }
    // Cleanup
    cleanup() {
      if (this.sessionReplayRecorder) {
        this.sessionReplayRecorder.cleanup();
      }
    }
  };

  // webVitals.ts
  var WebVitalsCollector = class {
    constructor(onReady) {
      this.data = {
        lcp: null,
        cls: null,
        inp: null,
        fcp: null,
        ttfb: null
      };
      this.sent = false;
      this.timeout = null;
      this.onReadyCallback = null;
      this.initialized = false;
      this.onReadyCallback = onReady;
    }
    async initialize() {
      if (this.initialized) return;
      if (!window.webVitals) {
        await this.loadWebVitals();
      }
      if (!window.webVitals) {
        console.warn("Failed to load web-vitals, metrics collection disabled");
        return;
      }
      this.initialized = true;
      try {
        window.webVitals.onLCP(this.collectMetric.bind(this));
        window.webVitals.onCLS(this.collectMetric.bind(this));
        window.webVitals.onINP(this.collectMetric.bind(this));
        window.webVitals.onFCP(this.collectMetric.bind(this));
        window.webVitals.onTTFB(this.collectMetric.bind(this));
        this.timeout = setTimeout(() => {
          if (!this.sent) {
            this.sendData();
          }
        }, 2e4);
        window.addEventListener("beforeunload", () => {
          if (!this.sent) {
            this.sendData();
          }
        });
      } catch (e) {
        console.warn("Error initializing web vitals tracking:", e);
      }
    }
    async loadWebVitals() {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "/web-vitals.iife.js";
        script.async = false;
        script.onload = () => {
          console.log("[Web Vitals] Library loaded successfully");
          resolve();
        };
        script.onerror = () => {
          console.error("[Web Vitals] Failed to load library");
          resolve();
        };
        document.head.appendChild(script);
      });
    }
    collectMetric(metric) {
      if (this.sent) return;
      const metricName = metric.name.toLowerCase();
      this.data[metricName] = metric.value;
      const allCollected = Object.values(this.data).every((value) => value !== null);
      if (allCollected) {
        this.sendData();
      }
    }
    sendData() {
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
    getData() {
      return { ...this.data };
    }
  };

  // index.ts
  (function() {
    const scriptTag = document.currentScript;
    if (!scriptTag) {
      console.error("Could not find current script tag");
      return;
    }
    if (window.__RYBBIT_OPTOUT__ || localStorage.getItem("disable-rybbit") !== null) {
      window.rybbit = {
        pageview: () => {
        },
        event: () => {
        },
        trackOutbound: () => {
        },
        identify: () => {
        },
        clearUserId: () => {
        },
        getUserId: () => null,
        startSessionReplay: () => {
        },
        stopSessionReplay: () => {
        },
        isSessionReplayActive: () => false
      };
      return;
    }
    const config = parseScriptConfig(scriptTag);
    if (!config) {
      return;
    }
    const tracker = new Tracker(config);
    if (config.enableWebVitals) {
      const webVitalsCollector = new WebVitalsCollector(
        (vitals) => {
          tracker.trackWebVitals(vitals);
        }
      );
      webVitalsCollector.initialize().catch((e) => {
        console.warn("Failed to initialize web vitals:", e);
      });
    }
    if (config.trackErrors) {
      window.addEventListener("error", (event) => {
        tracker.trackError(event.error || new Error(event.message), {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });
      window.addEventListener("unhandledrejection", (event) => {
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        tracker.trackError(error, {
          type: "unhandledrejection"
        });
      });
    }
    const trackPageview = () => tracker.trackPageview();
    const debouncedTrackPageview = config.debounceDuration > 0 ? debounce(trackPageview, config.debounceDuration) : trackPageview;
    function setupEventListeners() {
      document.addEventListener("click", function(e) {
        let target = e.target;
        while (target && target !== document.documentElement) {
          if (target.hasAttribute("data-rybbit-event")) {
            const eventName = target.getAttribute("data-rybbit-event");
            if (eventName) {
              const properties = {};
              for (const attr of target.attributes) {
                if (attr.name.startsWith("data-rybbit-prop-")) {
                  const propName = attr.name.replace("data-rybbit-prop-", "");
                  properties[propName] = attr.value;
                }
              }
              tracker.trackEvent(eventName, properties);
            }
            break;
          }
          target = target.parentElement;
        }
        if (config.trackOutbound) {
          const link = e.target.closest(
            "a"
          );
          if (link?.href && isOutboundLink(link.href)) {
            tracker.trackOutbound(
              link.href,
              link.innerText || link.textContent || "",
              link.target || "_self"
            );
          }
        }
      });
      if (config.autoTrackSpa) {
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        history.pushState = function(...args) {
          originalPushState.apply(this, args);
          debouncedTrackPageview();
          tracker.onPageChange();
        };
        history.replaceState = function(...args) {
          originalReplaceState.apply(this, args);
          debouncedTrackPageview();
          tracker.onPageChange();
        };
        window.addEventListener("popstate", () => {
          debouncedTrackPageview();
          tracker.onPageChange();
        });
        window.addEventListener("hashchange", () => {
          debouncedTrackPageview();
          tracker.onPageChange();
        });
      }
    }
    window.rybbit = {
      pageview: () => tracker.trackPageview(),
      event: (name, properties = {}) => tracker.trackEvent(name, properties),
      trackOutbound: (url, text = "", target = "_self") => tracker.trackOutbound(url, text, target),
      identify: (userId) => tracker.identify(userId),
      clearUserId: () => tracker.clearUserId(),
      getUserId: () => tracker.getUserId(),
      startSessionReplay: () => tracker.startSessionReplay(),
      stopSessionReplay: () => tracker.stopSessionReplay(),
      isSessionReplayActive: () => tracker.isSessionReplayActive()
    };
    setupEventListeners();
    window.addEventListener("beforeunload", () => {
      tracker.cleanup();
    });
    if (config.autoTrackPageview) {
      tracker.trackPageview();
    }
  })();
})();
