const PHONE = '+79161171683';
const EMAIL = 'elmiragl@gmail.com';

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Pre-fill service select from "Записаться" buttons on service cards
document.querySelectorAll('.book-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const service = btn.dataset.service;
    const select = document.querySelector('#bookingForm select[name="service"]');
    if (select) {
      [...select.options].forEach((opt) => {
        if (opt.value === service) select.value = service;
      });
    }
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
  });
});

// Booking form
const form = document.getElementById('bookingForm');
const result = document.getElementById('bookingResult');
const sendSms = document.getElementById('sendSms');
const sendEmail = document.getElementById('sendEmail');
const copyBtn = document.getElementById('copyMessage');
let lastMessage = '';

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = (data.get('name') || '').toString().trim();
  const contact = (data.get('contact') || '').toString().trim();
  const service = (data.get('service') || '').toString().trim();
  const date = (data.get('date') || '').toString().trim();
  const comment = (data.get('comment') || '').toString().trim();
  const pdConsent = form.querySelector('input[name="pdConsent"]');

  if (!name || !contact || !service || !pdConsent?.checked) {
    form.reportValidity();
    return;
  }

  lastMessage =
    `Заявка со стилист-сайта\n` +
    `Имя: ${name}\n` +
    `Контакт: ${contact}\n` +
    `Услуга: ${service}\n` +
    (date ? `Удобная дата: ${date}\n` : '') +
    (comment ? `Комментарий: ${comment}\n` : '');

  const encoded = encodeURIComponent(lastMessage);
  sendSms.href = `sms:${PHONE}?&body=${encoded}`;
  sendEmail.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Заявка с сайта')}&body=${encoded}`;

  result.hidden = false;
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

copyBtn.addEventListener('click', async () => {
  if (!lastMessage) return;
  try {
    await navigator.clipboard.writeText(lastMessage);
    copyBtn.textContent = 'Скопировано!';
    setTimeout(() => { copyBtn.textContent = 'Скопировать текст заявки'; }, 2000);
  } catch {
    // Clipboard API unavailable — silently ignore, the message is still visible in the form.
  }
});

// PWA install prompt
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
const iosInstallHint = document.getElementById('iosInstallHint');

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

if (isIos && !isStandalone) {
  iosInstallHint.hidden = false;
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

window.addEventListener('appinstalled', () => {
  installBtn.hidden = true;
});

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Offline support is a nice-to-have; failing silently keeps the site usable.
    });
  });
}
