(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* ---------- Header + mobile nav ---------- */

  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    var setOpen = function (open) {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("nav-open"));
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Reveal on scroll ---------- */

  var observer = null;
  if (!reduceMotion && "IntersectionObserver" in window) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  }

  function reveal(root) {
    (root || document).querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
      if (observer) observer.observe(el);
      else el.classList.add("is-visible");
    });
  }

  window.Site = { reveal: reveal, escapeHtml: escapeHtml, reduceMotion: reduceMotion };

  /* ---------- Works grid ---------- */

  var grid = document.getElementById("works-grid");
  var filters = document.getElementById("filters");

  function cardHtml(work, index) {
    var href = "dielo.html?id=" + encodeURIComponent(work.slug);
    return (
      '<a class="card reveal" href="' + href + '" style="--delay:' + (index % 3) * 110 + 'ms">' +
        '<div class="card-media">' +
          '<img src="' + escapeHtml(work.cover) + '" alt="' + escapeHtml(work.title) + '" loading="lazy" decoding="async">' +
        "</div>" +
        '<div class="card-body">' +
          '<div class="card-meta"><span>' + escapeHtml(work.type) + "</span><span>" + work.year + "</span></div>" +
          '<h3 class="card-title">' + escapeHtml(work.title) + "</h3>" +
        "</div>" +
      "</a>"
    );
  }

  function renderGrid(category) {
    var list = window.WORKS.filter(function (w) {
      return category === "all" || w.category === category;
    });
    grid.innerHTML = list.map(cardHtml).join("");
    reveal(grid);
  }

  function setFilter(category, animate) {
    filters.querySelectorAll(".chip").forEach(function (chip) {
      chip.setAttribute("aria-pressed", String(chip.dataset.category === category));
    });
    if (!animate || reduceMotion) {
      renderGrid(category);
      return;
    }
    grid.classList.add("is-fading");
    setTimeout(function () {
      renderGrid(category);
      grid.classList.remove("is-fading");
    }, 250);
  }

  if (grid && filters && window.WORKS) {
    filters.innerHTML = window.CATEGORIES.map(function (cat) {
      var count = cat.id === "all"
        ? window.WORKS.length
        : window.WORKS.filter(function (w) { return w.category === cat.id; }).length;
      if (!count) return "";
      return (
        '<button class="chip" type="button" data-category="' + cat.id + '" aria-pressed="false">' +
          escapeHtml(cat.label) + '<span class="count">' + count + "</span>" +
        "</button>"
      );
    }).join("");

    filters.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip || chip.getAttribute("aria-pressed") === "true") return;
      setFilter(chip.dataset.category, true);
    });

    setFilter("all", false);
  }

  reveal();
})();
