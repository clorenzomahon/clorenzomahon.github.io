// ── Space Snake ───────────────────────────────────────────────────────────────

const canvas  = document.getElementById('game');
const ctx     = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highEl  = document.getElementById('high-score');
const html    = document.documentElement;

// ── Constants ─────────────────────────────────────────────────────────────────
const COLS     = 20;
const ROWS     = 20;
const CELL     = canvas.width / COLS;   // 30px
const BASE_MS  = 150;
const MIN_MS   = 60;
const SPEED_UP = 5;

// ── State machine ─────────────────────────────────────────────────────────────
const STATE = { START: 'start', PLAYING: 'playing', PAUSED: 'paused', OVER: 'over' };
let state = STATE.START;

// ── Persistence ───────────────────────────────────────────────────────────────
let highScore   = parseInt(localStorage.getItem('ssHigh')  || '0');
let customColor = localStorage.getItem('ssColor') || 'violet';
let customHead  = localStorage.getItem('ssHead')  || 'box';
highEl.textContent = highScore;

// ── Color schemes ─────────────────────────────────────────────────────────────
//   bs = body-start RGB, be = body-end RGB (interpolated tail→head)
const SCHEMES = {
  violet:  { name: 'VIOLET',  head: '#8b7fff', glow: '#8b7fff', bs: [139,127,255], be: [46,42,66]   },
  cyber:   { name: 'CYBER',   head: '#00fff7', glow: '#00fff7', bs: [0,255,247],   be: [86,3,173]   },
  plasma:  { name: 'PLASMA',  head: '#39ff14', glow: '#39ff14', bs: [57,255,20],   be: [0,80,0]     },
  inferno: { name: 'INFERNO', head: '#ff6b00', glow: '#ff6b00', bs: [255,107,0],   be: [140,0,0]    },
  galaxy:  { name: 'GALAXY',  head: '#ff00ff', glow: '#ff00ff', bs: [255,0,255],   be: [80,0,120]   },
  gold:    { name: 'GOLD',    head: '#ffd700', glow: '#ffd700', bs: [255,215,0],   be: [160,80,0]   },
  rainbow: { name: 'RAINBOW', head: null,      glow: null,      bs: null,          be: null         },
};

// ── Head styles ───────────────────────────────────────────────────────────────
const HEAD_STYLES = [
  { id: 'box',   label: 'BOX',   icon: '■' },
  { id: 'round', label: 'ROUND', icon: '●' },
  { id: 'arrow', label: 'ARROW', icon: '►' },
  { id: 'alien', label: 'ALIEN', icon: '👾' },
];

// ── Power-up definitions ──────────────────────────────────────────────────────
//   ticks = game ticks active (-1 = until triggered, 0 = instant)
const PU_DEFS = {
  DOUBLE: { label: '2× SCORE',   color: '#ff00ff', glow: '#ff00ff', ticks: 30, icon: '×2' },
  SHIELD: { label: 'SHIELD',     color: '#00aaff', glow: '#00aaff', ticks: -1, icon: '✦'  },
  SLOW:   { label: 'SLOW-MO',    color: '#00ffcc', glow: '#00ffcc', ticks: 20, icon: '~'  },
  SHRINK: { label: 'SHRINK',     color: '#aaff00', glow: '#aaff00', ticks:  0, icon: '↓'  },
  SPEED:  { label: 'SPEED RUSH', color: '#ff8800', glow: '#ff8800', ticks: 15, icon: '↑'  },
};
const PU_KEYS     = Object.keys(PU_DEFS);
const PU_LIFETIME = 480;   // render ticks before field power-up fades (~8s at 60fps)

// ── Game data ─────────────────────────────────────────────────────────────────
let snake, dir, nextDir, food, score, foodEaten, interval;
let currentMs = BASE_MS;
let fieldPU        = null;   // { type, x, y, spawnTick }  — on-board pickup
let activePU       = null;   // { type, ticksLeft }         — currently active
let floatingTexts  = [];     // { text, x, y, color, glow, life }
let isNewHighScore = false;

// ── Utilities ─────────────────────────────────────────────────────────────────
const isDark = () => html.getAttribute('data-theme') !== 'light';
const stepX  = d => d === 'right' ? 1 : d === 'left' ? -1 : 0;
const stepY  = d => d === 'down'  ? 1 : d === 'up'   ? -1 : 0;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);   ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);   ctx.quadraticCurveTo(x, y + h,     x, y + h - r);
  ctx.lineTo(x, y + r);       ctx.quadraticCurveTo(x, y,         x + r, y);
  ctx.closePath();
}

// ── Starfield ─────────────────────────────────────────────────────────────────
const STAR_COUNT = 150;
const stars = Array.from({ length: STAR_COUNT }, () => ({
  x:       Math.random() * canvas.width,
  y:       Math.random() * canvas.height,
  size:    Math.random() * 1.8 + 0.2,
  speed:   Math.random() * 0.3 + 0.05,
  phase:   Math.random() * Math.PI * 2,
  twinkle: Math.random() * 0.04 + 0.01,
}));

function drawStars(t) {
  const dark = isDark();
  stars.forEach(s => {
    const o = 0.4 + 0.6 * Math.abs(Math.sin(s.phase + t * s.twinkle));
    ctx.fillStyle = dark
      ? `rgba(220,200,255,${o})`
      : `rgba(80,0,160,${(o * 0.35).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    s.y += s.speed;
    if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
  });
}

// ── Grid ──────────────────────────────────────────────────────────────────────
function drawGrid() {
  ctx.strokeStyle = isDark() ? 'rgba(46,42,66,0.6)' : 'rgba(229,227,216,0.7)';
  ctx.lineWidth = 0.5;
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, canvas.height); ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(canvas.width, r * CELL); ctx.stroke();
  }
}

// ── Food ──────────────────────────────────────────────────────────────────────
function spawnFood() {
  const occ = new Set(snake.map(s => `${s.x},${s.y}`));
  if (fieldPU) occ.add(`${fieldPU.x},${fieldPU.y}`);
  let fx, fy;
  do {
    fx = Math.floor(Math.random() * COLS);
    fy = Math.floor(Math.random() * ROWS);
  } while (occ.has(`${fx},${fy}`));
  food = { x: fx, y: fy };
}

function drawFood(t) {
  const cx = food.x * CELL + CELL / 2;
  const cy = food.y * CELL + CELL / 2;
  const pulse = 1 + 0.25 * Math.sin(t * 0.08);
  const r = CELL * 0.28 * pulse;

  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.5);
  grd.addColorStop(0, 'rgba(255,220,50,0.6)');
  grd.addColorStop(1, 'rgba(255,160,0,0)');
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(cx, cy, r * 2.5, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(t * 0.03);
  ctx.fillStyle = '#ffe135'; ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 12;
  drawStarShape(ctx, 0, 0, 4, r, r * 0.45);
  ctx.restore();
}

function drawStarShape(ctx, x, y, pts, outer, inner) {
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const a = (Math.PI / pts) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? outer : inner;
    ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  ctx.closePath(); ctx.fill();
}

// ── Power-up: field pickup ────────────────────────────────────────────────────
function spawnFieldPU() {
  const occ = new Set(snake.map(s => `${s.x},${s.y}`));
  occ.add(`${food.x},${food.y}`);
  let px, py;
  do {
    px = Math.floor(Math.random() * COLS);
    py = Math.floor(Math.random() * ROWS);
  } while (occ.has(`${px},${py}`));
  fieldPU = { type: PU_KEYS[Math.floor(Math.random() * PU_KEYS.length)], x: px, y: py, spawnTick: tick };
}

function drawFieldPU(t) {
  if (!fieldPU) return;
  if (t - fieldPU.spawnTick > PU_LIFETIME) { fieldPU = null; return; }

  const def = PU_DEFS[fieldPU.type];
  const cx = fieldPU.x * CELL + CELL / 2;
  const cy = fieldPU.y * CELL + CELL / 2;
  const pulse = 1 + 0.2 * Math.sin(t * 0.1);
  const r = CELL * 0.3 * pulse;

  // Outer glow
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2);
  grd.addColorStop(0, def.color + 'aa'); grd.addColorStop(1, def.color + '00');
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2); ctx.fill();

  // Rotating hexagon body
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(t * 0.02);
  ctx.fillStyle = def.color; ctx.shadowColor = def.glow; ctx.shadowBlur = 16;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else         ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();

  // Icon label
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = isDark() ? '#0f0e14' : '#fff';
  ctx.font = `bold ${Math.floor(CELL * 0.32)}px Arial`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(def.icon, 0, 1);
  ctx.restore();
}

// ── Floating text popups ──────────────────────────────────────────────────────
function spawnFloatingText(text, color, glow) {
  const hx = snake[0].x * CELL + CELL / 2;
  const hy = snake[0].y * CELL;
  floatingTexts.push({ text, x: hx, y: hy, color, glow, life: 80 });
}

function drawFloatingTexts() {
  floatingTexts = floatingTexts.filter(ft => ft.life > 0);
  floatingTexts.forEach(ft => {
    const alpha    = ft.life / 80;
    const yOffset  = (80 - ft.life) * 0.55;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font         = 'bold 11px Orbitron';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = ft.color;
    ctx.shadowColor  = ft.glow;
    ctx.shadowBlur   = 14;
    ctx.fillText(ft.text, ft.x, ft.y - yOffset);
    ctx.restore();
    ft.life--;
  });
}

// ── Power-up: active HUD bar ──────────────────────────────────────────────────
function drawActivePUBar() {
  if (!activePU) return;
  const def = PU_DEFS[activePU.type];
  if (!def || def.ticks === 0) return;

  const bx = 8, by = canvas.height - 34;
  const bw = 130, bh = 24;

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, bx, by, bw, bh, 4); ctx.fill();

  const prog = activePU.type === 'SHIELD' ? 1 : activePU.ticksLeft / def.ticks;
  ctx.fillStyle = def.color + '33';
  roundRect(ctx, bx + 2, by + 14, bw - 4, 8, 3); ctx.fill();

  ctx.fillStyle = def.color; ctx.shadowColor = def.glow; ctx.shadowBlur = 6;
  roundRect(ctx, bx + 2, by + 14, Math.max(0, (bw - 4) * prog), 8, 3); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = def.color;
  ctx.font = 'bold 8px Orbitron'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(def.label, bx + 4, by + 3);
}

// ── Snake: colour helpers ─────────────────────────────────────────────────────
function getHeadColors() {
  if (customColor === 'rainbow') {
    const hue = (tick * 2) % 360;
    return { head: `hsl(${hue},100%,60%)`, glow: `hsl(${hue},100%,70%)` };
  }
  const s = SCHEMES[customColor];
  return { head: s.head, glow: s.glow };
}

function getBodyColor(i) {
  if (customColor === 'rainbow') {
    const hue = (tick * 2 + i * 12) % 360;
    return `hsl(${hue},100%,55%)`;
  }
  const s = SCHEMES[customColor];
  const t = i / Math.max(snake.length - 1, 1);
  const r = Math.round(s.bs[0] + (s.be[0] - s.bs[0]) * t);
  const g = Math.round(s.bs[1] + (s.be[1] - s.bs[1]) * t);
  const b = Math.round(s.bs[2] + (s.be[2] - s.bs[2]) * t);
  return `rgb(${r},${g},${b})`;
}

// ── Snake: rendering ──────────────────────────────────────────────────────────
function drawSnake() {
  // Draw body segments back-to-front so head renders on top
  for (let i = snake.length - 1; i >= 1; i--) {
    const { x, y } = snake[i];
    const margin = 3 + (i / snake.length) * 2;
    ctx.fillStyle = getBodyColor(i);
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 5;
    roundRect(ctx, x * CELL + margin, y * CELL + margin, CELL - margin * 2, CELL - margin * 2, 4);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  drawHead(snake[0].x * CELL, snake[0].y * CELL, dir);
}

function drawHead(x, y, headDir) {
  const { head, glow } = getHeadColors();
  const cx = x + CELL / 2;
  const cy = y + CELL / 2;
  const hw = CELL / 2 - 2;

  ctx.save();
  ctx.fillStyle = head;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 18;

  switch (customHead) {

    case 'round':
      ctx.beginPath(); ctx.arc(cx, cy, hw, 0, Math.PI * 2); ctx.fill();
      break;

    case 'arrow': {
      const angle = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[headDir] ?? 0;
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(hw, 0);
      ctx.lineTo(-hw * 0.3, -hw * 0.85);
      ctx.lineTo(-hw * 0.55, 0);
      ctx.lineTo(-hw * 0.3,  hw * 0.85);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      break;
    }

    case 'alien':
      // Ellipse body
      ctx.beginPath();
      ctx.ellipse(cx, cy, hw + 1, hw - 1, 0, 0, Math.PI * 2);
      ctx.fill();
      // Large dark eye sockets
      ctx.shadowBlur = 0;
      ctx.fillStyle = isDark() ? '#0f0e14' : '#2d0060';
      const [e1, e2] = eyePositions(headDir, x, y);
      ctx.beginPath(); ctx.arc(e1.x, e1.y, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(e2.x, e2.y, 4.5, 0, Math.PI * 2); ctx.fill();
      // Glowing pupils
      ctx.fillStyle = head; ctx.shadowColor = glow; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(e1.x, e1.y, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(e2.x, e2.y, 2.2, 0, Math.PI * 2); ctx.fill();
      break;

    default: // box
      roundRect(ctx, x + 2, y + 2, CELL - 4, CELL - 4, 6); ctx.fill();
      break;
  }

  // Standard small eyes for non-alien heads
  if (customHead !== 'alien') {
    ctx.shadowBlur = 0;
    ctx.fillStyle = isDark() ? '#0f0e14' : '#fff';
    const [e1, e2] = eyePositions(headDir, x, y);
    ctx.beginPath(); ctx.arc(e1.x, e1.y, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(e2.x, e2.y, 2, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
}

function eyePositions(dir, x, y) {
  const pos = {
    right: [{ x: x + CELL - 9, y: y + 8 },        { x: x + CELL - 9, y: y + CELL - 8 }],
    left:  [{ x: x + 9,        y: y + 8 },          { x: x + 9,        y: y + CELL - 8 }],
    up:    [{ x: x + 8,        y: y + 9 },           { x: x + CELL - 8, y: y + 9        }],
    down:  [{ x: x + 8,        y: y + CELL - 9 },   { x: x + CELL - 8, y: y + CELL - 9 }],
  };
  return pos[dir] || pos.right;
}

// ── Overlay helpers ───────────────────────────────────────────────────────────
function overlayColors() {
  return isDark()
    ? { bg: 'rgba(15,14,20,0.88)',    title: '#c4b5fd', accent: '#8b7fff', dim: '#9d96c0', danger: '#ff4d6d' }
    : { bg: 'rgba(250,249,245,0.92)', title: '#6d5cff', accent: '#6d5cff', dim: '#5a5954', danger: '#cc2255' };
}

function drawStartScreen() {
  const c = overlayColors();
  ctx.fillStyle = c.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';

  ctx.font = '900 42px Orbitron';
  ctx.fillStyle = c.title; ctx.shadowColor = c.title; ctx.shadowBlur = 24;
  ctx.fillText('SPACE SNAKE', canvas.width / 2, canvas.height / 2 - 60);

  ctx.font = '700 14px Orbitron';
  ctx.fillStyle = c.accent; ctx.shadowColor = c.accent; ctx.shadowBlur = 10;
  ctx.fillText('PRESS SPACE TO LAUNCH', canvas.width / 2, canvas.height / 2);

  ctx.font = '400 11px Orbitron'; ctx.shadowBlur = 0; ctx.fillStyle = c.dim;
  ctx.fillText('ARROWS / WASD · MOVE', canvas.width / 2, canvas.height / 2 + 40);
  ctx.fillText('P · PAUSE', canvas.width / 2, canvas.height / 2 + 60);
}

function drawPauseScreen() {
  const c = overlayColors();
  ctx.fillStyle = c.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.font = '700 28px Orbitron';
  ctx.fillStyle = c.title; ctx.shadowColor = c.title; ctx.shadowBlur = 16;
  ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
  ctx.font = '400 11px Orbitron'; ctx.shadowBlur = 0; ctx.fillStyle = c.dim;
  ctx.fillText('PRESS P TO RESUME', canvas.width / 2, canvas.height / 2 + 36);
}

function drawGameOver() {
  const c = overlayColors();
  ctx.fillStyle = c.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';

  ctx.font = '900 36px Orbitron';
  ctx.fillStyle = c.danger; ctx.shadowColor = c.danger; ctx.shadowBlur = 20;
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 70);

  ctx.font = '700 18px Orbitron';
  ctx.fillStyle = c.accent; ctx.shadowColor = c.accent; ctx.shadowBlur = 10;
  ctx.fillText(`SCORE: ${score}`, canvas.width / 2, canvas.height / 2 - 20);

  ctx.fillStyle = c.title; ctx.shadowColor = c.title;
  ctx.fillText(`BEST: ${highScore}`, canvas.width / 2, canvas.height / 2 + 18);

  if (isNewHighScore) {
    const pulse = 0.65 + 0.35 * Math.sin(tick * 0.14);
    ctx.font      = '700 13px Orbitron';
    ctx.fillStyle = `rgba(255,215,0,${pulse.toFixed(2)})`;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur  = Math.round(22 * pulse);
    ctx.fillText('★  NEW BEST  ★', canvas.width / 2, canvas.height / 2 + 48);
  }

  ctx.font = '400 11px Orbitron'; ctx.shadowBlur = 0; ctx.fillStyle = c.dim;
  ctx.fillText('SPACE · RESTART BUTTON · TAP', canvas.width / 2, canvas.height / 2 + (isNewHighScore ? 74 : 60));
}

// ── Render loop ───────────────────────────────────────────────────────────────
let tick = 0;
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = isDark() ? '#0f0e14' : '#f0eaff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars(tick);
  drawGrid();

  if (state !== STATE.START) {
    drawSnake();
    drawFood(tick);
    drawFieldPU(tick);
    drawActivePUBar();
    drawFloatingTexts();
  }

  if (state === STATE.START)  drawStartScreen();
  if (state === STATE.PAUSED) drawPauseScreen();
  if (state === STATE.OVER)   drawGameOver();

  tick++;
  requestAnimationFrame(render);
}

// ── Game tick ─────────────────────────────────────────────────────────────────
function gameTick() {
  if (state !== STATE.PLAYING) return;

  // Decrement active power-up (skip SHIELD which is event-triggered)
  if (activePU && activePU.type !== 'SHIELD') {
    activePU.ticksLeft--;
    if (activePU.ticksLeft <= 0) deactivatePU();
  }

  dir = nextDir;
  const head = { x: snake[0].x + stepX(dir), y: snake[0].y + stepY(dir) };

  // Collision: wall
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    if (activePU?.type === 'SHIELD') { activePU = null; resetInterval(); return; }
    return endGame();
  }
  // Collision: self
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    if (activePU?.type === 'SHIELD') { activePU = null; resetInterval(); return; }
    return endGame();
  }

  snake.unshift(head);

  // Collect field power-up
  if (fieldPU && head.x === fieldPU.x && head.y === fieldPU.y) {
    applyPU(fieldPU.type);
    fieldPU = null;
  }

  // Eat food
  if (head.x === food.x && head.y === food.y) {
    const pts = activePU?.type === 'DOUBLE' ? 20 : 10;
    score += pts;
    foodEaten++;
    updateScore();
    spawnFood();
    maybeSpeedUp();
    if (!fieldPU && Math.random() < 0.30) spawnFieldPU();
  } else {
    snake.pop();
  }
}

function applyPU(type) {
  const def = PU_DEFS[type];
  spawnFloatingText(def.label, def.color, def.glow);
  if (type === 'SHRINK') {
    snake = snake.slice(0, Math.max(3, Math.floor(snake.length / 2)));
    return;
  }
  activePU = { type, ticksLeft: def.ticks };
  resetInterval();
}

function deactivatePU() {
  activePU = null;
  resetInterval();
}

function maybeSpeedUp() {
  if (foodEaten % SPEED_UP === 0) {
    currentMs = Math.max(MIN_MS, BASE_MS - Math.floor(foodEaten / SPEED_UP) * 10);
    resetInterval();
  }
}

function resetInterval() {
  clearInterval(interval);
  let ms = currentMs;
  if (activePU?.type === 'SPEED') ms = Math.max(MIN_MS, Math.floor(ms * 0.55));
  if (activePU?.type === 'SLOW')  ms = Math.min(300,    Math.floor(ms * 1.9));
  interval = setInterval(gameTick, ms);
}

function updateScore() {
  scoreEl.textContent = score;
  scoreEl.classList.remove('flash');
  void scoreEl.offsetWidth;   // force reflow to restart animation
  scoreEl.classList.add('flash');
  if (score > highScore) {
    highScore = score;
    isNewHighScore = true;
    highEl.textContent = highScore;
    localStorage.setItem('ssHigh', highScore);
  }
}

// ── Init / reset ──────────────────────────────────────────────────────────────
function startGame() {
  snake      = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dir        = 'right';
  nextDir    = 'right';
  score          = 0;
  foodEaten      = 0;
  currentMs      = BASE_MS;
  fieldPU        = null;
  activePU       = null;
  floatingTexts  = [];
  isNewHighScore = false;
  scoreEl.textContent = '0';
  state = STATE.PLAYING;
  spawnFood();
  clearInterval(interval);
  interval = setInterval(gameTick, BASE_MS);
}

function endGame() {
  state = STATE.OVER;
  clearInterval(interval);
}

// ── Keyboard input ────────────────────────────────────────────────────────────
const DIRS     = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right', w:'up', s:'down', a:'left', d:'right', W:'up', S:'down', A:'left', D:'right' };
const OPPOSITE = { up:'down', down:'up', left:'right', right:'left' };

document.addEventListener('keydown', e => {
  if (e.key === ' ') {
    e.preventDefault();
    if (state === STATE.START || state === STATE.OVER) startGame();
    return;
  }
  if (e.key === 'p' || e.key === 'P') {
    if (state === STATE.PLAYING) { state = STATE.PAUSED; clearInterval(interval); }
    else if (state === STATE.PAUSED) { state = STATE.PLAYING; resetInterval(); }
    return;
  }
  const newDir = DIRS[e.key];
  if (newDir && newDir !== OPPOSITE[dir]) { e.preventDefault(); nextDir = newDir; }
});

// Touch / swipe support
let touchStart = null;
canvas.addEventListener('touchstart', e => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
canvas.addEventListener('touchend', e => {
  if (!touchStart) return;
  const tdx = e.changedTouches[0].clientX - touchStart.x;
  const tdy = e.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(tdx) < 10 && Math.abs(tdy) < 10) {
    if (state === STATE.START || state === STATE.OVER) startGame();
    touchStart = null; return;
  }
  let newDir;
  if (Math.abs(tdx) > Math.abs(tdy)) newDir = tdx > 0 ? 'right' : 'left';
  else                                newDir = tdy > 0 ? 'down'  : 'up';
  if (newDir !== OPPOSITE[dir]) nextDir = newDir;
  touchStart = null;
}, { passive: true });

// ── UI: theme toggle ──────────────────────────────────────────────────────────
const themeBtn = document.getElementById('theme-btn');
function syncThemeBtn() {
  const dark = isDark();
  themeBtn.textContent = dark ? '☀' : '☾';
  themeBtn.title = dark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}
themeBtn.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('ssTheme', next);
  syncThemeBtn();
});

// ── UI: restart button ────────────────────────────────────────────────────────
document.getElementById('restart-btn').addEventListener('click', startGame);

// ── UI: customisation modal ───────────────────────────────────────────────────
const modalOverlay = document.getElementById('modal-overlay');

function buildCustomizeModal() {
  // Color swatches
  const colorGrid = document.getElementById('color-options');
  Object.entries(SCHEMES).forEach(([key, scheme]) => {
    const btn = document.createElement('button');
    btn.className = 'color-swatch' + (key === customColor ? ' selected' : '');
    btn.title = scheme.name;
    if (key === 'rainbow') {
      btn.style.background = 'conic-gradient(red,orange,yellow,lime,cyan,blue,violet,red)';
      btn.style.boxShadow  = '0 0 8px rgba(255,255,255,0.5)';
    } else {
      btn.style.background = scheme.head;
      btn.style.boxShadow  = `0 0 10px ${scheme.head}`;
    }
    btn.addEventListener('click', () => {
      customColor = key;
      localStorage.setItem('ssColor', key);
      colorGrid.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    colorGrid.appendChild(btn);
  });

  // Head style buttons
  const headGrid = document.getElementById('head-options');
  HEAD_STYLES.forEach(hs => {
    const btn = document.createElement('button');
    btn.className = 'head-btn' + (hs.id === customHead ? ' selected' : '');
    btn.innerHTML = `<span class="head-icon">${hs.icon}</span><span class="head-label">${hs.label}</span>`;
    btn.addEventListener('click', () => {
      customHead = hs.id;
      localStorage.setItem('ssHead', hs.id);
      headGrid.querySelectorAll('.head-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    headGrid.appendChild(btn);
  });
}

document.getElementById('customize-btn').addEventListener('click', () => {
  modalOverlay.classList.remove('hidden');
});
document.getElementById('modal-close').addEventListener('click', () => {
  modalOverlay.classList.add('hidden');
});
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
});

// ── Boot ──────────────────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('ssTheme') || 'dark';
html.setAttribute('data-theme', savedTheme);
buildCustomizeModal();
syncThemeBtn();
render();
