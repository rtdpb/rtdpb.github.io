// js/i18n.js — language detection + JSON fetch + DOM replacement. Loads AFTER components.js.

const SUPPORTED = ['nl', 'en', 'de'];
const DEFAULT_LANG = 'nl';
const STORAGE_KEY = 'gozero-lang';

function detectLang() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;
  const browser = (navigator.language || '').slice(0, 2).toLowerCase();
  return SUPPORTED.includes(browser) ? browser : DEFAULT_LANG;
}

function resolveDotKey(obj, dotKey) {
  return dotKey.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

function applyTranslations(translations) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = resolveDotKey(translations, el.dataset.i18n);
    if (val !== undefined) el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const val = resolveDotKey(translations, el.dataset.i18nPlaceholder);
    if (val !== undefined) el.placeholder = val;
  });
}

async function setLang(lang) {
  if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;          // WCAG 3.1.1 / EAA compliance
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
  });
  try {
    const res = await fetch(`/locales/${lang}.json`);
    if (!res.ok) throw new Error(`Missing: ${lang}.json`);
    const translations = await res.json();
    applyTranslations(translations);
  } catch (err) {
    console.error('[i18n]', err);
    if (lang !== DEFAULT_LANG) await setLang(DEFAULT_LANG); // graceful fallback
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
  setLang(detectLang());
});
