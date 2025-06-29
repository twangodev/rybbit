"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

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
      } catch (e2) {
        console.error(`Invalid pattern: ${pattern}`, e2);
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
    } catch (e2) {
      return false;
    }
  }
  function parseJsonSafely(value, fallback) {
    if (!value) return fallback;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(fallback) && !Array.isArray(parsed) ? fallback : parsed;
    } catch (e2) {
      console.error("Error parsing JSON:", e2);
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

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb-snapshot/es/rrweb-snapshot.js
  var NodeType;
  (function(NodeType2) {
    NodeType2[NodeType2["Document"] = 0] = "Document";
    NodeType2[NodeType2["DocumentType"] = 1] = "DocumentType";
    NodeType2[NodeType2["Element"] = 2] = "Element";
    NodeType2[NodeType2["Text"] = 3] = "Text";
    NodeType2[NodeType2["CDATA"] = 4] = "CDATA";
    NodeType2[NodeType2["Comment"] = 5] = "Comment";
  })(NodeType || (NodeType = {}));
  function isElement(n2) {
    return n2.nodeType === n2.ELEMENT_NODE;
  }
  function isShadowRoot(n2) {
    var host = n2 === null || n2 === void 0 ? void 0 : n2.host;
    return Boolean((host === null || host === void 0 ? void 0 : host.shadowRoot) === n2);
  }
  function isNativeShadowDom(shadowRoot) {
    return Object.prototype.toString.call(shadowRoot) === "[object ShadowRoot]";
  }
  function fixBrowserCompatibilityIssuesInCSS(cssText) {
    if (cssText.includes(" background-clip: text;") && !cssText.includes(" -webkit-background-clip: text;")) {
      cssText = cssText.replace(" background-clip: text;", " -webkit-background-clip: text; background-clip: text;");
    }
    return cssText;
  }
  function escapeImportStatement(rule) {
    var cssText = rule.cssText;
    if (cssText.split('"').length < 3)
      return cssText;
    var statement = ["@import", "url(".concat(JSON.stringify(rule.href), ")")];
    if (rule.layerName === "") {
      statement.push("layer");
    } else if (rule.layerName) {
      statement.push("layer(".concat(rule.layerName, ")"));
    }
    if (rule.supportsText) {
      statement.push("supports(".concat(rule.supportsText, ")"));
    }
    if (rule.media.length) {
      statement.push(rule.media.mediaText);
    }
    return statement.join(" ") + ";";
  }
  function stringifyStylesheet(s2) {
    try {
      var rules = s2.rules || s2.cssRules;
      return rules ? fixBrowserCompatibilityIssuesInCSS(Array.from(rules).map(stringifyRule).join("")) : null;
    } catch (error) {
      return null;
    }
  }
  function stringifyRule(rule) {
    var importStringified;
    if (isCSSImportRule(rule)) {
      try {
        importStringified = stringifyStylesheet(rule.styleSheet) || escapeImportStatement(rule);
      } catch (error) {
      }
    }
    return validateStringifiedCssRule(importStringified || rule.cssText);
  }
  function validateStringifiedCssRule(cssStringified) {
    if (cssStringified.includes(":")) {
      var regex = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
      return cssStringified.replace(regex, "$1\\$2");
    }
    return cssStringified;
  }
  function isCSSImportRule(rule) {
    return "styleSheet" in rule;
  }
  var Mirror = function() {
    function Mirror2() {
      this.idNodeMap = /* @__PURE__ */ new Map();
      this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
    }
    Mirror2.prototype.getId = function(n2) {
      var _a;
      if (!n2)
        return -1;
      var id = (_a = this.getMeta(n2)) === null || _a === void 0 ? void 0 : _a.id;
      return id !== null && id !== void 0 ? id : -1;
    };
    Mirror2.prototype.getNode = function(id) {
      return this.idNodeMap.get(id) || null;
    };
    Mirror2.prototype.getIds = function() {
      return Array.from(this.idNodeMap.keys());
    };
    Mirror2.prototype.getMeta = function(n2) {
      return this.nodeMetaMap.get(n2) || null;
    };
    Mirror2.prototype.removeNodeFromMap = function(n2) {
      var _this = this;
      var id = this.getId(n2);
      this.idNodeMap["delete"](id);
      if (n2.childNodes) {
        n2.childNodes.forEach(function(childNode) {
          return _this.removeNodeFromMap(childNode);
        });
      }
    };
    Mirror2.prototype.has = function(id) {
      return this.idNodeMap.has(id);
    };
    Mirror2.prototype.hasNode = function(node) {
      return this.nodeMetaMap.has(node);
    };
    Mirror2.prototype.add = function(n2, meta) {
      var id = meta.id;
      this.idNodeMap.set(id, n2);
      this.nodeMetaMap.set(n2, meta);
    };
    Mirror2.prototype.replace = function(id, n2) {
      var oldNode = this.getNode(id);
      if (oldNode) {
        var meta = this.nodeMetaMap.get(oldNode);
        if (meta)
          this.nodeMetaMap.set(n2, meta);
      }
      this.idNodeMap.set(id, n2);
    };
    Mirror2.prototype.reset = function() {
      this.idNodeMap = /* @__PURE__ */ new Map();
      this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
    };
    return Mirror2;
  }();
  function createMirror() {
    return new Mirror();
  }
  function maskInputValue(_a) {
    var element = _a.element, maskInputOptions = _a.maskInputOptions, tagName = _a.tagName, type = _a.type, value = _a.value, maskInputFn = _a.maskInputFn;
    var text = value || "";
    var actualType = type && toLowerCase(type);
    if (maskInputOptions[tagName.toLowerCase()] || actualType && maskInputOptions[actualType]) {
      if (maskInputFn) {
        text = maskInputFn(text, element);
      } else {
        text = "*".repeat(text.length);
      }
    }
    return text;
  }
  function toLowerCase(str) {
    return str.toLowerCase();
  }
  var ORIGINAL_ATTRIBUTE_NAME = "__rrweb_original__";
  function is2DCanvasBlank(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx)
      return true;
    var chunkSize = 50;
    for (var x2 = 0; x2 < canvas.width; x2 += chunkSize) {
      for (var y2 = 0; y2 < canvas.height; y2 += chunkSize) {
        var getImageData = ctx.getImageData;
        var originalGetImageData = ORIGINAL_ATTRIBUTE_NAME in getImageData ? getImageData[ORIGINAL_ATTRIBUTE_NAME] : getImageData;
        var pixelBuffer = new Uint32Array(originalGetImageData.call(ctx, x2, y2, Math.min(chunkSize, canvas.width - x2), Math.min(chunkSize, canvas.height - y2)).data.buffer);
        if (pixelBuffer.some(function(pixel) {
          return pixel !== 0;
        }))
          return false;
      }
    }
    return true;
  }
  function getInputType(element) {
    var type = element.type;
    return element.hasAttribute("data-rr-is-password") ? "password" : type ? toLowerCase(type) : null;
  }
  var _id = 1;
  var tagNameRegex = new RegExp("[^a-z0-9-_:]");
  var IGNORED_NODE = -2;
  function genId() {
    return _id++;
  }
  function getValidTagName(element) {
    if (element instanceof HTMLFormElement) {
      return "form";
    }
    var processedTagName = toLowerCase(element.tagName);
    if (tagNameRegex.test(processedTagName)) {
      return "div";
    }
    return processedTagName;
  }
  function extractOrigin(url) {
    var origin = "";
    if (url.indexOf("//") > -1) {
      origin = url.split("/").slice(0, 3).join("/");
    } else {
      origin = url.split("/")[0];
    }
    origin = origin.split("?")[0];
    return origin;
  }
  var canvasService;
  var canvasCtx;
  var URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm;
  var URL_PROTOCOL_MATCH = /^(?:[a-z+]+:)?\/\//i;
  var URL_WWW_MATCH = /^www\..*/i;
  var DATA_URI = /^(data:)([^,]*),(.*)/i;
  function absoluteToStylesheet(cssText, href) {
    return (cssText || "").replace(URL_IN_CSS_REF, function(origin, quote1, path1, quote2, path2, path3) {
      var filePath = path1 || path2 || path3;
      var maybeQuote = quote1 || quote2 || "";
      if (!filePath) {
        return origin;
      }
      if (URL_PROTOCOL_MATCH.test(filePath) || URL_WWW_MATCH.test(filePath)) {
        return "url(".concat(maybeQuote).concat(filePath).concat(maybeQuote, ")");
      }
      if (DATA_URI.test(filePath)) {
        return "url(".concat(maybeQuote).concat(filePath).concat(maybeQuote, ")");
      }
      if (filePath[0] === "/") {
        return "url(".concat(maybeQuote).concat(extractOrigin(href) + filePath).concat(maybeQuote, ")");
      }
      var stack = href.split("/");
      var parts = filePath.split("/");
      stack.pop();
      for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        if (part === ".") {
          continue;
        } else if (part === "..") {
          stack.pop();
        } else {
          stack.push(part);
        }
      }
      return "url(".concat(maybeQuote).concat(stack.join("/")).concat(maybeQuote, ")");
    });
  }
  var SRCSET_NOT_SPACES = /^[^ \t\n\r\u000c]+/;
  var SRCSET_COMMAS_OR_SPACES = /^[, \t\n\r\u000c]+/;
  function getAbsoluteSrcsetString(doc, attributeValue) {
    if (attributeValue.trim() === "") {
      return attributeValue;
    }
    var pos = 0;
    function collectCharacters(regEx) {
      var chars2;
      var match = regEx.exec(attributeValue.substring(pos));
      if (match) {
        chars2 = match[0];
        pos += chars2.length;
        return chars2;
      }
      return "";
    }
    var output = [];
    while (true) {
      collectCharacters(SRCSET_COMMAS_OR_SPACES);
      if (pos >= attributeValue.length) {
        break;
      }
      var url = collectCharacters(SRCSET_NOT_SPACES);
      if (url.slice(-1) === ",") {
        url = absoluteToDoc(doc, url.substring(0, url.length - 1));
        output.push(url);
      } else {
        var descriptorsStr = "";
        url = absoluteToDoc(doc, url);
        var inParens = false;
        while (true) {
          var c2 = attributeValue.charAt(pos);
          if (c2 === "") {
            output.push((url + descriptorsStr).trim());
            break;
          } else if (!inParens) {
            if (c2 === ",") {
              pos += 1;
              output.push((url + descriptorsStr).trim());
              break;
            } else if (c2 === "(") {
              inParens = true;
            }
          } else {
            if (c2 === ")") {
              inParens = false;
            }
          }
          descriptorsStr += c2;
          pos += 1;
        }
      }
    }
    return output.join(", ");
  }
  function absoluteToDoc(doc, attributeValue) {
    if (!attributeValue || attributeValue.trim() === "") {
      return attributeValue;
    }
    var a2 = doc.createElement("a");
    a2.href = attributeValue;
    return a2.href;
  }
  function isSVGElement(el) {
    return Boolean(el.tagName === "svg" || el.ownerSVGElement);
  }
  function getHref() {
    var a2 = document.createElement("a");
    a2.href = "";
    return a2.href;
  }
  function transformAttribute(doc, tagName, name, value) {
    if (!value) {
      return value;
    }
    if (name === "src" || name === "href" && !(tagName === "use" && value[0] === "#")) {
      return absoluteToDoc(doc, value);
    } else if (name === "xlink:href" && value[0] !== "#") {
      return absoluteToDoc(doc, value);
    } else if (name === "background" && (tagName === "table" || tagName === "td" || tagName === "th")) {
      return absoluteToDoc(doc, value);
    } else if (name === "srcset") {
      return getAbsoluteSrcsetString(doc, value);
    } else if (name === "style") {
      return absoluteToStylesheet(value, getHref());
    } else if (tagName === "object" && name === "data") {
      return absoluteToDoc(doc, value);
    }
    return value;
  }
  function ignoreAttribute(tagName, name, _value) {
    return (tagName === "video" || tagName === "audio") && name === "autoplay";
  }
  function _isBlockedElement(element, blockClass, blockSelector) {
    try {
      if (typeof blockClass === "string") {
        if (element.classList.contains(blockClass)) {
          return true;
        }
      } else {
        for (var eIndex = element.classList.length; eIndex--; ) {
          var className = element.classList[eIndex];
          if (blockClass.test(className)) {
            return true;
          }
        }
      }
      if (blockSelector) {
        return element.matches(blockSelector);
      }
    } catch (e2) {
    }
    return false;
  }
  function classMatchesRegex(node, regex, checkAncestors) {
    if (!node)
      return false;
    if (node.nodeType !== node.ELEMENT_NODE) {
      if (!checkAncestors)
        return false;
      return classMatchesRegex(node.parentNode, regex, checkAncestors);
    }
    for (var eIndex = node.classList.length; eIndex--; ) {
      var className = node.classList[eIndex];
      if (regex.test(className)) {
        return true;
      }
    }
    if (!checkAncestors)
      return false;
    return classMatchesRegex(node.parentNode, regex, checkAncestors);
  }
  function needMaskingText(node, maskTextClass, maskTextSelector) {
    try {
      var el = node.nodeType === node.ELEMENT_NODE ? node : node.parentElement;
      if (el === null)
        return false;
      if (typeof maskTextClass === "string") {
        if (el.classList.contains(maskTextClass))
          return true;
        if (el.closest(".".concat(maskTextClass)))
          return true;
      } else {
        if (classMatchesRegex(el, maskTextClass, true))
          return true;
      }
      if (maskTextSelector) {
        if (el.matches(maskTextSelector))
          return true;
        if (el.closest(maskTextSelector))
          return true;
      }
    } catch (e2) {
    }
    return false;
  }
  function onceIframeLoaded(iframeEl, listener, iframeLoadTimeout) {
    var win = iframeEl.contentWindow;
    if (!win) {
      return;
    }
    var fired = false;
    var readyState;
    try {
      readyState = win.document.readyState;
    } catch (error) {
      return;
    }
    if (readyState !== "complete") {
      var timer_1 = setTimeout(function() {
        if (!fired) {
          listener();
          fired = true;
        }
      }, iframeLoadTimeout);
      iframeEl.addEventListener("load", function() {
        clearTimeout(timer_1);
        fired = true;
        listener();
      });
      return;
    }
    var blankUrl = "about:blank";
    if (win.location.href !== blankUrl || iframeEl.src === blankUrl || iframeEl.src === "") {
      setTimeout(listener, 0);
      return iframeEl.addEventListener("load", listener);
    }
    iframeEl.addEventListener("load", listener);
  }
  function onceStylesheetLoaded(link, listener, styleSheetLoadTimeout) {
    var fired = false;
    var styleSheetLoaded;
    try {
      styleSheetLoaded = link.sheet;
    } catch (error) {
      return;
    }
    if (styleSheetLoaded)
      return;
    var timer = setTimeout(function() {
      if (!fired) {
        listener();
        fired = true;
      }
    }, styleSheetLoadTimeout);
    link.addEventListener("load", function() {
      clearTimeout(timer);
      fired = true;
      listener();
    });
  }
  function serializeNode(n2, options) {
    var doc = options.doc, mirror2 = options.mirror, blockClass = options.blockClass, blockSelector = options.blockSelector, maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, inlineStylesheet = options.inlineStylesheet, _a = options.maskInputOptions, maskInputOptions = _a === void 0 ? {} : _a, maskTextFn = options.maskTextFn, maskInputFn = options.maskInputFn, _b = options.dataURLOptions, dataURLOptions = _b === void 0 ? {} : _b, inlineImages = options.inlineImages, recordCanvas = options.recordCanvas, keepIframeSrcFn = options.keepIframeSrcFn, _c = options.newlyAddedElement, newlyAddedElement = _c === void 0 ? false : _c;
    var rootId = getRootId(doc, mirror2);
    switch (n2.nodeType) {
      case n2.DOCUMENT_NODE:
        if (n2.compatMode !== "CSS1Compat") {
          return {
            type: NodeType.Document,
            childNodes: [],
            compatMode: n2.compatMode
          };
        } else {
          return {
            type: NodeType.Document,
            childNodes: []
          };
        }
      case n2.DOCUMENT_TYPE_NODE:
        return {
          type: NodeType.DocumentType,
          name: n2.name,
          publicId: n2.publicId,
          systemId: n2.systemId,
          rootId
        };
      case n2.ELEMENT_NODE:
        return serializeElementNode(n2, {
          doc,
          blockClass,
          blockSelector,
          inlineStylesheet,
          maskInputOptions,
          maskInputFn,
          dataURLOptions,
          inlineImages,
          recordCanvas,
          keepIframeSrcFn,
          newlyAddedElement,
          rootId
        });
      case n2.TEXT_NODE:
        return serializeTextNode(n2, {
          maskTextClass,
          maskTextSelector,
          maskTextFn,
          rootId
        });
      case n2.CDATA_SECTION_NODE:
        return {
          type: NodeType.CDATA,
          textContent: "",
          rootId
        };
      case n2.COMMENT_NODE:
        return {
          type: NodeType.Comment,
          textContent: n2.textContent || "",
          rootId
        };
      default:
        return false;
    }
  }
  function getRootId(doc, mirror2) {
    if (!mirror2.hasNode(doc))
      return void 0;
    var docId = mirror2.getId(doc);
    return docId === 1 ? void 0 : docId;
  }
  function serializeTextNode(n2, options) {
    var _a;
    var maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, maskTextFn = options.maskTextFn, rootId = options.rootId;
    var parentTagName = n2.parentNode && n2.parentNode.tagName;
    var textContent = n2.textContent;
    var isStyle = parentTagName === "STYLE" ? true : void 0;
    var isScript = parentTagName === "SCRIPT" ? true : void 0;
    if (isStyle && textContent) {
      try {
        if (n2.nextSibling || n2.previousSibling) {
        } else if ((_a = n2.parentNode.sheet) === null || _a === void 0 ? void 0 : _a.cssRules) {
          textContent = stringifyStylesheet(n2.parentNode.sheet);
        }
      } catch (err) {
        console.warn("Cannot get CSS styles from text's parentNode. Error: ".concat(err), n2);
      }
      textContent = absoluteToStylesheet(textContent, getHref());
    }
    if (isScript) {
      textContent = "SCRIPT_PLACEHOLDER";
    }
    if (!isStyle && !isScript && textContent && needMaskingText(n2, maskTextClass, maskTextSelector)) {
      textContent = maskTextFn ? maskTextFn(textContent) : textContent.replace(/[\S]/g, "*");
    }
    return {
      type: NodeType.Text,
      textContent: textContent || "",
      isStyle,
      rootId
    };
  }
  function serializeElementNode(n2, options) {
    var doc = options.doc, blockClass = options.blockClass, blockSelector = options.blockSelector, inlineStylesheet = options.inlineStylesheet, _a = options.maskInputOptions, maskInputOptions = _a === void 0 ? {} : _a, maskInputFn = options.maskInputFn, _b = options.dataURLOptions, dataURLOptions = _b === void 0 ? {} : _b, inlineImages = options.inlineImages, recordCanvas = options.recordCanvas, keepIframeSrcFn = options.keepIframeSrcFn, _c = options.newlyAddedElement, newlyAddedElement = _c === void 0 ? false : _c, rootId = options.rootId;
    var needBlock = _isBlockedElement(n2, blockClass, blockSelector);
    var tagName = getValidTagName(n2);
    var attributes = {};
    var len = n2.attributes.length;
    for (var i2 = 0; i2 < len; i2++) {
      var attr = n2.attributes[i2];
      if (!ignoreAttribute(tagName, attr.name, attr.value)) {
        attributes[attr.name] = transformAttribute(doc, tagName, toLowerCase(attr.name), attr.value);
      }
    }
    if (tagName === "link" && inlineStylesheet) {
      var stylesheet = Array.from(doc.styleSheets).find(function(s2) {
        return s2.href === n2.href;
      });
      var cssText = null;
      if (stylesheet) {
        cssText = stringifyStylesheet(stylesheet);
      }
      if (cssText) {
        delete attributes.rel;
        delete attributes.href;
        attributes._cssText = absoluteToStylesheet(cssText, stylesheet.href);
      }
    }
    if (tagName === "style" && n2.sheet && !(n2.innerText || n2.textContent || "").trim().length) {
      var cssText = stringifyStylesheet(n2.sheet);
      if (cssText) {
        attributes._cssText = absoluteToStylesheet(cssText, getHref());
      }
    }
    if (tagName === "input" || tagName === "textarea" || tagName === "select") {
      var value = n2.value;
      var checked = n2.checked;
      if (attributes.type !== "radio" && attributes.type !== "checkbox" && attributes.type !== "submit" && attributes.type !== "button" && value) {
        var type = getInputType(n2);
        attributes.value = maskInputValue({
          element: n2,
          type,
          tagName,
          value,
          maskInputOptions,
          maskInputFn
        });
      } else if (checked) {
        attributes.checked = checked;
      }
    }
    if (tagName === "option") {
      if (n2.selected && !maskInputOptions["select"]) {
        attributes.selected = true;
      } else {
        delete attributes.selected;
      }
    }
    if (tagName === "canvas" && recordCanvas) {
      if (n2.__context === "2d") {
        if (!is2DCanvasBlank(n2)) {
          attributes.rr_dataURL = n2.toDataURL(dataURLOptions.type, dataURLOptions.quality);
        }
      } else if (!("__context" in n2)) {
        var canvasDataURL = n2.toDataURL(dataURLOptions.type, dataURLOptions.quality);
        var blankCanvas = document.createElement("canvas");
        blankCanvas.width = n2.width;
        blankCanvas.height = n2.height;
        var blankCanvasDataURL = blankCanvas.toDataURL(dataURLOptions.type, dataURLOptions.quality);
        if (canvasDataURL !== blankCanvasDataURL) {
          attributes.rr_dataURL = canvasDataURL;
        }
      }
    }
    if (tagName === "img" && inlineImages) {
      if (!canvasService) {
        canvasService = doc.createElement("canvas");
        canvasCtx = canvasService.getContext("2d");
      }
      var image_1 = n2;
      var oldValue_1 = image_1.crossOrigin;
      image_1.crossOrigin = "anonymous";
      var recordInlineImage_1 = function() {
        image_1.removeEventListener("load", recordInlineImage_1);
        try {
          canvasService.width = image_1.naturalWidth;
          canvasService.height = image_1.naturalHeight;
          canvasCtx.drawImage(image_1, 0, 0);
          attributes.rr_dataURL = canvasService.toDataURL(dataURLOptions.type, dataURLOptions.quality);
        } catch (err) {
          console.warn("Cannot inline img src=".concat(image_1.currentSrc, "! Error: ").concat(err));
        }
        oldValue_1 ? attributes.crossOrigin = oldValue_1 : image_1.removeAttribute("crossorigin");
      };
      if (image_1.complete && image_1.naturalWidth !== 0)
        recordInlineImage_1();
      else
        image_1.addEventListener("load", recordInlineImage_1);
    }
    if (tagName === "audio" || tagName === "video") {
      attributes.rr_mediaState = n2.paused ? "paused" : "played";
      attributes.rr_mediaCurrentTime = n2.currentTime;
    }
    if (!newlyAddedElement) {
      if (n2.scrollLeft) {
        attributes.rr_scrollLeft = n2.scrollLeft;
      }
      if (n2.scrollTop) {
        attributes.rr_scrollTop = n2.scrollTop;
      }
    }
    if (needBlock) {
      var _d = n2.getBoundingClientRect(), width = _d.width, height = _d.height;
      attributes = {
        "class": attributes["class"],
        rr_width: "".concat(width, "px"),
        rr_height: "".concat(height, "px")
      };
    }
    if (tagName === "iframe" && !keepIframeSrcFn(attributes.src)) {
      if (!n2.contentDocument) {
        attributes.rr_src = attributes.src;
      }
      delete attributes.src;
    }
    return {
      type: NodeType.Element,
      tagName,
      attributes,
      childNodes: [],
      isSVG: isSVGElement(n2) || void 0,
      needBlock,
      rootId
    };
  }
  function lowerIfExists(maybeAttr) {
    if (maybeAttr === void 0 || maybeAttr === null) {
      return "";
    } else {
      return maybeAttr.toLowerCase();
    }
  }
  function slimDOMExcluded(sn, slimDOMOptions) {
    if (slimDOMOptions.comment && sn.type === NodeType.Comment) {
      return true;
    } else if (sn.type === NodeType.Element) {
      if (slimDOMOptions.script && (sn.tagName === "script" || sn.tagName === "link" && (sn.attributes.rel === "preload" || sn.attributes.rel === "modulepreload") && sn.attributes.as === "script" || sn.tagName === "link" && sn.attributes.rel === "prefetch" && typeof sn.attributes.href === "string" && sn.attributes.href.endsWith(".js"))) {
        return true;
      } else if (slimDOMOptions.headFavicon && (sn.tagName === "link" && sn.attributes.rel === "shortcut icon" || sn.tagName === "meta" && (lowerIfExists(sn.attributes.name).match(/^msapplication-tile(image|color)$/) || lowerIfExists(sn.attributes.name) === "application-name" || lowerIfExists(sn.attributes.rel) === "icon" || lowerIfExists(sn.attributes.rel) === "apple-touch-icon" || lowerIfExists(sn.attributes.rel) === "shortcut icon"))) {
        return true;
      } else if (sn.tagName === "meta") {
        if (slimDOMOptions.headMetaDescKeywords && lowerIfExists(sn.attributes.name).match(/^description|keywords$/)) {
          return true;
        } else if (slimDOMOptions.headMetaSocial && (lowerIfExists(sn.attributes.property).match(/^(og|twitter|fb):/) || lowerIfExists(sn.attributes.name).match(/^(og|twitter):/) || lowerIfExists(sn.attributes.name) === "pinterest")) {
          return true;
        } else if (slimDOMOptions.headMetaRobots && (lowerIfExists(sn.attributes.name) === "robots" || lowerIfExists(sn.attributes.name) === "googlebot" || lowerIfExists(sn.attributes.name) === "bingbot")) {
          return true;
        } else if (slimDOMOptions.headMetaHttpEquiv && sn.attributes["http-equiv"] !== void 0) {
          return true;
        } else if (slimDOMOptions.headMetaAuthorship && (lowerIfExists(sn.attributes.name) === "author" || lowerIfExists(sn.attributes.name) === "generator" || lowerIfExists(sn.attributes.name) === "framework" || lowerIfExists(sn.attributes.name) === "publisher" || lowerIfExists(sn.attributes.name) === "progid" || lowerIfExists(sn.attributes.property).match(/^article:/) || lowerIfExists(sn.attributes.property).match(/^product:/))) {
          return true;
        } else if (slimDOMOptions.headMetaVerification && (lowerIfExists(sn.attributes.name) === "google-site-verification" || lowerIfExists(sn.attributes.name) === "yandex-verification" || lowerIfExists(sn.attributes.name) === "csrf-token" || lowerIfExists(sn.attributes.name) === "p:domain_verify" || lowerIfExists(sn.attributes.name) === "verify-v1" || lowerIfExists(sn.attributes.name) === "verification" || lowerIfExists(sn.attributes.name) === "shopify-checkout-api-token")) {
          return true;
        }
      }
    }
    return false;
  }
  function serializeNodeWithId(n2, options) {
    var doc = options.doc, mirror2 = options.mirror, blockClass = options.blockClass, blockSelector = options.blockSelector, maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, _a = options.skipChild, skipChild = _a === void 0 ? false : _a, _b = options.inlineStylesheet, inlineStylesheet = _b === void 0 ? true : _b, _c = options.maskInputOptions, maskInputOptions = _c === void 0 ? {} : _c, maskTextFn = options.maskTextFn, maskInputFn = options.maskInputFn, slimDOMOptions = options.slimDOMOptions, _d = options.dataURLOptions, dataURLOptions = _d === void 0 ? {} : _d, _e = options.inlineImages, inlineImages = _e === void 0 ? false : _e, _f = options.recordCanvas, recordCanvas = _f === void 0 ? false : _f, onSerialize = options.onSerialize, onIframeLoad = options.onIframeLoad, _g = options.iframeLoadTimeout, iframeLoadTimeout = _g === void 0 ? 5e3 : _g, onStylesheetLoad = options.onStylesheetLoad, _h = options.stylesheetLoadTimeout, stylesheetLoadTimeout = _h === void 0 ? 5e3 : _h, _j = options.keepIframeSrcFn, keepIframeSrcFn = _j === void 0 ? function() {
      return false;
    } : _j, _k = options.newlyAddedElement, newlyAddedElement = _k === void 0 ? false : _k;
    var _l = options.preserveWhiteSpace, preserveWhiteSpace = _l === void 0 ? true : _l;
    var _serializedNode = serializeNode(n2, {
      doc,
      mirror: mirror2,
      blockClass,
      blockSelector,
      maskTextClass,
      maskTextSelector,
      inlineStylesheet,
      maskInputOptions,
      maskTextFn,
      maskInputFn,
      dataURLOptions,
      inlineImages,
      recordCanvas,
      keepIframeSrcFn,
      newlyAddedElement
    });
    if (!_serializedNode) {
      console.warn(n2, "not serialized");
      return null;
    }
    var id;
    if (mirror2.hasNode(n2)) {
      id = mirror2.getId(n2);
    } else if (slimDOMExcluded(_serializedNode, slimDOMOptions) || !preserveWhiteSpace && _serializedNode.type === NodeType.Text && !_serializedNode.isStyle && !_serializedNode.textContent.replace(/^\s+|\s+$/gm, "").length) {
      id = IGNORED_NODE;
    } else {
      id = genId();
    }
    var serializedNode = Object.assign(_serializedNode, { id });
    mirror2.add(n2, serializedNode);
    if (id === IGNORED_NODE) {
      return null;
    }
    if (onSerialize) {
      onSerialize(n2);
    }
    var recordChild = !skipChild;
    if (serializedNode.type === NodeType.Element) {
      recordChild = recordChild && !serializedNode.needBlock;
      delete serializedNode.needBlock;
      var shadowRoot = n2.shadowRoot;
      if (shadowRoot && isNativeShadowDom(shadowRoot))
        serializedNode.isShadowHost = true;
    }
    if ((serializedNode.type === NodeType.Document || serializedNode.type === NodeType.Element) && recordChild) {
      if (slimDOMOptions.headWhitespace && serializedNode.type === NodeType.Element && serializedNode.tagName === "head") {
        preserveWhiteSpace = false;
      }
      var bypassOptions = {
        doc,
        mirror: mirror2,
        blockClass,
        blockSelector,
        maskTextClass,
        maskTextSelector,
        skipChild,
        inlineStylesheet,
        maskInputOptions,
        maskTextFn,
        maskInputFn,
        slimDOMOptions,
        dataURLOptions,
        inlineImages,
        recordCanvas,
        preserveWhiteSpace,
        onSerialize,
        onIframeLoad,
        iframeLoadTimeout,
        onStylesheetLoad,
        stylesheetLoadTimeout,
        keepIframeSrcFn
      };
      for (var _i = 0, _m = Array.from(n2.childNodes); _i < _m.length; _i++) {
        var childN = _m[_i];
        var serializedChildNode = serializeNodeWithId(childN, bypassOptions);
        if (serializedChildNode) {
          serializedNode.childNodes.push(serializedChildNode);
        }
      }
      if (isElement(n2) && n2.shadowRoot) {
        for (var _o = 0, _p = Array.from(n2.shadowRoot.childNodes); _o < _p.length; _o++) {
          var childN = _p[_o];
          var serializedChildNode = serializeNodeWithId(childN, bypassOptions);
          if (serializedChildNode) {
            isNativeShadowDom(n2.shadowRoot) && (serializedChildNode.isShadow = true);
            serializedNode.childNodes.push(serializedChildNode);
          }
        }
      }
    }
    if (n2.parentNode && isShadowRoot(n2.parentNode) && isNativeShadowDom(n2.parentNode)) {
      serializedNode.isShadow = true;
    }
    if (serializedNode.type === NodeType.Element && serializedNode.tagName === "iframe") {
      onceIframeLoaded(n2, function() {
        var iframeDoc = n2.contentDocument;
        if (iframeDoc && onIframeLoad) {
          var serializedIframeNode = serializeNodeWithId(iframeDoc, {
            doc: iframeDoc,
            mirror: mirror2,
            blockClass,
            blockSelector,
            maskTextClass,
            maskTextSelector,
            skipChild: false,
            inlineStylesheet,
            maskInputOptions,
            maskTextFn,
            maskInputFn,
            slimDOMOptions,
            dataURLOptions,
            inlineImages,
            recordCanvas,
            preserveWhiteSpace,
            onSerialize,
            onIframeLoad,
            iframeLoadTimeout,
            onStylesheetLoad,
            stylesheetLoadTimeout,
            keepIframeSrcFn
          });
          if (serializedIframeNode) {
            onIframeLoad(n2, serializedIframeNode);
          }
        }
      }, iframeLoadTimeout);
    }
    if (serializedNode.type === NodeType.Element && serializedNode.tagName === "link" && serializedNode.attributes.rel === "stylesheet") {
      onceStylesheetLoaded(n2, function() {
        if (onStylesheetLoad) {
          var serializedLinkNode = serializeNodeWithId(n2, {
            doc,
            mirror: mirror2,
            blockClass,
            blockSelector,
            maskTextClass,
            maskTextSelector,
            skipChild: false,
            inlineStylesheet,
            maskInputOptions,
            maskTextFn,
            maskInputFn,
            slimDOMOptions,
            dataURLOptions,
            inlineImages,
            recordCanvas,
            preserveWhiteSpace,
            onSerialize,
            onIframeLoad,
            iframeLoadTimeout,
            onStylesheetLoad,
            stylesheetLoadTimeout,
            keepIframeSrcFn
          });
          if (serializedLinkNode) {
            onStylesheetLoad(n2, serializedLinkNode);
          }
        }
      }, stylesheetLoadTimeout);
    }
    return serializedNode;
  }
  function snapshot(n2, options) {
    var _a = options || {}, _b = _a.mirror, mirror2 = _b === void 0 ? new Mirror() : _b, _c = _a.blockClass, blockClass = _c === void 0 ? "rr-block" : _c, _d = _a.blockSelector, blockSelector = _d === void 0 ? null : _d, _e = _a.maskTextClass, maskTextClass = _e === void 0 ? "rr-mask" : _e, _f = _a.maskTextSelector, maskTextSelector = _f === void 0 ? null : _f, _g = _a.inlineStylesheet, inlineStylesheet = _g === void 0 ? true : _g, _h = _a.inlineImages, inlineImages = _h === void 0 ? false : _h, _j = _a.recordCanvas, recordCanvas = _j === void 0 ? false : _j, _k = _a.maskAllInputs, maskAllInputs = _k === void 0 ? false : _k, maskTextFn = _a.maskTextFn, maskInputFn = _a.maskInputFn, _l = _a.slimDOM, slimDOM = _l === void 0 ? false : _l, dataURLOptions = _a.dataURLOptions, preserveWhiteSpace = _a.preserveWhiteSpace, onSerialize = _a.onSerialize, onIframeLoad = _a.onIframeLoad, iframeLoadTimeout = _a.iframeLoadTimeout, onStylesheetLoad = _a.onStylesheetLoad, stylesheetLoadTimeout = _a.stylesheetLoadTimeout, _m = _a.keepIframeSrcFn, keepIframeSrcFn = _m === void 0 ? function() {
      return false;
    } : _m;
    var maskInputOptions = maskAllInputs === true ? {
      color: true,
      date: true,
      "datetime-local": true,
      email: true,
      month: true,
      number: true,
      range: true,
      search: true,
      tel: true,
      text: true,
      time: true,
      url: true,
      week: true,
      textarea: true,
      select: true,
      password: true
    } : maskAllInputs === false ? {
      password: true
    } : maskAllInputs;
    var slimDOMOptions = slimDOM === true || slimDOM === "all" ? {
      script: true,
      comment: true,
      headFavicon: true,
      headWhitespace: true,
      headMetaDescKeywords: slimDOM === "all",
      headMetaSocial: true,
      headMetaRobots: true,
      headMetaHttpEquiv: true,
      headMetaAuthorship: true,
      headMetaVerification: true
    } : slimDOM === false ? {} : slimDOM;
    return serializeNodeWithId(n2, {
      doc: n2,
      mirror: mirror2,
      blockClass,
      blockSelector,
      maskTextClass,
      maskTextSelector,
      skipChild: false,
      inlineStylesheet,
      maskInputOptions,
      maskTextFn,
      maskInputFn,
      slimDOMOptions,
      dataURLOptions,
      inlineImages,
      recordCanvas,
      preserveWhiteSpace,
      onSerialize,
      onIframeLoad,
      iframeLoadTimeout,
      onStylesheetLoad,
      stylesheetLoadTimeout,
      keepIframeSrcFn,
      newlyAddedElement: false
    });
  }
  var HOVER_SELECTOR = /([^\\]):hover/;
  var HOVER_SELECTOR_GLOBAL = new RegExp(HOVER_SELECTOR.source, "g");

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb/src/utils.js
  function on(type, fn, target = document) {
    const options = { capture: true, passive: true };
    target.addEventListener(type, fn, options);
    return () => target.removeEventListener(type, fn, options);
  }
  var DEPARTED_MIRROR_ACCESS_WARNING = "Please stop import mirror directly. Instead of that,\r\nnow you can use replayer.getMirror() to access the mirror instance of a replayer,\r\nor you can use record.mirror to access the mirror instance during recording.";
  var _mirror = {
    map: {},
    getId() {
      console.error(DEPARTED_MIRROR_ACCESS_WARNING);
      return -1;
    },
    getNode() {
      console.error(DEPARTED_MIRROR_ACCESS_WARNING);
      return null;
    },
    removeNodeFromMap() {
      console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    },
    has() {
      console.error(DEPARTED_MIRROR_ACCESS_WARNING);
      return false;
    },
    reset() {
      console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    }
  };
  if (typeof window !== "undefined" && window.Proxy && window.Reflect) {
    _mirror = new Proxy(_mirror, {
      get(target, prop, receiver) {
        if (prop === "map") {
          console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        }
        return Reflect.get(target, prop, receiver);
      }
    });
  }
  function throttle(func, wait, options = {}) {
    let timeout = null;
    let previous = 0;
    return function(...args) {
      const now = Date.now();
      if (!previous && options.leading === false) {
        previous = now;
      }
      const remaining = wait - (now - previous);
      const context = this;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(() => {
          previous = options.leading === false ? 0 : Date.now();
          timeout = null;
          func.apply(context, args);
        }, remaining);
      }
    };
  }
  function hookSetter(target, key, d2, isRevoked, win = window) {
    const original = win.Object.getOwnPropertyDescriptor(target, key);
    win.Object.defineProperty(target, key, isRevoked ? d2 : {
      set(value) {
        setTimeout(() => {
          d2.set.call(this, value);
        }, 0);
        if (original && original.set) {
          original.set.call(this, value);
        }
      }
    });
    return () => hookSetter(target, key, original || {}, true);
  }
  function patch(source, name, replacement) {
    try {
      if (!(name in source)) {
        return () => {
        };
      }
      const original = source[name];
      const wrapped = replacement(original);
      if (typeof wrapped === "function") {
        wrapped.prototype = wrapped.prototype || {};
        Object.defineProperties(wrapped, {
          __rrweb_original__: {
            enumerable: false,
            value: original
          }
        });
      }
      source[name] = wrapped;
      return () => {
        source[name] = original;
      };
    } catch (_a) {
      return () => {
      };
    }
  }
  var nowTimestamp = Date.now;
  if (!/[1-9][0-9]{12}/.test(Date.now().toString())) {
    nowTimestamp = () => (/* @__PURE__ */ new Date()).getTime();
  }
  function getWindowScroll(win) {
    var _a, _b, _c, _d, _e, _f;
    const doc = win.document;
    return {
      left: doc.scrollingElement ? doc.scrollingElement.scrollLeft : win.pageXOffset !== void 0 ? win.pageXOffset : (doc === null || doc === void 0 ? void 0 : doc.documentElement.scrollLeft) || ((_b = (_a = doc === null || doc === void 0 ? void 0 : doc.body) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.scrollLeft) || ((_c = doc === null || doc === void 0 ? void 0 : doc.body) === null || _c === void 0 ? void 0 : _c.scrollLeft) || 0,
      top: doc.scrollingElement ? doc.scrollingElement.scrollTop : win.pageYOffset !== void 0 ? win.pageYOffset : (doc === null || doc === void 0 ? void 0 : doc.documentElement.scrollTop) || ((_e = (_d = doc === null || doc === void 0 ? void 0 : doc.body) === null || _d === void 0 ? void 0 : _d.parentElement) === null || _e === void 0 ? void 0 : _e.scrollTop) || ((_f = doc === null || doc === void 0 ? void 0 : doc.body) === null || _f === void 0 ? void 0 : _f.scrollTop) || 0
    };
  }
  function getWindowHeight() {
    return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
  }
  function getWindowWidth() {
    return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
  }
  function isBlocked(node, blockClass, blockSelector, checkAncestors) {
    if (!node) {
      return false;
    }
    const el = node.nodeType === node.ELEMENT_NODE ? node : node.parentElement;
    if (!el)
      return false;
    try {
      if (typeof blockClass === "string") {
        if (el.classList.contains(blockClass))
          return true;
        if (checkAncestors && el.closest("." + blockClass) !== null)
          return true;
      } else {
        if (classMatchesRegex(el, blockClass, checkAncestors))
          return true;
      }
    } catch (e2) {
    }
    if (blockSelector) {
      if (el.matches(blockSelector))
        return true;
      if (checkAncestors && el.closest(blockSelector) !== null)
        return true;
    }
    return false;
  }
  function isSerialized(n2, mirror2) {
    return mirror2.getId(n2) !== -1;
  }
  function isIgnored(n2, mirror2) {
    return mirror2.getId(n2) === IGNORED_NODE;
  }
  function isAncestorRemoved(target, mirror2) {
    if (isShadowRoot(target)) {
      return false;
    }
    const id = mirror2.getId(target);
    if (!mirror2.has(id)) {
      return true;
    }
    if (target.parentNode && target.parentNode.nodeType === target.DOCUMENT_NODE) {
      return false;
    }
    if (!target.parentNode) {
      return true;
    }
    return isAncestorRemoved(target.parentNode, mirror2);
  }
  function legacy_isTouchEvent(event) {
    return Boolean(event.changedTouches);
  }
  function polyfill(win = window) {
    if ("NodeList" in win && !win.NodeList.prototype.forEach) {
      win.NodeList.prototype.forEach = Array.prototype.forEach;
    }
    if ("DOMTokenList" in win && !win.DOMTokenList.prototype.forEach) {
      win.DOMTokenList.prototype.forEach = Array.prototype.forEach;
    }
    if (!Node.prototype.contains) {
      Node.prototype.contains = (...args) => {
        let node = args[0];
        if (!(0 in args)) {
          throw new TypeError("1 argument is required");
        }
        do {
          if (this === node) {
            return true;
          }
        } while (node = node && node.parentNode);
        return false;
      };
    }
  }
  function isSerializedIframe(n2, mirror2) {
    return Boolean(n2.nodeName === "IFRAME" && mirror2.getMeta(n2));
  }
  function isSerializedStylesheet(n2, mirror2) {
    return Boolean(n2.nodeName === "LINK" && n2.nodeType === n2.ELEMENT_NODE && n2.getAttribute && n2.getAttribute("rel") === "stylesheet" && mirror2.getMeta(n2));
  }
  function hasShadowRoot(n2) {
    return Boolean(n2 === null || n2 === void 0 ? void 0 : n2.shadowRoot);
  }
  var StyleSheetMirror = class {
    constructor() {
      this.id = 1;
      this.styleIDMap = /* @__PURE__ */ new WeakMap();
      this.idStyleMap = /* @__PURE__ */ new Map();
    }
    getId(stylesheet) {
      var _a;
      return (_a = this.styleIDMap.get(stylesheet)) !== null && _a !== void 0 ? _a : -1;
    }
    has(stylesheet) {
      return this.styleIDMap.has(stylesheet);
    }
    add(stylesheet, id) {
      if (this.has(stylesheet))
        return this.getId(stylesheet);
      let newId;
      if (id === void 0) {
        newId = this.id++;
      } else
        newId = id;
      this.styleIDMap.set(stylesheet, newId);
      this.idStyleMap.set(newId, stylesheet);
      return newId;
    }
    getStyle(id) {
      return this.idStyleMap.get(id) || null;
    }
    reset() {
      this.styleIDMap = /* @__PURE__ */ new WeakMap();
      this.idStyleMap = /* @__PURE__ */ new Map();
      this.id = 1;
    }
    generateId() {
      return this.id++;
    }
  };
  function getShadowHost(n2) {
    var _a, _b;
    let shadowHost = null;
    if (((_b = (_a = n2.getRootNode) === null || _a === void 0 ? void 0 : _a.call(n2)) === null || _b === void 0 ? void 0 : _b.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && n2.getRootNode().host)
      shadowHost = n2.getRootNode().host;
    return shadowHost;
  }
  function getRootShadowHost(n2) {
    let rootShadowHost = n2;
    let shadowHost;
    while (shadowHost = getShadowHost(rootShadowHost))
      rootShadowHost = shadowHost;
    return rootShadowHost;
  }
  function shadowHostInDom(n2) {
    const doc = n2.ownerDocument;
    if (!doc)
      return false;
    const shadowHost = getRootShadowHost(n2);
    return doc.contains(shadowHost);
  }
  function inDom(n2) {
    const doc = n2.ownerDocument;
    if (!doc)
      return false;
    return doc.contains(n2) || shadowHostInDom(n2);
  }

  // ../../node_modules/rrweb/es/rrweb/packages/types/dist/types.js
  var EventType = /* @__PURE__ */ ((EventType2) => {
    EventType2[EventType2["DomContentLoaded"] = 0] = "DomContentLoaded";
    EventType2[EventType2["Load"] = 1] = "Load";
    EventType2[EventType2["FullSnapshot"] = 2] = "FullSnapshot";
    EventType2[EventType2["IncrementalSnapshot"] = 3] = "IncrementalSnapshot";
    EventType2[EventType2["Meta"] = 4] = "Meta";
    EventType2[EventType2["Custom"] = 5] = "Custom";
    EventType2[EventType2["Plugin"] = 6] = "Plugin";
    return EventType2;
  })(EventType || {});
  var IncrementalSource = /* @__PURE__ */ ((IncrementalSource2) => {
    IncrementalSource2[IncrementalSource2["Mutation"] = 0] = "Mutation";
    IncrementalSource2[IncrementalSource2["MouseMove"] = 1] = "MouseMove";
    IncrementalSource2[IncrementalSource2["MouseInteraction"] = 2] = "MouseInteraction";
    IncrementalSource2[IncrementalSource2["Scroll"] = 3] = "Scroll";
    IncrementalSource2[IncrementalSource2["ViewportResize"] = 4] = "ViewportResize";
    IncrementalSource2[IncrementalSource2["Input"] = 5] = "Input";
    IncrementalSource2[IncrementalSource2["TouchMove"] = 6] = "TouchMove";
    IncrementalSource2[IncrementalSource2["MediaInteraction"] = 7] = "MediaInteraction";
    IncrementalSource2[IncrementalSource2["StyleSheetRule"] = 8] = "StyleSheetRule";
    IncrementalSource2[IncrementalSource2["CanvasMutation"] = 9] = "CanvasMutation";
    IncrementalSource2[IncrementalSource2["Font"] = 10] = "Font";
    IncrementalSource2[IncrementalSource2["Log"] = 11] = "Log";
    IncrementalSource2[IncrementalSource2["Drag"] = 12] = "Drag";
    IncrementalSource2[IncrementalSource2["StyleDeclaration"] = 13] = "StyleDeclaration";
    IncrementalSource2[IncrementalSource2["Selection"] = 14] = "Selection";
    IncrementalSource2[IncrementalSource2["AdoptedStyleSheet"] = 15] = "AdoptedStyleSheet";
    return IncrementalSource2;
  })(IncrementalSource || {});
  var MouseInteractions = /* @__PURE__ */ ((MouseInteractions2) => {
    MouseInteractions2[MouseInteractions2["MouseUp"] = 0] = "MouseUp";
    MouseInteractions2[MouseInteractions2["MouseDown"] = 1] = "MouseDown";
    MouseInteractions2[MouseInteractions2["Click"] = 2] = "Click";
    MouseInteractions2[MouseInteractions2["ContextMenu"] = 3] = "ContextMenu";
    MouseInteractions2[MouseInteractions2["DblClick"] = 4] = "DblClick";
    MouseInteractions2[MouseInteractions2["Focus"] = 5] = "Focus";
    MouseInteractions2[MouseInteractions2["Blur"] = 6] = "Blur";
    MouseInteractions2[MouseInteractions2["TouchStart"] = 7] = "TouchStart";
    MouseInteractions2[MouseInteractions2["TouchMove_Departed"] = 8] = "TouchMove_Departed";
    MouseInteractions2[MouseInteractions2["TouchEnd"] = 9] = "TouchEnd";
    MouseInteractions2[MouseInteractions2["TouchCancel"] = 10] = "TouchCancel";
    return MouseInteractions2;
  })(MouseInteractions || {});
  var PointerTypes = /* @__PURE__ */ ((PointerTypes2) => {
    PointerTypes2[PointerTypes2["Mouse"] = 0] = "Mouse";
    PointerTypes2[PointerTypes2["Pen"] = 1] = "Pen";
    PointerTypes2[PointerTypes2["Touch"] = 2] = "Touch";
    return PointerTypes2;
  })(PointerTypes || {});
  var CanvasContext = /* @__PURE__ */ ((CanvasContext2) => {
    CanvasContext2[CanvasContext2["2D"] = 0] = "2D";
    CanvasContext2[CanvasContext2["WebGL"] = 1] = "WebGL";
    CanvasContext2[CanvasContext2["WebGL2"] = 2] = "WebGL2";
    return CanvasContext2;
  })(CanvasContext || {});

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb/src/record/mutation.js
  function isNodeInLinkedList(n2) {
    return "__ln" in n2;
  }
  var DoubleLinkedList = class {
    constructor() {
      this.length = 0;
      this.head = null;
      this.tail = null;
    }
    get(position) {
      if (position >= this.length) {
        throw new Error("Position outside of list range");
      }
      let current = this.head;
      for (let index = 0; index < position; index++) {
        current = (current === null || current === void 0 ? void 0 : current.next) || null;
      }
      return current;
    }
    addNode(n2) {
      const node = {
        value: n2,
        previous: null,
        next: null
      };
      n2.__ln = node;
      if (n2.previousSibling && isNodeInLinkedList(n2.previousSibling)) {
        const current = n2.previousSibling.__ln.next;
        node.next = current;
        node.previous = n2.previousSibling.__ln;
        n2.previousSibling.__ln.next = node;
        if (current) {
          current.previous = node;
        }
      } else if (n2.nextSibling && isNodeInLinkedList(n2.nextSibling) && n2.nextSibling.__ln.previous) {
        const current = n2.nextSibling.__ln.previous;
        node.previous = current;
        node.next = n2.nextSibling.__ln;
        n2.nextSibling.__ln.previous = node;
        if (current) {
          current.next = node;
        }
      } else {
        if (this.head) {
          this.head.previous = node;
        }
        node.next = this.head;
        this.head = node;
      }
      if (node.next === null) {
        this.tail = node;
      }
      this.length++;
    }
    removeNode(n2) {
      const current = n2.__ln;
      if (!this.head) {
        return;
      }
      if (!current.previous) {
        this.head = current.next;
        if (this.head) {
          this.head.previous = null;
        } else {
          this.tail = null;
        }
      } else {
        current.previous.next = current.next;
        if (current.next) {
          current.next.previous = current.previous;
        } else {
          this.tail = current.previous;
        }
      }
      if (n2.__ln) {
        delete n2.__ln;
      }
      this.length--;
    }
  };
  var moveKey = (id, parentId) => `${id}@${parentId}`;
  var MutationBuffer = class {
    constructor() {
      this.frozen = false;
      this.locked = false;
      this.texts = [];
      this.attributes = [];
      this.removes = [];
      this.mapRemoves = [];
      this.movedMap = {};
      this.addedSet = /* @__PURE__ */ new Set();
      this.movedSet = /* @__PURE__ */ new Set();
      this.droppedSet = /* @__PURE__ */ new Set();
      this.processMutations = (mutations) => {
        mutations.forEach(this.processMutation);
        this.emit();
      };
      this.emit = () => {
        if (this.frozen || this.locked) {
          return;
        }
        const adds = [];
        const addedIds = /* @__PURE__ */ new Set();
        const addList = new DoubleLinkedList();
        const getNextId = (n2) => {
          let ns = n2;
          let nextId = IGNORED_NODE;
          while (nextId === IGNORED_NODE) {
            ns = ns && ns.nextSibling;
            nextId = ns && this.mirror.getId(ns);
          }
          return nextId;
        };
        const pushAdd = (n2) => {
          if (!n2.parentNode || !inDom(n2)) {
            return;
          }
          const parentId = isShadowRoot(n2.parentNode) ? this.mirror.getId(getShadowHost(n2)) : this.mirror.getId(n2.parentNode);
          const nextId = getNextId(n2);
          if (parentId === -1 || nextId === -1) {
            return addList.addNode(n2);
          }
          const sn = serializeNodeWithId(n2, {
            doc: this.doc,
            mirror: this.mirror,
            blockClass: this.blockClass,
            blockSelector: this.blockSelector,
            maskTextClass: this.maskTextClass,
            maskTextSelector: this.maskTextSelector,
            skipChild: true,
            newlyAddedElement: true,
            inlineStylesheet: this.inlineStylesheet,
            maskInputOptions: this.maskInputOptions,
            maskTextFn: this.maskTextFn,
            maskInputFn: this.maskInputFn,
            slimDOMOptions: this.slimDOMOptions,
            dataURLOptions: this.dataURLOptions,
            recordCanvas: this.recordCanvas,
            inlineImages: this.inlineImages,
            onSerialize: (currentN) => {
              if (isSerializedIframe(currentN, this.mirror)) {
                this.iframeManager.addIframe(currentN);
              }
              if (isSerializedStylesheet(currentN, this.mirror)) {
                this.stylesheetManager.trackLinkElement(currentN);
              }
              if (hasShadowRoot(n2)) {
                this.shadowDomManager.addShadowRoot(n2.shadowRoot, this.doc);
              }
            },
            onIframeLoad: (iframe, childSn) => {
              this.iframeManager.attachIframe(iframe, childSn);
              this.shadowDomManager.observeAttachShadow(iframe);
            },
            onStylesheetLoad: (link, childSn) => {
              this.stylesheetManager.attachLinkElement(link, childSn);
            }
          });
          if (sn) {
            adds.push({
              parentId,
              nextId,
              node: sn
            });
            addedIds.add(sn.id);
          }
        };
        while (this.mapRemoves.length) {
          this.mirror.removeNodeFromMap(this.mapRemoves.shift());
        }
        for (const n2 of this.movedSet) {
          if (isParentRemoved(this.removes, n2, this.mirror) && !this.movedSet.has(n2.parentNode)) {
            continue;
          }
          pushAdd(n2);
        }
        for (const n2 of this.addedSet) {
          if (!isAncestorInSet(this.droppedSet, n2) && !isParentRemoved(this.removes, n2, this.mirror)) {
            pushAdd(n2);
          } else if (isAncestorInSet(this.movedSet, n2)) {
            pushAdd(n2);
          } else {
            this.droppedSet.add(n2);
          }
        }
        let candidate = null;
        while (addList.length) {
          let node = null;
          if (candidate) {
            const parentId = this.mirror.getId(candidate.value.parentNode);
            const nextId = getNextId(candidate.value);
            if (parentId !== -1 && nextId !== -1) {
              node = candidate;
            }
          }
          if (!node) {
            let tailNode = addList.tail;
            while (tailNode) {
              const _node = tailNode;
              tailNode = tailNode.previous;
              if (_node) {
                const parentId = this.mirror.getId(_node.value.parentNode);
                const nextId = getNextId(_node.value);
                if (nextId === -1)
                  continue;
                else if (parentId !== -1) {
                  node = _node;
                  break;
                } else {
                  const unhandledNode = _node.value;
                  if (unhandledNode.parentNode && unhandledNode.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                    const shadowHost = unhandledNode.parentNode.host;
                    const parentId2 = this.mirror.getId(shadowHost);
                    if (parentId2 !== -1) {
                      node = _node;
                      break;
                    }
                  }
                }
              }
            }
          }
          if (!node) {
            while (addList.head) {
              addList.removeNode(addList.head.value);
            }
            break;
          }
          candidate = node.previous;
          addList.removeNode(node.value);
          pushAdd(node.value);
        }
        const payload = {
          texts: this.texts.map((text) => ({
            id: this.mirror.getId(text.node),
            value: text.value
          })).filter((text) => !addedIds.has(text.id)).filter((text) => this.mirror.has(text.id)),
          attributes: this.attributes.map((attribute) => {
            const { attributes } = attribute;
            if (typeof attributes.style === "string") {
              const diffAsStr = JSON.stringify(attribute.styleDiff);
              const unchangedAsStr = JSON.stringify(attribute._unchangedStyles);
              if (diffAsStr.length < attributes.style.length) {
                if ((diffAsStr + unchangedAsStr).split("var(").length === attributes.style.split("var(").length) {
                  attributes.style = attribute.styleDiff;
                }
              }
            }
            return {
              id: this.mirror.getId(attribute.node),
              attributes
            };
          }).filter((attribute) => !addedIds.has(attribute.id)).filter((attribute) => this.mirror.has(attribute.id)),
          removes: this.removes,
          adds
        };
        if (!payload.texts.length && !payload.attributes.length && !payload.removes.length && !payload.adds.length) {
          return;
        }
        this.texts = [];
        this.attributes = [];
        this.removes = [];
        this.addedSet = /* @__PURE__ */ new Set();
        this.movedSet = /* @__PURE__ */ new Set();
        this.droppedSet = /* @__PURE__ */ new Set();
        this.movedMap = {};
        this.mutationCb(payload);
      };
      this.processMutation = (m2) => {
        if (isIgnored(m2.target, this.mirror)) {
          return;
        }
        let unattachedDoc;
        try {
          unattachedDoc = document.implementation.createHTMLDocument();
        } catch (e2) {
          unattachedDoc = this.doc;
        }
        switch (m2.type) {
          case "characterData": {
            const value = m2.target.textContent;
            if (!isBlocked(m2.target, this.blockClass, this.blockSelector, false) && value !== m2.oldValue) {
              this.texts.push({
                value: needMaskingText(m2.target, this.maskTextClass, this.maskTextSelector) && value ? this.maskTextFn ? this.maskTextFn(value) : value.replace(/[\S]/g, "*") : value,
                node: m2.target
              });
            }
            break;
          }
          case "attributes": {
            const target = m2.target;
            let attributeName = m2.attributeName;
            let value = m2.target.getAttribute(attributeName);
            if (attributeName === "value") {
              const type = getInputType(target);
              value = maskInputValue({
                element: target,
                maskInputOptions: this.maskInputOptions,
                tagName: target.tagName,
                type,
                value,
                maskInputFn: this.maskInputFn
              });
            }
            if (isBlocked(m2.target, this.blockClass, this.blockSelector, false) || value === m2.oldValue) {
              return;
            }
            let item = this.attributes.find((a2) => a2.node === m2.target);
            if (target.tagName === "IFRAME" && attributeName === "src" && !this.keepIframeSrcFn(value)) {
              if (!target.contentDocument) {
                attributeName = "rr_src";
              } else {
                return;
              }
            }
            if (!item) {
              item = {
                node: m2.target,
                attributes: {},
                styleDiff: {},
                _unchangedStyles: {}
              };
              this.attributes.push(item);
            }
            if (attributeName === "type" && target.tagName === "INPUT" && (m2.oldValue || "").toLowerCase() === "password") {
              target.setAttribute("data-rr-is-password", "true");
            }
            if (!ignoreAttribute(target.tagName, attributeName)) {
              item.attributes[attributeName] = transformAttribute(this.doc, toLowerCase(target.tagName), toLowerCase(attributeName), value);
              if (attributeName === "style") {
                const old = unattachedDoc.createElement("span");
                if (m2.oldValue) {
                  old.setAttribute("style", m2.oldValue);
                }
                for (const pname of Array.from(target.style)) {
                  const newValue = target.style.getPropertyValue(pname);
                  const newPriority = target.style.getPropertyPriority(pname);
                  if (newValue !== old.style.getPropertyValue(pname) || newPriority !== old.style.getPropertyPriority(pname)) {
                    if (newPriority === "") {
                      item.styleDiff[pname] = newValue;
                    } else {
                      item.styleDiff[pname] = [newValue, newPriority];
                    }
                  } else {
                    item._unchangedStyles[pname] = [newValue, newPriority];
                  }
                }
                for (const pname of Array.from(old.style)) {
                  if (target.style.getPropertyValue(pname) === "") {
                    item.styleDiff[pname] = false;
                  }
                }
              }
            }
            break;
          }
          case "childList": {
            if (isBlocked(m2.target, this.blockClass, this.blockSelector, true))
              return;
            m2.addedNodes.forEach((n2) => this.genAdds(n2, m2.target));
            m2.removedNodes.forEach((n2) => {
              const nodeId = this.mirror.getId(n2);
              const parentId = isShadowRoot(m2.target) ? this.mirror.getId(m2.target.host) : this.mirror.getId(m2.target);
              if (isBlocked(m2.target, this.blockClass, this.blockSelector, false) || isIgnored(n2, this.mirror) || !isSerialized(n2, this.mirror)) {
                return;
              }
              if (this.addedSet.has(n2)) {
                deepDelete(this.addedSet, n2);
                this.droppedSet.add(n2);
              } else if (this.addedSet.has(m2.target) && nodeId === -1) ;
              else if (isAncestorRemoved(m2.target, this.mirror)) ;
              else if (this.movedSet.has(n2) && this.movedMap[moveKey(nodeId, parentId)]) {
                deepDelete(this.movedSet, n2);
              } else {
                this.removes.push({
                  parentId,
                  id: nodeId,
                  isShadow: isShadowRoot(m2.target) && isNativeShadowDom(m2.target) ? true : void 0
                });
              }
              this.mapRemoves.push(n2);
            });
            break;
          }
        }
      };
      this.genAdds = (n2, target) => {
        if (this.processedNodeManager.inOtherBuffer(n2, this))
          return;
        if (this.addedSet.has(n2) || this.movedSet.has(n2))
          return;
        if (this.mirror.hasNode(n2)) {
          if (isIgnored(n2, this.mirror)) {
            return;
          }
          this.movedSet.add(n2);
          let targetId = null;
          if (target && this.mirror.hasNode(target)) {
            targetId = this.mirror.getId(target);
          }
          if (targetId && targetId !== -1) {
            this.movedMap[moveKey(this.mirror.getId(n2), targetId)] = true;
          }
        } else {
          this.addedSet.add(n2);
          this.droppedSet.delete(n2);
        }
        if (!isBlocked(n2, this.blockClass, this.blockSelector, false)) {
          n2.childNodes.forEach((childN) => this.genAdds(childN));
          if (hasShadowRoot(n2)) {
            n2.shadowRoot.childNodes.forEach((childN) => {
              this.processedNodeManager.add(childN, this);
              this.genAdds(childN, n2);
            });
          }
        }
      };
    }
    init(options) {
      [
        "mutationCb",
        "blockClass",
        "blockSelector",
        "maskTextClass",
        "maskTextSelector",
        "inlineStylesheet",
        "maskInputOptions",
        "maskTextFn",
        "maskInputFn",
        "keepIframeSrcFn",
        "recordCanvas",
        "inlineImages",
        "slimDOMOptions",
        "dataURLOptions",
        "doc",
        "mirror",
        "iframeManager",
        "stylesheetManager",
        "shadowDomManager",
        "canvasManager",
        "processedNodeManager"
      ].forEach((key) => {
        this[key] = options[key];
      });
    }
    freeze() {
      this.frozen = true;
      this.canvasManager.freeze();
    }
    unfreeze() {
      this.frozen = false;
      this.canvasManager.unfreeze();
      this.emit();
    }
    isFrozen() {
      return this.frozen;
    }
    lock() {
      this.locked = true;
      this.canvasManager.lock();
    }
    unlock() {
      this.locked = false;
      this.canvasManager.unlock();
      this.emit();
    }
    reset() {
      this.shadowDomManager.reset();
      this.canvasManager.reset();
    }
  };
  function deepDelete(addsSet, n2) {
    addsSet.delete(n2);
    n2.childNodes.forEach((childN) => deepDelete(addsSet, childN));
  }
  function isParentRemoved(removes, n2, mirror2) {
    if (removes.length === 0)
      return false;
    return _isParentRemoved(removes, n2, mirror2);
  }
  function _isParentRemoved(removes, n2, mirror2) {
    const { parentNode } = n2;
    if (!parentNode) {
      return false;
    }
    const parentId = mirror2.getId(parentNode);
    if (removes.some((r2) => r2.id === parentId)) {
      return true;
    }
    return _isParentRemoved(removes, parentNode, mirror2);
  }
  function isAncestorInSet(set, n2) {
    if (set.size === 0)
      return false;
    return _isAncestorInSet(set, n2);
  }
  function _isAncestorInSet(set, n2) {
    const { parentNode } = n2;
    if (!parentNode) {
      return false;
    }
    if (set.has(parentNode)) {
      return true;
    }
    return _isAncestorInSet(set, parentNode);
  }

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb/src/record/error-handler.js
  var errorHandler;
  function registerErrorHandler(handler) {
    errorHandler = handler;
  }
  function unregisterErrorHandler() {
    errorHandler = void 0;
  }
  var callbackWrapper = (cb) => {
    if (!errorHandler) {
      return cb;
    }
    const rrwebWrapped = (...rest) => {
      try {
        return cb(...rest);
      } catch (error) {
        if (errorHandler && errorHandler(error) === true) {
          return;
        }
        throw error;
      }
    };
    return rrwebWrapped;
  };

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb/src/record/observer.js
  var mutationBuffers = [];
  function getEventTarget(event) {
    try {
      if ("composedPath" in event) {
        const path = event.composedPath();
        if (path.length) {
          return path[0];
        }
      } else if ("path" in event && event.path.length) {
        return event.path[0];
      }
    } catch (_a) {
    }
    return event && event.target;
  }
  function initMutationObserver(options, rootEl) {
    var _a, _b;
    const mutationBuffer = new MutationBuffer();
    mutationBuffers.push(mutationBuffer);
    mutationBuffer.init(options);
    let mutationObserverCtor = window.MutationObserver || window.__rrMutationObserver;
    const angularZoneSymbol = (_b = (_a = window === null || window === void 0 ? void 0 : window.Zone) === null || _a === void 0 ? void 0 : _a.__symbol__) === null || _b === void 0 ? void 0 : _b.call(_a, "MutationObserver");
    if (angularZoneSymbol && window[angularZoneSymbol]) {
      mutationObserverCtor = window[angularZoneSymbol];
    }
    const observer = new mutationObserverCtor(callbackWrapper(mutationBuffer.processMutations.bind(mutationBuffer)));
    observer.observe(rootEl, {
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      subtree: true
    });
    return observer;
  }
  function initMoveObserver({ mousemoveCb, sampling, doc, mirror: mirror2 }) {
    if (sampling.mousemove === false) {
      return () => {
      };
    }
    const threshold = typeof sampling.mousemove === "number" ? sampling.mousemove : 50;
    const callbackThreshold = typeof sampling.mousemoveCallback === "number" ? sampling.mousemoveCallback : 500;
    let positions = [];
    let timeBaseline;
    const wrappedCb = throttle(callbackWrapper((source) => {
      const totalOffset = Date.now() - timeBaseline;
      mousemoveCb(positions.map((p2) => {
        p2.timeOffset -= totalOffset;
        return p2;
      }), source);
      positions = [];
      timeBaseline = null;
    }), callbackThreshold);
    const updatePosition = callbackWrapper(throttle(callbackWrapper((evt) => {
      const target = getEventTarget(evt);
      const { clientX, clientY } = legacy_isTouchEvent(evt) ? evt.changedTouches[0] : evt;
      if (!timeBaseline) {
        timeBaseline = nowTimestamp();
      }
      positions.push({
        x: clientX,
        y: clientY,
        id: mirror2.getId(target),
        timeOffset: nowTimestamp() - timeBaseline
      });
      wrappedCb(typeof DragEvent !== "undefined" && evt instanceof DragEvent ? IncrementalSource.Drag : evt instanceof MouseEvent ? IncrementalSource.MouseMove : IncrementalSource.TouchMove);
    }), threshold, {
      trailing: false
    }));
    const handlers = [
      on("mousemove", updatePosition, doc),
      on("touchmove", updatePosition, doc),
      on("drag", updatePosition, doc)
    ];
    return callbackWrapper(() => {
      handlers.forEach((h2) => h2());
    });
  }
  function initMouseInteractionObserver({ mouseInteractionCb, doc, mirror: mirror2, blockClass, blockSelector, sampling }) {
    if (sampling.mouseInteraction === false) {
      return () => {
      };
    }
    const disableMap = sampling.mouseInteraction === true || sampling.mouseInteraction === void 0 ? {} : sampling.mouseInteraction;
    const handlers = [];
    let currentPointerType = null;
    const getHandler = (eventKey) => {
      return (event) => {
        const target = getEventTarget(event);
        if (isBlocked(target, blockClass, blockSelector, true)) {
          return;
        }
        let pointerType = null;
        let thisEventKey = eventKey;
        if ("pointerType" in event) {
          switch (event.pointerType) {
            case "mouse":
              pointerType = PointerTypes.Mouse;
              break;
            case "touch":
              pointerType = PointerTypes.Touch;
              break;
            case "pen":
              pointerType = PointerTypes.Pen;
              break;
          }
          if (pointerType === PointerTypes.Touch) {
            if (MouseInteractions[eventKey] === MouseInteractions.MouseDown) {
              thisEventKey = "TouchStart";
            } else if (MouseInteractions[eventKey] === MouseInteractions.MouseUp) {
              thisEventKey = "TouchEnd";
            }
          } else if (pointerType === PointerTypes.Pen) ;
        } else if (legacy_isTouchEvent(event)) {
          pointerType = PointerTypes.Touch;
        }
        if (pointerType !== null) {
          currentPointerType = pointerType;
          if (thisEventKey.startsWith("Touch") && pointerType === PointerTypes.Touch || thisEventKey.startsWith("Mouse") && pointerType === PointerTypes.Mouse) {
            pointerType = null;
          }
        } else if (MouseInteractions[eventKey] === MouseInteractions.Click) {
          pointerType = currentPointerType;
          currentPointerType = null;
        }
        const e2 = legacy_isTouchEvent(event) ? event.changedTouches[0] : event;
        if (!e2) {
          return;
        }
        const id = mirror2.getId(target);
        const { clientX, clientY } = e2;
        callbackWrapper(mouseInteractionCb)(Object.assign({ type: MouseInteractions[thisEventKey], id, x: clientX, y: clientY }, pointerType !== null && { pointerType }));
      };
    };
    Object.keys(MouseInteractions).filter((key) => Number.isNaN(Number(key)) && !key.endsWith("_Departed") && disableMap[key] !== false).forEach((eventKey) => {
      let eventName = toLowerCase(eventKey);
      const handler = getHandler(eventKey);
      if (window.PointerEvent) {
        switch (MouseInteractions[eventKey]) {
          case MouseInteractions.MouseDown:
          case MouseInteractions.MouseUp:
            eventName = eventName.replace("mouse", "pointer");
            break;
          case MouseInteractions.TouchStart:
          case MouseInteractions.TouchEnd:
            return;
        }
      }
      handlers.push(on(eventName, handler, doc));
    });
    return callbackWrapper(() => {
      handlers.forEach((h2) => h2());
    });
  }
  function initScrollObserver({ scrollCb, doc, mirror: mirror2, blockClass, blockSelector, sampling }) {
    const updatePosition = callbackWrapper(throttle(callbackWrapper((evt) => {
      const target = getEventTarget(evt);
      if (!target || isBlocked(target, blockClass, blockSelector, true)) {
        return;
      }
      const id = mirror2.getId(target);
      if (target === doc && doc.defaultView) {
        const scrollLeftTop = getWindowScroll(doc.defaultView);
        scrollCb({
          id,
          x: scrollLeftTop.left,
          y: scrollLeftTop.top
        });
      } else {
        scrollCb({
          id,
          x: target.scrollLeft,
          y: target.scrollTop
        });
      }
    }), sampling.scroll || 100));
    return on("scroll", updatePosition, doc);
  }
  function initViewportResizeObserver({ viewportResizeCb }, { win }) {
    let lastH = -1;
    let lastW = -1;
    const updateDimension = callbackWrapper(throttle(callbackWrapper(() => {
      const height = getWindowHeight();
      const width = getWindowWidth();
      if (lastH !== height || lastW !== width) {
        viewportResizeCb({
          width: Number(width),
          height: Number(height)
        });
        lastH = height;
        lastW = width;
      }
    }), 200));
    return on("resize", updateDimension, win);
  }
  function wrapEventWithUserTriggeredFlag(v2, enable) {
    const value = Object.assign({}, v2);
    if (!enable)
      delete value.userTriggered;
    return value;
  }
  var INPUT_TAGS = ["INPUT", "TEXTAREA", "SELECT"];
  var lastInputValueMap = /* @__PURE__ */ new WeakMap();
  function initInputObserver({ inputCb, doc, mirror: mirror2, blockClass, blockSelector, ignoreClass, ignoreSelector, maskInputOptions, maskInputFn, sampling, userTriggeredOnInput }) {
    function eventHandler(event) {
      let target = getEventTarget(event);
      const userTriggered = event.isTrusted;
      const tagName = target && target.tagName;
      if (target && tagName === "OPTION") {
        target = target.parentElement;
      }
      if (!target || !tagName || INPUT_TAGS.indexOf(tagName) < 0 || isBlocked(target, blockClass, blockSelector, true)) {
        return;
      }
      if (target.classList.contains(ignoreClass) || ignoreSelector && target.matches(ignoreSelector)) {
        return;
      }
      let text = target.value;
      let isChecked = false;
      const type = getInputType(target) || "";
      if (type === "radio" || type === "checkbox") {
        isChecked = target.checked;
      } else if (maskInputOptions[tagName.toLowerCase()] || maskInputOptions[type]) {
        text = maskInputValue({
          element: target,
          maskInputOptions,
          tagName,
          type,
          value: text,
          maskInputFn
        });
      }
      cbWithDedup(target, callbackWrapper(wrapEventWithUserTriggeredFlag)({ text, isChecked, userTriggered }, userTriggeredOnInput));
      const name = target.name;
      if (type === "radio" && name && isChecked) {
        doc.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach((el) => {
          if (el !== target) {
            cbWithDedup(el, callbackWrapper(wrapEventWithUserTriggeredFlag)({
              text: el.value,
              isChecked: !isChecked,
              userTriggered: false
            }, userTriggeredOnInput));
          }
        });
      }
    }
    function cbWithDedup(target, v2) {
      const lastInputValue = lastInputValueMap.get(target);
      if (!lastInputValue || lastInputValue.text !== v2.text || lastInputValue.isChecked !== v2.isChecked) {
        lastInputValueMap.set(target, v2);
        const id = mirror2.getId(target);
        callbackWrapper(inputCb)(Object.assign(Object.assign({}, v2), { id }));
      }
    }
    const events = sampling.input === "last" ? ["change"] : ["input", "change"];
    const handlers = events.map((eventName) => on(eventName, callbackWrapper(eventHandler), doc));
    const currentWindow = doc.defaultView;
    if (!currentWindow) {
      return () => {
        handlers.forEach((h2) => h2());
      };
    }
    const propertyDescriptor = currentWindow.Object.getOwnPropertyDescriptor(currentWindow.HTMLInputElement.prototype, "value");
    const hookProperties = [
      [currentWindow.HTMLInputElement.prototype, "value"],
      [currentWindow.HTMLInputElement.prototype, "checked"],
      [currentWindow.HTMLSelectElement.prototype, "value"],
      [currentWindow.HTMLTextAreaElement.prototype, "value"],
      [currentWindow.HTMLSelectElement.prototype, "selectedIndex"],
      [currentWindow.HTMLOptionElement.prototype, "selected"]
    ];
    if (propertyDescriptor && propertyDescriptor.set) {
      handlers.push(...hookProperties.map((p2) => hookSetter(p2[0], p2[1], {
        set() {
          callbackWrapper(eventHandler)({
            target: this,
            isTrusted: false
          });
        }
      }, false, currentWindow)));
    }
    return callbackWrapper(() => {
      handlers.forEach((h2) => h2());
    });
  }
  function getNestedCSSRulePositions(rule) {
    const positions = [];
    function recurse(childRule, pos) {
      if (hasNestedCSSRule("CSSGroupingRule") && childRule.parentRule instanceof CSSGroupingRule || hasNestedCSSRule("CSSMediaRule") && childRule.parentRule instanceof CSSMediaRule || hasNestedCSSRule("CSSSupportsRule") && childRule.parentRule instanceof CSSSupportsRule || hasNestedCSSRule("CSSConditionRule") && childRule.parentRule instanceof CSSConditionRule) {
        const rules = Array.from(childRule.parentRule.cssRules);
        const index = rules.indexOf(childRule);
        pos.unshift(index);
      } else if (childRule.parentStyleSheet) {
        const rules = Array.from(childRule.parentStyleSheet.cssRules);
        const index = rules.indexOf(childRule);
        pos.unshift(index);
      }
      return pos;
    }
    return recurse(rule, positions);
  }
  function getIdAndStyleId(sheet, mirror2, styleMirror) {
    let id, styleId;
    if (!sheet)
      return {};
    if (sheet.ownerNode)
      id = mirror2.getId(sheet.ownerNode);
    else
      styleId = styleMirror.getId(sheet);
    return {
      styleId,
      id
    };
  }
  function initStyleSheetObserver({ styleSheetRuleCb, mirror: mirror2, stylesheetManager }, { win }) {
    if (!win.CSSStyleSheet || !win.CSSStyleSheet.prototype) {
      return () => {
      };
    }
    const insertRule = win.CSSStyleSheet.prototype.insertRule;
    win.CSSStyleSheet.prototype.insertRule = new Proxy(insertRule, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        const [rule, index] = argumentsList;
        const { id, styleId } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleSheetRuleCb({
            id,
            styleId,
            adds: [{ rule, index }]
          });
        }
        return target.apply(thisArg, argumentsList);
      })
    });
    const deleteRule = win.CSSStyleSheet.prototype.deleteRule;
    win.CSSStyleSheet.prototype.deleteRule = new Proxy(deleteRule, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        const [index] = argumentsList;
        const { id, styleId } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleSheetRuleCb({
            id,
            styleId,
            removes: [{ index }]
          });
        }
        return target.apply(thisArg, argumentsList);
      })
    });
    let replace;
    if (win.CSSStyleSheet.prototype.replace) {
      replace = win.CSSStyleSheet.prototype.replace;
      win.CSSStyleSheet.prototype.replace = new Proxy(replace, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
          const [text] = argumentsList;
          const { id, styleId } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
          if (id && id !== -1 || styleId && styleId !== -1) {
            styleSheetRuleCb({
              id,
              styleId,
              replace: text
            });
          }
          return target.apply(thisArg, argumentsList);
        })
      });
    }
    let replaceSync;
    if (win.CSSStyleSheet.prototype.replaceSync) {
      replaceSync = win.CSSStyleSheet.prototype.replaceSync;
      win.CSSStyleSheet.prototype.replaceSync = new Proxy(replaceSync, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
          const [text] = argumentsList;
          const { id, styleId } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
          if (id && id !== -1 || styleId && styleId !== -1) {
            styleSheetRuleCb({
              id,
              styleId,
              replaceSync: text
            });
          }
          return target.apply(thisArg, argumentsList);
        })
      });
    }
    const supportedNestedCSSRuleTypes = {};
    if (canMonkeyPatchNestedCSSRule("CSSGroupingRule")) {
      supportedNestedCSSRuleTypes.CSSGroupingRule = win.CSSGroupingRule;
    } else {
      if (canMonkeyPatchNestedCSSRule("CSSMediaRule")) {
        supportedNestedCSSRuleTypes.CSSMediaRule = win.CSSMediaRule;
      }
      if (canMonkeyPatchNestedCSSRule("CSSConditionRule")) {
        supportedNestedCSSRuleTypes.CSSConditionRule = win.CSSConditionRule;
      }
      if (canMonkeyPatchNestedCSSRule("CSSSupportsRule")) {
        supportedNestedCSSRuleTypes.CSSSupportsRule = win.CSSSupportsRule;
      }
    }
    const unmodifiedFunctions = {};
    Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
      unmodifiedFunctions[typeKey] = {
        insertRule: type.prototype.insertRule,
        deleteRule: type.prototype.deleteRule
      };
      type.prototype.insertRule = new Proxy(unmodifiedFunctions[typeKey].insertRule, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
          const [rule, index] = argumentsList;
          const { id, styleId } = getIdAndStyleId(thisArg.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
          if (id && id !== -1 || styleId && styleId !== -1) {
            styleSheetRuleCb({
              id,
              styleId,
              adds: [
                {
                  rule,
                  index: [
                    ...getNestedCSSRulePositions(thisArg),
                    index || 0
                  ]
                }
              ]
            });
          }
          return target.apply(thisArg, argumentsList);
        })
      });
      type.prototype.deleteRule = new Proxy(unmodifiedFunctions[typeKey].deleteRule, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
          const [index] = argumentsList;
          const { id, styleId } = getIdAndStyleId(thisArg.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
          if (id && id !== -1 || styleId && styleId !== -1) {
            styleSheetRuleCb({
              id,
              styleId,
              removes: [
                { index: [...getNestedCSSRulePositions(thisArg), index] }
              ]
            });
          }
          return target.apply(thisArg, argumentsList);
        })
      });
    });
    return callbackWrapper(() => {
      win.CSSStyleSheet.prototype.insertRule = insertRule;
      win.CSSStyleSheet.prototype.deleteRule = deleteRule;
      replace && (win.CSSStyleSheet.prototype.replace = replace);
      replaceSync && (win.CSSStyleSheet.prototype.replaceSync = replaceSync);
      Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
        type.prototype.insertRule = unmodifiedFunctions[typeKey].insertRule;
        type.prototype.deleteRule = unmodifiedFunctions[typeKey].deleteRule;
      });
    });
  }
  function initAdoptedStyleSheetObserver({ mirror: mirror2, stylesheetManager }, host) {
    var _a, _b, _c;
    let hostId = null;
    if (host.nodeName === "#document")
      hostId = mirror2.getId(host);
    else
      hostId = mirror2.getId(host.host);
    const patchTarget = host.nodeName === "#document" ? (_a = host.defaultView) === null || _a === void 0 ? void 0 : _a.Document : (_c = (_b = host.ownerDocument) === null || _b === void 0 ? void 0 : _b.defaultView) === null || _c === void 0 ? void 0 : _c.ShadowRoot;
    const originalPropertyDescriptor = Object.getOwnPropertyDescriptor(patchTarget === null || patchTarget === void 0 ? void 0 : patchTarget.prototype, "adoptedStyleSheets");
    if (hostId === null || hostId === -1 || !patchTarget || !originalPropertyDescriptor)
      return () => {
      };
    Object.defineProperty(host, "adoptedStyleSheets", {
      configurable: originalPropertyDescriptor.configurable,
      enumerable: originalPropertyDescriptor.enumerable,
      get() {
        var _a2;
        return (_a2 = originalPropertyDescriptor.get) === null || _a2 === void 0 ? void 0 : _a2.call(this);
      },
      set(sheets) {
        var _a2;
        const result = (_a2 = originalPropertyDescriptor.set) === null || _a2 === void 0 ? void 0 : _a2.call(this, sheets);
        if (hostId !== null && hostId !== -1) {
          try {
            stylesheetManager.adoptStyleSheets(sheets, hostId);
          } catch (e2) {
          }
        }
        return result;
      }
    });
    return callbackWrapper(() => {
      Object.defineProperty(host, "adoptedStyleSheets", {
        configurable: originalPropertyDescriptor.configurable,
        enumerable: originalPropertyDescriptor.enumerable,
        get: originalPropertyDescriptor.get,
        set: originalPropertyDescriptor.set
      });
    });
  }
  function initStyleDeclarationObserver({ styleDeclarationCb, mirror: mirror2, ignoreCSSAttributes, stylesheetManager }, { win }) {
    const setProperty = win.CSSStyleDeclaration.prototype.setProperty;
    win.CSSStyleDeclaration.prototype.setProperty = new Proxy(setProperty, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        var _a;
        const [property, value, priority] = argumentsList;
        if (ignoreCSSAttributes.has(property)) {
          return setProperty.apply(thisArg, [property, value, priority]);
        }
        const { id, styleId } = getIdAndStyleId((_a = thisArg.parentRule) === null || _a === void 0 ? void 0 : _a.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleDeclarationCb({
            id,
            styleId,
            set: {
              property,
              value,
              priority
            },
            index: getNestedCSSRulePositions(thisArg.parentRule)
          });
        }
        return target.apply(thisArg, argumentsList);
      })
    });
    const removeProperty = win.CSSStyleDeclaration.prototype.removeProperty;
    win.CSSStyleDeclaration.prototype.removeProperty = new Proxy(removeProperty, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        var _a;
        const [property] = argumentsList;
        if (ignoreCSSAttributes.has(property)) {
          return removeProperty.apply(thisArg, [property]);
        }
        const { id, styleId } = getIdAndStyleId((_a = thisArg.parentRule) === null || _a === void 0 ? void 0 : _a.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
        if (id && id !== -1 || styleId && styleId !== -1) {
          styleDeclarationCb({
            id,
            styleId,
            remove: {
              property
            },
            index: getNestedCSSRulePositions(thisArg.parentRule)
          });
        }
        return target.apply(thisArg, argumentsList);
      })
    });
    return callbackWrapper(() => {
      win.CSSStyleDeclaration.prototype.setProperty = setProperty;
      win.CSSStyleDeclaration.prototype.removeProperty = removeProperty;
    });
  }
  function initMediaInteractionObserver({ mediaInteractionCb, blockClass, blockSelector, mirror: mirror2, sampling, doc }) {
    const handler = callbackWrapper((type) => throttle(callbackWrapper((event) => {
      const target = getEventTarget(event);
      if (!target || isBlocked(target, blockClass, blockSelector, true)) {
        return;
      }
      const { currentTime, volume, muted, playbackRate } = target;
      mediaInteractionCb({
        type,
        id: mirror2.getId(target),
        currentTime,
        volume,
        muted,
        playbackRate
      });
    }), sampling.media || 500));
    const handlers = [
      on("play", handler(0), doc),
      on("pause", handler(1), doc),
      on("seeked", handler(2), doc),
      on("volumechange", handler(3), doc),
      on("ratechange", handler(4), doc)
    ];
    return callbackWrapper(() => {
      handlers.forEach((h2) => h2());
    });
  }
  function initFontObserver({ fontCb, doc }) {
    const win = doc.defaultView;
    if (!win) {
      return () => {
      };
    }
    const handlers = [];
    const fontMap = /* @__PURE__ */ new WeakMap();
    const originalFontFace = win.FontFace;
    win.FontFace = function FontFace(family, source, descriptors) {
      const fontFace = new originalFontFace(family, source, descriptors);
      fontMap.set(fontFace, {
        family,
        buffer: typeof source !== "string",
        descriptors,
        fontSource: typeof source === "string" ? source : JSON.stringify(Array.from(new Uint8Array(source)))
      });
      return fontFace;
    };
    const restoreHandler = patch(doc.fonts, "add", function(original) {
      return function(fontFace) {
        setTimeout(callbackWrapper(() => {
          const p2 = fontMap.get(fontFace);
          if (p2) {
            fontCb(p2);
            fontMap.delete(fontFace);
          }
        }), 0);
        return original.apply(this, [fontFace]);
      };
    });
    handlers.push(() => {
      win.FontFace = originalFontFace;
    });
    handlers.push(restoreHandler);
    return callbackWrapper(() => {
      handlers.forEach((h2) => h2());
    });
  }
  function initSelectionObserver(param) {
    const { doc, mirror: mirror2, blockClass, blockSelector, selectionCb } = param;
    let collapsed = true;
    const updateSelection = callbackWrapper(() => {
      const selection = doc.getSelection();
      if (!selection || collapsed && (selection === null || selection === void 0 ? void 0 : selection.isCollapsed))
        return;
      collapsed = selection.isCollapsed || false;
      const ranges = [];
      const count = selection.rangeCount || 0;
      for (let i2 = 0; i2 < count; i2++) {
        const range = selection.getRangeAt(i2);
        const { startContainer, startOffset, endContainer, endOffset } = range;
        const blocked = isBlocked(startContainer, blockClass, blockSelector, true) || isBlocked(endContainer, blockClass, blockSelector, true);
        if (blocked)
          continue;
        ranges.push({
          start: mirror2.getId(startContainer),
          startOffset,
          end: mirror2.getId(endContainer),
          endOffset
        });
      }
      selectionCb({ ranges });
    });
    updateSelection();
    return on("selectionchange", updateSelection);
  }
  function mergeHooks(o2, hooks) {
    const { mutationCb, mousemoveCb, mouseInteractionCb, scrollCb, viewportResizeCb, inputCb, mediaInteractionCb, styleSheetRuleCb, styleDeclarationCb, canvasMutationCb, fontCb, selectionCb } = o2;
    o2.mutationCb = (...p2) => {
      if (hooks.mutation) {
        hooks.mutation(...p2);
      }
      mutationCb(...p2);
    };
    o2.mousemoveCb = (...p2) => {
      if (hooks.mousemove) {
        hooks.mousemove(...p2);
      }
      mousemoveCb(...p2);
    };
    o2.mouseInteractionCb = (...p2) => {
      if (hooks.mouseInteraction) {
        hooks.mouseInteraction(...p2);
      }
      mouseInteractionCb(...p2);
    };
    o2.scrollCb = (...p2) => {
      if (hooks.scroll) {
        hooks.scroll(...p2);
      }
      scrollCb(...p2);
    };
    o2.viewportResizeCb = (...p2) => {
      if (hooks.viewportResize) {
        hooks.viewportResize(...p2);
      }
      viewportResizeCb(...p2);
    };
    o2.inputCb = (...p2) => {
      if (hooks.input) {
        hooks.input(...p2);
      }
      inputCb(...p2);
    };
    o2.mediaInteractionCb = (...p2) => {
      if (hooks.mediaInteaction) {
        hooks.mediaInteaction(...p2);
      }
      mediaInteractionCb(...p2);
    };
    o2.styleSheetRuleCb = (...p2) => {
      if (hooks.styleSheetRule) {
        hooks.styleSheetRule(...p2);
      }
      styleSheetRuleCb(...p2);
    };
    o2.styleDeclarationCb = (...p2) => {
      if (hooks.styleDeclaration) {
        hooks.styleDeclaration(...p2);
      }
      styleDeclarationCb(...p2);
    };
    o2.canvasMutationCb = (...p2) => {
      if (hooks.canvasMutation) {
        hooks.canvasMutation(...p2);
      }
      canvasMutationCb(...p2);
    };
    o2.fontCb = (...p2) => {
      if (hooks.font) {
        hooks.font(...p2);
      }
      fontCb(...p2);
    };
    o2.selectionCb = (...p2) => {
      if (hooks.selection) {
        hooks.selection(...p2);
      }
      selectionCb(...p2);
    };
  }
  function initObservers(o2, hooks = {}) {
    const currentWindow = o2.doc.defaultView;
    if (!currentWindow) {
      return () => {
      };
    }
    mergeHooks(o2, hooks);
    const mutationObserver = initMutationObserver(o2, o2.doc);
    const mousemoveHandler = initMoveObserver(o2);
    const mouseInteractionHandler = initMouseInteractionObserver(o2);
    const scrollHandler = initScrollObserver(o2);
    const viewportResizeHandler = initViewportResizeObserver(o2, {
      win: currentWindow
    });
    const inputHandler = initInputObserver(o2);
    const mediaInteractionHandler = initMediaInteractionObserver(o2);
    const styleSheetObserver = initStyleSheetObserver(o2, { win: currentWindow });
    const adoptedStyleSheetObserver = initAdoptedStyleSheetObserver(o2, o2.doc);
    const styleDeclarationObserver = initStyleDeclarationObserver(o2, {
      win: currentWindow
    });
    const fontObserver = o2.collectFonts ? initFontObserver(o2) : () => {
    };
    const selectionObserver = initSelectionObserver(o2);
    const pluginHandlers = [];
    for (const plugin of o2.plugins) {
      pluginHandlers.push(plugin.observer(plugin.callback, currentWindow, plugin.options));
    }
    return callbackWrapper(() => {
      mutationBuffers.forEach((b2) => b2.reset());
      mutationObserver.disconnect();
      mousemoveHandler();
      mouseInteractionHandler();
      scrollHandler();
      viewportResizeHandler();
      inputHandler();
      mediaInteractionHandler();
      styleSheetObserver();
      adoptedStyleSheetObserver();
      styleDeclarationObserver();
      fontObserver();
      selectionObserver();
      pluginHandlers.forEach((h2) => h2());
    });
  }
  function hasNestedCSSRule(prop) {
    return typeof window[prop] !== "undefined";
  }
  function canMonkeyPatchNestedCSSRule(prop) {
    return Boolean(typeof window[prop] !== "undefined" && window[prop].prototype && "insertRule" in window[prop].prototype && "deleteRule" in window[prop].prototype);
  }

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb/src/record/cross-origin-iframe-mirror.js
  var CrossOriginIframeMirror = class {
    constructor(generateIdFn) {
      this.generateIdFn = generateIdFn;
      this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap();
      this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
    }
    getId(iframe, remoteId, idToRemoteMap, remoteToIdMap) {
      const idToRemoteIdMap = idToRemoteMap || this.getIdToRemoteIdMap(iframe);
      const remoteIdToIdMap = remoteToIdMap || this.getRemoteIdToIdMap(iframe);
      let id = idToRemoteIdMap.get(remoteId);
      if (!id) {
        id = this.generateIdFn();
        idToRemoteIdMap.set(remoteId, id);
        remoteIdToIdMap.set(id, remoteId);
      }
      return id;
    }
    getIds(iframe, remoteId) {
      const idToRemoteIdMap = this.getIdToRemoteIdMap(iframe);
      const remoteIdToIdMap = this.getRemoteIdToIdMap(iframe);
      return remoteId.map((id) => this.getId(iframe, id, idToRemoteIdMap, remoteIdToIdMap));
    }
    getRemoteId(iframe, id, map) {
      const remoteIdToIdMap = map || this.getRemoteIdToIdMap(iframe);
      if (typeof id !== "number")
        return id;
      const remoteId = remoteIdToIdMap.get(id);
      if (!remoteId)
        return -1;
      return remoteId;
    }
    getRemoteIds(iframe, ids) {
      const remoteIdToIdMap = this.getRemoteIdToIdMap(iframe);
      return ids.map((id) => this.getRemoteId(iframe, id, remoteIdToIdMap));
    }
    reset(iframe) {
      if (!iframe) {
        this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap();
        this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
        return;
      }
      this.iframeIdToRemoteIdMap.delete(iframe);
      this.iframeRemoteIdToIdMap.delete(iframe);
    }
    getIdToRemoteIdMap(iframe) {
      let idToRemoteIdMap = this.iframeIdToRemoteIdMap.get(iframe);
      if (!idToRemoteIdMap) {
        idToRemoteIdMap = /* @__PURE__ */ new Map();
        this.iframeIdToRemoteIdMap.set(iframe, idToRemoteIdMap);
      }
      return idToRemoteIdMap;
    }
    getRemoteIdToIdMap(iframe) {
      let remoteIdToIdMap = this.iframeRemoteIdToIdMap.get(iframe);
      if (!remoteIdToIdMap) {
        remoteIdToIdMap = /* @__PURE__ */ new Map();
        this.iframeRemoteIdToIdMap.set(iframe, remoteIdToIdMap);
      }
      return remoteIdToIdMap;
    }
  };

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb/src/record/iframe-manager.js
  var IframeManager = class {
    constructor(options) {
      this.iframes = /* @__PURE__ */ new WeakMap();
      this.crossOriginIframeMap = /* @__PURE__ */ new WeakMap();
      this.crossOriginIframeMirror = new CrossOriginIframeMirror(genId);
      this.crossOriginIframeRootIdMap = /* @__PURE__ */ new WeakMap();
      this.mutationCb = options.mutationCb;
      this.wrappedEmit = options.wrappedEmit;
      this.stylesheetManager = options.stylesheetManager;
      this.recordCrossOriginIframes = options.recordCrossOriginIframes;
      this.crossOriginIframeStyleMirror = new CrossOriginIframeMirror(this.stylesheetManager.styleMirror.generateId.bind(this.stylesheetManager.styleMirror));
      this.mirror = options.mirror;
      if (this.recordCrossOriginIframes) {
        window.addEventListener("message", this.handleMessage.bind(this));
      }
    }
    addIframe(iframeEl) {
      this.iframes.set(iframeEl, true);
      if (iframeEl.contentWindow)
        this.crossOriginIframeMap.set(iframeEl.contentWindow, iframeEl);
    }
    addLoadListener(cb) {
      this.loadListener = cb;
    }
    attachIframe(iframeEl, childSn) {
      var _a;
      this.mutationCb({
        adds: [
          {
            parentId: this.mirror.getId(iframeEl),
            nextId: null,
            node: childSn
          }
        ],
        removes: [],
        texts: [],
        attributes: [],
        isAttachIframe: true
      });
      (_a = this.loadListener) === null || _a === void 0 ? void 0 : _a.call(this, iframeEl);
      if (iframeEl.contentDocument && iframeEl.contentDocument.adoptedStyleSheets && iframeEl.contentDocument.adoptedStyleSheets.length > 0)
        this.stylesheetManager.adoptStyleSheets(iframeEl.contentDocument.adoptedStyleSheets, this.mirror.getId(iframeEl.contentDocument));
    }
    handleMessage(message) {
      const crossOriginMessageEvent = message;
      if (crossOriginMessageEvent.data.type !== "rrweb" || crossOriginMessageEvent.origin !== crossOriginMessageEvent.data.origin)
        return;
      const iframeSourceWindow = message.source;
      if (!iframeSourceWindow)
        return;
      const iframeEl = this.crossOriginIframeMap.get(message.source);
      if (!iframeEl)
        return;
      const transformedEvent = this.transformCrossOriginEvent(iframeEl, crossOriginMessageEvent.data.event);
      if (transformedEvent)
        this.wrappedEmit(transformedEvent, crossOriginMessageEvent.data.isCheckout);
    }
    transformCrossOriginEvent(iframeEl, e2) {
      var _a;
      switch (e2.type) {
        case EventType.FullSnapshot: {
          this.crossOriginIframeMirror.reset(iframeEl);
          this.crossOriginIframeStyleMirror.reset(iframeEl);
          this.replaceIdOnNode(e2.data.node, iframeEl);
          const rootId = e2.data.node.id;
          this.crossOriginIframeRootIdMap.set(iframeEl, rootId);
          this.patchRootIdOnNode(e2.data.node, rootId);
          return {
            timestamp: e2.timestamp,
            type: EventType.IncrementalSnapshot,
            data: {
              source: IncrementalSource.Mutation,
              adds: [
                {
                  parentId: this.mirror.getId(iframeEl),
                  nextId: null,
                  node: e2.data.node
                }
              ],
              removes: [],
              texts: [],
              attributes: [],
              isAttachIframe: true
            }
          };
        }
        case EventType.Meta:
        case EventType.Load:
        case EventType.DomContentLoaded: {
          return false;
        }
        case EventType.Plugin: {
          return e2;
        }
        case EventType.Custom: {
          this.replaceIds(e2.data.payload, iframeEl, ["id", "parentId", "previousId", "nextId"]);
          return e2;
        }
        case EventType.IncrementalSnapshot: {
          switch (e2.data.source) {
            case IncrementalSource.Mutation: {
              e2.data.adds.forEach((n2) => {
                this.replaceIds(n2, iframeEl, [
                  "parentId",
                  "nextId",
                  "previousId"
                ]);
                this.replaceIdOnNode(n2.node, iframeEl);
                const rootId = this.crossOriginIframeRootIdMap.get(iframeEl);
                rootId && this.patchRootIdOnNode(n2.node, rootId);
              });
              e2.data.removes.forEach((n2) => {
                this.replaceIds(n2, iframeEl, ["parentId", "id"]);
              });
              e2.data.attributes.forEach((n2) => {
                this.replaceIds(n2, iframeEl, ["id"]);
              });
              e2.data.texts.forEach((n2) => {
                this.replaceIds(n2, iframeEl, ["id"]);
              });
              return e2;
            }
            case IncrementalSource.Drag:
            case IncrementalSource.TouchMove:
            case IncrementalSource.MouseMove: {
              e2.data.positions.forEach((p2) => {
                this.replaceIds(p2, iframeEl, ["id"]);
              });
              return e2;
            }
            case IncrementalSource.ViewportResize: {
              return false;
            }
            case IncrementalSource.MediaInteraction:
            case IncrementalSource.MouseInteraction:
            case IncrementalSource.Scroll:
            case IncrementalSource.CanvasMutation:
            case IncrementalSource.Input: {
              this.replaceIds(e2.data, iframeEl, ["id"]);
              return e2;
            }
            case IncrementalSource.StyleSheetRule:
            case IncrementalSource.StyleDeclaration: {
              this.replaceIds(e2.data, iframeEl, ["id"]);
              this.replaceStyleIds(e2.data, iframeEl, ["styleId"]);
              return e2;
            }
            case IncrementalSource.Font: {
              return e2;
            }
            case IncrementalSource.Selection: {
              e2.data.ranges.forEach((range) => {
                this.replaceIds(range, iframeEl, ["start", "end"]);
              });
              return e2;
            }
            case IncrementalSource.AdoptedStyleSheet: {
              this.replaceIds(e2.data, iframeEl, ["id"]);
              this.replaceStyleIds(e2.data, iframeEl, ["styleIds"]);
              (_a = e2.data.styles) === null || _a === void 0 ? void 0 : _a.forEach((style) => {
                this.replaceStyleIds(style, iframeEl, ["styleId"]);
              });
              return e2;
            }
          }
        }
      }
    }
    replace(iframeMirror, obj, iframeEl, keys) {
      for (const key of keys) {
        if (!Array.isArray(obj[key]) && typeof obj[key] !== "number")
          continue;
        if (Array.isArray(obj[key])) {
          obj[key] = iframeMirror.getIds(iframeEl, obj[key]);
        } else {
          obj[key] = iframeMirror.getId(iframeEl, obj[key]);
        }
      }
      return obj;
    }
    replaceIds(obj, iframeEl, keys) {
      return this.replace(this.crossOriginIframeMirror, obj, iframeEl, keys);
    }
    replaceStyleIds(obj, iframeEl, keys) {
      return this.replace(this.crossOriginIframeStyleMirror, obj, iframeEl, keys);
    }
    replaceIdOnNode(node, iframeEl) {
      this.replaceIds(node, iframeEl, ["id", "rootId"]);
      if ("childNodes" in node) {
        node.childNodes.forEach((child) => {
          this.replaceIdOnNode(child, iframeEl);
        });
      }
    }
    patchRootIdOnNode(node, rootId) {
      if (node.type !== NodeType.Document && !node.rootId)
        node.rootId = rootId;
      if ("childNodes" in node) {
        node.childNodes.forEach((child) => {
          this.patchRootIdOnNode(child, rootId);
        });
      }
    }
  };

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb/src/record/shadow-dom-manager.js
  var ShadowDomManager = class {
    constructor(options) {
      this.shadowDoms = /* @__PURE__ */ new WeakSet();
      this.restoreHandlers = [];
      this.mutationCb = options.mutationCb;
      this.scrollCb = options.scrollCb;
      this.bypassOptions = options.bypassOptions;
      this.mirror = options.mirror;
      this.init();
    }
    init() {
      this.reset();
      this.patchAttachShadow(Element, document);
    }
    addShadowRoot(shadowRoot, doc) {
      if (!isNativeShadowDom(shadowRoot))
        return;
      if (this.shadowDoms.has(shadowRoot))
        return;
      this.shadowDoms.add(shadowRoot);
      const observer = initMutationObserver(Object.assign(Object.assign({}, this.bypassOptions), { doc, mutationCb: this.mutationCb, mirror: this.mirror, shadowDomManager: this }), shadowRoot);
      this.restoreHandlers.push(() => observer.disconnect());
      this.restoreHandlers.push(initScrollObserver(Object.assign(Object.assign({}, this.bypassOptions), { scrollCb: this.scrollCb, doc: shadowRoot, mirror: this.mirror })));
      setTimeout(() => {
        if (shadowRoot.adoptedStyleSheets && shadowRoot.adoptedStyleSheets.length > 0)
          this.bypassOptions.stylesheetManager.adoptStyleSheets(shadowRoot.adoptedStyleSheets, this.mirror.getId(shadowRoot.host));
        this.restoreHandlers.push(initAdoptedStyleSheetObserver({
          mirror: this.mirror,
          stylesheetManager: this.bypassOptions.stylesheetManager
        }, shadowRoot));
      }, 0);
    }
    observeAttachShadow(iframeElement) {
      if (!iframeElement.contentWindow || !iframeElement.contentDocument)
        return;
      this.patchAttachShadow(iframeElement.contentWindow.Element, iframeElement.contentDocument);
    }
    patchAttachShadow(element, doc) {
      const manager = this;
      this.restoreHandlers.push(patch(element.prototype, "attachShadow", function(original) {
        return function(option) {
          const shadowRoot = original.call(this, option);
          if (this.shadowRoot && inDom(this))
            manager.addShadowRoot(this.shadowRoot, doc);
          return shadowRoot;
        };
      }));
    }
    reset() {
      this.restoreHandlers.forEach((handler) => {
        try {
          handler();
        } catch (e2) {
        }
      });
      this.restoreHandlers = [];
      this.shadowDoms = /* @__PURE__ */ new WeakSet();
    }
  };

  // ../../node_modules/rrweb/es/rrweb/ext/tslib/tslib.es6.js
  function __rest(s2, e2) {
    var t2 = {};
    for (var p2 in s2) if (Object.prototype.hasOwnProperty.call(s2, p2) && e2.indexOf(p2) < 0)
      t2[p2] = s2[p2];
    if (s2 != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i2 = 0, p2 = Object.getOwnPropertySymbols(s2); i2 < p2.length; i2++) {
        if (e2.indexOf(p2[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(s2, p2[i2]))
          t2[p2[i2]] = s2[p2[i2]];
      }
    return t2;
  }
  function __awaiter(thisArg, _arguments, P2, generator) {
    function adopt(value) {
      return value instanceof P2 ? value : new P2(function(resolve) {
        resolve(value);
      });
    }
    return new (P2 || (P2 = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e2) {
          reject(e2);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e2) {
          reject(e2);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }

  // ../../node_modules/rrweb/es/rrweb/ext/base64-arraybuffer/dist/base64-arraybuffer.es5.js
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
  for (i2 = 0; i2 < chars.length; i2++) {
    lookup[chars.charCodeAt(i2)] = i2;
  }
  var i2;
  var encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer), i2, len = bytes.length, base64 = "";
    for (i2 = 0; i2 < len; i2 += 3) {
      base64 += chars[bytes[i2] >> 2];
      base64 += chars[(bytes[i2] & 3) << 4 | bytes[i2 + 1] >> 4];
      base64 += chars[(bytes[i2 + 1] & 15) << 2 | bytes[i2 + 2] >> 6];
      base64 += chars[bytes[i2 + 2] & 63];
    }
    if (len % 3 === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }
    return base64;
  };

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb/src/record/observers/canvas/serialize-args.js
  var canvasVarMap = /* @__PURE__ */ new Map();
  function variableListFor(ctx, ctor) {
    let contextMap = canvasVarMap.get(ctx);
    if (!contextMap) {
      contextMap = /* @__PURE__ */ new Map();
      canvasVarMap.set(ctx, contextMap);
    }
    if (!contextMap.has(ctor)) {
      contextMap.set(ctor, []);
    }
    return contextMap.get(ctor);
  }
  var saveWebGLVar = (value, win, ctx) => {
    if (!value || !(isInstanceOfWebGLObject(value, win) || typeof value === "object"))
      return;
    const name = value.constructor.name;
    const list = variableListFor(ctx, name);
    let index = list.indexOf(value);
    if (index === -1) {
      index = list.length;
      list.push(value);
    }
    return index;
  };
  function serializeArg(value, win, ctx) {
    if (value instanceof Array) {
      return value.map((arg) => serializeArg(arg, win, ctx));
    } else if (value === null) {
      return value;
    } else if (value instanceof Float32Array || value instanceof Float64Array || value instanceof Int32Array || value instanceof Uint32Array || value instanceof Uint8Array || value instanceof Uint16Array || value instanceof Int16Array || value instanceof Int8Array || value instanceof Uint8ClampedArray) {
      const name = value.constructor.name;
      return {
        rr_type: name,
        args: [Object.values(value)]
      };
    } else if (value instanceof ArrayBuffer) {
      const name = value.constructor.name;
      const base64 = encode(value);
      return {
        rr_type: name,
        base64
      };
    } else if (value instanceof DataView) {
      const name = value.constructor.name;
      return {
        rr_type: name,
        args: [
          serializeArg(value.buffer, win, ctx),
          value.byteOffset,
          value.byteLength
        ]
      };
    } else if (value instanceof HTMLImageElement) {
      const name = value.constructor.name;
      const { src } = value;
      return {
        rr_type: name,
        src
      };
    } else if (value instanceof HTMLCanvasElement) {
      const name = "HTMLImageElement";
      const src = value.toDataURL();
      return {
        rr_type: name,
        src
      };
    } else if (value instanceof ImageData) {
      const name = value.constructor.name;
      return {
        rr_type: name,
        args: [serializeArg(value.data, win, ctx), value.width, value.height]
      };
    } else if (isInstanceOfWebGLObject(value, win) || typeof value === "object") {
      const name = value.constructor.name;
      const index = saveWebGLVar(value, win, ctx);
      return {
        rr_type: name,
        index
      };
    }
    return value;
  }
  var serializeArgs = (args, win, ctx) => {
    return [...args].map((arg) => serializeArg(arg, win, ctx));
  };
  var isInstanceOfWebGLObject = (value, win) => {
    const webGLConstructorNames = [
      "WebGLActiveInfo",
      "WebGLBuffer",
      "WebGLFramebuffer",
      "WebGLProgram",
      "WebGLRenderbuffer",
      "WebGLShader",
      "WebGLShaderPrecisionFormat",
      "WebGLTexture",
      "WebGLUniformLocation",
      "WebGLVertexArrayObject",
      "WebGLVertexArrayObjectOES"
    ];
    const supportedWebGLConstructorNames = webGLConstructorNames.filter((name) => typeof win[name] === "function");
    return Boolean(supportedWebGLConstructorNames.find((name) => value instanceof win[name]));
  };

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb/src/record/observers/canvas/2d.js
  function initCanvas2DMutationObserver(cb, win, blockClass, blockSelector) {
    const handlers = [];
    const props2D = Object.getOwnPropertyNames(win.CanvasRenderingContext2D.prototype);
    for (const prop of props2D) {
      try {
        if (typeof win.CanvasRenderingContext2D.prototype[prop] !== "function") {
          continue;
        }
        const restoreHandler = patch(win.CanvasRenderingContext2D.prototype, prop, function(original) {
          return function(...args) {
            if (!isBlocked(this.canvas, blockClass, blockSelector, true)) {
              setTimeout(() => {
                const recordArgs = serializeArgs([...args], win, this);
                cb(this.canvas, {
                  type: CanvasContext["2D"],
                  property: prop,
                  args: recordArgs
                });
              }, 0);
            }
            return original.apply(this, args);
          };
        });
        handlers.push(restoreHandler);
      } catch (_a) {
        const hookHandler = hookSetter(win.CanvasRenderingContext2D.prototype, prop, {
          set(v2) {
            cb(this.canvas, {
              type: CanvasContext["2D"],
              property: prop,
              args: [v2],
              setter: true
            });
          }
        });
        handlers.push(hookHandler);
      }
    }
    return () => {
      handlers.forEach((h2) => h2());
    };
  }

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb/src/record/observers/canvas/canvas.js
  function getNormalizedContextName(contextType) {
    return contextType === "experimental-webgl" ? "webgl" : contextType;
  }
  function initCanvasContextObserver(win, blockClass, blockSelector, setPreserveDrawingBufferToTrue) {
    const handlers = [];
    try {
      const restoreHandler = patch(win.HTMLCanvasElement.prototype, "getContext", function(original) {
        return function(contextType, ...args) {
          if (!isBlocked(this, blockClass, blockSelector, true)) {
            const ctxName = getNormalizedContextName(contextType);
            if (!("__context" in this))
              this.__context = ctxName;
            if (setPreserveDrawingBufferToTrue && ["webgl", "webgl2"].includes(ctxName)) {
              if (args[0] && typeof args[0] === "object") {
                const contextAttributes = args[0];
                if (!contextAttributes.preserveDrawingBuffer) {
                  contextAttributes.preserveDrawingBuffer = true;
                }
              } else {
                args.splice(0, 1, {
                  preserveDrawingBuffer: true
                });
              }
            }
          }
          return original.apply(this, [contextType, ...args]);
        };
      });
      handlers.push(restoreHandler);
    } catch (_a) {
      console.error("failed to patch HTMLCanvasElement.prototype.getContext");
    }
    return () => {
      handlers.forEach((h2) => h2());
    };
  }

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb/src/record/observers/canvas/webgl.js
  function patchGLPrototype(prototype, type, cb, blockClass, blockSelector, mirror2, win) {
    const handlers = [];
    const props = Object.getOwnPropertyNames(prototype);
    for (const prop of props) {
      if ([
        "isContextLost",
        "canvas",
        "drawingBufferWidth",
        "drawingBufferHeight"
      ].includes(prop)) {
        continue;
      }
      try {
        if (typeof prototype[prop] !== "function") {
          continue;
        }
        const restoreHandler = patch(prototype, prop, function(original) {
          return function(...args) {
            const result = original.apply(this, args);
            saveWebGLVar(result, win, this);
            if ("tagName" in this.canvas && !isBlocked(this.canvas, blockClass, blockSelector, true)) {
              const recordArgs = serializeArgs([...args], win, this);
              const mutation = {
                type,
                property: prop,
                args: recordArgs
              };
              cb(this.canvas, mutation);
            }
            return result;
          };
        });
        handlers.push(restoreHandler);
      } catch (_a) {
        const hookHandler = hookSetter(prototype, prop, {
          set(v2) {
            cb(this.canvas, {
              type,
              property: prop,
              args: [v2],
              setter: true
            });
          }
        });
        handlers.push(hookHandler);
      }
    }
    return handlers;
  }
  function initCanvasWebGLMutationObserver(cb, win, blockClass, blockSelector, mirror2) {
    const handlers = [];
    handlers.push(...patchGLPrototype(win.WebGLRenderingContext.prototype, CanvasContext.WebGL, cb, blockClass, blockSelector, mirror2, win));
    if (typeof win.WebGL2RenderingContext !== "undefined") {
      handlers.push(...patchGLPrototype(win.WebGL2RenderingContext.prototype, CanvasContext.WebGL2, cb, blockClass, blockSelector, mirror2, win));
    }
    return () => {
      handlers.forEach((h2) => h2());
    };
  }

  // ../../node_modules/rrweb/es/rrweb/_virtual/_rollup-plugin-web-worker-loader__helper__browser__createBase64WorkerFactory.js
  function decodeBase64(base64, enableUnicode) {
    var binaryString = atob(base64);
    if (enableUnicode) {
      var binaryView = new Uint8Array(binaryString.length);
      for (var i2 = 0, n2 = binaryString.length; i2 < n2; ++i2) {
        binaryView[i2] = binaryString.charCodeAt(i2);
      }
      return String.fromCharCode.apply(null, new Uint16Array(binaryView.buffer));
    }
    return binaryString;
  }
  function createURL(base64, sourcemapArg, enableUnicodeArg) {
    var sourcemap = sourcemapArg === void 0 ? null : sourcemapArg;
    var enableUnicode = enableUnicodeArg === void 0 ? false : enableUnicodeArg;
    var source = decodeBase64(base64, enableUnicode);
    var start = source.indexOf("\n", 10) + 1;
    var body = source.substring(start) + (sourcemap ? "//# sourceMappingURL=" + sourcemap : "");
    var blob = new Blob([body], { type: "application/javascript" });
    return URL.createObjectURL(blob);
  }
  function createBase64WorkerFactory(base64, sourcemapArg, enableUnicodeArg) {
    var url;
    return function WorkerFactory2(options) {
      url = url || createURL(base64, sourcemapArg, enableUnicodeArg);
      return new Worker(url, options);
    };
  }

  // ../../node_modules/rrweb/es/rrweb/_virtual/image-bitmap-data-url-worker.js
  var WorkerFactory = createBase64WorkerFactory("Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICAgJ3VzZSBzdHJpY3QnOwoKICAgIC8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLg0KDQogICAgUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55DQogICAgcHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLg0KDQogICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICJBUyBJUyIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEgNCiAgICBSRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkNCiAgICBBTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsDQogICAgSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NDQogICAgTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1INCiAgICBPVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SDQogICAgUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS4NCiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqLw0KDQogICAgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikgew0KICAgICAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH0NCiAgICAgICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7DQogICAgICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9DQogICAgICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvclsidGhyb3ciXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9DQogICAgICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfQ0KICAgICAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpOw0KICAgICAgICB9KTsNCiAgICB9CgogICAgLyoKICAgICAqIGJhc2U2NC1hcnJheWJ1ZmZlciAxLjAuMSA8aHR0cHM6Ly9naXRodWIuY29tL25pa2xhc3ZoL2Jhc2U2NC1hcnJheWJ1ZmZlcj4KICAgICAqIENvcHlyaWdodCAoYykgMjAyMSBOaWtsYXMgdm9uIEhlcnR6ZW4gPGh0dHBzOi8vaGVydHplbi5jb20+CiAgICAgKiBSZWxlYXNlZCB1bmRlciBNSVQgTGljZW5zZQogICAgICovCiAgICB2YXIgY2hhcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7CiAgICAvLyBVc2UgYSBsb29rdXAgdGFibGUgdG8gZmluZCB0aGUgaW5kZXguCiAgICB2YXIgbG9va3VwID0gdHlwZW9mIFVpbnQ4QXJyYXkgPT09ICd1bmRlZmluZWQnID8gW10gOiBuZXcgVWludDhBcnJheSgyNTYpOwogICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkrKykgewogICAgICAgIGxvb2t1cFtjaGFycy5jaGFyQ29kZUF0KGkpXSA9IGk7CiAgICB9CiAgICB2YXIgZW5jb2RlID0gZnVuY3Rpb24gKGFycmF5YnVmZmVyKSB7CiAgICAgICAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlidWZmZXIpLCBpLCBsZW4gPSBieXRlcy5sZW5ndGgsIGJhc2U2NCA9ICcnOwogICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMykgewogICAgICAgICAgICBiYXNlNjQgKz0gY2hhcnNbYnl0ZXNbaV0gPj4gMl07CiAgICAgICAgICAgIGJhc2U2NCArPSBjaGFyc1soKGJ5dGVzW2ldICYgMykgPDwgNCkgfCAoYnl0ZXNbaSArIDFdID4+IDQpXTsKICAgICAgICAgICAgYmFzZTY0ICs9IGNoYXJzWygoYnl0ZXNbaSArIDFdICYgMTUpIDw8IDIpIHwgKGJ5dGVzW2kgKyAyXSA+PiA2KV07CiAgICAgICAgICAgIGJhc2U2NCArPSBjaGFyc1tieXRlc1tpICsgMl0gJiA2M107CiAgICAgICAgfQogICAgICAgIGlmIChsZW4gJSAzID09PSAyKSB7CiAgICAgICAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDEpICsgJz0nOwogICAgICAgIH0KICAgICAgICBlbHNlIGlmIChsZW4gJSAzID09PSAxKSB7CiAgICAgICAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDIpICsgJz09JzsKICAgICAgICB9CiAgICAgICAgcmV0dXJuIGJhc2U2NDsKICAgIH07CgogICAgY29uc3QgbGFzdEJsb2JNYXAgPSBuZXcgTWFwKCk7DQogICAgY29uc3QgdHJhbnNwYXJlbnRCbG9iTWFwID0gbmV3IE1hcCgpOw0KICAgIGZ1bmN0aW9uIGdldFRyYW5zcGFyZW50QmxvYkZvcih3aWR0aCwgaGVpZ2h0LCBkYXRhVVJMT3B0aW9ucykgew0KICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgew0KICAgICAgICAgICAgY29uc3QgaWQgPSBgJHt3aWR0aH0tJHtoZWlnaHR9YDsNCiAgICAgICAgICAgIGlmICgnT2Zmc2NyZWVuQ2FudmFzJyBpbiBnbG9iYWxUaGlzKSB7DQogICAgICAgICAgICAgICAgaWYgKHRyYW5zcGFyZW50QmxvYk1hcC5oYXMoaWQpKQ0KICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNwYXJlbnRCbG9iTWFwLmdldChpZCk7DQogICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2NyZWVuID0gbmV3IE9mZnNjcmVlbkNhbnZhcyh3aWR0aCwgaGVpZ2h0KTsNCiAgICAgICAgICAgICAgICBvZmZzY3JlZW4uZ2V0Q29udGV4dCgnMmQnKTsNCiAgICAgICAgICAgICAgICBjb25zdCBibG9iID0geWllbGQgb2Zmc2NyZWVuLmNvbnZlcnRUb0Jsb2IoZGF0YVVSTE9wdGlvbnMpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0geWllbGQgYmxvYi5hcnJheUJ1ZmZlcigpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGJhc2U2NCA9IGVuY29kZShhcnJheUJ1ZmZlcik7DQogICAgICAgICAgICAgICAgdHJhbnNwYXJlbnRCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsNCiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZTY0Ow0KICAgICAgICAgICAgfQ0KICAgICAgICAgICAgZWxzZSB7DQogICAgICAgICAgICAgICAgcmV0dXJuICcnOw0KICAgICAgICAgICAgfQ0KICAgICAgICB9KTsNCiAgICB9DQogICAgY29uc3Qgd29ya2VyID0gc2VsZjsNCiAgICB3b3JrZXIub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHsNCiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHsNCiAgICAgICAgICAgIGlmICgnT2Zmc2NyZWVuQ2FudmFzJyBpbiBnbG9iYWxUaGlzKSB7DQogICAgICAgICAgICAgICAgY29uc3QgeyBpZCwgYml0bWFwLCB3aWR0aCwgaGVpZ2h0LCBkYXRhVVJMT3B0aW9ucyB9ID0gZS5kYXRhOw0KICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zcGFyZW50QmFzZTY0ID0gZ2V0VHJhbnNwYXJlbnRCbG9iRm9yKHdpZHRoLCBoZWlnaHQsIGRhdGFVUkxPcHRpb25zKTsNCiAgICAgICAgICAgICAgICBjb25zdCBvZmZzY3JlZW4gPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKHdpZHRoLCBoZWlnaHQpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGN0eCA9IG9mZnNjcmVlbi5nZXRDb250ZXh0KCcyZCcpOw0KICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoYml0bWFwLCAwLCAwKTsNCiAgICAgICAgICAgICAgICBiaXRtYXAuY2xvc2UoKTsNCiAgICAgICAgICAgICAgICBjb25zdCBibG9iID0geWllbGQgb2Zmc2NyZWVuLmNvbnZlcnRUb0Jsb2IoZGF0YVVSTE9wdGlvbnMpOw0KICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBibG9iLnR5cGU7DQogICAgICAgICAgICAgICAgY29uc3QgYXJyYXlCdWZmZXIgPSB5aWVsZCBibG9iLmFycmF5QnVmZmVyKCk7DQogICAgICAgICAgICAgICAgY29uc3QgYmFzZTY0ID0gZW5jb2RlKGFycmF5QnVmZmVyKTsNCiAgICAgICAgICAgICAgICBpZiAoIWxhc3RCbG9iTWFwLmhhcyhpZCkgJiYgKHlpZWxkIHRyYW5zcGFyZW50QmFzZTY0KSA9PT0gYmFzZTY0KSB7DQogICAgICAgICAgICAgICAgICAgIGxhc3RCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsNCiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlci5wb3N0TWVzc2FnZSh7IGlkIH0pOw0KICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICBpZiAobGFzdEJsb2JNYXAuZ2V0KGlkKSA9PT0gYmFzZTY0KQ0KICAgICAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VyLnBvc3RNZXNzYWdlKHsgaWQgfSk7DQogICAgICAgICAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHsNCiAgICAgICAgICAgICAgICAgICAgaWQsDQogICAgICAgICAgICAgICAgICAgIHR5cGUsDQogICAgICAgICAgICAgICAgICAgIGJhc2U2NCwNCiAgICAgICAgICAgICAgICAgICAgd2lkdGgsDQogICAgICAgICAgICAgICAgICAgIGhlaWdodCwNCiAgICAgICAgICAgICAgICB9KTsNCiAgICAgICAgICAgICAgICBsYXN0QmxvYk1hcC5zZXQoaWQsIGJhc2U2NCk7DQogICAgICAgICAgICB9DQogICAgICAgICAgICBlbHNlIHsNCiAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VyLnBvc3RNZXNzYWdlKHsgaWQ6IGUuZGF0YS5pZCB9KTsNCiAgICAgICAgICAgIH0NCiAgICAgICAgfSk7DQogICAgfTsKCn0pKCk7Cgo=", null, false);

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb/src/record/observers/canvas/canvas-manager.js
  var CanvasManager = class {
    reset() {
      this.pendingCanvasMutations.clear();
      this.resetObservers && this.resetObservers();
    }
    freeze() {
      this.frozen = true;
    }
    unfreeze() {
      this.frozen = false;
    }
    lock() {
      this.locked = true;
    }
    unlock() {
      this.locked = false;
    }
    constructor(options) {
      this.pendingCanvasMutations = /* @__PURE__ */ new Map();
      this.rafStamps = { latestId: 0, invokeId: null };
      this.frozen = false;
      this.locked = false;
      this.processMutation = (target, mutation) => {
        const newFrame = this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId;
        if (newFrame || !this.rafStamps.invokeId)
          this.rafStamps.invokeId = this.rafStamps.latestId;
        if (!this.pendingCanvasMutations.has(target)) {
          this.pendingCanvasMutations.set(target, []);
        }
        this.pendingCanvasMutations.get(target).push(mutation);
      };
      const { sampling = "all", win, blockClass, blockSelector, recordCanvas, dataURLOptions } = options;
      this.mutationCb = options.mutationCb;
      this.mirror = options.mirror;
      if (recordCanvas && sampling === "all")
        this.initCanvasMutationObserver(win, blockClass, blockSelector);
      if (recordCanvas && typeof sampling === "number")
        this.initCanvasFPSObserver(sampling, win, blockClass, blockSelector, {
          dataURLOptions
        });
    }
    initCanvasFPSObserver(fps, win, blockClass, blockSelector, options) {
      const canvasContextReset = initCanvasContextObserver(win, blockClass, blockSelector, true);
      const snapshotInProgressMap = /* @__PURE__ */ new Map();
      const worker = new WorkerFactory();
      worker.onmessage = (e2) => {
        const { id } = e2.data;
        snapshotInProgressMap.set(id, false);
        if (!("base64" in e2.data))
          return;
        const { base64, type, width, height } = e2.data;
        this.mutationCb({
          id,
          type: CanvasContext["2D"],
          commands: [
            {
              property: "clearRect",
              args: [0, 0, width, height]
            },
            {
              property: "drawImage",
              args: [
                {
                  rr_type: "ImageBitmap",
                  args: [
                    {
                      rr_type: "Blob",
                      data: [{ rr_type: "ArrayBuffer", base64 }],
                      type
                    }
                  ]
                },
                0,
                0
              ]
            }
          ]
        });
      };
      const timeBetweenSnapshots = 1e3 / fps;
      let lastSnapshotTime = 0;
      let rafId;
      const getCanvas = () => {
        const matchedCanvas = [];
        win.document.querySelectorAll("canvas").forEach((canvas) => {
          if (!isBlocked(canvas, blockClass, blockSelector, true)) {
            matchedCanvas.push(canvas);
          }
        });
        return matchedCanvas;
      };
      const takeCanvasSnapshots = (timestamp) => {
        if (lastSnapshotTime && timestamp - lastSnapshotTime < timeBetweenSnapshots) {
          rafId = requestAnimationFrame(takeCanvasSnapshots);
          return;
        }
        lastSnapshotTime = timestamp;
        getCanvas().forEach((canvas) => __awaiter(this, void 0, void 0, function* () {
          var _a;
          const id = this.mirror.getId(canvas);
          if (snapshotInProgressMap.get(id))
            return;
          snapshotInProgressMap.set(id, true);
          if (["webgl", "webgl2"].includes(canvas.__context)) {
            const context = canvas.getContext(canvas.__context);
            if (((_a = context === null || context === void 0 ? void 0 : context.getContextAttributes()) === null || _a === void 0 ? void 0 : _a.preserveDrawingBuffer) === false) {
              context.clear(context.COLOR_BUFFER_BIT);
            }
          }
          const bitmap = yield createImageBitmap(canvas);
          worker.postMessage({
            id,
            bitmap,
            width: canvas.width,
            height: canvas.height,
            dataURLOptions: options.dataURLOptions
          }, [bitmap]);
        }));
        rafId = requestAnimationFrame(takeCanvasSnapshots);
      };
      rafId = requestAnimationFrame(takeCanvasSnapshots);
      this.resetObservers = () => {
        canvasContextReset();
        cancelAnimationFrame(rafId);
      };
    }
    initCanvasMutationObserver(win, blockClass, blockSelector) {
      this.startRAFTimestamping();
      this.startPendingCanvasMutationFlusher();
      const canvasContextReset = initCanvasContextObserver(win, blockClass, blockSelector, false);
      const canvas2DReset = initCanvas2DMutationObserver(this.processMutation.bind(this), win, blockClass, blockSelector);
      const canvasWebGL1and2Reset = initCanvasWebGLMutationObserver(this.processMutation.bind(this), win, blockClass, blockSelector, this.mirror);
      this.resetObservers = () => {
        canvasContextReset();
        canvas2DReset();
        canvasWebGL1and2Reset();
      };
    }
    startPendingCanvasMutationFlusher() {
      requestAnimationFrame(() => this.flushPendingCanvasMutations());
    }
    startRAFTimestamping() {
      const setLatestRAFTimestamp = (timestamp) => {
        this.rafStamps.latestId = timestamp;
        requestAnimationFrame(setLatestRAFTimestamp);
      };
      requestAnimationFrame(setLatestRAFTimestamp);
    }
    flushPendingCanvasMutations() {
      this.pendingCanvasMutations.forEach((values, canvas) => {
        const id = this.mirror.getId(canvas);
        this.flushPendingCanvasMutationFor(canvas, id);
      });
      requestAnimationFrame(() => this.flushPendingCanvasMutations());
    }
    flushPendingCanvasMutationFor(canvas, id) {
      if (this.frozen || this.locked) {
        return;
      }
      const valuesWithType = this.pendingCanvasMutations.get(canvas);
      if (!valuesWithType || id === -1)
        return;
      const values = valuesWithType.map((value) => {
        const rest = __rest(value, ["type"]);
        return rest;
      });
      const { type } = valuesWithType[0];
      this.mutationCb({ id, type, commands: values });
      this.pendingCanvasMutations.delete(canvas);
    }
  };

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb/src/record/stylesheet-manager.js
  var StylesheetManager = class {
    constructor(options) {
      this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
      this.styleMirror = new StyleSheetMirror();
      this.mutationCb = options.mutationCb;
      this.adoptedStyleSheetCb = options.adoptedStyleSheetCb;
    }
    attachLinkElement(linkEl, childSn) {
      if ("_cssText" in childSn.attributes)
        this.mutationCb({
          adds: [],
          removes: [],
          texts: [],
          attributes: [
            {
              id: childSn.id,
              attributes: childSn.attributes
            }
          ]
        });
      this.trackLinkElement(linkEl);
    }
    trackLinkElement(linkEl) {
      if (this.trackedLinkElements.has(linkEl))
        return;
      this.trackedLinkElements.add(linkEl);
      this.trackStylesheetInLinkElement(linkEl);
    }
    adoptStyleSheets(sheets, hostId) {
      if (sheets.length === 0)
        return;
      const adoptedStyleSheetData = {
        id: hostId,
        styleIds: []
      };
      const styles = [];
      for (const sheet of sheets) {
        let styleId;
        if (!this.styleMirror.has(sheet)) {
          styleId = this.styleMirror.add(sheet);
          const rules = Array.from(sheet.rules || CSSRule);
          styles.push({
            styleId,
            rules: rules.map((r2, index) => {
              return {
                rule: stringifyRule(r2),
                index
              };
            })
          });
        } else
          styleId = this.styleMirror.getId(sheet);
        adoptedStyleSheetData.styleIds.push(styleId);
      }
      if (styles.length > 0)
        adoptedStyleSheetData.styles = styles;
      this.adoptedStyleSheetCb(adoptedStyleSheetData);
    }
    reset() {
      this.styleMirror.reset();
      this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
    }
    trackStylesheetInLinkElement(linkEl) {
    }
  };

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb/src/record/processed-node-manager.js
  var ProcessedNodeManager = class {
    constructor() {
      this.nodeMap = /* @__PURE__ */ new WeakMap();
      this.loop = true;
      this.periodicallyClear();
    }
    periodicallyClear() {
      requestAnimationFrame(() => {
        this.clear();
        if (this.loop)
          this.periodicallyClear();
      });
    }
    inOtherBuffer(node, thisBuffer) {
      const buffers = this.nodeMap.get(node);
      return buffers && Array.from(buffers).some((buffer) => buffer !== thisBuffer);
    }
    add(node, buffer) {
      this.nodeMap.set(node, (this.nodeMap.get(node) || /* @__PURE__ */ new Set()).add(buffer));
    }
    clear() {
      this.nodeMap = /* @__PURE__ */ new WeakMap();
    }
    destroy() {
      this.loop = false;
    }
  };

  // ../../node_modules/rrweb/es/rrweb/packages/rrweb/src/record/index.js
  function wrapEvent(e2) {
    return Object.assign(Object.assign({}, e2), { timestamp: nowTimestamp() });
  }
  var wrappedEmit;
  var takeFullSnapshot;
  var canvasManager;
  var recording = false;
  var mirror = createMirror();
  function record(options = {}) {
    const { emit, checkoutEveryNms, checkoutEveryNth, blockClass = "rr-block", blockSelector = null, ignoreClass = "rr-ignore", ignoreSelector = null, maskTextClass = "rr-mask", maskTextSelector = null, inlineStylesheet = true, maskAllInputs, maskInputOptions: _maskInputOptions, slimDOMOptions: _slimDOMOptions, maskInputFn, maskTextFn, hooks, packFn, sampling = {}, dataURLOptions = {}, mousemoveWait, recordCanvas = false, recordCrossOriginIframes = false, recordAfter = options.recordAfter === "DOMContentLoaded" ? options.recordAfter : "load", userTriggeredOnInput = false, collectFonts = false, inlineImages = false, plugins, keepIframeSrcFn = () => false, ignoreCSSAttributes = /* @__PURE__ */ new Set([]), errorHandler: errorHandler2 } = options;
    registerErrorHandler(errorHandler2);
    const inEmittingFrame = recordCrossOriginIframes ? window.parent === window : true;
    let passEmitsToParent = false;
    if (!inEmittingFrame) {
      try {
        if (window.parent.document) {
          passEmitsToParent = false;
        }
      } catch (e2) {
        passEmitsToParent = true;
      }
    }
    if (inEmittingFrame && !emit) {
      throw new Error("emit function is required");
    }
    if (mousemoveWait !== void 0 && sampling.mousemove === void 0) {
      sampling.mousemove = mousemoveWait;
    }
    mirror.reset();
    const maskInputOptions = maskAllInputs === true ? {
      color: true,
      date: true,
      "datetime-local": true,
      email: true,
      month: true,
      number: true,
      range: true,
      search: true,
      tel: true,
      text: true,
      time: true,
      url: true,
      week: true,
      textarea: true,
      select: true,
      password: true
    } : _maskInputOptions !== void 0 ? _maskInputOptions : { password: true };
    const slimDOMOptions = _slimDOMOptions === true || _slimDOMOptions === "all" ? {
      script: true,
      comment: true,
      headFavicon: true,
      headWhitespace: true,
      headMetaSocial: true,
      headMetaRobots: true,
      headMetaHttpEquiv: true,
      headMetaVerification: true,
      headMetaAuthorship: _slimDOMOptions === "all",
      headMetaDescKeywords: _slimDOMOptions === "all"
    } : _slimDOMOptions ? _slimDOMOptions : {};
    polyfill();
    let lastFullSnapshotEvent;
    let incrementalSnapshotCount = 0;
    const eventProcessor = (e2) => {
      for (const plugin of plugins || []) {
        if (plugin.eventProcessor) {
          e2 = plugin.eventProcessor(e2);
        }
      }
      if (packFn && !passEmitsToParent) {
        e2 = packFn(e2);
      }
      return e2;
    };
    wrappedEmit = (e2, isCheckout) => {
      var _a;
      if (((_a = mutationBuffers[0]) === null || _a === void 0 ? void 0 : _a.isFrozen()) && e2.type !== EventType.FullSnapshot && !(e2.type === EventType.IncrementalSnapshot && e2.data.source === IncrementalSource.Mutation)) {
        mutationBuffers.forEach((buf) => buf.unfreeze());
      }
      if (inEmittingFrame) {
        emit === null || emit === void 0 ? void 0 : emit(eventProcessor(e2), isCheckout);
      } else if (passEmitsToParent) {
        const message = {
          type: "rrweb",
          event: eventProcessor(e2),
          origin: window.location.origin,
          isCheckout
        };
        window.parent.postMessage(message, "*");
      }
      if (e2.type === EventType.FullSnapshot) {
        lastFullSnapshotEvent = e2;
        incrementalSnapshotCount = 0;
      } else if (e2.type === EventType.IncrementalSnapshot) {
        if (e2.data.source === IncrementalSource.Mutation && e2.data.isAttachIframe) {
          return;
        }
        incrementalSnapshotCount++;
        const exceedCount = checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
        const exceedTime = checkoutEveryNms && e2.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
        if (exceedCount || exceedTime) {
          takeFullSnapshot(true);
        }
      }
    };
    const wrappedMutationEmit = (m2) => {
      wrappedEmit(wrapEvent({
        type: EventType.IncrementalSnapshot,
        data: Object.assign({ source: IncrementalSource.Mutation }, m2)
      }));
    };
    const wrappedScrollEmit = (p2) => wrappedEmit(wrapEvent({
      type: EventType.IncrementalSnapshot,
      data: Object.assign({ source: IncrementalSource.Scroll }, p2)
    }));
    const wrappedCanvasMutationEmit = (p2) => wrappedEmit(wrapEvent({
      type: EventType.IncrementalSnapshot,
      data: Object.assign({ source: IncrementalSource.CanvasMutation }, p2)
    }));
    const wrappedAdoptedStyleSheetEmit = (a2) => wrappedEmit(wrapEvent({
      type: EventType.IncrementalSnapshot,
      data: Object.assign({ source: IncrementalSource.AdoptedStyleSheet }, a2)
    }));
    const stylesheetManager = new StylesheetManager({
      mutationCb: wrappedMutationEmit,
      adoptedStyleSheetCb: wrappedAdoptedStyleSheetEmit
    });
    const iframeManager = new IframeManager({
      mirror,
      mutationCb: wrappedMutationEmit,
      stylesheetManager,
      recordCrossOriginIframes,
      wrappedEmit
    });
    for (const plugin of plugins || []) {
      if (plugin.getMirror)
        plugin.getMirror({
          nodeMirror: mirror,
          crossOriginIframeMirror: iframeManager.crossOriginIframeMirror,
          crossOriginIframeStyleMirror: iframeManager.crossOriginIframeStyleMirror
        });
    }
    const processedNodeManager = new ProcessedNodeManager();
    canvasManager = new CanvasManager({
      recordCanvas,
      mutationCb: wrappedCanvasMutationEmit,
      win: window,
      blockClass,
      blockSelector,
      mirror,
      sampling: sampling.canvas,
      dataURLOptions
    });
    const shadowDomManager = new ShadowDomManager({
      mutationCb: wrappedMutationEmit,
      scrollCb: wrappedScrollEmit,
      bypassOptions: {
        blockClass,
        blockSelector,
        maskTextClass,
        maskTextSelector,
        inlineStylesheet,
        maskInputOptions,
        dataURLOptions,
        maskTextFn,
        maskInputFn,
        recordCanvas,
        inlineImages,
        sampling,
        slimDOMOptions,
        iframeManager,
        stylesheetManager,
        canvasManager,
        keepIframeSrcFn,
        processedNodeManager
      },
      mirror
    });
    takeFullSnapshot = (isCheckout = false) => {
      wrappedEmit(wrapEvent({
        type: EventType.Meta,
        data: {
          href: window.location.href,
          width: getWindowWidth(),
          height: getWindowHeight()
        }
      }), isCheckout);
      stylesheetManager.reset();
      shadowDomManager.init();
      mutationBuffers.forEach((buf) => buf.lock());
      const node = snapshot(document, {
        mirror,
        blockClass,
        blockSelector,
        maskTextClass,
        maskTextSelector,
        inlineStylesheet,
        maskAllInputs: maskInputOptions,
        maskTextFn,
        slimDOM: slimDOMOptions,
        dataURLOptions,
        recordCanvas,
        inlineImages,
        onSerialize: (n2) => {
          if (isSerializedIframe(n2, mirror)) {
            iframeManager.addIframe(n2);
          }
          if (isSerializedStylesheet(n2, mirror)) {
            stylesheetManager.trackLinkElement(n2);
          }
          if (hasShadowRoot(n2)) {
            shadowDomManager.addShadowRoot(n2.shadowRoot, document);
          }
        },
        onIframeLoad: (iframe, childSn) => {
          iframeManager.attachIframe(iframe, childSn);
          shadowDomManager.observeAttachShadow(iframe);
        },
        onStylesheetLoad: (linkEl, childSn) => {
          stylesheetManager.attachLinkElement(linkEl, childSn);
        },
        keepIframeSrcFn
      });
      if (!node) {
        return console.warn("Failed to snapshot the document");
      }
      wrappedEmit(wrapEvent({
        type: EventType.FullSnapshot,
        data: {
          node,
          initialOffset: getWindowScroll(window)
        }
      }), isCheckout);
      mutationBuffers.forEach((buf) => buf.unlock());
      if (document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0)
        stylesheetManager.adoptStyleSheets(document.adoptedStyleSheets, mirror.getId(document));
    };
    try {
      const handlers = [];
      const observe = (doc) => {
        var _a;
        return callbackWrapper(initObservers)({
          mutationCb: wrappedMutationEmit,
          mousemoveCb: (positions, source) => wrappedEmit(wrapEvent({
            type: EventType.IncrementalSnapshot,
            data: {
              source,
              positions
            }
          })),
          mouseInteractionCb: (d2) => wrappedEmit(wrapEvent({
            type: EventType.IncrementalSnapshot,
            data: Object.assign({ source: IncrementalSource.MouseInteraction }, d2)
          })),
          scrollCb: wrappedScrollEmit,
          viewportResizeCb: (d2) => wrappedEmit(wrapEvent({
            type: EventType.IncrementalSnapshot,
            data: Object.assign({ source: IncrementalSource.ViewportResize }, d2)
          })),
          inputCb: (v2) => wrappedEmit(wrapEvent({
            type: EventType.IncrementalSnapshot,
            data: Object.assign({ source: IncrementalSource.Input }, v2)
          })),
          mediaInteractionCb: (p2) => wrappedEmit(wrapEvent({
            type: EventType.IncrementalSnapshot,
            data: Object.assign({ source: IncrementalSource.MediaInteraction }, p2)
          })),
          styleSheetRuleCb: (r2) => wrappedEmit(wrapEvent({
            type: EventType.IncrementalSnapshot,
            data: Object.assign({ source: IncrementalSource.StyleSheetRule }, r2)
          })),
          styleDeclarationCb: (r2) => wrappedEmit(wrapEvent({
            type: EventType.IncrementalSnapshot,
            data: Object.assign({ source: IncrementalSource.StyleDeclaration }, r2)
          })),
          canvasMutationCb: wrappedCanvasMutationEmit,
          fontCb: (p2) => wrappedEmit(wrapEvent({
            type: EventType.IncrementalSnapshot,
            data: Object.assign({ source: IncrementalSource.Font }, p2)
          })),
          selectionCb: (p2) => {
            wrappedEmit(wrapEvent({
              type: EventType.IncrementalSnapshot,
              data: Object.assign({ source: IncrementalSource.Selection }, p2)
            }));
          },
          blockClass,
          ignoreClass,
          ignoreSelector,
          maskTextClass,
          maskTextSelector,
          maskInputOptions,
          inlineStylesheet,
          sampling,
          recordCanvas,
          inlineImages,
          userTriggeredOnInput,
          collectFonts,
          doc,
          maskInputFn,
          maskTextFn,
          keepIframeSrcFn,
          blockSelector,
          slimDOMOptions,
          dataURLOptions,
          mirror,
          iframeManager,
          stylesheetManager,
          shadowDomManager,
          processedNodeManager,
          canvasManager,
          ignoreCSSAttributes,
          plugins: ((_a = plugins === null || plugins === void 0 ? void 0 : plugins.filter((p2) => p2.observer)) === null || _a === void 0 ? void 0 : _a.map((p2) => ({
            observer: p2.observer,
            options: p2.options,
            callback: (payload) => wrappedEmit(wrapEvent({
              type: EventType.Plugin,
              data: {
                plugin: p2.name,
                payload
              }
            }))
          }))) || []
        }, hooks);
      };
      iframeManager.addLoadListener((iframeEl) => {
        try {
          handlers.push(observe(iframeEl.contentDocument));
        } catch (error) {
          console.warn(error);
        }
      });
      const init = () => {
        takeFullSnapshot();
        handlers.push(observe(document));
        recording = true;
      };
      if (document.readyState === "interactive" || document.readyState === "complete") {
        init();
      } else {
        handlers.push(on("DOMContentLoaded", () => {
          wrappedEmit(wrapEvent({
            type: EventType.DomContentLoaded,
            data: {}
          }));
          if (recordAfter === "DOMContentLoaded")
            init();
        }));
        handlers.push(on("load", () => {
          wrappedEmit(wrapEvent({
            type: EventType.Load,
            data: {}
          }));
          if (recordAfter === "load")
            init();
        }, window));
      }
      return () => {
        handlers.forEach((h2) => h2());
        processedNodeManager.destroy();
        recording = false;
        unregisterErrorHandler();
      };
    } catch (error) {
      console.warn(error);
    }
  }
  record.addCustomEvent = (tag, payload) => {
    if (!recording) {
      throw new Error("please add custom event after start recording");
    }
    wrappedEmit(wrapEvent({
      type: EventType.Custom,
      data: {
        tag,
        payload
      }
    }));
  };
  record.freezePage = () => {
    mutationBuffers.forEach((buf) => buf.freeze());
  };
  record.takeFullSnapshot = (isCheckout) => {
    if (!recording) {
      throw new Error("please take full snapshot after start recording");
    }
    takeFullSnapshot(isCheckout);
  };
  record.mirror = mirror;

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
      this.startRecording();
    }
    startRecording() {
      if (this.isRecording || !this.config.enableSessionReplay) {
        console.log("[Session Replay] Cannot start recording:", {
          isRecording: this.isRecording,
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
        this.stopRecordingFn = record({
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
        events.map((e2) => `Type ${e2.type}`).join(", ")
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
          eventTypes: events.map((e2) => e2.type),
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
      } catch (e2) {
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
        } catch (e2) {
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
      } catch (e2) {
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
      } catch (e2) {
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

  // ../../node_modules/web-vitals/dist/web-vitals.js
  var e = -1;
  var t = (t2) => {
    addEventListener("pageshow", (n2) => {
      n2.persisted && (e = n2.timeStamp, t2(n2));
    }, true);
  };
  var n = (e2, t2, n2, i2) => {
    let o2, s2;
    return (r2) => {
      t2.value >= 0 && (r2 || i2) && (s2 = t2.value - (o2 ?? 0), (s2 || void 0 === o2) && (o2 = t2.value, t2.delta = s2, t2.rating = ((e3, t3) => e3 > t3[1] ? "poor" : e3 > t3[0] ? "needs-improvement" : "good")(t2.value, n2), e2(t2)));
    };
  };
  var i = (e2) => {
    requestAnimationFrame(() => requestAnimationFrame(() => e2()));
  };
  var o = () => {
    const e2 = performance.getEntriesByType("navigation")[0];
    if (e2 && e2.responseStart > 0 && e2.responseStart < performance.now()) return e2;
  };
  var s = () => {
    const e2 = o();
    return e2?.activationStart ?? 0;
  };
  var r = (t2, n2 = -1) => {
    const i2 = o();
    let r2 = "navigate";
    e >= 0 ? r2 = "back-forward-cache" : i2 && (document.prerendering || s() > 0 ? r2 = "prerender" : document.wasDiscarded ? r2 = "restore" : i2.type && (r2 = i2.type.replace(/_/g, "-")));
    return { name: t2, value: n2, rating: "good", delta: 0, entries: [], id: `v5-${Date.now()}-${Math.floor(8999999999999 * Math.random()) + 1e12}`, navigationType: r2 };
  };
  var c = /* @__PURE__ */ new WeakMap();
  function a(e2, t2) {
    return c.get(e2) || c.set(e2, new t2()), c.get(e2);
  }
  var d = class {
    constructor() {
      __publicField(this, "t");
      __publicField(this, "i", 0);
      __publicField(this, "o", []);
    }
    h(e2) {
      if (e2.hadRecentInput) return;
      const t2 = this.o[0], n2 = this.o.at(-1);
      this.i && t2 && n2 && e2.startTime - n2.startTime < 1e3 && e2.startTime - t2.startTime < 5e3 ? (this.i += e2.value, this.o.push(e2)) : (this.i = e2.value, this.o = [e2]), this.t?.(e2);
    }
  };
  var h = (e2, t2, n2 = {}) => {
    try {
      if (PerformanceObserver.supportedEntryTypes.includes(e2)) {
        const i2 = new PerformanceObserver((e3) => {
          Promise.resolve().then(() => {
            t2(e3.getEntries());
          });
        });
        return i2.observe({ type: e2, buffered: true, ...n2 }), i2;
      }
    } catch {
    }
  };
  var f = (e2) => {
    let t2 = false;
    return () => {
      t2 || (e2(), t2 = true);
    };
  };
  var u = -1;
  var l = () => "hidden" !== document.visibilityState || document.prerendering ? 1 / 0 : 0;
  var m = (e2) => {
    "hidden" === document.visibilityState && u > -1 && (u = "visibilitychange" === e2.type ? e2.timeStamp : 0, v());
  };
  var g = () => {
    addEventListener("visibilitychange", m, true), addEventListener("prerenderingchange", m, true);
  };
  var v = () => {
    removeEventListener("visibilitychange", m, true), removeEventListener("prerenderingchange", m, true);
  };
  var p = () => {
    if (u < 0) {
      const e2 = s(), n2 = document.prerendering ? void 0 : globalThis.performance.getEntriesByType("visibility-state").filter((t2) => "hidden" === t2.name && t2.startTime > e2)[0]?.startTime;
      u = n2 ?? l(), g(), t(() => {
        setTimeout(() => {
          u = l(), g();
        });
      });
    }
    return { get firstHiddenTime() {
      return u;
    } };
  };
  var y = (e2) => {
    document.prerendering ? addEventListener("prerenderingchange", () => e2(), true) : e2();
  };
  var b = [1800, 3e3];
  var P = (e2, o2 = {}) => {
    y(() => {
      const c2 = p();
      let a2, d2 = r("FCP");
      const f2 = h("paint", (e3) => {
        for (const t2 of e3) "first-contentful-paint" === t2.name && (f2.disconnect(), t2.startTime < c2.firstHiddenTime && (d2.value = Math.max(t2.startTime - s(), 0), d2.entries.push(t2), a2(true)));
      });
      f2 && (a2 = n(e2, d2, b, o2.reportAllChanges), t((t2) => {
        d2 = r("FCP"), a2 = n(e2, d2, b, o2.reportAllChanges), i(() => {
          d2.value = performance.now() - t2.timeStamp, a2(true);
        });
      }));
    });
  };
  var T = [0.1, 0.25];
  var E = (e2, o2 = {}) => {
    P(f(() => {
      let s2, c2 = r("CLS", 0);
      const f2 = a(o2, d), u2 = (e3) => {
        for (const t2 of e3) f2.h(t2);
        f2.i > c2.value && (c2.value = f2.i, c2.entries = f2.o, s2());
      }, l2 = h("layout-shift", u2);
      l2 && (s2 = n(e2, c2, T, o2.reportAllChanges), document.addEventListener("visibilitychange", () => {
        "hidden" === document.visibilityState && (u2(l2.takeRecords()), s2(true));
      }), t(() => {
        f2.i = 0, c2 = r("CLS", 0), s2 = n(e2, c2, T, o2.reportAllChanges), i(() => s2());
      }), setTimeout(s2));
    }));
  };
  var _ = 0;
  var L = 1 / 0;
  var M = 0;
  var C = (e2) => {
    for (const t2 of e2) t2.interactionId && (L = Math.min(L, t2.interactionId), M = Math.max(M, t2.interactionId), _ = M ? (M - L) / 7 + 1 : 0);
  };
  var I;
  var w = () => I ? _ : performance.interactionCount ?? 0;
  var F = () => {
    "interactionCount" in performance || I || (I = h("event", C, { type: "event", buffered: true, durationThreshold: 0 }));
  };
  var k = 0;
  var A = class {
    constructor() {
      __publicField(this, "u", []);
      __publicField(this, "l", /* @__PURE__ */ new Map());
      __publicField(this, "m");
      __publicField(this, "v");
    }
    p() {
      k = w(), this.u.length = 0, this.l.clear();
    }
    P() {
      const e2 = Math.min(this.u.length - 1, Math.floor((w() - k) / 50));
      return this.u[e2];
    }
    h(e2) {
      if (this.m?.(e2), !e2.interactionId && "first-input" !== e2.entryType) return;
      const t2 = this.u.at(-1);
      let n2 = this.l.get(e2.interactionId);
      if (n2 || this.u.length < 10 || e2.duration > t2.T) {
        if (n2 ? e2.duration > n2.T ? (n2.entries = [e2], n2.T = e2.duration) : e2.duration === n2.T && e2.startTime === n2.entries[0].startTime && n2.entries.push(e2) : (n2 = { id: e2.interactionId, entries: [e2], T: e2.duration }, this.l.set(n2.id, n2), this.u.push(n2)), this.u.sort((e3, t3) => t3.T - e3.T), this.u.length > 10) {
          const e3 = this.u.splice(10);
          for (const t3 of e3) this.l.delete(t3.id);
        }
        this.v?.(n2);
      }
    }
  };
  var B = (e2) => {
    const t2 = globalThis.requestIdleCallback || setTimeout;
    "hidden" === document.visibilityState ? e2() : (e2 = f(e2), document.addEventListener("visibilitychange", e2, { once: true }), t2(() => {
      e2(), document.removeEventListener("visibilitychange", e2);
    }));
  };
  var N = [200, 500];
  var S = (e2, i2 = {}) => {
    globalThis.PerformanceEventTiming && "interactionId" in PerformanceEventTiming.prototype && y(() => {
      F();
      let o2, s2 = r("INP");
      const c2 = a(i2, A), d2 = (e3) => {
        B(() => {
          for (const t3 of e3) c2.h(t3);
          const t2 = c2.P();
          t2 && t2.T !== s2.value && (s2.value = t2.T, s2.entries = t2.entries, o2());
        });
      }, f2 = h("event", d2, { durationThreshold: i2.durationThreshold ?? 40 });
      o2 = n(e2, s2, N, i2.reportAllChanges), f2 && (f2.observe({ type: "first-input", buffered: true }), document.addEventListener("visibilitychange", () => {
        "hidden" === document.visibilityState && (d2(f2.takeRecords()), o2(true));
      }), t(() => {
        c2.p(), s2 = r("INP"), o2 = n(e2, s2, N, i2.reportAllChanges);
      }));
    });
  };
  var q = class {
    constructor() {
      __publicField(this, "m");
    }
    h(e2) {
      this.m?.(e2);
    }
  };
  var x = [2500, 4e3];
  var O = (e2, o2 = {}) => {
    y(() => {
      const c2 = p();
      let d2, u2 = r("LCP");
      const l2 = a(o2, q), m2 = (e3) => {
        o2.reportAllChanges || (e3 = e3.slice(-1));
        for (const t2 of e3) l2.h(t2), t2.startTime < c2.firstHiddenTime && (u2.value = Math.max(t2.startTime - s(), 0), u2.entries = [t2], d2());
      }, g2 = h("largest-contentful-paint", m2);
      if (g2) {
        d2 = n(e2, u2, x, o2.reportAllChanges);
        const s2 = f(() => {
          m2(g2.takeRecords()), g2.disconnect(), d2(true);
        });
        for (const e3 of ["keydown", "click", "visibilitychange"]) addEventListener(e3, () => B(s2), { capture: true, once: true });
        t((t2) => {
          u2 = r("LCP"), d2 = n(e2, u2, x, o2.reportAllChanges), i(() => {
            u2.value = performance.now() - t2.timeStamp, d2(true);
          });
        });
      }
    });
  };
  var $ = [800, 1800];
  var D = (e2) => {
    document.prerendering ? y(() => D(e2)) : "complete" !== document.readyState ? addEventListener("load", () => D(e2), true) : setTimeout(e2);
  };
  var H = (e2, i2 = {}) => {
    let c2 = r("TTFB"), a2 = n(e2, c2, $, i2.reportAllChanges);
    D(() => {
      const d2 = o();
      d2 && (c2.value = Math.max(d2.responseStart - s(), 0), c2.entries = [d2], a2(true), t(() => {
        c2 = r("TTFB", 0), a2 = n(e2, c2, $, i2.reportAllChanges), a2(true);
      }));
    });
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
      this.onReadyCallback = onReady;
    }
    initialize() {
      try {
        O(this.collectMetric.bind(this));
        E(this.collectMetric.bind(this));
        S(this.collectMetric.bind(this));
        P(this.collectMetric.bind(this));
        H(this.collectMetric.bind(this));
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
      } catch (e2) {
        console.warn("Error initializing web vitals tracking:", e2);
      }
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
      webVitalsCollector.initialize();
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
      document.addEventListener("click", function(e2) {
        let target = e2.target;
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
          const link = e2.target.closest(
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
/*! Bundled license information:

rrweb/es/rrweb/ext/tslib/tslib.es6.js:
  (*! *****************************************************************************
  Copyright (c) Microsoft Corporation.
  
  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.
  
  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** *)
*/
