/* =====================================================================
   FAIZAN QUAZI — UX PORTFOLIO  ·  shared behaviour
   - Horizontal "Tinder swipe" chapter pager (index)
   - Self-loading media (drop a file in /assets and it appears)
   - Scroll/load reveals · mobile nav · contact form
   ===================================================================== */
(function () {
  "use strict";
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* -----------------------------------------------------------------
     1. MEDIA PLACEHOLDER LOADER
     Each .media holds an <img>/<video> whose src points at /assets/...
     If the file exists it loads and we hide the labelled placeholder.
     If not, the elegant placeholder (with the expected filename) stays.
  ------------------------------------------------------------------ */
  function wireMedia() {
    $$(".media").forEach(function (box) {
      var img = box.querySelector("img");
      var vid = box.querySelector("video");
      var done = function () { box.classList.add("is-loaded"); };
      if (img) {
        if (img.complete && img.naturalWidth > 0) done();
        img.addEventListener("load", function () { if (img.naturalWidth > 0) done(); });
        img.addEventListener("error", function () { box.classList.remove("is-loaded"); });
      }
      if (vid) {
        vid.addEventListener("loadeddata", done);
        vid.addEventListener("error", function () { box.classList.remove("is-loaded"); });
        // a <source> error bubbles to the source, not the video
        $$("source", vid).forEach(function (s) {
          s.addEventListener("error", function () { box.classList.remove("is-loaded"); });
        });
      }
    });
  }

  /* -----------------------------------------------------------------
     2. REVEAL ON VIEW
  ------------------------------------------------------------------ */
  function wireReveals() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.16 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* -----------------------------------------------------------------
     3. MOBILE NAV
  ------------------------------------------------------------------ */
  function wireNav() {
    var nav = $(".nav"), burger = $(".nav__burger");
    if (!nav || !burger) return;
    burger.addEventListener("click", function () { nav.classList.toggle("open"); });
    $$(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }

  /* -----------------------------------------------------------------
     4. CONTACT FORM  ->  mailto
  ------------------------------------------------------------------ */
  function wireForms() {
    $$("[data-mailto]").forEach(function (form) {
      var btn = form.querySelector("[data-send]");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var get = function (n) { var f = form.querySelector('[name="' + n + '"]'); return f ? f.value : ""; };
        var subj = encodeURIComponent("Portfolio enquiry — " + (get("name") || "New message"));
        var body = encodeURIComponent(
          "Name: " + get("name") + "\nEmail: " + get("email") + "\n\n" + get("message")
        );
        window.location.href = "mailto:faizanquazi123@gmail.com?subject=" + subj + "&body=" + body;
      });
    });
  }

  /* -----------------------------------------------------------------
     5. HORIZONTAL CHAPTER PAGER  (index only)
  ------------------------------------------------------------------ */
  function wirePager() {
    var pager = $(".pager");
    if (!pager) return;
    var track   = $(".pager__track", pager);
    var panels  = $$(".chapter", track);
    var dots    = $$(".pager-dots button");
    var bar     = $(".pager-progress");
    var total   = panels.length;
    var idx      = 0;
    var animating = false;

    function go(n) {
      n = Math.max(0, Math.min(total - 1, n));
      idx = n;
      animating = true;
      track.style.transform = "translateX(" + (-idx * 100) + "vw)";
      dots.forEach(function (d, i) { d.classList.toggle("active", i === idx); });
      if (bar) bar.style.width = ((idx) / (total - 1) * 100) + "%";
      // refresh reveals inside the active panel
      $$(".reveal", panels[idx]).forEach(function (e) { e.classList.add("in"); });
      setTimeout(function () { animating = false; }, 1000);
    }

    /* wheel — horizontal feel from vertical wheel */
    var wheelLock = false;
    pager.addEventListener("wheel", function (e) {
      // allow inner vertical scroll on small screens
      var inner = e.target.closest(".chapter__inner");
      if (inner && inner.scrollHeight > inner.clientHeight + 4 && window.innerWidth < 760) return;
      e.preventDefault();
      if (wheelLock || animating) return;
      var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(d) < 8) return;
      wheelLock = true;
      go(idx + (d > 0 ? 1 : -1));
      setTimeout(function () { wheelLock = false; }, 950);
    }, { passive: false });

    /* keyboard */
    window.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "PageDown") go(idx + 1);
      if (e.key === "ArrowLeft"  || e.key === "PageUp")   go(idx - 1);
    });

    /* dots */
    dots.forEach(function (d, i) { d.addEventListener("click", function () { go(i); }); });

    /* jump links (e.g. nav -> chapter) */
    $$("[data-go]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault(); go(parseInt(el.getAttribute("data-go"), 10) || 0);
      });
    });

    /* touch swipe (Tinder-style) */
    var sx = 0, sy = 0, dragging = false;
    track.addEventListener("touchstart", function (e) {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; dragging = true;
    }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (!dragging) return; dragging = false;
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) go(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });

    window.addEventListener("resize", function () {
      track.style.transform = "translateX(" + (-idx * 100) + "vw)";
    });

    go(0);
  }

  /* -----------------------------------------------------------------
     INIT
  ------------------------------------------------------------------ */
  function init() {
    wireMedia(); wireReveals(); wireNav(); wireForms(); wirePager();
    // mark current nav link
    var here = location.pathname.split("/").pop() || "index.html";
    $$(".nav__links a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === here || (here === "index.html" && href === "index.html")) a.classList.add("active");
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
/* =====================================================================
   FAIZAN QUAZI — UX PORTFOLIO
   Shared interactive behaviour
   ===================================================================== */

(function() {
  "use strict";
  
  // ============================================
  // SCROLL PROGRESS INDICATOR
  // ============================================
  function createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    return progressBar;
  }
  
  const progressBar = createProgressBar();
  
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${scrollPercent}%`;
  }
  
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  // Initial calculation
  updateProgress();
  
  // ============================================
  // SMART NAV (Blur + Auto-hide + Compact)
  // ============================================
  const nav = document.querySelector('.nav');
  if (!nav) return;
  
  let lastScrollY = window.scrollY;
  let ticking = false;
  
  const updateNav = () => {
    const currentScrollY = window.scrollY;
    
    // Add blur + compact style when scrolled
    if (currentScrollY > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    
    // Smart hide/show (shutter up when scrolling down)
    if (currentScrollY > lastScrollY && currentScrollY > 140) {
      nav.classList.add('nav--hidden');
    } else {
      nav.classList.remove('nav--hidden');
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
  };
  
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateNav();
        updateProgress();
      });
      ticking = true;
    }
  };
  
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Initial states
  updateNav();
  updateProgress();
})();
