// Light/dark toggle. The initial theme is set by the inline script in each page's <head>,
// so pages never flash the wrong theme. All content is static HTML and works without JavaScript.
(() => {
  'use strict';
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (!toggle) return;

  function apply(theme) {
    root.dataset.theme = theme;
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    if (themeColor) themeColor.content = theme === 'dark' ? '#262624' : '#f9f3e7';
  }

  apply(root.dataset.theme === 'dark' ? 'dark' : 'light');

  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('jiekai-theme', next); } catch (e) { /* storage unavailable */ }
  });
})();
