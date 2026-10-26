/* DAB: page views and contact clicks. Contact clicks do not prove a message was sent. */
(() => {
  'use strict';
  if (!['dabgestion.com', 'www.dabgestion.com'].includes(window.location.hostname)) return;
  if (window.__dabAnalyticsInstalled) return;
  window.__dabAnalyticsInstalled = true;

  const measurementId = 'G-0JC4Y7FJCT';
  const pagePath = window.location.pathname;
  const pageLocation = window.location.origin + pagePath;
  let referrer = '';
  try {
    if (document.referrer) {
      const source = new URL(document.referrer);
      referrer = source.origin + source.pathname;
    }
  } catch (_) { /* Invalid referrers add no useful attribution. */ }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  const config = {
    page_location: pageLocation,
    page_referrer: referrer,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  };
  if (new URLSearchParams(window.location.search).get('_dab_debug') === '1') config.debug_mode = true;
  window.gtag('config', measurementId, config);
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.appendChild(tag);

  const serviceFromPath = () => {
    if (pagePath.includes('puesta-tierra') || pagePath.includes('puesta-a-tierra')) return 'puesta_tierra';
    if (pagePath.includes('ruido')) return 'ruido_laboral';
    if (pagePath.includes('iluminacion')) return 'iluminacion';
    if (pagePath.includes('carga') && pagePath.includes('fuego')) return 'carga_fuego';
    if (pagePath.includes('incendio')) return 'planos_incendio';
    if (pagePath.includes('mediciones')) return 'mediciones';
    if (pagePath.includes('capacitacion')) return 'capacitaciones';
    if (pagePath.includes('higiene-seguridad')) return 'higiene_seguridad';
    if (pagePath.includes('psicotecnico')) return 'psicotecnicos';
    return 'general';
  };

  document.addEventListener('click', event => {
    if (typeof event.button === 'number' && event.button !== 0) return;
    const anchor = event.target && event.target.closest && event.target.closest('a[href]');
    if (!anchor) return;
    let target;
    try { target = new URL(anchor.getAttribute('href'), window.location.href); } catch (_) { return; }
    let eventName, method;
    if (target.protocol === 'tel:') { eventName = 'phone_click'; method = 'phone'; }
    else if (target.protocol === 'mailto:') { eventName = 'email_click'; method = 'email'; }
    else if (target.protocol === 'https:' && ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(target.hostname)) {
      eventName = 'whatsapp_click'; method = 'whatsapp';
    } else return;
    const declared = anchor.dataset.service || document.body.dataset.service;
    const service = declared && /^[a-z0-9_]{1,40}$/.test(declared) ? declared : serviceFromPath();
    window.gtag('event', eventName, {
      send_to: measurementId,
      contact_method: method,
      contact_position: anchor.closest(".home-hero, .hero") ? "hero" : anchor.closest("footer") ? "footer" : anchor.closest("header") ? "header" : "content",
      service: service,
      page_path: pagePath,
      page_location: pageLocation
    });
  }, true);
})();
