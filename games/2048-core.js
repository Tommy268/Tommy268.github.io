/* 2048 的纯逻辑，不碰 DOM —— 可以单独在 Node 里测试 */

export const SIZE = 4;

export function emptyBoard() {
  return new Array(SIZE * SIZE).fill(0);
}

/* 把一"行"（长度 4 的数组）向 0 的方向滑动合并 */
export function slideLine(line) {
  const tiles = line.filter(function (v) { return v !== 0; });
  const out = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i++) {
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
      const merged = tiles[i] * 2;
      out.push(merged);
      gained += merged;
      i++;
    } else {
      out.push(tiles[i]);
    }
  }
  while (out.length < SIZE) out.push(0);
  return { line: out, gained: gained };
}

/* 每个方向第 i 条线的下标顺序，按"往 0 号格子方向"排列 */
export function lineIndices(dir, i) {
  const rows = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]];
  const cols = [[0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15]];
  if (dir === 'left') return rows[i].slice();
  if (dir === 'right') return rows[i].slice().reverse();
  if (dir === 'up') return cols[i].slice();
  return cols[i].slice().reverse();
}

export function move(board, dir) {
  const next = board.slice();
  let moved = false;
  let gained = 0;
  for (let i = 0; i < SIZE; i++) {
    const idx = lineIndices(dir, i);
    const line = idx.map(function (j) { return board[j]; });
    const result = slideLine(line);
    gained += result.gained;
    idx.forEach(function (j, k) {
      if (next[j] !== result.line[k]) moved = true;
      next[j] = result.line[k];
    });
  }
  return { board: next, moved: moved, gained: gained };
}

export function freeCells(board) {
  const out = [];
  board.forEach(function (v, i) { if (v === 0) out.push(i); });
  return out;
}

export function spawn(board, rand) {
  rand = rand || Math.random;
  const free = freeCells(board);
  if (!free.length) return board.slice();
  const next = board.slice();
  const at = free[Math.floor(rand() * free.length)];
  next[at] = rand() < 0.9 ? 2 : 4;
  return next;
}

export function canMove(board) {
  if (board.indexOf(0) !== -1) return true;
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const v = board[i * SIZE + j];
      if (j < SIZE - 1 && v === board[i * SIZE + j + 1]) return true;
      if (i < SIZE - 1 && v === board[(i + 1) * SIZE + j]) return true;
    }
  }
  return false;
}

export function hasWon(board) {
  return board.some(function (v) { return v >= 2048; });
}
