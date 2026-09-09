const loaderScreen = document.querySelector('#loader-screen');
const loaderVideo = document.querySelector('#loader-video');
const loaderProgress = document.querySelector('#loader-progress');
const loaderPercent = document.querySelector('#loader-percent');
const loaderMessage = document.querySelector('#loader-message');
const mainContent = document.querySelector('#main-content');

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

loaderVideo.addEventListener('canplay', startLoading, { once: true });
loaderVideo.addEventListener('error', startLoading, { once: true });
loaderVideo.play().catch(() => startLoading());

// Evita que uma conexão lenta prenda o visitante na abertura.
window.setTimeout(startLoading, 1200);
