// js/components.js — shared Web Components (light DOM). Loads BEFORE i18n.js.

class SiteNav extends HTMLElement {
  connectedCallback() {
    const simple = this.getAttribute('variant') === 'simple';

    const logo = `
      <a href="/index.html" class="nav-logo" aria-label="goZERO home">
        <img src="/img/logo.png" alt="goZERO" height="36">
      </a>`;

    // Hamburger toggle (shown on mobile via CSS). Controls the .nav-menu panel.
    const toggle = `
      <button type="button" class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="nav-menu">
        <span></span><span></span><span></span>
      </button>`;

    if (simple) {
      // Contact-page variant: Home / Veelgestelde vragen + "← Terug naar home".
      // No language toggle, no CTA.
      this.innerHTML = `
        <nav class="site-nav-bar" aria-label="Hoofdmenu">
          <div class="nav-inner">
            ${logo}
            ${toggle}
            <div class="nav-menu" id="nav-menu">
              <ul class="nav-links">
                <li><a href="/index.html" data-i18n="nav.home"></a></li>
                <li><a href="/index.html#faq" data-i18n="nav.faq"></a></li>
              </ul>
              <a href="/index.html" class="nav-back">← <span data-i18n="nav.back"></span></a>
            </div>
          </div>
        </nav>
      `;
    } else {
      // Full variant (default): Diensten / Zo werkt het / Veelgestelde vragen,
      // NL/EN/DE pill toggle, green "Contact opnemen ↗" CTA.
      // Cross-page fragment anchors (/index.html#…) scroll to the homepage sections;
      // the QA gate's link resolution is fragment-aware (strips #… before disk check).
      this.innerHTML = `
        <nav class="site-nav-bar" aria-label="Hoofdmenu">
          <div class="nav-inner">
            ${logo}
            ${toggle}
            <div class="nav-menu" id="nav-menu">
              <ul class="nav-links">
                <li><a href="/index.html#diensten" data-i18n="nav.diensten"></a></li>
                <li><a href="/index.html#zo-werkt-het" data-i18n="nav.howto"></a></li>
                <li><a href="/index.html#faq" data-i18n="nav.faq"></a></li>
              </ul>
              <div class="lang-switcher" role="group" aria-label="Language">
                <button type="button" data-lang="nl">NL</button>
                <button type="button" data-lang="en">EN</button>
                <button type="button" data-lang="de">DE</button>
              </div>
            </div>
          </div>
        </nav>
      `;
    }

    this.wireInteractions();
  }

  wireInteractions() {
    const nav = this;
    const toggleBtn = this.querySelector('.nav-toggle');
    const menu = this.querySelector('.nav-menu');

    // Hamburger open/close
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        const open = nav.classList.toggle('is-open');
        toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      // Close the menu when any link inside it is tapped (same-page fragment
      // links don't reload, so we collapse it ourselves).
      if (menu) {
        menu.addEventListener('click', function (e) {
          if (e.target.closest('a')) {
            nav.classList.remove('is-open');
            toggleBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }
    }

    // Frosted shadow on the sticky bar once the page is scrolled
    const bar = this.querySelector('.site-nav-bar');
    if (bar) {
      const onScroll = function () { bar.classList.toggle('is-scrolled', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <img src="/img/logo.png" alt="goZERO" class="footer-logo" height="28">
            <p class="footer-tagline" data-i18n="footer.tagline"></p>
          </div>
          <div class="footer-links">
            <a href="/index.html#faq" data-i18n="footer.faq"></a>
            <a href="/contact.html" data-i18n="footer.contact_cta"></a>
            <span class="footer-copy" data-i18n="footer.copy"></span>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('site-nav', SiteNav);
customElements.define('site-footer', SiteFooter);

// Scroll-reveal: fade + rise sections into view. Gated by prefers-reduced-motion
// and matched to the CSS in main.css §8 (which only hides elements when html.js is set).
function initReveal() {
  const sel = '.hero-copy > *, .hero-art, .help-head, .help-card, ' +
              '.monitor-intro, .monitor-panel, .monitor-step, .stat, ' +
              '.upsell-head, .upsell-pill, .upsell-step, .upsell-foot, ' +
              '.quote-card, .faq-intro-col, .faq-list details, .cta-inner';
  const els = document.querySelectorAll(sel);
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // No IntersectionObserver or user prefers reduced motion → show everything now.
  if (!('IntersectionObserver' in window) || reduce) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var ioFired = false;
  const io = new IntersectionObserver(function (entries) {
    ioFired = true;
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('is-visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  els.forEach(function (el) { io.observe(el); });

  // Failsafe: if the observer never delivers a callback (headless renderers, or
  // any edge case), reveal everything so content can NEVER stay invisible. When
  // IO works normally (real browsers) it fires within a frame, so this no-ops
  // and the full scroll-reveal is preserved.
  setTimeout(function () {
    if (!ioFired) { els.forEach(function (el) { el.classList.add('is-visible'); }); }
  }, 1500);
}
document.addEventListener('DOMContentLoaded', initReveal);

// Scroll-driven celestial: the sun arcs left→right across the upsell section as you
// scroll down and crossfades into a moon; scrolling up reverses it (progress is tied
// to the section's position, so it's fully bidirectional).
function initCelestial() {
  const section = document.querySelector('.section.upsell');
  const track = document.querySelector('.celestial');
  const body = document.querySelector('.celestial-body');
  const sun = document.querySelector('.celestial-sun');
  const moon = document.querySelector('.celestial-moon');
  const art = document.querySelector('.upsell-art');
  if (!section || !track || !body) return;

  function clamp(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

  function update(force) {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    // 0 when the section top reaches the viewport bottom, 1 when its bottom leaves the top
    const p = (typeof force === 'number') ? clamp(force) : clamp((vh - rect.top) / (rect.height + vh));
    const travel = track.clientWidth - body.offsetWidth;
    const x = p * travel;
    const y = -Math.sin(p * Math.PI) * 20;   // gentle day-arc: highest in the middle
    body.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    // Overlapping crossfade, weighted late so it stays a sun longer and the moon
    // appears later (both partly visible around p≈0.65 → smooth morph)
    if (sun) sun.style.opacity = String(clamp(1.9 - p * 2.2));
    if (moon) moon.style.opacity = String(clamp((p - 0.5) * 2.4));
    // The scene gradually darkens toward night as the moon rises
    if (art) art.style.filter = 'brightness(' + (1 - p * 0.4).toFixed(3) + ') saturate(' + (1 - p * 0.18).toFixed(3) + ')';
  }

  var ticking = false;
  // NB: wrap update so the rAF timestamp isn't passed as the `force` argument.
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { update(); }); } }

  // Debug hook: ?celp=0.5 pins the sun/moon at a fixed progress (for screenshots).
  const forced = new URLSearchParams(location.search).get('celp');
  if (forced !== null) { update(parseFloat(forced)); return; }

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { update(0.12); return; }   // static sun, don't animate on scroll
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}
document.addEventListener('DOMContentLoaded', initCelestial);
