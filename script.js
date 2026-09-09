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
