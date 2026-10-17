/* ============================================================
   MONISH PORTFOLIO — interactions & renderers
   ============================================================ */
(function () {
  "use strict";

  var DATA = window.PORTFOLIO || { projects: [], skills: [], journey: [] };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Helpers ---------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Render projects ---------- */
  function renderProjects() {
    var root = document.getElementById("projectsList");
    if (!root) return;

    DATA.projects.forEach(function (p, idx) {
      var featured = p.featured === true;
      var article = el("article", "project reveal" + (featured ? " feature" : "") + (idx % 2 === 1 && !featured ? " flip" : ""));

      /* Media */
      var media = el("div", "project-media");
      if (p.coverStyle === "neon" && p.image) {
        media.classList.add("neon-stage");
        var img = document.createElement("img");
        img.src = p.image;
        img.alt = p.imageAlt || p.title + " logo";
        img.loading = idx === 0 ? "eager" : "lazy";
        img.decoding = "async";
        media.appendChild(img);
      } else if (p.image && p.coverStyle === "screenshot") {
        var simg = document.createElement("img");
        simg.src = p.image;
        simg.alt = p.imageAlt || p.title + " screenshot";
        simg.loading = "lazy";
        simg.decoding = "async";
        media.appendChild(simg);
        var ov = el("div", "media-overlay");
        media.appendChild(ov);
      } else {
        var coverCls = "cover cover-" + (p.coverStyle || "java");
        var marks = { java: "J", data: "Py", ml: "AI", web: "</>", neon: "NB" };
        var cover = el("div", coverCls,
          '<span class="cover-title">' + esc(p.title) + "</span>" +
          '<span class="cover-sub">' + esc(p.category) + "</span>" +
          '<span class="cover-mark" aria-hidden="true"><span>' + esc(marks[p.coverStyle] || "M") + "</span></span>"
        );
        media.appendChild(cover);
      }

      /* Body */
      var body = el("div", "project-body");
      body.appendChild(el("div", "project-cat",
        esc(p.category) + ' <span class="year">· ' + esc(p.year) + "</span>"));
      body.appendChild(el("h3", null, esc(p.title)));
      body.appendChild(el("div", "project-status", esc(p.status)));
      body.appendChild(el("p", "desc", esc(p.description)));

      var ul = el("ul", "highlights");
      (p.highlights || []).forEach(function (h) {
        ul.appendChild(el("li", null, esc(h)));
      });
      body.appendChild(ul);

      var tags = el("div", "tech-tags");
      (p.tech || []).forEach(function (t) {
        tags.appendChild(el("span", null, esc(t)));
      });
      body.appendChild(tags);

      var links = el("div", "project-links");
      (p.links || []).forEach(function (l) {
        var a = document.createElement("a");
        a.href = l.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = l.label + " →";
        if (l.primary) a.className = "primary";
        links.appendChild(a);
      });
      body.appendChild(links);

      article.appendChild(media);
      article.appendChild(body);
      root.appendChild(article);
    });
  }

  /* ---------- Render skills ---------- */
  function renderSkills() {
    var root = document.getElementById("skillsGrid");
    if (!root) return;

    var lvlLabel = { used: "Used in projects", familiar: "Familiar", exploring: "Exploring" };

    DATA.skills.forEach(function (g) {
      var card = el("div", "skill-group reveal");
      var head = el("div", "skill-head",
        '<span class="ico" aria-hidden="true">' + esc(g.icon) + "</span>" +
        "<h3>" + esc(g.group) + "</h3>");
      card.appendChild(head);
      card.appendChild(el("p", "skill-note", esc(g.note)));

      var ul = el("ul", "skill-items");
      g.items.forEach(function (it) {
        var lvl = it.level || "familiar";
        ul.appendChild(el("li", null,
          "<span>" + esc(it.name) + "</span>" +
          '<span class="skill-lvl lvl-' + lvl + '">' + esc(lvlLabel[lvl] || lvl) + "</span>"));
      });
      card.appendChild(ul);
      root.appendChild(card);
    });
  }

  /* ---------- Render journey ---------- */
  function renderJourney() {
    var root = document.getElementById("timeline");
    if (!root) return;

    DATA.journey.forEach(function (j) {
      var item = el("div", "tl-item reveal");
      item.appendChild(el("div", "tl-date", esc(j.date)));
      item.appendChild(el("h3", null, esc(j.title)));
      item.appendChild(el("div", "tl-org", esc(j.org)));
      item.appendChild(el("p", null, esc(j.text)));
      root.appendChild(item);
    });
  }

  /* ---------- Year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  function closeNav() {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeNav();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* ---------- Scroll: nav state + progress ---------- */
  var nav = document.getElementById("nav");
  var progress = document.getElementById("scrollProgress");

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle("scrolled", y > 30);
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll spy ---------- */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll("[data-spy]"));
  var sections = spyLinks
    .map(function (a) { return document.getElementById(a.getAttribute("data-spy")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        spyLinks.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("data-spy") === id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          obs.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Contact form: compose & copy (honest, no server) ---------- */
  var copyBtn = document.getElementById("copyBtn");
  var formStatus = document.getElementById("formStatus");

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var name = document.getElementById("cName").value.trim();
      var email = document.getElementById("cEmail").value.trim();
      var topic = document.getElementById("cTopic").value;
      var msg = document.getElementById("cMsg").value.trim();

      if (!name || !email || !msg) {
        formStatus.textContent = "Please fill in your name, email, and message.";
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        formStatus.textContent = "Please enter a valid email address.";
        return;
      }

      var composed =
        "Topic: " + topic + "\n" +
        "From: " + name + " (" + email + ")\n\n" +
        msg + "\n\n— Sent from monish-portfolio";

      function done(ok) {
        formStatus.textContent = ok
          ? "Message copied. Paste it into an email to monishdhanvantar@gmail.com or send via LinkedIn above."
          : "Copy failed — select the message manually. Nothing was sent anywhere.";
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(composed).then(function () { done(true); }, function () { done(false); });
      } else {
        var ta = document.createElement("textarea");
        ta.value = composed;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(true); } catch (err) { done(false); }
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- Back to top ---------- */
  var btt = document.getElementById("backToTop");
  if (btt) {
    btt.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Subtle hero parallax ---------- */
  if (!reduceMotion) {
    var arches = Array.prototype.slice.call(document.querySelectorAll(".arch"));
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y > window.innerHeight) return;
      arches.forEach(function (a, i) {
        a.style.transform = "translateY(" + y * (0.04 + i * 0.015) + "px)";
      });
    }, { passive: true });
  }

  /* ---------- Boot ---------- */
  renderProjects();
  renderSkills();
  renderJourney();
  initReveal();
})();
