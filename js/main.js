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
      article.dataset.category = p.category;
      article.dataset.id = p.id;

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

      if (p.detail) {
        var dbtn = el("button", "project-detail-btn",
          '<span>Case Study</span><span class="arrow" aria-hidden="true">→</span>');
        dbtn.type = "button";
        dbtn.setAttribute("data-project-id", p.id);
        dbtn.setAttribute("aria-label", "Open " + p.title + " case study");
        body.appendChild(dbtn);
      }

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

    /* Safety net — reveal anything that slipped past the observer
       (fast scroll / missed intersections). Never touches filtered cards. */
    function sweep() {
      var vh = window.innerHeight;
      els.forEach(function (e) {
        if (e.classList.contains("visible")) return;
        if (e.style.display === "none" || e.classList.contains("filtering-out")) return;
        if (e.getBoundingClientRect().top < vh * 0.94) e.classList.add("visible");
      });
    }
    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep, { passive: true });
    sweep();
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
          ? "Message copied. Paste it into an email to monishdhanvantar20@gmail.com or send via LinkedIn above."
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

  /* ---------- Project filters ---------- */
  function initFilters() {
    var bar = document.getElementById("filterBar");
    var list = document.getElementById("projectsList");
    if (!bar || !list) return;

    var cats = [];
    DATA.projects.forEach(function (p) {
      if (cats.indexOf(p.category) === -1) cats.push(p.category);
    });

    var all = el("button", "filter-chip active",
      'All <span class="filter-count">' + DATA.projects.length + "</span>");
    all.type = "button";
    all.setAttribute("role", "tab");
    all.setAttribute("aria-selected", "true");
    all.dataset.filter = "*";
    bar.appendChild(all);

    cats.forEach(function (c) {
      var n = DATA.projects.filter(function (p) { return p.category === c; }).length;
      var chip = el("button", "filter-chip",
        esc(c) + ' <span class="filter-count">' + n + "</span>");
      chip.type = "button";
      chip.setAttribute("role", "tab");
      chip.setAttribute("aria-selected", "false");
      chip.dataset.filter = c;
      bar.appendChild(chip);
    });

    bar.addEventListener("click", function (e) {
      var chip = e.target.closest(".filter-chip");
      if (!chip) return;
      var f = chip.dataset.filter;
      Array.prototype.forEach.call(bar.children, function (c) {
        var on = c === chip;
        c.classList.toggle("active", on);
        c.setAttribute("aria-selected", on ? "true" : "false");
      });
      var cards = Array.prototype.slice.call(list.children);
      cards.forEach(function (card) {
        var show = f === "*" || card.dataset.category === f;
        if (reduceMotion) {
          card.style.display = show ? "" : "none";
          return;
        }
        if (show) {
          card.style.display = "";
          card.classList.remove("filtering-out");
          requestAnimationFrame(function () { card.classList.add("visible"); });
        } else {
          card.classList.add("filtering-out");
          card.classList.remove("visible");
          setTimeout(function () { if (card.classList.contains("filtering-out")) card.style.display = "none"; }, 300);
        }
      });
    });
  }

  /* ---------- Tech ticker ---------- */
  function initTicker() {
    var track = document.getElementById("tickerTrack");
    if (!track) return;
    var seen = {};
    var items = [];
    DATA.projects.forEach(function (p) {
      (p.tech || []).forEach(function (t) {
        if (!seen[t]) { seen[t] = 1; items.push(t); }
      });
    });
    var extra = ["Gameplay Systems", "Procedural Generation", "Real-time Rendering", "WebAudio"];
    extra.forEach(function (t) { if (!seen[t]) { seen[t] = 1; items.push(t); } });

    function fill() {
      var frag = "";
      items.forEach(function (t) { frag += '<span class="ticker-item">' + esc(t) + "</span>"; });
      return frag;
    }
    track.innerHTML = fill() + fill();
  }

  /* ---------- Project modal ---------- */
  var modal = document.getElementById("projectModal");
  var modalBody = document.getElementById("modalBody");
  var modalOpen = false;
  var lastFocused = null;

  function openProject(id) {
    var p = null;
    DATA.projects.forEach(function (x) { if (x.id === id) p = x; });
    if (!p || !p.detail || !modal) return;

    var html = "";
    html += '<div class="modal-hero">';
    html += '<span class="modal-cat">' + esc(p.category) + " · " + esc(p.year) + "</span>";
    html += '<h3 id="modalTitle">' + esc(p.title) + "</h3>";
    if (p.role) html += '<p class="modal-role">' + esc(p.role) + "</p>";
    html += '<span class="modal-status">' + esc(p.status) + "</span>";
    html += "</div>";
    html += '<div class="modal-content">';

    var d = p.detail;
    html += "<h4>The Problem</h4><p>" + esc(d.problem) + "</p>";
    html += "<h4>The Approach</h4><p>" + esc(d.approach) + "</p>";
    html += "<h4>My Contribution</h4><p>" + esc(d.contribution) + "</p>";

    if (d.challenges && d.challenges.length) {
      html += "<h4>Notable Challenges</h4><ul>";
      d.challenges.forEach(function (c) { html += "<li>" + esc(c) + "</li>"; });
      html += "</ul>";
    }

    if (p.tech && p.tech.length) {
      html += "<h4>Stack</h4><div class=\"modal-tech\">";
      p.tech.forEach(function (t) { html += "<span>" + esc(t) + "</span>"; });
      html += "</div>";
    }

    if (p.links && p.links.length) {
      html += '<div class="modal-actions">';
      p.links.forEach(function (l) {
        html += '<a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer" class="' +
          (l.primary ? "primary" : "") + '">' + esc(l.label) + " →</a>";
      });
      html += "</div>";
    }
    html += "</div>";

    modalBody.innerHTML = html;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("locked");
    requestAnimationFrame(function () {
      modal.classList.add("open");
      var close = modal.querySelector(".modal-close");
      if (close) close.focus();
    });
    modalOpen = true;
    if (window.__lenis && window.__lenis.stop) window.__lenis.stop();
  }

  function closeModal() {
    if (!modal || !modalOpen) return;
    modal.classList.remove("open");
    modalOpen = false;
    if (window.__lenis && window.__lenis.start) window.__lenis.start();
    setTimeout(function () {
      modal.hidden = true;
      modalBody.innerHTML = "";
      document.body.classList.remove("locked");
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }, 320);
  }

  document.addEventListener("click", function (e) {
    var dbtn = e.target.closest("[data-project-id]");
    if (dbtn) { openProject(dbtn.getAttribute("data-project-id")); return; }
    if (e.target.closest("[data-modal-close]")) { closeModal(); }
  });

  /* ---------- Command palette ---------- */
  var cmdk = document.getElementById("cmdk");
  var cmdkInput = document.getElementById("cmdkInput");
  var cmdkList = document.getElementById("cmdkList");
  var cmdkTrigger = document.getElementById("cmdkTrigger");
  var cmdkIndex = 0;
  var cmdkItems = [];
  var cmdkOpen = false;

  function buildCommands() {
    var cmds = [
      { title: "Home", sub: "Section", icon: "⌂", kind: "Jump", action: function () { go("#home"); } },
      { title: "About", sub: "Section", icon: "◔", kind: "Jump", action: function () { go("#about"); } },
      { title: "Selected Builds", sub: "Section", icon: "▦", kind: "Jump", action: function () { go("#projects"); } },
      { title: "Skills", sub: "Section", icon: "✳", kind: "Jump", action: function () { go("#skills"); } },
      { title: "Journey", sub: "Section", icon: "⌛", kind: "Jump", action: function () { go("#journey"); } },
      { title: "Contact", sub: "Section", icon: "✉", kind: "Jump", action: function () { go("#contact"); } },
      { title: currentTheme() === "light" ? "Switch to dark theme" : "Switch to light theme", sub: "Appearance", icon: "◐", kind: "Theme", action: function () { setTheme(currentTheme() === "light" ? "dark" : "light", true); closeCmdk(); } },
      { title: "GitHub", sub: "github.com/mdhanvantar-web", icon: "GH", kind: "Link", action: function () { ext("https://github.com/mdhanvantar-web"); } },
      { title: "LinkedIn", sub: "Monish Dhanvantar Sambangi", icon: "in", kind: "Link", action: function () { ext("https://www.linkedin.com/in/monish-dhanvantar-sambangi-954397377/"); } },
      { title: "Email Monish", sub: "monishdhanvantar20@gmail.com", icon: "@", kind: "Link", action: function () { window.location.href = "mailto:monishdhanvantar20@gmail.com"; closeCmdk(); } }
    ];
    DATA.projects.forEach(function (p) {
      if (p.detail) {
        cmds.push({ title: p.title, sub: "Case study — " + p.category, icon: "◆", kind: "Project", action: function () { closeCmdk(); openProject(p.id); } });
      }
      var primary = (p.links || []).filter(function (l) { return l.primary; })[0];
      if (primary) {
        cmds.push({ title: p.title + " — " + primary.label, sub: primary.url, icon: "↗", kind: "Open", action: function () { ext(primary.url); } });
      }
    });
    return cmds;
  }

  function go(hash) {
    closeCmdk();
    var t = document.querySelector(hash);
    if (t) t.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }
  function ext(url) {
    closeCmdk();
    window.open(url, "_blank", "noopener,noreferrer");
  }

  var cmdkAll = [];

  function renderCmdk(query) {
    var q = (query || "").toLowerCase().trim();
    cmdkItems = cmdkAll.filter(function (c) {
      if (!q) return true;
      return (c.title + " " + c.sub + " " + c.kind).toLowerCase().indexOf(q) !== -1;
    });
    cmdkIndex = 0;
    cmdkList.innerHTML = "";
    cmdkItems.forEach(function (c, i) {
      var li = el("li", "cmdk-item" + (i === 0 ? " active" : ""),
        '<span class="ci-icon">' + esc(c.icon) + "</span>" +
        '<span class="ci-text"><span class="ci-title">' + esc(c.title) + "</span>" +
        '<span class="ci-sub">' + esc(c.sub) + "</span></span>" +
        '<span class="ci-kind">' + esc(c.kind) + "</span>");
      li.setAttribute("role", "option");
      li.dataset.index = String(i);
      cmdkList.appendChild(li);
    });
  }

  function highlight(i) {
    var lis = Array.prototype.slice.call(cmdkList.children);
    if (!lis.length) return;
    if (i < 0) i = lis.length - 1;
    if (i >= lis.length) i = 0;
    cmdkIndex = i;
    lis.forEach(function (li, k) {
      li.classList.toggle("active", k === i);
      if (k === i) li.scrollIntoView({ block: "nearest" });
    });
  }

  function openCmdk() {
    if (!cmdk) return;
    cmdkAll = buildCommands();
    renderCmdk("");
    lastFocused = document.activeElement;
    cmdk.hidden = false;
    requestAnimationFrame(function () {
      cmdk.classList.add("open");
      cmdkInput.value = "";
      cmdkInput.focus();
    });
    cmdkOpen = true;
    document.body.classList.add("locked");
  }
  function closeCmdk() {
    if (!cmdk || !cmdkOpen) return;
    cmdk.classList.remove("open");
    cmdkOpen = false;
    document.body.classList.remove("locked");
    setTimeout(function () { cmdk.hidden = true; }, 220);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  if (cmdk && cmdkInput && cmdkList) {
    cmdkTrigger && cmdkTrigger.addEventListener("click", openCmdk);
    cmdkInput.addEventListener("input", function () { renderCmdk(cmdkInput.value); });
    cmdk.addEventListener("click", function (e) {
      if (e.target.closest("[data-cmdk-close]")) { closeCmdk(); return; }
      var item = e.target.closest(".cmdk-item");
      if (item) {
        var c = cmdkItems[Number(item.dataset.index)];
        if (c) c.action();
      }
    });
    document.addEventListener("keydown", function (e) {
      var metaK = (e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K");
      if (metaK) { e.preventDefault(); cmdkOpen ? closeCmdk() : openCmdk(); return; }
      if (!cmdkOpen) return;
      if (e.key === "Escape") { closeCmdk(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); highlight(cmdkIndex + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); highlight(cmdkIndex - 1); }
      else if (e.key === "Enter") {
        e.preventDefault();
        var c = cmdkItems[cmdkIndex];
        if (c) c.action();
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalOpen) closeModal();
  });

  /* ---------- Theme ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var metaTheme = document.getElementById("metaThemeColor");

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }
  function syncThemeMeta(t) {
    if (metaTheme) metaTheme.setAttribute("content", t === "light" ? "#efe7d7" : "#0b0b0a");
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", "Switch to " + (t === "light" ? "dark" : "light") + " theme");
      themeToggle.setAttribute("title", "Switch to " + (t === "light" ? "dark" : "light") + " theme");
    }
  }
  function setTheme(t, animate) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
    syncThemeMeta(t);
    if (animate) {
      var root = document.documentElement;
      root.classList.add("theme-transition");
      setTimeout(function () { root.classList.remove("theme-transition"); }, 520);
    }
    window.dispatchEvent(new CustomEvent("portfolio:theme", { detail: { theme: t } }));
  }
  if (themeToggle) {
    syncThemeMeta(currentTheme());
    themeToggle.addEventListener("click", function () {
      setTheme(currentTheme() === "light" ? "dark" : "light", true);
    });
  }

  /* ---------- Boot ---------- */
  renderProjects();
  renderSkills();
  renderJourney();
  initFilters();
  initTicker();
  initReveal();
})();
