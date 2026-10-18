/* ============================================================
   PLAYABLE PORTFOLIO — original side-scrolling platformer
   The site itself, as a game. Every marker opens real content.
   No third-party assets: all art is drawn on the canvas,
   all sound is synthesised with WebAudio.
   ============================================================ */
(function () {
  "use strict";

  var DATA = window.PORTFOLIO || { projects: [], skills: [], journey: [] };

  /* ---------- DOM ---------- */
  var gameRoot = document.getElementById("gameRoot");
  var canvas = document.getElementById("gameCanvas");
  if (!gameRoot || !canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) { enterReadMode(); return; }

  var reader = document.getElementById("reader");
  var intro = document.getElementById("gameIntro");
  var playBtn = document.getElementById("gamePlay");
  var introRead = document.getElementById("introRead");
  var prompt = document.getElementById("gamePrompt");
  var promptText = document.getElementById("gamePromptText");
  var promptKey = document.getElementById("gamePromptKey");
  var panel = document.getElementById("gamePanel");
  var panelBody = document.getElementById("gpBody");
  var live = document.getElementById("gameLive");
  var hudZone = document.getElementById("hudZone");
  var hudCoins = document.getElementById("hudCoins");
  var hudCoinsTotal = document.getElementById("hudCoinsTotal");
  var hudSound = document.getElementById("hudSound");
  var hudTheme = document.getElementById("hudTheme");
  var hudRead = document.getElementById("hudRead");
  var touchWrap = document.getElementById("gameTouch");

  /* ---------- constants ---------- */
  var W = 960, H = 544, TILE = 32;
  var GROUND_Y = 480;
  var GRAVITY = 2000;
  var MOVE = 208, ACCEL = 1700, FRICTION = 1900;
  var JUMP_V = -642, MAX_FALL = 900;
  var WORLD_W = 6600;

  /* ---------- state ---------- */
  var state = "intro";           // intro | play | paused | reader
  var cam = { x: 0, y: 0 };
  var shake = 0;
  var time = 0;
  var coins = 0;
  var announcerT = 0;

  /* ---------- theme ---------- */
  function themeName() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }
  var THEME = themeName();
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
    var meta = document.getElementById("metaThemeColor");
    if (meta) meta.setAttribute("content", t === "light" ? "#efe7d7" : "#0b0b0a");
    window.dispatchEvent(new CustomEvent("portfolio:theme", { detail: { theme: t } }));
  }
  window.addEventListener("portfolio:theme", function (e) {
    if (e && e.detail && e.detail.theme) THEME = e.detail.theme;
  });

  /* ---------- audio (WebAudio, synthesised) ---------- */
  var actx = null, soundOn = true, master = null;
  function initAudio() {
    if (actx) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { soundOn = false; return; }
      actx = new AC();
      master = actx.createGain();
      master.gain.value = 0.5;
      master.connect(actx.destination);
    } catch (e) { soundOn = false; }
  }
  function tone(freq, dur, type, vol, slideTo) {
    if (!soundOn || !actx) return;
    var o = actx.createOscillator(), g = actx.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, actx.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, actx.currentTime + dur);
    g.gain.setValueAtTime(0.0001, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(vol || 0.06, actx.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.connect(g); g.connect(master);
    o.start(); o.stop(actx.currentTime + dur + 0.02);
  }
  function sfx(name) {
    switch (name) {
      case "jump": tone(520, 0.14, "square", 0.05, 780); break;
      case "land": tone(180, 0.08, "sine", 0.05, 120); break;
      case "coin": tone(880, 0.09, "triangle", 0.06); setTimeout(function () { tone(1320, 0.12, "triangle", 0.05); }, 70); break;
      case "open": tone(660, 0.1, "triangle", 0.05, 990); break;
      case "close": tone(440, 0.1, "triangle", 0.04, 300); break;
      case "stomp": tone(300, 0.12, "square", 0.06, 150); break;
      case "hurt": tone(200, 0.2, "sawtooth", 0.05, 90); break;
      case "win": [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { tone(f, 0.22, "triangle", 0.06); }, i * 130); }); break;
    }
  }

  /* ---------- world ---------- */
  var solids = [], markers = [], coinList = [], enemies = [], decos = [], starsfar = [];
  function addSolid(x, y, w, h, kind) { solids.push({ x: x, y: y, w: w, h: h, kind: kind || "stone" }); }
  function addMarker(x, y, w, h, label, action, kind) {
    markers.push({ x: x, y: y, w: w, h: h, label: label, action: action, kind: kind || "portal" });
  }
  function addCoin(x, y) { coinList.push({ x: x, y: y, taken: false, phase: Math.random() * 6.28 }); }
  function addEnemy(minX, maxX, y) {
    var w = 30, h = 26;
    enemies.push({ x: minX, y: y - h, w: w, h: h, minX: minX, maxX: maxX, dir: 1, speed: 40, alive: true, squash: 0 });
  }

  function buildWorld() {
    /* ground segments (with two gaps) */
    addSolid(0, GROUND_Y, 1500, 64, "ground");
    addSolid(1580, GROUND_Y, 1500, 64, "ground");
    addSolid(3160, GROUND_Y, 3440, 64, "ground");

    /* floating platforms */
    addSolid(640, 384, 128, 20, "ledge");
    addSolid(840, 318, 128, 20, "ledge");
    addSolid(1620, 372, 150, 20, "ledge");
    addSolid(2020, 336, 120, 20, "ledge");
    addSolid(2600, 372, 130, 20, "ledge");
    addSolid(3050, 356, 110, 20, "ledge");
    addSolid(3290, 386, 140, 20, "ledge");
    addSolid(3760, 340, 130, 20, "ledge");
    addSolid(4180, 386, 150, 20, "ledge");
    addSolid(4760, 340, 130, 20, "ledge");
    addSolid(5320, 372, 150, 20, "ledge");

    /* ── Segment 1 — About ── */
    addMarker(560, GROUND_Y - 60, 34, 60, "About Me", "about", "sign");

    /* ── Segment 2 — Projects (a portal per build) ── */
    var px0 = 1720;
    DATA.projects.forEach(function (p, i) {
      var mx = px0 + i * 246;
      addMarker(mx, GROUND_Y - 74, 40, 74, p.title, "proj:" + p.id, "portal");
    });

    /* ── Segment 3 — Skills ── */
    var sx0 = 3420;
    DATA.skills.forEach(function (s, i) {
      addMarker(sx0 + i * 300, GROUND_Y - 78, 46, 78, s.group, "skill:" + i, "shrine");
    });

    /* ── Segment 4 — Journey ── */
    var jx0 = 4760;
    DATA.journey.forEach(function (j, i) {
      addMarker(jx0 + i * 400, GROUND_Y - 96, 40, 96, j.title, "journey:" + i, "monolith");
    });

    /* ── Segment 5 — Contact banner ── */
    addMarker(6220, GROUND_Y - 150, 46, 150, "Contact", "contact", "banner");

    /* relics */
    [[300, 300], [688, 340], [888, 274], [1100, 420], [1668, 328], [2068, 292],
     [2450, 430], [2648, 328], [3098, 312], [3348, 342], [3800, 296], [4230, 342],
     [4700, 430], [4808, 296], [5368, 328], [5900, 420]].forEach(function (c) { addCoin(c[0], c[1]); });

    /* enemies */
    addEnemy(1900, 2400, GROUND_Y);
    addEnemy(2500, 3040, GROUND_Y);
    addEnemy(3400, 3900, GROUND_Y);
    addEnemy(4400, 4900, GROUND_Y);
    addEnemy(5100, 5600, GROUND_Y);

    /* ambient stars */
    for (var i = 0; i < 70; i++) {
      starsfar.push({ x: Math.random() * WORLD_W, y: Math.random() * 300, r: Math.random() * 1.4 + 0.4, p: Math.random() * 6.28 });
    }

    hudCoinsTotal.textContent = "/" + coinList.length;
  }

  /* ---------- player ---------- */
  var player = { x: 120, y: GROUND_Y - 40, w: 24, h: 38, vx: 0, vy: 0, onGround: false, face: 1, coyote: 0, buffer: 0, anim: 0, blink: 0, safe: { x: 120, y: GROUND_Y - 40 } };
  var input = { left: false, right: false, jump: false, interact: false };
  var tLeft = false, tRight = false, tJump = false;

  function resetPlayer() {
    player.x = player.safe.x; player.y = player.safe.y;
    player.vx = 0; player.vy = 0;
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function moveAndCollide(dt) {
    /* horizontal */
    player.x += player.vx * dt;
    for (var i = 0; i < solids.length; i++) {
      var s = solids[i];
      if (aabb(player, s)) {
        if (player.vx > 0) player.x = s.x - player.w;
        else if (player.vx < 0) player.x = s.x + s.w;
        player.vx = 0;
      }
    }
    /* vertical */
    player.onGround = false;
    player.y += player.vy * dt;
    for (var j = 0; j < solids.length; j++) {
      var t = solids[j];
      if (aabb(player, t)) {
        if (player.vy > 0) {
          player.y = t.y - player.h;
          if (!player.onGround) { player.onGround = true; if (player.vy > 300) sfx("land"); }
          player.vy = 0;
        } else if (player.vy < 0) {
          player.y = t.y + t.h; player.vy = 0;
        }
      }
    }
    if (player.x < 0) { player.x = 0; player.vx = 0; }
    if (player.x + player.w > WORLD_W) player.x = WORLD_W - player.w;
  }

  /* ---------- update ---------- */
  var activeMarker = null;

  function update(dt) {
    time += dt;
    if (announcerT > 0) announcerT -= dt;

    var gLeft = input.left || tLeft;
    var gRight = input.right || tRight;
    var wantJump = input.jump || tJump;

    /* horizontal accel */
    if (gLeft) { player.vx -= ACCEL * dt; player.face = -1; }
    if (gRight) { player.vx += ACCEL * dt; player.face = 1; }
    if (!gLeft && !gRight) {
      if (player.vx > 0) player.vx = Math.max(0, player.vx - FRICTION * dt);
      else if (player.vx < 0) player.vx = Math.min(0, player.vx + FRICTION * dt);
    }
    player.vx = Math.max(-MOVE, Math.min(MOVE, player.vx));

    /* coyote + jump buffer */
    if (player.onGround) player.coyote = 0.1; else player.coyote = Math.max(0, player.coyote - dt);
    if (wantJump) player.buffer = 0.12; else player.buffer = Math.max(0, player.buffer - dt);
    if (player.buffer > 0 && player.coyote > 0) {
      player.vy = JUMP_V; player.buffer = 0; player.coyote = 0; sfx("jump");
    }
    /* variable jump height */
    if (player.vy < 0 && !wantJump) player.vy += GRAVITY * 1.4 * dt;
    else player.vy += GRAVITY * dt;
    if (player.vy > MAX_FALL) player.vy = MAX_FALL;

    moveAndCollide(dt);

    /* animation + facing */
    player.anim += Math.abs(player.vx) * dt * 0.045;
    if (player.blink > 0) player.blink -= dt;

    /* remember a safe spot on solid ground */
    if (player.onGround) {
      var under = false;
      for (var k = 0; k < solids.length; k++) {
        var s2 = solids[k];
        if (s2.kind === "ground" && Math.abs((s2.y) - (player.y + player.h)) < 3 &&
            player.x + player.w > s2.x + 20 && player.x < s2.x + s2.w - 20) { under = true; break; }
      }
      if (under) { player.safe.x = player.x; player.safe.y = player.y - 1; }
    }
    /* fall out of world → respawn */
    if (player.y > H + 120) { resetPlayer(); shake = 6; sfx("hurt"); }

    /* relics */
    for (var c = 0; c < coinList.length; c++) {
      var co = coinList[c];
      if (co.taken) continue;
      var dx = (player.x + player.w / 2) - co.x, dy = (player.y + player.h / 2) - co.y;
      if (dx * dx + dy * dy < 26 * 26) {
        co.taken = true; coins++; hudCoins.textContent = coins; sfx("coin");
        live.textContent = coins + " of " + coinList.length + " relics collected";
      }
    }

    /* enemies */
    for (var e = 0; e < enemies.length; e++) {
      var en = enemies[e];
      if (!en.alive) { if (en.squash > 0) en.squash -= dt; continue; }
      en.x += en.dir * en.speed * dt;
      if (en.x <= en.minX) { en.x = en.minX; en.dir = 1; }
      if (en.x + en.w >= en.maxX) { en.x = en.maxX - en.w; en.dir = -1; }
      if (player.blink <= 0 && aabb(player, en)) {
        var fromAbove = (player.y + player.h) - en.y < 18 && player.vy > 60;
        if (fromAbove) {
          en.alive = false; en.squash = 0.4; player.vy = -420;
          shake = 4; sfx("stomp");
          live.textContent = "Enemy cleared";
        } else {
          player.vx = (player.x + player.w / 2 < en.x + en.w / 2 ? -1 : 1) * 150;
          player.vy = -320; player.blink = 0.9; shake = 5; sfx("hurt");
        }
      }
    }

    /* active marker */
    var probe = { x: player.x - 14, y: player.y - 8, w: player.w + 28, h: player.h + 20 };
    activeMarker = null;
    for (var m = 0; m < markers.length; m++) {
      if (aabb(probe, markers[m])) { activeMarker = markers[m]; break; }
    }
    if (activeMarker) {
      if (prompt.hidden) { prompt.hidden = false; }
      promptText.textContent = activeMarker.label;
    } else if (!prompt.hidden) {
      prompt.hidden = true;
    }
    if (input.interact) { input.interact = false; if (activeMarker) openMarker(activeMarker); }

    /* camera */
    var targetX = player.x + player.w / 2 - W * 0.42;
    cam.x += (targetX - cam.x) * Math.min(1, dt * 7);
    cam.x = Math.max(0, Math.min(WORLD_W - W, cam.x));
    if (shake > 0) shake = Math.max(0, shake - dt * 24);

    /* zone label */
    hudZone.textContent = zoneName(player.x + player.w / 2);
  }

  function zoneName(x) {
    if (x < 1120) return "The Outer Gate";
    if (x < 3300) return "Hall of Builds";
    if (x < 4600) return "Arsenal";
    if (x < 5800) return "The Long Road";
    return "The Banner";
  }

  /* ---------- render ---------- */
  function pal() {
    return THEME === "light" ? {
      skyTop: "#f7eed6", skyBot: "#e5d3aa", far: "#ddc99e", mid: "#cbb588",
      ground: "#cdb98d", groundTop: "#e8d9b6", line: "#a58f5f",
      stone: "#c4ad80", stoneTop: "#e0d2ab",
      text: "#241f18", fog: "rgba(120,90,40,.05)", glow: "rgba(150,110,50,.18)",
      star: "rgba(120,90,40,.25)", enemy: "#8a6f45", enemyEye: "#5a3d18", player: "#6f5a34", playerTrim: "#f4e9d0"
    } : {
      skyTop: "#080a0c", skyBot: "#1d1b15", far: "#131109", mid: "#221d14",
      ground: "#2a251c", groundTop: "#3d3424", line: "#151109",
      stone: "#302a1f", stoneTop: "#453a29",
      text: "#e9e2d6", fog: "rgba(197,161,106,.06)", glow: "rgba(197,161,106,.22)",
      star: "rgba(233,226,214,.7)", enemy: "#3a3123", enemyEye: "#c5a16a", player: "#a77c48", playerTrim: "#e9e2d6"
    };
  }

  function rr(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawSky(p) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p.skyTop); g.addColorStop(1, p.skyBot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    /* stars (night) */
    if (THEME !== "light") {
      for (var i = 0; i < starsfar.length; i++) {
        var s = starsfar[i];
        var sx = s.x - cam.x * 0.15; if (sx < -5 || sx > W + 5) continue;
        var tw = 0.5 + 0.5 * Math.sin(time * 2 + s.p);
        ctx.globalAlpha = 0.25 + tw * 0.55;
        ctx.fillStyle = p.star;
        ctx.fillRect(sx, s.y, s.r, s.r);
      }
      ctx.globalAlpha = 1;
    }
    /* warm horizon glow */
    var hg = ctx.createRadialGradient(W * 0.5, H * 0.55, 10, W * 0.5, H * 0.55, H * 0.9);
    hg.addColorStop(0, p.glow); hg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
  }

  function drawParallax(p) {
    /* far temple skyline */
    ctx.fillStyle = p.far;
    var ox = -cam.x * 0.2;
    for (var i = -1; i < 10; i++) {
      var bx = ox + i * 420;
      ctx.fillRect(bx, 300, 200, 180);
      ctx.fillRect(bx + 240, 340, 120, 140);
      ctx.beginPath(); ctx.moveTo(bx + 100, 250); ctx.lineTo(bx + 150, 300); ctx.lineTo(bx + 50, 300); ctx.closePath(); ctx.fill();
    }
    /* mid arches */
    ctx.fillStyle = p.mid;
    var mx = -cam.x * 0.45;
    for (var j = -1; j < 14; j++) {
      var ax = mx + j * 300;
      ctx.fillRect(ax, 330, 26, 150);
      ctx.fillRect(ax + 90, 330, 26, 150);
      ctx.beginPath(); ctx.moveTo(ax + 13, 300); ctx.lineTo(ax + 103, 300); ctx.lineTo(ax + 58, 262); ctx.closePath();
      ctx.fill();
    }
  }

  function drawSolids(p) {
    for (var i = 0; i < solids.length; i++) {
      var s = solids[i];
      var x = s.x - cam.x, y = s.y;
      if (x + s.w < -40 || x > W + 40) continue;
      ctx.fillStyle = s.kind === "ground" ? p.ground : p.stone;
      ctx.fillRect(x, y, s.w, s.h);
      ctx.fillStyle = s.kind === "ground" ? p.groundTop : p.stoneTop;
      ctx.fillRect(x, y, s.w, 6);
      ctx.strokeStyle = p.line; ctx.lineWidth = 1;
      if (s.kind === "ground") {
        for (var bx = 0; bx < s.w; bx += 48) {
          ctx.beginPath(); ctx.moveTo(x + bx, y + 6); ctx.lineTo(x + bx, y + s.h); ctx.stroke();
        }
        ctx.beginPath(); ctx.moveTo(x, y + 34); ctx.lineTo(x + s.w, y + 34); ctx.stroke();
      } else {
        ctx.strokeRect(x + 0.5, y + 0.5, s.w - 1, s.h - 1);
      }
    }
  }

  function drawDecos(p) {
    ctx.fillStyle = p.line;
    /* sparse pillars along the road */
    for (var i = 0; i < markers.length; i++) { /* keep parity; nothing here */ }
  }

  function drawMarkers(p) {
    for (var i = 0; i < markers.length; i++) {
      var m = markers[i];
      var x = m.x - cam.x;
      if (x + m.w < -60 || x > W + 60) continue;
      var isActive = m === activeMarker;
      var cx = x + m.w / 2, base = m.y + m.h;

      if (m.kind === "sign") {
        ctx.fillStyle = "#5a4326"; ctx.fillRect(cx - 3, m.y + 20, 6, m.h - 20);
        ctx.fillStyle = "#7a5c31"; rr(x, m.y, m.w, 22, 3); ctx.fill();
        ctx.fillStyle = p.glow; ctx.fillRect(x + 2, m.y + 2, m.w - 4, 4);
      } else if (m.kind === "banner") {
        ctx.fillStyle = "#5a4326"; ctx.fillRect(cx - 4, m.y, 8, m.h);
        ctx.fillStyle = "#a77c48";
        ctx.beginPath(); ctx.moveTo(cx + 3, m.y + 6); ctx.lineTo(cx + 44, m.y + 26 + Math.sin(time * 3) * 3);
        ctx.lineTo(cx + 3, m.y + 52); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#c5a16a"; ctx.beginPath(); ctx.arc(cx, m.y - 2, 5, 0, 6.28); ctx.fill();
      } else if (m.kind === "monolith") {
        ctx.fillStyle = p.stone; rr(x, m.y, m.w, m.h, 4); ctx.fill();
        ctx.fillStyle = p.stoneTop; ctx.fillRect(x, m.y, m.w, 5);
      } else if (m.kind === "shrine") {
        ctx.fillStyle = p.stone; ctx.fillRect(x + 6, m.y + 14, m.w - 12, m.h - 14);
        ctx.fillStyle = "#a77c48";
        ctx.beginPath(); ctx.moveTo(x, m.y + 16); ctx.lineTo(cx, m.y - 4); ctx.lineTo(x + m.w, m.y + 16); ctx.closePath(); ctx.fill();
      } else {
        /* portal pedestal */
        ctx.fillStyle = p.stone; rr(x + 4, m.y + 42, m.w - 8, m.h - 42, 4); ctx.fill();
        ctx.fillStyle = p.stoneTop; ctx.fillRect(x + 4, m.y + 42, m.w - 8, 4);
      }

      /* floating portal gem */
      var floatY = m.y + 6 + Math.sin(time * 2 + i) * 3;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = THEME === "light" ? "#b98b3f" : "#c5a16a";
      ctx.beginPath();
      ctx.moveTo(cx, floatY - 9); ctx.lineTo(cx + 9, floatY); ctx.lineTo(cx, floatY + 9); ctx.lineTo(cx - 9, floatY);
      ctx.closePath(); ctx.fill();
      ctx.restore();

      if (isActive) {
        ctx.strokeStyle = "#c5a16a"; ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time * 6);
        rr(x - 6, m.y - 10, m.w + 12, m.h + 12, 6); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  function drawCoins(p) {
    for (var i = 0; i < coinList.length; i++) {
      var c = coinList[i];
      if (c.taken) continue;
      var x = c.x - cam.x;
      if (x < -30 || x > W + 30) continue;
      var y = c.y + Math.sin(time * 3 + c.phase) * 3;
      var sc = 0.6 + 0.4 * Math.abs(Math.sin(time * 2 + c.phase));
      ctx.save();
      ctx.translate(x, y); ctx.scale(sc, 1);
      ctx.fillStyle = "#c5a16a";
      ctx.beginPath();
      ctx.moveTo(0, -9); ctx.lineTo(7, 0); ctx.lineTo(0, 9); ctx.lineTo(-7, 0);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(-1.5, -5, 3, 10);
      ctx.restore();
    }
  }

  function drawEnemies(p) {
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.alive && e.squash <= 0) continue;
      var x = e.x - cam.x;
      if (x + e.w < -40 || x > W + 40) continue;
      var h = e.alive ? e.h : 8;
      var y = e.y + (e.h - h);
      ctx.fillStyle = p.enemy;
      rr(x, y, e.w, h, 6); ctx.fill();
      if (e.alive) {
        ctx.fillStyle = p.enemyEye;
        ctx.fillRect(x + 6, y + 8, 5, 5);
        ctx.fillRect(x + e.w - 11, y + 8, 5, 5);
        ctx.fillStyle = p.enemy;
        ctx.fillRect(x + 3, y + e.h, 6, 5);
        ctx.fillRect(x + e.w - 9, y + e.h, 6, 5);
      }
    }
  }

  function drawPlayer(p) {
    var x = player.x - cam.x, y = player.y;
    if (player.blink > 0 && Math.floor(player.blink * 20) % 2 === 0) return;

    /* shadow */
    ctx.globalAlpha = 0.25; ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.ellipse(x + player.w / 2, GROUND_Y + 2, 13, 4, 0, 0, 6.28); ctx.fill();
    ctx.globalAlpha = 1;

    var legPhase = Math.sin(player.anim);
    var bob = player.onGround ? Math.abs(Math.sin(player.anim)) * 1.5 : 0;
    y -= bob;

    /* legs */
    ctx.fillStyle = "#2a2118";
    var legSwing = player.onGround ? legPhase * 5 : 3;
    ctx.fillRect(x + 4, y + 26, 6, 12 + legSwing);
    ctx.fillRect(x + player.w - 10, y + 26, 6, 12 - legSwing);
    /* body / tunic */
    ctx.fillStyle = p.player;
    rr(x + 2, y + 13, player.w - 4, 15, 3); ctx.fill();
    /* belt */
    ctx.fillStyle = "#c5a16a";
    ctx.fillRect(x + 2, y + 22, player.w - 4, 3);
    /* head */
    ctx.fillStyle = "#e8c9a0";
    rr(x + 5, y + 1, player.w - 10, 13, 4); ctx.fill();
    /* hood/trim */
    ctx.fillStyle = p.playerTrim;
    ctx.fillRect(x + 5, y, player.w - 10, 4);
    /* eye */
    ctx.fillStyle = "#241f18";
    var eyeX = player.face > 0 ? x + player.w - 12 : x + 8;
    ctx.fillRect(eyeX, y + 6, 3, 3);
    /* arms */
    ctx.fillStyle = p.player;
    var armSwing = player.onGround ? -legPhase * 4 : -4;
    ctx.fillRect(player.face > 0 ? x + player.w - 4 : x, y + 15 + armSwing, 4, 8);
    ctx.fillRect(player.face > 0 ? x : x + player.w - 4, y + 15 - armSwing, 4, 8);
  }

  function drawVignette() {
    var g = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H * 0.95);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, THEME === "light" ? "rgba(90,70,40,.18)" : "rgba(0,0,0,.55)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  function render() {
    var p = pal();
    ctx.save();
    var shx = shake > 0 ? (Math.random() - 0.5) * shake : 0;
    var shy = shake > 0 ? (Math.random() - 0.5) * shake : 0;
    ctx.translate(shx, shy);

    drawSky(p);
    drawParallax(p);
    drawSolids(p);
    drawMarkers(p);
    drawCoins(p);
    drawEnemies(p);
    drawPlayer(p);
    drawVignette();

    ctx.restore();
  }

  /* ---------- content panels ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function linksHtml(links) {
    var out = '<div class="gp-links">';
    links.forEach(function (l) {
      out += '<a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer" class="' + (l.primary ? "primary" : "") + '">' + esc(l.label) + " →</a>";
    });
    return out + "</div>";
  }

  function panelProject(p) {
    if (!p) return "<p>Project not found.</p>";
    var h = '<div class="gp-hero"><span class="gp-cat">' + esc(p.category) + " · " + esc(p.year) + "</span>";
    h += '<h3 id="gpTitle">' + esc(p.title) + "</h3>";
    if (p.role) h += '<p class="gp-role">' + esc(p.role) + "</p>";
    h += '<span class="gp-badge">' + esc(p.status) + "</span></div><div class=\"gp-content\">";
    h += "<p>" + esc(p.description) + "</p>";
    var d = p.detail || {};
    if (d.problem) h += "<h4>The Problem</h4><p>" + esc(d.problem) + "</p>";
    if (d.approach) h += "<h4>The Approach</h4><p>" + esc(d.approach) + "</p>";
    if (d.contribution) h += "<h4>My Contribution</h4><p>" + esc(d.contribution) + "</p>";
    if (d.challenges && d.challenges.length) {
      h += "<h4>Notable Challenges</h4><ul>";
      d.challenges.forEach(function (c) { h += "<li>" + esc(c) + "</li>"; });
      h += "</ul>";
    }
    if (p.tech && p.tech.length) {
      h += '<h4>Stack</h4><div class="gp-tech">';
      p.tech.forEach(function (t) { h += "<span>" + esc(t) + "</span>"; });
      h += "</div>";
    }
    if (p.links && p.links.length) h += linksHtml(p.links);
    return h + "</div>";
  }

  function panelAbout() {
    return '<div class="gp-hero"><span class="gp-cat">01 — About</span>' +
      '<h3 id="gpTitle">Curious by nature. Builder by instinct.</h3>' +
      '<p class="gp-role">Monish Dhanvantar Sambangi — Game Developer &amp; Software Engineer</p></div>' +
      '<div class="gp-content">' +
      "<p>I learn by building. Every project starts as a question — how does this work, and can I make it real?</p>" +
      "<p>I'm a B.Tech Cyber Security student at <strong>Baba Institute of Technology and Sciences</strong> (2025–2029), and an emerging game developer. My strongest work lives in gameplay systems — from a browser-based 3D arena shooter with wave modifiers and generative audio, to desktop games written from scratch in Java.</p>" +
      "<p>Games are my primary craft, but the curiosity doesn't stop there. I build web applications, explore AI and data, and approach security problems with an engineer's mindset. Different disciplines, one instinct: turn ideas into working systems.</p>" +
      "<p>I care about the parts nobody sees — the game loop, the collision logic, the architecture decisions — because that's what makes the parts everybody sees feel right.</p>" +
      '<h4>At a glance</h4><ul>' +
      "<li><strong>Currently</strong> — B.Tech, Cyber Security &amp; Engineering</li>" +
      "<li><strong>Building</strong> — Games &amp; creative software (and this playable portfolio)</li>" +
      "<li><strong>Based in</strong> — India</li></ul>" +
      "</div>";
  }

  function panelSkill(i) {
    var s = DATA.skills[i];
    if (!s) return "<p>Not found.</p>";
    var levelName = { used: "Used in shipped work", familiar: "Familiar", exploring: "Exploring" };
    var h = '<div class="gp-hero"><span class="gp-cat">03 — Skill Shrine</span>' +
      '<h3 id="gpTitle">' + esc(s.group) + "</h3>" +
      '<p class="gp-role">' + esc(s.note || "") + "</p></div><div class=\"gp-content\">";
    h += "<h4>Abilities</h4><ul>";
    s.items.forEach(function (it) {
      h += "<li><strong>" + esc(it.name) + "</strong> — " + esc(levelName[it.level] || it.level) + "</li>";
    });
    return h + "</ul></div>";
  }

  function panelJourney(i) {
    var h = '<div class="gp-hero"><span class="gp-cat">05 — The Journey</span><h3 id="gpTitle">The Path So Far</h3></div><div class="gp-content"><div class="gp-timeline">';
    DATA.journey.forEach(function (j, idx) {
      h += '<div class="gp-tl"' + (idx === i ? ' style="background:rgba(197,161,106,.06);border-radius:6px"' : "") + ">";
      h += '<span class="d">' + esc(j.date) + "</span><h5>" + esc(j.title) + "</h5>";
      if (j.org) h += '<p style="font-size:.82rem;margin:0 0 .3rem">' + esc(j.org) + "</p>";
      h += "<p>" + esc(j.text) + "</p></div>";
    });
    return h + "</div></div>";
  }

  function panelProjectsIntro() {
    var h = '<div class="gp-hero"><span class="gp-cat">02 — Selected Builds</span><h3 id="gpTitle">Selected Builds</h3><p class="gp-role">Six relics line this hall — each one a real project.</p></div><div class="gp-content"><div class="gp-grid">';
    DATA.projects.forEach(function (p) {
      h += '<div class="gp-card-mini"><h5>' + esc(p.title) + "</h5><p>" + esc(p.category) + " · " + esc(p.year) + "</p>";
      p.tech.slice(0, 3).forEach(function (t) { h += '<span class="gp-tag">' + esc(t) + "</span>"; });
      h += "</div>";
    });
    return h + "</div><p style=\"margin-top:1.2rem\">Walk up to a pedestal and press <kbd>E</kbd> to open a full case study.</p></div>";
  }

  function panelContact() {
    return '<div class="gp-hero"><span class="gp-cat">06 — Contact</span>' +
      '<h3 id="gpTitle">You reached the banner. Let\u2019s build something.</h3>' +
      '<p class="gp-role">Interested in game development, creative software, AI, and ambitious projects.</p></div>' +
      '<div class="gp-content">' +
      "<p>The whole world you just walked through is one of my projects. If you made it this far, we should talk.</p>" +
      '<div class="gp-links">' +
      '<a href="mailto:monishdhanvantar20@gmail.com" class="primary">Email me →</a>' +
      '<a href="https://github.com/mdhanvantar-web" target="_blank" rel="noopener noreferrer">GitHub</a>' +
      '<a href="https://www.linkedin.com/in/monish-dhanvantar-sambangi-954397377/" target="_blank" rel="noopener noreferrer">LinkedIn</a>' +
      "</div>" +
      '<h4>Reach</h4><ul>' +
      "<li><strong>Email</strong> — monishdhanvantar20@gmail.com</li>" +
      '<li><strong>GitHub</strong> — mdhanvantar-web</li>' +
      '<li><strong>Resume</strong> — none public yet; my GitHub is the most accurate record. Reach out and I\u2019ll send one.</li>' +
      "</ul></div>";
  }

  function openMarker(m) {
    if (!m) return;
    var html = "";
    var a = m.action;
    if (a === "about") html = panelAbout();
    else if (a === "contact") html = panelContact();
    else if (a.indexOf("proj:") === 0) {
      var id = a.slice(5), p = null;
      DATA.projects.forEach(function (x) { if (x.id === id) p = x; });
      html = panelProject(p);
    } else if (a.indexOf("skill:") === 0) html = panelSkill(parseInt(a.slice(6), 10));
    else if (a.indexOf("journey:") === 0) html = panelJourney(parseInt(a.slice(8), 10));

    panelBody.innerHTML = html;
    panel.hidden = false;
    state = "paused";
    sfx("open");
    live.textContent = m.label + " opened";
    if (a === "contact") sfx("win");
    var close = panel.querySelector(".gp-close");
    if (close) close.focus();
  }

  function closePanel() {
    if (panel.hidden) return;
    panel.hidden = true;
    panelBody.innerHTML = "";
    sfx("close");
    if (state === "paused") state = "play";
  }

  /* ---------- modes ---------- */
  function enterReadMode() {
    state = "reader";
    try { localStorage.setItem("portfolio-mode", "reader"); } catch (e) {}
    document.body.classList.remove("mode-game");
    document.body.classList.add("mode-reader");
    if (reader) { reader.hidden = false; }
    if (gameRoot) gameRoot.setAttribute("aria-hidden", "true");
    if (prompt) prompt.hidden = true;
    ensureBackButton();
    setBackButtonVisible(true);
    window.dispatchEvent(new Event("resize"));
    setTimeout(function () {
      var main = document.getElementById("main");
      if (main) { try { main.scrollIntoView(); } catch (e) {} }
      var t = document.getElementById("themeToggle");
      if (t) t.focus();
    }, 60);
    live.textContent = "Read mode. Full text portfolio.";
  }

  function enterGameMode() {
    state = (intro && !intro.classList.contains("hidden")) ? "intro" : "play";
    try { localStorage.setItem("portfolio-mode", "game"); } catch (e) {}
    document.body.classList.remove("mode-reader");
    document.body.classList.add("mode-game");
    if (reader) reader.hidden = true;
    if (gameRoot) gameRoot.removeAttribute("aria-hidden");
    setBackButtonVisible(false);
    canvas.focus();
    live.textContent = "Game mode.";
  }

  /* back-to-game floating button (read mode only) */
  var backBtn = null;
  function ensureBackButton() {
    if (backBtn) return;
    backBtn = document.createElement("button");
    backBtn.id = "backToGame";
    backBtn.type = "button";
    backBtn.innerHTML = "▶&nbsp; Enter Game";
    backBtn.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:9999;" +
      "font:600 12px/1 var(--mono,monospace);letter-spacing:.12em;text-transform:uppercase;" +
      "padding:14px 20px;border-radius:999px;border:1px solid rgba(197,161,106,.5);cursor:pointer;" +
      "background:linear-gradient(135deg,#c5a16a,#a77c48);color:#0b0b0a;box-shadow:0 12px 30px rgba(0,0,0,.4)";
    backBtn.addEventListener("click", enterGameMode);
    document.body.appendChild(backBtn);
  }
  function setBackButtonVisible(v) { if (backBtn) backBtn.style.display = v ? "block" : "none"; }

  /* ---------- input ---------- */
  window.addEventListener("keydown", function (e) {
    if (state === "reader") return;
    var k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") input.left = true;
    else if (k === "ArrowRight" || k === "d" || k === "D") input.right = true;
    else if (k === " " || k === "Spacebar" || k === "ArrowUp" || k === "w" || k === "W") { input.jump = true; if (!e.repeat) player.buffer = 0.12; }
    else if (k === "e" || k === "E" || k === "Enter") input.interact = true;
    else if (k === "m" || k === "M") { enterReadMode(); return; }
    else if (k === "Escape") { if (!panel.hidden) closePanel(); return; }
    /* prevent page scroll while playing */
    if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "Spacebar"].indexOf(k) !== -1) e.preventDefault();
    if (state === "intro" && (k === " " || k === "Enter")) { startPlay(); }
  }, { passive: false });

  window.addEventListener("keyup", function (e) {
    var k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") input.left = false;
    else if (k === "ArrowRight" || k === "d" || k === "D") input.right = false;
    else if (k === " " || k === "Spacebar" || k === "ArrowUp" || k === "w" || k === "W") input.jump = false;
  });

  /* touch */
  function bindTouch() {
    var btns = touchWrap ? touchWrap.querySelectorAll("[data-move],[data-action]") : [];
    Array.prototype.forEach.call(btns, function (b) {
      var mv = b.getAttribute("data-move"), ac = b.getAttribute("data-action");
      var down = function (ev) { ev.preventDefault(); if (mv === "left") tLeft = true; if (mv === "right") tRight = true; if (ac === "jump") { tJump = true; player.buffer = 0.12; } };
      var up = function (ev) { if (ev) ev.preventDefault(); if (mv === "left") tLeft = false; if (mv === "right") tRight = false; if (ac === "jump") tJump = false; };
      b.addEventListener("pointerdown", down);
      b.addEventListener("pointerup", up);
      b.addEventListener("pointerleave", up);
      b.addEventListener("pointercancel", up);
    });
  }

  /* ---------- HUD controls ---------- */
  if (hudSound) hudSound.addEventListener("click", function () {
    soundOn = !soundOn;
    if (soundOn) { initAudio(); tone(880, 0.1, "triangle", 0.05); }
    hudSound.classList.toggle("is-off", !soundOn);
    hudSound.textContent = soundOn ? "♪" : "✕";
    hudSound.setAttribute("aria-label", soundOn ? "Mute sound" : "Unmute sound");
  });
  if (hudTheme) {
    hudTheme.textContent = THEME === "light" ? "☾" : "☀";
    hudTheme.addEventListener("click", function () {
      var next = themeName() === "light" ? "dark" : "light";
      setTheme(next);
      hudTheme.textContent = next === "light" ? "☾" : "☀";
    });
  }
  if (hudRead) hudRead.addEventListener("click", enterReadMode);
  if (introRead) introRead.addEventListener("click", enterReadMode);
  if (prompt) prompt.addEventListener("click", function () { if (activeMarker) openMarker(activeMarker); });

  Array.prototype.forEach.call(panel ? panel.querySelectorAll("[data-gp-close]") : [], function (el) {
    el.addEventListener("click", closePanel);
  });

  /* ---------- start / loop ---------- */
  function startPlay() {
    initAudio();
    if (intro) intro.classList.add("hidden");
    state = "play";
    if (isTouch()) { touchWrap.classList.add("show"); }
    try { canvas.focus(); } catch (e) {}
    live.textContent = "Game started. Use arrow keys to move, space to jump, E to open.";
  }
  function isTouch() {
    return (("ontouchstart" in window) || navigator.maxTouchPoints > 0) &&
      (window.matchMedia ? window.matchMedia("(pointer: coarse)").matches : true);
  }
  if (playBtn) playBtn.addEventListener("click", startPlay);

  var last = 0;
  function frame(ts) {
    if (!last) last = ts;
    var dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;
    if (state === "play") update(dt);
    else time += dt * (state === "paused" ? 0.25 : 1);
    if (state !== "reader") render();
    requestAnimationFrame(frame);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { input.left = input.right = input.jump = false; }
    last = 0;
  });

  /* ---------- boot ---------- */
  buildWorld();
  bindTouch();
  hudCoinsTotal.textContent = "/" + coinList.length;

  var savedMode = null;
  try { savedMode = localStorage.getItem("portfolio-mode"); } catch (e) {}
  if (savedMode === "reader") {
    enterReadMode();
  } else {
    document.body.classList.add("mode-game");
  }
  ensureBackButton();
  setBackButtonVisible(state === "reader");
  requestAnimationFrame(frame);

  /* minimal introspection hook (used by automated tests; harmless in production) */
  window.__portfolioGame = {
    state: function () { return state; },
    player: function () { return { x: player.x, y: player.y, vx: player.vx, vy: player.vy, onGround: player.onGround }; },
    coins: function () { return { got: coins, total: coinList.length }; },
    markers: function () { return markers.map(function (m) { return { label: m.label, action: m.action, kind: m.kind, x: m.x }; }); },
    zones: function () { return WORLD_W; },
    open: function (i) { openMarker(markers[i]); },
    close: closePanel,
    toReader: enterReadMode,
    toGame: enterGameMode
  };
})();
