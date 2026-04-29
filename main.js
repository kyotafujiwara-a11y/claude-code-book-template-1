const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restart');

const W = canvas.width;
const H = canvas.height;

const PADDLE_W = 80;
const PADDLE_H = 10;
const BALL_R = 7;
const BRICK_COLS = 8;
const BRICK_ROWS = 5;
const BRICK_W = 52;
const BRICK_H = 18;
const BRICK_PAD = 4;
const BRICK_OFFSET_X = 16;
const BRICK_OFFSET_Y = 40;

const BRICK_COLORS = ['#e94560', '#f5a623', '#f8e71c', '#7ed321', '#4a90e2'];

let paddle, ball, bricks, score, lives, running, animId;
let shake = { frames: 0, intensity: 0 };

function initBricks() {
  const arr = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      arr.push({
        x: BRICK_OFFSET_X + c * (BRICK_W + BRICK_PAD),
        y: BRICK_OFFSET_Y + r * (BRICK_H + BRICK_PAD),
        alive: true,
        color: BRICK_COLORS[r],
      });
    }
  }
  return arr;
}

function startGame() {
  paddle = { x: W / 2 - PADDLE_W / 2, y: H - 30, w: PADDLE_W, h: PADDLE_H };
  ball = { x: W / 2, y: H - 50, vx: 5, vy: -6 };
  bricks = initBricks();
  score = 0;
  lives = 3;
  running = true;
  shake = { frames: 0, intensity: 0 };
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  messageEl.textContent = '← → キーまたはマウスでパドルを操作';
  restartBtn.style.display = 'none';
  if (animId) cancelAnimationFrame(animId);
  loop();
}

// Input
const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup', e => { keys[e.key] = false; });

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  paddle.x = Math.max(0, Math.min(W - paddle.w, mx - paddle.w / 2));
});

function triggerShake(intensity = 6, frames = 10) {
  shake.intensity = intensity;
  shake.frames = frames;
}

function update() {
  // Paddle keyboard
  if (keys['ArrowLeft'])  paddle.x = Math.max(0, paddle.x - 6);
  if (keys['ArrowRight']) paddle.x = Math.min(W - paddle.w, paddle.x + 6);

  // Ball movement
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall collisions
  if (ball.x - BALL_R < 0)     { ball.x = BALL_R;     ball.vx *= -1; }
  if (ball.x + BALL_R > W)     { ball.x = W - BALL_R; ball.vx *= -1; }
  if (ball.y - BALL_R < 0)     { ball.y = BALL_R;     ball.vy *= -1; }

  // Paddle collision
  if (
    ball.vy > 0 &&
    ball.y + BALL_R >= paddle.y &&
    ball.y + BALL_R <= paddle.y + paddle.h &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.w
  ) {
    ball.y = paddle.y - BALL_R;
    const rel = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
    ball.vx = rel * 7;
    ball.vy = -Math.abs(ball.vy);
  }

  // Brick collisions
  for (const b of bricks) {
    if (!b.alive) continue;
    if (
      ball.x + BALL_R > b.x &&
      ball.x - BALL_R < b.x + BRICK_W &&
      ball.y + BALL_R > b.y &&
      ball.y - BALL_R < b.y + BRICK_H
    ) {
      b.alive = false;
      score += 10;
      scoreEl.textContent = score;
      triggerShake();

      const overlapLeft  = ball.x + BALL_R - b.x;
      const overlapRight = b.x + BRICK_W - (ball.x - BALL_R);
      const overlapTop   = ball.y + BALL_R - b.y;
      const overlapBot   = b.y + BRICK_H - (ball.y - BALL_R);
      const minH = Math.min(overlapLeft, overlapRight);
      const minV = Math.min(overlapTop, overlapBot);
      if (minH < minV) ball.vx *= -1;
      else             ball.vy *= -1;
      break;
    }
  }

  // Ball out of bounds
  if (ball.y - BALL_R > H) {
    lives--;
    livesEl.textContent = lives;
    if (lives <= 0) {
      endGame(false);
      return;
    }
    ball.x = W / 2;
    ball.y = H - 50;
    ball.vx = 5;
    ball.vy = -6;
  }

  // Win check
  if (bricks.every(b => !b.alive)) {
    endGame(true);
  }
}

function endGame(won) {
  running = false;
  messageEl.textContent = won ? '🎉 クリア！' : '💀 ゲームオーバー';
  restartBtn.style.display = 'inline-block';
}

function draw() {
  ctx.save();

  // Screen shake
  if (shake.frames > 0) {
    const dx = (Math.random() * 2 - 1) * shake.intensity;
    const dy = (Math.random() * 2 - 1) * shake.intensity;
    ctx.translate(dx, dy);
    shake.intensity *= 0.85;
    shake.frames--;
  }

  ctx.clearRect(-20, -20, W + 40, H + 40);

  // Bricks
  for (const b of bricks) {
    if (!b.alive) continue;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 3);
    ctx.fill();
  }

  // Paddle
  ctx.fillStyle = '#e2e2e2';
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 5);
  ctx.fill();

  // Ball
  ctx.fillStyle = '#ff3333';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function loop() {
  if (!running) return;
  update();
  draw();
  animId = requestAnimationFrame(loop);
}

startGame();
