/* DAB's guided service assistant. Visitor text stays on this page until WhatsApp is opened. */
(() => {
  'use strict';

  const services = {
    puesta_tierra: {
      label: 'Puesta a tierra', path: '/medicion-puesta-tierra-mendoza/',
      description: 'Relevamiento de puesta a tierra y continuidad de masas, con protocolo e informe técnico según el alcance acordado.',
      question: '¿Cuántos tableros, equipos o puntos necesitás evaluar? Si todavía no lo sabés, podés indicarlo.',
      cost: 'la cantidad de tableros y equipos, las sedes y las condiciones de acceso'
    },
    ruido_laboral: {
      label: 'Ruido laboral', path: '/medicion-ruido-laboral-mendoza/',
      description: 'Evaluación de niveles sonoros en puestos y sectores de trabajo, con informe y protocolo según el alcance definido.',
      question: '¿Qué sectores o puestos necesitás evaluar y en qué horarios trabajan?',
      cost: 'los puestos y sectores, los turnos y el alcance de la evaluación'
    },
    iluminacion: {
      label: 'Iluminación laboral', path: '/medicion-iluminacion-laboral-mendoza/',
      description: 'Relevamiento de iluminación en puestos y ambientes de trabajo, con informe técnico y protocolo según el alcance acordado.',
      question: '¿Qué ambientes o puestos necesitás medir? Podés indicar cantidad o superficie aproximada.',
      cost: 'los ambientes, los puestos y la superficie a relevar'
    },
    mediciones: {
      label: 'Otras mediciones', path: '/mediciones-higiene-seguridad-mendoza/',
      description: 'Revisamos el requerimiento para definir la medición y la documentación que necesitás, incluyendo evaluaciones de estrés térmico y otros relevamientos.',
      question: '¿Qué medición o protocolo te solicitaron y en qué sectores?',
      cost: 'el tipo de medición, los sectores y el requerimiento recibido'
    },
    planos_incendio: {
      label: 'Planos contra incendio', path: '/planos-contra-incendio-mendoza/',
      description: 'Revisión del requerimiento y preparación de planos y documentación de protección contra incendios según la actividad, el inmueble y el trámite.',
      question: '¿Qué superficie aproximada tiene el inmueble y qué te pidieron para el trámite?',
      cost: 'la superficie, las características del inmueble y la documentación requerida'
    },
    carga_fuego: {
      label: 'Carga de fuego', path: '/calculo-carga-de-fuego-mendoza/',
      description: 'Evaluación de carga de fuego y documentación técnica del riesgo de incendio del establecimiento, según el alcance del trabajo.',
      question: '¿Qué superficie tiene el sector y qué materiales o productos se almacenan?',
      cost: 'la superficie, los sectores y los materiales a relevar'
    },
    habilitaciones: {
      label: 'Habilitaciones y memoria técnica', path: '/habilitacion-comercial-incendio-mendoza/',
      description: 'Asesoramiento y documentación técnica de protección contra incendios para habilitaciones. Revisamos el pedido del organismo para definir qué preparar.',
      question: '¿Qué superficie aproximada tiene el establecimiento y qué documentación te solicitaron?',
      cost: 'el requerimiento del trámite, la superficie y la documentación a preparar'
    },
    higiene_seguridad: {
      label: 'Higiene y Seguridad', path: '/higiene-seguridad-mendoza/',
      description: 'Asesoramiento puntual o periódico, evaluación de riesgos, documentación, visitas y acompañamiento preventivo para empresas y comercios.',
      question: '¿Cuántas personas trabajan y qué necesidad querés resolver? Indicá si buscás un servicio puntual o mensual.',
      cost: 'la actividad, el personal, los riesgos y la frecuencia del servicio'
    },
    servicio_mensual: {
      label: 'Servicio mensual de Higiene y Seguridad', path: '/servicio-mensual-higiene-seguridad-mendoza/',
      description: 'Acompañamiento periódico con visitas, documentación, capacitaciones y seguimiento de acciones preventivas, con alcance definido para cada empresa.',
      question: '¿Cuántas personas trabajan, cuántas sedes tienen y qué acompañamiento necesitan?',
      cost: 'la actividad, la cantidad de personal, las sedes y la frecuencia de visitas'
    },
    capacitaciones: {
      label: 'Capacitaciones', path: '/capacitacion-higiene-seguridad-empresas-mendoza/',
      description: 'Capacitaciones adaptadas a la actividad y los riesgos: matafuegos, EPP, trabajo en altura, riesgo eléctrico, emergencias y otros temas. La modalidad se coordina según la necesidad.',
      question: '¿Qué tema necesitan y cuántas personas participarían? Podés agregar duración o modalidad preferida.',
      cost: 'el tema, los participantes, la duración, la ubicación y la modalidad'
    },
    psicotecnicos: {
      label: 'Psicotécnicos laborales', path: '/psicotecnicos-laborales-mendoza/',
      description: 'Coordinación de evaluaciones por profesionales de Psicología para selección, incorporación o cambios de función. El alcance se acuerda según el puesto y el objetivo.',
      question: '¿Para qué puesto y cuántas personas necesitás evaluar? Indicá solo esos datos, sin nombres ni información de salud de las personas.',
      cost: 'los puestos, la cantidad de evaluaciones y el alcance solicitado'
    }
  };

  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const clean = (value, limit = 600) => String(value || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, limit);
  const rules = [
    ['capacitaciones', /capacit|\bcursos?\b|\bcharlas?\b/],
    ['psicotecnicos', /psicot|psicolog|evaluacion.*personal/],
    ['puesta_tierra', /puesta.{0,8}tierra|continuidad|\bpat\b|900\s*[/ -]\s*(?:20)?15/],
    ['ruido_laboral', /ruido|sonor|decibel|dosimetr/],
    ['iluminacion', /ilumin|\blux\b|\bluz\b/],
    ['carga_fuego', /carga.{0,8}fuego/],
    ['habilitaciones', /habilit|memoria.{0,8}tecnica/],
    ['planos_incendio', /incendio|\bplanos?\b|matafuego/],
    ['servicio_mensual', /mensual|periodic/],
    ['mediciones', /medici|estres.{0,8}termico/],
    ['higiene_seguridad', /higiene|seguridad|prevencion|riesgos?/]
  ];

  function detectService(text) {
    const value = normalize(text).replace(/[-_]/g, ' ');
    const found = rules.find(([, expression]) => expression.test(value));
    return found ? found[0] : null;
  }

  function answerFor(text, currentService) {
    const value = normalize(text);
    const serviceId = detectService(text) || (services[currentService] ? currentService : null);
    const service = services[serviceId];
    if (/credito.{0,8}fiscal|ucap|sepyme|reintegro/.test(value)) {
      return { kind: 'referral', serviceId, text: 'Para consultas sobre crédito fiscal o inscripción en programas de capacitación, Daniel debe revisar el programa y el caso particular. Podemos dejarle tu consulta preparada.' };
    }
    if (/privacidad|datos personales|guardan|almacenan|historial/.test(value)) {
      return { kind: 'privacy', serviceId, text: 'Esta conversación se mantiene en la página mientras la tenés abierta. El asistente no guarda un historial al recargarla ni envía el contenido a Analytics. Si continuás en WhatsApp, se abrirá el mensaje con los datos que ingresaste para que lo revises antes de enviarlo.' };
    }
    if (/que servicios|servicios.*ofrec|que hacen|que ofrecen|\bmenu\b|todos los servicios/.test(value)) {
      return { kind: 'menu', serviceId: null, text: 'Estos son los servicios de DAB. Elegí el que necesitás para conocer el alcance o preparar una consulta.' };
    }
    if (/cuanto.*(?:tarda|demora)|plazos?|para cuando|disponibilidad|horarios?|turnos?|urgente/.test(value)) {
      return { kind: 'time', serviceId, text: 'La fecha de visita, el plazo de entrega y la disponibilidad se coordinan según el trabajo y la documentación recibida. Podés indicar la fecha que necesitás al preparar tu consulta.' };
    }
    if (/precios?|cuanto.*(?:sale|cuesta|vale|cobran)|costos?|presupuest|cotiz|tarifa/.test(value)) {
      return { kind: 'price', serviceId, text: service ? `Para ${service.label.toLowerCase()}, el presupuesto depende de ${service.cost}. Te ayudo a reunir los datos y Daniel confirma la propuesta.` : 'El presupuesto se prepara según el servicio, la ubicación y el alcance del trabajo. Elegí un servicio o contame qué necesitás para reunir los datos de tu consulta.' };
    }
    if (/zonas?|cobertura|donde|localidad|mendoza|godoy cruz|lujan|maipu|guaymallen|remot|distancia/.test(value) && !detectService(text)) {
      return { kind: 'coverage', serviceId, text: 'DAB trabaja en Mendoza Capital, Godoy Cruz, Luján de Cuyo, Maipú y Guaymallén. Para otras zonas, la visita o modalidad se coordina según el servicio.' };
    }
    if (/hablar|persona|daniel|telefono|contact|whatsapp|wasap|\bwsp\b|\bwpp\b|\bhumano\b/.test(value)) {
      return { kind: 'contact', serviceId, text: 'Podés continuar con Daniel por WhatsApp al +54 9 261 620-1568. También puedo ayudarte a preparar los datos de tu consulta.' };
    }
    if (/^(hola|buenas|buen dia|buenos dias|buenas tardes|buenas noches)[!,.\s]*$/.test(value)) {
      return { kind: 'greeting', serviceId, text: '¡Hola! ¿Qué servicio necesitás? Podés elegir una opción o escribir tu consulta.' };
    }
    if (/^(gracias|muchas gracias|perfecto|ok|listo)[!,.\s]*$/.test(value)) {
      return { kind: 'thanks', serviceId, text: '¡De nada! Si querés, preparamos los datos para que puedas consultar con Daniel.' };
    }
    if (detectService(text)) return { kind: 'service', serviceId, text: service.description };
    return { kind: 'fallback', serviceId, text: 'Puedo orientarte sobre los servicios de DAB y ayudarte a preparar una consulta. Para revisar un caso particular, podés continuar con Daniel por WhatsApp.' };
  }

  function buildMessage(serviceId, lead = {}, pagePath = '/') {
    const service = services[serviceId];
    const lines = [`Hola DAB, quisiera consultar por ${service ? service.label.toLowerCase() : 'un servicio'}.`];
    const fields = [['Localidad', lead.zone, 120], ['Actividad', lead.activity, 200], ['Datos del trabajo', lead.scope, 300], ['Consulta adicional', lead.notes, 500]];
    for (const [label, value, limit] of fields) if (clean(value, limit)) lines.push(`${label}: ${clean(value, limit)}`);
    const path = String(pagePath).split(/[?#]/)[0];
    lines.push(`Consulta desde el asistente de https://dabgestion.com${path.startsWith('/') ? path : '/'}`);
    return lines.join('\n\n');
  }

  const whatsappUrl = (serviceId, lead, pagePath) => 'https://wa.me/5492616201568?text=' + encodeURIComponent(buildMessage(serviceId, lead, pagePath));

  if (typeof module === 'object' && module.exports) module.exports = { services, normalize, clean, detectService, answerFor, buildMessage, whatsappUrl };
  if (typeof document === 'undefined') return;

  function mount() {
    if (document.getElementById('dab-assistant')) return;
    let serviceId = detectService(window.location.pathname);
    let stage = 'browse';
    let lead = {};
    let welcomed = false;
    let returnFocus = null;
    const path = window.location.pathname;

    function element(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    }
    function icon(kind) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '1.8');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      shape.setAttribute('d', {
        chat: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5Z M8 11h.01 M12 11h.01 M16 11h.01',
        close: 'm6 6 12 12M6 18 18 6',
        reset: 'M3 10a9 9 0 1 1 2 8M3 4v6h6',
        send: 'm22 2-7 20-4-9-9-4 20-7ZM22 2 11 13'
      }[kind]);
      svg.appendChild(shape);
      return svg;
    }
    function button(label, action, className = 'dab-chat__choice') {
      const node = element('button', className, label);
      node.type = 'button';
      node.addEventListener('click', action);
      return node;
    }

    const root = element('div', 'dab-chat');
    root.id = 'dab-assistant';
    const launcher = button('', toggle, 'dab-chat__launcher');
    launcher.setAttribute('aria-label', 'Abrir asistente virtual de DAB');
    launcher.setAttribute('aria-controls', 'dab-chat-panel');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.append(icon('chat'), element('span', 'dab-chat__launcher-label', 'Asistente DAB'));
    const panel = element('section', 'dab-chat__panel');
    panel.id = 'dab-chat-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'dab-chat-title');
    const header = element('div', 'dab-chat__header');
    const badge = element('img', 'dab-chat__brand');
    badge.src = '/assets/dab-icon-2c.svg?v=20261022';
    badge.alt = '';
    const heading = element('div', 'dab-chat__heading');
    const title = element('h2', '', 'Asistente DAB');
    title.id = 'dab-chat-title';
    heading.append(title, element('p', '', 'Orientación para tu consulta'));
    const reset = button('', restart, 'dab-chat__icon-button');
    reset.append(icon('reset'));
    reset.setAttribute('aria-label', 'Reiniciar conversación');
    reset.title = 'Reiniciar conversación';
    const close = button('', () => setOpen(false), 'dab-chat__icon-button');
    close.append(icon('close'));
    close.setAttribute('aria-label', 'Cerrar asistente');
    header.append(badge, heading, reset, close);

    const log = element('div', 'dab-chat__log');
    log.setAttribute('role', 'log');
    log.setAttribute('aria-live', 'polite');
    log.setAttribute('aria-relevant', 'additions');
    log.setAttribute('aria-label', 'Conversación con el asistente');
    log.tabIndex = 0;
    const choices = element('div', 'dab-chat__choices');
    choices.setAttribute('aria-label', 'Opciones de la consulta');
    const form = element('form', 'dab-chat__composer');
    const inputLabel = element('label', 'dab-chat__sr-only', 'Tu mensaje para el asistente');
    inputLabel.htmlFor = 'dab-chat-input';
    const input = element('textarea', 'dab-chat__input');
    input.id = 'dab-chat-input';
    input.rows = 1;
    input.maxLength = 600;
    input.placeholder = 'Escribí tu consulta…';
    input.autocomplete = 'off';
    input.setAttribute('enterkeyhint', 'send');
    const submit = element('button', 'dab-chat__send');
    submit.type = 'submit';
    submit.setAttribute('aria-label', 'Enviar mensaje al asistente');
    submit.append(icon('send'));
    submit.disabled = true;
    form.append(inputLabel, input, submit);
    const privacy = element('p', 'dab-chat__privacy', 'Asistente virtual · ');
    const privacyLink = element('a', '', 'Privacidad');
    privacyLink.href = '/privacidad/';
    privacyLink.target = '_blank';
    privacyLink.rel = 'noopener noreferrer';
    privacy.appendChild(privacyLink);
    panel.append(header, log, choices, form, privacy);
    root.append(panel, launcher);
    document.body.appendChild(root);

    function setOpen(open) {
      if (open) returnFocus = document.activeElement;
      panel.hidden = !open;
      launcher.setAttribute('aria-expanded', String(open));
      launcher.setAttribute('aria-label', open ? 'Cerrar asistente virtual de DAB' : 'Abrir asistente virtual de DAB');
      launcher.replaceChildren(icon(open ? 'close' : 'chat'), element('span', 'dab-chat__launcher-label', open ? 'Cerrar' : 'Asistente DAB'));
      if (open) {
        if (!welcomed) welcome();
        input.focus({ preventScroll: true });
        scrollLog();
      } else if (returnFocus && returnFocus.isConnected) {
        returnFocus.focus({ preventScroll: true });
      }
    }
    function toggle() { setOpen(panel.hidden); }
    function scrollLog() { log.scrollTop = log.scrollHeight; }
    function message(text, who = 'assistant') {
      const bubble = element('div', 'dab-chat__message dab-chat__message--' + who);
      bubble.append(element('span', 'dab-chat__sr-only', who === 'user' ? 'Vos: ' : 'Asistente: '), element('p', '', text));
      log.appendChild(bubble);
      while (log.children.length > 40) log.firstElementChild.remove();
      scrollLog();
    }
    function showChoices(items) {
      choices.replaceChildren();
      for (const item of items) {
        if (item.href) {
          const link = element('a', 'dab-chat__choice' + (item.primary ? ' dab-chat__choice--primary' : ''), item.label);
          link.href = item.href;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          if (item.whatsapp) link.dataset.service = serviceId || 'general';
          choices.appendChild(link);
        } else {
          choices.appendChild(button(item.label, item.action, 'dab-chat__choice' + (item.primary ? ' dab-chat__choice--primary' : '')));
        }
      }
      scrollLog();
    }
    function sayChoice(label, action) {
      return () => { message(label, 'user'); action(); };
    }
    const homeChoice = () => ({ label: 'Ver otros servicios', action: sayChoice('Ver otros servicios', showHome) });
    const intakeChoice = () => ({ label: 'Preparar consulta', primary: true, action: sayChoice('Preparar consulta', beginIntake) });
    const waChoice = label => ({ label: label || 'Continuar en WhatsApp ↗', primary: true, href: whatsappUrl(serviceId, lead, path), whatsapp: true });

    function welcome() {
      welcomed = true;
      message('¡Hola! Soy el asistente virtual de DAB Prevención y Gestión. Te ayudo a conocer los servicios y preparar tu consulta.');
      if (services[serviceId]) showService(serviceId);
      else showHome(false);
    }
    function restart() {
      serviceId = detectService(path);
      stage = 'browse';
      lead = {};
      log.replaceChildren();
      input.value = '';
      submit.disabled = true;
      input.maxLength = 600;
      input.placeholder = 'Escribí tu consulta…';
      welcome();
      input.focus({ preventScroll: true });
    }
    function showHome(announce = true) {
      stage = 'browse';
      serviceId = null;
      lead = {};
      input.maxLength = 600;
      input.placeholder = 'Escribí tu consulta…';
      if (announce) message('¿Qué necesitás resolver? Elegí un servicio o escribí tu consulta.');
      showChoices([
        { label: 'Mediciones y protocolos', action: sayChoice('Mediciones y protocolos', () => showCategory('mediciones')) },
        { label: 'Incendio y habilitaciones', action: sayChoice('Incendio y habilitaciones', () => showCategory('incendio')) },
        { label: 'Higiene y Seguridad', action: sayChoice('Higiene y Seguridad', () => showService('higiene_seguridad')) },
        { label: 'Capacitaciones', action: sayChoice('Capacitaciones', () => showService('capacitaciones')) },
        { label: 'Psicotécnicos laborales', action: sayChoice('Psicotécnicos laborales', () => showService('psicotecnicos')) },
        { label: 'Hablar con Daniel', action: sayChoice('Hablar con Daniel', showContact) }
      ]);
    }
    function showCategory(category) {
      stage = 'browse';
      message(category === 'mediciones' ? '¿Qué medición necesitás?' : '¿Qué documentación o trámite necesitás resolver?');
      const ids = category === 'mediciones' ? ['puesta_tierra', 'ruido_laboral', 'iluminacion', 'mediciones'] : ['planos_incendio', 'carga_fuego', 'habilitaciones'];
      showChoices(ids.map(id => ({ label: services[id].label, action: sayChoice(services[id].label, () => showService(id)) })).concat(homeChoice()));
    }
    function serviceActions() {
      const items = [intakeChoice()];
      if (services[serviceId]) items.push({ label: 'Ver página del servicio ↗', href: services[serviceId].path });
      items.push({ label: 'Consultar precio', action: sayChoice('Consultar precio', () => respond('¿Cuánto cuesta?')) }, homeChoice());
      showChoices(items);
    }
    function showService(id) {
      serviceId = id;
      stage = 'browse';
      lead = {};
      input.maxLength = 600;
      input.placeholder = 'Preguntá por este servicio…';
      message(services[id].description);
      serviceActions();
    }
    function showContact() {
      stage = 'browse';
      message('Podés continuar con Daniel por WhatsApp al +54 9 261 620-1568. Al abrirlo, podés revisar el mensaje antes de enviarlo.');
      showChoices([waChoice(), intakeChoice(), homeChoice()]);
    }
    function beginIntake() {
      lead = lead.notes ? { notes: lead.notes } : {};
      stage = 'zone';
      message('Vamos a reunir los datos para tu consulta. Al terminar podrás revisarlos y continuar en WhatsApp.');
      promptStage();
    }
    function promptStage() {
      if (stage === 'zone') {
        input.maxLength = 120;
        input.placeholder = 'Localidad del establecimiento…';
        message('¿En qué localidad está el establecimiento?');
        showChoices(['Mendoza Capital', 'Godoy Cruz', 'Luján de Cuyo', 'Maipú', 'Guaymallén'].map(zone => ({ label: zone, action: sayChoice(zone, () => acceptAnswer(zone)) })).concat({ label: 'Otra localidad', action: () => { message('Escribí la localidad del establecimiento.'); input.focus({ preventScroll: true }); } }));
      } else if (stage === 'activity') {
        input.maxLength = 200;
        input.placeholder = 'Ej.: bodega, comercio, taller…';
        message('¿Qué actividad tiene el establecimiento o la empresa?');
        showChoices([homeChoice()]);
      } else if (stage === 'scope') {
        input.maxLength = 300;
        input.placeholder = 'Datos aproximados del trabajo…';
        message(services[serviceId] ? services[serviceId].question : '¿Qué servicio o problema necesitás resolver? Contame los datos generales del trabajo.');
        showChoices([{ label: 'Todavía no lo sé', action: sayChoice('Todavía no lo sé', () => acceptAnswer('A definir con DAB')) }, homeChoice()]);
      } else if (stage === 'notes') {
        input.maxLength = 500;
        input.placeholder = 'Requerimiento o fecha que necesitás…';
        message('¿Querés agregar algún requerimiento o la fecha que necesitás? Es opcional.');
        showChoices([{ label: 'Preparar mensaje', primary: true, action: sayChoice('Preparar mensaje', () => acceptAnswer('')) }, homeChoice()]);
      }
    }
    function acceptAnswer(value) {
      if (stage === 'zone') { lead.zone = clean(value, 120); stage = 'activity'; }
      else if (stage === 'activity') { lead.activity = clean(value, 200); stage = 'scope'; }
      else if (stage === 'scope') { lead.scope = clean(value, 300); stage = 'notes'; }
      else if (stage === 'notes') { lead.notes = clean([lead.notes, clean(value, 500)].filter(Boolean).join('\n'), 500); stage = 'review'; review(); return; }
      promptStage();
    }
    function review() {
      input.maxLength = 500;
      input.placeholder = 'Agregá una aclaración si lo necesitás…';
      const summary = [`Servicio: ${services[serviceId] ? services[serviceId].label : 'Consulta general'}`, `Localidad: ${lead.zone}`, `Actividad: ${lead.activity}`, `Datos del trabajo: ${lead.scope}`];
      if (lead.notes) summary.push(`Consulta adicional: ${lead.notes}`);
      message('Tu consulta está preparada:\n\n' + summary.join('\n'));
      message('Al continuar se abrirá WhatsApp con estos datos. Podés revisar el mensaje antes de enviarlo.');
      showChoices([waChoice(), { label: 'Volver a completar los datos', action: sayChoice('Volver a completar los datos', beginIntake) }, homeChoice()]);
    }
    function respond(text) {
      const answer = answerFor(text, serviceId);
      if (answer.serviceId && answer.serviceId !== serviceId) lead = {};
      if (answer.serviceId) serviceId = answer.serviceId;
      if (answer.kind === 'fallback' || answer.kind === 'referral') lead.notes = clean(text, 500);
      message(answer.text);
      if (answer.kind === 'menu') showHome(false);
      else if (answer.kind === 'contact') showChoices([waChoice(), intakeChoice(), homeChoice()]);
      else if (answer.kind === 'greeting' && !serviceId) showHome(false);
      else if (answer.kind === 'privacy') showChoices([{ label: 'Leer privacidad ↗', href: '/privacidad/' }, homeChoice()]);
      else if (answer.kind === 'fallback' || answer.kind === 'referral') showChoices([intakeChoice(), { label: 'Hablar con Daniel', action: sayChoice('Hablar con Daniel', showContact) }, homeChoice()]);
      else serviceActions();
    }

    input.addEventListener('input', () => { submit.disabled = !input.value.trim(); });
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        if (input.value.trim()) form.requestSubmit();
      }
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const text = clean(input.value, input.maxLength);
      if (!text) return;
      input.value = '';
      submit.disabled = true;
      message(text, 'user');
      if (['zone', 'activity', 'scope', 'notes'].includes(stage)) acceptAnswer(text);
      else if (stage === 'review') { lead.notes = clean((lead.notes ? lead.notes + '\n' : '') + text, 500); review(); }
      else respond(text);
      input.focus({ preventScroll: true });
    });
    root.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); setOpen(false); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
