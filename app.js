const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.querySelector('[data-status]');
const scoreEl = document.querySelector('[data-score]');
const startButton = document.querySelector('[data-start]');

const state = {
  running: false,
  score: 0,
  time: 30,
  keys: new Set(),
  player: { x: 60, y: 160, size: 24, speed: 220 },
  orbs: [],
  lastTime: 0,
};

const orbColors = ['#ff3b30', '#4fd1c5', '#ffd166', '#6c63ff', '#34c759'];

const resizeCanvas = () => {
  const wrapper = canvas.parentElement;
  const width = Math.min(wrapper.clientWidth, 720);
  const height = Math.max(320, Math.round(width * 0.55));
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
};

const resetGame = () => {
  state.score = 0;
  state.time = 30;
  state.player.x = 60;
  state.player.y = 160;
  state.orbs = Array.from({ length: 6 }, () => spawnOrb());
  scoreEl.textContent = state.score;
  statusText.textContent = 'Topları topla ve süre dolmadan en yüksek skoru yap.';
};

const spawnOrb = () => {
  const margin = 40;
  return {
    x: margin + Math.random() * (canvas.clientWidth - margin * 2),
    y: margin + Math.random() * (canvas.clientHeight - margin * 2),
    size: 14 + Math.random() * 10,
    color: orbColors[Math.floor(Math.random() * orbColors.length)],
  };
};

const update = (delta) => {
  const distance = state.player.speed * delta;
  if (state.keys.has('ArrowUp') || state.keys.has('KeyW')) state.player.y -= distance;
  if (state.keys.has('ArrowDown') || state.keys.has('KeyS')) state.player.y += distance;
  if (state.keys.has('ArrowLeft') || state.keys.has('KeyA')) state.player.x -= distance;
  if (state.keys.has('ArrowRight') || state.keys.has('KeyD')) state.player.x += distance;

  const maxX = canvas.clientWidth - state.player.size - 8;
  const maxY = canvas.clientHeight - state.player.size - 8;
  state.player.x = Math.max(8, Math.min(maxX, state.player.x));
  state.player.y = Math.max(8, Math.min(maxY, state.player.y));

  state.orbs = state.orbs.map((orb) => {
    const dx = orb.x - state.player.x;
    const dy = orb.y - state.player.y;
    const hit = Math.hypot(dx, dy) < orb.size + state.player.size * 0.6;
    if (hit) {
      state.score += 5;
      scoreEl.textContent = state.score;
      return spawnOrb();
    }
    return orb;
  });
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  const gradient = ctx.createLinearGradient(0, 0, canvas.clientWidth, canvas.clientHeight);
  gradient.addColorStop(0, '#0f1115');
  gradient.addColorStop(1, '#1f2230');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  ctx.fillStyle = '#f7f7fb';
  ctx.beginPath();
  ctx.arc(state.player.x, state.player.y, state.player.size, 0, Math.PI * 2);
  ctx.fill();

  state.orbs.forEach((orb) => {
    ctx.fillStyle = orb.color;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
    ctx.fill();
  });
};

const tick = (timestamp) => {
  if (!state.running) return;
  const delta = (timestamp - state.lastTime) / 1000;
  state.lastTime = timestamp;
  update(delta);
  draw();
  requestAnimationFrame(tick);
};

const countdown = () => {
  if (!state.running) return;
  if (state.time <= 0) {
    state.running = false;
    statusText.textContent = `Süre doldu! Skorun ${state.score}. Tekrar oynamak için başla.`;
    startButton.textContent = 'Tekrar Oyna';
    return;
  }
  state.time -= 1;
  document.querySelector('[data-time]').textContent = `${state.time}s`;
  setTimeout(countdown, 1000);
};

const startGame = () => {
  state.running = true;
  state.lastTime = performance.now();
  startButton.textContent = 'Oyun Çalışıyor';
  resetGame();
  document.querySelector('[data-time]').textContent = `${state.time}s`;
  countdown();
  requestAnimationFrame(tick);
};

startButton.addEventListener('click', () => {
  if (state.running) return;
  startGame();
});

window.addEventListener('keydown', (event) => state.keys.add(event.code));
window.addEventListener('keyup', (event) => state.keys.delete(event.code));
window.addEventListener('resize', () => {
  resizeCanvas();
  resetGame();
  draw();
});

resizeCanvas();
resetGame();
draw();
