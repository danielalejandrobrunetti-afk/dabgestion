document.addEventListener('DOMContentLoaded',()=>{if(!document.querySelector('link[data-dab-unified]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/unified.css?v=2c-20261022';l.dataset.dabUnified='1';document.head.appendChild(l)}const logoUrl='/assets/dab-logo-2c.svg?v=20261022';const faviconUrl='/assets/dab-icon-2c.svg?v=20261022';let favicon=document.querySelector('link[rel="icon"],link[rel="shortcut icon"]');if(!favicon){favicon=document.createElement('link');favicon.rel='icon';document.head.appendChild(favicon)}favicon.type='image/svg+xml';favicon.href=faviconUrl;const logo='<img src="'+logoUrl+'" alt="DAB Prevención y Gestión" decoding="async">';document.querySelectorAll('.brand').forEach(brand=>{brand.classList.add('brand-logo');brand.innerHTML=logo});document.querySelectorAll('.logo-link img,.brand-logo img,.footer img').forEach(img=>{img.src=logoUrl;img.alt='DAB Prevención y Gestión';img.decoding='async'});const heroLogo=document.querySelector('.logo-link img');if(heroLogo){heroLogo.fetchPriority='high';heroLogo.loading='eager'}document.querySelectorAll('.footer img').forEach(img=>{img.loading='lazy'});document.querySelectorAll('.footer h3').forEach(h=>{h.classList.add('footer-brand');h.innerHTML=logo});document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(id.length>1){const el=document.querySelector(id);if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'})}}}));});

(() => {
  const loadAssistant = () => {
    if (document.getElementById('dab-assistant') || document.querySelector('script[data-dab-assistant]')) return;
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = '/assistant.css?v=20261023-3';
    const script = document.createElement('script');
    script.src = '/assistant.js?v=20261023-3';
    script.async = true;
    script.dataset.dabAssistant = '1';
    style.addEventListener('load', () => document.body.appendChild(script), { once: true });
    document.head.appendChild(style);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadAssistant, { once: true });
  else loadAssistant();
})();
