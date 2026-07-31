// js/contact.js — Web3Forms AJAX submit for the goZERO contact form.
// Loaded on contact.html ONLY, AFTER components.js + i18n.js (see contact.html script order).
// Does NOT modify i18n.js/components.js. All user-facing copy comes from pre-stamped
// data-i18n nodes the i18n engine fills — this file only toggles visibility + reads labels.

// Short, tasteful sun-burst of little spark particles (pure canvas, no lib).
// Fired when the success panel appears. Respects reduced-motion (no-op).
function sunBurst(origin) {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  document.body.appendChild(canvas);

  const colors = ['#F4C430', '#E6B41F', '#F6D67A', '#52B788', '#FFFFFF'];
  const parts = [];
  for (let i = 0; i < 48; i++) {
    const a = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 1.2;  // fan out, mostly upward
    const sp = 4 + Math.random() * 6;
    parts.push({
      x: origin.x, y: origin.y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      g: 0.12 + Math.random() * 0.08,
      size: 4 + Math.random() * 4,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      color: colors[i % colors.length],
      life: 0, ttl: 60 + Math.random() * 30,
      circle: Math.random() < 0.3
    });
  }
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of parts) {
      if (p.life > p.ttl) continue;
      p.life++; alive = true;
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.ttl);
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
      if (p.circle) { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
    if (alive) requestAnimationFrame(frame); else canvas.remove();
  }
  frame();
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const button    = form.querySelector('button[type="submit"]');
  const honeypot  = form.querySelector('[name="botcheck_url"]');
  const successEl = document.getElementById('contact-success');
  const errorEl   = document.getElementById('contact-error');
  const sendingEl = document.getElementById('label-sending'); // translated "Verzenden…"
  const submitEl  = document.getElementById('label-submit');  // translated "Verstuur bericht"

  const ENDPOINT = 'https://api.web3forms.com/submit';

  function showError() {
    errorEl.hidden = false;        // keep the form visible so the user can retry / read fallback email
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();            // D-01: stay on page; native validation already blocked invalid input (D-05)

    // Spam layer 2: off-screen honeypot. A real user can never fill it. Abort silently.
    if (honeypot && honeypot.value !== '') return;

    // Reset any previously shown error so a retry starts clean.
    errorEl.hidden = true;

    // Loading state (CONT-04 / D-08) — read the TRANSLATED label, never a literal string.
    button.disabled = true;
    button.textContent = (sendingEl && sendingEl.textContent) || button.textContent;

    try {
      const object = Object.fromEntries(new FormData(form));
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'   // REQUIRED — without it Web3Forms redirects instead of returning JSON
        },
        body: JSON.stringify(object)
      });
      const data = await res.json();     // { success, message }
      console.log('[contact] web3forms:', data.message); // message is English-only → console ONLY

      if (data.success) {
        form.hidden = true;              // hide the form entirely (CONT-05 / D-06)
        successEl.hidden = false;
        if (successEl.focus) successEl.focus(); // move SR/keyboard focus to the confirmation
        // Reward: a short sun-burst from the top-centre of the confirmation panel.
        const r = successEl.getBoundingClientRect();
        sunBurst({ x: r.left + r.width / 2, y: r.top + 30 });
      } else {
        // success:false — e.g. the placeholder access key (expected during build, RESEARCH pitfall 3)
        showError();                     // CONT-06 / D-07
      }
    } catch (err) {
      console.error('[contact]', err);   // network / CORS / non-JSON response
      showError();
    } finally {
      // Restore the idle (translated) label + re-enable, so a user can retry after an error.
      button.disabled = false;
      button.textContent = (submitEl && submitEl.textContent) || button.textContent;
    }
  });
});
