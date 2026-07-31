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
            <!-- Mobile-only language switcher: lives in the top bar (between logo and
                 hamburger) so switching language never requires opening the menu.
                 Hidden on desktop, where the in-menu switcher is used instead. -->
            <div class="lang-switcher lang-switcher--top" role="group" aria-label="Language">
              <button type="button" data-lang="nl">NL</button>
              <button type="button" data-lang="en">EN</button>
              <button type="button" data-lang="de">DE</button>
            </div>
            ${toggle}
            <div class="nav-menu" id="nav-menu">
              <ul class="nav-links">
                <li><a href="/index.html#diensten" data-i18n="nav.diensten"></a></li>
                <li><a href="/index.html#zo-werkt-het" data-i18n="nav.howto"></a></li>
                <li><a href="/index.html#uitbreiden" data-i18n="nav.uitbreiden"></a></li>
                <li><a href="/index.html#faq" data-i18n="nav.faq"></a></li>
              </ul>
              <div class="lang-switcher" role="group" aria-label="Language">
                <button type="button" data-lang="nl">NL</button>
                <button type="button" data-lang="en">EN</button>
                <button type="button" data-lang="de">DE</button>
              </div>
              <a href="/contact.html" class="nav-cta" data-i18n="nav.contact"></a>
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
          <div class="footer-col footer-brand">
            <img src="/img/logo.png" alt="goZERO" class="footer-logo" height="34">
            <p class="footer-tagline" data-i18n="footer.tagline"></p>
            <div class="lang-switcher lang-switcher--footer" role="group" aria-label="Language">
              <button type="button" data-lang="nl">NL</button>
              <button type="button" data-lang="en">EN</button>
              <button type="button" data-lang="de">DE</button>
            </div>
          </div>
          <nav class="footer-col footer-nav" aria-label="Footer">
            <h3 class="footer-heading" data-i18n="footer.nav.heading"></h3>
            <ul class="footer-list">
              <li><a href="/index.html#diensten" data-i18n="nav.diensten"></a></li>
              <li><a href="/index.html#zo-werkt-het" data-i18n="nav.howto"></a></li>
              <li><a href="/index.html#uitbreiden" data-i18n="nav.uitbreiden"></a></li>
              <li><a href="/index.html#faq" data-i18n="footer.faq"></a></li>
            </ul>
          </nav>
          <div class="footer-col footer-contact">
            <h3 class="footer-heading" data-i18n="footer.contact.heading"></h3>
            <a href="/contact.html" class="footer-cta" data-i18n="footer.contact_cta"></a>
          </div>
        </div>
        <div class="footer-bottom">
          <span class="footer-copy" data-i18n="footer.copy"></span>
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

// Day↔night for the upsell section. It stays "day" until you scroll past a
// threshold, then it flips to "night" with a smooth CSS transition (sun→moon,
// scene darkens, white pills → dark, dark text → white). Scrolling back up past
// the threshold flips it back. Hysteresis avoids flicker right at the line.
function initCelestial() {
  const section = document.querySelector('.section.upsell');
  if (!section) return;

  let isNight = false;
  function setNight(on) {
    if (on === isNight) return;
    isNight = on;
    section.classList.toggle('is-night', on);
  }

  let ticking = false;
  function check() {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    // Flip to night once the section top passes ~25% up the viewport (i.e. a bit
    // further down the page); back to day after it drops below 44% (hysteresis).
    if (!isNight && rect.top < vh * 0.25) setNight(true);
    else if (isNight && rect.top > vh * 0.44) setNight(false);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }

  // Debug hook: ?night=1 / ?night=0 pins the state for screenshots.
  const forced = new URLSearchParams(location.search).get('night');
  if (forced !== null) { setNight(forced !== '0'); return; }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  check();
}
document.addEventListener('DOMContentLoaded', initCelestial);

// Stat count-up (dark monitoring band). Each .stat-num animates 0 → target the
// first time the stats row scrolls into view. Suffixes ("+", " werkdagen") are
// preserved; the leading number is parsed from whatever text is present (so the
// i18n "2 werkdagen" value works in NL/EN/DE). Reduced-motion → leave as-is.
function initCountUp() {
  const row = document.querySelector('.stats-row');
  if (!row) return;
  const nums = row.querySelectorAll('.stat-num');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;  // show final values as-is

  // Split "1.100+" → {target:1100, suffix:"+", grouped:true}; "2 werkdagen" →
  // {target:2, suffix:" werkdagen", grouped:false}. Returns null if no leading digit.
  function parse(text) {
    const m = String(text).match(/^\s*([\d.,]+)(.*)$/);
    if (!m) return null;
    const digits = m[1].replace(/[.,]/g, '');
    if (!digits) return null;
    return { target: parseInt(digits, 10), suffix: m[2], grouped: /[.,]/.test(m[1]) };
  }
  function fmt(n, grouped) { return grouped ? n.toLocaleString('nl-NL') : String(n); }

  function animate(el) {
    const spec = parse(el.textContent);
    if (!spec) return;                          // i18n hasn't filled it yet → leave alone
    const DUR = 1100;
    let start = null;
    function frame(ts) {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / DUR, 1);
      const eased = 1 - Math.pow(1 - p, 3);     // easeOutCubic
      el.textContent = fmt(Math.round(eased * spec.target), spec.grouped) + spec.suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  let done = false;
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting && !done) {
        done = true;
        nums.forEach(animate);
        io.disconnect();
      }
    });
  }, { threshold: 0.4 });
  io.observe(row);
}
document.addEventListener('DOMContentLoaded', initCountUp);

// Scroll-spy — highlight the nav link whose section is currently in view (#22).
function initScrollSpy() {
  if (!('IntersectionObserver' in window)) return;
  const links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href*="#"]'));
  const map = {};
  links.forEach(function (a) {
    const id = (a.getAttribute('href').split('#')[1] || '');
    const sec = id && document.getElementById(id);
    if (sec) map[id] = a;
  });
  const ids = Object.keys(map);
  if (!ids.length) return;
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        links.forEach(function (a) { a.classList.remove('is-active'); });
        map[en.target.id].classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  ids.forEach(function (id) { io.observe(document.getElementById(id)); });
}
document.addEventListener('DOMContentLoaded', initScrollSpy);

// Scroll-progress "sunbeam" — a thin golden bar fixed at the very top that fills
// as you scroll. Injected here so it appears on every page (both load this file).
// Fixed + pointer-events:none → never affects layout or the sticky nav.
function initScrollBeam() {
  const beam = document.createElement('div');
  beam.className = 'scroll-beam';
  beam.setAttribute('aria-hidden', 'true');
  document.body.appendChild(beam);
  let ticking = false;
  function apply() {
    ticking = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? (window.scrollY || doc.scrollTop) / max : 0;
    beam.style.transform = 'scaleX(' + Math.min(Math.max(p, 0), 1) + ')';
  }
  const onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(apply); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  apply();
}
document.addEventListener('DOMContentLoaded', initScrollBeam);

// Floating light "motes" — a handful of very faint, very slow golden particles
// drifting upward sitewide (like sunlight in the air). Kept extremely subtle so
// it never competes with content. Skipped entirely for reduced-motion.
function initMotes() {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  const layer = document.createElement('div');
  layer.className = 'motes';
  layer.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 10; i++) {   // fewer, calmer motes (#118)
    const m = document.createElement('span');
    m.className = 'mote';
    const size = (3 + Math.random() * 3).toFixed(1);
    m.style.left = (Math.random() * 100).toFixed(1) + '%';
    m.style.width = size + 'px';
    m.style.height = size + 'px';
    m.style.animationDuration = (18 + Math.random() * 16).toFixed(1) + 's';
    m.style.animationDelay = (-Math.random() * 30).toFixed(1) + 's';
    m.style.opacity = (0.12 + Math.random() * 0.16).toFixed(2);
    layer.appendChild(m);
  }
  document.body.appendChild(layer);
}
document.addEventListener('DOMContentLoaded', initMotes);

// Hero photo touches: (1) subtle parallax on the background, (2) a fake-live kW
// readout that gently flickers, (3) a cursor-follow warm glow (desktop only).
function initHero() {
  const hero = document.querySelector('.hero--banner');
  if (!hero) return;
  const bg = hero.querySelector('.hero-bg');
  const val = hero.querySelector('.hero-badge-val');
  const glow = hero.querySelector('.hero-glow');
  const mm = window.matchMedia;
  const reduce = mm && mm('(prefers-reduced-motion: reduce)').matches;
  const fine = mm && mm('(pointer: fine)').matches;

  // Parallax — translate the (overscanned) background slower than the scroll.
  if (bg && !reduce) {
    let ticking = false;
    function apply() {
      ticking = false;
      const shift = Math.min((window.scrollY || 0) * 0.15, 85);  // stay within the 16% overscan
      bg.style.transform = 'translate3d(0,' + shift + 'px,0)';
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
    apply();
  }

  // Fake-live production readout that HONOURS the visitor's real clock: a solar
  // curve during daylight, 0 at night — so an evening visitor never sees "live"
  // production (which would instantly give the fake away). The sun glyph turns
  // into a moon after sunset. The value is set once for everyone (incl. reduced
  // motion); only the gentle flicker needs motion.
  const sunEl = hero.querySelector('.hero-badge-sun');
  function daylight(h) { return h > 6.5 && h < 21; }        // approx sunrise → sunset
  function solarKw(d) {
    const h = d.getHours() + d.getMinutes() / 60;
    if (!daylight(h)) return 0;                             // night → no production
    const x = (h - 13.75) / 7.25;                           // -1..1 across the daylight window
    return Math.max(0, 5.2 * Math.cos(x * Math.PI / 2) + (Math.random() * 0.3 - 0.15));
  }
  function updateBadge() {
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    if (sunEl) sunEl.textContent = daylight(h) ? '☀' : '☾';
    if (val) val.textContent = solarKw(now).toFixed(2) + ' kW';
  }
  if (val) {
    updateBadge();                                          // correct day/night value immediately
    if (!reduce) setInterval(updateBadge, 3600);            // calmer, less frequent live flicker (#18)
  }

  // Cursor-follow glow — desktop pointer-fine only.
  if (glow && fine) {
    hero.addEventListener('pointermove', function (e) {
      const r = hero.getBoundingClientRect();
      glow.style.setProperty('--gx', (e.clientX - r.left) + 'px');
      glow.style.setProperty('--gy', (e.clientY - r.top) + 'px');
      hero.classList.add('is-glowing');
    });
    hero.addEventListener('pointerleave', function () { hero.classList.remove('is-glowing'); });
  }
}
document.addEventListener('DOMContentLoaded', initHero);

// Magnetic CTAs — primary (golden) buttons nudge slightly toward the cursor on
// hover and spring back on leave. Desktop pointer-fine only; the existing
// `transition: transform` on the button eases both the follow and the release.
function initMagnetic() {
  if (!window.matchMedia) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const clamp = function (v, m) { return Math.max(-m, Math.min(m, v)); };
  document.querySelectorAll('a[role="button"], button[type="submit"]').forEach(function (btn) {
    btn.addEventListener('pointermove', function (e) {
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      btn.style.transform = 'translate(' + clamp(mx * 0.2, 12) + 'px,' + clamp(my * 0.2, 8) + 'px)';
    });
    btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
  });
}
document.addEventListener('DOMContentLoaded', initMagnetic);
