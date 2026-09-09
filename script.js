const loaderScreen = document.querySelector('#loader-screen');
const loaderVideo = document.querySelector('#loader-video');
const loaderProgress = document.querySelector('#loader-progress');
const loaderPercent = document.querySelector('#loader-percent');
const loaderMessage = document.querySelector('#loader-message');
const mainContent = document.querySelector('#main-content');
const themeToggle = document.querySelector('#theme-toggle');
const backToTop = document.querySelector('#back-to-top');
const cursor = document.querySelector('#site-cursor');
const kineticTitle = document.querySelector('#kinetic-title');
const kineticLetters = [...kineticTitle.querySelectorAll('.kinetic-letter')];
const kineticDot = kineticTitle.querySelector('.kinetic-dot');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const loadingDuration = 7000;
let loadingStarted = false;

function easeProgress(value) {
  if (value < .72) return value * 1.12;
  return .8064 + (value - .72) * .6914;
}

function revealMainPage() {
  loaderMessage.textContent = 'Pronto';
  loaderProgress.style.width = '100%';
  loaderPercent.textContent = '100%';
  window.setTimeout(() => {
    loaderScreen.classList.add('is-leaving');
    mainContent.classList.add('is-visible');
    document.body.classList.remove('is-loading');
    document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));
  }, reducedMotion ? 50 : 350);
  window.setTimeout(() => {
    loaderScreen.hidden = true;
    loaderVideo.pause();
  }, reducedMotion ? 100 : 1400);
}

function startLoading() {
  if (loadingStarted) return;
  loadingStarted = true;
  const start = performance.now();
  function update(now) {
    const elapsed = Math.min((now - start) / loadingDuration, 1);
    const percent = Math.min(100, Math.round(easeProgress(elapsed) * 100));
    loaderProgress.style.width = `${percent}%`;
    loaderPercent.textContent = `${percent}%`;
    if (elapsed < 1) requestAnimationFrame(update);
    else revealMainPage();
  }
  requestAnimationFrame(update);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .16 });

themeToggle.addEventListener('click', () => {
  const inverted = document.body.classList.toggle('is-inverted');
  themeToggle.setAttribute('aria-pressed', String(inverted));
  themeToggle.textContent = inverted ? 'normal' : 'inverter';
});

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

window.addEventListener('pointermove', (event) => {
  const x = event.clientX / window.innerWidth;
  const y = event.clientY / window.innerHeight;
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
  cursor.classList.add('is-visible');
  kineticTitle.style.setProperty('--mx', ((x - .5) * 2).toFixed(3));
  kineticTitle.style.setProperty('--my', ((y - .5) * 2).toFixed(3));

  const titleBounds = kineticTitle.getBoundingClientRect();
  const insideTitle = event.clientX > titleBounds.left - 90 &&
    event.clientX < titleBounds.right + 90 &&
    event.clientY > titleBounds.top - 100 &&
    event.clientY < titleBounds.bottom + 100;

  kineticLetters.forEach((letter) => {
    const bounds = letter.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const distance = Math.hypot(event.clientX - centerX, (event.clientY - centerY) * 1.35);
    const strength = insideTitle ? Math.max(0, 1 - distance / 240) : 0;
    letter.style.setProperty('--scale-x', (1 + strength * .09).toFixed(3));
    letter.style.setProperty('--scale-y', (1 + strength * .38).toFixed(3));
    letter.style.setProperty('--lift', (strength * 15).toFixed(2));
    letter.style.setProperty('--layer', Math.round(strength * 10 + 1));
  });

  const dotBounds = kineticDot.getBoundingClientRect();
  const dotDistance = Math.hypot(event.clientX - dotBounds.left, event.clientY - dotBounds.top);
  const dotStrength = insideTitle ? Math.max(0, 1 - dotDistance / 180) : 0;
  kineticDot.style.setProperty('--dot-scale', (1 + dotStrength * .45).toFixed(3));
  kineticDot.style.setProperty('--dot-lift', (dotStrength * 10).toFixed(2));
});

document.querySelectorAll('[data-cursor]').forEach((element) => {
  element.addEventListener('pointerenter', () => {
    cursor.classList.add('is-active');
    cursor.querySelector('span').textContent = element.dataset.cursor;
  });
  element.addEventListener('pointerleave', () => {
    cursor.classList.remove('is-active');
    cursor.querySelector('span').textContent = '↗';
  });
});

document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
loaderVideo.addEventListener('canplay', startLoading, { once: true });
loaderVideo.addEventListener('error', startLoading, { once: true });
loaderVideo.play().catch(() => startLoading());
window.setTimeout(startLoading, 1200);
