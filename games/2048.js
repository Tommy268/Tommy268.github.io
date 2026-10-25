/* 2048 的界面与交互 */
import {
  SIZE, emptyBoard, move, spawn, canMove, hasWon
} from './2048-core.js';

const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlay-text');
const overlayBtn = document.getElementById('overlay-btn');

const BEST_KEY = 'tommy2048Best';

let board = emptyBoard();
let score = 0;
let best = Number(localStorage.getItem(BEST_KEY) || 0);
let finished = false;
let keepPlaying = false;

/* 建格子 */
const cells = [];
for (let i = 0; i < SIZE * SIZE; i++) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.dataset.v = '0';
  boardEl.appendChild(cell);
  cells.push(cell);
}

function render() {
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const v = board[i];
    const prev = Number(cell.dataset.v);
    if (v !== prev && v !== 0) {
      cell.classList.remove('pop');
      void cell.offsetWidth; /* 强制重排，让动画能重放 */
      cell.classList.add('pop');
    }
    cell.dataset.v = String(v);
    cell.textContent = v ? String(v) : '';
    cell.classList.toggle('big', v > 2048);
  }
  scoreEl.textContent = score;
  bestEl.textContent = best;
}

function showOverlay(text, btnLabel) {
  overlayText.textContent = text;
  overlayBtn.textContent = btnLabel;
  overlay.classList.add('show');
}

function hideOverlay() {
  overlay.classList.remove('show');
}

function newGame() {
  board = emptyBoard();
  score = 0;
  finished = false;
  keepPlaying = false;
  board = spawn(spawn(board));
  hideOverlay();
  render();
}

function doMove(dir) {
  if (finished) return;
  const result = move(board, dir);
  if (!result.moved) return;

  board = spawn(result.board);
  score += result.gained;

  if (score > best) {
    best = score;
    localStorage.setItem(BEST_KEY, String(best));
  }

  if (!keepPlaying && hasWon(board)) {
    keepPlaying = true;
    finished = true;
    render();
    showOverlay('拿到 2048 了 🎉', '继续玩');
    overlayBtn.dataset.action = 'continue';
    return;
  }

  if (!canMove(board)) {
    finished = true;
    render();
    showOverlay('没有可以移动的格子了，得分 ' + score, '再来一局');
    overlayBtn.dataset.action = 'restart';
    return;
  }

  render();
}

/* ---------- 键盘 ---------- */
const KEYS = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  a: 'left', d: 'right', w: 'up', s: 'down',
  A: 'left', D: 'right', W: 'up', S: 'down'
};

document.addEventListener('keydown', function (e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const dir = KEYS[e.key];
  if (dir) {
    e.preventDefault();
    doMove(dir);
  } else if (e.key === 'r' || e.key === 'R') {
    newGame();
  }
});

/* ---------- 触摸滑动 ---------- */
let touchStart = null;
boardEl.addEventListener('touchstart', function (e) {
  if (e.touches.length !== 1) return;
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });

boardEl.addEventListener('touchend', function (e) {
  if (!touchStart || !e.changedTouches.length) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
  if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 'right' : 'left');
  else doMove(dy > 0 ? 'down' : 'up');
}, { passive: true });

/* ---------- 按钮 ---------- */
document.getElementById('new-game').addEventListener('click', newGame);
overlayBtn.addEventListener('click', function () {
  if (overlayBtn.dataset.action === 'continue') {
    hideOverlay();
    finished = false;
    keepPlaying = true;
    render();
  } else {
    newGame();
  }
});

newGame();
