/* =====================================================================
   FAIZAN QUAZI — UX PORTFOLIO  ·  shared behaviour
   - Horizontal "Tinder swipe" chapter pager (index)
   - Chapter 02 scrolls vertically; only at its edges does the pager move
   - Hero: HD orca still + click-to-play video
       · leaving chapter 01 stops + rewinds the video and restores the still
   - Self-loading media · reveals · mobile nav · contact form
   ===================================================================== */
(function () {
  "use strict";
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* -----------------------------------------------------------------
     1. MEDIA PLACEHOLDER LOADER
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
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      document.body.classList.toggle("nav-open", open);   // lock page scroll behind the overlay
    });
    $$(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); document.body.classList.remove("nav-open"); });
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
     5. HERO VIDEO — HD still shown until the play button is pressed.
     `resetHeroVideo` is exposed so the pager can stop it on leave.
  ------------------------------------------------------------------ */
  var heroMedia = null, heroVideo = null;

  function wireHeroVideo() {
    heroMedia = $(".hero-media");
    var btn   = $(".hero-play");
    if (!heroMedia || !btn) return;
    heroVideo = heroMedia.querySelector("video");
    if (!heroVideo) return;

    var start = function () {
      heroMedia.classList.add("playing");
      var p = heroVideo.play();
      if (p && p.catch) p.catch(function () {}); // ignore autoplay-policy rejections
    };

    btn.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation(); start();
    });
    // tap the video to pause / resume after it has started
    heroVideo.addEventListener("click", function (e) {
      e.stopPropagation();
      if (heroVideo.paused) start(); else heroVideo.pause();
    });
  }

  // Stop the film, rewind it, and bring back the still + play button.
  function resetHeroVideo() {
    if (!heroVideo) return;
    heroVideo.pause();
    try { heroVideo.currentTime = 0; } catch (e) {}
    if (heroMedia) heroMedia.classList.remove("playing");
  }

  /* -----------------------------------------------------------------
     6. HORIZONTAL CHAPTER PAGER  (index only)
  ------------------------------------------------------------------ */
  function wirePager() {
    var pager = $(".pager");
    if (!pager) return;
    var track   = $(".pager__track", pager);
    var panels  = $$(".chapter", track);
    var dots    = $$(".pager-dots button");
    var bar     = $(".pager-progress");
    var total   = panels.length;
    var idx       = 0;
    var animating = false;

    // index of the hero chapter (the one that holds the play-to-watch film)
    var heroIdx = panels.indexOf
      ? panels.indexOf($(".chapter.hero", track))
      : 0;
    if (heroIdx < 0) heroIdx = 0;

    function go(n) {
      n = Math.max(0, Math.min(total - 1, n));
      idx = n;
      animating = true;
      track.style.transform = "translateX(" + (-idx * 100) + "vw)";
      dots.forEach(function (d, i) { d.classList.toggle("active", i === idx); });
      if (bar) bar.style.width = ((idx) / (total - 1) * 100) + "%";

      // leaving the hero → stop the film and restore the orca still
      if (idx !== heroIdx) resetHeroVideo();

      // always enter a chapter at the top of its (possibly scrollable) content
      var tin = panels[idx] && panels[idx].querySelector(".chapter__inner");
      if (tin) tin.scrollTop = 0;
      $$(".reveal", panels[idx]).forEach(function (e) { e.classList.add("in"); });
      setTimeout(function () { animating = false; }, 1000);
    }

    /* helper: is the current chapter's inner taller than its frame? */
    function activeInner() {
      var a = panels[idx];
      return a ? a.querySelector(".chapter__inner") : null;
    }

    /* wheel — scroll inside a tall chapter; page only at its edges */
    var wheelLock = false;
    pager.addEventListener("wheel", function (e) {
      var inner = activeInner();
      var scrollable = inner && inner.scrollHeight > inner.clientHeight + 4;

      if (scrollable) {
        var down     = e.deltaY > 0;
        var atTop    = inner.scrollTop <= 0;
        var atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 1;
        // still room to scroll in this direction → let the chapter scroll natively
        if ((down && !atBottom) || (!down && !atTop)) return;
      }

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

    /* touch swipe (Tinder-style). On tall chapters a vertical drag scrolls
       natively; a clearly horizontal swipe pages. */
    var sx = 0, sy = 0, dragging = false;
    track.addEventListener("touchstart", function (e) {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; dragging = true;
    }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (!dragging) return; dragging = false;
      if (animating) return;
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      var H = 55;   // swipe distance threshold

      // 1) horizontal swipe → page either way, AT ANY POINT (even mid-scroll)
      if (Math.abs(dx) > H && Math.abs(dx) > Math.abs(dy)) {
        go(idx + (dx < 0 ? 1 : -1));
        return;
      }
      // 2) vertical swipe → continue the scroll INTO the next/prev chapter
      //    once the current chapter has been scrolled to its edge.
      if (Math.abs(dy) > H && Math.abs(dy) > Math.abs(dx)) {
        var inner = activeInner();
        var scrollable = inner && inner.scrollHeight > inner.clientHeight + 4;
        if (!scrollable) {                       // short chapter → swipe just pages
          go(idx + (dy < 0 ? 1 : -1));
          return;
        }
        var atTop    = inner.scrollTop <= 2;
        var atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 2;
        if (dy < 0 && atBottom) go(idx + 1);     // swiped up at the bottom → next
        else if (dy > 0 && atTop) go(idx - 1);   // swiped down at the top → previous
      }
    }, { passive: true });

    /* mouse / trackpad DRAG to swipe chapters (desktop). Touch keeps its own
       handler above; we ignore touch pointers here to avoid double-paging. */
    var pdown = false, pStartX = 0, pStartY = 0, pHoriz = null, vw = window.innerWidth;
    var IGNORE = "a,button,input,textarea,select,iframe,.hero-play,.pager-dots,[data-go],.media-zoom,.load-prototype-btn";

    pager.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;        // touchscreens use the touch swipe
      if (e.button !== 0) return;                   // primary button only
      if (e.target.closest && e.target.closest(IGNORE)) return;
      if (animating) return;
      pdown = true; pHoriz = null; vw = window.innerWidth;
      pStartX = e.clientX; pStartY = e.clientY;
    });

    pager.addEventListener("pointermove", function (e) {
      if (!pdown) return;
      var dx = e.clientX - pStartX, dy = e.clientY - pStartY;

      if (pHoriz === null) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;   // wait for intent
        pHoriz = Math.abs(dx) > Math.abs(dy);
        if (!pHoriz) {                                       // vertical intent → let chapter scroll
          var inner = activeInner();
          if (inner && inner.scrollHeight > inner.clientHeight + 4) { pdown = false; return; }
        }
        if (pHoriz) {
          track.classList.add("dragging");
          pager.classList.add("is-grabbing");
          document.body.classList.add("is-grabbing");
          try { pager.setPointerCapture(e.pointerId); } catch (_) {}
        }
      }
      if (!pHoriz) return;
      e.preventDefault();

      var offset = dx;
      // rubber-band at the two ends so it feels physical, not stuck
      if ((idx === 0 && dx > 0) || (idx === total - 1 && dx < 0)) offset = dx * 0.35;
      track.style.transform = "translateX(calc(" + (-idx * 100) + "vw + " + offset + "px))";
    });

    function endDrag(e) {
      if (!pdown) return;
      pdown = false;
      track.classList.remove("dragging");
      pager.classList.remove("is-grabbing");
      document.body.classList.remove("is-grabbing");
      if (!pHoriz) return;
      var dx = e.clientX - pStartX;
      var threshold = Math.min(140, vw * 0.12);
      if (Math.abs(dx) > threshold) go(idx + (dx < 0 ? 1 : -1));
      else go(idx);                                  // snap back smoothly
    }
    pager.addEventListener("pointerup", endDrag);
    pager.addEventListener("pointercancel", endDrag);
    pager.addEventListener("pointerleave", function (e) { if (pdown && pHoriz) endDrag(e); });

    window.addEventListener("resize", function () {
      track.style.transform = "translateX(" + (-idx * 100) + "vw)";
    });

    go(0);
  }

  /* -----------------------------------------------------------------
     INIT
  ------------------------------------------------------------------ */
  function init() {
    wireMedia(); wireReveals(); wireNav(); wireForms(); wireHeroVideo(); wirePager();
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
   SECONDARY behaviour (scroll progress · auto-hide nav · contact form ·
   prototype loader). Unchanged.
   ===================================================================== */
(function() {
  "use strict";

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
  updateProgress();

  const nav = document.querySelector('.nav');
  if (!nav) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateNav = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > 80) { nav.classList.add('scrolled'); }
    else { nav.classList.remove('scrolled'); }
    if (currentScrollY > lastScrollY && currentScrollY > 140) { nav.classList.add('nav--hidden'); }
    else { nav.classList.remove('nav--hidden'); }
    lastScrollY = currentScrollY;
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => { updateNav(); updateProgress(); });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  updateNav();
  updateProgress();
})();

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  const successMessage = document.getElementById('successMessage');
  const submitBtn = document.getElementById('submitBtn');

  if (!form || !successMessage) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    clearErrors();

    let isValid = true;
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');

    if (!name.value.trim()) { showError(name, 'Please enter your name'); isValid = false; }
    if (!email.value.trim()) { showError(email, 'Please enter your email'); isValid = false; }
    else if (!isValidEmail(email.value)) { showError(email, 'Please enter a valid email address'); isValid = false; }
    if (!message.value.trim()) { showError(message, 'Please enter a message'); isValid = false; }

    if (isValid) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';
      setTimeout(() => {
        form.style.display = 'none';
        successMessage.style.display = 'block';
      }, 1200);
    }
  });

  function showError(input, message) {
    const field = input.parentElement;
    field.classList.add('error');
    const errorSpan = field.querySelector('.error-message');
    if (errorSpan) errorSpan.textContent = message;
  }

  function clearErrors() {
    document.querySelectorAll('.field').forEach(field => {
      field.classList.remove('error');
      const error = field.querySelector('.error-message');
      if (error) error.textContent = '';
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});

// Lazy Load Figma Prototype (Click to Load)
document.addEventListener('DOMContentLoaded', function () {
  function closeAllPrototypes() {
    document.querySelectorAll('.prototype-preview').forEach(p => p.style.display = 'block');
    document.querySelectorAll('.prototype-embed').forEach(e => e.style.display = 'none');
  }

  document.querySelectorAll('.load-prototype-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopImmediatePropagation();
      const id = this.getAttribute('data-load');
      if (!id) return;
      const preview = document.getElementById('preview-' + id);
      const embed = document.getElementById('embed-' + id);
      if (preview && embed) {
        closeAllPrototypes();
        preview.style.display = 'none';
        embed.style.display = 'block';
      }
    });
  });

  document.querySelectorAll('.prototype-preview').forEach(function (preview) {
    preview.addEventListener('click', function () {
      const id = this.id.replace('preview-', '');
      const embed = document.getElementById('embed-' + id);
      if (embed && embed.style.display === 'block') {
        this.style.display = 'block';
        embed.style.display = 'none';
      }
    });
  });
});
/* =====================================================================
   GLOBAL: image tiles — lazy/async decode, expand button, lightbox.
   Append to script.js (end of file). Auto-applies to every .plate and
   .proj-card media on ANY page (process now, work later) — no markup.
   ===================================================================== */
(function () {
  "use strict";
  function ready(fn){ if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn(); }

  ready(function () {
    var EXPAND_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
    var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

    /* one shared lightbox for the whole site */
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Close">&times;</button>' +
      '<img class="lightbox__img" alt="">' +
      '<div class="lightbox__cap"></div>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector(".lightbox__img");
    var lbCap = lb.querySelector(".lightbox__cap");
    var lbClose = lb.querySelector(".lightbox__close");

    function open(src, cap) {
      if (!src) return;
      lbImg.src = src; lbImg.alt = cap || ""; lbCap.textContent = cap || "";
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
      raf(function () { lb.classList.add("show"); });
    }
    function close() {
      lb.classList.remove("show");
      document.body.style.overflow = "";
      setTimeout(function () { lb.classList.remove("open"); lbImg.removeAttribute("src"); }, 280);
    }
    lbClose.addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("open")) close();
    });

    function captionFor(box) {
      var plate = box.closest(".plate");
      var t = plate && plate.querySelector(".plate__cap .t");
      if (t) return t.textContent.trim();
      var card = box.closest(".proj-card");
      var h = card && card.querySelector("h3");
      return h ? h.textContent.trim() : "";
    }

    /* wire every image tile on the page */
    var tiles = [].slice.call(document.querySelectorAll(".plate .media, .proj-card .media"));
    tiles.forEach(function (box) {
      var img = box.querySelector("img");
      if (!img) return;

      /* perf: defer load + decode off the main thread */
      if (!img.getAttribute("loading"))  img.setAttribute("loading", "lazy");
      if (!img.getAttribute("decoding")) img.setAttribute("decoding", "async");

      /* expand button */
      if (!box.querySelector(".media-zoom")) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "media-zoom";
        b.setAttribute("aria-label", "Expand image");
        b.innerHTML = EXPAND_SVG;
        box.appendChild(b);
        b.addEventListener("click", function (e) {
          e.preventDefault(); e.stopPropagation();     /* don't follow a card link */
          open(img.currentSrc || img.src, captionFor(box));
        });
      }

      /* whole-tile zoom on galleries (.plate) — but never inside a card <a> */
      if (box.closest(".plate") && !box.closest("a")) {
        box.addEventListener("click", function () {
          open(img.currentSrc || img.src, captionFor(box));
        });
      }
    });
  });
})();
/* =====================================================================
   MOBILE-ONLY REFINEMENTS  (append to script.js, end of file)
   Additive only — does NOT touch existing functions, structure or
   desktop behaviour. Both blocks are gated to (max-width:760px).
   ===================================================================== */

/* A · INDEX NAV AUTO-HIDE driven by the in-chapter scroll.
   The sub-pages already hide/show the nav on window scroll, but the
   index scrolls INSIDE .chapter__inner, so the window listener never
   fires and the bar overlaps content. This mirrors the same behaviour
   (scroll down → bar slides up; scroll up → it returns) using the
   existing .scrolled / .nav--hidden classes. Mobile only. */
(function () {
  "use strict";
  if (!document.querySelector(".pager")) return;             // index page only
  var nav = document.querySelector(".nav");
  if (!nav) return;
  var mq = window.matchMedia("(max-width:760px)");
  var inners = [].slice.call(document.querySelectorAll(".chapter__inner"));
  var ticking = false;

  function apply(el) {
    var y = el.scrollTop;
    var last = el.__navLastY || 0;
    if (y > 80) nav.classList.add("scrolled"); else nav.classList.remove("scrolled");
    if (y > last && y > 120) nav.classList.add("nav--hidden");
    else nav.classList.remove("nav--hidden");
    el.__navLastY = y;
    ticking = false;
  }

  inners.forEach(function (el) {
    el.addEventListener("scroll", function () {
      if (!mq.matches) return;                                 // desktop untouched
      if (!ticking) {
        ticking = true;
        var t = el;
        window.requestAnimationFrame(function () { apply(t); });
      }
    }, { passive: true });
  });

  /* if the viewport grows back to desktop, restore the bar */
  if (mq.addEventListener) {
    mq.addEventListener("change", function () {
      if (!mq.matches) { nav.classList.remove("nav--hidden"); nav.classList.remove("scrolled"); }
    });
  }
})();
