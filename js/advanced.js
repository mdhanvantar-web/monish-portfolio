/* ============================================================
   ADVANCED LAYER — Three.js monument, GSAP motion, custom cursor,
   magnetic elements, hero decode.
   All features degrade gracefully: no WebGL / GSAP / reduced-motion
   => the site remains fully usable.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ==========================================================
     HERO — Three.js rotating wireframe monument + particles
     ========================================================== */
  function initHeroScene() {
    var canvas = document.getElementById("heroCanvas");
    if (!canvas || !window.THREE || reduceMotion) return;
    if (window.matchMedia("(max-width: 820px)").matches) return;

    var THREE = window.THREE;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch (e) {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0b0a, 0.075);

    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 7.4);

    var group = new THREE.Group();
    group.position.set(2.85, 0.15, 0);
    scene.add(group);

    var disposables = [];

    /* Outer wireframe shell */
    var outerGeo = new THREE.IcosahedronGeometry(2.35, 1);
    var outerMat = new THREE.MeshBasicMaterial({ color: 0xa77c48, wireframe: true, transparent: true, opacity: 0.32 });
    var outer = new THREE.Mesh(outerGeo, outerMat);
    group.add(outer);
    disposables.push(outerGeo, outerMat);

    /* Inner solid monolith */
    var innerGeo = new THREE.IcosahedronGeometry(1.35, 0);
    var innerMat = new THREE.MeshStandardMaterial({ color: 0x2b2620, metalness: 0.72, roughness: 0.38, flatShading: true });
    var inner = new THREE.Mesh(innerGeo, innerMat);
    group.add(inner);
    disposables.push(innerGeo, innerMat);

    /* Accent edge shell */
    var edgeGeo = new THREE.IcosahedronGeometry(1.42, 0);
    var edgeMat = new THREE.MeshBasicMaterial({ color: 0xc5a16a, wireframe: true, transparent: true, opacity: 0.5 });
    var edges = new THREE.Mesh(edgeGeo, edgeMat);
    group.add(edges);
    disposables.push(edgeGeo, edgeMat);

    /* Particle field */
    var count = 520;
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      var r = 3.4 + Math.random() * 4.6;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var pMat = new THREE.PointsMaterial({ color: 0xc5a16a, size: 0.035, transparent: true, opacity: 0.65, depthWrite: false });
    var points = new THREE.Points(pGeo, pMat);
    scene.add(points);
    disposables.push(pGeo, pMat);

    /* Lights */
    var ambient = new THREE.AmbientLight(0x46403a, 1.1);
    scene.add(ambient);
    var key = new THREE.PointLight(0xc5a16a, 1.5, 26);
    key.position.set(6, 5, 6);
    scene.add(key);
    var rim = new THREE.PointLight(0xa77c48, 0.9, 24);
    rim.position.set(-7, -3, 3);
    scene.add(rim);

    /* Theme-aware recolouring */
    function applyTheme(theme) {
      var light = theme === "light";
      scene.fog.color.setHex(light ? 0xefe7d7 : 0x0b0b0a);
      scene.fog.density = light ? 0.06 : 0.075;
      outerMat.color.setHex(light ? 0x7d5a2c : 0xa77c48);
      outerMat.opacity = light ? 0.42 : 0.32;
      edgeMat.color.setHex(light ? 0x8a6428 : 0xc5a16a);
      edgeMat.opacity = light ? 0.6 : 0.5;
      innerMat.color.setHex(light ? 0xded2ba : 0x2b2620);
      innerMat.metalness = light ? 0.34 : 0.72;
      innerMat.roughness = light ? 0.55 : 0.38;
      pMat.color.setHex(light ? 0x8a6428 : 0xc5a16a);
      pMat.opacity = light ? 0.5 : 0.65;
      ambient.color.setHex(light ? 0xfff4e2 : 0x46403a);
      ambient.intensity = light ? 1.0 : 1.1;
      key.color.setHex(light ? 0x9c7538 : 0xc5a16a);
      key.intensity = light ? 1.1 : 1.5;
      rim.color.setHex(light ? 0x7d5a2c : 0xa77c48);
      rim.intensity = light ? 0.7 : 0.9;
    }
    applyTheme(document.documentElement.getAttribute("data-theme") || "dark");
    window.addEventListener("portfolio:theme", function () {
      applyTheme(document.documentElement.getAttribute("data-theme") || "dark");
    });

    /* Pointer parallax */
    var target = { x: 0, y: 0 };
    var cur = { x: 0, y: 0 };
    window.addEventListener("pointermove", function (e) {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    /* Sizing */
    function resize() {
      var w = canvas.clientWidth || (canvas.parentElement && canvas.parentElement.clientWidth);
      var h = canvas.clientHeight || (canvas.parentElement && canvas.parentElement.clientHeight);
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    window.addEventListener("load", resize);
    setTimeout(resize, 120);
    if (window.ResizeObserver && canvas.parentElement) {
      new ResizeObserver(resize).observe(canvas.parentElement);
    }
    resize();

    /* Visibility gating */
    var visible = true;
    var heroEl = document.getElementById("home");
    if (heroEl && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }, { threshold: 0 }).observe(heroEl);
    }
    var tabVisible = true;
    document.addEventListener("visibilitychange", function () { tabVisible = !document.hidden; });

    var clock = new THREE.Clock();
    function loop() {
      requestAnimationFrame(loop);
      if (!visible || !tabVisible) return;
      var t = clock.getElapsedTime();

      cur.x += (target.x - cur.x) * 0.045;
      cur.y += (target.y - cur.y) * 0.045;

      outer.rotation.y = t * 0.16 + cur.x * 0.4;
      outer.rotation.x = t * 0.07 - cur.y * 0.25;
      edges.rotation.y = -t * 0.24 + cur.x * 0.3;
      edges.rotation.z = t * 0.1;
      inner.rotation.y = -t * 0.1 - cur.x * 0.2;
      inner.rotation.x = t * 0.05 + cur.y * 0.15;
      group.rotation.y = cur.x * 0.28;
      group.rotation.x = cur.y * 0.18;
      group.position.y = 0.15 + Math.sin(t * 0.6) * 0.12;

      points.rotation.y = t * 0.02 + cur.x * 0.15;

      renderer.render(scene, camera);
    }
    loop();

    requestAnimationFrame(function () { canvas.classList.add("ready"); });
  }

  /* ==========================================================
     GSAP — scrub parallax & motion (only if available)
     ========================================================== */
  function initGsap() {
    if (!window.gsap || !window.ScrollTrigger || reduceMotion) return;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    /* Hero background drift */
    gsap.to(".arch-scene", {
      yPercent: 18, opacity: 0.25, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".hero-content", {
      yPercent: -10, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    /* Project media parallax */
    gsap.utils.toArray(".project-media").forEach(function (media) {
      gsap.fromTo(media, { yPercent: 4 }, {
        yPercent: -4, ease: "none",
        scrollTrigger: { trigger: media, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    /* Divider gems */
    gsap.utils.toArray(".divider .gem").forEach(function (gem) {
      gsap.fromTo(gem, { scale: 0.4, rotate: 0, opacity: 0.3 }, {
        scale: 1, rotate: 135, opacity: 1, ease: "none",
        scrollTrigger: { trigger: gem, start: "top 92%", end: "top 55%", scrub: true }
      });
    });

    /* Section tags slide */
    gsap.utils.toArray(".section-tag").forEach(function (tag) {
      gsap.fromTo(tag, { x: -18 }, {
        x: 0, ease: "none",
        scrollTrigger: { trigger: tag, start: "top 88%", end: "top 55%", scrub: true }
      });
    });
  }

  /* ==========================================================
     CUSTOM CURSOR — dot + trailing ring (fine pointers only)
     ========================================================== */
  function initCursor() {
    if (!finePointer || reduceMotion) return;
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    if (!dot || !ring) return;

    document.body.classList.add("has-custom-cursor");

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    var visibleNow = false;

    window.addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!visibleNow) {
        visibleNow = true;
        rx = mx; ry = my;
        document.body.classList.remove("cursor-hidden");
      }
    }, { passive: true });

    document.addEventListener("mouseleave", function () {
      visibleNow = false;
      document.body.classList.add("cursor-hidden");
    });
    document.addEventListener("mouseenter", function () {
      visibleNow = true;
      document.body.classList.remove("cursor-hidden");
    });

    var interactSel = "a, button, input, select, textarea, [role='button'], .filter-chip, .cmdk-item, .project-media, [data-magnetic]";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(interactSel)) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest(interactSel)) ring.classList.remove("is-hover");
    });
    window.addEventListener("pointerdown", function () { ring.classList.add("is-down"); });
    window.addEventListener("pointerup", function () { ring.classList.remove("is-down"); });
    document.addEventListener("mousedown", function () { ring.classList.add("is-down"); });
    document.addEventListener("mouseup", function () { ring.classList.remove("is-down"); });

    (function frame() {
      requestAnimationFrame(frame);
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
    })();
  }

  /* ==========================================================
     MAGNETIC ELEMENTS
     ========================================================== */
  function initMagnetic() {
    if (!finePointer || reduceMotion) return;
    var els = document.querySelectorAll(".btn, .nav-cta, .cmdk-trigger, .project-detail-btn, .copy-btn, .contact-link");
    Array.prototype.forEach.call(els, function (elm) {
      elm.setAttribute("data-magnetic", "");
      elm.addEventListener("pointermove", function (e) {
        var r = elm.getBoundingClientRect();
        var relX = e.clientX - (r.left + r.width / 2);
        var relY = e.clientY - (r.top + r.height / 2);
        elm.style.transform = "translate(" + relX * 0.12 + "px," + relY * 0.22 + "px)";
      });
      elm.addEventListener("pointerleave", function () {
        elm.style.transform = "";
      });
    });
  }

  /* ==========================================================
     HERO DECODE — subtle scramble on the role label
     ========================================================== */
  function initDecode() {
    if (reduceMotion) return;
    var node = document.querySelector(".hero-label");
    if (!node) return;
    var final = node.textContent;
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ/·░▒";
    var frame = 0;
    var total = 26;
    var start = Date.now();
    function tick() {
      var elapsed = Date.now() - start;
      if (elapsed < 300) { requestAnimationFrame(tick); return; }
      frame++;
      var progress = Math.min(1, frame / total);
      var reveal = Math.floor(final.length * progress);
      var out = "";
      for (var i = 0; i < final.length; i++) {
        var ch = final[i];
        if (ch === " " || i < reveal) { out += ch; }
        else { out += chars[Math.floor(Math.random() * chars.length)]; }
      }
      node.textContent = out;
      if (progress < 1) requestAnimationFrame(tick);
      else node.textContent = final;
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Boot ---------- */
  function boot() {
    initHeroScene();
    initGsap();
    initCursor();
    initMagnetic();
    initDecode();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
