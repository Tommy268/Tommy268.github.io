/* 24 点：界面与交互，核心逻辑在 24-core.js */
import {
  frac, is24, formatFrac, applyOp, randomPuzzle, solutionExpression
} from './24-core.js';

const BEST_KEY = 'tommy24Best';

const cardsEl = document.getElementById('cards');
const opsEl = document.getElementById('ops');
const stepsEl = document.getElementById('steps');
const solvedEl = document.getElementById('solved');
const streakEl = document.getElementById('streak');
const bestEl = document.getElementById('best');
const undoBtn = document.getElementById('undo');
const nextBtn = document.getElementById('next');
const hintBtn = document.getElementById('hint');

let cards = [];          /* [{ v: frac, alive: bool }]，长度恒为 4 */
let buttons = [];        /* 对应的 DOM 按钮 */
let sel = null;
let op = null;
let undoStack = [];
let chain = [];          /* 这一题已经做过的合并 */
let puzzle = [];
let state = 'playing';   /* playing | done */
let startTime = 0;

let solvedCount = 0;
let streak = 0;
let best = Number(localStorage.getItem(BEST_KEY) || 0);

/* ---------- 界面 ---------- */

function say(text, bad) {
  stepsEl.textContent = text;
  stepsEl.className = 'steps24' + (bad ? ' bad' : '');
}

function render() {
  for (let i = 0; i < 4; i++) {
    const btn = buttons[i];
    const card = cards[i];
    btn.textContent = formatFrac(card.v);
    btn.classList.toggle('gone', !card.alive);
    btn.classList.toggle('sel', sel === i);
  }
  Array.prototype.forEach.call(opsEl.children, function (b) {
    b.classList.toggle('on', b.dataset.op === op);
  });
  solvedEl.textContent = String(solvedCount);
  streakEl.textContent = String(streak);
  bestEl.textContent = String(best);
}

function elapsedSeconds() {
  return Math.max(1, Math.round((Date.now() - startTime) / 1000));
}

/* ---------- 出题 ---------- */

function newPuzzle() {
  puzzle = randomPuzzle();
  cards = puzzle.map(function (n) { return { v: frac(n), alive: true }; });
  sel = null;
  op = null;
  undoStack = [];
  chain = [];
  state = 'playing';
  startTime = Date.now();

  render();
  say('先点一张牌，再点一个运算符，最后点另一张牌。');
}

/* ---------- 操作 ---------- */

function snapshot() {
  undoStack.push({
    cards: cards.map(function (c) { return { v: c.v, alive: c.alive }; }),
    sel: sel,
    op: op,
    chain: chain.slice()
  });
}

function setOp(sym) {
  if (state !== 'playing') return;
  if (sel === null) {
    say('先选一张牌，再选运算符。', true);
    return;
  }
  op = sym;
  render();
  say('再点另一张牌就能合成。');
}

function onCard(i) {
  if (state !== 'playing') return;
  if (!cards[i] || !cards[i].alive) return;

  if (sel === null) {
    sel = i;
    render();
    say('选好了，接着选运算符。');
    return;
  }
  if (sel === i) {
    sel = null;
    render();
    say('取消选择。');
    return;
  }
  if (!op) {
    sel = i;
    render();
    say('选好了，接着选运算符。');
    return;
  }
  merge(sel, i);
}

function merge(a, b) {
  const left = cards[a].v;
  const right = cards[b].v;
  const result = applyOp(op, left, right);

  if (!result) {
    say('不能除以 0，换一个运算符。', true);
    return;
  }

  snapshot();
  cards[a] = { v: result, alive: true };
  cards[b] = { v: cards[b].v, alive: false };
  chain.push(formatFrac(left) + ' ' + op + ' ' + formatFrac(right) + ' = ' + formatFrac(result));
  sel = null;
  op = null;
  render();

  const alive = [];
  for (let i = 0; i < 4; i++) if (cards[i].alive) alive.push(i);

  if (alive.length > 1) {
    say(chain[chain.length - 1]);
    return;
  }

  const last = cards[alive[0]].v;
  if (is24(last)) {
    state = 'done';
    solvedCount++;
    streak++;
    if (streak > best) {
      best = streak;
      try { localStorage.setItem(BEST_KEY, String(best)); } catch (e) { /* 忽略 */ }
    }
    render();
    say('✓ 24！　' + chain.join('　→　') + '　（用时 ' + elapsedSeconds() + ' 秒）');
  } else {
    say('算出来是 ' + formatFrac(last) + '，不是 24。可以撤销再试试。', true);
  }
}

function undo() {
  if (state === 'done') {
    say('这一题已经解出来了，点「换一题」继续。', true);
    return;
  }
  if (!undoStack.length) {
    say('没有可以撤销的步骤。', true);
    return;
  }
  const snap = undoStack.pop();
  cards = snap.cards;
  sel = snap.sel;
  op = snap.op;
  chain = snap.chain;
  state = 'playing';
  render();
  say('已撤销。');
}

function revealAnswer() {
  const expr = solutionExpression(puzzle);
  if (!expr) {
    say('这道题……按理说有解，但没算出来。换一题吧。', true);
    return;
  }
  say('参考答案：' + expr);
}

/* ---------- 统计 ---------- */

function resetStreak() {
  if (streak > 0) {
    streak = 0;
    render();
  }
}

/* ---------- 事件 ---------- */

cardsEl.addEventListener('click', function (e) {
  const btn = e.target.closest('.card24');
  if (!btn) return;
  onCard(Number(btn.dataset.index));
});

opsEl.addEventListener('click', function (e) {
  const btn = e.target.closest('.op24');
  if (!btn) return;
  setOp(btn.dataset.op);
});

undoBtn.addEventListener('click', undo);
nextBtn.addEventListener('click', function () {
  resetStreak();
  newPuzzle();
});
hintBtn.addEventListener('click', revealAnswer);

document.addEventListener('keydown', function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key;

  if (k >= '1' && k <= '4') {
    e.preventDefault();
    onCard(Number(k) - 1);
  } else if (k === '+') {
    setOp('+');
  } else if (k === '-' || k === '−') {
    setOp('−');
  } else if (k === '*' || k === 'x' || k === 'X') {
    setOp('×');
  } else if (k === '/') {
    e.preventDefault();
    setOp('÷');
  } else if (k === 'z' || k === 'Z' || k === 'Backspace') {
    e.preventDefault();
    undo();
  } else if (k === 'n' || k === 'N') {
    resetStreak();
    newPuzzle();
  }
});

/* ---------- 初始化 ---------- */

for (let i = 0; i < 4; i++) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'card24';
  btn.dataset.index = String(i);
  cardsEl.appendChild(btn);
  buttons.push(btn);
}

newPuzzle();
