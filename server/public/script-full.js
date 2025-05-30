// Rybbit Analytics Script
(function () {
  const scriptTag = document.currentScript;
  const ANALYTICS_HOST = scriptTag.getAttribute("src").split("/script.js")[0];

  // Web Vitals library (inline version for performance)
  const webVitalsScript = `
    !function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):(e="undefined"!=typeof globalThis?globalThis:e||self,t(e.webVitals={}))}(this,(function(e){"use strict";var t,n,i,r,a=function(e,t){return{name:e,value:void 0===t?-1:t,rating:"good",delta:0,entries:[],id:"v3-".concat(Date.now(),"-").concat(Math.floor(8999999999999*Math.random())+1e12),navigationType:function(){try{return performance.getEntriesByType("navigation")[0].type}catch(e){return"navigate"}}()}},o=function(e,t,n){try{if(PerformanceObserver.supportedEntryTypes.includes(e)){var i=new PerformanceObserver((function(e){Promise.resolve().then((function(){t(e.getEntries())}))}));return i.observe(Object.assign({type:e,buffered:!0},n||{})),i}}catch(e){}},u=function(e,t,n,i){var r,a;return function(o){t.value>=0&&(o||i)&&((a=t.value-(r||0))||void 0===r)&&(r=t.value,t.delta=a,t.rating=function(e,t){return e>t[1]?"poor":e>t[0]?"needs-improvement":"good"}(t.value,n),e(t))}},c=function(e){requestAnimationFrame((function(){return requestAnimationFrame((function(){return e()}))}))},s=function(e){var t=function(t){"pagehide"!==t.type&&"hidden"!==document.visibilityState||e(t)};addEventListener("visibilitychange",t,!0),addEventListener("pagehide",t,!0)},f=function(e){var t=!1;return function(n){t||(e(n),t=!0)}},d=-1,l=function(){return"hidden"!==document.visibilityState||document.prerendering?1/0:0},v=function(e){"hidden"===document.visibilityState&&d>-1&&(d="visibilitychange"===e.type?e.timeStamp:0,m())},p=function(){addEventListener("visibilitychange",v,!0),addEventListener("prerenderingchange",v,!0)},m=function(){removeEventListener("visibilitychange",v,!0),removeEventListener("prerenderingchange",v,!0)},h=function(){return d<0&&(d=l(),p(),s((function(){setTimeout((function(){d=l(),p()}),0)}))),{get firstHiddenTime(){return d}}},g=function(e){document.prerendering?addEventListener("prerenderingchange",(function(){return e()}),!0):e()},T=[1800,3e3],y=function(e,t){t=t||{},g((function(){var n,i=h(),r=a("FCP"),c=o("paint",(function(e){e.forEach((function(e){"first-contentful-paint"===e.name&&(c.disconnect(),e.startTime<i.firstHiddenTime&&(r.value=Math.max(e.startTime-((n=performance.getEntriesByType("navigation")[0])&&n.activationStart||0),0),r.entries.push(e),u(e,r,T,t.reportAllChanges)()))}))}));c&&(n=performance.getEntriesByType("navigation")[0])&&n.activationStart&&n.activationStart>0&&(r.value=Math.max(n.activationStart,0),r.entries.push(n),u(e,r,T,t.reportAllChanges)())}))},E=[.1,.25],L=function(e,t){t=t||{},y(f((function(){var n,i=a("CLS",0),r=0,c=[],l=function(e){e.forEach((function(e){if(!e.hadRecentInput){var t=c[0],n=c[c.length-1];r&&e.startTime-n.startTime<1e3&&e.startTime-t.startTime<5e3?(r+=e.value,c.push(e)):(r=e.value,c=[e])}})),r>i.value&&(i.value=r,i.entries=c,n())},v=o("layout-shift",l);v&&(n=u(e,i,E,t.reportAllChanges),s((function(){l(v.takeRecords()),n(!0)})),setTimeout(n,0))})))},b=[200,500],S=function(e,t){t=t||{},g((function(){var n,i=h(),r=a("INP"),c=function(e){e.forEach((function(e){(e.interactionId&&l(e),e.entryType)&&("first-input"===e.entryType?!function(e){if(e.interactionId){var t=d.get(e.interactionId);t?(t.entries.push(e),t.latency=Math.max(t.latency,e.processingEnd-e.processingStart)):(d.set(e.interactionId,{id:e.interactionId,latency:e.processingEnd-e.processingStart,entries:[e]}),v.add(e.interactionId))}}(e):"event"===e.entryType&&l(e))}))},l=function(e){var t=e.interactionId;if(null!=t){var n=d.get(t);n||(n={id:t,latency:0,entries:[]},d.set(t,n),v.add(t));var i=e.processingEnd-e.processingStart;i>n.latency&&(n.latency=i),n.entries.push(e)}},v=new Set,d=new Map,p=function(){var e=Math.min(d.size-1,Math.floor(d.size/50));return function(e){var t=[];return v.forEach((function(n){var i=d.get(n);i&&t.push(i)})),t.sort((function(e,t){return t.latency-e.latency})),t.slice(0,e)}(e)},m=function(){var e=p();e.length>0&&(r.value=e[0].latency,r.entries=e[0].entries,n())},T=o("event",c,{durationThreshold:t.durationThreshold||40});n=u(e,r,b,t.reportAllChanges),T&&(T.observe({type:"first-input",buffered:!0}),s((function(){c(T.takeRecords()),r.value<0&&p().length>0&&(r.value=0,r.entries=[]),n(!0)})),setTimeout((function(){p().length>0&&m()}),0))}))},w=[2500,4e3],I=function(e,t){t=t||{},g((function(){var n,i=h(),r=a("LCP"),c=function(e){var t=e[e.length-1];t&&t.startTime<i.firstHiddenTime&&(r.value=Math.max(t.startTime-((n=performance.getEntriesByType("navigation")[0])&&n.activationStart||0),0),r.entries=[t],l())},l=u(e,r,w,t.reportAllChanges),v=o("largest-contentful-paint",c);if(v){n=performance.getEntriesByType("navigation")[0],n&&n.activationStart&&n.activationStart>0&&(r.value=Math.max(n.activationStart,0),r.entries=[n],l());var d=function(){v.takeRecords().length&&c(v.takeRecords()),v.disconnect()};["keydown","click"].forEach((function(e){addEventListener(e,d,!0)})),s(d),setTimeout(d,0)}}))},C=[800,1800],A=function(e,t){t=t||{},g((function(){var n,i=a("TTFB"),r=function(){try{var e=performance.getEntriesByType("navigation")[0]||function(){var e=performance.timing,t={entryType:"navigation",startTime:0,type:void 0!==performance.navigation?{0:"navigate",1:"reload",2:"back_forward"}[performance.navigation.type]:"navigate"};for(var n in e)"navigationStart"!==n&&"toJSON"!==n&&(t[n]=Math.max(e[n]-e.navigationStart,0));return t}();return e.responseStart>0?e.responseStart:e.fetchStart}catch(e){return 0}}();r&&(i.value=Math.max(r-((n=performance.getEntriesByType("navigation")[0])&&n.activationStart||0),0),i.entries=[n],u(e,i,C,t.reportAllChanges)())}))};e.getCLS=L,e.getFCP=y,e.getFID=function(e,t){return S(e,Object.assign({durationThreshold:40},t))},e.getINP=S,e.getLCP=I,e.getTTFB=A,Object.defineProperty(e,"__esModule",{value:!0})}));
  `;

  // Execute the web vitals script
  try {
    eval(webVitalsScript);
  } catch (e) {
    console.warn("Failed to load web vitals library:", e);
  }

  // Check if the user has opted out of tracking via localStorage
  if (localStorage.getItem("disable-rybbit") !== null) {
    // Create a no-op implementation to ensure the API still works
    window.rybbit = {
      pageview: () => {},
      event: () => {},
      trackOutbound: () => {},
      identify: () => {},
      clearUserId: () => {},
      getUserId: () => null,
    };
    return;
  }

  if (!ANALYTICS_HOST) {
    console.error("Please provide a valid analytics host");
    return;
  }

  const SITE_ID =
    scriptTag.getAttribute("data-site-id") || scriptTag.getAttribute("site-id");

  if (!SITE_ID || isNaN(Number(SITE_ID))) {
    console.error(
      "Please provide a valid site ID using the data-site-id attribute"
    );
    return;
  }

  const debounceDuration = scriptTag.getAttribute("data-debounce")
    ? Math.max(0, parseInt(scriptTag.getAttribute("data-debounce")))
    : 500;

  const autoTrackPageview =
    scriptTag.getAttribute("data-auto-track-pageview") !== "false";
  const autoTrackSpa = scriptTag.getAttribute("data-track-spa") !== "false";
  const trackQuerystring =
    scriptTag.getAttribute("data-track-query") !== "false";
  const trackOutbound =
    scriptTag.getAttribute("data-track-outbound") !== "false";

  let skipPatterns = [];
  try {
    const skipAttr = scriptTag.getAttribute("data-skip-patterns");
    if (skipAttr) {
      skipPatterns = JSON.parse(skipAttr);
      if (!Array.isArray(skipPatterns)) skipPatterns = [];
    }
  } catch (e) {
    console.error("Error parsing data-skip-patterns:", e);
  }

  let maskPatterns = [];
  try {
    const maskAttr = scriptTag.getAttribute("data-mask-patterns");
    if (maskAttr) {
      maskPatterns = JSON.parse(maskAttr);
      if (!Array.isArray(maskPatterns)) maskPatterns = [];
    }
  } catch (e) {
    console.error("Error parsing data-mask-patterns:", e);
  }

  // Add user ID management
  let customUserId = null;

  // Load stored user ID from localStorage on script initialization
  try {
    const storedUserId = localStorage.getItem("rybbit-user-id");
    if (storedUserId) {
      customUserId = storedUserId;
    }
  } catch (e) {
    // localStorage not available, ignore
  }

  // Helper function to convert wildcard pattern to regex
  function patternToRegex(pattern) {
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

  function findMatchingPattern(path, patterns) {
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

  function debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Check if a URL is an outbound link
  function isOutboundLink(url) {
    try {
      const currentHost = window.location.hostname;
      const linkHost = new URL(url).hostname;
      return linkHost !== currentHost && linkHost !== "";
    } catch (e) {
      return false;
    }
  }

  const track = (eventType = "pageview", eventName = "", properties = {}) => {
    if (
      eventType === "custom_event" &&
      (!eventName || typeof eventName !== "string")
    ) {
      console.error(
        "Event name is required and must be a string for custom events"
      );
      return;
    }

    const url = new URL(window.location.href);
    let pathname = url.pathname;

    // Always handle hash-based SPA routing
    if (url.hash && url.hash.startsWith("#/")) {
      // For #/path format, replace pathname with just /path
      pathname = url.hash.substring(1);
    }

    if (findMatchingPattern(pathname, skipPatterns)) {
      return;
    }

    const maskMatch = findMatchingPattern(pathname, maskPatterns);
    if (maskMatch) {
      pathname = maskMatch;
    }

    const payload = {
      site_id: SITE_ID,
      hostname: url.hostname,
      pathname: pathname,
      querystring: trackQuerystring ? url.search : "",
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      language: navigator.language,
      page_title: document.title,
      referrer: document.referrer,
      type: eventType,
      event_name: eventName,
      properties:
        eventType === "custom_event" || eventType === "outbound"
          ? JSON.stringify(properties)
          : undefined,
    };

    // Add custom user ID only if it's set
    if (customUserId) {
      payload.user_id = customUserId;
    }

    fetch(`${ANALYTICS_HOST}/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      mode: "cors",
      keepalive: true,
    }).catch(console.error);
  };

  // Web vitals collection state
  let webVitalsData = {
    lcp: null,
    cls: null,
    inp: null,
    fcp: null,
    ttfb: null,
  };
  let webVitalsSent = false;
  let webVitalsTimeout = null;

  // Check if all metrics are collected and send if ready
  const checkAndSendWebVitals = () => {
    if (webVitalsSent) return;

    const allMetricsCollected = Object.values(webVitalsData).every(
      (value) => value !== null
    );

    if (allMetricsCollected) {
      sendWebVitals();
    }
  };

  // Send web vitals data in a single request
  const sendWebVitals = () => {
    if (webVitalsSent) return;
    webVitalsSent = true;

    // Clear timeout if it exists
    if (webVitalsTimeout) {
      clearTimeout(webVitalsTimeout);
      webVitalsTimeout = null;
    }

    const payload = {
      site_id: SITE_ID,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      querystring: trackQuerystring ? window.location.search : "",
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      language: navigator.language,
      page_title: document.title,
      referrer: document.referrer,
      type: "performance",
      event_name: "web-vitals",
      // Include all collected metrics
      lcp: webVitalsData.lcp,
      cls: webVitalsData.cls,
      inp: webVitalsData.inp,
      fcp: webVitalsData.fcp,
      ttfb: webVitalsData.ttfb,
    };

    // Add custom user ID only if it's set
    if (customUserId) {
      payload.user_id = customUserId;
    }

    fetch(`${ANALYTICS_HOST}/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      mode: "cors",
      keepalive: true,
    }).catch(console.error);
  };

  // Individual metric collectors
  const collectMetric = (metric) => {
    if (webVitalsSent) return;

    webVitalsData[metric.name.toLowerCase()] = metric.value;
    checkAndSendWebVitals();
  };

  // Initialize web vitals tracking if available
  const initWebVitals = () => {
    if (typeof webVitals !== "undefined") {
      try {
        // Track Core Web Vitals
        webVitals.getLCP(collectMetric);
        webVitals.getCLS(collectMetric);
        webVitals.getINP(collectMetric);

        // Track additional metrics
        webVitals.getFCP(collectMetric);
        webVitals.getTTFB(collectMetric);

        // Set a timeout to send metrics even if not all are collected
        // This handles cases where some metrics might not fire (e.g., no user interactions for INP)
        webVitalsTimeout = setTimeout(() => {
          if (!webVitalsSent) {
            sendWebVitals();
          }
        }, 10000); // 10 second timeout

        // Also send on page unload to capture any remaining metrics
        window.addEventListener("beforeunload", () => {
          if (!webVitalsSent) {
            sendWebVitals();
          }
        });
      } catch (e) {
        console.warn("Error initializing web vitals tracking:", e);
      }
    }
  };

  const trackPageview = () => track("pageview");

  const debouncedTrackPageview =
    debounceDuration > 0
      ? debounce(trackPageview, debounceDuration)
      : trackPageview;

  // Track outbound link clicks
  if (trackOutbound) {
    document.addEventListener("click", function (e) {
      const link = e.target.closest("a");
      if (!link || !link.href) return;

      if (isOutboundLink(link.href)) {
        track("outbound", "", {
          url: link.href,
          text: link.innerText || link.textContent || "",
          target: link.target || "_self",
        });
      }
    });
  }

  if (autoTrackSpa) {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      debouncedTrackPageview();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      debouncedTrackPageview();
    };

    window.addEventListener("popstate", debouncedTrackPageview);
    // Always listen for hashchange events for hash-based routing
    window.addEventListener("hashchange", debouncedTrackPageview);
  }

  window.rybbit = {
    pageview: trackPageview,
    event: (name, properties = {}) => track("custom_event", name, properties),
    trackOutbound: (url, text = "", target = "_self") =>
      track("outbound", "", { url, text, target }),

    // New methods for user identification
    identify: (userId) => {
      if (typeof userId !== "string" || userId.trim() === "") {
        console.error("User ID must be a non-empty string");
        return;
      }
      customUserId = userId.trim();
      try {
        localStorage.setItem("rybbit-user-id", customUserId);
      } catch (e) {
        // localStorage not available, user ID will only persist for session
        console.warn("Could not persist user ID to localStorage");
      }
    },

    clearUserId: () => {
      customUserId = null;
      try {
        localStorage.removeItem("rybbit-user-id");
      } catch (e) {
        // localStorage not available, ignore
      }
    },

    getUserId: () => customUserId,
  };

  if (autoTrackPageview) {
    trackPageview();
  }

  // Initialize web vitals tracking
  initWebVitals();
})();
