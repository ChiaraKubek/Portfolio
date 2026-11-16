(function () {
  "use strict";

  var esc = window.Site.escapeHtml;
  var works = window.WORKS || [];
  var root = document.getElementById("work");

  var slug = new URLSearchParams(window.location.search).get("id");
  var index = works.findIndex(function (w) { return w.slug === slug; });
  var work = works[index];

  if (!work) {
    document.title = "Dielo sa nenašlo — Chiara Kúbeková";
    root.innerHTML =
      '<div class="not-found">' +
        '<p class="eyebrow">404</p>' +
        "<h1>Dielo sa nenašlo</h1>" +
        '<p>Toto dielo neexistuje alebo bolo presunuté.</p>' +
        '<a class="back" href="index.html#diela">← späť na diela</a>' +
      "</div>";
    return;
  }

  document.title = work.title + " — Chiara Kúbeková";
  var metaDescription = document.querySelector('meta[name="description"]');
  var firstText = work.description.find(function (p) { return typeof p === "string"; });
  if (metaDescription && firstText) metaDescription.setAttribute("content", firstText.slice(0, 160));

  function descriptionHtml(blocks) {
    return blocks.map(function (block) {
      if (typeof block === "string") return "<p>" + esc(block) + "</p>";
      if (block.heading) return "<h3>" + esc(block.heading) + "</h3>";
      return "";
    }).join("");
  }

  function metaRow(label, value) {
    if (!value) return "";
    return "<div><dt>" + label + "</dt><dd>" + esc(value) + "</dd></div>";
  }

  function videoHtml(video) {
    if (video.vimeo) {
      var src = "https://player.vimeo.com/video/" + encodeURIComponent(video.vimeo) +
        "?dnt=1&title=0&byline=0&portrait=0&color=d9a05b";
      return '<div class="video-frame reveal"><iframe src="' + src + '" title="' + esc(work.title) +
        '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
    }
    if (video.src) {
      var poster = video.poster ? ' poster="' + esc(video.poster) + '"' : "";
      return '<div class="video-frame reveal"><video controls playsinline preload="metadata"' + poster +
        ' src="' + esc(video.src) + '"></video></div>';
    }
    return "";
  }

  function pagerLink(target, cls, label) {
    if (!target) return "<span></span>";
    return '<a class="' + cls + '" href="dielo.html?id=' + encodeURIComponent(target.slug) + '">' +
      '<span class="eyebrow">' + label + "</span>" +
      '<span class="pager-title">' + esc(target.title) + "</span></a>";
  }

  var videos = work.videos || [];
  var images = work.images || [];

  root.innerHTML =
    '<a class="back reveal" href="index.html#diela">← všetky diela</a>' +
    '<h1 class="detail-title reveal" style="--delay:100ms">' + esc(work.title) + "</h1>" +
    '<div class="detail-cover reveal" style="--delay:200ms">' +
      '<img src="' + esc(work.cover) + '" alt="' + esc(work.title) + '">' +
    "</div>" +
    '<div class="detail-body">' +
      '<dl class="facts detail-meta reveal">' +
        metaRow("Rok", String(work.year)) +
        metaRow("Médium", work.type) +
        metaRow("Ateliér", work.course) +
        metaRow("Téma", work.theme) +
        metaRow("Kontext", work.context) +
      "</dl>" +
      '<div class="detail-text reveal" style="--delay:120ms">' + descriptionHtml(work.description) + "</div>" +
    "</div>" +
    (videos.length
      ? '<section class="media-block"><h2 class="reveal">Video</h2><div class="videos">' +
          videos.map(videoHtml).join("") + "</div></section>"
      : "") +
    (images.length
      ? '<section class="media-block"><h2 class="reveal">Galéria</h2><div class="gallery">' +
          images.map(function (src, i) {
            return '<button type="button" class="reveal" style="--delay:' + (i % 3) * 100 + 'ms" data-index="' + i + '" aria-label="Zväčšiť obrázok ' + (i + 1) + '">' +
              '<img src="' + esc(src) + '" alt="' + esc(work.title) + " – obrázok " + (i + 1) + '" loading="lazy" decoding="async"></button>';
          }).join("") + "</div></section>"
      : "") +
    '<nav class="pager" aria-label="Ďalšie diela">' +
      pagerLink(works[index - 1], "prev", "← predchádzajúce") +
      pagerLink(works[index + 1], "next", "nasledujúce →") +
    "</nav>";

  window.Site.reveal(root);

  /* ---------- Lightbox ---------- */

  var lightbox = document.getElementById("lightbox");
  var lbImg = lightbox.querySelector("img");
  var lbCount = lightbox.querySelector(".lb-count");
  var current = 0;
  var lastFocus = null;

  function show(i) {
    current = (i + images.length) % images.length;
    lbImg.src = images[current];
    lbImg.alt = work.title + " – obrázok " + (current + 1);
    lbCount.textContent = (current + 1) + " / " + images.length;
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lightbox.querySelector(".lb-close").focus();
  }

  function close() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  var single = images.length < 2;
  lightbox.querySelector(".lb-prev").hidden = single;
  lightbox.querySelector(".lb-next").hidden = single;

  root.addEventListener("click", function (e) {
    var btn = e.target.closest(".gallery button");
    if (btn) open(Number(btn.dataset.index));
  });

  lightbox.querySelector(".lb-close").addEventListener("click", close);
  lightbox.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
  lightbox.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft" && !single) show(current - 1);
    else if (e.key === "ArrowRight" && !single) show(current + 1);
  });
})();
