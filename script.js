const canvas = document.querySelector('#energy-field');
const ctx = canvas.getContext('2d', { alpha: false });

let width = 0;
let height = 0;
let dpr = 1;
let startedAt = performance.now();
let frameId;

const stars = [];
const smoke = [];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Pontos-guia formam a silhueta vertical da corrente de energia.
const guide = [
  [.66, -.07], [.63, .02], [.50, .09], [.46, .16],
  [.49, .24], [.57, .34], [.55, .40], [.48, .47],
  [.47, .56], [.51, .64], [.45, .69], [.35, .71],
  [.33, .76], [.42, .78], [.54, .72], [.58, .77],
  [.51, .86], [.58, .91], [.70, .97], [.82, 1.07]
];

function random(seed) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  createScene();
}

function createScene() {
  stars.length = 0;
  smoke.length = 0;

  const starCount = Math.round(Math.min(230, Math.max(95, width * height / 7600)));
  for (let i = 0; i < starCount; i += 1) {
    stars.push({
      x: random(i + 1.1) * width,
      y: random(i + 91.7) * height,
      radius: .35 + random(i + 27.2) * 1.15,
      alpha: .2 + random(i + 54.8) * .72,
      speed: .5 + random(i + 304.2) * 1.8
    });
  }

  for (let i = 0; i < 145; i += 1) {
    smoke.push({
      position: random(i + 401.3),
      side: random(i + 710.4) > .5 ? 1 : -1,
      distance: 2 + random(i + 151.1) * Math.min(width, height) * .036,
      radius: 14 + random(i + 845.6) * 52,
      alpha: .04 + random(i + 991.8) * .1,
      phase: random(i + 66.6) * Math.PI * 2,
      drift: .35 + random(i + 12.2) * .8
    });
  }
}

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return .5 * ((2 * p1) + (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function pointOnPath(position, seconds, variation = 0) {
  const scaled = position * (guide.length - 1);
  const index = Math.min(guide.length - 2, Math.max(0, Math.floor(scaled)));
  const local = scaled - index;
  const p0 = guide[Math.max(0, index - 1)];
  const p1 = guide[index];
  const p2 = guide[Math.min(guide.length - 1, index + 1)];
  const p3 = guide[Math.min(guide.length - 1, index + 2)];
  const baseX = catmullRom(p0[0], p1[0], p2[0], p3[0], local) * width;
  const baseY = catmullRom(p0[1], p1[1], p2[1], p3[1], local) * height;
  const detail = Math.sin(position * 183 + seconds * 4.8 + variation) * 4.2 +
    Math.sin(position * 427 - seconds * 7.1 + variation * 2) * 2.2;
  const sway = Math.sin(seconds * .38 + position * 8.2) * Math.min(width, height) * .012;
  return { x: baseX + detail + sway, y: baseY };
}

function drawBackground(seconds) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#061126');
  gradient.addColorStop(.52, '#020817');
  gradient.addColorStop(1, '#01040d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (const star of stars) {
    const twinkle = .55 + Math.sin(seconds * star.speed + star.x) * .45;
    ctx.globalAlpha = star.alpha * twinkle;
    ctx.fillStyle = '#e8f4ff';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSmoke(seconds) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (const cloud of smoke) {
    const point = pointOnPath(cloud.position, seconds);
    const movement = Math.sin(seconds * cloud.drift + cloud.phase);
    const x = point.x + cloud.side * cloud.distance + movement * 12;
    const y = point.y + Math.cos(seconds * .45 + cloud.phase) * 10;
    const radius = cloud.radius * (.88 + movement * .08);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, `rgba(83, 177, 255, ${cloud.alpha * 2.5})`);
    glow.addColorStop(.24, `rgba(42, 125, 244, ${cloud.alpha * 1.15})`);
    glow.addColorStop(.58, `rgba(20, 75, 181, ${cloud.alpha * .55})`);
    glow.addColorStop(1, 'rgba(7, 31, 84, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function traceEnergy(seconds, variation, lineWidth, color, blur) {
  ctx.beginPath();
  const segments = Math.max(190, Math.round(height / 3.6));
  for (let i = 0; i <= segments; i += 1) {
    const point = pointOnPath(i / segments, seconds, variation);
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.shadowBlur = blur;
  ctx.shadowColor = '#258cff';
  ctx.stroke();
}

function drawEnergy(seconds) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  traceEnergy(seconds, 0, 38, 'rgba(24, 101, 255, .06)', 76);
  traceEnergy(seconds, .18, 17, 'rgba(35, 126, 255, .16)', 42);
  traceEnergy(seconds, .34, 6.5, 'rgba(42, 153, 255, .68)', 22);
  traceEnergy(seconds, .48, 2.15, 'rgba(126, 218, 255, .98)', 10);
  traceEnergy(seconds, .7, .72, 'rgba(255, 255, 255, .98)', 4);
  ctx.restore();
}

function drawMeteor(seconds) {
  const cycle = seconds % 9;
  if (cycle > 1.35) return;
  const progress = cycle / 1.35;
  const startX = width * .27;
  const startY = height * .15;
  const x = startX + progress * width * .15;
  const y = startY + progress * height * .15;
  const tail = 120;
  const gradient = ctx.createLinearGradient(x - tail, y - tail, x, y);
  gradient.addColorStop(0, 'rgba(180, 211, 255, 0)');
  gradient.addColorStop(1, 'rgba(220, 239, 255, .74)');
  ctx.save();
  ctx.globalAlpha = Math.sin(progress * Math.PI);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - tail, y - tail);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.shadowBlur = 9;
  ctx.shadowColor = '#9ec8ff';
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function render(now) {
  const seconds = (now - startedAt) / 1000;
  drawBackground(seconds);
  drawSmoke(seconds);
  drawEnergy(seconds);
  drawMeteor(seconds);
  if (!reducedMotion) frameId = requestAnimationFrame(render);
}

resize();
render(performance.now());
window.addEventListener('resize', resize);
window.addEventListener('beforeunload', () => cancelAnimationFrame(frameId));
