// js/components.js — shared Web Components (light DOM). Loads BEFORE i18n.js.

class SiteNav extends HTMLElement {
  connectedCallback() {
    const simple = this.getAttribute('variant') === 'simple';

    const logo = `
      <a href="/index.html" class="nav-logo" aria-label="goZERO home">
        <img src="/img/logo.png" alt="goZERO" height="36">
      </a>`;

    if (simple) {
      // Contact-page variant: Home / Veelgestelde vragen + "← Terug naar home".
      // No language toggle, no CTA.
      this.innerHTML = `
        <nav class="site-nav-bar" aria-label="Hoofdmenu">
          <div class="nav-inner">
            ${logo}
            <div class="nav-menu">
              <ul class="nav-links">
                <li><a href="/index.html" data-i18n="nav.home"></a></li>
                <li><a href="/index.html#faq" data-i18n="nav.faq"></a></li>
              </ul>
              <a href="/index.html" class="nav-back">← <span data-i18n="nav.back"></span></a>
            </div>
          </div>
        </nav>
      `;
      return;
    }

    // Full variant (default): Diensten / Zo werkt het / Veelgestelde vragen,
    // NL/EN/DE pill toggle, green "Contact opnemen ↗" CTA.
    // Cross-page fragment anchors (/index.html#…) scroll to the homepage sections;
    // the QA gate's link resolution is fragment-aware (strips #… before disk check).
    this.innerHTML = `
      <nav class="site-nav-bar" aria-label="Hoofdmenu">
        <div class="nav-inner">
          ${logo}
          <div class="nav-menu">
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
