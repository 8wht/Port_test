const canvas = document.querySelector('#waves');
const context = canvas.getContext('2d');
const progress = document.querySelector('#progress');
const progressValue = document.querySelector('#progress-value');
const welcomeScreen = document.querySelector('#welcome-screen');

let width = 0;
let height = 0;
let time = 0;
let animationFrame;

function resizeCanvas() {
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(scale, 0, 0, scale, 0, 0);
}

function drawWave(offset, amplitude, frequency, speed, alpha) {
  context.beginPath();
  for (let x = -30; x <= width + 30; x += 12) {
    const y = height * .55 + offset + Math.sin(x * frequency + time * speed) * amplitude + Math.sin(x * frequency * .47 - time * speed * .65) * amplitude * .55;
    x === -30 ? context.moveTo(x, y) : context.lineTo(x, y);
  }
  context.strokeStyle = `rgba(103, 163, 255, ${alpha})`;
  context.lineWidth = 1;
  context.shadowBlur = 12;
  context.shadowColor = 'rgba(75, 137, 255, .6)';
  context.stroke();
}

function render() {
  context.clearRect(0, 0, width, height);
  const glow = context.createRadialGradient(width / 2, height * .55, 10, width / 2, height * .55, Math.max(width, height) * .42);
  glow.addColorStop(0, 'rgba(60, 125, 255, .13)');
  glow.addColorStop(1, 'rgba(3, 7, 20, 0)');
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  for (let line = 0; line < 14; line += 1) {
    drawWave((line - 7) * 12, 13 + line * .7, .009 + line * .00035, .54 + line * .015, .06 + (line % 3) * .025);
  }
  context.shadowBlur = 0;
  time += .016;
  animationFrame = requestAnimationFrame(render);
}

function startLoading() {
  const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : 3200;
  const start = performance.now();
  function update(now) {
    const amount = Math.min((now - start) / duration, 1);
    const percent = Math.round(amount * 100);
    progress.style.width = `${percent}%`;
    progressValue.textContent = `${percent}%`;
    if (amount < 1) requestAnimationFrame(update);
    else setTimeout(() => welcomeScreen.classList.add('is-complete'), 460);
  }
  requestAnimationFrame(update);
}

resizeCanvas();
render();
startLoading();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('beforeunload', () => cancelAnimationFrame(animationFrame));
