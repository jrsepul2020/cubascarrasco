// Mobile menu
const toggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

// Active link on scroll
const links = [...nav.querySelectorAll('a:not(.btn)')];
const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => spy.observe(s));

// Reveal on scroll
const reveal = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));

// Preselect service from "Pedir presupuesto" links
const serviceSelect = document.getElementById('f-service');
document.querySelectorAll('[data-service]').forEach(a => a.addEventListener('click', () => {
  serviceSelect.value = a.dataset.service;
}));

// Quote form: sent via FormSubmit; falls back to the visitor's email app if that fails
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/rafaelct75@hotmail.com';
const form = document.getElementById('quoteForm');
const note = document.getElementById('formNote');
const submitBtn = form.querySelector('button[type="submit"]');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  if (!d.nombre.trim() || !d.telefono.trim() || !d.servicio) {
    note.textContent = 'Por favor, rellena nombre, teléfono y servicio.';
    note.style.color = '#c62828';
    return;
  }
  if (!document.getElementById('f-privacy').checked) {
    note.textContent = 'Debes aceptar la política de privacidad.';
    note.style.color = '#c62828';
    return;
  }
  const body = [
    `Nombre: ${d.nombre}`,
    `Teléfono: ${d.telefono}`,
    `Email: ${d.email || '-'}`,
    `Servicio: ${d.servicio}`,
    '',
    d.mensaje || ''
  ].join('\n');
  const subject = `Solicitud de presupuesto – ${d.servicio}`;

  submitBtn.disabled = true;
  note.textContent = 'Enviando…';
  note.style.color = '';
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        _honey: d._honey || '',
        Nombre: d.nombre,
        Teléfono: d.telefono,
        Email: d.email || '-',
        Servicio: d.servicio,
        Mensaje: d.mensaje || '-',
        ...(d.email ? { _replyto: d.email } : {})
      })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || res.status);
    form.reset();
    note.textContent = '¡Gracias! Hemos recibido tu solicitud y te contestaremos lo antes posible.';
    note.style.color = '#1b7a3a';
  } catch {
    note.textContent = 'No se pudo enviar. Se abrirá tu correo para que puedas enviarla, o llámanos al 670 684 128.';
    note.style.color = '#c62828';
    window.location.href = `mailto:rafaelct75@hotmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  } finally {
    submitBtn.disabled = false;
  }
});

document.getElementById('year').textContent = new Date().getFullYear();
