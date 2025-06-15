(function() {
  "use strict";
  var r, a = -1, o = function(e) {
    addEventListener("pageshow", function(n) {
      n.persisted && (a = n.timeStamp, e(n));
    }, true);
  }, c = function() {
    return window.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  }, u = function() {
    var e = c();
    return e && e.activationStart || 0;
  }, f = function(e, n) {
    var t = c(), i = "navigate";
    a >= 0 ? i = "back-forward-cache" : t && (document.prerendering || u() > 0 ? i = "prerender" : document.wasDiscarded ? i = "restore" : t.type && (i = t.type.replace(/_/g, "-")));
    return { name: e, value: void 0 === n ? -1 : n, rating: "good", delta: 0, entries: [], id: "v3-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: i };
  }, s = function(e, n, t) {
    try {
      if (PerformanceObserver.supportedEntryTypes.includes(e)) {
        var i = new PerformanceObserver(function(e2) {
          Promise.resolve().then(function() {
            n(e2.getEntries());
          });
        });
        return i.observe(Object.assign({ type: e, buffered: true }, t || {})), i;
      }
    } catch (e2) {
    }
  }, d = function(e, n, t, i) {
    var r2, a2;
    return function(o2) {
      n.value >= 0 && (o2 || i) && ((a2 = n.value - (r2 || 0)) || void 0 === r2) && (r2 = n.value, n.delta = a2, n.rating = function(e2, n2) {
        return e2 > n2[1] ? "poor" : e2 > n2[0] ? "needs-improvement" : "good";
      }(n.value, t), e(n));
    };
  }, l = function(e) {
    requestAnimationFrame(function() {
      return requestAnimationFrame(function() {
        return e();
      });
    });
  }, p = function(e) {
    var n = function(n2) {
      "pagehide" !== n2.type && "hidden" !== document.visibilityState || e(n2);
    };
    addEventListener("visibilitychange", n, true), addEventListener("pagehide", n, true);
  }, v = function(e) {
    var n = false;
    return function(t) {
      n || (e(t), n = true);
    };
  }, m = -1, h = function() {
    return "hidden" !== document.visibilityState || document.prerendering ? 1 / 0 : 0;
  }, g = function(e) {
    "hidden" === document.visibilityState && m > -1 && (m = "visibilitychange" === e.type ? e.timeStamp : 0, T());
  }, y = function() {
    addEventListener("visibilitychange", g, true), addEventListener("prerenderingchange", g, true);
  }, T = function() {
    removeEventListener("visibilitychange", g, true), removeEventListener("prerenderingchange", g, true);
  }, E = function() {
    return m < 0 && (m = h(), y(), o(function() {
      setTimeout(function() {
        m = h(), y();
      }, 0);
    })), { get firstHiddenTime() {
      return m;
    } };
  }, C = function(e) {
    document.prerendering ? addEventListener("prerenderingchange", function() {
      return e();
    }, true) : e();
  }, L = [1800, 3e3], w = function(e, n) {
    n = n || {}, C(function() {
      var t, i = E(), r2 = f("FCP"), a2 = s("paint", function(e2) {
        e2.forEach(function(e3) {
          "first-contentful-paint" === e3.name && (a2.disconnect(), e3.startTime < i.firstHiddenTime && (r2.value = Math.max(e3.startTime - u(), 0), r2.entries.push(e3), t(true)));
        });
      });
      a2 && (t = d(e, r2, L, n.reportAllChanges), o(function(i2) {
        r2 = f("FCP"), t = d(e, r2, L, n.reportAllChanges), l(function() {
          r2.value = performance.now() - i2.timeStamp, t(true);
        });
      }));
    });
  }, b = [0.1, 0.25], S = function(e, n) {
    n = n || {}, w(v(function() {
      var t, i = f("CLS", 0), r2 = 0, a2 = [], c2 = function(e2) {
        e2.forEach(function(e3) {
          if (!e3.hadRecentInput) {
            var n2 = a2[0], t2 = a2[a2.length - 1];
            r2 && e3.startTime - t2.startTime < 1e3 && e3.startTime - n2.startTime < 5e3 ? (r2 += e3.value, a2.push(e3)) : (r2 = e3.value, a2 = [e3]);
          }
        }), r2 > i.value && (i.value = r2, i.entries = a2, t());
      }, u2 = s("layout-shift", c2);
      u2 && (t = d(e, i, b, n.reportAllChanges), p(function() {
        c2(u2.takeRecords()), t(true);
      }), o(function() {
        r2 = 0, i = f("CLS", 0), t = d(e, i, b, n.reportAllChanges), l(function() {
          return t();
        });
      }), setTimeout(t, 0));
    }));
  }, B = 0, R = 1 / 0, H = 0, N = function(e) {
    e.forEach(function(e2) {
      e2.interactionId && (R = Math.min(R, e2.interactionId), H = Math.max(H, e2.interactionId), B = H ? (H - R) / 7 + 1 : 0);
    });
  }, O = function() {
    return r ? B : performance.interactionCount || 0;
  }, q = function() {
    "interactionCount" in performance || r || (r = s("event", N, { type: "event", buffered: true, durationThreshold: 0 }));
  }, j = [200, 500], _ = 0, z = function() {
    return O() - _;
  }, G = [], J = {}, K = function(e) {
    var n = G[G.length - 1], t = J[e.interactionId];
    if (t || G.length < 10 || e.duration > n.latency) {
      if (t) t.entries.push(e), t.latency = Math.max(t.latency, e.duration);
      else {
        var i = { id: e.interactionId, latency: e.duration, entries: [e] };
        J[i.id] = i, G.push(i);
      }
      G.sort(function(e2, n2) {
        return n2.latency - e2.latency;
      }), G.splice(10).forEach(function(e2) {
        delete J[e2.id];
      });
    }
  }, Q = function(e, n) {
    n = n || {}, C(function() {
      var t;
      q();
      var i, r2 = f("INP"), a2 = function(e2) {
        e2.forEach(function(e3) {
          (e3.interactionId && K(e3), "first-input" === e3.entryType) && (!G.some(function(n3) {
            return n3.entries.some(function(n4) {
              return e3.duration === n4.duration && e3.startTime === n4.startTime;
            });
          }) && K(e3));
        });
        var n2, t2 = (n2 = Math.min(G.length - 1, Math.floor(z() / 50)), G[n2]);
        t2 && t2.latency !== r2.value && (r2.value = t2.latency, r2.entries = t2.entries, i());
      }, c2 = s("event", a2, { durationThreshold: null !== (t = n.durationThreshold) && void 0 !== t ? t : 40 });
      i = d(e, r2, j, n.reportAllChanges), c2 && ("PerformanceEventTiming" in window && "interactionId" in PerformanceEventTiming.prototype && c2.observe({ type: "first-input", buffered: true }), p(function() {
        a2(c2.takeRecords()), r2.value < 0 && z() > 0 && (r2.value = 0, r2.entries = []), i(true);
      }), o(function() {
        G = [], _ = O(), r2 = f("INP"), i = d(e, r2, j, n.reportAllChanges);
      }));
    });
  }, U = [2500, 4e3], V = {}, W = function(e, n) {
    n = n || {}, C(function() {
      var t, i = E(), r2 = f("LCP"), a2 = function(e2) {
        var n2 = e2[e2.length - 1];
        n2 && n2.startTime < i.firstHiddenTime && (r2.value = Math.max(n2.startTime - u(), 0), r2.entries = [n2], t());
      }, c2 = s("largest-contentful-paint", a2);
      if (c2) {
        t = d(e, r2, U, n.reportAllChanges);
        var m2 = v(function() {
          V[r2.id] || (a2(c2.takeRecords()), c2.disconnect(), V[r2.id] = true, t(true));
        });
        ["keydown", "click"].forEach(function(e2) {
          addEventListener(e2, function() {
            return setTimeout(m2, 0);
          }, true);
        }), p(m2), o(function(i2) {
          r2 = f("LCP"), t = d(e, r2, U, n.reportAllChanges), l(function() {
            r2.value = performance.now() - i2.timeStamp, V[r2.id] = true, t(true);
          });
        });
      }
    });
  }, X = [800, 1800], Y = function e(n) {
    document.prerendering ? C(function() {
      return e(n);
    }) : "complete" !== document.readyState ? addEventListener("load", function() {
      return e(n);
    }, true) : setTimeout(n, 0);
  }, Z = function(e, n) {
    n = n || {};
    var t = f("TTFB"), i = d(e, t, X, n.reportAllChanges);
    Y(function() {
      var r2 = c();
      if (r2) {
        var a2 = r2.responseStart;
        if (a2 <= 0 || a2 > performance.now()) return;
        t.value = Math.max(a2 - u(), 0), t.entries = [r2], i(true), o(function() {
          t = f("TTFB", 0), (i = d(e, t, X, n.reportAllChanges))(true);
        });
      }
    });
  };
  class WebVitalsCollector {
    constructor(onSend) {
      this.data = {
        lcp: null,
        cls: null,
        inp: null,
        fcp: null,
        ttfb: null
      };
      this.sent = false;
      this.timeout = null;
      this.onSend = onSend;
    }
    /**
     * Initialize Web Vitals collection
     */
    init() {
      if (this.sent) return;
      try {
        W(this.collectMetric.bind(this));
        S(this.collectMetric.bind(this));
        Q(this.collectMetric.bind(this));
        w(this.collectMetric.bind(this));
        Z(this.collectMetric.bind(this));
        this.timeout = setTimeout(() => {
          if (!this.sent) {
            this.sendMetrics();
          }
        }, 2e4);
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
    collectMetric(metric) {
      if (this.sent) return;
      const metricName = metric.name.toLowerCase();
      this.data[metricName] = metric.value;
      this.checkAndSendMetrics();
    }
    /**
     * Check if all metrics are collected and send if ready
     */
    checkAndSendMetrics() {
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
    sendMetrics() {
      if (this.sent) return;
      this.sent = true;
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      const payload = {
        type: "performance",
        event_name: "web-vitals",
        // Include all collected metrics
        lcp: this.data.lcp,
        cls: this.data.cls,
        inp: this.data.inp,
        fcp: this.data.fcp,
        ttfb: this.data.ttfb
      };
      this.onSend(payload);
    }
    /**
     * Get current metrics data (for testing)
     */
    getData() {
      return { ...this.data };
    }
    /**
     * Check if metrics have been sent (for testing)
     */
    isSent() {
      return this.sent;
    }
    /**
     * Reset collector state (for testing)
     */
    reset() {
      this.data = {
        lcp: null,
        cls: null,
        inp: null,
        fcp: null,
        ttfb: null
      };
      this.sent = false;
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
    }
  }
  function patternToRegex(pattern) {
    const DOUBLE_WILDCARD_TOKEN = "__DOUBLE_ASTERISK_TOKEN__";
    const SINGLE_WILDCARD_TOKEN = "__SINGLE_ASTERISK_TOKEN__";
    let tokenized = pattern.replace(/\*\*/g, DOUBLE_WILDCARD_TOKEN).replace(/\*/g, SINGLE_WILDCARD_TOKEN);
    let escaped = tokenized.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    escaped = escaped.replace(/\//g, "\\/");
    let regexPattern = escaped.replace(new RegExp(DOUBLE_WILDCARD_TOKEN, "g"), ".*").replace(new RegExp(SINGLE_WILDCARD_TOKEN, "g"), "[^/]+");
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
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
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
  function safeJsonParse(jsonString, fallback) {
    if (!jsonString) return fallback;
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(fallback) && Array.isArray(parsed)) {
        return parsed;
      }
      return fallback;
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return fallback;
    }
  }
  function collectCustomProperties(element) {
    const properties = {};
    for (const attr of element.attributes) {
      if (attr.name.startsWith("data-rybbit-prop-")) {
        const propName = attr.name.replace("data-rybbit-prop-", "");
        properties[propName] = attr.value;
      }
    }
    return properties;
  }
  const collectCustomEventProperties = collectCustomProperties;
  function safeLocalStorageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  function safeLocalStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Could not persist to localStorage:", e);
    }
  }
  function safeLocalStorageRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
    }
  }
  (function() {
    const scriptTag = document.currentScript;
    if (!scriptTag) {
      console.error("Rybbit Analytics: Could not find script tag");
      return;
    }
    const ANALYTICS_HOST = scriptTag.getAttribute("src")?.split("/script.js")[0];
    if (!!window.__RYBBIT_OPTOUT__ || safeLocalStorageGet("disable-rybbit") !== null) {
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
        getUserId: () => null
      };
      return;
    }
    if (!ANALYTICS_HOST) {
      console.error("Please provide a valid analytics host");
      return;
    }
    const SITE_ID = scriptTag.getAttribute("data-site-id") || scriptTag.getAttribute("site-id");
    if (!SITE_ID || isNaN(Number(SITE_ID))) {
      console.error(
        "Please provide a valid site ID using the data-site-id attribute"
      );
      return;
    }
    const config = {
      siteId: SITE_ID,
      analyticsHost: ANALYTICS_HOST,
      debounceDuration: scriptTag.getAttribute("data-debounce") ? Math.max(0, parseInt(scriptTag.getAttribute("data-debounce") || "0")) : 500,
      autoTrackPageview: scriptTag.getAttribute("data-auto-track-pageview") !== "false",
      autoTrackSpa: scriptTag.getAttribute("data-track-spa") !== "false",
      trackQuerystring: scriptTag.getAttribute("data-track-query") !== "false",
      trackOutbound: scriptTag.getAttribute("data-track-outbound") !== "false",
      // Temporarily enabled for testing - in production this would be:
      // enableWebVitals: scriptTag.getAttribute('data-web-vitals') === 'true',
      enableWebVitals: true,
      skipPatterns: [],
      maskPatterns: []
    };
    try {
      const skipAttr = scriptTag.getAttribute("data-skip-patterns");
      if (skipAttr) {
        const parsed = safeJsonParse(skipAttr, []);
        if (Array.isArray(parsed)) {
          config.skipPatterns = parsed;
        }
      }
    } catch (e) {
      console.error("Error parsing data-skip-patterns:", e);
    }
    try {
      const maskAttr = scriptTag.getAttribute("data-mask-patterns");
      if (maskAttr) {
        const parsed = safeJsonParse(maskAttr, []);
        if (Array.isArray(parsed)) {
          config.maskPatterns = parsed;
        }
      }
    } catch (e) {
      console.error("Error parsing data-mask-patterns:", e);
    }
    let customUserId = null;
    const storedUserId = safeLocalStorageGet("rybbit-user-id");
    if (storedUserId) {
      customUserId = storedUserId;
    }
    const createBasePayload = () => {
      const url = new URL(window.location.href);
      let pathname = url.pathname;
      if (url.hash && url.hash.startsWith("#/")) {
        pathname = url.hash.substring(1);
      }
      if (findMatchingPattern(pathname, config.skipPatterns)) {
        return null;
      }
      const maskMatch = findMatchingPattern(pathname, config.maskPatterns);
      if (maskMatch) {
        pathname = maskMatch;
      }
      const payload = {
        site_id: config.siteId,
        hostname: url.hostname,
        pathname,
        querystring: config.trackQuerystring ? url.search : "",
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        language: navigator.language,
        page_title: document.title,
        referrer: document.referrer,
        type: "pageview"
        // Default type, will be overridden
      };
      if (customUserId) {
        payload.user_id = customUserId;
      }
      return payload;
    };
    const sendTrackingData = (payload) => {
      fetch(`${config.analyticsHost}/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        mode: "cors",
        keepalive: true
      }).catch(console.error);
    };
    const track = (eventType = "pageview", eventName = "", properties = {}) => {
      if (eventType === "custom_event" && (!eventName || typeof eventName !== "string")) {
        console.error(
          "Event name is required and must be a string for custom events"
        );
        return;
      }
      const basePayload = createBasePayload();
      if (!basePayload) {
        return;
      }
      const payload = {
        ...basePayload,
        type: eventType,
        event_name: eventName,
        properties: eventType === "custom_event" || eventType === "outbound" ? JSON.stringify(properties) : void 0
      };
      sendTrackingData(payload);
    };
    let webVitalsCollector = null;
    {
      webVitalsCollector = new WebVitalsCollector(sendTrackingData);
      webVitalsCollector.init();
    }
    const trackPageview = () => track("pageview");
    const debouncedTrackPageview = config.debounceDuration > 0 ? debounce(trackPageview, config.debounceDuration) : trackPageview;
    document.addEventListener("click", function(e) {
      let target = e.target;
      while (target && target !== document.documentElement) {
        if (target.hasAttribute("data-rybbit-event")) {
          const eventName = target.getAttribute("data-rybbit-event");
          if (eventName) {
            const properties = collectCustomEventProperties(target);
            track("custom_event", eventName, properties);
          }
          break;
        }
        target = target.parentElement;
      }
      if (config.trackOutbound) {
        const link = e.target.closest("a");
        if (!link || !link.href) return;
        if (isOutboundLink(link.href)) {
          track("outbound", "", {
            url: link.href,
            text: link.innerText || link.textContent || "",
            target: link.target || "_self"
          });
        }
      }
    });
    if (config.autoTrackSpa) {
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      history.pushState = function(...args) {
        originalPushState.apply(this, args);
        debouncedTrackPageview();
      };
      history.replaceState = function(...args) {
        originalReplaceState.apply(this, args);
        debouncedTrackPageview();
      };
      window.addEventListener("popstate", debouncedTrackPageview);
      window.addEventListener("hashchange", debouncedTrackPageview);
    }
    const rybbitAPI = {
      pageview: trackPageview,
      event: (name, properties = {}) => track("custom_event", name, properties),
      trackOutbound: (url, text = "", target = "_self") => track("outbound", "", { url, text, target }),
      // User identification methods
      identify: (userId) => {
        if (typeof userId !== "string" || userId.trim() === "") {
          console.error("User ID must be a non-empty string");
          return;
        }
        customUserId = userId.trim();
        safeLocalStorageSet("rybbit-user-id", customUserId);
      },
      clearUserId: () => {
        customUserId = null;
        safeLocalStorageRemove("rybbit-user-id");
      },
      getUserId: () => customUserId
    };
    window.rybbit = rybbitAPI;
    if (config.autoTrackPageview) {
      trackPageview();
    }
  })();
})();
//# sourceMappingURL=script-full.js.map
