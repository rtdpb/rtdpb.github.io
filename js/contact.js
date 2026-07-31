// js/contact.js — Web3Forms AJAX submit for the goZERO contact form.
// Loaded on contact.html ONLY, AFTER components.js + i18n.js (see contact.html script order).
// Does NOT modify i18n.js/components.js. All user-facing copy comes from pre-stamped
// data-i18n nodes the i18n engine fills — this file only toggles visibility + reads labels.

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
