/* Keep campaign attribution and section links when an old DAB URL moves. */
(() => {
  'use strict';
  const canonical = document.querySelector('link[rel="canonical"]');
  const refresh = document.querySelector('meta[http-equiv="refresh" i]');
  if (!canonical || !refresh) return;
  let target;
  try { target = new URL(canonical.href); } catch (_) { return; }
  if (target.origin !== 'https://dabgestion.com' || target.pathname === window.location.pathname) return;
  target.search = window.location.search;
  target.hash = window.location.hash;
  // Update the existing fallback as well, so both navigation paths agree.
  refresh.content = '0; url=' + target.href;
  document.querySelectorAll('a[href]').forEach(anchor => {
    if (anchor.href === canonical.href) anchor.href = target.href;
  });
  window.location.replace(target.href);
})();
