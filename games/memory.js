/* 记忆翻牌 */
(function () {
  'use strict';

  var FACES = ['🐶', '🐱', '🦊', '🐼', '🐸', '🐷', '🦄', '🐝', '🦋', '🐙'];

  var LEVELS = {
    easy: { pairs: 6, label: '4 × 3' },
    normal: { pairs: 8, label: '4 × 4' },
    hard: { pairs: 10, label: '4 × 5' }
  };

  var grid = document.getElementById('grid');
  var movesEl = document.getElementById('moves');
  var timerEl = document.getElementById('timer');
  var bestEl = document.getElementById('best');
  var overlay = document.getElementById('overlay');
  var overlayText = document.getElementById('overlay-text');
  var overlayBtn = document.getElementById('overlay-btn');
  var levelBtns = document.querySelectorAll('[data-level]');

  var level = 'normal';
  var deck = [];          /* 每张牌的图案 */
  var cards = [];         /* DOM 按钮 */
  var flipped = [];       /* 当前翻开的两个下标 */
  var matched = 0;
  var moves = 0;
  var locked = false;
  var startTime = 0;
  var ticker = null;
  var finished = false;

  function bestKey() { return 'tommyMemory_' + level; }

  function loadBest() {
    try { return JSON.parse(localStorage.getItem(bestKey()) || 'null'); } catch (e) { return null; }
  }

  function saveBest(record) {
    try { localStorage.setItem(bestKey(), JSON.stringify(record)); } catch (e) { /* 隐私模式可能禁用 */ }
  }

  function fmtTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function elapsed() {
    return startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  }

  function showBest() {
    var b = loadBest();
    bestEl.textContent = b ? b.moves + ' 步 · ' + fmtTime(b.time) : '—';
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function stopTimer() {
    if (ticker) { clearInterval(ticker); ticker = null; }
  }

  function startTimer() {
    if (ticker || startTime) return;
    startTime = Date.now();
    ticker = setInterval(function () { timerEl.textContent = fmtTime(elapsed()); }, 250);
  }

  function reset() {
    stopTimer();
    startTime = 0;
    moves = 0;
    matched = 0;
    flipped = [];
    locked = false;
    finished = false;
    movesEl.textContent = '0';
    timerEl.textContent = '0:00';
    overlay.classList.remove('show');
    showBest();

    var pairs = LEVELS[level].pairs;
    var faces = FACES.slice(0, pairs);
    deck = shuffle(faces.concat(faces));

    grid.innerHTML = '';
    cards = [];
    for (var i = 0; i < deck.length; i++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mcard';
      btn.textContent = '?';
      btn.dataset.index = String(i);
      btn.setAttribute('aria-label', '第 ' + (i + 1) + ' 张牌，未翻开');
      grid.appendChild(btn);
      cards.push(btn);
    }
  }

  function unflipAll() {
    flipped.forEach(function (i) {
      if (cards[i] && !cards[i].classList.contains('matched')) {
        cards[i].classList.remove('flipped', 'wrong');
        cards[i].textContent = '?';
        cards[i].setAttribute('aria-label', '第 ' + (i + 1) + ' 张牌，未翻开');
      }
    });
    flipped = [];
  }

  function win() {
    finished = true;
    stopTimer();
    var time = elapsed();
    var best = loadBest();
    var isBest = !best || moves < best.moves || (moves === best.moves && time < best.time);
    if (isBest) {
      saveBest({ moves: moves, time: time });
      showBest();
    }
    overlayText.textContent = '全部找到！' + moves + ' 步，' + fmtTime(time) +
      (isBest ? '　🎉 新纪录' : '');
    overlayBtn.textContent = '再来一局';
    overlay.classList.add('show');
  }

  function onPick(index) {
    if (locked || finished) return;
    var btn = cards[index];
    if (!btn || btn.classList.contains('matched') || btn.classList.contains('flipped')) return;

    startTimer();
    btn.classList.add('flipped');
    btn.textContent = deck[index];
    btn.setAttribute('aria-label', '第 ' + (index + 1) + ' 张牌，' + deck[index]);
    flipped.push(index);

    if (flipped.length < 2) return;

    moves++;
    movesEl.textContent = String(moves);
    var a = flipped[0];
    var b = flipped[1];

    if (deck[a] === deck[b]) {
      cards[a].classList.remove('flipped');
      cards[b].classList.remove('flipped');
      cards[a].classList.add('matched');
      cards[b].classList.add('matched');
      flipped = [];
      matched++;
      if (matched === LEVELS[level].pairs) win();
      return;
    }

    locked = true;
    cards[a].classList.add('wrong');
    cards[b].classList.add('wrong');
    setTimeout(function () {
      cards[a].classList.remove('wrong');
      cards[b].classList.remove('wrong');
      unflipAll();
      locked = false;
    }, 620);
  }

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.mcard');
    if (!btn) return;
    onPick(Number(btn.dataset.index));
  });

  /* 方向键在牌面之间移动焦点 */
  grid.addEventListener('keydown', function (e) {
    var map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4 };
    var step = map[e.key];
    if (step === undefined) return;
    var idx = cards.indexOf(document.activeElement);
    if (idx === -1) return;
    e.preventDefault();
    var next = idx + step;
    if (next >= 0 && next < cards.length) cards[next].focus();
  });

  levelBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      level = btn.dataset.level;
      levelBtns.forEach(function (b) { b.classList.toggle('primary', b === btn); });
      reset();
    });
  });

  document.getElementById('restart').addEventListener('click', reset);
  overlayBtn.addEventListener('click', reset);

  reset();
})();
