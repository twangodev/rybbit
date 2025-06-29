"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // ../../node_modules/rrweb/lib/rrweb-all.cjs
  var require_rrweb_all = __commonJS({
    "../../node_modules/rrweb/lib/rrweb-all.cjs"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var NodeType$2;
      (function(NodeType2) {
        NodeType2[NodeType2["Document"] = 0] = "Document";
        NodeType2[NodeType2["DocumentType"] = 1] = "DocumentType";
        NodeType2[NodeType2["Element"] = 2] = "Element";
        NodeType2[NodeType2["Text"] = 3] = "Text";
        NodeType2[NodeType2["CDATA"] = 4] = "CDATA";
        NodeType2[NodeType2["Comment"] = 5] = "Comment";
      })(NodeType$2 || (NodeType$2 = {}));
      function isElement(n3) {
        return n3.nodeType === n3.ELEMENT_NODE;
      }
      function isShadowRoot(n3) {
        var host = n3 === null || n3 === void 0 ? void 0 : n3.host;
        return Boolean((host === null || host === void 0 ? void 0 : host.shadowRoot) === n3);
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
      function stringifyStylesheet(s3) {
        try {
          var rules2 = s3.rules || s3.cssRules;
          return rules2 ? fixBrowserCompatibilityIssuesInCSS(Array.from(rules2).map(stringifyRule).join("")) : null;
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
      var Mirror$2 = function() {
        function Mirror2() {
          this.idNodeMap = /* @__PURE__ */ new Map();
          this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
        }
        Mirror2.prototype.getId = function(n3) {
          var _a2;
          if (!n3)
            return -1;
          var id = (_a2 = this.getMeta(n3)) === null || _a2 === void 0 ? void 0 : _a2.id;
          return id !== null && id !== void 0 ? id : -1;
        };
        Mirror2.prototype.getNode = function(id) {
          return this.idNodeMap.get(id) || null;
        };
        Mirror2.prototype.getIds = function() {
          return Array.from(this.idNodeMap.keys());
        };
        Mirror2.prototype.getMeta = function(n3) {
          return this.nodeMetaMap.get(n3) || null;
        };
        Mirror2.prototype.removeNodeFromMap = function(n3) {
          var _this = this;
          var id = this.getId(n3);
          this.idNodeMap["delete"](id);
          if (n3.childNodes) {
            n3.childNodes.forEach(function(childNode) {
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
        Mirror2.prototype.add = function(n3, meta) {
          var id = meta.id;
          this.idNodeMap.set(id, n3);
          this.nodeMetaMap.set(n3, meta);
        };
        Mirror2.prototype.replace = function(id, n3) {
          var oldNode = this.getNode(id);
          if (oldNode) {
            var meta = this.nodeMetaMap.get(oldNode);
            if (meta)
              this.nodeMetaMap.set(n3, meta);
          }
          this.idNodeMap.set(id, n3);
        };
        Mirror2.prototype.reset = function() {
          this.idNodeMap = /* @__PURE__ */ new Map();
          this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
        };
        return Mirror2;
      }();
      function createMirror$2() {
        return new Mirror$2();
      }
      function maskInputValue(_a2) {
        var element = _a2.element, maskInputOptions = _a2.maskInputOptions, tagName = _a2.tagName, type = _a2.type, value = _a2.value, maskInputFn = _a2.maskInputFn;
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
      var ORIGINAL_ATTRIBUTE_NAME$1 = "__rrweb_original__";
      function is2DCanvasBlank(canvas) {
        var ctx = canvas.getContext("2d");
        if (!ctx)
          return true;
        var chunkSize = 50;
        for (var x3 = 0; x3 < canvas.width; x3 += chunkSize) {
          for (var y2 = 0; y2 < canvas.height; y2 += chunkSize) {
            var getImageData = ctx.getImageData;
            var originalGetImageData = ORIGINAL_ATTRIBUTE_NAME$1 in getImageData ? getImageData[ORIGINAL_ATTRIBUTE_NAME$1] : getImageData;
            var pixelBuffer = new Uint32Array(originalGetImageData.call(ctx, x3, y2, Math.min(chunkSize, canvas.width - x3), Math.min(chunkSize, canvas.height - y2)).data.buffer);
            if (pixelBuffer.some(function(pixel) {
              return pixel !== 0;
            }))
              return false;
          }
        }
        return true;
      }
      function isNodeMetaEqual(a3, b2) {
        if (!a3 || !b2 || a3.type !== b2.type)
          return false;
        if (a3.type === NodeType$2.Document)
          return a3.compatMode === b2.compatMode;
        else if (a3.type === NodeType$2.DocumentType)
          return a3.name === b2.name && a3.publicId === b2.publicId && a3.systemId === b2.systemId;
        else if (a3.type === NodeType$2.Comment || a3.type === NodeType$2.Text || a3.type === NodeType$2.CDATA)
          return a3.textContent === b2.textContent;
        else if (a3.type === NodeType$2.Element)
          return a3.tagName === b2.tagName && JSON.stringify(a3.attributes) === JSON.stringify(b2.attributes) && a3.isSVG === b2.isSVG && a3.needBlock === b2.needBlock;
        return false;
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
      function getValidTagName$1(element) {
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
              var c3 = attributeValue.charAt(pos);
              if (c3 === "") {
                output.push((url + descriptorsStr).trim());
                break;
              } else if (!inParens) {
                if (c3 === ",") {
                  pos += 1;
                  output.push((url + descriptorsStr).trim());
                  break;
                } else if (c3 === "(") {
                  inParens = true;
                }
              } else {
                if (c3 === ")") {
                  inParens = false;
                }
              }
              descriptorsStr += c3;
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
        var a3 = doc.createElement("a");
        a3.href = attributeValue;
        return a3.href;
      }
      function isSVGElement(el) {
        return Boolean(el.tagName === "svg" || el.ownerSVGElement);
      }
      function getHref() {
        var a3 = document.createElement("a");
        a3.href = "";
        return a3.href;
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
        } catch (e3) {
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
        } catch (e3) {
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
      function serializeNode(n3, options) {
        var doc = options.doc, mirror2 = options.mirror, blockClass = options.blockClass, blockSelector = options.blockSelector, maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, inlineStylesheet = options.inlineStylesheet, _a2 = options.maskInputOptions, maskInputOptions = _a2 === void 0 ? {} : _a2, maskTextFn = options.maskTextFn, maskInputFn = options.maskInputFn, _b2 = options.dataURLOptions, dataURLOptions = _b2 === void 0 ? {} : _b2, inlineImages = options.inlineImages, recordCanvas = options.recordCanvas, keepIframeSrcFn = options.keepIframeSrcFn, _c = options.newlyAddedElement, newlyAddedElement = _c === void 0 ? false : _c;
        var rootId = getRootId(doc, mirror2);
        switch (n3.nodeType) {
          case n3.DOCUMENT_NODE:
            if (n3.compatMode !== "CSS1Compat") {
              return {
                type: NodeType$2.Document,
                childNodes: [],
                compatMode: n3.compatMode
              };
            } else {
              return {
                type: NodeType$2.Document,
                childNodes: []
              };
            }
          case n3.DOCUMENT_TYPE_NODE:
            return {
              type: NodeType$2.DocumentType,
              name: n3.name,
              publicId: n3.publicId,
              systemId: n3.systemId,
              rootId
            };
          case n3.ELEMENT_NODE:
            return serializeElementNode(n3, {
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
          case n3.TEXT_NODE:
            return serializeTextNode(n3, {
              maskTextClass,
              maskTextSelector,
              maskTextFn,
              rootId
            });
          case n3.CDATA_SECTION_NODE:
            return {
              type: NodeType$2.CDATA,
              textContent: "",
              rootId
            };
          case n3.COMMENT_NODE:
            return {
              type: NodeType$2.Comment,
              textContent: n3.textContent || "",
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
      function serializeTextNode(n3, options) {
        var _a2;
        var maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, maskTextFn = options.maskTextFn, rootId = options.rootId;
        var parentTagName = n3.parentNode && n3.parentNode.tagName;
        var textContent = n3.textContent;
        var isStyle = parentTagName === "STYLE" ? true : void 0;
        var isScript = parentTagName === "SCRIPT" ? true : void 0;
        if (isStyle && textContent) {
          try {
            if (n3.nextSibling || n3.previousSibling) {
            } else if ((_a2 = n3.parentNode.sheet) === null || _a2 === void 0 ? void 0 : _a2.cssRules) {
              textContent = stringifyStylesheet(n3.parentNode.sheet);
            }
          } catch (err) {
            console.warn("Cannot get CSS styles from text's parentNode. Error: ".concat(err), n3);
          }
          textContent = absoluteToStylesheet(textContent, getHref());
        }
        if (isScript) {
          textContent = "SCRIPT_PLACEHOLDER";
        }
        if (!isStyle && !isScript && textContent && needMaskingText(n3, maskTextClass, maskTextSelector)) {
          textContent = maskTextFn ? maskTextFn(textContent) : textContent.replace(/[\S]/g, "*");
        }
        return {
          type: NodeType$2.Text,
          textContent: textContent || "",
          isStyle,
          rootId
        };
      }
      function serializeElementNode(n3, options) {
        var doc = options.doc, blockClass = options.blockClass, blockSelector = options.blockSelector, inlineStylesheet = options.inlineStylesheet, _a2 = options.maskInputOptions, maskInputOptions = _a2 === void 0 ? {} : _a2, maskInputFn = options.maskInputFn, _b2 = options.dataURLOptions, dataURLOptions = _b2 === void 0 ? {} : _b2, inlineImages = options.inlineImages, recordCanvas = options.recordCanvas, keepIframeSrcFn = options.keepIframeSrcFn, _c = options.newlyAddedElement, newlyAddedElement = _c === void 0 ? false : _c, rootId = options.rootId;
        var needBlock = _isBlockedElement(n3, blockClass, blockSelector);
        var tagName = getValidTagName$1(n3);
        var attributes = {};
        var len = n3.attributes.length;
        for (var i3 = 0; i3 < len; i3++) {
          var attr = n3.attributes[i3];
          if (!ignoreAttribute(tagName, attr.name, attr.value)) {
            attributes[attr.name] = transformAttribute(doc, tagName, toLowerCase(attr.name), attr.value);
          }
        }
        if (tagName === "link" && inlineStylesheet) {
          var stylesheet = Array.from(doc.styleSheets).find(function(s3) {
            return s3.href === n3.href;
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
        if (tagName === "style" && n3.sheet && !(n3.innerText || n3.textContent || "").trim().length) {
          var cssText = stringifyStylesheet(n3.sheet);
          if (cssText) {
            attributes._cssText = absoluteToStylesheet(cssText, getHref());
          }
        }
        if (tagName === "input" || tagName === "textarea" || tagName === "select") {
          var value = n3.value;
          var checked = n3.checked;
          if (attributes.type !== "radio" && attributes.type !== "checkbox" && attributes.type !== "submit" && attributes.type !== "button" && value) {
            var type = getInputType(n3);
            attributes.value = maskInputValue({
              element: n3,
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
          if (n3.selected && !maskInputOptions["select"]) {
            attributes.selected = true;
          } else {
            delete attributes.selected;
          }
        }
        if (tagName === "canvas" && recordCanvas) {
          if (n3.__context === "2d") {
            if (!is2DCanvasBlank(n3)) {
              attributes.rr_dataURL = n3.toDataURL(dataURLOptions.type, dataURLOptions.quality);
            }
          } else if (!("__context" in n3)) {
            var canvasDataURL = n3.toDataURL(dataURLOptions.type, dataURLOptions.quality);
            var blankCanvas = document.createElement("canvas");
            blankCanvas.width = n3.width;
            blankCanvas.height = n3.height;
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
          var image_1 = n3;
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
          attributes.rr_mediaState = n3.paused ? "paused" : "played";
          attributes.rr_mediaCurrentTime = n3.currentTime;
        }
        if (!newlyAddedElement) {
          if (n3.scrollLeft) {
            attributes.rr_scrollLeft = n3.scrollLeft;
          }
          if (n3.scrollTop) {
            attributes.rr_scrollTop = n3.scrollTop;
          }
        }
        if (needBlock) {
          var _d = n3.getBoundingClientRect(), width = _d.width, height = _d.height;
          attributes = {
            "class": attributes["class"],
            rr_width: "".concat(width, "px"),
            rr_height: "".concat(height, "px")
          };
        }
        if (tagName === "iframe" && !keepIframeSrcFn(attributes.src)) {
          if (!n3.contentDocument) {
            attributes.rr_src = attributes.src;
          }
          delete attributes.src;
        }
        return {
          type: NodeType$2.Element,
          tagName,
          attributes,
          childNodes: [],
          isSVG: isSVGElement(n3) || void 0,
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
        if (slimDOMOptions.comment && sn.type === NodeType$2.Comment) {
          return true;
        } else if (sn.type === NodeType$2.Element) {
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
      function serializeNodeWithId(n3, options) {
        var doc = options.doc, mirror2 = options.mirror, blockClass = options.blockClass, blockSelector = options.blockSelector, maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, _a2 = options.skipChild, skipChild = _a2 === void 0 ? false : _a2, _b2 = options.inlineStylesheet, inlineStylesheet = _b2 === void 0 ? true : _b2, _c = options.maskInputOptions, maskInputOptions = _c === void 0 ? {} : _c, maskTextFn = options.maskTextFn, maskInputFn = options.maskInputFn, slimDOMOptions = options.slimDOMOptions, _d = options.dataURLOptions, dataURLOptions = _d === void 0 ? {} : _d, _e = options.inlineImages, inlineImages = _e === void 0 ? false : _e, _f = options.recordCanvas, recordCanvas = _f === void 0 ? false : _f, onSerialize = options.onSerialize, onIframeLoad = options.onIframeLoad, _g = options.iframeLoadTimeout, iframeLoadTimeout = _g === void 0 ? 5e3 : _g, onStylesheetLoad = options.onStylesheetLoad, _h = options.stylesheetLoadTimeout, stylesheetLoadTimeout = _h === void 0 ? 5e3 : _h, _j = options.keepIframeSrcFn, keepIframeSrcFn = _j === void 0 ? function() {
          return false;
        } : _j, _k = options.newlyAddedElement, newlyAddedElement = _k === void 0 ? false : _k;
        var _l = options.preserveWhiteSpace, preserveWhiteSpace = _l === void 0 ? true : _l;
        var _serializedNode = serializeNode(n3, {
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
          console.warn(n3, "not serialized");
          return null;
        }
        var id;
        if (mirror2.hasNode(n3)) {
          id = mirror2.getId(n3);
        } else if (slimDOMExcluded(_serializedNode, slimDOMOptions) || !preserveWhiteSpace && _serializedNode.type === NodeType$2.Text && !_serializedNode.isStyle && !_serializedNode.textContent.replace(/^\s+|\s+$/gm, "").length) {
          id = IGNORED_NODE;
        } else {
          id = genId();
        }
        var serializedNode = Object.assign(_serializedNode, { id });
        mirror2.add(n3, serializedNode);
        if (id === IGNORED_NODE) {
          return null;
        }
        if (onSerialize) {
          onSerialize(n3);
        }
        var recordChild = !skipChild;
        if (serializedNode.type === NodeType$2.Element) {
          recordChild = recordChild && !serializedNode.needBlock;
          delete serializedNode.needBlock;
          var shadowRoot = n3.shadowRoot;
          if (shadowRoot && isNativeShadowDom(shadowRoot))
            serializedNode.isShadowHost = true;
        }
        if ((serializedNode.type === NodeType$2.Document || serializedNode.type === NodeType$2.Element) && recordChild) {
          if (slimDOMOptions.headWhitespace && serializedNode.type === NodeType$2.Element && serializedNode.tagName === "head") {
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
          for (var _i = 0, _m = Array.from(n3.childNodes); _i < _m.length; _i++) {
            var childN = _m[_i];
            var serializedChildNode = serializeNodeWithId(childN, bypassOptions);
            if (serializedChildNode) {
              serializedNode.childNodes.push(serializedChildNode);
            }
          }
          if (isElement(n3) && n3.shadowRoot) {
            for (var _o = 0, _p = Array.from(n3.shadowRoot.childNodes); _o < _p.length; _o++) {
              var childN = _p[_o];
              var serializedChildNode = serializeNodeWithId(childN, bypassOptions);
              if (serializedChildNode) {
                isNativeShadowDom(n3.shadowRoot) && (serializedChildNode.isShadow = true);
                serializedNode.childNodes.push(serializedChildNode);
              }
            }
          }
        }
        if (n3.parentNode && isShadowRoot(n3.parentNode) && isNativeShadowDom(n3.parentNode)) {
          serializedNode.isShadow = true;
        }
        if (serializedNode.type === NodeType$2.Element && serializedNode.tagName === "iframe") {
          onceIframeLoaded(n3, function() {
            var iframeDoc = n3.contentDocument;
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
                onIframeLoad(n3, serializedIframeNode);
              }
            }
          }, iframeLoadTimeout);
        }
        if (serializedNode.type === NodeType$2.Element && serializedNode.tagName === "link" && serializedNode.attributes.rel === "stylesheet") {
          onceStylesheetLoaded(n3, function() {
            if (onStylesheetLoad) {
              var serializedLinkNode = serializeNodeWithId(n3, {
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
                onStylesheetLoad(n3, serializedLinkNode);
              }
            }
          }, stylesheetLoadTimeout);
        }
        return serializedNode;
      }
      function snapshot(n3, options) {
        var _a2 = options || {}, _b2 = _a2.mirror, mirror2 = _b2 === void 0 ? new Mirror$2() : _b2, _c = _a2.blockClass, blockClass = _c === void 0 ? "rr-block" : _c, _d = _a2.blockSelector, blockSelector = _d === void 0 ? null : _d, _e = _a2.maskTextClass, maskTextClass = _e === void 0 ? "rr-mask" : _e, _f = _a2.maskTextSelector, maskTextSelector = _f === void 0 ? null : _f, _g = _a2.inlineStylesheet, inlineStylesheet = _g === void 0 ? true : _g, _h = _a2.inlineImages, inlineImages = _h === void 0 ? false : _h, _j = _a2.recordCanvas, recordCanvas = _j === void 0 ? false : _j, _k = _a2.maskAllInputs, maskAllInputs = _k === void 0 ? false : _k, maskTextFn = _a2.maskTextFn, maskInputFn = _a2.maskInputFn, _l = _a2.slimDOM, slimDOM = _l === void 0 ? false : _l, dataURLOptions = _a2.dataURLOptions, preserveWhiteSpace = _a2.preserveWhiteSpace, onSerialize = _a2.onSerialize, onIframeLoad = _a2.onIframeLoad, iframeLoadTimeout = _a2.iframeLoadTimeout, onStylesheetLoad = _a2.onStylesheetLoad, stylesheetLoadTimeout = _a2.stylesheetLoadTimeout, _m = _a2.keepIframeSrcFn, keepIframeSrcFn = _m === void 0 ? function() {
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
        return serializeNodeWithId(n3, {
          doc: n3,
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
      var commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
      function parse(css, options) {
        if (options === void 0) {
          options = {};
        }
        var lineno = 1;
        var column = 1;
        function updatePosition(str) {
          var lines = str.match(/\n/g);
          if (lines) {
            lineno += lines.length;
          }
          var i3 = str.lastIndexOf("\n");
          column = i3 === -1 ? column + str.length : str.length - i3;
        }
        function position() {
          var start = { line: lineno, column };
          return function(node) {
            node.position = new Position(start);
            whitespace();
            return node;
          };
        }
        var Position = /* @__PURE__ */ function() {
          function Position2(start) {
            this.start = start;
            this.end = { line: lineno, column };
            this.source = options.source;
          }
          return Position2;
        }();
        Position.prototype.content = css;
        var errorsList = [];
        function error(msg) {
          var err = new Error("".concat(options.source || "", ":").concat(lineno, ":").concat(column, ": ").concat(msg));
          err.reason = msg;
          err.filename = options.source;
          err.line = lineno;
          err.column = column;
          err.source = css;
          if (options.silent) {
            errorsList.push(err);
          } else {
            throw err;
          }
        }
        function stylesheet() {
          var rulesList = rules2();
          return {
            type: "stylesheet",
            stylesheet: {
              source: options.source,
              rules: rulesList,
              parsingErrors: errorsList
            }
          };
        }
        function open() {
          return match(/^{\s*/);
        }
        function close() {
          return match(/^}/);
        }
        function rules2() {
          var node;
          var rules3 = [];
          whitespace();
          comments(rules3);
          while (css.length && css.charAt(0) !== "}" && (node = atrule() || rule())) {
            if (node) {
              rules3.push(node);
              comments(rules3);
            }
          }
          return rules3;
        }
        function match(re) {
          var m2 = re.exec(css);
          if (!m2) {
            return;
          }
          var str = m2[0];
          updatePosition(str);
          css = css.slice(str.length);
          return m2;
        }
        function whitespace() {
          match(/^\s*/);
        }
        function comments(rules3) {
          if (rules3 === void 0) {
            rules3 = [];
          }
          var c3;
          while (c3 = comment()) {
            if (c3) {
              rules3.push(c3);
            }
            c3 = comment();
          }
          return rules3;
        }
        function comment() {
          var pos = position();
          if ("/" !== css.charAt(0) || "*" !== css.charAt(1)) {
            return;
          }
          var i3 = 2;
          while ("" !== css.charAt(i3) && ("*" !== css.charAt(i3) || "/" !== css.charAt(i3 + 1))) {
            ++i3;
          }
          i3 += 2;
          if ("" === css.charAt(i3 - 1)) {
            return error("End of comment missing");
          }
          var str = css.slice(2, i3 - 2);
          column += 2;
          updatePosition(str);
          css = css.slice(i3);
          column += 2;
          return pos({
            type: "comment",
            comment: str
          });
        }
        function selector() {
          var m2 = match(/^([^{]+)/);
          if (!m2) {
            return;
          }
          return trim(m2[0]).replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, "").replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(m3) {
            return m3.replace(/,/g, "\u200C");
          }).split(/\s*(?![^(]*\)),\s*/).map(function(s3) {
            return s3.replace(/\u200C/g, ",");
          });
        }
        function declaration() {
          var pos = position();
          var propMatch = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
          if (!propMatch) {
            return;
          }
          var prop = trim(propMatch[0]);
          if (!match(/^:\s*/)) {
            return error("property missing ':'");
          }
          var val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);
          var ret = pos({
            type: "declaration",
            property: prop.replace(commentre, ""),
            value: val ? trim(val[0]).replace(commentre, "") : ""
          });
          match(/^[;\s]*/);
          return ret;
        }
        function declarations() {
          var decls = [];
          if (!open()) {
            return error("missing '{'");
          }
          comments(decls);
          var decl;
          while (decl = declaration()) {
            if (decl !== false) {
              decls.push(decl);
              comments(decls);
            }
            decl = declaration();
          }
          if (!close()) {
            return error("missing '}'");
          }
          return decls;
        }
        function keyframe() {
          var m2;
          var vals = [];
          var pos = position();
          while (m2 = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/)) {
            vals.push(m2[1]);
            match(/^,\s*/);
          }
          if (!vals.length) {
            return;
          }
          return pos({
            type: "keyframe",
            values: vals,
            declarations: declarations()
          });
        }
        function atkeyframes() {
          var pos = position();
          var m2 = match(/^@([-\w]+)?keyframes\s*/);
          if (!m2) {
            return;
          }
          var vendor = m2[1];
          m2 = match(/^([-\w]+)\s*/);
          if (!m2) {
            return error("@keyframes missing name");
          }
          var name = m2[1];
          if (!open()) {
            return error("@keyframes missing '{'");
          }
          var frame;
          var frames = comments();
          while (frame = keyframe()) {
            frames.push(frame);
            frames = frames.concat(comments());
          }
          if (!close()) {
            return error("@keyframes missing '}'");
          }
          return pos({
            type: "keyframes",
            name,
            vendor,
            keyframes: frames
          });
        }
        function atsupports() {
          var pos = position();
          var m2 = match(/^@supports *([^{]+)/);
          if (!m2) {
            return;
          }
          var supports = trim(m2[1]);
          if (!open()) {
            return error("@supports missing '{'");
          }
          var style = comments().concat(rules2());
          if (!close()) {
            return error("@supports missing '}'");
          }
          return pos({
            type: "supports",
            supports,
            rules: style
          });
        }
        function athost() {
          var pos = position();
          var m2 = match(/^@host\s*/);
          if (!m2) {
            return;
          }
          if (!open()) {
            return error("@host missing '{'");
          }
          var style = comments().concat(rules2());
          if (!close()) {
            return error("@host missing '}'");
          }
          return pos({
            type: "host",
            rules: style
          });
        }
        function atmedia() {
          var pos = position();
          var m2 = match(/^@media *([^{]+)/);
          if (!m2) {
            return;
          }
          var media = trim(m2[1]);
          if (!open()) {
            return error("@media missing '{'");
          }
          var style = comments().concat(rules2());
          if (!close()) {
            return error("@media missing '}'");
          }
          return pos({
            type: "media",
            media,
            rules: style
          });
        }
        function atcustommedia() {
          var pos = position();
          var m2 = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
          if (!m2) {
            return;
          }
          return pos({
            type: "custom-media",
            name: trim(m2[1]),
            media: trim(m2[2])
          });
        }
        function atpage() {
          var pos = position();
          var m2 = match(/^@page */);
          if (!m2) {
            return;
          }
          var sel = selector() || [];
          if (!open()) {
            return error("@page missing '{'");
          }
          var decls = comments();
          var decl;
          while (decl = declaration()) {
            decls.push(decl);
            decls = decls.concat(comments());
          }
          if (!close()) {
            return error("@page missing '}'");
          }
          return pos({
            type: "page",
            selectors: sel,
            declarations: decls
          });
        }
        function atdocument() {
          var pos = position();
          var m2 = match(/^@([-\w]+)?document *([^{]+)/);
          if (!m2) {
            return;
          }
          var vendor = trim(m2[1]);
          var doc = trim(m2[2]);
          if (!open()) {
            return error("@document missing '{'");
          }
          var style = comments().concat(rules2());
          if (!close()) {
            return error("@document missing '}'");
          }
          return pos({
            type: "document",
            document: doc,
            vendor,
            rules: style
          });
        }
        function atfontface() {
          var pos = position();
          var m2 = match(/^@font-face\s*/);
          if (!m2) {
            return;
          }
          if (!open()) {
            return error("@font-face missing '{'");
          }
          var decls = comments();
          var decl;
          while (decl = declaration()) {
            decls.push(decl);
            decls = decls.concat(comments());
          }
          if (!close()) {
            return error("@font-face missing '}'");
          }
          return pos({
            type: "font-face",
            declarations: decls
          });
        }
        var atimport = _compileAtrule("import");
        var atcharset = _compileAtrule("charset");
        var atnamespace = _compileAtrule("namespace");
        function _compileAtrule(name) {
          var re = new RegExp("^@" + name + "\\s*([^;]+);");
          return function() {
            var pos = position();
            var m2 = match(re);
            if (!m2) {
              return;
            }
            var ret = { type: name };
            ret[name] = m2[1].trim();
            return pos(ret);
          };
        }
        function atrule() {
          if (css[0] !== "@") {
            return;
          }
          return atkeyframes() || atmedia() || atcustommedia() || atsupports() || atimport() || atcharset() || atnamespace() || atdocument() || atpage() || athost() || atfontface();
        }
        function rule() {
          var pos = position();
          var sel = selector();
          if (!sel) {
            return error("selector missing");
          }
          comments();
          return pos({
            type: "rule",
            selectors: sel,
            declarations: declarations()
          });
        }
        return addParent(stylesheet());
      }
      function trim(str) {
        return str ? str.replace(/^\s+|\s+$/g, "") : "";
      }
      function addParent(obj, parent) {
        var isNode = obj && typeof obj.type === "string";
        var childParent = isNode ? obj : parent;
        for (var _i = 0, _a2 = Object.keys(obj); _i < _a2.length; _i++) {
          var k2 = _a2[_i];
          var value = obj[k2];
          if (Array.isArray(value)) {
            value.forEach(function(v3) {
              addParent(v3, childParent);
            });
          } else if (value && typeof value === "object") {
            addParent(value, childParent);
          }
        }
        if (isNode) {
          Object.defineProperty(obj, "parent", {
            configurable: true,
            writable: true,
            enumerable: false,
            value: parent || null
          });
        }
        return obj;
      }
      var tagMap = {
        script: "noscript",
        altglyph: "altGlyph",
        altglyphdef: "altGlyphDef",
        altglyphitem: "altGlyphItem",
        animatecolor: "animateColor",
        animatemotion: "animateMotion",
        animatetransform: "animateTransform",
        clippath: "clipPath",
        feblend: "feBlend",
        fecolormatrix: "feColorMatrix",
        fecomponenttransfer: "feComponentTransfer",
        fecomposite: "feComposite",
        feconvolvematrix: "feConvolveMatrix",
        fediffuselighting: "feDiffuseLighting",
        fedisplacementmap: "feDisplacementMap",
        fedistantlight: "feDistantLight",
        fedropshadow: "feDropShadow",
        feflood: "feFlood",
        fefunca: "feFuncA",
        fefuncb: "feFuncB",
        fefuncg: "feFuncG",
        fefuncr: "feFuncR",
        fegaussianblur: "feGaussianBlur",
        feimage: "feImage",
        femerge: "feMerge",
        femergenode: "feMergeNode",
        femorphology: "feMorphology",
        feoffset: "feOffset",
        fepointlight: "fePointLight",
        fespecularlighting: "feSpecularLighting",
        fespotlight: "feSpotLight",
        fetile: "feTile",
        feturbulence: "feTurbulence",
        foreignobject: "foreignObject",
        glyphref: "glyphRef",
        lineargradient: "linearGradient",
        radialgradient: "radialGradient"
      };
      function getTagName(n3) {
        var tagName = tagMap[n3.tagName] ? tagMap[n3.tagName] : n3.tagName;
        if (tagName === "link" && n3.attributes._cssText) {
          tagName = "style";
        }
        return tagName;
      }
      function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      var HOVER_SELECTOR = /([^\\]):hover/;
      var HOVER_SELECTOR_GLOBAL = new RegExp(HOVER_SELECTOR.source, "g");
      function addHoverClass(cssText, cache) {
        var cachedStyle = cache === null || cache === void 0 ? void 0 : cache.stylesWithHoverClass.get(cssText);
        if (cachedStyle)
          return cachedStyle;
        var ast = parse(cssText, {
          silent: true
        });
        if (!ast.stylesheet) {
          return cssText;
        }
        var selectors = [];
        ast.stylesheet.rules.forEach(function(rule) {
          if ("selectors" in rule) {
            (rule.selectors || []).forEach(function(selector) {
              if (HOVER_SELECTOR.test(selector)) {
                selectors.push(selector);
              }
            });
          }
        });
        if (selectors.length === 0) {
          return cssText;
        }
        var selectorMatcher = new RegExp(selectors.filter(function(selector, index) {
          return selectors.indexOf(selector) === index;
        }).sort(function(a3, b2) {
          return b2.length - a3.length;
        }).map(function(selector) {
          return escapeRegExp(selector);
        }).join("|"), "g");
        var result = cssText.replace(selectorMatcher, function(selector) {
          var newSelector = selector.replace(HOVER_SELECTOR_GLOBAL, "$1.\\:hover");
          return "".concat(selector, ", ").concat(newSelector);
        });
        cache === null || cache === void 0 ? void 0 : cache.stylesWithHoverClass.set(cssText, result);
        return result;
      }
      function createCache() {
        var stylesWithHoverClass = /* @__PURE__ */ new Map();
        return {
          stylesWithHoverClass
        };
      }
      function buildNode(n3, options) {
        var doc = options.doc, hackCss = options.hackCss, cache = options.cache;
        switch (n3.type) {
          case NodeType$2.Document:
            return doc.implementation.createDocument(null, "", null);
          case NodeType$2.DocumentType:
            return doc.implementation.createDocumentType(n3.name || "html", n3.publicId, n3.systemId);
          case NodeType$2.Element: {
            var tagName = getTagName(n3);
            var node_1;
            if (n3.isSVG) {
              node_1 = doc.createElementNS("http://www.w3.org/2000/svg", tagName);
            } else {
              node_1 = doc.createElement(tagName);
            }
            var specialAttributes = {};
            for (var name_1 in n3.attributes) {
              if (!Object.prototype.hasOwnProperty.call(n3.attributes, name_1)) {
                continue;
              }
              var value = n3.attributes[name_1];
              if (tagName === "option" && name_1 === "selected" && value === false) {
                continue;
              }
              if (value === null) {
                continue;
              }
              if (value === true)
                value = "";
              if (name_1.startsWith("rr_")) {
                specialAttributes[name_1] = value;
                continue;
              }
              var isTextarea = tagName === "textarea" && name_1 === "value";
              var isRemoteOrDynamicCss = tagName === "style" && name_1 === "_cssText";
              if (isRemoteOrDynamicCss && hackCss && typeof value === "string") {
                value = addHoverClass(value, cache);
              }
              if ((isTextarea || isRemoteOrDynamicCss) && typeof value === "string") {
                var child = doc.createTextNode(value);
                for (var _i = 0, _a2 = Array.from(node_1.childNodes); _i < _a2.length; _i++) {
                  var c3 = _a2[_i];
                  if (c3.nodeType === node_1.TEXT_NODE) {
                    node_1.removeChild(c3);
                  }
                }
                node_1.appendChild(child);
                continue;
              }
              try {
                if (n3.isSVG && name_1 === "xlink:href") {
                  node_1.setAttributeNS("http://www.w3.org/1999/xlink", name_1, value.toString());
                } else if (name_1 === "onload" || name_1 === "onclick" || name_1.substring(0, 7) === "onmouse") {
                  node_1.setAttribute("_" + name_1, value.toString());
                } else if (tagName === "meta" && n3.attributes["http-equiv"] === "Content-Security-Policy" && name_1 === "content") {
                  node_1.setAttribute("csp-content", value.toString());
                  continue;
                } else if (tagName === "link" && (n3.attributes.rel === "preload" || n3.attributes.rel === "modulepreload") && n3.attributes.as === "script") {
                } else if (tagName === "link" && n3.attributes.rel === "prefetch" && typeof n3.attributes.href === "string" && n3.attributes.href.endsWith(".js")) {
                } else if (tagName === "img" && n3.attributes.srcset && n3.attributes.rr_dataURL) {
                  node_1.setAttribute("rrweb-original-srcset", n3.attributes.srcset);
                } else {
                  node_1.setAttribute(name_1, value.toString());
                }
              } catch (error) {
              }
            }
            var _loop_1 = function(name_22) {
              var value2 = specialAttributes[name_22];
              if (tagName === "canvas" && name_22 === "rr_dataURL") {
                var image_1 = document.createElement("img");
                image_1.onload = function() {
                  var ctx = node_1.getContext("2d");
                  if (ctx) {
                    ctx.drawImage(image_1, 0, 0, image_1.width, image_1.height);
                  }
                };
                image_1.src = value2.toString();
                if (node_1.RRNodeType)
                  node_1.rr_dataURL = value2.toString();
              } else if (tagName === "img" && name_22 === "rr_dataURL") {
                var image = node_1;
                if (!image.currentSrc.startsWith("data:")) {
                  image.setAttribute("rrweb-original-src", n3.attributes.src);
                  image.src = value2.toString();
                }
              }
              if (name_22 === "rr_width") {
                node_1.style.width = value2.toString();
              } else if (name_22 === "rr_height") {
                node_1.style.height = value2.toString();
              } else if (name_22 === "rr_mediaCurrentTime" && typeof value2 === "number") {
                node_1.currentTime = value2;
              } else if (name_22 === "rr_mediaState") {
                switch (value2) {
                  case "played":
                    node_1.play()["catch"](function(e3) {
                      return console.warn("media playback error", e3);
                    });
                    break;
                  case "paused":
                    node_1.pause();
                    break;
                }
              }
            };
            for (var name_2 in specialAttributes) {
              _loop_1(name_2);
            }
            if (n3.isShadowHost) {
              if (!node_1.shadowRoot) {
                node_1.attachShadow({ mode: "open" });
              } else {
                while (node_1.shadowRoot.firstChild) {
                  node_1.shadowRoot.removeChild(node_1.shadowRoot.firstChild);
                }
              }
            }
            return node_1;
          }
          case NodeType$2.Text:
            return doc.createTextNode(n3.isStyle && hackCss ? addHoverClass(n3.textContent, cache) : n3.textContent);
          case NodeType$2.CDATA:
            return doc.createCDATASection(n3.textContent);
          case NodeType$2.Comment:
            return doc.createComment(n3.textContent);
          default:
            return null;
        }
      }
      function buildNodeWithSN(n3, options) {
        var doc = options.doc, mirror2 = options.mirror, _a2 = options.skipChild, skipChild = _a2 === void 0 ? false : _a2, _b2 = options.hackCss, hackCss = _b2 === void 0 ? true : _b2, afterAppend = options.afterAppend, cache = options.cache;
        if (mirror2.has(n3.id)) {
          var nodeInMirror = mirror2.getNode(n3.id);
          var meta = mirror2.getMeta(nodeInMirror);
          if (isNodeMetaEqual(meta, n3))
            return mirror2.getNode(n3.id);
        }
        var node = buildNode(n3, { doc, hackCss, cache });
        if (!node) {
          return null;
        }
        if (n3.rootId && mirror2.getNode(n3.rootId) !== doc) {
          mirror2.replace(n3.rootId, doc);
        }
        if (n3.type === NodeType$2.Document) {
          doc.close();
          doc.open();
          if (n3.compatMode === "BackCompat" && n3.childNodes && n3.childNodes[0].type !== NodeType$2.DocumentType) {
            if (n3.childNodes[0].type === NodeType$2.Element && "xmlns" in n3.childNodes[0].attributes && n3.childNodes[0].attributes.xmlns === "http://www.w3.org/1999/xhtml") {
              doc.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "">');
            } else {
              doc.write('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "">');
            }
          }
          node = doc;
        }
        mirror2.add(node, n3);
        if ((n3.type === NodeType$2.Document || n3.type === NodeType$2.Element) && !skipChild) {
          var _loop_2 = function(childN2) {
            var childNode = buildNodeWithSN(childN2, {
              doc,
              mirror: mirror2,
              skipChild: false,
              hackCss,
              afterAppend,
              cache
            });
            if (!childNode) {
              console.warn("Failed to rebuild", childN2);
              return "continue";
            }
            if (childN2.isShadow && isElement(node) && node.shadowRoot) {
              node.shadowRoot.appendChild(childNode);
            } else if (n3.type === NodeType$2.Document && childN2.type == NodeType$2.Element) {
              var htmlElement = childNode;
              var body_1 = null;
              htmlElement.childNodes.forEach(function(child) {
                if (child.nodeName === "BODY")
                  body_1 = child;
              });
              if (body_1) {
                htmlElement.removeChild(body_1);
                node.appendChild(childNode);
                htmlElement.appendChild(body_1);
              } else {
                node.appendChild(childNode);
              }
            } else {
              node.appendChild(childNode);
            }
            if (afterAppend) {
              afterAppend(childNode, childN2.id);
            }
          };
          for (var _i = 0, _c = n3.childNodes; _i < _c.length; _i++) {
            var childN = _c[_i];
            _loop_2(childN);
          }
        }
        return node;
      }
      function visit(mirror2, onVisit) {
        function walk(node) {
          onVisit(node);
        }
        for (var _i = 0, _a2 = mirror2.getIds(); _i < _a2.length; _i++) {
          var id = _a2[_i];
          if (mirror2.has(id)) {
            walk(mirror2.getNode(id));
          }
        }
      }
      function handleScroll(node, mirror2) {
        var n3 = mirror2.getMeta(node);
        if ((n3 === null || n3 === void 0 ? void 0 : n3.type) !== NodeType$2.Element) {
          return;
        }
        var el = node;
        for (var name_3 in n3.attributes) {
          if (!(Object.prototype.hasOwnProperty.call(n3.attributes, name_3) && name_3.startsWith("rr_"))) {
            continue;
          }
          var value = n3.attributes[name_3];
          if (name_3 === "rr_scrollLeft") {
            el.scrollLeft = value;
          }
          if (name_3 === "rr_scrollTop") {
            el.scrollTop = value;
          }
        }
      }
      function rebuild(n3, options) {
        var doc = options.doc, onVisit = options.onVisit, _a2 = options.hackCss, hackCss = _a2 === void 0 ? true : _a2, afterAppend = options.afterAppend, cache = options.cache, _b2 = options.mirror, mirror2 = _b2 === void 0 ? new Mirror$2() : _b2;
        var node = buildNodeWithSN(n3, {
          doc,
          mirror: mirror2,
          skipChild: false,
          hackCss,
          afterAppend,
          cache
        });
        visit(mirror2, function(visitedNode) {
          if (onVisit) {
            onVisit(visitedNode);
          }
          handleScroll(visitedNode, mirror2);
        });
        return node;
      }
      function on(type, fn, target = document) {
        const options = { capture: true, passive: true };
        target.addEventListener(type, fn, options);
        return () => target.removeEventListener(type, fn, options);
      }
      var DEPARTED_MIRROR_ACCESS_WARNING = "Please stop import mirror directly. Instead of that,\r\nnow you can use replayer.getMirror() to access the mirror instance of a replayer,\r\nor you can use record.mirror to access the mirror instance during recording.";
      exports.mirror = {
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
        exports.mirror = new Proxy(exports.mirror, {
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
        } catch (_a2) {
          return () => {
          };
        }
      }
      var nowTimestamp = Date.now;
      if (!/[1-9][0-9]{12}/.test(Date.now().toString())) {
        nowTimestamp = () => (/* @__PURE__ */ new Date()).getTime();
      }
      function getWindowScroll(win) {
        var _a2, _b2, _c, _d, _e, _f;
        const doc = win.document;
        return {
          left: doc.scrollingElement ? doc.scrollingElement.scrollLeft : win.pageXOffset !== void 0 ? win.pageXOffset : (doc === null || doc === void 0 ? void 0 : doc.documentElement.scrollLeft) || ((_b2 = (_a2 = doc === null || doc === void 0 ? void 0 : doc.body) === null || _a2 === void 0 ? void 0 : _a2.parentElement) === null || _b2 === void 0 ? void 0 : _b2.scrollLeft) || ((_c = doc === null || doc === void 0 ? void 0 : doc.body) === null || _c === void 0 ? void 0 : _c.scrollLeft) || 0,
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
        } catch (e3) {
        }
        if (blockSelector) {
          if (el.matches(blockSelector))
            return true;
          if (checkAncestors && el.closest(blockSelector) !== null)
            return true;
        }
        return false;
      }
      function isSerialized(n3, mirror2) {
        return mirror2.getId(n3) !== -1;
      }
      function isIgnored(n3, mirror2) {
        return mirror2.getId(n3) === IGNORED_NODE;
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
      function polyfill$1(win = window) {
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
      function queueToResolveTrees(queue) {
        const queueNodeMap = {};
        const putIntoMap = (m2, parent) => {
          const nodeInTree = {
            value: m2,
            parent,
            children: []
          };
          queueNodeMap[m2.node.id] = nodeInTree;
          return nodeInTree;
        };
        const queueNodeTrees = [];
        for (const mutation of queue) {
          const { nextId, parentId } = mutation;
          if (nextId && nextId in queueNodeMap) {
            const nextInTree = queueNodeMap[nextId];
            if (nextInTree.parent) {
              const idx = nextInTree.parent.children.indexOf(nextInTree);
              nextInTree.parent.children.splice(idx, 0, putIntoMap(mutation, nextInTree.parent));
            } else {
              const idx = queueNodeTrees.indexOf(nextInTree);
              queueNodeTrees.splice(idx, 0, putIntoMap(mutation, null));
            }
            continue;
          }
          if (parentId in queueNodeMap) {
            const parentInTree = queueNodeMap[parentId];
            parentInTree.children.push(putIntoMap(mutation, parentInTree));
            continue;
          }
          queueNodeTrees.push(putIntoMap(mutation, null));
        }
        return queueNodeTrees;
      }
      function iterateResolveTree(tree, cb) {
        cb(tree.value);
        for (let i3 = tree.children.length - 1; i3 >= 0; i3--) {
          iterateResolveTree(tree.children[i3], cb);
        }
      }
      function isSerializedIframe(n3, mirror2) {
        return Boolean(n3.nodeName === "IFRAME" && mirror2.getMeta(n3));
      }
      function isSerializedStylesheet(n3, mirror2) {
        return Boolean(n3.nodeName === "LINK" && n3.nodeType === n3.ELEMENT_NODE && n3.getAttribute && n3.getAttribute("rel") === "stylesheet" && mirror2.getMeta(n3));
      }
      function getBaseDimension(node, rootIframe) {
        var _a2, _b2;
        const frameElement = (_b2 = (_a2 = node.ownerDocument) === null || _a2 === void 0 ? void 0 : _a2.defaultView) === null || _b2 === void 0 ? void 0 : _b2.frameElement;
        if (!frameElement || frameElement === rootIframe) {
          return {
            x: 0,
            y: 0,
            relativeScale: 1,
            absoluteScale: 1
          };
        }
        const frameDimension = frameElement.getBoundingClientRect();
        const frameBaseDimension = getBaseDimension(frameElement, rootIframe);
        const relativeScale = frameDimension.height / frameElement.clientHeight;
        return {
          x: frameDimension.x * frameBaseDimension.relativeScale + frameBaseDimension.x,
          y: frameDimension.y * frameBaseDimension.relativeScale + frameBaseDimension.y,
          relativeScale,
          absoluteScale: frameBaseDimension.absoluteScale * relativeScale
        };
      }
      function hasShadowRoot(n3) {
        return Boolean(n3 === null || n3 === void 0 ? void 0 : n3.shadowRoot);
      }
      function getNestedRule(rules2, position) {
        const rule = rules2[position[0]];
        if (position.length === 1) {
          return rule;
        } else {
          return getNestedRule(rule.cssRules[position[1]].cssRules, position.slice(2));
        }
      }
      function getPositionsAndIndex(nestedIndex) {
        const positions = [...nestedIndex];
        const index = positions.pop();
        return { positions, index };
      }
      function uniqueTextMutations(mutations) {
        const idSet = /* @__PURE__ */ new Set();
        const uniqueMutations = [];
        for (let i3 = mutations.length; i3--; ) {
          const mutation = mutations[i3];
          if (!idSet.has(mutation.id)) {
            uniqueMutations.push(mutation);
            idSet.add(mutation.id);
          }
        }
        return uniqueMutations;
      }
      var StyleSheetMirror = class {
        constructor() {
          this.id = 1;
          this.styleIDMap = /* @__PURE__ */ new WeakMap();
          this.idStyleMap = /* @__PURE__ */ new Map();
        }
        getId(stylesheet) {
          var _a2;
          return (_a2 = this.styleIDMap.get(stylesheet)) !== null && _a2 !== void 0 ? _a2 : -1;
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
      function getShadowHost(n3) {
        var _a2, _b2;
        let shadowHost = null;
        if (((_b2 = (_a2 = n3.getRootNode) === null || _a2 === void 0 ? void 0 : _a2.call(n3)) === null || _b2 === void 0 ? void 0 : _b2.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && n3.getRootNode().host)
          shadowHost = n3.getRootNode().host;
        return shadowHost;
      }
      function getRootShadowHost(n3) {
        let rootShadowHost = n3;
        let shadowHost;
        while (shadowHost = getShadowHost(rootShadowHost))
          rootShadowHost = shadowHost;
        return rootShadowHost;
      }
      function shadowHostInDom(n3) {
        const doc = n3.ownerDocument;
        if (!doc)
          return false;
        const shadowHost = getRootShadowHost(n3);
        return doc.contains(shadowHost);
      }
      function inDom(n3) {
        const doc = n3.ownerDocument;
        if (!doc)
          return false;
        return doc.contains(n3) || shadowHostInDom(n3);
      }
      var utils = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        on,
        get _mirror() {
          return exports.mirror;
        },
        throttle,
        hookSetter,
        patch,
        get nowTimestamp() {
          return nowTimestamp;
        },
        getWindowScroll,
        getWindowHeight,
        getWindowWidth,
        isBlocked,
        isSerialized,
        isIgnored,
        isAncestorRemoved,
        legacy_isTouchEvent,
        polyfill: polyfill$1,
        queueToResolveTrees,
        iterateResolveTree,
        isSerializedIframe,
        isSerializedStylesheet,
        getBaseDimension,
        hasShadowRoot,
        getNestedRule,
        getPositionsAndIndex,
        uniqueTextMutations,
        StyleSheetMirror,
        getShadowHost,
        getRootShadowHost,
        shadowHostInDom,
        inDom
      });
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
      var ReplayerEvents = /* @__PURE__ */ ((ReplayerEvents2) => {
        ReplayerEvents2["Start"] = "start";
        ReplayerEvents2["Pause"] = "pause";
        ReplayerEvents2["Resume"] = "resume";
        ReplayerEvents2["Resize"] = "resize";
        ReplayerEvents2["Finish"] = "finish";
        ReplayerEvents2["FullsnapshotRebuilded"] = "fullsnapshot-rebuilded";
        ReplayerEvents2["LoadStylesheetStart"] = "load-stylesheet-start";
        ReplayerEvents2["LoadStylesheetEnd"] = "load-stylesheet-end";
        ReplayerEvents2["SkipStart"] = "skip-start";
        ReplayerEvents2["SkipEnd"] = "skip-end";
        ReplayerEvents2["MouseInteraction"] = "mouse-interaction";
        ReplayerEvents2["EventCast"] = "event-cast";
        ReplayerEvents2["CustomEvent"] = "custom-event";
        ReplayerEvents2["Flush"] = "flush";
        ReplayerEvents2["StateChange"] = "state-change";
        ReplayerEvents2["PlayBack"] = "play-back";
        ReplayerEvents2["Destroy"] = "destroy";
        return ReplayerEvents2;
      })(ReplayerEvents || {});
      function isNodeInLinkedList(n3) {
        return "__ln" in n3;
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
        addNode(n3) {
          const node = {
            value: n3,
            previous: null,
            next: null
          };
          n3.__ln = node;
          if (n3.previousSibling && isNodeInLinkedList(n3.previousSibling)) {
            const current = n3.previousSibling.__ln.next;
            node.next = current;
            node.previous = n3.previousSibling.__ln;
            n3.previousSibling.__ln.next = node;
            if (current) {
              current.previous = node;
            }
          } else if (n3.nextSibling && isNodeInLinkedList(n3.nextSibling) && n3.nextSibling.__ln.previous) {
            const current = n3.nextSibling.__ln.previous;
            node.previous = current;
            node.next = n3.nextSibling.__ln;
            n3.nextSibling.__ln.previous = node;
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
        removeNode(n3) {
          const current = n3.__ln;
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
          if (n3.__ln) {
            delete n3.__ln;
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
            const getNextId = (n3) => {
              let ns = n3;
              let nextId = IGNORED_NODE;
              while (nextId === IGNORED_NODE) {
                ns = ns && ns.nextSibling;
                nextId = ns && this.mirror.getId(ns);
              }
              return nextId;
            };
            const pushAdd = (n3) => {
              if (!n3.parentNode || !inDom(n3)) {
                return;
              }
              const parentId = isShadowRoot(n3.parentNode) ? this.mirror.getId(getShadowHost(n3)) : this.mirror.getId(n3.parentNode);
              const nextId = getNextId(n3);
              if (parentId === -1 || nextId === -1) {
                return addList.addNode(n3);
              }
              const sn = serializeNodeWithId(n3, {
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
                  if (hasShadowRoot(n3)) {
                    this.shadowDomManager.addShadowRoot(n3.shadowRoot, this.doc);
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
            for (const n3 of this.movedSet) {
              if (isParentRemoved(this.removes, n3, this.mirror) && !this.movedSet.has(n3.parentNode)) {
                continue;
              }
              pushAdd(n3);
            }
            for (const n3 of this.addedSet) {
              if (!isAncestorInSet(this.droppedSet, n3) && !isParentRemoved(this.removes, n3, this.mirror)) {
                pushAdd(n3);
              } else if (isAncestorInSet(this.movedSet, n3)) {
                pushAdd(n3);
              } else {
                this.droppedSet.add(n3);
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
            } catch (e3) {
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
                let item = this.attributes.find((a3) => a3.node === m2.target);
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
                m2.addedNodes.forEach((n3) => this.genAdds(n3, m2.target));
                m2.removedNodes.forEach((n3) => {
                  const nodeId = this.mirror.getId(n3);
                  const parentId = isShadowRoot(m2.target) ? this.mirror.getId(m2.target.host) : this.mirror.getId(m2.target);
                  if (isBlocked(m2.target, this.blockClass, this.blockSelector, false) || isIgnored(n3, this.mirror) || !isSerialized(n3, this.mirror)) {
                    return;
                  }
                  if (this.addedSet.has(n3)) {
                    deepDelete(this.addedSet, n3);
                    this.droppedSet.add(n3);
                  } else if (this.addedSet.has(m2.target) && nodeId === -1) ;
                  else if (isAncestorRemoved(m2.target, this.mirror)) ;
                  else if (this.movedSet.has(n3) && this.movedMap[moveKey(nodeId, parentId)]) {
                    deepDelete(this.movedSet, n3);
                  } else {
                    this.removes.push({
                      parentId,
                      id: nodeId,
                      isShadow: isShadowRoot(m2.target) && isNativeShadowDom(m2.target) ? true : void 0
                    });
                  }
                  this.mapRemoves.push(n3);
                });
                break;
              }
            }
          };
          this.genAdds = (n3, target) => {
            if (this.processedNodeManager.inOtherBuffer(n3, this))
              return;
            if (this.addedSet.has(n3) || this.movedSet.has(n3))
              return;
            if (this.mirror.hasNode(n3)) {
              if (isIgnored(n3, this.mirror)) {
                return;
              }
              this.movedSet.add(n3);
              let targetId = null;
              if (target && this.mirror.hasNode(target)) {
                targetId = this.mirror.getId(target);
              }
              if (targetId && targetId !== -1) {
                this.movedMap[moveKey(this.mirror.getId(n3), targetId)] = true;
              }
            } else {
              this.addedSet.add(n3);
              this.droppedSet.delete(n3);
            }
            if (!isBlocked(n3, this.blockClass, this.blockSelector, false)) {
              n3.childNodes.forEach((childN) => this.genAdds(childN));
              if (hasShadowRoot(n3)) {
                n3.shadowRoot.childNodes.forEach((childN) => {
                  this.processedNodeManager.add(childN, this);
                  this.genAdds(childN, n3);
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
      function deepDelete(addsSet, n3) {
        addsSet.delete(n3);
        n3.childNodes.forEach((childN) => deepDelete(addsSet, childN));
      }
      function isParentRemoved(removes, n3, mirror2) {
        if (removes.length === 0)
          return false;
        return _isParentRemoved(removes, n3, mirror2);
      }
      function _isParentRemoved(removes, n3, mirror2) {
        const { parentNode } = n3;
        if (!parentNode) {
          return false;
        }
        const parentId = mirror2.getId(parentNode);
        if (removes.some((r3) => r3.id === parentId)) {
          return true;
        }
        return _isParentRemoved(removes, parentNode, mirror2);
      }
      function isAncestorInSet(set, n3) {
        if (set.size === 0)
          return false;
        return _isAncestorInSet(set, n3);
      }
      function _isAncestorInSet(set, n3) {
        const { parentNode } = n3;
        if (!parentNode) {
          return false;
        }
        if (set.has(parentNode)) {
          return true;
        }
        return _isAncestorInSet(set, parentNode);
      }
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
        } catch (_a2) {
        }
        return event && event.target;
      }
      function initMutationObserver(options, rootEl) {
        var _a2, _b2;
        const mutationBuffer = new MutationBuffer();
        mutationBuffers.push(mutationBuffer);
        mutationBuffer.init(options);
        let mutationObserverCtor = window.MutationObserver || window.__rrMutationObserver;
        const angularZoneSymbol = (_b2 = (_a2 = window === null || window === void 0 ? void 0 : window.Zone) === null || _a2 === void 0 ? void 0 : _a2.__symbol__) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, "MutationObserver");
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
            const e3 = legacy_isTouchEvent(event) ? event.changedTouches[0] : event;
            if (!e3) {
              return;
            }
            const id = mirror2.getId(target);
            const { clientX, clientY } = e3;
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
      function wrapEventWithUserTriggeredFlag(v3, enable) {
        const value = Object.assign({}, v3);
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
        function cbWithDedup(target, v3) {
          const lastInputValue = lastInputValueMap.get(target);
          if (!lastInputValue || lastInputValue.text !== v3.text || lastInputValue.isChecked !== v3.isChecked) {
            lastInputValueMap.set(target, v3);
            const id = mirror2.getId(target);
            callbackWrapper(inputCb)(Object.assign(Object.assign({}, v3), { id }));
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
            const rules2 = Array.from(childRule.parentRule.cssRules);
            const index = rules2.indexOf(childRule);
            pos.unshift(index);
          } else if (childRule.parentStyleSheet) {
            const rules2 = Array.from(childRule.parentStyleSheet.cssRules);
            const index = rules2.indexOf(childRule);
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
        var _a2, _b2, _c;
        let hostId = null;
        if (host.nodeName === "#document")
          hostId = mirror2.getId(host);
        else
          hostId = mirror2.getId(host.host);
        const patchTarget = host.nodeName === "#document" ? (_a2 = host.defaultView) === null || _a2 === void 0 ? void 0 : _a2.Document : (_c = (_b2 = host.ownerDocument) === null || _b2 === void 0 ? void 0 : _b2.defaultView) === null || _c === void 0 ? void 0 : _c.ShadowRoot;
        const originalPropertyDescriptor = Object.getOwnPropertyDescriptor(patchTarget === null || patchTarget === void 0 ? void 0 : patchTarget.prototype, "adoptedStyleSheets");
        if (hostId === null || hostId === -1 || !patchTarget || !originalPropertyDescriptor)
          return () => {
          };
        Object.defineProperty(host, "adoptedStyleSheets", {
          configurable: originalPropertyDescriptor.configurable,
          enumerable: originalPropertyDescriptor.enumerable,
          get() {
            var _a3;
            return (_a3 = originalPropertyDescriptor.get) === null || _a3 === void 0 ? void 0 : _a3.call(this);
          },
          set(sheets) {
            var _a3;
            const result = (_a3 = originalPropertyDescriptor.set) === null || _a3 === void 0 ? void 0 : _a3.call(this, sheets);
            if (hostId !== null && hostId !== -1) {
              try {
                stylesheetManager.adoptStyleSheets(sheets, hostId);
              } catch (e3) {
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
            var _a2;
            const [property, value, priority] = argumentsList;
            if (ignoreCSSAttributes.has(property)) {
              return setProperty.apply(thisArg, [property, value, priority]);
            }
            const { id, styleId } = getIdAndStyleId((_a2 = thisArg.parentRule) === null || _a2 === void 0 ? void 0 : _a2.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
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
            var _a2;
            const [property] = argumentsList;
            if (ignoreCSSAttributes.has(property)) {
              return removeProperty.apply(thisArg, [property]);
            }
            const { id, styleId } = getIdAndStyleId((_a2 = thisArg.parentRule) === null || _a2 === void 0 ? void 0 : _a2.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
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
        win.FontFace = function FontFace2(family, source, descriptors) {
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
          for (let i3 = 0; i3 < count; i3++) {
            const range = selection.getRangeAt(i3);
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
      function mergeHooks(o3, hooks) {
        const { mutationCb, mousemoveCb, mouseInteractionCb, scrollCb, viewportResizeCb, inputCb, mediaInteractionCb, styleSheetRuleCb, styleDeclarationCb, canvasMutationCb, fontCb, selectionCb } = o3;
        o3.mutationCb = (...p2) => {
          if (hooks.mutation) {
            hooks.mutation(...p2);
          }
          mutationCb(...p2);
        };
        o3.mousemoveCb = (...p2) => {
          if (hooks.mousemove) {
            hooks.mousemove(...p2);
          }
          mousemoveCb(...p2);
        };
        o3.mouseInteractionCb = (...p2) => {
          if (hooks.mouseInteraction) {
            hooks.mouseInteraction(...p2);
          }
          mouseInteractionCb(...p2);
        };
        o3.scrollCb = (...p2) => {
          if (hooks.scroll) {
            hooks.scroll(...p2);
          }
          scrollCb(...p2);
        };
        o3.viewportResizeCb = (...p2) => {
          if (hooks.viewportResize) {
            hooks.viewportResize(...p2);
          }
          viewportResizeCb(...p2);
        };
        o3.inputCb = (...p2) => {
          if (hooks.input) {
            hooks.input(...p2);
          }
          inputCb(...p2);
        };
        o3.mediaInteractionCb = (...p2) => {
          if (hooks.mediaInteaction) {
            hooks.mediaInteaction(...p2);
          }
          mediaInteractionCb(...p2);
        };
        o3.styleSheetRuleCb = (...p2) => {
          if (hooks.styleSheetRule) {
            hooks.styleSheetRule(...p2);
          }
          styleSheetRuleCb(...p2);
        };
        o3.styleDeclarationCb = (...p2) => {
          if (hooks.styleDeclaration) {
            hooks.styleDeclaration(...p2);
          }
          styleDeclarationCb(...p2);
        };
        o3.canvasMutationCb = (...p2) => {
          if (hooks.canvasMutation) {
            hooks.canvasMutation(...p2);
          }
          canvasMutationCb(...p2);
        };
        o3.fontCb = (...p2) => {
          if (hooks.font) {
            hooks.font(...p2);
          }
          fontCb(...p2);
        };
        o3.selectionCb = (...p2) => {
          if (hooks.selection) {
            hooks.selection(...p2);
          }
          selectionCb(...p2);
        };
      }
      function initObservers(o3, hooks = {}) {
        const currentWindow = o3.doc.defaultView;
        if (!currentWindow) {
          return () => {
          };
        }
        mergeHooks(o3, hooks);
        const mutationObserver = initMutationObserver(o3, o3.doc);
        const mousemoveHandler = initMoveObserver(o3);
        const mouseInteractionHandler = initMouseInteractionObserver(o3);
        const scrollHandler = initScrollObserver(o3);
        const viewportResizeHandler = initViewportResizeObserver(o3, {
          win: currentWindow
        });
        const inputHandler = initInputObserver(o3);
        const mediaInteractionHandler = initMediaInteractionObserver(o3);
        const styleSheetObserver = initStyleSheetObserver(o3, { win: currentWindow });
        const adoptedStyleSheetObserver = initAdoptedStyleSheetObserver(o3, o3.doc);
        const styleDeclarationObserver = initStyleDeclarationObserver(o3, {
          win: currentWindow
        });
        const fontObserver = o3.collectFonts ? initFontObserver(o3) : () => {
        };
        const selectionObserver = initSelectionObserver(o3);
        const pluginHandlers = [];
        for (const plugin of o3.plugins) {
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
          var _a2;
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
          (_a2 = this.loadListener) === null || _a2 === void 0 ? void 0 : _a2.call(this, iframeEl);
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
        transformCrossOriginEvent(iframeEl, e3) {
          var _a2;
          switch (e3.type) {
            case EventType.FullSnapshot: {
              this.crossOriginIframeMirror.reset(iframeEl);
              this.crossOriginIframeStyleMirror.reset(iframeEl);
              this.replaceIdOnNode(e3.data.node, iframeEl);
              const rootId = e3.data.node.id;
              this.crossOriginIframeRootIdMap.set(iframeEl, rootId);
              this.patchRootIdOnNode(e3.data.node, rootId);
              return {
                timestamp: e3.timestamp,
                type: EventType.IncrementalSnapshot,
                data: {
                  source: IncrementalSource.Mutation,
                  adds: [
                    {
                      parentId: this.mirror.getId(iframeEl),
                      nextId: null,
                      node: e3.data.node
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
              return e3;
            }
            case EventType.Custom: {
              this.replaceIds(e3.data.payload, iframeEl, ["id", "parentId", "previousId", "nextId"]);
              return e3;
            }
            case EventType.IncrementalSnapshot: {
              switch (e3.data.source) {
                case IncrementalSource.Mutation: {
                  e3.data.adds.forEach((n3) => {
                    this.replaceIds(n3, iframeEl, [
                      "parentId",
                      "nextId",
                      "previousId"
                    ]);
                    this.replaceIdOnNode(n3.node, iframeEl);
                    const rootId = this.crossOriginIframeRootIdMap.get(iframeEl);
                    rootId && this.patchRootIdOnNode(n3.node, rootId);
                  });
                  e3.data.removes.forEach((n3) => {
                    this.replaceIds(n3, iframeEl, ["parentId", "id"]);
                  });
                  e3.data.attributes.forEach((n3) => {
                    this.replaceIds(n3, iframeEl, ["id"]);
                  });
                  e3.data.texts.forEach((n3) => {
                    this.replaceIds(n3, iframeEl, ["id"]);
                  });
                  return e3;
                }
                case IncrementalSource.Drag:
                case IncrementalSource.TouchMove:
                case IncrementalSource.MouseMove: {
                  e3.data.positions.forEach((p2) => {
                    this.replaceIds(p2, iframeEl, ["id"]);
                  });
                  return e3;
                }
                case IncrementalSource.ViewportResize: {
                  return false;
                }
                case IncrementalSource.MediaInteraction:
                case IncrementalSource.MouseInteraction:
                case IncrementalSource.Scroll:
                case IncrementalSource.CanvasMutation:
                case IncrementalSource.Input: {
                  this.replaceIds(e3.data, iframeEl, ["id"]);
                  return e3;
                }
                case IncrementalSource.StyleSheetRule:
                case IncrementalSource.StyleDeclaration: {
                  this.replaceIds(e3.data, iframeEl, ["id"]);
                  this.replaceStyleIds(e3.data, iframeEl, ["styleId"]);
                  return e3;
                }
                case IncrementalSource.Font: {
                  return e3;
                }
                case IncrementalSource.Selection: {
                  e3.data.ranges.forEach((range) => {
                    this.replaceIds(range, iframeEl, ["start", "end"]);
                  });
                  return e3;
                }
                case IncrementalSource.AdoptedStyleSheet: {
                  this.replaceIds(e3.data, iframeEl, ["id"]);
                  this.replaceStyleIds(e3.data, iframeEl, ["styleIds"]);
                  (_a2 = e3.data.styles) === null || _a2 === void 0 ? void 0 : _a2.forEach((style) => {
                    this.replaceStyleIds(style, iframeEl, ["styleId"]);
                  });
                  return e3;
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
          if (node.type !== NodeType$2.Document && !node.rootId)
            node.rootId = rootId;
          if ("childNodes" in node) {
            node.childNodes.forEach((child) => {
              this.patchRootIdOnNode(child, rootId);
            });
          }
        }
      };
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
            } catch (e3) {
            }
          });
          this.restoreHandlers = [];
          this.shadowDoms = /* @__PURE__ */ new WeakSet();
        }
      };
      function __rest(s3, e3) {
        var t3 = {};
        for (var p2 in s3) if (Object.prototype.hasOwnProperty.call(s3, p2) && e3.indexOf(p2) < 0)
          t3[p2] = s3[p2];
        if (s3 != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i3 = 0, p2 = Object.getOwnPropertySymbols(s3); i3 < p2.length; i3++) {
            if (e3.indexOf(p2[i3]) < 0 && Object.prototype.propertyIsEnumerable.call(s3, p2[i3]))
              t3[p2[i3]] = s3[p2[i3]];
          }
        return t3;
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
            } catch (e3) {
              reject(e3);
            }
          }
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e3) {
              reject(e3);
            }
          }
          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      }
      var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
      for (i$2 = 0; i$2 < chars.length; i$2++) {
        lookup[chars.charCodeAt(i$2)] = i$2;
      }
      var i$2;
      var encode = function(arraybuffer) {
        var bytes = new Uint8Array(arraybuffer), i3, len = bytes.length, base64 = "";
        for (i3 = 0; i3 < len; i3 += 3) {
          base64 += chars[bytes[i3] >> 2];
          base64 += chars[(bytes[i3] & 3) << 4 | bytes[i3 + 1] >> 4];
          base64 += chars[(bytes[i3 + 1] & 15) << 2 | bytes[i3 + 2] >> 6];
          base64 += chars[bytes[i3 + 2] & 63];
        }
        if (len % 3 === 2) {
          base64 = base64.substring(0, base64.length - 1) + "=";
        } else if (len % 3 === 1) {
          base64 = base64.substring(0, base64.length - 2) + "==";
        }
        return base64;
      };
      var decode = function(base64) {
        var bufferLength = base64.length * 0.75, len = base64.length, i3, p2 = 0, encoded1, encoded2, encoded3, encoded4;
        if (base64[base64.length - 1] === "=") {
          bufferLength--;
          if (base64[base64.length - 2] === "=") {
            bufferLength--;
          }
        }
        var arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
        for (i3 = 0; i3 < len; i3 += 4) {
          encoded1 = lookup[base64.charCodeAt(i3)];
          encoded2 = lookup[base64.charCodeAt(i3 + 1)];
          encoded3 = lookup[base64.charCodeAt(i3 + 2)];
          encoded4 = lookup[base64.charCodeAt(i3 + 3)];
          bytes[p2++] = encoded1 << 2 | encoded2 >> 4;
          bytes[p2++] = (encoded2 & 15) << 4 | encoded3 >> 2;
          bytes[p2++] = (encoded3 & 3) << 6 | encoded4 & 63;
        }
        return arraybuffer;
      };
      var canvasVarMap = /* @__PURE__ */ new Map();
      function variableListFor$1(ctx, ctor) {
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
        const list = variableListFor$1(ctx, name);
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
          } catch (_a2) {
            const hookHandler = hookSetter(win.CanvasRenderingContext2D.prototype, prop, {
              set(v3) {
                cb(this.canvas, {
                  type: CanvasContext["2D"],
                  property: prop,
                  args: [v3],
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
        } catch (_a2) {
          console.error("failed to patch HTMLCanvasElement.prototype.getContext");
        }
        return () => {
          handlers.forEach((h2) => h2());
        };
      }
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
          } catch (_a2) {
            const hookHandler = hookSetter(prototype, prop, {
              set(v3) {
                cb(this.canvas, {
                  type,
                  property: prop,
                  args: [v3],
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
      function decodeBase64(base64, enableUnicode) {
        var binaryString = atob(base64);
        if (enableUnicode) {
          var binaryView = new Uint8Array(binaryString.length);
          for (var i3 = 0, n3 = binaryString.length; i3 < n3; ++i3) {
            binaryView[i3] = binaryString.charCodeAt(i3);
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
      var WorkerFactory = createBase64WorkerFactory("Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICAgJ3VzZSBzdHJpY3QnOwoKICAgIC8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLg0KDQogICAgUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55DQogICAgcHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLg0KDQogICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICJBUyBJUyIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEgNCiAgICBSRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkNCiAgICBBTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsDQogICAgSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NDQogICAgTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1INCiAgICBPVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SDQogICAgUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS4NCiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqLw0KDQogICAgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikgew0KICAgICAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH0NCiAgICAgICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7DQogICAgICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9DQogICAgICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvclsidGhyb3ciXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9DQogICAgICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfQ0KICAgICAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpOw0KICAgICAgICB9KTsNCiAgICB9CgogICAgLyoKICAgICAqIGJhc2U2NC1hcnJheWJ1ZmZlciAxLjAuMSA8aHR0cHM6Ly9naXRodWIuY29tL25pa2xhc3ZoL2Jhc2U2NC1hcnJheWJ1ZmZlcj4KICAgICAqIENvcHlyaWdodCAoYykgMjAyMSBOaWtsYXMgdm9uIEhlcnR6ZW4gPGh0dHBzOi8vaGVydHplbi5jb20+CiAgICAgKiBSZWxlYXNlZCB1bmRlciBNSVQgTGljZW5zZQogICAgICovCiAgICB2YXIgY2hhcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7CiAgICAvLyBVc2UgYSBsb29rdXAgdGFibGUgdG8gZmluZCB0aGUgaW5kZXguCiAgICB2YXIgbG9va3VwID0gdHlwZW9mIFVpbnQ4QXJyYXkgPT09ICd1bmRlZmluZWQnID8gW10gOiBuZXcgVWludDhBcnJheSgyNTYpOwogICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkrKykgewogICAgICAgIGxvb2t1cFtjaGFycy5jaGFyQ29kZUF0KGkpXSA9IGk7CiAgICB9CiAgICB2YXIgZW5jb2RlID0gZnVuY3Rpb24gKGFycmF5YnVmZmVyKSB7CiAgICAgICAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlidWZmZXIpLCBpLCBsZW4gPSBieXRlcy5sZW5ndGgsIGJhc2U2NCA9ICcnOwogICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMykgewogICAgICAgICAgICBiYXNlNjQgKz0gY2hhcnNbYnl0ZXNbaV0gPj4gMl07CiAgICAgICAgICAgIGJhc2U2NCArPSBjaGFyc1soKGJ5dGVzW2ldICYgMykgPDwgNCkgfCAoYnl0ZXNbaSArIDFdID4+IDQpXTsKICAgICAgICAgICAgYmFzZTY0ICs9IGNoYXJzWygoYnl0ZXNbaSArIDFdICYgMTUpIDw8IDIpIHwgKGJ5dGVzW2kgKyAyXSA+PiA2KV07CiAgICAgICAgICAgIGJhc2U2NCArPSBjaGFyc1tieXRlc1tpICsgMl0gJiA2M107CiAgICAgICAgfQogICAgICAgIGlmIChsZW4gJSAzID09PSAyKSB7CiAgICAgICAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDEpICsgJz0nOwogICAgICAgIH0KICAgICAgICBlbHNlIGlmIChsZW4gJSAzID09PSAxKSB7CiAgICAgICAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDIpICsgJz09JzsKICAgICAgICB9CiAgICAgICAgcmV0dXJuIGJhc2U2NDsKICAgIH07CgogICAgY29uc3QgbGFzdEJsb2JNYXAgPSBuZXcgTWFwKCk7DQogICAgY29uc3QgdHJhbnNwYXJlbnRCbG9iTWFwID0gbmV3IE1hcCgpOw0KICAgIGZ1bmN0aW9uIGdldFRyYW5zcGFyZW50QmxvYkZvcih3aWR0aCwgaGVpZ2h0LCBkYXRhVVJMT3B0aW9ucykgew0KICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgew0KICAgICAgICAgICAgY29uc3QgaWQgPSBgJHt3aWR0aH0tJHtoZWlnaHR9YDsNCiAgICAgICAgICAgIGlmICgnT2Zmc2NyZWVuQ2FudmFzJyBpbiBnbG9iYWxUaGlzKSB7DQogICAgICAgICAgICAgICAgaWYgKHRyYW5zcGFyZW50QmxvYk1hcC5oYXMoaWQpKQ0KICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNwYXJlbnRCbG9iTWFwLmdldChpZCk7DQogICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2NyZWVuID0gbmV3IE9mZnNjcmVlbkNhbnZhcyh3aWR0aCwgaGVpZ2h0KTsNCiAgICAgICAgICAgICAgICBvZmZzY3JlZW4uZ2V0Q29udGV4dCgnMmQnKTsNCiAgICAgICAgICAgICAgICBjb25zdCBibG9iID0geWllbGQgb2Zmc2NyZWVuLmNvbnZlcnRUb0Jsb2IoZGF0YVVSTE9wdGlvbnMpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0geWllbGQgYmxvYi5hcnJheUJ1ZmZlcigpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGJhc2U2NCA9IGVuY29kZShhcnJheUJ1ZmZlcik7DQogICAgICAgICAgICAgICAgdHJhbnNwYXJlbnRCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsNCiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZTY0Ow0KICAgICAgICAgICAgfQ0KICAgICAgICAgICAgZWxzZSB7DQogICAgICAgICAgICAgICAgcmV0dXJuICcnOw0KICAgICAgICAgICAgfQ0KICAgICAgICB9KTsNCiAgICB9DQogICAgY29uc3Qgd29ya2VyID0gc2VsZjsNCiAgICB3b3JrZXIub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHsNCiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHsNCiAgICAgICAgICAgIGlmICgnT2Zmc2NyZWVuQ2FudmFzJyBpbiBnbG9iYWxUaGlzKSB7DQogICAgICAgICAgICAgICAgY29uc3QgeyBpZCwgYml0bWFwLCB3aWR0aCwgaGVpZ2h0LCBkYXRhVVJMT3B0aW9ucyB9ID0gZS5kYXRhOw0KICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zcGFyZW50QmFzZTY0ID0gZ2V0VHJhbnNwYXJlbnRCbG9iRm9yKHdpZHRoLCBoZWlnaHQsIGRhdGFVUkxPcHRpb25zKTsNCiAgICAgICAgICAgICAgICBjb25zdCBvZmZzY3JlZW4gPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKHdpZHRoLCBoZWlnaHQpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGN0eCA9IG9mZnNjcmVlbi5nZXRDb250ZXh0KCcyZCcpOw0KICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoYml0bWFwLCAwLCAwKTsNCiAgICAgICAgICAgICAgICBiaXRtYXAuY2xvc2UoKTsNCiAgICAgICAgICAgICAgICBjb25zdCBibG9iID0geWllbGQgb2Zmc2NyZWVuLmNvbnZlcnRUb0Jsb2IoZGF0YVVSTE9wdGlvbnMpOw0KICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBibG9iLnR5cGU7DQogICAgICAgICAgICAgICAgY29uc3QgYXJyYXlCdWZmZXIgPSB5aWVsZCBibG9iLmFycmF5QnVmZmVyKCk7DQogICAgICAgICAgICAgICAgY29uc3QgYmFzZTY0ID0gZW5jb2RlKGFycmF5QnVmZmVyKTsNCiAgICAgICAgICAgICAgICBpZiAoIWxhc3RCbG9iTWFwLmhhcyhpZCkgJiYgKHlpZWxkIHRyYW5zcGFyZW50QmFzZTY0KSA9PT0gYmFzZTY0KSB7DQogICAgICAgICAgICAgICAgICAgIGxhc3RCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsNCiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlci5wb3N0TWVzc2FnZSh7IGlkIH0pOw0KICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICBpZiAobGFzdEJsb2JNYXAuZ2V0KGlkKSA9PT0gYmFzZTY0KQ0KICAgICAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VyLnBvc3RNZXNzYWdlKHsgaWQgfSk7DQogICAgICAgICAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHsNCiAgICAgICAgICAgICAgICAgICAgaWQsDQogICAgICAgICAgICAgICAgICAgIHR5cGUsDQogICAgICAgICAgICAgICAgICAgIGJhc2U2NCwNCiAgICAgICAgICAgICAgICAgICAgd2lkdGgsDQogICAgICAgICAgICAgICAgICAgIGhlaWdodCwNCiAgICAgICAgICAgICAgICB9KTsNCiAgICAgICAgICAgICAgICBsYXN0QmxvYk1hcC5zZXQoaWQsIGJhc2U2NCk7DQogICAgICAgICAgICB9DQogICAgICAgICAgICBlbHNlIHsNCiAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VyLnBvc3RNZXNzYWdlKHsgaWQ6IGUuZGF0YS5pZCB9KTsNCiAgICAgICAgICAgIH0NCiAgICAgICAgfSk7DQogICAgfTsKCn0pKCk7Cgo=", null, false);
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
          worker.onmessage = (e3) => {
            const { id } = e3.data;
            snapshotInProgressMap.set(id, false);
            if (!("base64" in e3.data))
              return;
            const { base64, type, width, height } = e3.data;
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
              var _a2;
              const id = this.mirror.getId(canvas);
              if (snapshotInProgressMap.get(id))
                return;
              snapshotInProgressMap.set(id, true);
              if (["webgl", "webgl2"].includes(canvas.__context)) {
                const context = canvas.getContext(canvas.__context);
                if (((_a2 = context === null || context === void 0 ? void 0 : context.getContextAttributes()) === null || _a2 === void 0 ? void 0 : _a2.preserveDrawingBuffer) === false) {
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
              const rules2 = Array.from(sheet.rules || CSSRule);
              styles.push({
                styleId,
                rules: rules2.map((r3, index) => {
                  return {
                    rule: stringifyRule(r3),
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
      function wrapEvent(e3) {
        return Object.assign(Object.assign({}, e3), { timestamp: nowTimestamp() });
      }
      var wrappedEmit;
      var takeFullSnapshot;
      var canvasManager;
      var recording = false;
      var mirror = createMirror$2();
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
          } catch (e3) {
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
        polyfill$1();
        let lastFullSnapshotEvent;
        let incrementalSnapshotCount = 0;
        const eventProcessor = (e3) => {
          for (const plugin of plugins || []) {
            if (plugin.eventProcessor) {
              e3 = plugin.eventProcessor(e3);
            }
          }
          if (packFn && !passEmitsToParent) {
            e3 = packFn(e3);
          }
          return e3;
        };
        wrappedEmit = (e3, isCheckout) => {
          var _a2;
          if (((_a2 = mutationBuffers[0]) === null || _a2 === void 0 ? void 0 : _a2.isFrozen()) && e3.type !== EventType.FullSnapshot && !(e3.type === EventType.IncrementalSnapshot && e3.data.source === IncrementalSource.Mutation)) {
            mutationBuffers.forEach((buf) => buf.unfreeze());
          }
          if (inEmittingFrame) {
            emit === null || emit === void 0 ? void 0 : emit(eventProcessor(e3), isCheckout);
          } else if (passEmitsToParent) {
            const message = {
              type: "rrweb",
              event: eventProcessor(e3),
              origin: window.location.origin,
              isCheckout
            };
            window.parent.postMessage(message, "*");
          }
          if (e3.type === EventType.FullSnapshot) {
            lastFullSnapshotEvent = e3;
            incrementalSnapshotCount = 0;
          } else if (e3.type === EventType.IncrementalSnapshot) {
            if (e3.data.source === IncrementalSource.Mutation && e3.data.isAttachIframe) {
              return;
            }
            incrementalSnapshotCount++;
            const exceedCount = checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
            const exceedTime = checkoutEveryNms && e3.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
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
        const wrappedAdoptedStyleSheetEmit = (a3) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.AdoptedStyleSheet }, a3)
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
            onSerialize: (n3) => {
              if (isSerializedIframe(n3, mirror)) {
                iframeManager.addIframe(n3);
              }
              if (isSerializedStylesheet(n3, mirror)) {
                stylesheetManager.trackLinkElement(n3);
              }
              if (hasShadowRoot(n3)) {
                shadowDomManager.addShadowRoot(n3.shadowRoot, document);
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
            var _a2;
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
              inputCb: (v3) => wrappedEmit(wrapEvent({
                type: EventType.IncrementalSnapshot,
                data: Object.assign({ source: IncrementalSource.Input }, v3)
              })),
              mediaInteractionCb: (p2) => wrappedEmit(wrapEvent({
                type: EventType.IncrementalSnapshot,
                data: Object.assign({ source: IncrementalSource.MediaInteraction }, p2)
              })),
              styleSheetRuleCb: (r3) => wrappedEmit(wrapEvent({
                type: EventType.IncrementalSnapshot,
                data: Object.assign({ source: IncrementalSource.StyleSheetRule }, r3)
              })),
              styleDeclarationCb: (r3) => wrappedEmit(wrapEvent({
                type: EventType.IncrementalSnapshot,
                data: Object.assign({ source: IncrementalSource.StyleDeclaration }, r3)
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
              plugins: ((_a2 = plugins === null || plugins === void 0 ? void 0 : plugins.filter((p2) => p2.observer)) === null || _a2 === void 0 ? void 0 : _a2.map((p2) => ({
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
      var NodeType$1;
      (function(NodeType2) {
        NodeType2[NodeType2["Document"] = 0] = "Document";
        NodeType2[NodeType2["DocumentType"] = 1] = "DocumentType";
        NodeType2[NodeType2["Element"] = 2] = "Element";
        NodeType2[NodeType2["Text"] = 3] = "Text";
        NodeType2[NodeType2["CDATA"] = 4] = "CDATA";
        NodeType2[NodeType2["Comment"] = 5] = "Comment";
      })(NodeType$1 || (NodeType$1 = {}));
      var Mirror$1 = function() {
        function Mirror2() {
          this.idNodeMap = /* @__PURE__ */ new Map();
          this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
        }
        Mirror2.prototype.getId = function(n3) {
          var _a2;
          if (!n3)
            return -1;
          var id = (_a2 = this.getMeta(n3)) === null || _a2 === void 0 ? void 0 : _a2.id;
          return id !== null && id !== void 0 ? id : -1;
        };
        Mirror2.prototype.getNode = function(id) {
          return this.idNodeMap.get(id) || null;
        };
        Mirror2.prototype.getIds = function() {
          return Array.from(this.idNodeMap.keys());
        };
        Mirror2.prototype.getMeta = function(n3) {
          return this.nodeMetaMap.get(n3) || null;
        };
        Mirror2.prototype.removeNodeFromMap = function(n3) {
          var _this = this;
          var id = this.getId(n3);
          this.idNodeMap["delete"](id);
          if (n3.childNodes) {
            n3.childNodes.forEach(function(childNode) {
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
        Mirror2.prototype.add = function(n3, meta) {
          var id = meta.id;
          this.idNodeMap.set(id, n3);
          this.nodeMetaMap.set(n3, meta);
        };
        Mirror2.prototype.replace = function(id, n3) {
          var oldNode = this.getNode(id);
          if (oldNode) {
            var meta = this.nodeMetaMap.get(oldNode);
            if (meta)
              this.nodeMetaMap.set(n3, meta);
          }
          this.idNodeMap.set(id, n3);
        };
        Mirror2.prototype.reset = function() {
          this.idNodeMap = /* @__PURE__ */ new Map();
          this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
        };
        return Mirror2;
      }();
      function createMirror$1() {
        return new Mirror$1();
      }
      function parseCSSText(cssText) {
        const res = {};
        const listDelimiter = /;(?![^(]*\))/g;
        const propertyDelimiter = /:(.+)/;
        const comment = /\/\*.*?\*\//g;
        cssText.replace(comment, "").split(listDelimiter).forEach(function(item) {
          if (item) {
            const tmp = item.split(propertyDelimiter);
            tmp.length > 1 && (res[camelize(tmp[0].trim())] = tmp[1].trim());
          }
        });
        return res;
      }
      function toCSSText(style) {
        const properties = [];
        for (const name in style) {
          const value = style[name];
          if (typeof value !== "string")
            continue;
          const normalizedName = hyphenate(name);
          properties.push(`${normalizedName}: ${value};`);
        }
        return properties.join(" ");
      }
      var camelizeRE = /-([a-z])/g;
      var CUSTOM_PROPERTY_REGEX = /^--[a-zA-Z0-9-]+$/;
      var camelize = (str) => {
        if (CUSTOM_PROPERTY_REGEX.test(str))
          return str;
        return str.replace(camelizeRE, (_2, c3) => c3 ? c3.toUpperCase() : "");
      };
      var hyphenateRE = /\B([A-Z])/g;
      var hyphenate = (str) => {
        return str.replace(hyphenateRE, "-$1").toLowerCase();
      };
      var BaseRRNode = class _BaseRRNode {
        constructor(..._args) {
          this.parentElement = null;
          this.parentNode = null;
          this.firstChild = null;
          this.lastChild = null;
          this.previousSibling = null;
          this.nextSibling = null;
          this.ELEMENT_NODE = NodeType.ELEMENT_NODE;
          this.TEXT_NODE = NodeType.TEXT_NODE;
        }
        get childNodes() {
          const childNodes = [];
          let childIterator = this.firstChild;
          while (childIterator) {
            childNodes.push(childIterator);
            childIterator = childIterator.nextSibling;
          }
          return childNodes;
        }
        contains(node) {
          if (!(node instanceof _BaseRRNode))
            return false;
          else if (node.ownerDocument !== this.ownerDocument)
            return false;
          else if (node === this)
            return true;
          while (node.parentNode) {
            if (node.parentNode === this)
              return true;
            node = node.parentNode;
          }
          return false;
        }
        appendChild(_newChild) {
          throw new Error(`RRDomException: Failed to execute 'appendChild' on 'RRNode': This RRNode type does not support this method.`);
        }
        insertBefore(_newChild, _refChild) {
          throw new Error(`RRDomException: Failed to execute 'insertBefore' on 'RRNode': This RRNode type does not support this method.`);
        }
        removeChild(_node) {
          throw new Error(`RRDomException: Failed to execute 'removeChild' on 'RRNode': This RRNode type does not support this method.`);
        }
        toString() {
          return "RRNode";
        }
      };
      function BaseRRDocumentImpl(RRNodeClass) {
        return class BaseRRDocument extends RRNodeClass {
          constructor(...args) {
            super(args);
            this.nodeType = NodeType.DOCUMENT_NODE;
            this.nodeName = "#document";
            this.compatMode = "CSS1Compat";
            this.RRNodeType = NodeType$1.Document;
            this.textContent = null;
            this.ownerDocument = this;
          }
          get documentElement() {
            return this.childNodes.find((node) => node.RRNodeType === NodeType$1.Element && node.tagName === "HTML") || null;
          }
          get body() {
            var _a2;
            return ((_a2 = this.documentElement) === null || _a2 === void 0 ? void 0 : _a2.childNodes.find((node) => node.RRNodeType === NodeType$1.Element && node.tagName === "BODY")) || null;
          }
          get head() {
            var _a2;
            return ((_a2 = this.documentElement) === null || _a2 === void 0 ? void 0 : _a2.childNodes.find((node) => node.RRNodeType === NodeType$1.Element && node.tagName === "HEAD")) || null;
          }
          get implementation() {
            return this;
          }
          get firstElementChild() {
            return this.documentElement;
          }
          appendChild(newChild) {
            const nodeType = newChild.RRNodeType;
            if (nodeType === NodeType$1.Element || nodeType === NodeType$1.DocumentType) {
              if (this.childNodes.some((s3) => s3.RRNodeType === nodeType)) {
                throw new Error(`RRDomException: Failed to execute 'appendChild' on 'RRNode': Only one ${nodeType === NodeType$1.Element ? "RRElement" : "RRDoctype"} on RRDocument allowed.`);
              }
            }
            const child = appendChild(this, newChild);
            child.parentElement = null;
            return child;
          }
          insertBefore(newChild, refChild) {
            const nodeType = newChild.RRNodeType;
            if (nodeType === NodeType$1.Element || nodeType === NodeType$1.DocumentType) {
              if (this.childNodes.some((s3) => s3.RRNodeType === nodeType)) {
                throw new Error(`RRDomException: Failed to execute 'insertBefore' on 'RRNode': Only one ${nodeType === NodeType$1.Element ? "RRElement" : "RRDoctype"} on RRDocument allowed.`);
              }
            }
            const child = insertBefore(this, newChild, refChild);
            child.parentElement = null;
            return child;
          }
          removeChild(node) {
            return removeChild(this, node);
          }
          open() {
            this.firstChild = null;
            this.lastChild = null;
          }
          close() {
          }
          write(content) {
            let publicId;
            if (content === '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "">')
              publicId = "-//W3C//DTD XHTML 1.0 Transitional//EN";
            else if (content === '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "">')
              publicId = "-//W3C//DTD HTML 4.0 Transitional//EN";
            if (publicId) {
              const doctype = this.createDocumentType("html", publicId, "");
              this.open();
              this.appendChild(doctype);
            }
          }
          createDocument(_namespace, _qualifiedName, _doctype) {
            return new BaseRRDocument();
          }
          createDocumentType(qualifiedName, publicId, systemId) {
            const doctype = new (BaseRRDocumentTypeImpl(BaseRRNode))(qualifiedName, publicId, systemId);
            doctype.ownerDocument = this;
            return doctype;
          }
          createElement(tagName) {
            const element = new (BaseRRElementImpl(BaseRRNode))(tagName);
            element.ownerDocument = this;
            return element;
          }
          createElementNS(_namespaceURI, qualifiedName) {
            return this.createElement(qualifiedName);
          }
          createTextNode(data) {
            const text = new (BaseRRTextImpl(BaseRRNode))(data);
            text.ownerDocument = this;
            return text;
          }
          createComment(data) {
            const comment = new (BaseRRCommentImpl(BaseRRNode))(data);
            comment.ownerDocument = this;
            return comment;
          }
          createCDATASection(data) {
            const CDATASection = new (BaseRRCDATASectionImpl(BaseRRNode))(data);
            CDATASection.ownerDocument = this;
            return CDATASection;
          }
          toString() {
            return "RRDocument";
          }
        };
      }
      function BaseRRDocumentTypeImpl(RRNodeClass) {
        return class BaseRRDocumentType extends RRNodeClass {
          constructor(qualifiedName, publicId, systemId) {
            super();
            this.nodeType = NodeType.DOCUMENT_TYPE_NODE;
            this.RRNodeType = NodeType$1.DocumentType;
            this.name = qualifiedName;
            this.publicId = publicId;
            this.systemId = systemId;
            this.nodeName = qualifiedName;
            this.textContent = null;
          }
          toString() {
            return "RRDocumentType";
          }
        };
      }
      function BaseRRElementImpl(RRNodeClass) {
        return class BaseRRElement extends RRNodeClass {
          constructor(tagName) {
            super();
            this.nodeType = NodeType.ELEMENT_NODE;
            this.RRNodeType = NodeType$1.Element;
            this.attributes = {};
            this.shadowRoot = null;
            this.tagName = tagName.toUpperCase();
            this.nodeName = tagName.toUpperCase();
          }
          get textContent() {
            let result = "";
            this.childNodes.forEach((node) => result += node.textContent);
            return result;
          }
          set textContent(textContent) {
            this.firstChild = null;
            this.lastChild = null;
            this.appendChild(this.ownerDocument.createTextNode(textContent));
          }
          get classList() {
            return new ClassList(this.attributes.class, (newClassName) => {
              this.attributes.class = newClassName;
            });
          }
          get id() {
            return this.attributes.id || "";
          }
          get className() {
            return this.attributes.class || "";
          }
          get style() {
            const style = this.attributes.style ? parseCSSText(this.attributes.style) : {};
            const hyphenateRE2 = /\B([A-Z])/g;
            style.setProperty = (name, value, priority) => {
              if (hyphenateRE2.test(name))
                return;
              const normalizedName = camelize(name);
              if (!value)
                delete style[normalizedName];
              else
                style[normalizedName] = value;
              if (priority === "important")
                style[normalizedName] += " !important";
              this.attributes.style = toCSSText(style);
            };
            style.removeProperty = (name) => {
              if (hyphenateRE2.test(name))
                return "";
              const normalizedName = camelize(name);
              const value = style[normalizedName] || "";
              delete style[normalizedName];
              this.attributes.style = toCSSText(style);
              return value;
            };
            return style;
          }
          getAttribute(name) {
            return this.attributes[name] || null;
          }
          setAttribute(name, attribute) {
            this.attributes[name] = attribute;
          }
          setAttributeNS(_namespace, qualifiedName, value) {
            this.setAttribute(qualifiedName, value);
          }
          removeAttribute(name) {
            delete this.attributes[name];
          }
          appendChild(newChild) {
            return appendChild(this, newChild);
          }
          insertBefore(newChild, refChild) {
            return insertBefore(this, newChild, refChild);
          }
          removeChild(node) {
            return removeChild(this, node);
          }
          attachShadow(_init) {
            const shadowRoot = this.ownerDocument.createElement("SHADOWROOT");
            this.shadowRoot = shadowRoot;
            return shadowRoot;
          }
          dispatchEvent(_event) {
            return true;
          }
          toString() {
            let attributeString = "";
            for (const attribute in this.attributes) {
              attributeString += `${attribute}="${this.attributes[attribute]}" `;
            }
            return `${this.tagName} ${attributeString}`;
          }
        };
      }
      function BaseRRMediaElementImpl(RRElementClass) {
        return class BaseRRMediaElement extends RRElementClass {
          attachShadow(_init) {
            throw new Error(`RRDomException: Failed to execute 'attachShadow' on 'RRElement': This RRElement does not support attachShadow`);
          }
          play() {
            this.paused = false;
          }
          pause() {
            this.paused = true;
          }
        };
      }
      function BaseRRTextImpl(RRNodeClass) {
        return class BaseRRText extends RRNodeClass {
          constructor(data) {
            super();
            this.nodeType = NodeType.TEXT_NODE;
            this.nodeName = "#text";
            this.RRNodeType = NodeType$1.Text;
            this.data = data;
          }
          get textContent() {
            return this.data;
          }
          set textContent(textContent) {
            this.data = textContent;
          }
          toString() {
            return `RRText text=${JSON.stringify(this.data)}`;
          }
        };
      }
      function BaseRRCommentImpl(RRNodeClass) {
        return class BaseRRComment extends RRNodeClass {
          constructor(data) {
            super();
            this.nodeType = NodeType.COMMENT_NODE;
            this.nodeName = "#comment";
            this.RRNodeType = NodeType$1.Comment;
            this.data = data;
          }
          get textContent() {
            return this.data;
          }
          set textContent(textContent) {
            this.data = textContent;
          }
          toString() {
            return `RRComment text=${JSON.stringify(this.data)}`;
          }
        };
      }
      function BaseRRCDATASectionImpl(RRNodeClass) {
        return class BaseRRCDATASection extends RRNodeClass {
          constructor(data) {
            super();
            this.nodeName = "#cdata-section";
            this.nodeType = NodeType.CDATA_SECTION_NODE;
            this.RRNodeType = NodeType$1.CDATA;
            this.data = data;
          }
          get textContent() {
            return this.data;
          }
          set textContent(textContent) {
            this.data = textContent;
          }
          toString() {
            return `RRCDATASection data=${JSON.stringify(this.data)}`;
          }
        };
      }
      var ClassList = class {
        constructor(classText, onChange) {
          this.classes = [];
          this.add = (...classNames) => {
            for (const item of classNames) {
              const className = String(item);
              if (this.classes.indexOf(className) >= 0)
                continue;
              this.classes.push(className);
            }
            this.onChange && this.onChange(this.classes.join(" "));
          };
          this.remove = (...classNames) => {
            this.classes = this.classes.filter((item) => classNames.indexOf(item) === -1);
            this.onChange && this.onChange(this.classes.join(" "));
          };
          if (classText) {
            const classes = classText.trim().split(/\s+/);
            this.classes.push(...classes);
          }
          this.onChange = onChange;
        }
      };
      function appendChild(parent, newChild) {
        if (newChild.parentNode)
          newChild.parentNode.removeChild(newChild);
        if (parent.lastChild) {
          parent.lastChild.nextSibling = newChild;
          newChild.previousSibling = parent.lastChild;
        } else {
          parent.firstChild = newChild;
          newChild.previousSibling = null;
        }
        parent.lastChild = newChild;
        newChild.nextSibling = null;
        newChild.parentNode = parent;
        newChild.parentElement = parent;
        newChild.ownerDocument = parent.ownerDocument;
        return newChild;
      }
      function insertBefore(parent, newChild, refChild) {
        if (!refChild)
          return appendChild(parent, newChild);
        if (refChild.parentNode !== parent)
          throw new Error("Failed to execute 'insertBefore' on 'RRNode': The RRNode before which the new node is to be inserted is not a child of this RRNode.");
        if (newChild === refChild)
          return newChild;
        if (newChild.parentNode)
          newChild.parentNode.removeChild(newChild);
        newChild.previousSibling = refChild.previousSibling;
        refChild.previousSibling = newChild;
        newChild.nextSibling = refChild;
        if (newChild.previousSibling)
          newChild.previousSibling.nextSibling = newChild;
        else
          parent.firstChild = newChild;
        newChild.parentElement = parent;
        newChild.parentNode = parent;
        newChild.ownerDocument = parent.ownerDocument;
        return newChild;
      }
      function removeChild(parent, child) {
        if (child.parentNode !== parent)
          throw new Error("Failed to execute 'removeChild' on 'RRNode': The RRNode to be removed is not a child of this RRNode.");
        if (child.previousSibling)
          child.previousSibling.nextSibling = child.nextSibling;
        else
          parent.firstChild = child.nextSibling;
        if (child.nextSibling)
          child.nextSibling.previousSibling = child.previousSibling;
        else
          parent.lastChild = child.previousSibling;
        child.previousSibling = null;
        child.nextSibling = null;
        child.parentElement = null;
        child.parentNode = null;
        return child;
      }
      var NodeType;
      (function(NodeType2) {
        NodeType2[NodeType2["PLACEHOLDER"] = 0] = "PLACEHOLDER";
        NodeType2[NodeType2["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
        NodeType2[NodeType2["ATTRIBUTE_NODE"] = 2] = "ATTRIBUTE_NODE";
        NodeType2[NodeType2["TEXT_NODE"] = 3] = "TEXT_NODE";
        NodeType2[NodeType2["CDATA_SECTION_NODE"] = 4] = "CDATA_SECTION_NODE";
        NodeType2[NodeType2["ENTITY_REFERENCE_NODE"] = 5] = "ENTITY_REFERENCE_NODE";
        NodeType2[NodeType2["ENTITY_NODE"] = 6] = "ENTITY_NODE";
        NodeType2[NodeType2["PROCESSING_INSTRUCTION_NODE"] = 7] = "PROCESSING_INSTRUCTION_NODE";
        NodeType2[NodeType2["COMMENT_NODE"] = 8] = "COMMENT_NODE";
        NodeType2[NodeType2["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
        NodeType2[NodeType2["DOCUMENT_TYPE_NODE"] = 10] = "DOCUMENT_TYPE_NODE";
        NodeType2[NodeType2["DOCUMENT_FRAGMENT_NODE"] = 11] = "DOCUMENT_FRAGMENT_NODE";
      })(NodeType || (NodeType = {}));
      var NAMESPACES = {
        svg: "http://www.w3.org/2000/svg",
        "xlink:href": "http://www.w3.org/1999/xlink",
        xmlns: "http://www.w3.org/2000/xmlns/"
      };
      var SVGTagMap = {
        altglyph: "altGlyph",
        altglyphdef: "altGlyphDef",
        altglyphitem: "altGlyphItem",
        animatecolor: "animateColor",
        animatemotion: "animateMotion",
        animatetransform: "animateTransform",
        clippath: "clipPath",
        feblend: "feBlend",
        fecolormatrix: "feColorMatrix",
        fecomponenttransfer: "feComponentTransfer",
        fecomposite: "feComposite",
        feconvolvematrix: "feConvolveMatrix",
        fediffuselighting: "feDiffuseLighting",
        fedisplacementmap: "feDisplacementMap",
        fedistantlight: "feDistantLight",
        fedropshadow: "feDropShadow",
        feflood: "feFlood",
        fefunca: "feFuncA",
        fefuncb: "feFuncB",
        fefuncg: "feFuncG",
        fefuncr: "feFuncR",
        fegaussianblur: "feGaussianBlur",
        feimage: "feImage",
        femerge: "feMerge",
        femergenode: "feMergeNode",
        femorphology: "feMorphology",
        feoffset: "feOffset",
        fepointlight: "fePointLight",
        fespecularlighting: "feSpecularLighting",
        fespotlight: "feSpotLight",
        fetile: "feTile",
        feturbulence: "feTurbulence",
        foreignobject: "foreignObject",
        glyphref: "glyphRef",
        lineargradient: "linearGradient",
        radialgradient: "radialGradient"
      };
      var createdNodeSet = null;
      function diff(oldTree, newTree, replayer, rrnodeMirror = newTree.mirror || newTree.ownerDocument.mirror) {
        oldTree = diffBeforeUpdatingChildren(oldTree, newTree, replayer, rrnodeMirror);
        diffChildren(oldTree, newTree, replayer, rrnodeMirror);
        diffAfterUpdatingChildren(oldTree, newTree, replayer, rrnodeMirror);
      }
      function diffBeforeUpdatingChildren(oldTree, newTree, replayer, rrnodeMirror) {
        var _a2;
        if (replayer.afterAppend && !createdNodeSet) {
          createdNodeSet = /* @__PURE__ */ new WeakSet();
          setTimeout(() => {
            createdNodeSet = null;
          }, 0);
        }
        if (!sameNodeType(oldTree, newTree)) {
          const calibratedOldTree = createOrGetNode(newTree, replayer.mirror, rrnodeMirror);
          (_a2 = oldTree.parentNode) === null || _a2 === void 0 ? void 0 : _a2.replaceChild(calibratedOldTree, oldTree);
          oldTree = calibratedOldTree;
        }
        switch (newTree.RRNodeType) {
          case NodeType$1.Document: {
            if (!nodeMatching(oldTree, newTree, replayer.mirror, rrnodeMirror)) {
              const newMeta = rrnodeMirror.getMeta(newTree);
              if (newMeta) {
                replayer.mirror.removeNodeFromMap(oldTree);
                oldTree.close();
                oldTree.open();
                replayer.mirror.add(oldTree, newMeta);
                createdNodeSet === null || createdNodeSet === void 0 ? void 0 : createdNodeSet.add(oldTree);
              }
            }
            break;
          }
          case NodeType$1.Element: {
            const oldElement = oldTree;
            const newRRElement = newTree;
            switch (newRRElement.tagName) {
              case "IFRAME": {
                const oldContentDocument = oldTree.contentDocument;
                if (!oldContentDocument)
                  break;
                diff(oldContentDocument, newTree.contentDocument, replayer, rrnodeMirror);
                break;
              }
            }
            if (newRRElement.shadowRoot) {
              if (!oldElement.shadowRoot)
                oldElement.attachShadow({ mode: "open" });
              diffChildren(oldElement.shadowRoot, newRRElement.shadowRoot, replayer, rrnodeMirror);
            }
            break;
          }
        }
        return oldTree;
      }
      function diffAfterUpdatingChildren(oldTree, newTree, replayer, rrnodeMirror) {
        var _a2;
        switch (newTree.RRNodeType) {
          case NodeType$1.Document: {
            const scrollData = newTree.scrollData;
            scrollData && replayer.applyScroll(scrollData, true);
            break;
          }
          case NodeType$1.Element: {
            const oldElement = oldTree;
            const newRRElement = newTree;
            diffProps(oldElement, newRRElement, rrnodeMirror);
            newRRElement.scrollData && replayer.applyScroll(newRRElement.scrollData, true);
            newRRElement.inputData && replayer.applyInput(newRRElement.inputData);
            switch (newRRElement.tagName) {
              case "AUDIO":
              case "VIDEO": {
                const oldMediaElement = oldTree;
                const newMediaRRElement = newRRElement;
                if (newMediaRRElement.paused !== void 0)
                  newMediaRRElement.paused ? void oldMediaElement.pause() : void oldMediaElement.play();
                if (newMediaRRElement.muted !== void 0)
                  oldMediaElement.muted = newMediaRRElement.muted;
                if (newMediaRRElement.volume !== void 0)
                  oldMediaElement.volume = newMediaRRElement.volume;
                if (newMediaRRElement.currentTime !== void 0)
                  oldMediaElement.currentTime = newMediaRRElement.currentTime;
                if (newMediaRRElement.playbackRate !== void 0)
                  oldMediaElement.playbackRate = newMediaRRElement.playbackRate;
                break;
              }
              case "CANVAS": {
                const rrCanvasElement = newTree;
                if (rrCanvasElement.rr_dataURL !== null) {
                  const image = document.createElement("img");
                  image.onload = () => {
                    const ctx = oldElement.getContext("2d");
                    if (ctx) {
                      ctx.drawImage(image, 0, 0, image.width, image.height);
                    }
                  };
                  image.src = rrCanvasElement.rr_dataURL;
                }
                rrCanvasElement.canvasMutations.forEach((canvasMutation2) => replayer.applyCanvas(canvasMutation2.event, canvasMutation2.mutation, oldTree));
                break;
              }
              case "STYLE": {
                const styleSheet = oldElement.sheet;
                styleSheet && newTree.rules.forEach((data) => replayer.applyStyleSheetMutation(data, styleSheet));
                break;
              }
            }
            break;
          }
          case NodeType$1.Text:
          case NodeType$1.Comment:
          case NodeType$1.CDATA: {
            if (oldTree.textContent !== newTree.data)
              oldTree.textContent = newTree.data;
            break;
          }
        }
        if (createdNodeSet === null || createdNodeSet === void 0 ? void 0 : createdNodeSet.has(oldTree)) {
          createdNodeSet.delete(oldTree);
          (_a2 = replayer.afterAppend) === null || _a2 === void 0 ? void 0 : _a2.call(replayer, oldTree, replayer.mirror.getId(oldTree));
        }
      }
      function diffProps(oldTree, newTree, rrnodeMirror) {
        const oldAttributes = oldTree.attributes;
        const newAttributes = newTree.attributes;
        for (const name in newAttributes) {
          const newValue = newAttributes[name];
          const sn = rrnodeMirror.getMeta(newTree);
          if ((sn === null || sn === void 0 ? void 0 : sn.isSVG) && NAMESPACES[name])
            oldTree.setAttributeNS(NAMESPACES[name], name, newValue);
          else if (newTree.tagName === "CANVAS" && name === "rr_dataURL") {
            const image = document.createElement("img");
            image.src = newValue;
            image.onload = () => {
              const ctx = oldTree.getContext("2d");
              if (ctx) {
                ctx.drawImage(image, 0, 0, image.width, image.height);
              }
            };
          } else if (newTree.tagName === "IFRAME" && name === "srcdoc")
            continue;
          else
            oldTree.setAttribute(name, newValue);
        }
        for (const { name } of Array.from(oldAttributes))
          if (!(name in newAttributes))
            oldTree.removeAttribute(name);
        newTree.scrollLeft && (oldTree.scrollLeft = newTree.scrollLeft);
        newTree.scrollTop && (oldTree.scrollTop = newTree.scrollTop);
      }
      function diffChildren(oldTree, newTree, replayer, rrnodeMirror) {
        const oldChildren = Array.from(oldTree.childNodes);
        const newChildren = newTree.childNodes;
        if (oldChildren.length === 0 && newChildren.length === 0)
          return;
        let oldStartIndex = 0, oldEndIndex = oldChildren.length - 1, newStartIndex = 0, newEndIndex = newChildren.length - 1;
        let oldStartNode = oldChildren[oldStartIndex], oldEndNode = oldChildren[oldEndIndex], newStartNode = newChildren[newStartIndex], newEndNode = newChildren[newEndIndex];
        let oldIdToIndex = void 0, indexInOld = void 0;
        while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
          if (oldStartNode === void 0) {
            oldStartNode = oldChildren[++oldStartIndex];
          } else if (oldEndNode === void 0) {
            oldEndNode = oldChildren[--oldEndIndex];
          } else if (nodeMatching(oldStartNode, newStartNode, replayer.mirror, rrnodeMirror)) {
            oldStartNode = oldChildren[++oldStartIndex];
            newStartNode = newChildren[++newStartIndex];
          } else if (nodeMatching(oldEndNode, newEndNode, replayer.mirror, rrnodeMirror)) {
            oldEndNode = oldChildren[--oldEndIndex];
            newEndNode = newChildren[--newEndIndex];
          } else if (nodeMatching(oldStartNode, newEndNode, replayer.mirror, rrnodeMirror)) {
            try {
              oldTree.insertBefore(oldStartNode, oldEndNode.nextSibling);
            } catch (e3) {
              console.warn(e3);
            }
            oldStartNode = oldChildren[++oldStartIndex];
            newEndNode = newChildren[--newEndIndex];
          } else if (nodeMatching(oldEndNode, newStartNode, replayer.mirror, rrnodeMirror)) {
            try {
              oldTree.insertBefore(oldEndNode, oldStartNode);
            } catch (e3) {
              console.warn(e3);
            }
            oldEndNode = oldChildren[--oldEndIndex];
            newStartNode = newChildren[++newStartIndex];
          } else {
            if (!oldIdToIndex) {
              oldIdToIndex = {};
              for (let i3 = oldStartIndex; i3 <= oldEndIndex; i3++) {
                const oldChild2 = oldChildren[i3];
                if (oldChild2 && replayer.mirror.hasNode(oldChild2))
                  oldIdToIndex[replayer.mirror.getId(oldChild2)] = i3;
              }
            }
            indexInOld = oldIdToIndex[rrnodeMirror.getId(newStartNode)];
            const nodeToMove = oldChildren[indexInOld];
            if (indexInOld !== void 0 && nodeToMove && nodeMatching(nodeToMove, newStartNode, replayer.mirror, rrnodeMirror)) {
              try {
                oldTree.insertBefore(nodeToMove, oldStartNode);
              } catch (e3) {
                console.warn(e3);
              }
              oldChildren[indexInOld] = void 0;
            } else {
              const newNode = createOrGetNode(newStartNode, replayer.mirror, rrnodeMirror);
              if (oldTree.nodeName === "#document" && oldStartNode && (newNode.nodeType === newNode.DOCUMENT_TYPE_NODE && oldStartNode.nodeType === oldStartNode.DOCUMENT_TYPE_NODE || newNode.nodeType === newNode.ELEMENT_NODE && oldStartNode.nodeType === oldStartNode.ELEMENT_NODE)) {
                oldTree.removeChild(oldStartNode);
                replayer.mirror.removeNodeFromMap(oldStartNode);
                oldStartNode = oldChildren[++oldStartIndex];
              }
              try {
                oldTree.insertBefore(newNode, oldStartNode || null);
              } catch (e3) {
                console.warn(e3);
              }
            }
            newStartNode = newChildren[++newStartIndex];
          }
        }
        if (oldStartIndex > oldEndIndex) {
          const referenceRRNode = newChildren[newEndIndex + 1];
          let referenceNode = null;
          if (referenceRRNode)
            referenceNode = replayer.mirror.getNode(rrnodeMirror.getId(referenceRRNode));
          for (; newStartIndex <= newEndIndex; ++newStartIndex) {
            const newNode = createOrGetNode(newChildren[newStartIndex], replayer.mirror, rrnodeMirror);
            try {
              oldTree.insertBefore(newNode, referenceNode);
            } catch (e3) {
              console.warn(e3);
            }
          }
        } else if (newStartIndex > newEndIndex) {
          for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
            const node = oldChildren[oldStartIndex];
            if (!node || node.parentNode !== oldTree)
              continue;
            try {
              oldTree.removeChild(node);
              replayer.mirror.removeNodeFromMap(node);
            } catch (e3) {
              console.warn(e3);
            }
          }
        }
        let oldChild = oldTree.firstChild;
        let newChild = newTree.firstChild;
        while (oldChild !== null && newChild !== null) {
          diff(oldChild, newChild, replayer, rrnodeMirror);
          oldChild = oldChild.nextSibling;
          newChild = newChild.nextSibling;
        }
      }
      function createOrGetNode(rrNode, domMirror, rrnodeMirror) {
        const nodeId = rrnodeMirror.getId(rrNode);
        const sn = rrnodeMirror.getMeta(rrNode);
        let node = null;
        if (nodeId > -1)
          node = domMirror.getNode(nodeId);
        if (node !== null && sameNodeType(node, rrNode))
          return node;
        switch (rrNode.RRNodeType) {
          case NodeType$1.Document:
            node = new Document();
            break;
          case NodeType$1.DocumentType:
            node = document.implementation.createDocumentType(rrNode.name, rrNode.publicId, rrNode.systemId);
            break;
          case NodeType$1.Element: {
            let tagName = rrNode.tagName.toLowerCase();
            tagName = SVGTagMap[tagName] || tagName;
            if (sn && "isSVG" in sn && (sn === null || sn === void 0 ? void 0 : sn.isSVG)) {
              node = document.createElementNS(NAMESPACES["svg"], tagName);
            } else
              node = document.createElement(rrNode.tagName);
            break;
          }
          case NodeType$1.Text:
            node = document.createTextNode(rrNode.data);
            break;
          case NodeType$1.Comment:
            node = document.createComment(rrNode.data);
            break;
          case NodeType$1.CDATA:
            node = document.createCDATASection(rrNode.data);
            break;
        }
        if (sn)
          domMirror.add(node, Object.assign({}, sn));
        try {
          createdNodeSet === null || createdNodeSet === void 0 ? void 0 : createdNodeSet.add(node);
        } catch (e3) {
        }
        return node;
      }
      function sameNodeType(node1, node2) {
        if (node1.nodeType !== node2.nodeType)
          return false;
        return node1.nodeType !== node1.ELEMENT_NODE || node1.tagName.toUpperCase() === node2.tagName;
      }
      function nodeMatching(node1, node2, domMirror, rrdomMirror) {
        const node1Id = domMirror.getId(node1);
        const node2Id = rrdomMirror.getId(node2);
        if (node1Id === -1 || node1Id !== node2Id)
          return false;
        return sameNodeType(node1, node2);
      }
      var RRDocument = class _RRDocument extends BaseRRDocumentImpl(BaseRRNode) {
        get unserializedId() {
          return this._unserializedId--;
        }
        constructor(mirror2) {
          super();
          this.UNSERIALIZED_STARTING_ID = -2;
          this._unserializedId = this.UNSERIALIZED_STARTING_ID;
          this.mirror = createMirror();
          this.scrollData = null;
          if (mirror2) {
            this.mirror = mirror2;
          }
        }
        createDocument(_namespace, _qualifiedName, _doctype) {
          return new _RRDocument();
        }
        createDocumentType(qualifiedName, publicId, systemId) {
          const documentTypeNode = new RRDocumentType(qualifiedName, publicId, systemId);
          documentTypeNode.ownerDocument = this;
          return documentTypeNode;
        }
        createElement(tagName) {
          const upperTagName = tagName.toUpperCase();
          let element;
          switch (upperTagName) {
            case "AUDIO":
            case "VIDEO":
              element = new RRMediaElement(upperTagName);
              break;
            case "IFRAME":
              element = new RRIFrameElement(upperTagName, this.mirror);
              break;
            case "CANVAS":
              element = new RRCanvasElement(upperTagName);
              break;
            case "STYLE":
              element = new RRStyleElement(upperTagName);
              break;
            default:
              element = new RRElement(upperTagName);
              break;
          }
          element.ownerDocument = this;
          return element;
        }
        createComment(data) {
          const commentNode = new RRComment(data);
          commentNode.ownerDocument = this;
          return commentNode;
        }
        createCDATASection(data) {
          const sectionNode = new RRCDATASection(data);
          sectionNode.ownerDocument = this;
          return sectionNode;
        }
        createTextNode(data) {
          const textNode = new RRText(data);
          textNode.ownerDocument = this;
          return textNode;
        }
        destroyTree() {
          this.firstChild = null;
          this.lastChild = null;
          this.mirror.reset();
        }
        open() {
          super.open();
          this._unserializedId = this.UNSERIALIZED_STARTING_ID;
        }
      };
      var RRDocumentType = BaseRRDocumentTypeImpl(BaseRRNode);
      var RRElement = class extends BaseRRElementImpl(BaseRRNode) {
        constructor() {
          super(...arguments);
          this.inputData = null;
          this.scrollData = null;
        }
      };
      var RRMediaElement = class extends BaseRRMediaElementImpl(RRElement) {
      };
      var RRCanvasElement = class extends RRElement {
        constructor() {
          super(...arguments);
          this.rr_dataURL = null;
          this.canvasMutations = [];
        }
        getContext() {
          return null;
        }
      };
      var RRStyleElement = class extends RRElement {
        constructor() {
          super(...arguments);
          this.rules = [];
        }
      };
      var RRIFrameElement = class extends RRElement {
        constructor(upperTagName, mirror2) {
          super(upperTagName);
          this.contentDocument = new RRDocument();
          this.contentDocument.mirror = mirror2;
        }
      };
      var RRText = BaseRRTextImpl(BaseRRNode);
      var RRComment = BaseRRCommentImpl(BaseRRNode);
      var RRCDATASection = BaseRRCDATASectionImpl(BaseRRNode);
      function getValidTagName(element) {
        if (element instanceof HTMLFormElement) {
          return "FORM";
        }
        return element.tagName.toUpperCase();
      }
      function buildFromNode(node, rrdom, domMirror, parentRRNode) {
        let rrNode;
        switch (node.nodeType) {
          case NodeType.DOCUMENT_NODE:
            if (parentRRNode && parentRRNode.nodeName === "IFRAME")
              rrNode = parentRRNode.contentDocument;
            else {
              rrNode = rrdom;
              rrNode.compatMode = node.compatMode;
            }
            break;
          case NodeType.DOCUMENT_TYPE_NODE: {
            const documentType = node;
            rrNode = rrdom.createDocumentType(documentType.name, documentType.publicId, documentType.systemId);
            break;
          }
          case NodeType.ELEMENT_NODE: {
            const elementNode = node;
            const tagName = getValidTagName(elementNode);
            rrNode = rrdom.createElement(tagName);
            const rrElement = rrNode;
            for (const { name, value } of Array.from(elementNode.attributes)) {
              rrElement.attributes[name] = value;
            }
            elementNode.scrollLeft && (rrElement.scrollLeft = elementNode.scrollLeft);
            elementNode.scrollTop && (rrElement.scrollTop = elementNode.scrollTop);
            break;
          }
          case NodeType.TEXT_NODE:
            rrNode = rrdom.createTextNode(node.textContent || "");
            break;
          case NodeType.CDATA_SECTION_NODE:
            rrNode = rrdom.createCDATASection(node.data);
            break;
          case NodeType.COMMENT_NODE:
            rrNode = rrdom.createComment(node.textContent || "");
            break;
          case NodeType.DOCUMENT_FRAGMENT_NODE:
            rrNode = parentRRNode.attachShadow({ mode: "open" });
            break;
          default:
            return null;
        }
        let sn = domMirror.getMeta(node);
        if (rrdom instanceof RRDocument) {
          if (!sn) {
            sn = getDefaultSN(rrNode, rrdom.unserializedId);
            domMirror.add(node, sn);
          }
          rrdom.mirror.add(rrNode, Object.assign({}, sn));
        }
        return rrNode;
      }
      function buildFromDom(dom, domMirror = createMirror$1(), rrdom = new RRDocument()) {
        function walk(node, parentRRNode) {
          const rrNode = buildFromNode(node, rrdom, domMirror, parentRRNode);
          if (rrNode === null)
            return;
          if ((parentRRNode === null || parentRRNode === void 0 ? void 0 : parentRRNode.nodeName) !== "IFRAME" && node.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE) {
            parentRRNode === null || parentRRNode === void 0 ? void 0 : parentRRNode.appendChild(rrNode);
            rrNode.parentNode = parentRRNode;
            rrNode.parentElement = parentRRNode;
          }
          if (node.nodeName === "IFRAME") {
            const iframeDoc = node.contentDocument;
            iframeDoc && walk(iframeDoc, rrNode);
          } else if (node.nodeType === NodeType.DOCUMENT_NODE || node.nodeType === NodeType.ELEMENT_NODE || node.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
            if (node.nodeType === NodeType.ELEMENT_NODE && node.shadowRoot)
              walk(node.shadowRoot, rrNode);
            node.childNodes.forEach((childNode) => walk(childNode, rrNode));
          }
        }
        walk(dom, null);
        return rrdom;
      }
      function createMirror() {
        return new Mirror();
      }
      var Mirror = class {
        constructor() {
          this.idNodeMap = /* @__PURE__ */ new Map();
          this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
        }
        getId(n3) {
          var _a2;
          if (!n3)
            return -1;
          const id = (_a2 = this.getMeta(n3)) === null || _a2 === void 0 ? void 0 : _a2.id;
          return id !== null && id !== void 0 ? id : -1;
        }
        getNode(id) {
          return this.idNodeMap.get(id) || null;
        }
        getIds() {
          return Array.from(this.idNodeMap.keys());
        }
        getMeta(n3) {
          return this.nodeMetaMap.get(n3) || null;
        }
        removeNodeFromMap(n3) {
          const id = this.getId(n3);
          this.idNodeMap.delete(id);
          if (n3.childNodes) {
            n3.childNodes.forEach((childNode) => this.removeNodeFromMap(childNode));
          }
        }
        has(id) {
          return this.idNodeMap.has(id);
        }
        hasNode(node) {
          return this.nodeMetaMap.has(node);
        }
        add(n3, meta) {
          const id = meta.id;
          this.idNodeMap.set(id, n3);
          this.nodeMetaMap.set(n3, meta);
        }
        replace(id, n3) {
          const oldNode = this.getNode(id);
          if (oldNode) {
            const meta = this.nodeMetaMap.get(oldNode);
            if (meta)
              this.nodeMetaMap.set(n3, meta);
          }
          this.idNodeMap.set(id, n3);
        }
        reset() {
          this.idNodeMap = /* @__PURE__ */ new Map();
          this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
        }
      };
      function getDefaultSN(node, id) {
        switch (node.RRNodeType) {
          case NodeType$1.Document:
            return {
              id,
              type: node.RRNodeType,
              childNodes: []
            };
          case NodeType$1.DocumentType: {
            const doctype = node;
            return {
              id,
              type: node.RRNodeType,
              name: doctype.name,
              publicId: doctype.publicId,
              systemId: doctype.systemId
            };
          }
          case NodeType$1.Element:
            return {
              id,
              type: node.RRNodeType,
              tagName: node.tagName.toLowerCase(),
              attributes: {},
              childNodes: []
            };
          case NodeType$1.Text:
            return {
              id,
              type: node.RRNodeType,
              textContent: node.textContent || ""
            };
          case NodeType$1.Comment:
            return {
              id,
              type: node.RRNodeType,
              textContent: node.textContent || ""
            };
          case NodeType$1.CDATA:
            return {
              id,
              type: node.RRNodeType,
              textContent: ""
            };
        }
      }
      function mitt$1(n3) {
        return { all: n3 = n3 || /* @__PURE__ */ new Map(), on: function(t3, e3) {
          var i3 = n3.get(t3);
          i3 ? i3.push(e3) : n3.set(t3, [e3]);
        }, off: function(t3, e3) {
          var i3 = n3.get(t3);
          i3 && (e3 ? i3.splice(i3.indexOf(e3) >>> 0, 1) : n3.set(t3, []));
        }, emit: function(t3, e3) {
          var i3 = n3.get(t3);
          i3 && i3.slice().map(function(n4) {
            n4(e3);
          }), (i3 = n3.get("*")) && i3.slice().map(function(n4) {
            n4(t3, e3);
          });
        } };
      }
      var mittProxy = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        "default": mitt$1
      });
      function polyfill(w2 = window, d2 = document) {
        if ("scrollBehavior" in d2.documentElement.style && w2.__forceSmoothScrollPolyfill__ !== true) {
          return;
        }
        const Element2 = w2.HTMLElement || w2.Element;
        const SCROLL_TIME = 468;
        const original = {
          scroll: w2.scroll || w2.scrollTo,
          scrollBy: w2.scrollBy,
          elementScroll: Element2.prototype.scroll || scrollElement,
          scrollIntoView: Element2.prototype.scrollIntoView
        };
        const now = w2.performance && w2.performance.now ? w2.performance.now.bind(w2.performance) : Date.now;
        function isMicrosoftBrowser(userAgent) {
          const userAgentPatterns = ["MSIE ", "Trident/", "Edge/"];
          return new RegExp(userAgentPatterns.join("|")).test(userAgent);
        }
        const ROUNDING_TOLERANCE = isMicrosoftBrowser(w2.navigator.userAgent) ? 1 : 0;
        function scrollElement(x3, y2) {
          this.scrollLeft = x3;
          this.scrollTop = y2;
        }
        function ease(k2) {
          return 0.5 * (1 - Math.cos(Math.PI * k2));
        }
        function shouldBailOut(firstArg) {
          if (firstArg === null || typeof firstArg !== "object" || firstArg.behavior === void 0 || firstArg.behavior === "auto" || firstArg.behavior === "instant") {
            return true;
          }
          if (typeof firstArg === "object" && firstArg.behavior === "smooth") {
            return false;
          }
          throw new TypeError("behavior member of ScrollOptions " + firstArg.behavior + " is not a valid value for enumeration ScrollBehavior.");
        }
        function hasScrollableSpace(el, axis) {
          if (axis === "Y") {
            return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight;
          }
          if (axis === "X") {
            return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth;
          }
        }
        function canOverflow(el, axis) {
          const overflowValue = w2.getComputedStyle(el, null)["overflow" + axis];
          return overflowValue === "auto" || overflowValue === "scroll";
        }
        function isScrollable(el) {
          const isScrollableY = hasScrollableSpace(el, "Y") && canOverflow(el, "Y");
          const isScrollableX = hasScrollableSpace(el, "X") && canOverflow(el, "X");
          return isScrollableY || isScrollableX;
        }
        function findScrollableParent(el) {
          while (el !== d2.body && isScrollable(el) === false) {
            el = el.parentNode || el.host;
          }
          return el;
        }
        function step(context) {
          const time = now();
          let value;
          let currentX;
          let currentY;
          let elapsed = (time - context.startTime) / SCROLL_TIME;
          elapsed = elapsed > 1 ? 1 : elapsed;
          value = ease(elapsed);
          currentX = context.startX + (context.x - context.startX) * value;
          currentY = context.startY + (context.y - context.startY) * value;
          context.method.call(context.scrollable, currentX, currentY);
          if (currentX !== context.x || currentY !== context.y) {
            w2.requestAnimationFrame(step.bind(w2, context));
          }
        }
        function smoothScroll(el, x3, y2) {
          let scrollable;
          let startX;
          let startY;
          let method;
          const startTime = now();
          if (el === d2.body) {
            scrollable = w2;
            startX = w2.scrollX || w2.pageXOffset;
            startY = w2.scrollY || w2.pageYOffset;
            method = original.scroll;
          } else {
            scrollable = el;
            startX = el.scrollLeft;
            startY = el.scrollTop;
            method = scrollElement;
          }
          step({
            scrollable,
            method,
            startTime,
            startX,
            startY,
            x: x3,
            y: y2
          });
        }
        w2.scroll = w2.scrollTo = function() {
          if (arguments[0] === void 0) {
            return;
          }
          if (shouldBailOut(arguments[0]) === true) {
            original.scroll.call(w2, arguments[0].left !== void 0 ? arguments[0].left : typeof arguments[0] !== "object" ? arguments[0] : w2.scrollX || w2.pageXOffset, arguments[0].top !== void 0 ? arguments[0].top : arguments[1] !== void 0 ? arguments[1] : w2.scrollY || w2.pageYOffset);
            return;
          }
          smoothScroll.call(w2, d2.body, arguments[0].left !== void 0 ? ~~arguments[0].left : w2.scrollX || w2.pageXOffset, arguments[0].top !== void 0 ? ~~arguments[0].top : w2.scrollY || w2.pageYOffset);
        };
        w2.scrollBy = function() {
          if (arguments[0] === void 0) {
            return;
          }
          if (shouldBailOut(arguments[0])) {
            original.scrollBy.call(w2, arguments[0].left !== void 0 ? arguments[0].left : typeof arguments[0] !== "object" ? arguments[0] : 0, arguments[0].top !== void 0 ? arguments[0].top : arguments[1] !== void 0 ? arguments[1] : 0);
            return;
          }
          smoothScroll.call(w2, d2.body, ~~arguments[0].left + (w2.scrollX || w2.pageXOffset), ~~arguments[0].top + (w2.scrollY || w2.pageYOffset));
        };
        Element2.prototype.scroll = Element2.prototype.scrollTo = function() {
          if (arguments[0] === void 0) {
            return;
          }
          if (shouldBailOut(arguments[0]) === true) {
            if (typeof arguments[0] === "number" && arguments[1] === void 0) {
              throw new SyntaxError("Value could not be converted");
            }
            original.elementScroll.call(this, arguments[0].left !== void 0 ? ~~arguments[0].left : typeof arguments[0] !== "object" ? ~~arguments[0] : this.scrollLeft, arguments[0].top !== void 0 ? ~~arguments[0].top : arguments[1] !== void 0 ? ~~arguments[1] : this.scrollTop);
            return;
          }
          const left = arguments[0].left;
          const top = arguments[0].top;
          smoothScroll.call(this, this, typeof left === "undefined" ? this.scrollLeft : ~~left, typeof top === "undefined" ? this.scrollTop : ~~top);
        };
        Element2.prototype.scrollBy = function() {
          if (arguments[0] === void 0) {
            return;
          }
          if (shouldBailOut(arguments[0]) === true) {
            original.elementScroll.call(this, arguments[0].left !== void 0 ? ~~arguments[0].left + this.scrollLeft : ~~arguments[0] + this.scrollLeft, arguments[0].top !== void 0 ? ~~arguments[0].top + this.scrollTop : ~~arguments[1] + this.scrollTop);
            return;
          }
          this.scroll({
            left: ~~arguments[0].left + this.scrollLeft,
            top: ~~arguments[0].top + this.scrollTop,
            behavior: arguments[0].behavior
          });
        };
        Element2.prototype.scrollIntoView = function() {
          if (shouldBailOut(arguments[0]) === true) {
            original.scrollIntoView.call(this, arguments[0] === void 0 ? true : arguments[0]);
            return;
          }
          const scrollableParent = findScrollableParent(this);
          const parentRects = scrollableParent.getBoundingClientRect();
          const clientRects = this.getBoundingClientRect();
          if (scrollableParent !== d2.body) {
            smoothScroll.call(this, scrollableParent, scrollableParent.scrollLeft + clientRects.left - parentRects.left, scrollableParent.scrollTop + clientRects.top - parentRects.top);
            if (w2.getComputedStyle(scrollableParent).position !== "fixed") {
              w2.scrollBy({
                left: parentRects.left,
                top: parentRects.top,
                behavior: "smooth"
              });
            }
          } else {
            w2.scrollBy({
              left: clientRects.left,
              top: clientRects.top,
              behavior: "smooth"
            });
          }
        };
      }
      var Timer = class {
        constructor(actions = [], config) {
          this.timeOffset = 0;
          this.raf = null;
          this.actions = actions;
          this.speed = config.speed;
        }
        addAction(action) {
          const rafWasActive = this.raf === true;
          if (!this.actions.length || this.actions[this.actions.length - 1].delay <= action.delay) {
            this.actions.push(action);
          } else {
            const index = this.findActionIndex(action);
            this.actions.splice(index, 0, action);
          }
          if (rafWasActive) {
            this.raf = requestAnimationFrame(this.rafCheck.bind(this));
          }
        }
        start() {
          this.timeOffset = 0;
          this.lastTimestamp = performance.now();
          this.raf = requestAnimationFrame(this.rafCheck.bind(this));
        }
        rafCheck() {
          const time = performance.now();
          this.timeOffset += (time - this.lastTimestamp) * this.speed;
          this.lastTimestamp = time;
          while (this.actions.length) {
            const action = this.actions[0];
            if (this.timeOffset >= action.delay) {
              this.actions.shift();
              action.doAction();
            } else {
              break;
            }
          }
          if (this.actions.length > 0) {
            this.raf = requestAnimationFrame(this.rafCheck.bind(this));
          } else {
            this.raf = true;
          }
        }
        clear() {
          if (this.raf) {
            if (this.raf !== true) {
              cancelAnimationFrame(this.raf);
            }
            this.raf = null;
          }
          this.actions.length = 0;
        }
        setSpeed(speed) {
          this.speed = speed;
        }
        isActive() {
          return this.raf !== null;
        }
        findActionIndex(action) {
          let start = 0;
          let end = this.actions.length - 1;
          while (start <= end) {
            const mid = Math.floor((start + end) / 2);
            if (this.actions[mid].delay < action.delay) {
              start = mid + 1;
            } else if (this.actions[mid].delay > action.delay) {
              end = mid - 1;
            } else {
              return mid + 1;
            }
          }
          return start;
        }
      };
      function addDelay(event, baselineTime) {
        if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.MouseMove && event.data.positions && event.data.positions.length) {
          const firstOffset = event.data.positions[0].timeOffset;
          const firstTimestamp = event.timestamp + firstOffset;
          event.delay = firstTimestamp - baselineTime;
          return firstTimestamp - baselineTime;
        }
        event.delay = event.timestamp - baselineTime;
        return event.delay;
      }
      function t2(t3, n3) {
        var e3 = "function" == typeof Symbol && t3[Symbol.iterator];
        if (!e3) return t3;
        var r3, o3, i3 = e3.call(t3), a3 = [];
        try {
          for (; (void 0 === n3 || n3-- > 0) && !(r3 = i3.next()).done; ) a3.push(r3.value);
        } catch (t4) {
          o3 = { error: t4 };
        } finally {
          try {
            r3 && !r3.done && (e3 = i3.return) && e3.call(i3);
          } finally {
            if (o3) throw o3.error;
          }
        }
        return a3;
      }
      var n2;
      !function(t3) {
        t3[t3.NotStarted = 0] = "NotStarted", t3[t3.Running = 1] = "Running", t3[t3.Stopped = 2] = "Stopped";
      }(n2 || (n2 = {}));
      var e2 = { type: "xstate.init" };
      function r2(t3) {
        return void 0 === t3 ? [] : [].concat(t3);
      }
      function o2(t3) {
        return { type: "xstate.assign", assignment: t3 };
      }
      function i$1(t3, n3) {
        return "string" == typeof (t3 = "string" == typeof t3 && n3 && n3[t3] ? n3[t3] : t3) ? { type: t3 } : "function" == typeof t3 ? { type: t3.name, exec: t3 } : t3;
      }
      function a2(t3) {
        return function(n3) {
          return t3 === n3;
        };
      }
      function u2(t3) {
        return "string" == typeof t3 ? { type: t3 } : t3;
      }
      function c2(t3, n3) {
        return { value: t3, context: n3, actions: [], changed: false, matches: a2(t3) };
      }
      function f2(t3, n3, e3) {
        var r3 = n3, o3 = false;
        return [t3.filter(function(t4) {
          if ("xstate.assign" === t4.type) {
            o3 = true;
            var n4 = Object.assign({}, r3);
            return "function" == typeof t4.assignment ? n4 = t4.assignment(r3, e3) : Object.keys(t4.assignment).forEach(function(o4) {
              n4[o4] = "function" == typeof t4.assignment[o4] ? t4.assignment[o4](r3, e3) : t4.assignment[o4];
            }), r3 = n4, false;
          }
          return true;
        }), r3, o3];
      }
      function s2(n3, o3) {
        void 0 === o3 && (o3 = {});
        var s3 = t2(f2(r2(n3.states[n3.initial].entry).map(function(t3) {
          return i$1(t3, o3.actions);
        }), n3.context, e2), 2), l3 = s3[0], v3 = s3[1], y2 = { config: n3, _options: o3, initialState: { value: n3.initial, actions: l3, context: v3, matches: a2(n3.initial) }, transition: function(e3, o4) {
          var s4, l4, v4 = "string" == typeof e3 ? { value: e3, context: n3.context } : e3, p2 = v4.value, g2 = v4.context, d2 = u2(o4), x3 = n3.states[p2];
          if (x3.on) {
            var m2 = r2(x3.on[d2.type]);
            try {
              for (var h2 = function(t3) {
                var n4 = "function" == typeof Symbol && Symbol.iterator, e4 = n4 && t3[n4], r3 = 0;
                if (e4) return e4.call(t3);
                if (t3 && "number" == typeof t3.length) return { next: function() {
                  return t3 && r3 >= t3.length && (t3 = void 0), { value: t3 && t3[r3++], done: !t3 };
                } };
                throw new TypeError(n4 ? "Object is not iterable." : "Symbol.iterator is not defined.");
              }(m2), b2 = h2.next(); !b2.done; b2 = h2.next()) {
                var S2 = b2.value;
                if (void 0 === S2) return c2(p2, g2);
                var w2 = "string" == typeof S2 ? { target: S2 } : S2, j = w2.target, E2 = w2.actions, R = void 0 === E2 ? [] : E2, N2 = w2.cond, O2 = void 0 === N2 ? function() {
                  return true;
                } : N2, _2 = void 0 === j, k2 = null != j ? j : p2, T2 = n3.states[k2];
                if (O2(g2, d2)) {
                  var q2 = t2(f2((_2 ? r2(R) : [].concat(x3.exit, R, T2.entry).filter(function(t3) {
                    return t3;
                  })).map(function(t3) {
                    return i$1(t3, y2._options.actions);
                  }), g2, d2), 3), z = q2[0], A2 = q2[1], B2 = q2[2], C2 = null != j ? j : p2;
                  return { value: C2, context: A2, actions: z, changed: j !== p2 || z.length > 0 || B2, matches: a2(C2) };
                }
              }
            } catch (t3) {
              s4 = { error: t3 };
            } finally {
              try {
                b2 && !b2.done && (l4 = h2.return) && l4.call(h2);
              } finally {
                if (s4) throw s4.error;
              }
            }
          }
          return c2(p2, g2);
        } };
        return y2;
      }
      var l2 = function(t3, n3) {
        return t3.actions.forEach(function(e3) {
          var r3 = e3.exec;
          return r3 && r3(t3.context, n3);
        });
      };
      function v2(t3) {
        var r3 = t3.initialState, o3 = n2.NotStarted, i3 = /* @__PURE__ */ new Set(), c3 = { _machine: t3, send: function(e3) {
          o3 === n2.Running && (r3 = t3.transition(r3, e3), l2(r3, u2(e3)), i3.forEach(function(t4) {
            return t4(r3);
          }));
        }, subscribe: function(t4) {
          return i3.add(t4), t4(r3), { unsubscribe: function() {
            return i3.delete(t4);
          } };
        }, start: function(i4) {
          if (i4) {
            var u3 = "object" == typeof i4 ? i4 : { context: t3.config.context, value: i4 };
            r3 = { value: u3.value, actions: [], context: u3.context, matches: a2(u3.value) };
          }
          return o3 = n2.Running, l2(r3, e2), c3;
        }, stop: function() {
          return o3 = n2.Stopped, i3.clear(), c3;
        }, get state() {
          return r3;
        }, get status() {
          return o3;
        } };
        return c3;
      }
      function discardPriorSnapshots(events, baselineTime) {
        for (let idx = events.length - 1; idx >= 0; idx--) {
          const event = events[idx];
          if (event.type === EventType.Meta) {
            if (event.timestamp <= baselineTime) {
              return events.slice(idx);
            }
          }
        }
        return events;
      }
      function createPlayerService(context, { getCastFn, applyEventsSynchronously, emitter }) {
        const playerMachine = s2({
          id: "player",
          context,
          initial: "paused",
          states: {
            playing: {
              on: {
                PAUSE: {
                  target: "paused",
                  actions: ["pause"]
                },
                CAST_EVENT: {
                  target: "playing",
                  actions: "castEvent"
                },
                END: {
                  target: "paused",
                  actions: ["resetLastPlayedEvent", "pause"]
                },
                ADD_EVENT: {
                  target: "playing",
                  actions: ["addEvent"]
                }
              }
            },
            paused: {
              on: {
                PLAY: {
                  target: "playing",
                  actions: ["recordTimeOffset", "play"]
                },
                CAST_EVENT: {
                  target: "paused",
                  actions: "castEvent"
                },
                TO_LIVE: {
                  target: "live",
                  actions: ["startLive"]
                },
                ADD_EVENT: {
                  target: "paused",
                  actions: ["addEvent"]
                }
              }
            },
            live: {
              on: {
                ADD_EVENT: {
                  target: "live",
                  actions: ["addEvent"]
                },
                CAST_EVENT: {
                  target: "live",
                  actions: ["castEvent"]
                }
              }
            }
          }
        }, {
          actions: {
            castEvent: o2({
              lastPlayedEvent: (ctx, event) => {
                if (event.type === "CAST_EVENT") {
                  return event.payload.event;
                }
                return ctx.lastPlayedEvent;
              }
            }),
            recordTimeOffset: o2((ctx, event) => {
              let timeOffset = ctx.timeOffset;
              if ("payload" in event && "timeOffset" in event.payload) {
                timeOffset = event.payload.timeOffset;
              }
              return Object.assign(Object.assign({}, ctx), { timeOffset, baselineTime: ctx.events[0].timestamp + timeOffset });
            }),
            play(ctx) {
              var _a2;
              const { timer, events, baselineTime, lastPlayedEvent } = ctx;
              timer.clear();
              for (const event of events) {
                addDelay(event, baselineTime);
              }
              const neededEvents = discardPriorSnapshots(events, baselineTime);
              let lastPlayedTimestamp = lastPlayedEvent === null || lastPlayedEvent === void 0 ? void 0 : lastPlayedEvent.timestamp;
              if ((lastPlayedEvent === null || lastPlayedEvent === void 0 ? void 0 : lastPlayedEvent.type) === EventType.IncrementalSnapshot && lastPlayedEvent.data.source === IncrementalSource.MouseMove) {
                lastPlayedTimestamp = lastPlayedEvent.timestamp + ((_a2 = lastPlayedEvent.data.positions[0]) === null || _a2 === void 0 ? void 0 : _a2.timeOffset);
              }
              if (baselineTime < (lastPlayedTimestamp || 0)) {
                emitter.emit(ReplayerEvents.PlayBack);
              }
              const syncEvents = new Array();
              for (const event of neededEvents) {
                if (lastPlayedTimestamp && lastPlayedTimestamp < baselineTime && (event.timestamp <= lastPlayedTimestamp || event === lastPlayedEvent)) {
                  continue;
                }
                if (event.timestamp < baselineTime) {
                  syncEvents.push(event);
                } else {
                  const castFn = getCastFn(event, false);
                  timer.addAction({
                    doAction: () => {
                      castFn();
                    },
                    delay: event.delay
                  });
                }
              }
              applyEventsSynchronously(syncEvents);
              emitter.emit(ReplayerEvents.Flush);
              timer.start();
            },
            pause(ctx) {
              ctx.timer.clear();
            },
            resetLastPlayedEvent: o2((ctx) => {
              return Object.assign(Object.assign({}, ctx), { lastPlayedEvent: null });
            }),
            startLive: o2({
              baselineTime: (ctx, event) => {
                ctx.timer.start();
                if (event.type === "TO_LIVE" && event.payload.baselineTime) {
                  return event.payload.baselineTime;
                }
                return Date.now();
              }
            }),
            addEvent: o2((ctx, machineEvent) => {
              const { baselineTime, timer, events } = ctx;
              if (machineEvent.type === "ADD_EVENT") {
                const { event } = machineEvent.payload;
                addDelay(event, baselineTime);
                let end = events.length - 1;
                if (!events[end] || events[end].timestamp <= event.timestamp) {
                  events.push(event);
                } else {
                  let insertionIndex = -1;
                  let start = 0;
                  while (start <= end) {
                    const mid = Math.floor((start + end) / 2);
                    if (events[mid].timestamp <= event.timestamp) {
                      start = mid + 1;
                    } else {
                      end = mid - 1;
                    }
                  }
                  if (insertionIndex === -1) {
                    insertionIndex = start;
                  }
                  events.splice(insertionIndex, 0, event);
                }
                const isSync = event.timestamp < baselineTime;
                const castFn = getCastFn(event, isSync);
                if (isSync) {
                  castFn();
                } else if (timer.isActive()) {
                  timer.addAction({
                    doAction: () => {
                      castFn();
                    },
                    delay: event.delay
                  });
                }
              }
              return Object.assign(Object.assign({}, ctx), { events });
            })
          }
        });
        return v2(playerMachine);
      }
      function createSpeedService(context) {
        const speedMachine = s2({
          id: "speed",
          context,
          initial: "normal",
          states: {
            normal: {
              on: {
                FAST_FORWARD: {
                  target: "skipping",
                  actions: ["recordSpeed", "setSpeed"]
                },
                SET_SPEED: {
                  target: "normal",
                  actions: ["setSpeed"]
                }
              }
            },
            skipping: {
              on: {
                BACK_TO_NORMAL: {
                  target: "normal",
                  actions: ["restoreSpeed"]
                },
                SET_SPEED: {
                  target: "normal",
                  actions: ["setSpeed"]
                }
              }
            }
          }
        }, {
          actions: {
            setSpeed: (ctx, event) => {
              if ("payload" in event) {
                ctx.timer.setSpeed(event.payload.speed);
              }
            },
            recordSpeed: o2({
              normalSpeed: (ctx) => ctx.timer.speed
            }),
            restoreSpeed: (ctx) => {
              ctx.timer.setSpeed(ctx.normalSpeed);
            }
          }
        });
        return v2(speedMachine);
      }
      var rules = (blockClass) => [
        `.${blockClass} { background: currentColor }`,
        "noscript { display: none !important; }"
      ];
      var webGLVarMap = /* @__PURE__ */ new Map();
      function variableListFor(ctx, ctor) {
        let contextMap = webGLVarMap.get(ctx);
        if (!contextMap) {
          contextMap = /* @__PURE__ */ new Map();
          webGLVarMap.set(ctx, contextMap);
        }
        if (!contextMap.has(ctor)) {
          contextMap.set(ctor, []);
        }
        return contextMap.get(ctor);
      }
      function deserializeArg(imageMap, ctx, preload) {
        return (arg) => __awaiter(this, void 0, void 0, function* () {
          if (arg && typeof arg === "object" && "rr_type" in arg) {
            if (preload)
              preload.isUnchanged = false;
            if (arg.rr_type === "ImageBitmap" && "args" in arg) {
              const args = yield deserializeArg(imageMap, ctx, preload)(arg.args);
              return yield createImageBitmap.apply(null, args);
            } else if ("index" in arg) {
              if (preload || ctx === null)
                return arg;
              const { rr_type: name, index } = arg;
              return variableListFor(ctx, name)[index];
            } else if ("args" in arg) {
              const { rr_type: name, args } = arg;
              const ctor = window[name];
              return new ctor(...yield Promise.all(args.map(deserializeArg(imageMap, ctx, preload))));
            } else if ("base64" in arg) {
              return decode(arg.base64);
            } else if ("src" in arg) {
              const image = imageMap.get(arg.src);
              if (image) {
                return image;
              } else {
                const image2 = new Image();
                image2.src = arg.src;
                imageMap.set(arg.src, image2);
                return image2;
              }
            } else if ("data" in arg && arg.rr_type === "Blob") {
              const blobContents = yield Promise.all(arg.data.map(deserializeArg(imageMap, ctx, preload)));
              const blob = new Blob(blobContents, {
                type: arg.type
              });
              return blob;
            }
          } else if (Array.isArray(arg)) {
            const result = yield Promise.all(arg.map(deserializeArg(imageMap, ctx, preload)));
            return result;
          }
          return arg;
        });
      }
      function getContext(target, type) {
        try {
          if (type === CanvasContext.WebGL) {
            return target.getContext("webgl") || target.getContext("experimental-webgl");
          }
          return target.getContext("webgl2");
        } catch (e3) {
          return null;
        }
      }
      var WebGLVariableConstructorsNames = [
        "WebGLActiveInfo",
        "WebGLBuffer",
        "WebGLFramebuffer",
        "WebGLProgram",
        "WebGLRenderbuffer",
        "WebGLShader",
        "WebGLShaderPrecisionFormat",
        "WebGLTexture",
        "WebGLUniformLocation",
        "WebGLVertexArrayObject"
      ];
      function saveToWebGLVarMap(ctx, result) {
        if (!(result === null || result === void 0 ? void 0 : result.constructor))
          return;
        const { name } = result.constructor;
        if (!WebGLVariableConstructorsNames.includes(name))
          return;
        const variables = variableListFor(ctx, name);
        if (!variables.includes(result))
          variables.push(result);
      }
      function webglMutation({ mutation, target, type, imageMap, errorHandler: errorHandler2 }) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const ctx = getContext(target, type);
            if (!ctx)
              return;
            if (mutation.setter) {
              ctx[mutation.property] = mutation.args[0];
              return;
            }
            const original = ctx[mutation.property];
            const args = yield Promise.all(mutation.args.map(deserializeArg(imageMap, ctx)));
            const result = original.apply(ctx, args);
            saveToWebGLVarMap(ctx, result);
            const debugMode = false;
            if (debugMode) ;
          } catch (error) {
            errorHandler2(mutation, error);
          }
        });
      }
      function canvasMutation$1({ event, mutations, target, imageMap, errorHandler: errorHandler2 }) {
        return __awaiter(this, void 0, void 0, function* () {
          const ctx = target.getContext("2d");
          if (!ctx) {
            errorHandler2(mutations[0], new Error("Canvas context is null"));
            return;
          }
          const mutationArgsPromises = mutations.map((mutation) => __awaiter(this, void 0, void 0, function* () {
            return Promise.all(mutation.args.map(deserializeArg(imageMap, ctx)));
          }));
          const args = yield Promise.all(mutationArgsPromises);
          args.forEach((args2, index) => {
            const mutation = mutations[index];
            try {
              if (mutation.setter) {
                ctx[mutation.property] = mutation.args[0];
                return;
              }
              const original = ctx[mutation.property];
              if (mutation.property === "drawImage" && typeof mutation.args[0] === "string") {
                imageMap.get(event);
                original.apply(ctx, mutation.args);
              } else {
                original.apply(ctx, args2);
              }
            } catch (error) {
              errorHandler2(mutation, error);
            }
            return;
          });
        });
      }
      function canvasMutation({ event, mutation, target, imageMap, canvasEventMap, errorHandler: errorHandler2 }) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const precomputedMutation = canvasEventMap.get(event) || mutation;
            const commands = "commands" in precomputedMutation ? precomputedMutation.commands : [precomputedMutation];
            if ([CanvasContext.WebGL, CanvasContext.WebGL2].includes(mutation.type)) {
              for (let i3 = 0; i3 < commands.length; i3++) {
                const command = commands[i3];
                yield webglMutation({
                  mutation: command,
                  type: mutation.type,
                  target,
                  imageMap,
                  errorHandler: errorHandler2
                });
              }
              return;
            }
            yield canvasMutation$1({
              event,
              mutations: commands,
              target,
              imageMap,
              errorHandler: errorHandler2
            });
          } catch (error) {
            errorHandler2(mutation, error);
          }
        });
      }
      var SKIP_TIME_THRESHOLD = 10 * 1e3;
      var SKIP_TIME_INTERVAL = 5 * 1e3;
      var mitt = mitt$1 || mittProxy;
      var REPLAY_CONSOLE_PREFIX = "[replayer]";
      var defaultMouseTailConfig = {
        duration: 500,
        lineCap: "round",
        lineWidth: 3,
        strokeStyle: "red"
      };
      function indicatesTouchDevice(e3) {
        return e3.type == EventType.IncrementalSnapshot && (e3.data.source == IncrementalSource.TouchMove || e3.data.source == IncrementalSource.MouseInteraction && e3.data.type == MouseInteractions.TouchStart);
      }
      var Replayer = class {
        get timer() {
          return this.service.state.context.timer;
        }
        constructor(events, config) {
          this.usingVirtualDom = false;
          this.virtualDom = new RRDocument();
          this.mouseTail = null;
          this.tailPositions = [];
          this.emitter = mitt();
          this.legacy_missingNodeRetryMap = {};
          this.cache = createCache();
          this.imageMap = /* @__PURE__ */ new Map();
          this.canvasEventMap = /* @__PURE__ */ new Map();
          this.mirror = createMirror$2();
          this.styleMirror = new StyleSheetMirror();
          this.firstFullSnapshot = null;
          this.newDocumentQueue = [];
          this.mousePos = null;
          this.touchActive = null;
          this.lastMouseDownEvent = null;
          this.lastSelectionData = null;
          this.constructedStyleMutations = [];
          this.adoptedStyleSheets = [];
          this.handleResize = (dimension) => {
            this.iframe.style.display = "inherit";
            for (const el of [this.mouseTail, this.iframe]) {
              if (!el) {
                continue;
              }
              el.setAttribute("width", String(dimension.width));
              el.setAttribute("height", String(dimension.height));
            }
          };
          this.applyEventsSynchronously = (events2) => {
            for (const event of events2) {
              switch (event.type) {
                case EventType.DomContentLoaded:
                case EventType.Load:
                case EventType.Custom:
                  continue;
                case EventType.FullSnapshot:
                case EventType.Meta:
                case EventType.Plugin:
                case EventType.IncrementalSnapshot:
                  break;
              }
              const castFn = this.getCastFn(event, true);
              castFn();
            }
          };
          this.getCastFn = (event, isSync = false) => {
            let castFn;
            switch (event.type) {
              case EventType.DomContentLoaded:
              case EventType.Load:
                break;
              case EventType.Custom:
                castFn = () => {
                  this.emitter.emit(ReplayerEvents.CustomEvent, event);
                };
                break;
              case EventType.Meta:
                castFn = () => this.emitter.emit(ReplayerEvents.Resize, {
                  width: event.data.width,
                  height: event.data.height
                });
                break;
              case EventType.FullSnapshot:
                castFn = () => {
                  var _a2;
                  if (this.firstFullSnapshot) {
                    if (this.firstFullSnapshot === event) {
                      this.firstFullSnapshot = true;
                      return;
                    }
                  } else {
                    this.firstFullSnapshot = true;
                  }
                  this.rebuildFullSnapshot(event, isSync);
                  (_a2 = this.iframe.contentWindow) === null || _a2 === void 0 ? void 0 : _a2.scrollTo(event.data.initialOffset);
                  this.styleMirror.reset();
                };
                break;
              case EventType.IncrementalSnapshot:
                castFn = () => {
                  this.applyIncremental(event, isSync);
                  if (isSync) {
                    return;
                  }
                  if (event === this.nextUserInteractionEvent) {
                    this.nextUserInteractionEvent = null;
                    this.backToNormal();
                  }
                  if (this.config.skipInactive && !this.nextUserInteractionEvent) {
                    for (const _event of this.service.state.context.events) {
                      if (_event.timestamp <= event.timestamp) {
                        continue;
                      }
                      if (this.isUserInteraction(_event)) {
                        if (_event.delay - event.delay > SKIP_TIME_THRESHOLD * this.speedService.state.context.timer.speed) {
                          this.nextUserInteractionEvent = _event;
                        }
                        break;
                      }
                    }
                    if (this.nextUserInteractionEvent) {
                      const skipTime = this.nextUserInteractionEvent.delay - event.delay;
                      const payload = {
                        speed: Math.min(Math.round(skipTime / SKIP_TIME_INTERVAL), this.config.maxSpeed)
                      };
                      this.speedService.send({ type: "FAST_FORWARD", payload });
                      this.emitter.emit(ReplayerEvents.SkipStart, payload);
                    }
                  }
                };
                break;
            }
            const wrappedCastFn = () => {
              if (castFn) {
                castFn();
              }
              for (const plugin of this.config.plugins || []) {
                if (plugin.handler)
                  plugin.handler(event, isSync, { replayer: this });
              }
              this.service.send({ type: "CAST_EVENT", payload: { event } });
              const last_index = this.service.state.context.events.length - 1;
              if (!this.config.liveMode && event === this.service.state.context.events[last_index]) {
                const finish = () => {
                  if (last_index < this.service.state.context.events.length - 1) {
                    return;
                  }
                  this.backToNormal();
                  this.service.send("END");
                  this.emitter.emit(ReplayerEvents.Finish);
                };
                let finish_buffer = 50;
                if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.MouseMove && event.data.positions.length) {
                  finish_buffer += Math.max(0, -event.data.positions[0].timeOffset);
                }
                setTimeout(finish, finish_buffer);
              }
              this.emitter.emit(ReplayerEvents.EventCast, event);
            };
            return wrappedCastFn;
          };
          if (!(config === null || config === void 0 ? void 0 : config.liveMode) && events.length < 2) {
            throw new Error("Replayer need at least 2 events.");
          }
          const defaultConfig = {
            speed: 1,
            maxSpeed: 360,
            root: document.body,
            loadTimeout: 0,
            skipInactive: false,
            showWarning: true,
            showDebug: false,
            blockClass: "rr-block",
            liveMode: false,
            insertStyleRules: [],
            triggerFocus: true,
            UNSAFE_replayCanvas: false,
            pauseAnimation: true,
            mouseTail: defaultMouseTailConfig,
            useVirtualDom: true,
            logger: console
          };
          this.config = Object.assign({}, defaultConfig, config);
          this.handleResize = this.handleResize.bind(this);
          this.getCastFn = this.getCastFn.bind(this);
          this.applyEventsSynchronously = this.applyEventsSynchronously.bind(this);
          this.emitter.on(ReplayerEvents.Resize, this.handleResize);
          this.setupDom();
          for (const plugin of this.config.plugins || []) {
            if (plugin.getMirror)
              plugin.getMirror({ nodeMirror: this.mirror });
          }
          this.emitter.on(ReplayerEvents.Flush, () => {
            if (this.usingVirtualDom) {
              const replayerHandler = {
                mirror: this.mirror,
                applyCanvas: (canvasEvent, canvasMutationData, target) => {
                  void canvasMutation({
                    event: canvasEvent,
                    mutation: canvasMutationData,
                    target,
                    imageMap: this.imageMap,
                    canvasEventMap: this.canvasEventMap,
                    errorHandler: this.warnCanvasMutationFailed.bind(this)
                  });
                },
                applyInput: this.applyInput.bind(this),
                applyScroll: this.applyScroll.bind(this),
                applyStyleSheetMutation: (data, styleSheet) => {
                  if (data.source === IncrementalSource.StyleSheetRule)
                    this.applyStyleSheetRule(data, styleSheet);
                  else if (data.source === IncrementalSource.StyleDeclaration)
                    this.applyStyleDeclaration(data, styleSheet);
                },
                afterAppend: (node, id) => {
                  for (const plugin of this.config.plugins || []) {
                    if (plugin.onBuild)
                      plugin.onBuild(node, { id, replayer: this });
                  }
                }
              };
              if (this.iframe.contentDocument)
                try {
                  diff(this.iframe.contentDocument, this.virtualDom, replayerHandler, this.virtualDom.mirror);
                } catch (e3) {
                  console.warn(e3);
                }
              this.virtualDom.destroyTree();
              this.usingVirtualDom = false;
              if (Object.keys(this.legacy_missingNodeRetryMap).length) {
                for (const key in this.legacy_missingNodeRetryMap) {
                  try {
                    const value = this.legacy_missingNodeRetryMap[key];
                    const realNode = createOrGetNode(value.node, this.mirror, this.virtualDom.mirror);
                    diff(realNode, value.node, replayerHandler, this.virtualDom.mirror);
                    value.node = realNode;
                  } catch (error) {
                    this.warn(error);
                  }
                }
              }
              this.constructedStyleMutations.forEach((data) => {
                this.applyStyleSheetMutation(data);
              });
              this.constructedStyleMutations = [];
              this.adoptedStyleSheets.forEach((data) => {
                this.applyAdoptedStyleSheet(data);
              });
              this.adoptedStyleSheets = [];
            }
            if (this.mousePos) {
              this.moveAndHover(this.mousePos.x, this.mousePos.y, this.mousePos.id, true, this.mousePos.debugData);
              this.mousePos = null;
            }
            if (this.touchActive === true) {
              this.mouse.classList.add("touch-active");
            } else if (this.touchActive === false) {
              this.mouse.classList.remove("touch-active");
            }
            this.touchActive = null;
            if (this.lastMouseDownEvent) {
              const [target, event] = this.lastMouseDownEvent;
              target.dispatchEvent(event);
            }
            this.lastMouseDownEvent = null;
            if (this.lastSelectionData) {
              this.applySelection(this.lastSelectionData);
              this.lastSelectionData = null;
            }
          });
          this.emitter.on(ReplayerEvents.PlayBack, () => {
            this.firstFullSnapshot = null;
            this.mirror.reset();
            this.styleMirror.reset();
          });
          const timer = new Timer([], {
            speed: this.config.speed
          });
          this.service = createPlayerService({
            events: events.map((e3) => {
              if (config && config.unpackFn) {
                return config.unpackFn(e3);
              }
              return e3;
            }).sort((a1, a22) => a1.timestamp - a22.timestamp),
            timer,
            timeOffset: 0,
            baselineTime: 0,
            lastPlayedEvent: null
          }, {
            getCastFn: this.getCastFn,
            applyEventsSynchronously: this.applyEventsSynchronously,
            emitter: this.emitter
          });
          this.service.start();
          this.service.subscribe((state) => {
            this.emitter.emit(ReplayerEvents.StateChange, {
              player: state
            });
          });
          this.speedService = createSpeedService({
            normalSpeed: -1,
            timer
          });
          this.speedService.start();
          this.speedService.subscribe((state) => {
            this.emitter.emit(ReplayerEvents.StateChange, {
              speed: state
            });
          });
          const firstMeta = this.service.state.context.events.find((e3) => e3.type === EventType.Meta);
          const firstFullsnapshot = this.service.state.context.events.find((e3) => e3.type === EventType.FullSnapshot);
          if (firstMeta) {
            const { width, height } = firstMeta.data;
            setTimeout(() => {
              this.emitter.emit(ReplayerEvents.Resize, {
                width,
                height
              });
            }, 0);
          }
          if (firstFullsnapshot) {
            setTimeout(() => {
              var _a2;
              if (this.firstFullSnapshot) {
                return;
              }
              this.firstFullSnapshot = firstFullsnapshot;
              this.rebuildFullSnapshot(firstFullsnapshot);
              (_a2 = this.iframe.contentWindow) === null || _a2 === void 0 ? void 0 : _a2.scrollTo(firstFullsnapshot.data.initialOffset);
            }, 1);
          }
          if (this.service.state.context.events.find(indicatesTouchDevice)) {
            this.mouse.classList.add("touch-device");
          }
        }
        on(event, handler) {
          this.emitter.on(event, handler);
          return this;
        }
        off(event, handler) {
          this.emitter.off(event, handler);
          return this;
        }
        setConfig(config) {
          Object.keys(config).forEach((key) => {
            config[key];
            this.config[key] = config[key];
          });
          if (!this.config.skipInactive) {
            this.backToNormal();
          }
          if (typeof config.speed !== "undefined") {
            this.speedService.send({
              type: "SET_SPEED",
              payload: {
                speed: config.speed
              }
            });
          }
          if (typeof config.mouseTail !== "undefined") {
            if (config.mouseTail === false) {
              if (this.mouseTail) {
                this.mouseTail.style.display = "none";
              }
            } else {
              if (!this.mouseTail) {
                this.mouseTail = document.createElement("canvas");
                this.mouseTail.width = Number.parseFloat(this.iframe.width);
                this.mouseTail.height = Number.parseFloat(this.iframe.height);
                this.mouseTail.classList.add("replayer-mouse-tail");
                this.wrapper.insertBefore(this.mouseTail, this.iframe);
              }
              this.mouseTail.style.display = "inherit";
            }
          }
        }
        getMetaData() {
          const firstEvent = this.service.state.context.events[0];
          const lastEvent = this.service.state.context.events[this.service.state.context.events.length - 1];
          return {
            startTime: firstEvent.timestamp,
            endTime: lastEvent.timestamp,
            totalTime: lastEvent.timestamp - firstEvent.timestamp
          };
        }
        getCurrentTime() {
          return this.timer.timeOffset + this.getTimeOffset();
        }
        getTimeOffset() {
          const { baselineTime, events } = this.service.state.context;
          return baselineTime - events[0].timestamp;
        }
        getMirror() {
          return this.mirror;
        }
        play(timeOffset = 0) {
          var _a2, _b2;
          if (this.service.state.matches("paused")) {
            this.service.send({ type: "PLAY", payload: { timeOffset } });
          } else {
            this.service.send({ type: "PAUSE" });
            this.service.send({ type: "PLAY", payload: { timeOffset } });
          }
          (_b2 = (_a2 = this.iframe.contentDocument) === null || _a2 === void 0 ? void 0 : _a2.getElementsByTagName("html")[0]) === null || _b2 === void 0 ? void 0 : _b2.classList.remove("rrweb-paused");
          this.emitter.emit(ReplayerEvents.Start);
        }
        pause(timeOffset) {
          var _a2, _b2;
          if (timeOffset === void 0 && this.service.state.matches("playing")) {
            this.service.send({ type: "PAUSE" });
          }
          if (typeof timeOffset === "number") {
            this.play(timeOffset);
            this.service.send({ type: "PAUSE" });
          }
          (_b2 = (_a2 = this.iframe.contentDocument) === null || _a2 === void 0 ? void 0 : _a2.getElementsByTagName("html")[0]) === null || _b2 === void 0 ? void 0 : _b2.classList.add("rrweb-paused");
          this.emitter.emit(ReplayerEvents.Pause);
        }
        resume(timeOffset = 0) {
          this.warn(`The 'resume' was deprecated in 1.0. Please use 'play' method which has the same interface.`);
          this.play(timeOffset);
          this.emitter.emit(ReplayerEvents.Resume);
        }
        destroy() {
          this.pause();
          this.config.root.removeChild(this.wrapper);
          this.emitter.emit(ReplayerEvents.Destroy);
        }
        startLive(baselineTime) {
          this.service.send({ type: "TO_LIVE", payload: { baselineTime } });
        }
        addEvent(rawEvent) {
          const event = this.config.unpackFn ? this.config.unpackFn(rawEvent) : rawEvent;
          if (indicatesTouchDevice(event)) {
            this.mouse.classList.add("touch-device");
          }
          void Promise.resolve().then(() => this.service.send({ type: "ADD_EVENT", payload: { event } }));
        }
        enableInteract() {
          this.iframe.setAttribute("scrolling", "auto");
          this.iframe.style.pointerEvents = "auto";
        }
        disableInteract() {
          this.iframe.setAttribute("scrolling", "no");
          this.iframe.style.pointerEvents = "none";
        }
        resetCache() {
          this.cache = createCache();
        }
        setupDom() {
          this.wrapper = document.createElement("div");
          this.wrapper.classList.add("replayer-wrapper");
          this.config.root.appendChild(this.wrapper);
          this.mouse = document.createElement("div");
          this.mouse.classList.add("replayer-mouse");
          this.wrapper.appendChild(this.mouse);
          if (this.config.mouseTail !== false) {
            this.mouseTail = document.createElement("canvas");
            this.mouseTail.classList.add("replayer-mouse-tail");
            this.mouseTail.style.display = "inherit";
            this.wrapper.appendChild(this.mouseTail);
          }
          this.iframe = document.createElement("iframe");
          const attributes = ["allow-same-origin"];
          if (this.config.UNSAFE_replayCanvas) {
            attributes.push("allow-scripts");
          }
          this.iframe.style.display = "none";
          this.iframe.setAttribute("sandbox", attributes.join(" "));
          this.disableInteract();
          this.wrapper.appendChild(this.iframe);
          if (this.iframe.contentWindow && this.iframe.contentDocument) {
            polyfill(this.iframe.contentWindow, this.iframe.contentDocument);
            polyfill$1(this.iframe.contentWindow);
          }
        }
        rebuildFullSnapshot(event, isSync = false) {
          if (!this.iframe.contentDocument) {
            return this.warn("Looks like your replayer has been destroyed.");
          }
          if (Object.keys(this.legacy_missingNodeRetryMap).length) {
            this.warn("Found unresolved missing node map", this.legacy_missingNodeRetryMap);
          }
          this.legacy_missingNodeRetryMap = {};
          const collected = [];
          const afterAppend = (builtNode, id) => {
            this.collectIframeAndAttachDocument(collected, builtNode);
            for (const plugin of this.config.plugins || []) {
              if (plugin.onBuild)
                plugin.onBuild(builtNode, {
                  id,
                  replayer: this
                });
            }
          };
          if (this.usingVirtualDom) {
            this.virtualDom.destroyTree();
            this.usingVirtualDom = false;
          }
          this.mirror.reset();
          rebuild(event.data.node, {
            doc: this.iframe.contentDocument,
            afterAppend,
            cache: this.cache,
            mirror: this.mirror
          });
          afterAppend(this.iframe.contentDocument, event.data.node.id);
          for (const { mutationInQueue, builtNode } of collected) {
            this.attachDocumentToIframe(mutationInQueue, builtNode);
            this.newDocumentQueue = this.newDocumentQueue.filter((m2) => m2 !== mutationInQueue);
          }
          const { documentElement, head } = this.iframe.contentDocument;
          this.insertStyleRules(documentElement, head);
          if (!this.service.state.matches("playing")) {
            this.iframe.contentDocument.getElementsByTagName("html")[0].classList.add("rrweb-paused");
          }
          this.emitter.emit(ReplayerEvents.FullsnapshotRebuilded, event);
          if (!isSync) {
            this.waitForStylesheetLoad();
          }
          if (this.config.UNSAFE_replayCanvas) {
            void this.preloadAllImages();
          }
        }
        insertStyleRules(documentElement, head) {
          var _a2;
          const injectStylesRules = rules(this.config.blockClass).concat(this.config.insertStyleRules);
          if (this.config.pauseAnimation) {
            injectStylesRules.push("html.rrweb-paused *, html.rrweb-paused *:before, html.rrweb-paused *:after { animation-play-state: paused !important; }");
          }
          if (this.usingVirtualDom) {
            const styleEl = this.virtualDom.createElement("style");
            this.virtualDom.mirror.add(styleEl, getDefaultSN(styleEl, this.virtualDom.unserializedId));
            documentElement.insertBefore(styleEl, head);
            styleEl.rules.push({
              source: IncrementalSource.StyleSheetRule,
              adds: injectStylesRules.map((cssText, index) => ({
                rule: cssText,
                index
              }))
            });
          } else {
            const styleEl = document.createElement("style");
            documentElement.insertBefore(styleEl, head);
            for (let idx = 0; idx < injectStylesRules.length; idx++) {
              (_a2 = styleEl.sheet) === null || _a2 === void 0 ? void 0 : _a2.insertRule(injectStylesRules[idx], idx);
            }
          }
        }
        attachDocumentToIframe(mutation, iframeEl) {
          const mirror2 = this.usingVirtualDom ? this.virtualDom.mirror : this.mirror;
          const collected = [];
          const afterAppend = (builtNode, id) => {
            this.collectIframeAndAttachDocument(collected, builtNode);
            const sn = mirror2.getMeta(builtNode);
            if ((sn === null || sn === void 0 ? void 0 : sn.type) === NodeType$2.Element && (sn === null || sn === void 0 ? void 0 : sn.tagName.toUpperCase()) === "HTML") {
              const { documentElement, head } = iframeEl.contentDocument;
              this.insertStyleRules(documentElement, head);
            }
            if (this.usingVirtualDom)
              return;
            for (const plugin of this.config.plugins || []) {
              if (plugin.onBuild)
                plugin.onBuild(builtNode, {
                  id,
                  replayer: this
                });
            }
          };
          buildNodeWithSN(mutation.node, {
            doc: iframeEl.contentDocument,
            mirror: mirror2,
            hackCss: true,
            skipChild: false,
            afterAppend,
            cache: this.cache
          });
          afterAppend(iframeEl.contentDocument, mutation.node.id);
          for (const { mutationInQueue, builtNode } of collected) {
            this.attachDocumentToIframe(mutationInQueue, builtNode);
            this.newDocumentQueue = this.newDocumentQueue.filter((m2) => m2 !== mutationInQueue);
          }
        }
        collectIframeAndAttachDocument(collected, builtNode) {
          if (isSerializedIframe(builtNode, this.mirror)) {
            const mutationInQueue = this.newDocumentQueue.find((m2) => m2.parentId === this.mirror.getId(builtNode));
            if (mutationInQueue) {
              collected.push({
                mutationInQueue,
                builtNode
              });
            }
          }
        }
        waitForStylesheetLoad() {
          var _a2;
          const head = (_a2 = this.iframe.contentDocument) === null || _a2 === void 0 ? void 0 : _a2.head;
          if (head) {
            const unloadSheets = /* @__PURE__ */ new Set();
            let timer;
            let beforeLoadState = this.service.state;
            const stateHandler = () => {
              beforeLoadState = this.service.state;
            };
            this.emitter.on(ReplayerEvents.Start, stateHandler);
            this.emitter.on(ReplayerEvents.Pause, stateHandler);
            const unsubscribe = () => {
              this.emitter.off(ReplayerEvents.Start, stateHandler);
              this.emitter.off(ReplayerEvents.Pause, stateHandler);
            };
            head.querySelectorAll('link[rel="stylesheet"]').forEach((css) => {
              if (!css.sheet) {
                unloadSheets.add(css);
                css.addEventListener("load", () => {
                  unloadSheets.delete(css);
                  if (unloadSheets.size === 0 && timer !== -1) {
                    if (beforeLoadState.matches("playing")) {
                      this.play(this.getCurrentTime());
                    }
                    this.emitter.emit(ReplayerEvents.LoadStylesheetEnd);
                    if (timer) {
                      clearTimeout(timer);
                    }
                    unsubscribe();
                  }
                });
              }
            });
            if (unloadSheets.size > 0) {
              this.service.send({ type: "PAUSE" });
              this.emitter.emit(ReplayerEvents.LoadStylesheetStart);
              timer = setTimeout(() => {
                if (beforeLoadState.matches("playing")) {
                  this.play(this.getCurrentTime());
                }
                timer = -1;
                unsubscribe();
              }, this.config.loadTimeout);
            }
          }
        }
        preloadAllImages() {
          return __awaiter(this, void 0, void 0, function* () {
            this.service.state;
            const stateHandler = () => {
              this.service.state;
            };
            this.emitter.on(ReplayerEvents.Start, stateHandler);
            this.emitter.on(ReplayerEvents.Pause, stateHandler);
            const promises = [];
            for (const event of this.service.state.context.events) {
              if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.CanvasMutation) {
                promises.push(this.deserializeAndPreloadCanvasEvents(event.data, event));
                const commands = "commands" in event.data ? event.data.commands : [event.data];
                commands.forEach((c3) => {
                  this.preloadImages(c3, event);
                });
              }
            }
            return Promise.all(promises);
          });
        }
        preloadImages(data, event) {
          if (data.property === "drawImage" && typeof data.args[0] === "string" && !this.imageMap.has(event)) {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const imgd = ctx === null || ctx === void 0 ? void 0 : ctx.createImageData(canvas.width, canvas.height);
            imgd === null || imgd === void 0 ? void 0 : imgd.data;
            JSON.parse(data.args[0]);
            ctx === null || ctx === void 0 ? void 0 : ctx.putImageData(imgd, 0, 0);
          }
        }
        deserializeAndPreloadCanvasEvents(data, event) {
          return __awaiter(this, void 0, void 0, function* () {
            if (!this.canvasEventMap.has(event)) {
              const status = {
                isUnchanged: true
              };
              if ("commands" in data) {
                const commands = yield Promise.all(data.commands.map((c3) => __awaiter(this, void 0, void 0, function* () {
                  const args = yield Promise.all(c3.args.map(deserializeArg(this.imageMap, null, status)));
                  return Object.assign(Object.assign({}, c3), { args });
                })));
                if (status.isUnchanged === false)
                  this.canvasEventMap.set(event, Object.assign(Object.assign({}, data), { commands }));
              } else {
                const args = yield Promise.all(data.args.map(deserializeArg(this.imageMap, null, status)));
                if (status.isUnchanged === false)
                  this.canvasEventMap.set(event, Object.assign(Object.assign({}, data), { args }));
              }
            }
          });
        }
        applyIncremental(e3, isSync) {
          var _a2, _b2, _c;
          const { data: d2 } = e3;
          switch (d2.source) {
            case IncrementalSource.Mutation: {
              try {
                this.applyMutation(d2, isSync);
              } catch (error) {
                this.warn(`Exception in mutation ${error.message || error}`, d2);
              }
              break;
            }
            case IncrementalSource.Drag:
            case IncrementalSource.TouchMove:
            case IncrementalSource.MouseMove:
              if (isSync) {
                const lastPosition = d2.positions[d2.positions.length - 1];
                this.mousePos = {
                  x: lastPosition.x,
                  y: lastPosition.y,
                  id: lastPosition.id,
                  debugData: d2
                };
              } else {
                d2.positions.forEach((p2) => {
                  const action = {
                    doAction: () => {
                      this.moveAndHover(p2.x, p2.y, p2.id, isSync, d2);
                    },
                    delay: p2.timeOffset + e3.timestamp - this.service.state.context.baselineTime
                  };
                  this.timer.addAction(action);
                });
                this.timer.addAction({
                  doAction() {
                  },
                  delay: e3.delay - ((_a2 = d2.positions[0]) === null || _a2 === void 0 ? void 0 : _a2.timeOffset)
                });
              }
              break;
            case IncrementalSource.MouseInteraction: {
              if (d2.id === -1) {
                break;
              }
              const event = new Event(toLowerCase(MouseInteractions[d2.type]));
              const target = this.mirror.getNode(d2.id);
              if (!target) {
                return this.debugNodeNotFound(d2, d2.id);
              }
              this.emitter.emit(ReplayerEvents.MouseInteraction, {
                type: d2.type,
                target
              });
              const { triggerFocus } = this.config;
              switch (d2.type) {
                case MouseInteractions.Blur:
                  if ("blur" in target) {
                    target.blur();
                  }
                  break;
                case MouseInteractions.Focus:
                  if (triggerFocus && target.focus) {
                    target.focus({
                      preventScroll: true
                    });
                  }
                  break;
                case MouseInteractions.Click:
                case MouseInteractions.TouchStart:
                case MouseInteractions.TouchEnd:
                case MouseInteractions.MouseDown:
                case MouseInteractions.MouseUp:
                  if (isSync) {
                    if (d2.type === MouseInteractions.TouchStart) {
                      this.touchActive = true;
                    } else if (d2.type === MouseInteractions.TouchEnd) {
                      this.touchActive = false;
                    }
                    if (d2.type === MouseInteractions.MouseDown) {
                      this.lastMouseDownEvent = [target, event];
                    } else if (d2.type === MouseInteractions.MouseUp) {
                      this.lastMouseDownEvent = null;
                    }
                    this.mousePos = {
                      x: d2.x,
                      y: d2.y,
                      id: d2.id,
                      debugData: d2
                    };
                  } else {
                    if (d2.type === MouseInteractions.TouchStart) {
                      this.tailPositions.length = 0;
                    }
                    this.moveAndHover(d2.x, d2.y, d2.id, isSync, d2);
                    if (d2.type === MouseInteractions.Click) {
                      this.mouse.classList.remove("active");
                      void this.mouse.offsetWidth;
                      this.mouse.classList.add("active");
                    } else if (d2.type === MouseInteractions.TouchStart) {
                      void this.mouse.offsetWidth;
                      this.mouse.classList.add("touch-active");
                    } else if (d2.type === MouseInteractions.TouchEnd) {
                      this.mouse.classList.remove("touch-active");
                    } else {
                      target.dispatchEvent(event);
                    }
                  }
                  break;
                case MouseInteractions.TouchCancel:
                  if (isSync) {
                    this.touchActive = false;
                  } else {
                    this.mouse.classList.remove("touch-active");
                  }
                  break;
                default:
                  target.dispatchEvent(event);
              }
              break;
            }
            case IncrementalSource.Scroll: {
              if (d2.id === -1) {
                break;
              }
              if (this.usingVirtualDom) {
                const target = this.virtualDom.mirror.getNode(d2.id);
                if (!target) {
                  return this.debugNodeNotFound(d2, d2.id);
                }
                target.scrollData = d2;
                break;
              }
              this.applyScroll(d2, isSync);
              break;
            }
            case IncrementalSource.ViewportResize:
              this.emitter.emit(ReplayerEvents.Resize, {
                width: d2.width,
                height: d2.height
              });
              break;
            case IncrementalSource.Input: {
              if (d2.id === -1) {
                break;
              }
              if (this.usingVirtualDom) {
                const target = this.virtualDom.mirror.getNode(d2.id);
                if (!target) {
                  return this.debugNodeNotFound(d2, d2.id);
                }
                target.inputData = d2;
                break;
              }
              this.applyInput(d2);
              break;
            }
            case IncrementalSource.MediaInteraction: {
              const target = this.usingVirtualDom ? this.virtualDom.mirror.getNode(d2.id) : this.mirror.getNode(d2.id);
              if (!target) {
                return this.debugNodeNotFound(d2, d2.id);
              }
              const mediaEl = target;
              try {
                if (d2.currentTime !== void 0) {
                  mediaEl.currentTime = d2.currentTime;
                }
                if (d2.volume !== void 0) {
                  mediaEl.volume = d2.volume;
                }
                if (d2.muted !== void 0) {
                  mediaEl.muted = d2.muted;
                }
                if (d2.type === 1) {
                  mediaEl.pause();
                }
                if (d2.type === 0) {
                  void mediaEl.play();
                }
                if (d2.type === 4) {
                  mediaEl.playbackRate = d2.playbackRate;
                }
              } catch (error) {
                this.warn(`Failed to replay media interactions: ${error.message || error}`);
              }
              break;
            }
            case IncrementalSource.StyleSheetRule:
            case IncrementalSource.StyleDeclaration: {
              if (this.usingVirtualDom) {
                if (d2.styleId)
                  this.constructedStyleMutations.push(d2);
                else if (d2.id)
                  (_b2 = this.virtualDom.mirror.getNode(d2.id)) === null || _b2 === void 0 ? void 0 : _b2.rules.push(d2);
              } else
                this.applyStyleSheetMutation(d2);
              break;
            }
            case IncrementalSource.CanvasMutation: {
              if (!this.config.UNSAFE_replayCanvas) {
                return;
              }
              if (this.usingVirtualDom) {
                const target = this.virtualDom.mirror.getNode(d2.id);
                if (!target) {
                  return this.debugNodeNotFound(d2, d2.id);
                }
                target.canvasMutations.push({
                  event: e3,
                  mutation: d2
                });
              } else {
                const target = this.mirror.getNode(d2.id);
                if (!target) {
                  return this.debugNodeNotFound(d2, d2.id);
                }
                void canvasMutation({
                  event: e3,
                  mutation: d2,
                  target,
                  imageMap: this.imageMap,
                  canvasEventMap: this.canvasEventMap,
                  errorHandler: this.warnCanvasMutationFailed.bind(this)
                });
              }
              break;
            }
            case IncrementalSource.Font: {
              try {
                const fontFace = new FontFace(d2.family, d2.buffer ? new Uint8Array(JSON.parse(d2.fontSource)) : d2.fontSource, d2.descriptors);
                (_c = this.iframe.contentDocument) === null || _c === void 0 ? void 0 : _c.fonts.add(fontFace);
              } catch (error) {
                this.warn(error);
              }
              break;
            }
            case IncrementalSource.Selection: {
              if (isSync) {
                this.lastSelectionData = d2;
                break;
              }
              this.applySelection(d2);
              break;
            }
            case IncrementalSource.AdoptedStyleSheet: {
              if (this.usingVirtualDom)
                this.adoptedStyleSheets.push(d2);
              else
                this.applyAdoptedStyleSheet(d2);
              break;
            }
          }
        }
        applyMutation(d2, isSync) {
          if (this.config.useVirtualDom && !this.usingVirtualDom && isSync) {
            this.usingVirtualDom = true;
            buildFromDom(this.iframe.contentDocument, this.mirror, this.virtualDom);
            if (Object.keys(this.legacy_missingNodeRetryMap).length) {
              for (const key in this.legacy_missingNodeRetryMap) {
                try {
                  const value = this.legacy_missingNodeRetryMap[key];
                  const virtualNode = buildFromNode(value.node, this.virtualDom, this.mirror);
                  if (virtualNode)
                    value.node = virtualNode;
                } catch (error) {
                  this.warn(error);
                }
              }
            }
          }
          const mirror2 = this.usingVirtualDom ? this.virtualDom.mirror : this.mirror;
          d2.removes = d2.removes.filter((mutation) => {
            if (!mirror2.getNode(mutation.id)) {
              this.warnNodeNotFound(d2, mutation.id);
              return false;
            }
            return true;
          });
          d2.removes.forEach((mutation) => {
            var _a2;
            const target = mirror2.getNode(mutation.id);
            if (!target) {
              return;
            }
            let parent = mirror2.getNode(mutation.parentId);
            if (!parent) {
              return this.warnNodeNotFound(d2, mutation.parentId);
            }
            if (mutation.isShadow && hasShadowRoot(parent)) {
              parent = parent.shadowRoot;
            }
            mirror2.removeNodeFromMap(target);
            if (parent)
              try {
                parent.removeChild(target);
                if (this.usingVirtualDom && target.nodeName === "#text" && parent.nodeName === "STYLE" && ((_a2 = parent.rules) === null || _a2 === void 0 ? void 0 : _a2.length) > 0)
                  parent.rules = [];
              } catch (error) {
                if (error instanceof DOMException) {
                  this.warn("parent could not remove child in mutation", parent, target, d2);
                } else {
                  throw error;
                }
              }
          });
          const legacy_missingNodeMap = Object.assign({}, this.legacy_missingNodeRetryMap);
          const queue = [];
          const nextNotInDOM = (mutation) => {
            let next = null;
            if (mutation.nextId) {
              next = mirror2.getNode(mutation.nextId);
            }
            if (mutation.nextId !== null && mutation.nextId !== void 0 && mutation.nextId !== -1 && !next) {
              return true;
            }
            return false;
          };
          const appendNode = (mutation) => {
            var _a2, _b2;
            if (!this.iframe.contentDocument) {
              return this.warn("Looks like your replayer has been destroyed.");
            }
            let parent = mirror2.getNode(mutation.parentId);
            if (!parent) {
              if (mutation.node.type === NodeType$2.Document) {
                return this.newDocumentQueue.push(mutation);
              }
              return queue.push(mutation);
            }
            if (mutation.node.isShadow) {
              if (!hasShadowRoot(parent)) {
                parent.attachShadow({ mode: "open" });
                parent = parent.shadowRoot;
              } else
                parent = parent.shadowRoot;
            }
            let previous = null;
            let next = null;
            if (mutation.previousId) {
              previous = mirror2.getNode(mutation.previousId);
            }
            if (mutation.nextId) {
              next = mirror2.getNode(mutation.nextId);
            }
            if (nextNotInDOM(mutation)) {
              return queue.push(mutation);
            }
            if (mutation.node.rootId && !mirror2.getNode(mutation.node.rootId)) {
              return;
            }
            const targetDoc = mutation.node.rootId ? mirror2.getNode(mutation.node.rootId) : this.usingVirtualDom ? this.virtualDom : this.iframe.contentDocument;
            if (isSerializedIframe(parent, mirror2)) {
              this.attachDocumentToIframe(mutation, parent);
              return;
            }
            const afterAppend = (node, id) => {
              if (this.usingVirtualDom)
                return;
              for (const plugin of this.config.plugins || []) {
                if (plugin.onBuild)
                  plugin.onBuild(node, { id, replayer: this });
              }
            };
            const target = buildNodeWithSN(mutation.node, {
              doc: targetDoc,
              mirror: mirror2,
              skipChild: true,
              hackCss: true,
              cache: this.cache,
              afterAppend
            });
            if (mutation.previousId === -1 || mutation.nextId === -1) {
              legacy_missingNodeMap[mutation.node.id] = {
                node: target,
                mutation
              };
              return;
            }
            const parentSn = mirror2.getMeta(parent);
            if (parentSn && parentSn.type === NodeType$2.Element && parentSn.tagName === "textarea" && mutation.node.type === NodeType$2.Text) {
              const childNodeArray = Array.isArray(parent.childNodes) ? parent.childNodes : Array.from(parent.childNodes);
              for (const c3 of childNodeArray) {
                if (c3.nodeType === parent.TEXT_NODE) {
                  parent.removeChild(c3);
                }
              }
            } else if ((parentSn === null || parentSn === void 0 ? void 0 : parentSn.type) === NodeType$2.Document) {
              const parentDoc = parent;
              if (mutation.node.type === NodeType$2.DocumentType && ((_a2 = parentDoc.childNodes[0]) === null || _a2 === void 0 ? void 0 : _a2.nodeType) === Node.DOCUMENT_TYPE_NODE)
                parentDoc.removeChild(parentDoc.childNodes[0]);
              if (target.nodeName === "HTML" && parentDoc.documentElement)
                parentDoc.removeChild(parentDoc.documentElement);
            }
            if (previous && previous.nextSibling && previous.nextSibling.parentNode) {
              parent.insertBefore(target, previous.nextSibling);
            } else if (next && next.parentNode) {
              parent.contains(next) ? parent.insertBefore(target, next) : parent.insertBefore(target, null);
            } else {
              parent.appendChild(target);
            }
            afterAppend(target, mutation.node.id);
            if (this.usingVirtualDom && target.nodeName === "#text" && parent.nodeName === "STYLE" && ((_b2 = parent.rules) === null || _b2 === void 0 ? void 0 : _b2.length) > 0)
              parent.rules = [];
            if (isSerializedIframe(target, this.mirror)) {
              const targetId = this.mirror.getId(target);
              const mutationInQueue = this.newDocumentQueue.find((m2) => m2.parentId === targetId);
              if (mutationInQueue) {
                this.attachDocumentToIframe(mutationInQueue, target);
                this.newDocumentQueue = this.newDocumentQueue.filter((m2) => m2 !== mutationInQueue);
              }
            }
            if (mutation.previousId || mutation.nextId) {
              this.legacy_resolveMissingNode(legacy_missingNodeMap, parent, target, mutation);
            }
          };
          d2.adds.forEach((mutation) => {
            appendNode(mutation);
          });
          const startTime = Date.now();
          while (queue.length) {
            const resolveTrees = queueToResolveTrees(queue);
            queue.length = 0;
            if (Date.now() - startTime > 500) {
              this.warn("Timeout in the loop, please check the resolve tree data:", resolveTrees);
              break;
            }
            for (const tree of resolveTrees) {
              const parent = mirror2.getNode(tree.value.parentId);
              if (!parent) {
                this.debug("Drop resolve tree since there is no parent for the root node.", tree);
              } else {
                iterateResolveTree(tree, (mutation) => {
                  appendNode(mutation);
                });
              }
            }
          }
          if (Object.keys(legacy_missingNodeMap).length) {
            Object.assign(this.legacy_missingNodeRetryMap, legacy_missingNodeMap);
          }
          uniqueTextMutations(d2.texts).forEach((mutation) => {
            var _a2;
            const target = mirror2.getNode(mutation.id);
            if (!target) {
              if (d2.removes.find((r3) => r3.id === mutation.id)) {
                return;
              }
              return this.warnNodeNotFound(d2, mutation.id);
            }
            target.textContent = mutation.value;
            if (this.usingVirtualDom) {
              const parent = target.parentNode;
              if (((_a2 = parent === null || parent === void 0 ? void 0 : parent.rules) === null || _a2 === void 0 ? void 0 : _a2.length) > 0)
                parent.rules = [];
            }
          });
          d2.attributes.forEach((mutation) => {
            const target = mirror2.getNode(mutation.id);
            if (!target) {
              if (d2.removes.find((r3) => r3.id === mutation.id)) {
                return;
              }
              return this.warnNodeNotFound(d2, mutation.id);
            }
            for (const attributeName in mutation.attributes) {
              if (typeof attributeName === "string") {
                const value = mutation.attributes[attributeName];
                if (value === null) {
                  target.removeAttribute(attributeName);
                } else if (typeof value === "string") {
                  try {
                    if (attributeName === "_cssText" && (target.nodeName === "LINK" || target.nodeName === "STYLE")) {
                      try {
                        const newSn = mirror2.getMeta(target);
                        Object.assign(newSn.attributes, mutation.attributes);
                        const newNode = buildNodeWithSN(newSn, {
                          doc: target.ownerDocument,
                          mirror: mirror2,
                          skipChild: true,
                          hackCss: true,
                          cache: this.cache
                        });
                        const siblingNode = target.nextSibling;
                        const parentNode = target.parentNode;
                        if (newNode && parentNode) {
                          parentNode.removeChild(target);
                          parentNode.insertBefore(newNode, siblingNode);
                          mirror2.replace(mutation.id, newNode);
                          break;
                        }
                      } catch (e3) {
                      }
                    }
                    target.setAttribute(attributeName, value);
                  } catch (error) {
                    this.warn("An error occurred may due to the checkout feature.", error);
                  }
                } else if (attributeName === "style") {
                  const styleValues = value;
                  const targetEl = target;
                  for (const s3 in styleValues) {
                    if (styleValues[s3] === false) {
                      targetEl.style.removeProperty(s3);
                    } else if (styleValues[s3] instanceof Array) {
                      const svp = styleValues[s3];
                      targetEl.style.setProperty(s3, svp[0], svp[1]);
                    } else {
                      const svs = styleValues[s3];
                      targetEl.style.setProperty(s3, svs);
                    }
                  }
                }
              }
            }
          });
        }
        applyScroll(d2, isSync) {
          var _a2, _b2;
          const target = this.mirror.getNode(d2.id);
          if (!target) {
            return this.debugNodeNotFound(d2, d2.id);
          }
          const sn = this.mirror.getMeta(target);
          if (target === this.iframe.contentDocument) {
            (_a2 = this.iframe.contentWindow) === null || _a2 === void 0 ? void 0 : _a2.scrollTo({
              top: d2.y,
              left: d2.x,
              behavior: isSync ? "auto" : "smooth"
            });
          } else if ((sn === null || sn === void 0 ? void 0 : sn.type) === NodeType$2.Document) {
            (_b2 = target.defaultView) === null || _b2 === void 0 ? void 0 : _b2.scrollTo({
              top: d2.y,
              left: d2.x,
              behavior: isSync ? "auto" : "smooth"
            });
          } else {
            try {
              target.scrollTo({
                top: d2.y,
                left: d2.x,
                behavior: isSync ? "auto" : "smooth"
              });
            } catch (error) {
            }
          }
        }
        applyInput(d2) {
          const target = this.mirror.getNode(d2.id);
          if (!target) {
            return this.debugNodeNotFound(d2, d2.id);
          }
          try {
            target.checked = d2.isChecked;
            target.value = d2.text;
          } catch (error) {
          }
        }
        applySelection(d2) {
          try {
            const selectionSet = /* @__PURE__ */ new Set();
            const ranges = d2.ranges.map(({ start, startOffset, end, endOffset }) => {
              const startContainer = this.mirror.getNode(start);
              const endContainer = this.mirror.getNode(end);
              if (!startContainer || !endContainer)
                return;
              const result = new Range();
              result.setStart(startContainer, startOffset);
              result.setEnd(endContainer, endOffset);
              const doc = startContainer.ownerDocument;
              const selection = doc === null || doc === void 0 ? void 0 : doc.getSelection();
              selection && selectionSet.add(selection);
              return {
                range: result,
                selection
              };
            });
            selectionSet.forEach((s3) => s3.removeAllRanges());
            ranges.forEach((r3) => {
              var _a2;
              return r3 && ((_a2 = r3.selection) === null || _a2 === void 0 ? void 0 : _a2.addRange(r3.range));
            });
          } catch (error) {
          }
        }
        applyStyleSheetMutation(data) {
          var _a2;
          let styleSheet = null;
          if (data.styleId)
            styleSheet = this.styleMirror.getStyle(data.styleId);
          else if (data.id)
            styleSheet = ((_a2 = this.mirror.getNode(data.id)) === null || _a2 === void 0 ? void 0 : _a2.sheet) || null;
          if (!styleSheet)
            return;
          if (data.source === IncrementalSource.StyleSheetRule)
            this.applyStyleSheetRule(data, styleSheet);
          else if (data.source === IncrementalSource.StyleDeclaration)
            this.applyStyleDeclaration(data, styleSheet);
        }
        applyStyleSheetRule(data, styleSheet) {
          var _a2, _b2, _c, _d;
          (_a2 = data.adds) === null || _a2 === void 0 ? void 0 : _a2.forEach(({ rule, index: nestedIndex }) => {
            try {
              if (Array.isArray(nestedIndex)) {
                const { positions, index } = getPositionsAndIndex(nestedIndex);
                const nestedRule = getNestedRule(styleSheet.cssRules, positions);
                nestedRule.insertRule(rule, index);
              } else {
                const index = nestedIndex === void 0 ? void 0 : Math.min(nestedIndex, styleSheet.cssRules.length);
                styleSheet === null || styleSheet === void 0 ? void 0 : styleSheet.insertRule(rule, index);
              }
            } catch (e3) {
            }
          });
          (_b2 = data.removes) === null || _b2 === void 0 ? void 0 : _b2.forEach(({ index: nestedIndex }) => {
            try {
              if (Array.isArray(nestedIndex)) {
                const { positions, index } = getPositionsAndIndex(nestedIndex);
                const nestedRule = getNestedRule(styleSheet.cssRules, positions);
                nestedRule.deleteRule(index || 0);
              } else {
                styleSheet === null || styleSheet === void 0 ? void 0 : styleSheet.deleteRule(nestedIndex);
              }
            } catch (e3) {
            }
          });
          if (data.replace)
            try {
              void ((_c = styleSheet.replace) === null || _c === void 0 ? void 0 : _c.call(styleSheet, data.replace));
            } catch (e3) {
            }
          if (data.replaceSync)
            try {
              (_d = styleSheet.replaceSync) === null || _d === void 0 ? void 0 : _d.call(styleSheet, data.replaceSync);
            } catch (e3) {
            }
        }
        applyStyleDeclaration(data, styleSheet) {
          if (data.set) {
            const rule = getNestedRule(styleSheet.rules, data.index);
            rule.style.setProperty(data.set.property, data.set.value, data.set.priority);
          }
          if (data.remove) {
            const rule = getNestedRule(styleSheet.rules, data.index);
            rule.style.removeProperty(data.remove.property);
          }
        }
        applyAdoptedStyleSheet(data) {
          var _a2;
          const targetHost = this.mirror.getNode(data.id);
          if (!targetHost)
            return;
          (_a2 = data.styles) === null || _a2 === void 0 ? void 0 : _a2.forEach((style) => {
            var _a3;
            let newStyleSheet = null;
            let hostWindow = null;
            if (hasShadowRoot(targetHost))
              hostWindow = ((_a3 = targetHost.ownerDocument) === null || _a3 === void 0 ? void 0 : _a3.defaultView) || null;
            else if (targetHost.nodeName === "#document")
              hostWindow = targetHost.defaultView;
            if (!hostWindow)
              return;
            try {
              newStyleSheet = new hostWindow.CSSStyleSheet();
              this.styleMirror.add(newStyleSheet, style.styleId);
              this.applyStyleSheetRule({
                source: IncrementalSource.StyleSheetRule,
                adds: style.rules
              }, newStyleSheet);
            } catch (e3) {
            }
          });
          const MAX_RETRY_TIME = 10;
          let count = 0;
          const adoptStyleSheets = (targetHost2, styleIds) => {
            const stylesToAdopt = styleIds.map((styleId) => this.styleMirror.getStyle(styleId)).filter((style) => style !== null);
            if (hasShadowRoot(targetHost2))
              targetHost2.shadowRoot.adoptedStyleSheets = stylesToAdopt;
            else if (targetHost2.nodeName === "#document")
              targetHost2.adoptedStyleSheets = stylesToAdopt;
            if (stylesToAdopt.length !== styleIds.length && count < MAX_RETRY_TIME) {
              setTimeout(() => adoptStyleSheets(targetHost2, styleIds), 0 + 100 * count);
              count++;
            }
          };
          adoptStyleSheets(targetHost, data.styleIds);
        }
        legacy_resolveMissingNode(map, parent, target, targetMutation) {
          const { previousId, nextId } = targetMutation;
          const previousInMap = previousId && map[previousId];
          const nextInMap = nextId && map[nextId];
          if (previousInMap) {
            const { node, mutation } = previousInMap;
            parent.insertBefore(node, target);
            delete map[mutation.node.id];
            delete this.legacy_missingNodeRetryMap[mutation.node.id];
            if (mutation.previousId || mutation.nextId) {
              this.legacy_resolveMissingNode(map, parent, node, mutation);
            }
          }
          if (nextInMap) {
            const { node, mutation } = nextInMap;
            parent.insertBefore(node, target.nextSibling);
            delete map[mutation.node.id];
            delete this.legacy_missingNodeRetryMap[mutation.node.id];
            if (mutation.previousId || mutation.nextId) {
              this.legacy_resolveMissingNode(map, parent, node, mutation);
            }
          }
        }
        moveAndHover(x3, y2, id, isSync, debugData) {
          const target = this.mirror.getNode(id);
          if (!target) {
            return this.debugNodeNotFound(debugData, id);
          }
          const base = getBaseDimension(target, this.iframe);
          const _x = x3 * base.absoluteScale + base.x;
          const _y = y2 * base.absoluteScale + base.y;
          this.mouse.style.left = `${_x}px`;
          this.mouse.style.top = `${_y}px`;
          if (!isSync) {
            this.drawMouseTail({ x: _x, y: _y });
          }
          this.hoverElements(target);
        }
        drawMouseTail(position) {
          if (!this.mouseTail) {
            return;
          }
          const { lineCap, lineWidth, strokeStyle, duration } = this.config.mouseTail === true ? defaultMouseTailConfig : Object.assign({}, defaultMouseTailConfig, this.config.mouseTail);
          const draw = () => {
            if (!this.mouseTail) {
              return;
            }
            const ctx = this.mouseTail.getContext("2d");
            if (!ctx || !this.tailPositions.length) {
              return;
            }
            ctx.clearRect(0, 0, this.mouseTail.width, this.mouseTail.height);
            ctx.beginPath();
            ctx.lineWidth = lineWidth;
            ctx.lineCap = lineCap;
            ctx.strokeStyle = strokeStyle;
            ctx.moveTo(this.tailPositions[0].x, this.tailPositions[0].y);
            this.tailPositions.forEach((p2) => ctx.lineTo(p2.x, p2.y));
            ctx.stroke();
          };
          this.tailPositions.push(position);
          draw();
          setTimeout(() => {
            this.tailPositions = this.tailPositions.filter((p2) => p2 !== position);
            draw();
          }, duration / this.speedService.state.context.timer.speed);
        }
        hoverElements(el) {
          var _a2;
          (_a2 = this.lastHoveredRootNode || this.iframe.contentDocument) === null || _a2 === void 0 ? void 0 : _a2.querySelectorAll(".\\:hover").forEach((hoveredEl) => {
            hoveredEl.classList.remove(":hover");
          });
          this.lastHoveredRootNode = el.getRootNode();
          let currentEl = el;
          while (currentEl) {
            if (currentEl.classList) {
              currentEl.classList.add(":hover");
            }
            currentEl = currentEl.parentElement;
          }
        }
        isUserInteraction(event) {
          if (event.type !== EventType.IncrementalSnapshot) {
            return false;
          }
          return event.data.source > IncrementalSource.Mutation && event.data.source <= IncrementalSource.Input;
        }
        backToNormal() {
          this.nextUserInteractionEvent = null;
          if (this.speedService.state.matches("normal")) {
            return;
          }
          this.speedService.send({ type: "BACK_TO_NORMAL" });
          this.emitter.emit(ReplayerEvents.SkipEnd, {
            speed: this.speedService.state.context.normalSpeed
          });
        }
        warnNodeNotFound(d2, id) {
          this.warn(`Node with id '${id}' not found. `, d2);
        }
        warnCanvasMutationFailed(d2, error) {
          this.warn(`Has error on canvas update`, error, "canvas mutation:", d2);
        }
        debugNodeNotFound(d2, id) {
          this.debug(`Node with id '${id}' not found. `, d2);
        }
        warn(...args) {
          if (!this.config.showWarning) {
            return;
          }
          this.config.logger.warn(REPLAY_CONSOLE_PREFIX, ...args);
        }
        debug(...args) {
          if (!this.config.showDebug) {
            return;
          }
          this.config.logger.log(REPLAY_CONSOLE_PREFIX, ...args);
        }
      };
      var { addCustomEvent } = record;
      var { freezePage } = record;
      var u8 = Uint8Array;
      var u16 = Uint16Array;
      var u32 = Uint32Array;
      var fleb = new u8([
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        1,
        1,
        1,
        2,
        2,
        2,
        2,
        3,
        3,
        3,
        3,
        4,
        4,
        4,
        4,
        5,
        5,
        5,
        5,
        0,
        /* unused */
        0,
        0,
        /* impossible */
        0
      ]);
      var fdeb = new u8([
        0,
        0,
        0,
        0,
        1,
        1,
        2,
        2,
        3,
        3,
        4,
        4,
        5,
        5,
        6,
        6,
        7,
        7,
        8,
        8,
        9,
        9,
        10,
        10,
        11,
        11,
        12,
        12,
        13,
        13,
        /* unused */
        0,
        0
      ]);
      var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
      var freb = function(eb, start) {
        var b2 = new u16(31);
        for (var i3 = 0; i3 < 31; ++i3) {
          b2[i3] = start += 1 << eb[i3 - 1];
        }
        var r3 = new u32(b2[30]);
        for (var i3 = 1; i3 < 30; ++i3) {
          for (var j = b2[i3]; j < b2[i3 + 1]; ++j) {
            r3[j] = j - b2[i3] << 5 | i3;
          }
        }
        return [b2, r3];
      };
      var _a = freb(fleb, 2);
      var fl = _a[0];
      var revfl = _a[1];
      fl[28] = 258, revfl[258] = 28;
      var _b = freb(fdeb, 0);
      var fd = _b[0];
      var revfd = _b[1];
      var rev = new u16(32768);
      for (i2 = 0; i2 < 32768; ++i2) {
        x2 = (i2 & 43690) >>> 1 | (i2 & 21845) << 1;
        x2 = (x2 & 52428) >>> 2 | (x2 & 13107) << 2;
        x2 = (x2 & 61680) >>> 4 | (x2 & 3855) << 4;
        rev[i2] = ((x2 & 65280) >>> 8 | (x2 & 255) << 8) >>> 1;
      }
      var x2;
      var i2;
      var hMap = function(cd, mb, r3) {
        var s3 = cd.length;
        var i3 = 0;
        var l3 = new u16(mb);
        for (; i3 < s3; ++i3)
          ++l3[cd[i3] - 1];
        var le = new u16(mb);
        for (i3 = 0; i3 < mb; ++i3) {
          le[i3] = le[i3 - 1] + l3[i3 - 1] << 1;
        }
        var co;
        if (r3) {
          co = new u16(1 << mb);
          var rvb = 15 - mb;
          for (i3 = 0; i3 < s3; ++i3) {
            if (cd[i3]) {
              var sv = i3 << 4 | cd[i3];
              var r_1 = mb - cd[i3];
              var v3 = le[cd[i3] - 1]++ << r_1;
              for (var m2 = v3 | (1 << r_1) - 1; v3 <= m2; ++v3) {
                co[rev[v3] >>> rvb] = sv;
              }
            }
          }
        } else {
          co = new u16(s3);
          for (i3 = 0; i3 < s3; ++i3)
            co[i3] = rev[le[cd[i3] - 1]++] >>> 15 - cd[i3];
        }
        return co;
      };
      var flt = new u8(288);
      for (i2 = 0; i2 < 144; ++i2)
        flt[i2] = 8;
      var i2;
      for (i2 = 144; i2 < 256; ++i2)
        flt[i2] = 9;
      var i2;
      for (i2 = 256; i2 < 280; ++i2)
        flt[i2] = 7;
      var i2;
      for (i2 = 280; i2 < 288; ++i2)
        flt[i2] = 8;
      var i2;
      var fdt = new u8(32);
      for (i2 = 0; i2 < 32; ++i2)
        fdt[i2] = 5;
      var i2;
      var flm = /* @__PURE__ */ hMap(flt, 9, 0);
      var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
      var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
      var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
      var max = function(a3) {
        var m2 = a3[0];
        for (var i3 = 1; i3 < a3.length; ++i3) {
          if (a3[i3] > m2)
            m2 = a3[i3];
        }
        return m2;
      };
      var bits = function(d2, p2, m2) {
        var o3 = p2 / 8 >> 0;
        return (d2[o3] | d2[o3 + 1] << 8) >>> (p2 & 7) & m2;
      };
      var bits16 = function(d2, p2) {
        var o3 = p2 / 8 >> 0;
        return (d2[o3] | d2[o3 + 1] << 8 | d2[o3 + 2] << 16) >>> (p2 & 7);
      };
      var shft = function(p2) {
        return (p2 / 8 >> 0) + (p2 & 7 && 1);
      };
      var slc = function(v3, s3, e3) {
        if (s3 == null || s3 < 0)
          s3 = 0;
        if (e3 == null || e3 > v3.length)
          e3 = v3.length;
        var n3 = new (v3 instanceof u16 ? u16 : v3 instanceof u32 ? u32 : u8)(e3 - s3);
        n3.set(v3.subarray(s3, e3));
        return n3;
      };
      var inflt = function(dat, buf, st) {
        var sl = dat.length;
        var noBuf = !buf || st;
        var noSt = !st || st.i;
        if (!st)
          st = {};
        if (!buf)
          buf = new u8(sl * 3);
        var cbuf = function(l4) {
          var bl = buf.length;
          if (l4 > bl) {
            var nbuf = new u8(Math.max(bl * 2, l4));
            nbuf.set(buf);
            buf = nbuf;
          }
        };
        var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
        var tbts = sl * 8;
        do {
          if (!lm) {
            st.f = final = bits(dat, pos, 1);
            var type = bits(dat, pos + 1, 3);
            pos += 3;
            if (!type) {
              var s3 = shft(pos) + 4, l3 = dat[s3 - 4] | dat[s3 - 3] << 8, t3 = s3 + l3;
              if (t3 > sl) {
                if (noSt)
                  throw "unexpected EOF";
                break;
              }
              if (noBuf)
                cbuf(bt + l3);
              buf.set(dat.subarray(s3, t3), bt);
              st.b = bt += l3, st.p = pos = t3 * 8;
              continue;
            } else if (type == 1)
              lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
            else if (type == 2) {
              var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
              var tl = hLit + bits(dat, pos + 5, 31) + 1;
              pos += 14;
              var ldt = new u8(tl);
              var clt = new u8(19);
              for (var i3 = 0; i3 < hcLen; ++i3) {
                clt[clim[i3]] = bits(dat, pos + i3 * 3, 7);
              }
              pos += hcLen * 3;
              var clb = max(clt), clbmsk = (1 << clb) - 1;
              if (!noSt && pos + tl * (clb + 7) > tbts)
                break;
              var clm = hMap(clt, clb, 1);
              for (var i3 = 0; i3 < tl; ) {
                var r3 = clm[bits(dat, pos, clbmsk)];
                pos += r3 & 15;
                var s3 = r3 >>> 4;
                if (s3 < 16) {
                  ldt[i3++] = s3;
                } else {
                  var c3 = 0, n3 = 0;
                  if (s3 == 16)
                    n3 = 3 + bits(dat, pos, 3), pos += 2, c3 = ldt[i3 - 1];
                  else if (s3 == 17)
                    n3 = 3 + bits(dat, pos, 7), pos += 3;
                  else if (s3 == 18)
                    n3 = 11 + bits(dat, pos, 127), pos += 7;
                  while (n3--)
                    ldt[i3++] = c3;
                }
              }
              var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
              lbt = max(lt);
              dbt = max(dt);
              lm = hMap(lt, lbt, 1);
              dm = hMap(dt, dbt, 1);
            } else
              throw "invalid block type";
            if (pos > tbts)
              throw "unexpected EOF";
          }
          if (noBuf)
            cbuf(bt + 131072);
          var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
          var mxa = lbt + dbt + 18;
          while (noSt || pos + mxa < tbts) {
            var c3 = lm[bits16(dat, pos) & lms], sym = c3 >>> 4;
            pos += c3 & 15;
            if (pos > tbts)
              throw "unexpected EOF";
            if (!c3)
              throw "invalid length/literal";
            if (sym < 256)
              buf[bt++] = sym;
            else if (sym == 256) {
              lm = null;
              break;
            } else {
              var add = sym - 254;
              if (sym > 264) {
                var i3 = sym - 257, b2 = fleb[i3];
                add = bits(dat, pos, (1 << b2) - 1) + fl[i3];
                pos += b2;
              }
              var d2 = dm[bits16(dat, pos) & dms], dsym = d2 >>> 4;
              if (!d2)
                throw "invalid distance";
              pos += d2 & 15;
              var dt = fd[dsym];
              if (dsym > 3) {
                var b2 = fdeb[dsym];
                dt += bits16(dat, pos) & (1 << b2) - 1, pos += b2;
              }
              if (pos > tbts)
                throw "unexpected EOF";
              if (noBuf)
                cbuf(bt + 131072);
              var end = bt + add;
              for (; bt < end; bt += 4) {
                buf[bt] = buf[bt - dt];
                buf[bt + 1] = buf[bt + 1 - dt];
                buf[bt + 2] = buf[bt + 2 - dt];
                buf[bt + 3] = buf[bt + 3 - dt];
              }
              bt = end;
            }
          }
          st.l = lm, st.p = pos, st.b = bt;
          if (lm)
            final = 1, st.m = lbt, st.d = dm, st.n = dbt;
        } while (!final);
        return bt == buf.length ? buf : slc(buf, 0, bt);
      };
      var wbits = function(d2, p2, v3) {
        v3 <<= p2 & 7;
        var o3 = p2 / 8 >> 0;
        d2[o3] |= v3;
        d2[o3 + 1] |= v3 >>> 8;
      };
      var wbits16 = function(d2, p2, v3) {
        v3 <<= p2 & 7;
        var o3 = p2 / 8 >> 0;
        d2[o3] |= v3;
        d2[o3 + 1] |= v3 >>> 8;
        d2[o3 + 2] |= v3 >>> 16;
      };
      var hTree = function(d2, mb) {
        var t3 = [];
        for (var i3 = 0; i3 < d2.length; ++i3) {
          if (d2[i3])
            t3.push({ s: i3, f: d2[i3] });
        }
        var s3 = t3.length;
        var t22 = t3.slice();
        if (!s3)
          return [new u8(0), 0];
        if (s3 == 1) {
          var v3 = new u8(t3[0].s + 1);
          v3[t3[0].s] = 1;
          return [v3, 1];
        }
        t3.sort(function(a3, b2) {
          return a3.f - b2.f;
        });
        t3.push({ s: -1, f: 25001 });
        var l3 = t3[0], r3 = t3[1], i0 = 0, i1 = 1, i22 = 2;
        t3[0] = { s: -1, f: l3.f + r3.f, l: l3, r: r3 };
        while (i1 != s3 - 1) {
          l3 = t3[t3[i0].f < t3[i22].f ? i0++ : i22++];
          r3 = t3[i0 != i1 && t3[i0].f < t3[i22].f ? i0++ : i22++];
          t3[i1++] = { s: -1, f: l3.f + r3.f, l: l3, r: r3 };
        }
        var maxSym = t22[0].s;
        for (var i3 = 1; i3 < s3; ++i3) {
          if (t22[i3].s > maxSym)
            maxSym = t22[i3].s;
        }
        var tr = new u16(maxSym + 1);
        var mbt = ln(t3[i1 - 1], tr, 0);
        if (mbt > mb) {
          var i3 = 0, dt = 0;
          var lft = mbt - mb, cst = 1 << lft;
          t22.sort(function(a3, b2) {
            return tr[b2.s] - tr[a3.s] || a3.f - b2.f;
          });
          for (; i3 < s3; ++i3) {
            var i2_1 = t22[i3].s;
            if (tr[i2_1] > mb) {
              dt += cst - (1 << mbt - tr[i2_1]);
              tr[i2_1] = mb;
            } else
              break;
          }
          dt >>>= lft;
          while (dt > 0) {
            var i2_2 = t22[i3].s;
            if (tr[i2_2] < mb)
              dt -= 1 << mb - tr[i2_2]++ - 1;
            else
              ++i3;
          }
          for (; i3 >= 0 && dt; --i3) {
            var i2_3 = t22[i3].s;
            if (tr[i2_3] == mb) {
              --tr[i2_3];
              ++dt;
            }
          }
          mbt = mb;
        }
        return [new u8(tr), mbt];
      };
      var ln = function(n3, l3, d2) {
        return n3.s == -1 ? Math.max(ln(n3.l, l3, d2 + 1), ln(n3.r, l3, d2 + 1)) : l3[n3.s] = d2;
      };
      var lc = function(c3) {
        var s3 = c3.length;
        while (s3 && !c3[--s3])
          ;
        var cl = new u16(++s3);
        var cli = 0, cln = c3[0], cls = 1;
        var w2 = function(v3) {
          cl[cli++] = v3;
        };
        for (var i3 = 1; i3 <= s3; ++i3) {
          if (c3[i3] == cln && i3 != s3)
            ++cls;
          else {
            if (!cln && cls > 2) {
              for (; cls > 138; cls -= 138)
                w2(32754);
              if (cls > 2) {
                w2(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
                cls = 0;
              }
            } else if (cls > 3) {
              w2(cln), --cls;
              for (; cls > 6; cls -= 6)
                w2(8304);
              if (cls > 2)
                w2(cls - 3 << 5 | 8208), cls = 0;
            }
            while (cls--)
              w2(cln);
            cls = 1;
            cln = c3[i3];
          }
        }
        return [cl.subarray(0, cli), s3];
      };
      var clen = function(cf, cl) {
        var l3 = 0;
        for (var i3 = 0; i3 < cl.length; ++i3)
          l3 += cf[i3] * cl[i3];
        return l3;
      };
      var wfblk = function(out, pos, dat) {
        var s3 = dat.length;
        var o3 = shft(pos + 2);
        out[o3] = s3 & 255;
        out[o3 + 1] = s3 >>> 8;
        out[o3 + 2] = out[o3] ^ 255;
        out[o3 + 3] = out[o3 + 1] ^ 255;
        for (var i3 = 0; i3 < s3; ++i3)
          out[o3 + i3 + 4] = dat[i3];
        return (o3 + 4 + s3) * 8;
      };
      var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p2) {
        wbits(out, p2++, final);
        ++lf[256];
        var _a2 = hTree(lf, 15), dlt = _a2[0], mlb = _a2[1];
        var _b2 = hTree(df, 15), ddt = _b2[0], mdb = _b2[1];
        var _c = lc(dlt), lclt = _c[0], nlc = _c[1];
        var _d = lc(ddt), lcdt = _d[0], ndc = _d[1];
        var lcfreq = new u16(19);
        for (var i3 = 0; i3 < lclt.length; ++i3)
          lcfreq[lclt[i3] & 31]++;
        for (var i3 = 0; i3 < lcdt.length; ++i3)
          lcfreq[lcdt[i3] & 31]++;
        var _e = hTree(lcfreq, 7), lct = _e[0], mlcb = _e[1];
        var nlcc = 19;
        for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
          ;
        var flen = bl + 5 << 3;
        var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
        var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + (2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18]);
        if (flen <= ftlen && flen <= dtlen)
          return wfblk(out, p2, dat.subarray(bs, bs + bl));
        var lm, ll, dm, dl;
        wbits(out, p2, 1 + (dtlen < ftlen)), p2 += 2;
        if (dtlen < ftlen) {
          lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
          var llm = hMap(lct, mlcb, 0);
          wbits(out, p2, nlc - 257);
          wbits(out, p2 + 5, ndc - 1);
          wbits(out, p2 + 10, nlcc - 4);
          p2 += 14;
          for (var i3 = 0; i3 < nlcc; ++i3)
            wbits(out, p2 + 3 * i3, lct[clim[i3]]);
          p2 += 3 * nlcc;
          var lcts = [lclt, lcdt];
          for (var it = 0; it < 2; ++it) {
            var clct = lcts[it];
            for (var i3 = 0; i3 < clct.length; ++i3) {
              var len = clct[i3] & 31;
              wbits(out, p2, llm[len]), p2 += lct[len];
              if (len > 15)
                wbits(out, p2, clct[i3] >>> 5 & 127), p2 += clct[i3] >>> 12;
            }
          }
        } else {
          lm = flm, ll = flt, dm = fdm, dl = fdt;
        }
        for (var i3 = 0; i3 < li; ++i3) {
          if (syms[i3] > 255) {
            var len = syms[i3] >>> 18 & 31;
            wbits16(out, p2, lm[len + 257]), p2 += ll[len + 257];
            if (len > 7)
              wbits(out, p2, syms[i3] >>> 23 & 31), p2 += fleb[len];
            var dst = syms[i3] & 31;
            wbits16(out, p2, dm[dst]), p2 += dl[dst];
            if (dst > 3)
              wbits16(out, p2, syms[i3] >>> 5 & 8191), p2 += fdeb[dst];
          } else {
            wbits16(out, p2, lm[syms[i3]]), p2 += ll[syms[i3]];
          }
        }
        wbits16(out, p2, lm[256]);
        return p2 + ll[256];
      };
      var deo = /* @__PURE__ */ new u32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
      var et = /* @__PURE__ */ new u8(0);
      var dflt = function(dat, lvl, plvl, pre, post, lst) {
        var s3 = dat.length;
        var o3 = new u8(pre + s3 + 5 * (1 + Math.floor(s3 / 7e3)) + post);
        var w2 = o3.subarray(pre, o3.length - post);
        var pos = 0;
        if (!lvl || s3 < 8) {
          for (var i3 = 0; i3 <= s3; i3 += 65535) {
            var e3 = i3 + 65535;
            if (e3 < s3) {
              pos = wfblk(w2, pos, dat.subarray(i3, e3));
            } else {
              w2[i3] = lst;
              pos = wfblk(w2, pos, dat.subarray(i3, s3));
            }
          }
        } else {
          var opt = deo[lvl - 1];
          var n3 = opt >>> 13, c3 = opt & 8191;
          var msk_1 = (1 << plvl) - 1;
          var prev = new u16(32768), head = new u16(msk_1 + 1);
          var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
          var hsh = function(i4) {
            return (dat[i4] ^ dat[i4 + 1] << bs1_1 ^ dat[i4 + 2] << bs2_1) & msk_1;
          };
          var syms = new u32(25e3);
          var lf = new u16(288), df = new u16(32);
          var lc_1 = 0, eb = 0, i3 = 0, li = 0, wi = 0, bs = 0;
          for (; i3 < s3; ++i3) {
            var hv = hsh(i3);
            var imod = i3 & 32767;
            var pimod = head[hv];
            prev[imod] = pimod;
            head[hv] = imod;
            if (wi <= i3) {
              var rem = s3 - i3;
              if ((lc_1 > 7e3 || li > 24576) && rem > 423) {
                pos = wblk(dat, w2, 0, syms, lf, df, eb, li, bs, i3 - bs, pos);
                li = lc_1 = eb = 0, bs = i3;
                for (var j = 0; j < 286; ++j)
                  lf[j] = 0;
                for (var j = 0; j < 30; ++j)
                  df[j] = 0;
              }
              var l3 = 2, d2 = 0, ch_1 = c3, dif = imod - pimod & 32767;
              if (rem > 2 && hv == hsh(i3 - dif)) {
                var maxn = Math.min(n3, rem) - 1;
                var maxd = Math.min(32767, i3);
                var ml = Math.min(258, rem);
                while (dif <= maxd && --ch_1 && imod != pimod) {
                  if (dat[i3 + l3] == dat[i3 + l3 - dif]) {
                    var nl = 0;
                    for (; nl < ml && dat[i3 + nl] == dat[i3 + nl - dif]; ++nl)
                      ;
                    if (nl > l3) {
                      l3 = nl, d2 = dif;
                      if (nl > maxn)
                        break;
                      var mmd = Math.min(dif, nl - 2);
                      var md = 0;
                      for (var j = 0; j < mmd; ++j) {
                        var ti = i3 - dif + j + 32768 & 32767;
                        var pti = prev[ti];
                        var cd = ti - pti + 32768 & 32767;
                        if (cd > md)
                          md = cd, pimod = ti;
                      }
                    }
                  }
                  imod = pimod, pimod = prev[imod];
                  dif += imod - pimod + 32768 & 32767;
                }
              }
              if (d2) {
                syms[li++] = 268435456 | revfl[l3] << 18 | revfd[d2];
                var lin = revfl[l3] & 31, din = revfd[d2] & 31;
                eb += fleb[lin] + fdeb[din];
                ++lf[257 + lin];
                ++df[din];
                wi = i3 + l3;
                ++lc_1;
              } else {
                syms[li++] = dat[i3];
                ++lf[dat[i3]];
              }
            }
          }
          pos = wblk(dat, w2, lst, syms, lf, df, eb, li, bs, i3 - bs, pos);
          if (!lst)
            pos = wfblk(w2, pos, et);
        }
        return slc(o3, 0, pre + shft(pos) + post);
      };
      var adler = function() {
        var a3 = 1, b2 = 0;
        return {
          p: function(d2) {
            var n3 = a3, m2 = b2;
            var l3 = d2.length;
            for (var i3 = 0; i3 != l3; ) {
              var e3 = Math.min(i3 + 5552, l3);
              for (; i3 < e3; ++i3)
                n3 += d2[i3], m2 += n3;
              n3 %= 65521, m2 %= 65521;
            }
            a3 = n3, b2 = m2;
          },
          d: function() {
            return (a3 >>> 8 << 16 | (b2 & 255) << 8 | b2 >>> 8) + ((a3 & 255) << 23) * 2;
          }
        };
      };
      var dopt = function(dat, opt, pre, post, st) {
        return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 12 + opt.mem, pre, post, !st);
      };
      var wbytes = function(d2, b2, v3) {
        for (; v3; ++b2)
          d2[b2] = v3, v3 >>>= 8;
      };
      var zlh = function(c3, o3) {
        var lv = o3.level, fl2 = lv == 0 ? 0 : lv < 6 ? 1 : lv == 9 ? 3 : 2;
        c3[0] = 120, c3[1] = fl2 << 6 | (fl2 ? 32 - 2 * fl2 : 1);
      };
      var zlv = function(d2) {
        if ((d2[0] & 15) != 8 || d2[0] >>> 4 > 7 || (d2[0] << 8 | d2[1]) % 31)
          throw "invalid zlib data";
        if (d2[1] & 32)
          throw "invalid zlib data: preset dictionaries not supported";
      };
      function zlibSync(data, opts) {
        if (opts === void 0) {
          opts = {};
        }
        var a3 = adler();
        a3.p(data);
        var d2 = dopt(data, opts, 2, 4);
        return zlh(d2, opts), wbytes(d2, d2.length - 4, a3.d()), d2;
      }
      function unzlibSync(data, out) {
        return inflt((zlv(data), data.subarray(2, -4)), out);
      }
      function strToU8(str, latin1) {
        var l3 = str.length;
        if (!latin1 && typeof TextEncoder != "undefined")
          return new TextEncoder().encode(str);
        var ar = new u8(str.length + (str.length >>> 1));
        var ai = 0;
        var w2 = function(v3) {
          ar[ai++] = v3;
        };
        for (var i3 = 0; i3 < l3; ++i3) {
          if (ai + 5 > ar.length) {
            var n3 = new u8(ai + 8 + (l3 - i3 << 1));
            n3.set(ar);
            ar = n3;
          }
          var c3 = str.charCodeAt(i3);
          if (c3 < 128 || latin1)
            w2(c3);
          else if (c3 < 2048)
            w2(192 | c3 >>> 6), w2(128 | c3 & 63);
          else if (c3 > 55295 && c3 < 57344)
            c3 = 65536 + (c3 & 1023 << 10) | str.charCodeAt(++i3) & 1023, w2(240 | c3 >>> 18), w2(128 | c3 >>> 12 & 63), w2(128 | c3 >>> 6 & 63), w2(128 | c3 & 63);
          else
            w2(224 | c3 >>> 12), w2(128 | c3 >>> 6 & 63), w2(128 | c3 & 63);
        }
        return slc(ar, 0, ai);
      }
      function strFromU8(dat, latin1) {
        var r3 = "";
        if (!latin1 && typeof TextDecoder != "undefined")
          return new TextDecoder().decode(dat);
        for (var i3 = 0; i3 < dat.length; ) {
          var c3 = dat[i3++];
          if (c3 < 128 || latin1)
            r3 += String.fromCharCode(c3);
          else if (c3 < 224)
            r3 += String.fromCharCode((c3 & 31) << 6 | dat[i3++] & 63);
          else if (c3 < 240)
            r3 += String.fromCharCode((c3 & 15) << 12 | (dat[i3++] & 63) << 6 | dat[i3++] & 63);
          else
            c3 = ((c3 & 15) << 18 | (dat[i3++] & 63) << 12 | (dat[i3++] & 63) << 6 | dat[i3++] & 63) - 65536, r3 += String.fromCharCode(55296 | c3 >> 10, 56320 | c3 & 1023);
        }
        return r3;
      }
      var MARK = "v1";
      var pack = (event) => {
        const _e = Object.assign(Object.assign({}, event), { v: MARK });
        return strFromU8(zlibSync(strToU8(JSON.stringify(_e))), true);
      };
      var unpack = (raw) => {
        if (typeof raw !== "string") {
          return raw;
        }
        try {
          const e3 = JSON.parse(raw);
          if (e3.timestamp) {
            return e3;
          }
        } catch (error) {
        }
        try {
          const e3 = JSON.parse(strFromU8(unzlibSync(strToU8(raw, true))));
          if (e3.v === MARK) {
            return e3;
          }
          throw new Error(`These events were packed with packer ${e3.v} which is incompatible with current packer ${MARK}.`);
        } catch (error) {
          console.error(error);
          throw new Error("Unknown data format.");
        }
      };
      var StackFrame = class {
        constructor(obj) {
          this.fileName = obj.fileName || "";
          this.functionName = obj.functionName || "";
          this.lineNumber = obj.lineNumber;
          this.columnNumber = obj.columnNumber;
        }
        toString() {
          const lineNumber = this.lineNumber || "";
          const columnNumber = this.columnNumber || "";
          if (this.functionName)
            return `${this.functionName} (${this.fileName}:${lineNumber}:${columnNumber})`;
          return `${this.fileName}:${lineNumber}:${columnNumber}`;
        }
      };
      var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
      var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
      var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;
      var ErrorStackParser = {
        parse: function(error) {
          if (!error) {
            return [];
          }
          if (typeof error.stacktrace !== "undefined" || typeof error["opera#sourceloc"] !== "undefined") {
            return this.parseOpera(error);
          } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
            return this.parseV8OrIE(error);
          } else if (error.stack) {
            return this.parseFFOrSafari(error);
          } else {
            console.warn("[console-record-plugin]: Failed to parse error object:", error);
            return [];
          }
        },
        extractLocation: function(urlLike) {
          if (urlLike.indexOf(":") === -1) {
            return [urlLike];
          }
          const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
          const parts = regExp.exec(urlLike.replace(/[()]/g, ""));
          if (!parts)
            throw new Error(`Cannot parse given url: ${urlLike}`);
          return [parts[1], parts[2] || void 0, parts[3] || void 0];
        },
        parseV8OrIE: function(error) {
          const filtered = error.stack.split("\n").filter(function(line) {
            return !!line.match(CHROME_IE_STACK_REGEXP);
          }, this);
          return filtered.map(function(line) {
            if (line.indexOf("(eval ") > -1) {
              line = line.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(\),.*$)/g, "");
            }
            let sanitizedLine = line.replace(/^\s+/, "").replace(/\(eval code/g, "(");
            const location = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/);
            sanitizedLine = location ? sanitizedLine.replace(location[0], "") : sanitizedLine;
            const tokens = sanitizedLine.split(/\s+/).slice(1);
            const locationParts = this.extractLocation(location ? location[1] : tokens.pop());
            const functionName = tokens.join(" ") || void 0;
            const fileName = ["eval", "<anonymous>"].indexOf(locationParts[0]) > -1 ? void 0 : locationParts[0];
            return new StackFrame({
              functionName,
              fileName,
              lineNumber: locationParts[1],
              columnNumber: locationParts[2]
            });
          }, this);
        },
        parseFFOrSafari: function(error) {
          const filtered = error.stack.split("\n").filter(function(line) {
            return !line.match(SAFARI_NATIVE_CODE_REGEXP);
          }, this);
          return filtered.map(function(line) {
            if (line.indexOf(" > eval") > -1) {
              line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1");
            }
            if (line.indexOf("@") === -1 && line.indexOf(":") === -1) {
              return new StackFrame({
                functionName: line
              });
            } else {
              const functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
              const matches = line.match(functionNameRegex);
              const functionName = matches && matches[1] ? matches[1] : void 0;
              const locationParts = this.extractLocation(line.replace(functionNameRegex, ""));
              return new StackFrame({
                functionName,
                fileName: locationParts[0],
                lineNumber: locationParts[1],
                columnNumber: locationParts[2]
              });
            }
          }, this);
        },
        parseOpera: function(e3) {
          if (!e3.stacktrace || e3.message.indexOf("\n") > -1 && e3.message.split("\n").length > e3.stacktrace.split("\n").length) {
            return this.parseOpera9(e3);
          } else if (!e3.stack) {
            return this.parseOpera10(e3);
          } else {
            return this.parseOpera11(e3);
          }
        },
        parseOpera9: function(e3) {
          const lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
          const lines = e3.message.split("\n");
          const result = [];
          for (let i3 = 2, len = lines.length; i3 < len; i3 += 2) {
            const match = lineRE.exec(lines[i3]);
            if (match) {
              result.push(new StackFrame({
                fileName: match[2],
                lineNumber: parseFloat(match[1])
              }));
            }
          }
          return result;
        },
        parseOpera10: function(e3) {
          const lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
          const lines = e3.stacktrace.split("\n");
          const result = [];
          for (let i3 = 0, len = lines.length; i3 < len; i3 += 2) {
            const match = lineRE.exec(lines[i3]);
            if (match) {
              result.push(new StackFrame({
                functionName: match[3] || void 0,
                fileName: match[2],
                lineNumber: parseFloat(match[1])
              }));
            }
          }
          return result;
        },
        parseOpera11: function(error) {
          const filtered = error.stack.split("\n").filter(function(line) {
            return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
          }, this);
          return filtered.map(function(line) {
            const tokens = line.split("@");
            const locationParts = this.extractLocation(tokens.pop());
            const functionCall = tokens.shift() || "";
            const functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || void 0;
            return new StackFrame({
              functionName,
              fileName: locationParts[0],
              lineNumber: locationParts[1],
              columnNumber: locationParts[2]
            });
          }, this);
        }
      };
      function pathToSelector(node) {
        if (!node || !node.outerHTML) {
          return "";
        }
        let path = "";
        while (node.parentElement) {
          let name = node.localName;
          if (!name) {
            break;
          }
          name = name.toLowerCase();
          const parent = node.parentElement;
          const domSiblings = [];
          if (parent.children && parent.children.length > 0) {
            for (let i3 = 0; i3 < parent.children.length; i3++) {
              const sibling = parent.children[i3];
              if (sibling.localName && sibling.localName.toLowerCase) {
                if (sibling.localName.toLowerCase() === name) {
                  domSiblings.push(sibling);
                }
              }
            }
          }
          if (domSiblings.length > 1) {
            name += `:eq(${domSiblings.indexOf(node)})`;
          }
          path = name + (path ? ">" + path : "");
          node = parent;
        }
        return path;
      }
      function isObject(obj) {
        return Object.prototype.toString.call(obj) === "[object Object]";
      }
      function isObjTooDeep(obj, limit) {
        if (limit === 0) {
          return true;
        }
        const keys = Object.keys(obj);
        for (const key of keys) {
          if (isObject(obj[key]) && isObjTooDeep(obj[key], limit - 1)) {
            return true;
          }
        }
        return false;
      }
      function stringify(obj, stringifyOptions) {
        const options = {
          numOfKeysLimit: 50,
          depthOfLimit: 4
        };
        Object.assign(options, stringifyOptions);
        const stack = [];
        const keys = [];
        return JSON.stringify(obj, function(key, value) {
          if (stack.length > 0) {
            const thisPos = stack.indexOf(this);
            ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
            ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
            if (~stack.indexOf(value)) {
              if (stack[0] === value) {
                value = "[Circular ~]";
              } else {
                value = "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
              }
            }
          } else {
            stack.push(value);
          }
          if (value === null)
            return value;
          if (value === void 0)
            return "undefined";
          if (shouldIgnore(value)) {
            return toString(value);
          }
          if (value instanceof Event) {
            const eventResult = {};
            for (const eventKey in value) {
              const eventValue = value[eventKey];
              if (Array.isArray(eventValue)) {
                eventResult[eventKey] = pathToSelector(eventValue.length ? eventValue[0] : null);
              } else {
                eventResult[eventKey] = eventValue;
              }
            }
            return eventResult;
          } else if (value instanceof Node) {
            if (value instanceof HTMLElement) {
              return value ? value.outerHTML : "";
            }
            return value.nodeName;
          } else if (value instanceof Error) {
            return value.stack ? value.stack + "\nEnd of stack for Error object" : value.name + ": " + value.message;
          }
          return value;
        });
        function shouldIgnore(_obj) {
          if (isObject(_obj) && Object.keys(_obj).length > options.numOfKeysLimit) {
            return true;
          }
          if (typeof _obj === "function") {
            return true;
          }
          if (isObject(_obj) && isObjTooDeep(_obj, options.depthOfLimit)) {
            return true;
          }
          return false;
        }
        function toString(_obj) {
          let str = _obj.toString();
          if (options.stringLengthLimit && str.length > options.stringLengthLimit) {
            str = `${str.slice(0, options.stringLengthLimit)}...`;
          }
          return str;
        }
      }
      var defaultLogOptions = {
        level: [
          "assert",
          "clear",
          "count",
          "countReset",
          "debug",
          "dir",
          "dirxml",
          "error",
          "group",
          "groupCollapsed",
          "groupEnd",
          "info",
          "log",
          "table",
          "time",
          "timeEnd",
          "timeLog",
          "trace",
          "warn"
        ],
        lengthThreshold: 1e3,
        logger: "console"
      };
      function initLogObserver(cb, win, options) {
        const logOptions = options ? Object.assign({}, defaultLogOptions, options) : defaultLogOptions;
        const loggerType = logOptions.logger;
        if (!loggerType) {
          return () => {
          };
        }
        let logger;
        if (typeof loggerType === "string") {
          logger = win[loggerType];
        } else {
          logger = loggerType;
        }
        let logCount = 0;
        let inStack = false;
        const cancelHandlers = [];
        if (logOptions.level.includes("error")) {
          const errorHandler2 = (event) => {
            const message = event.message, error = event.error;
            const trace = ErrorStackParser.parse(error).map((stackFrame) => stackFrame.toString());
            const payload = [stringify(message, logOptions.stringifyOptions)];
            cb({
              level: "error",
              trace,
              payload
            });
          };
          win.addEventListener("error", errorHandler2);
          cancelHandlers.push(() => {
            win.removeEventListener("error", errorHandler2);
          });
          const unhandledrejectionHandler = (event) => {
            let error;
            let payload;
            if (event.reason instanceof Error) {
              error = event.reason;
              payload = [
                stringify(`Uncaught (in promise) ${error.name}: ${error.message}`, logOptions.stringifyOptions)
              ];
            } else {
              error = new Error();
              payload = [
                stringify("Uncaught (in promise)", logOptions.stringifyOptions),
                stringify(event.reason, logOptions.stringifyOptions)
              ];
            }
            const trace = ErrorStackParser.parse(error).map((stackFrame) => stackFrame.toString());
            cb({
              level: "error",
              trace,
              payload
            });
          };
          win.addEventListener("unhandledrejection", unhandledrejectionHandler);
          cancelHandlers.push(() => {
            win.removeEventListener("unhandledrejection", unhandledrejectionHandler);
          });
        }
        for (const levelType of logOptions.level) {
          cancelHandlers.push(replace(logger, levelType));
        }
        return () => {
          cancelHandlers.forEach((h2) => h2());
        };
        function replace(_logger, level) {
          if (!_logger[level]) {
            return () => {
            };
          }
          return patch(_logger, level, (original) => {
            return (...args) => {
              original.apply(this, args);
              if (inStack) {
                return;
              }
              inStack = true;
              try {
                const trace = ErrorStackParser.parse(new Error()).map((stackFrame) => stackFrame.toString()).splice(1);
                const payload = args.map((s3) => stringify(s3, logOptions.stringifyOptions));
                logCount++;
                if (logCount < logOptions.lengthThreshold) {
                  cb({
                    level,
                    trace,
                    payload
                  });
                } else if (logCount === logOptions.lengthThreshold) {
                  cb({
                    level: "warn",
                    trace: [],
                    payload: [
                      stringify("The number of log records reached the threshold.")
                    ]
                  });
                }
              } catch (error) {
                original("rrweb logger error:", error, ...args);
              } finally {
                inStack = false;
              }
            };
          });
        }
      }
      var PLUGIN_NAME = "rrweb/console@1";
      var getRecordConsolePlugin = (options) => ({
        name: PLUGIN_NAME,
        observer: initLogObserver,
        options
      });
      var ORIGINAL_ATTRIBUTE_NAME = "__rrweb_original__";
      var defaultLogConfig = {
        level: [
          "assert",
          "clear",
          "count",
          "countReset",
          "debug",
          "dir",
          "dirxml",
          "error",
          "group",
          "groupCollapsed",
          "groupEnd",
          "info",
          "log",
          "table",
          "time",
          "timeEnd",
          "timeLog",
          "trace",
          "warn"
        ],
        replayLogger: void 0
      };
      var LogReplayPlugin = class {
        constructor(config) {
          this.config = Object.assign(defaultLogConfig, config);
        }
        getConsoleLogger() {
          const replayLogger = {};
          for (const level of this.config.level) {
            if (level === "trace") {
              replayLogger[level] = (data) => {
                const logger = console.log[ORIGINAL_ATTRIBUTE_NAME] ? console.log[ORIGINAL_ATTRIBUTE_NAME] : console.log;
                logger(...data.payload.map((s3) => JSON.parse(s3)), this.formatMessage(data));
              };
            } else {
              replayLogger[level] = (data) => {
                const logger = console[level][ORIGINAL_ATTRIBUTE_NAME] ? console[level][ORIGINAL_ATTRIBUTE_NAME] : console[level];
                logger(...data.payload.map((s3) => JSON.parse(s3)), this.formatMessage(data));
              };
            }
          }
          return replayLogger;
        }
        formatMessage(data) {
          if (data.trace.length === 0) {
            return "";
          }
          const stackPrefix = "\n	at ";
          let result = stackPrefix;
          result += data.trace.join(stackPrefix);
          return result;
        }
      };
      var getReplayConsolePlugin = (options) => {
        const replayLogger = (options === null || options === void 0 ? void 0 : options.replayLogger) || new LogReplayPlugin(options).getConsoleLogger();
        return {
          handler(event, _isSync, context) {
            let logData = null;
            if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.Log) {
              logData = event.data;
            } else if (event.type === EventType.Plugin && event.data.plugin === PLUGIN_NAME) {
              logData = event.data.payload;
            }
            if (logData) {
              try {
                if (typeof replayLogger[logData.level] === "function") {
                  replayLogger[logData.level](logData);
                }
              } catch (error) {
                if (context.replayer.config.showWarning) {
                  console.warn(error);
                }
              }
            }
          }
        };
      };
      exports.EventType = EventType;
      exports.IncrementalSource = IncrementalSource;
      exports.MouseInteractions = MouseInteractions;
      exports.PLUGIN_NAME = PLUGIN_NAME;
      exports.Replayer = Replayer;
      exports.ReplayerEvents = ReplayerEvents;
      exports.addCustomEvent = addCustomEvent;
      exports.freezePage = freezePage;
      exports.getRecordConsolePlugin = getRecordConsolePlugin;
      exports.getReplayConsolePlugin = getReplayConsolePlugin;
      exports.pack = pack;
      exports.record = record;
      exports.unpack = unpack;
      exports.utils = utils;
    }
  });

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

  // sessionReplay.ts
  var rrweb = require_rrweb_all();
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
        this.stopRecordingFn = rrweb.record({
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

rrweb/lib/rrweb-all.cjs:
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
