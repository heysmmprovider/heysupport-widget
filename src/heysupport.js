(function () {
  "use strict";

  var SCRIPT_TAG =
    document.currentScript ||
    document.querySelector('script[data-server]');

  var CONFIG = {
    server: SCRIPT_TAG && SCRIPT_TAG.getAttribute("data-server"),
    color: (SCRIPT_TAG && SCRIPT_TAG.getAttribute("data-color")) || "#1972f5",
    position: (SCRIPT_TAG && SCRIPT_TAG.getAttribute("data-position")) || "right",
    welcome:
      (SCRIPT_TAG && SCRIPT_TAG.getAttribute("data-welcome")) ||
      "Hi! How can we help you?",
    title:
      (SCRIPT_TAG && SCRIPT_TAG.getAttribute("data-title")) || "HeySupport",
  };

  if (!CONFIG.server) {
    console.error("[HeySupport] Missing data-server attribute on script tag.");
    return;
  }

  // ── Visitor persistence ─────────────────────────────────────────────
  var STORAGE_KEY = "heysupport_visitor";

  function getVisitor() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function saveVisitor(visitor) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visitor));
    } catch (e) {}
  }

  function generateId() {
    return "visitor_" + Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
  }

  // ── Styles ──────────────────────────────────────────────────────────
  function injectStyles() {
    var pos = CONFIG.position === "left" ? "left" : "right";
    var R = "#hs-root"; // prefix for specificity
    var C = CONFIG.color;
    var css = [
      // Reset — only box-sizing, NOT margin/padding
      R + "," + R + " *," + R + " *::before," + R + " *::after{box-sizing:border-box;}",
      R + "{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.4;color:#1b2a4e;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}",

      // Launcher bubble
      R + " #hs-launcher{position:fixed;bottom:24px;" + pos + ":24px;z-index:2147483647;width:56px;height:56px;border-radius:50%;background:" + C + ";border:none;cursor:pointer;box-shadow:0 2px 16px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;transition:transform .15s ease,box-shadow .15s ease;outline:none;padding:0;margin:0;}",
      R + " #hs-launcher:hover{transform:scale(1.05);box-shadow:0 4px 20px rgba(0,0,0,.3);}",
      R + " #hs-launcher:active{transform:scale(.97);}",
      R + " #hs-launcher svg{width:24px;height:24px;transition:opacity .15s ease,transform .2s ease;fill:none;}",
      R + " #hs-launcher .hs-icon-chat{opacity:1;transform:rotate(0deg);}",
      R + " #hs-launcher .hs-icon-close{position:absolute;opacity:0;transform:rotate(-60deg);}",
      R + " #hs-launcher.hs-active .hs-icon-chat{opacity:0;transform:rotate(60deg);}",
      R + " #hs-launcher.hs-active .hs-icon-close{opacity:1;transform:rotate(0deg);}",

      // Badge
      R + " #hs-badge{position:absolute;top:-2px;" + pos + ":-2px;min-width:18px;height:18px;border-radius:9px;background:#e74c3c;color:#fff;font-size:11px;font-weight:600;display:none;align-items:center;justify-content:center;padding:0 5px;border:2px solid #fff;line-height:1;margin:0;}",
      R + " #hs-badge.hs-visible{display:flex;}",

      // Chat window
      R + " #hs-chat{position:fixed;bottom:92px;" + pos + ":24px;z-index:2147483646;width:376px;height:min(560px,calc(100vh - 120px));background:#fff;border-radius:12px;box-shadow:0 5px 40px rgba(0,0,0,.16);display:none;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(8px) scale(.98);transition:opacity .2s ease,transform .2s ease;margin:0;padding:0;}",
      R + " #hs-chat.hs-visible{display:flex;}",
      R + " #hs-chat.hs-shown{opacity:1;transform:translateY(0) scale(1);}",

      // Header
      R + " .hs-head{background:" + C + ";padding:20px 24px 18px;flex-shrink:0;position:relative;margin:0;}",
      R + " .hs-head-title{color:#fff;font-size:16px;font-weight:600;letter-spacing:-.2px;margin:0;padding:0;}",
      R + " .hs-head-sub{color:rgba(255,255,255,.8);font-size:12.5px;margin:3px 0 0;padding:0;}",

      // Status bar
      R + " .hs-bar{padding:8px 16px;font-size:12px;text-align:center;background:#f7f8fc;color:#6b7a99;border-bottom:1px solid #eef0f6;flex-shrink:0;display:none;align-items:center;justify-content:center;gap:7px;margin:0;}",
      R + " .hs-bar.hs-visible{display:flex;}",
      R + " .hs-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin:0;padding:0;}",
      R + " .hs-dot-waiting{background:#f0ad4e;animation:hs-pulse 1.4s ease-in-out infinite;}",
      R + " .hs-dot-online{background:#27ae60;}",
      R + " .hs-dot-off{background:#95a5b8;}",
      "@keyframes hs-pulse{0%,100%{opacity:1;}50%{opacity:.35;}}",

      // Body
      R + " .hs-body{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative;margin:0;padding:0;}",

      // Pre-chat form
      R + " .hs-prechat{display:flex;flex-direction:column;padding:28px 24px 20px;margin:0;}",
      R + " .hs-prechat-hi{font-size:15px;color:#4a5568;margin:0 0 24px;padding:0;line-height:1.5;}",
      R + " .hs-prechat-group{margin:0 0 14px;padding:0;}",
      R + " .hs-prechat-label{display:block;font-size:11px;font-weight:600;color:#6b7a99;margin:0 0 6px;padding:0;text-transform:uppercase;letter-spacing:.5px;}",
      R + " .hs-prechat-input{width:100%;padding:10px 14px;border:1.5px solid #dce1eb;border-radius:8px;font-size:14px;outline:none;font-family:inherit;color:#1b2a4e;background:#fff;transition:border-color .15s,box-shadow .15s;margin:0;height:auto;line-height:1.4;}",
      R + " .hs-prechat-input:focus{border-color:" + C + ";box-shadow:0 0 0 3px " + C + "1a;}",
      R + " .hs-prechat-input::placeholder{color:#a0aec0;}",
      R + " .hs-prechat-input.hs-err{border-color:#e74c3c;}",
      R + " .hs-prechat-btn{width:100%;margin:8px 0 0;padding:12px 20px;border-radius:8px;border:none;background:" + C + ";color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:filter .15s,transform .1s;letter-spacing:-.1px;line-height:1;}",
      R + " .hs-prechat-btn:hover{filter:brightness(1.06);}",
      R + " .hs-prechat-btn:active{transform:scale(.98);}",

      // Messages
      R + " .hs-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:4px;scroll-behavior:smooth;margin:0;}",
      R + " .hs-msgs::-webkit-scrollbar{width:3px;}",
      R + " .hs-msgs::-webkit-scrollbar-track{background:transparent;}",
      R + " .hs-msgs::-webkit-scrollbar-thumb{background:#d0d5dd;border-radius:3px;}",

      // Message bubbles
      R + " .hs-m{max-width:78%;padding:9px 14px;border-radius:18px;font-size:13.5px;word-wrap:break-word;white-space:pre-wrap;line-height:1.45;margin:0;}",
      R + " .hs-m-v{align-self:flex-end;background:" + C + ";color:#fff;border-bottom-right-radius:6px;}",
      R + " .hs-m-o{align-self:flex-start;background:#f0f2f7;color:#1b2a4e;border-bottom-left-radius:6px;}",
      R + " .hs-m-s{align-self:center;background:none;color:#95a5b8;font-size:11.5px;text-align:center;padding:6px 0;}",
      R + " .hs-m-name{font-size:11px;font-weight:600;color:#6b7a99;margin:0 0 2px;padding:0;}",
      R + " .hs-m-time{font-size:10px;opacity:.55;margin:3px 0 0;padding:0;}",

      // Typing indicator
      R + " .hs-typing{display:none;align-self:flex-start;padding:10px 16px;background:#f0f2f7;border-radius:18px;border-bottom-left-radius:6px;gap:3px;align-items:center;margin:0;}",
      R + " .hs-typing.hs-visible{display:flex;}",
      R + " .hs-typing i{display:block;width:5px;height:5px;border-radius:50%;background:#95a5b8;animation:hs-bounce 1.2s ease-in-out infinite;margin:0;padding:0;}",
      R + " .hs-typing i:nth-child(2){animation-delay:.15s;}",
      R + " .hs-typing i:nth-child(3){animation-delay:.3s;}",
      "@keyframes hs-bounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-3px);}}",

      // Input footer
      R + " .hs-foot{padding:12px 14px;border-top:1px solid #eef0f6;display:flex;gap:8px;align-items:flex-end;flex-shrink:0;background:#fff;margin:0;}",
      R + " .hs-foot textarea{flex:1;border:1.5px solid #dce1eb;border-radius:20px;padding:9px 16px;font-size:13.5px;resize:none;outline:none;max-height:90px;min-height:38px;font-family:inherit;line-height:1.4;color:#1b2a4e;background:#fafbfd;transition:border-color .15s,background .15s;margin:0;}",
      R + " .hs-foot textarea:focus{border-color:" + C + ";background:#fff;}",
      R + " .hs-foot textarea::placeholder{color:#a0aec0;}",
      R + " .hs-send{width:36px;height:36px;border-radius:50%;border:none;background:" + C + ";color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .15s,transform .1s;margin:0;padding:0;}",
      R + " .hs-send:disabled{opacity:.35;cursor:default;}",
      R + " .hs-send:not(:disabled):hover{filter:brightness(1.08);}",
      R + " .hs-send:not(:disabled):active{transform:scale(.92);}",
      R + " .hs-send svg{width:16px;height:16px;}",

      // Powered by
      R + " .hs-pw{text-align:center;padding:7px 14px;font-size:10.5px;color:#b0b8c9;flex-shrink:0;background:#fafbfd;border-top:1px solid #f0f2f5;margin:0;}",
      R + " .hs-pw a{color:#8892a6;text-decoration:none;font-weight:500;}",
      R + " .hs-pw a:hover{color:#6b7a99;}",

      // Mobile
      "@media(max-width:480px){" + R + " #hs-chat{width:100%;height:100%;max-height:100%;bottom:0;" + pos + ":0;border-radius:0;}" + R + " #hs-launcher{bottom:16px;" + pos + ":16px;width:52px;height:52px;}" + R + " #hs-launcher svg{width:22px;height:22px;}}"
    ].join("\n");

    var style = document.createElement("style");
    style.id = "heysupport-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── DOM ──────────────────────────────────────────────────────────────
  function buildDOM() {
    var container = document.createElement("div");
    container.id = "hs-root";
    container.innerHTML = '\
<button id="hs-launcher" aria-label="Open chat">\
<svg class="hs-icon-chat" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>\
<svg class="hs-icon-close" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>\
<span id="hs-badge">0</span>\
</button>\
<div id="hs-chat">\
<div class="hs-head">\
<div class="hs-head-title">' + escapeHtml(CONFIG.title) + '</div>\
<div class="hs-head-sub">We typically reply in a few minutes</div>\
</div>\
<div class="hs-bar" id="hs-bar">\
<span class="hs-dot" id="hs-dot"></span>\
<span id="hs-bar-text"></span>\
</div>\
<div class="hs-body" id="hs-body">\
<div class="hs-prechat" id="hs-prechat">\
<div class="hs-prechat-hi">' + escapeHtml(CONFIG.welcome) + '</div>\
<div class="hs-prechat-group">\
<label class="hs-prechat-label" for="hs-name">Name</label>\
<input class="hs-prechat-input" type="text" id="hs-name" placeholder="Your name" autocomplete="name" />\
</div>\
<div class="hs-prechat-group">\
<label class="hs-prechat-label" for="hs-email">Email <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></label>\
<input class="hs-prechat-input" type="email" id="hs-email" placeholder="you@email.com" autocomplete="email" />\
</div>\
<button class="hs-prechat-btn" id="hs-start">Start Conversation</button>\
</div>\
<div class="hs-msgs" id="hs-msgs" style="display:none">\
<div class="hs-typing" id="hs-typing"><i></i><i></i><i></i></div>\
</div>\
</div>\
<div class="hs-foot" id="hs-foot" style="display:none">\
<textarea id="hs-input" placeholder="Type your message\u2026" rows="1"></textarea>\
<button class="hs-send" id="hs-send" disabled aria-label="Send">\
<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="#fff" stroke="#fff"/></svg>\
</button>\
</div>\
<div class="hs-pw">Powered by <a href="https://heysmmprovider.com" target="_blank" rel="noopener">HeySupport</a></div>\
</div>';
    document.body.appendChild(container);
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ── State ───────────────────────────────────────────────────────────
  var state = {
    open: false,
    socket: null,
    visitor: null,
    conversationId: null,
    operatorJoined: false,
    conversationClosed: false,
    unread: 0,
  };

  var $launcher, $badge, $chat, $bar, $barText, $dot, $prechat, $msgs,
    $foot, $input, $sendBtn, $nameInput, $emailInput, $startBtn, $typing;

  function cacheDom() {
    $launcher = document.getElementById("hs-launcher");
    $badge = document.getElementById("hs-badge");
    $chat = document.getElementById("hs-chat");
    $bar = document.getElementById("hs-bar");
    $barText = document.getElementById("hs-bar-text");
    $dot = document.getElementById("hs-dot");
    $prechat = document.getElementById("hs-prechat");
    $msgs = document.getElementById("hs-msgs");
    $foot = document.getElementById("hs-foot");
    $input = document.getElementById("hs-input");
    $sendBtn = document.getElementById("hs-send");
    $nameInput = document.getElementById("hs-name");
    $emailInput = document.getElementById("hs-email");
    $startBtn = document.getElementById("hs-start");
    $typing = document.getElementById("hs-typing");
  }

  // ── Toggle ──────────────────────────────────────────────────────────
  function toggle() {
    state.open = !state.open;
    $launcher.classList.toggle("hs-active", state.open);

    if (state.open) {
      $chat.classList.add("hs-visible");
      // Trigger animation on next frame
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          $chat.classList.add("hs-shown");
        });
      });
      state.unread = 0;
      updateBadge();
      if (state.conversationId) $input.focus();
      else $nameInput.focus();
      scrollToBottom();
    } else {
      $chat.classList.remove("hs-shown");
      setTimeout(function () {
        if (!state.open) $chat.classList.remove("hs-visible");
      }, 200);
    }
  }

  function updateBadge() {
    $badge.textContent = state.unread;
    $badge.classList.toggle("hs-visible", state.unread > 0);
  }

  // ── Socket.IO ───────────────────────────────────────────────────────
  function loadSocketIO(cb) {
    if (window.io) return cb();
    var s = document.createElement("script");
    s.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
    s.onload = cb;
    s.onerror = function () { console.error("[HeySupport] Failed to load Socket.IO."); };
    document.head.appendChild(s);
  }

  function connectSocket() {
    if (state.socket) return;
    state.socket = io(CONFIG.server, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    var s = state.socket;

    s.on("connect", function () {
      s.emit("register", {
        userId: state.visitor.id,
        name: state.visitor.name,
        role: "client",
      });
    });

    s.on("registered", function () {
      if (state.conversationId) {
        s.emit("conversation:history", { conversationId: state.conversationId });
      }
    });

    s.on("conversation:started", function (data) {
      state.conversationId = data.conversationId || data.id;
      saveVisitor(Object.assign({}, state.visitor, { conversationId: state.conversationId }));
      showChatUI();
      setStatus("waiting");
    });

    s.on("conversation:joined", function (data) {
      state.operatorJoined = true;
      setStatus("online");
      var name = (data.operator && data.operator.name) ? data.operator.name : "An operator";
      addSystemMessage(name + " joined the conversation");
    });

    s.on("conversation:closed", function () {
      state.conversationClosed = true;
      setStatus("closed");
      addSystemMessage("Conversation ended");
      disableInput();
    });

    s.on("message:received", function (data) {
      var msg = data.message || data;
      if (msg.senderId === state.visitor.id) return;
      addMessage(msg, "o");
      if (!state.open) { state.unread++; updateBadge(); }
    });

    s.on("conversation:history", function (data) {
      var msgs = data.messages || data;
      if (!Array.isArray(msgs)) return;
      msgs.forEach(function (msg) {
        addMessage(msg, msg.senderId === state.visitor.id ? "v" : "o", true);
      });
      scrollToBottom();
    });

    s.on("error", function (data) {
      addSystemMessage("Error: " + ((data && data.message) || "Something went wrong"));
    });
  }

  // ── Actions ─────────────────────────────────────────────────────────
  function startConversation(name, email) {
    state.visitor.name = name;
    if (email) state.visitor.email = email;
    saveVisitor(state.visitor);

    state.socket.emit("register", { userId: state.visitor.id, name: name, role: "client" });
    state.socket.emit("conversation:start", {
      name: name,
      email: email || undefined,
      page: window.location.href,
    });
  }

  function sendMessage() {
    var text = $input.value.trim();
    if (!text || !state.conversationId) return;
    state.socket.emit("message:send", { conversationId: state.conversationId, text: text });
    addMessage({
      id: "l_" + Date.now(),
      senderId: state.visitor.id,
      senderName: state.visitor.name,
      text: text,
      timestamp: new Date().toISOString(),
    }, "v");
    $input.value = "";
    autoResize();
    $sendBtn.disabled = true;
  }

  // ── UI helpers ──────────────────────────────────────────────────────
  function showChatUI() {
    $prechat.style.display = "none";
    $msgs.style.display = "flex";
    $foot.style.display = "flex";
    $input.focus();
  }

  function setStatus(type) {
    $bar.classList.add("hs-visible");
    $dot.className = "hs-dot";
    if (type === "waiting") {
      $dot.classList.add("hs-dot-waiting");
      $barText.textContent = "Waiting for an operator\u2026";
    } else if (type === "online") {
      $dot.classList.add("hs-dot-online");
      $barText.textContent = "Operator connected";
    } else if (type === "closed") {
      $dot.classList.add("hs-dot-off");
      $barText.textContent = "Conversation closed";
    }
  }

  function addMessage(msg, type, silent) {
    var el = document.createElement("div");
    el.className = "hs-m hs-m-" + type;

    var html = "";
    if (type === "o" && msg.senderName) {
      html += '<div class="hs-m-name">' + escapeHtml(msg.senderName) + "</div>";
    }
    html += escapeHtml(msg.text);
    if (msg.timestamp) {
      var d = new Date(msg.timestamp);
      html += '<div class="hs-m-time">' + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + "</div>";
    }
    el.innerHTML = html;
    $msgs.insertBefore(el, $typing);
    if (!silent) scrollToBottom();
  }

  function addSystemMessage(text) {
    var el = document.createElement("div");
    el.className = "hs-m hs-m-s";
    el.textContent = text;
    $msgs.insertBefore(el, $typing);
    scrollToBottom();
  }

  function scrollToBottom() {
    requestAnimationFrame(function () { $msgs.scrollTop = $msgs.scrollHeight; });
  }

  function disableInput() {
    $input.disabled = true;
    $sendBtn.disabled = true;
    $input.placeholder = "Conversation closed";
  }

  function autoResize() {
    $input.style.height = "auto";
    $input.style.height = Math.min($input.scrollHeight, 90) + "px";
  }

  // ── Events ──────────────────────────────────────────────────────────
  function bindEvents() {
    $launcher.addEventListener("click", toggle);

    $startBtn.addEventListener("click", function () {
      var name = $nameInput.value.trim();
      if (!name) {
        $nameInput.classList.add("hs-err");
        $nameInput.focus();
        return;
      }
      $nameInput.classList.remove("hs-err");
      startConversation(name, $emailInput.value.trim());
    });

    $nameInput.addEventListener("input", function () { $nameInput.classList.remove("hs-err"); });
    $nameInput.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); $startBtn.click(); } });
    $emailInput.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); $startBtn.click(); } });

    $input.addEventListener("input", function () {
      $sendBtn.disabled = !$input.value.trim();
      autoResize();
    });
    $input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    $sendBtn.addEventListener("click", sendMessage);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && state.open) toggle();
    });
  }

  // ── Init ────────────────────────────────────────────────────────────
  function init() {
    injectStyles();
    buildDOM();
    cacheDom();
    bindEvents();

    var visitor = getVisitor();
    if (!visitor) {
      visitor = { id: generateId(), name: "", email: "" };
      saveVisitor(visitor);
    }
    state.visitor = visitor;
    if (visitor.name) $nameInput.value = visitor.name;
    if (visitor.email) $emailInput.value = visitor.email;

    loadSocketIO(function () {
      connectSocket();
      if (visitor.conversationId) {
        state.conversationId = visitor.conversationId;
        showChatUI();
        setStatus("waiting");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
