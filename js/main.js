// Simple page switching: nav links toggle which spread (.page) is open.
(function () {
  "use strict";

  var pages = Array.prototype.slice.call(document.querySelectorAll(".page"));
  // any element with data-page switches spreads (nav links, case study links)
  var links = Array.prototype.slice.call(document.querySelectorAll("[data-page]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));

  // Trimmed from freesounds123-book-opening-345808.mp3 (leading silence cut)
  var pageTurnSound = new Audio("assets/sounds/page-turn.wav");
  pageTurnSound.preload = "auto";

  function openPage(id) {
    var opened = null;
    pages.forEach(function (page) {
      var isOpen = page.id === id;
      page.classList.toggle("is-open", isOpen);
      if (isOpen) {
        opened = page;
      }
    });
    // keep the parent nav item highlighted for off-nav pages (data-nav)
    var navId = (opened && opened.getAttribute("data-nav")) || id;
    navLinks.forEach(function (link) {
      link.classList.toggle("is-current", link.getAttribute("data-page") === navId);
    });
    updateScrollCues();
  }

  links.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      var id = link.getAttribute("data-page");
      var alreadyOpen = document.getElementById(id).classList.contains("is-open");
      if (!alreadyOpen) {
        pageTurnSound.currentTime = 0;
        pageTurnSound.play().catch(function () {});
      }
      openPage(id);
      // pushState (not replace) so the browser back button turns pages
      if (!alreadyOpen && history.pushState) {
        history.pushState(null, "", "#" + id);
      }
    });
  });

  // back / forward: reopen whichever spread the hash names
  window.addEventListener("popstate", function () {
    var id = window.location.hash.replace("#", "") || pages[0].id;
    if (document.getElementById(id)) {
      openPage(id);
    }
  });

  // Projects: left-index tabs swap the right-page detail
  var projectTabs = Array.prototype.slice.call(document.querySelectorAll(".project-tab"));
  var projectDetails = Array.prototype.slice.call(document.querySelectorAll(".project-detail"));
  projectTabs.forEach(function (t) {
    t.setAttribute("aria-pressed", t.classList.contains("is-current") ? "true" : "false");
  });

  projectTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var id = tab.getAttribute("data-project");
      var target = document.getElementById(id);
      if (!target || target.classList.contains("is-open")) {
        return;
      }
      pageTurnSound.currentTime = 0;
      pageTurnSound.play().catch(function () {});
      projectDetails.forEach(function (detail) {
        detail.classList.toggle("is-open", detail.id === id);
      });
      projectTabs.forEach(function (t) {
        t.classList.toggle("is-current", t === tab);
        t.setAttribute("aria-pressed", t === tab ? "true" : "false");
      });
      resetPanes();
      updateScrollCues();
      // phones stack the leaves, so the detail sits below the fold
      if (window.matchMedia("(max-width: 700px)").matches) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Detail panes: "next page / back" turns within a project detail
  var paneLinks = Array.prototype.slice.call(document.querySelectorAll(".pane-link"));
  paneLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      var pane = document.getElementById(link.getAttribute("data-pane"));
      if (!pane || pane.classList.contains("is-open")) {
        return;
      }
      pageTurnSound.currentTime = 0;
      pageTurnSound.play().catch(function () {});
      var detail = pane.closest(".project-detail");
      Array.prototype.forEach.call(detail.querySelectorAll(".detail-pane"), function (p) {
        p.classList.toggle("is-open", p === pane);
      });
      updateScrollCues();
    });
  });

  // switching projects resets every detail back to its first pane
  function resetPanes() {
    document.querySelectorAll(".project-detail").forEach(function (detail) {
      var panes = detail.querySelectorAll(".detail-pane");
      Array.prototype.forEach.call(panes, function (p, i) {
        p.classList.toggle("is-open", i === 0);
      });
    });
  }

  // Plot carousels: arrows swap which figure is showing (wraps around)
  var carousels = Array.prototype.slice.call(document.querySelectorAll(".plot-carousel"));
  carousels.forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".carousel-slide"));
    var index = 0;
    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (slide, j) {
        slide.classList.toggle("is-current", j === index);
      });
    }
    var prev = carousel.querySelector(".carousel-prev");
    var next = carousel.querySelector(".carousel-next");
    if (prev) {
      prev.addEventListener("click", function () { show(index - 1); });
    }
    if (next) {
      next.addEventListener("click", function () { show(index + 1); });
    }
    show(0);
  });

  // Scroll cues: mark page zones that overflow so CSS can hint "more below".
  // The chip goes away once the reader actually reaches the bottom.
  function updateScrollCues() {
    var zones = document.querySelectorAll(".page.is-open .page-left, .page.is-open .page-right");
    Array.prototype.forEach.call(zones, function (zone) {
      var overflows = zone.scrollHeight > zone.clientHeight + 4;
      var atBottom = zone.scrollTop + zone.clientHeight >= zone.scrollHeight - 8;
      zone.classList.toggle("can-scroll", overflows && !atBottom);
    });
  }
  window.addEventListener("resize", updateScrollCues);
  window.addEventListener("load", updateScrollCues);
  Array.prototype.forEach.call(
    document.querySelectorAll(".page-left, .page-right"),
    function (zone) {
      zone.addEventListener("scroll", updateScrollCues, { passive: true });
    }
  );

  // Open a page directly via URL hash, e.g. index.html#page-blogs
  var initial = window.location.hash.replace("#", "");
  if (initial && document.getElementById(initial)) {
    openPage(initial);
  }
})();
