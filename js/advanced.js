/* ============================================================
   ADVANCED LAYER — GSAP scroll motion, magnetic hover, hero decode.
   All features degrade gracefully: no GSAP / reduced-motion
   => the site remains fully usable.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ==========================================================
     GSAP — scrub parallax & motion (only if available)
     ========================================================== */
  function initGsap() {
    if (!window.gsap || !window.ScrollTrigger || reduceMotion) return;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

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

    /* Section tags slide */
    gsap.utils.toArray(".section-tag").forEach(function (tag) {
      gsap.fromTo(tag, { x: -18 }, {
        x: 0, ease: "none",
        scrollTrigger: { trigger: tag, start: "top 88%", end: "top 55%", scrub: true }
      });
    });
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
    initGsap();
    initMagnetic();
    initDecode();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
