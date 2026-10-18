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

  /* ---------- sky — the game keeps its own bright, classic palette ---------- */
  var skyMode = "day";   // "day" (classic bright) | "dusk" (sunset)
  var clouds = [];

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
  var solids = [], markers = [], coinList = [], enemies = [], deco = [];
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

    /* clouds (parallax) */
    clouds = [];
    for (var ci = 0; ci < 30; ci++) {
      clouds.push({
        x: Math.random() * WORLD_W,
        y: 30 + Math.random() * 190,
        s: 0.75 + Math.random() * 0.8,
        p: Math.random() * 6.28
      });
    }

    /* bushes on the ground */
    var bi = 0;
    for (var bx = 120; bx < WORLD_W - 200; bx += 210) {
      if (bx > 1500 && bx < 1600) continue;
      if (bx > 3060 && bx < 3180) continue;
      deco.push({ type: "bush", x: bx, s: 0.8 + (bi % 3) * 0.25 });
      bi++;
    }

    /* classic extras: pipes, ? blocks and a brick row */
    addPipe(980, 64);
    addPipe(3300, 74);
    addPipe(5060, 64);
    addQBlock(1150, 352); addQBlock(1182, 352); addQBlock(1214, 352);
    addQBlock(4380, 352); addQBlock(4412, 352); addQBlock(4444, 352);
    addSolid(2050, 352, 32, 32, "brick");
    addSolid(2082, 352, 32, 32, "brick");
    addSolid(2114, 352, 32, 32, "brick");

    hudCoinsTotal.textContent = "/" + coinList.length;
  }

  function addPipe(x, h) {
    addSolid(x, GROUND_Y - h, 64, h, "pipe");
  }
  function addQBlock(x, y) {
    addSolid(x, y, 32, 32, "qblock");
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
    var p = {
      cloud: "#ffffff", cloudShade: "#d6e8ff", sun: "#fff2b0",
      pipe: "#00a800", pipeLight: "#58d854", pipeDark: "#0a5a0a",
      qblock: "#fac000", qblockDark: "#8a4800", qblockLight: "#fff0a0",
      grass: "#3cb54a", grassDark: "#2a8a36",
      skin: "#f5c29b", shoe: "#5a3210", pupil: "#1a1a1a", eye: "#ffffff"
    };
    if (skyMode === "dusk") {
      p.skyTop = "#f0803c"; p.skyBot = "#fcd080";
      p.far = "#9a5a3a"; p.mid = "#6e8f3a";
      p.ground = "#b04018"; p.groundTop = "#e09848";
      p.brickLine = "#6a2408";
      p.enemy = "#8a5a2a"; p.cap = "#c83028"; p.overalls = "#2f4aa8";
      return p;
    }
    p.skyTop = "#5c94fc"; p.skyBot = "#9ac8ff";
    p.far = "#a8dc6e"; p.mid = "#5fbf3f";
    p.ground = "#c84c0c"; p.groundTop = "#e8a050";
    p.brickLine = "#7a3010";
    p.enemy = "#c8884a"; p.cap = "#e52521"; p.overalls = "#3b5dc9";
    return p;
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

    /* sun */
    ctx.fillStyle = p.sun;
    ctx.beginPath(); ctx.arc(W - 130 - cam.x * 0.05, 74, 36, 0, 6.28); ctx.fill();

    /* clouds */
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      var cx = c.x - cam.x * 0.25;
      if (cx < -150 || cx > W + 150) continue;
      drawCloud(cx, c.y + Math.sin(time * 0.6 + c.p) * 3, c.s, p);
    }
  }

  function drawCloud(x, y, s, p) {
    ctx.fillStyle = p.cloud;
    var lobes = [[0, 0, 20], [20, -10, 26], [46, -4, 22], [66, 2, 18], [30, 8, 24]];
    for (var i = 0; i < lobes.length; i++) {
      var l = lobes[i];
      ctx.beginPath(); ctx.arc(x + l[0] * s, y + l[1] * s, l[2] * s, 0, 6.28); ctx.fill();
    }
    ctx.fillStyle = p.cloudShade;
    ctx.fillRect(x - 4 * s, y + 14 * s, 88 * s, 6 * s);
  }

  function drawParallax(p) {
    /* far rolling hills */
    var fx = -cam.x * 0.25;
    ctx.fillStyle = p.far;
    for (var i = -1; i < 14; i++) {
      var bx = fx + i * 300;
      ctx.beginPath();
      ctx.moveTo(bx - 20, GROUND_Y);
      ctx.quadraticCurveTo(bx + 100, GROUND_Y - 140, bx + 220, GROUND_Y);
      ctx.closePath(); ctx.fill();
    }
    /* mid hills (closer, darker) */
    var mx = -cam.x * 0.45;
    ctx.fillStyle = p.mid;
    for (var j = -1; j < 16; j++) {
      var hx = mx + j * 250;
      ctx.beginPath();
      ctx.moveTo(hx - 20, GROUND_Y);
      ctx.quadraticCurveTo(hx + 80, GROUND_Y - 100, hx + 180, GROUND_Y);
      ctx.closePath(); ctx.fill();
    }
  }

  function drawDecos(p) {
    ctx.fillStyle = p.mid;
    for (var i = 0; i < deco.length; i++) {
      var d = deco[i];
      var x = d.x - cam.x;
      if (x < -130 || x > W + 130) continue;
      var s = d.s;
      ctx.beginPath();
      ctx.arc(x, GROUND_Y - 10 * s, 15 * s, 0, 6.28);
      ctx.arc(x + 22 * s, GROUND_Y - 17 * s, 20 * s, 0, 6.28);
      ctx.arc(x + 44 * s, GROUND_Y - 10 * s, 15 * s, 0, 6.28);
      ctx.fill();
      ctx.fillRect(x - 15 * s, GROUND_Y - 10 * s, 74 * s, 10 * s);
    }
  }

  function drawPipe(x, y, w, h, p) {
    ctx.fillStyle = p.pipe; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = p.pipeLight; ctx.fillRect(x + 6, y, 7, h);
    ctx.fillStyle = p.pipeDark; ctx.fillRect(x + w - 5, y, 5, h);
    ctx.fillStyle = p.pipe; ctx.fillRect(x - 6, y, w + 12, 18);
    ctx.fillStyle = p.pipeLight; ctx.fillRect(x, y, 7, 18);
    ctx.fillStyle = p.pipeDark; ctx.fillRect(x + w + 1, y, 5, 18);
    ctx.strokeStyle = p.pipeDark; ctx.lineWidth = 2;
    ctx.strokeRect(x - 5, y + 1, w + 10, 16);
  }

  function drawQBlock(x, y, w, h, p) {
    ctx.fillStyle = p.qblock; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = p.qblockLight; ctx.fillRect(x + 2, y + 2, w - 4, 3);
    ctx.fillStyle = p.qblockDark; ctx.fillRect(x, y + h - 4, w, 4);
    ctx.strokeStyle = p.qblockDark; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.fillStyle = p.qblockDark;
    ctx.fillRect(x + 3, y + 3, 3, 3); ctx.fillRect(x + w - 6, y + 3, 3, 3);
    ctx.fillRect(x + 3, y + h - 6, 3, 3); ctx.fillRect(x + w - 6, y + h - 6, 3, 3);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("?", x + w / 2, y + h / 2 + 1);
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  }

  function drawSolids(p) {
    for (var i = 0; i < solids.length; i++) {
      var s = solids[i];
      var x = s.x - cam.x, y = s.y;
      if (x + s.w < -40 || x > W + 40) continue;
      if (s.kind === "pipe") { drawPipe(x, y, s.w, s.h, p); continue; }
      if (s.kind === "qblock") { drawQBlock(x, y, s.w, s.h, p); continue; }

      ctx.fillStyle = p.ground;
      ctx.fillRect(x, y, s.w, s.h);
      if (s.kind === "ground") {
        ctx.fillStyle = p.grass;
        ctx.fillRect(x, y, s.w, 9);
        ctx.fillStyle = p.grassDark;
        ctx.fillRect(x, y + 9, s.w, 3);
      }
      ctx.strokeStyle = p.brickLine; ctx.lineWidth = 2;
      var step = s.kind === "brick" ? 16 : TILE;
      var top = s.kind === "ground" ? 12 : 0;
      for (var bx = 0; bx <= s.w; bx += step) {
        ctx.beginPath(); ctx.moveTo(x + bx, y + top); ctx.lineTo(x + bx, y + s.h); ctx.stroke();
      }
      for (var by = 0; by <= s.h; by += step) {
        ctx.beginPath(); ctx.moveTo(x, y + by); ctx.lineTo(x + s.w, y + by); ctx.stroke();
      }
      ctx.fillStyle = p.groundTop;
      ctx.fillRect(x, y + top, s.w, 2);
    }
  }

  function drawMarkers(p) {
    for (var i = 0; i < markers.length; i++) {
      var m = markers[i];
      var x = m.x - cam.x;
      if (x + m.w < -60 || x > W + 60) continue;
      var isActive = m === activeMarker;
      var cx = x + m.w / 2, base = m.y + m.h;

      if (m.kind === "sign") {
        ctx.fillStyle = "#8a5a2a"; ctx.fillRect(cx - 3, m.y + 20, 6, m.h - 20);
        ctx.fillStyle = "#c8884a"; rr(x, m.y, m.w, 22, 3); ctx.fill();
        ctx.fillStyle = "#7a3010"; ctx.fillRect(x + 2, m.y + 2, m.w - 4, 4);
      } else if (m.kind === "banner") {
        ctx.fillStyle = "#8a5a2a"; ctx.fillRect(cx - 4, m.y, 8, m.h);
        ctx.fillStyle = "#e52521";
        ctx.beginPath(); ctx.moveTo(cx + 3, m.y + 6); ctx.lineTo(cx + 44, m.y + 26 + Math.sin(time * 3) * 3);
        ctx.lineTo(cx + 3, m.y + 52); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#fac000"; ctx.beginPath(); ctx.arc(cx, m.y - 2, 5, 0, 6.28); ctx.fill();
      } else if (m.kind === "monolith") {
        ctx.fillStyle = p.ground; rr(x, m.y, m.w, m.h, 4); ctx.fill();
        ctx.fillStyle = p.groundTop; ctx.fillRect(x, m.y, m.w, 5);
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 14px 'IBM Plex Mono', monospace";
        ctx.textAlign = "center"; ctx.fillText("★", cx, m.y + 40);
        ctx.textAlign = "left";
      } else if (m.kind === "shrine") {
        ctx.fillStyle = "#c8884a"; ctx.fillRect(x + 6, m.y + 16, m.w - 12, m.h - 16);
        ctx.fillStyle = "#e52521";
        ctx.beginPath(); ctx.moveTo(x, m.y + 18); ctx.lineTo(cx, m.y - 4); ctx.lineTo(x + m.w, m.y + 18); ctx.closePath(); ctx.fill();
      } else {
        /* portal pedestal */
        ctx.fillStyle = p.ground; rr(x + 4, m.y + 42, m.w - 8, m.h - 42, 4); ctx.fill();
        ctx.fillStyle = p.groundTop; ctx.fillRect(x + 4, m.y + 42, m.w - 8, 4);
      }

      /* floating portal gem */
      var floatY = m.y + 6 + Math.sin(time * 2 + i) * 3;
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = "#fac000";
      ctx.beginPath();
      ctx.moveTo(cx, floatY - 9); ctx.lineTo(cx + 9, floatY); ctx.lineTo(cx, floatY + 9); ctx.lineTo(cx - 9, floatY);
      ctx.closePath(); ctx.fill();
      ctx.restore();

      if (isActive) {
        ctx.strokeStyle = "#fac000"; ctx.lineWidth = 2;
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
      rr(x, y, e.w, h, 7); ctx.fill();
      if (e.alive) {
        ctx.fillStyle = p.eye;
        ctx.fillRect(x + 6, y + 9, 7, 7); ctx.fillRect(x + e.w - 13, y + 9, 7, 7);
        ctx.fillStyle = p.pupil;
        ctx.fillRect(x + 9, y + 12, 3, 4); ctx.fillRect(x + e.w - 10, y + 12, 3, 4);
        ctx.fillStyle = "#3a2410";
        ctx.fillRect(x + 5, y + 7, 9, 2); ctx.fillRect(x + e.w - 14, y + 7, 9, 2);
        ctx.fillRect(x + 2, y + e.h, 8, 4); ctx.fillRect(x + e.w - 10, y + e.h, 8, 4);
      }
    }
  }

  function drawPlayer(p) {
    var x = player.x - cam.x, y = player.y, w = player.w;
    if (player.blink > 0 && Math.floor(player.blink * 20) % 2 === 0) return;

    ctx.globalAlpha = 0.22; ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.ellipse(x + w / 2, GROUND_Y + 2, 13, 4, 0, 0, 6.28); ctx.fill();
    ctx.globalAlpha = 1;

    var legPhase = Math.sin(player.anim);
    var bob = player.onGround ? Math.abs(Math.sin(player.anim)) * 1.5 : 0;
    y -= bob;
    var swing = player.onGround ? legPhase * 4 : 3;

    /* shoes */
    ctx.fillStyle = p.shoe;
    ctx.fillRect(x + 2, y + player.h - 6 + swing, 10, 6);
    ctx.fillRect(x + w - 12, y + player.h - 6 - swing, 10, 6);
    /* overalls */
    ctx.fillStyle = p.overalls;
    rr(x + 2, y + 18, w - 4, 12, 2); ctx.fill();
    /* shirt + swinging arms */
    ctx.fillStyle = p.cap;
    rr(x + 1, y + 13, w - 2, 8, 2); ctx.fill();
    var arm = player.onGround ? -legPhase * 4 : -4;
    ctx.fillRect(player.face > 0 ? x + w - 3 : x, y + 14 + arm, 3, 7);
    ctx.fillRect(player.face > 0 ? x : x + w - 3, y + 14 - arm, 3, 7);
    /* face */
    ctx.fillStyle = p.skin;
    rr(x + 4, y + 6, w - 8, 9, 3); ctx.fill();
    /* cap */
    ctx.fillStyle = p.cap;
    rr(x + 3, y + 1, w - 6, 6, 2); ctx.fill();
    ctx.fillRect(player.face > 0 ? x + w - 9 : x + 3, y + 4, 6, 3);
    /* eye */
    ctx.fillStyle = p.pupil;
    ctx.fillRect(player.face > 0 ? x + w - 12 : x + 8, y + 9, 2, 3);
  }

  function drawVignette() {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(1, "rgba(0,0,0,.12)");
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
    drawDecos(p);
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
  function applySky() {
    if (hudTheme) {
      hudTheme.textContent = skyMode === "day" ? "☾" : "☀";
      hudTheme.setAttribute("aria-label", skyMode === "day" ? "Switch to dusk" : "Switch to day");
      hudTheme.setAttribute("title", skyMode === "day" ? "Dusk" : "Day");
    }
  }
  applySky();
  if (hudTheme) hudTheme.addEventListener("click", function () {
    skyMode = skyMode === "day" ? "dusk" : "day";
    applySky();
    sfx("open");
  });
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
