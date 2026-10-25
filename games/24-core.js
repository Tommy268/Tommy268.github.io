/* 24 点的纯逻辑：分数运算 + 求解器，不碰 DOM，可以单独在 Node 里测试 */

/* ---------- 分数 ---------- */

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a || 1;
}

/* 约分后的分数 {n, d}，d 恒为正 */
export function frac(n, d = 1) {
  if (d === 0) return null;
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

export function is24(f) {
  return f.d === 1 && f.n === 24;
}

export function formatFrac(f) {
  if (!f) return '?';
  return f.d === 1 ? String(f.n) : f.n + '/' + f.d;
}

const add = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => frac(a.n * b.n, a.d * b.d);
const div = (a, b) => (b.n === 0 ? null : frac(a.n * b.d, a.d * b.n));

export const OPS = [
  { s: '+', f: add },
  { s: '−', f: sub },
  { s: '×', f: mul },
  { s: '÷', f: div }
];

/* 点击合并用：按运算符号计算两个分数 */
export function applyOp(sym, a, b) {
  const op = OPS.find((o) => o.s === sym);
  if (!op) return null;
  return op.f(a, b);
}

/* ---------- 求解器 ---------- */

function search(items) {
  if (items.length === 1) {
    return is24(items[0].v) ? [] : null;
  }
  for (let i = 0; i < items.length - 1; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      const rest = items.filter((_, k) => k !== i && k !== j);

      for (let k = 0; k < OPS.length; k++) {
        const op = OPS[k];

        /* a op b */
        const v1 = op.f(a.v, b.v);
        if (v1) {
          const label = '(' + a.label + ' ' + op.s + ' ' + b.label + ')';
          const tail = search(rest.concat([{ v: v1, label: label }]));
          if (tail) {
            return [{ a: a.label, b: b.label, op: op.s, result: label }].concat(tail);
          }
        }

        /* b op a —— 减法和除法要考虑顺序 */
        if (op.s === '−' || op.s === '÷') {
          const v2 = op.f(b.v, a.v);
          if (v2) {
            const label = '(' + b.label + ' ' + op.s + ' ' + a.label + ')';
            const tail = search(rest.concat([{ v: v2, label: label }]));
            if (tail) {
              return [{ a: b.label, b: a.label, op: op.s, result: label }].concat(tail);
            }
          }
        }
      }
    }
  }
  return null;
}

/* 返回解法步骤数组，无解返回 null */
export function solve(numbers) {
  const items = numbers.map((n, i) => ({ v: frac(n), label: String(n), id: i }));
  return search(items);
}

export function solvable(numbers) {
  return solve(numbers) !== null;
}

/* 一个完整的算式字符串，例如 "(8 − 2) × (3 + 1)" */
export function solutionExpression(numbers) {
  const steps = solve(numbers);
  if (!steps || !steps.length) return null;
  return steps[steps.length - 1].result;
}

/* ---------- 出题 ---------- */

export function randomPuzzle(rand = Math.random, min = 1, max = 13) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const nums = [];
    for (let i = 0; i < 4; i++) {
      nums.push(min + Math.floor(rand() * (max - min + 1)));
    }
    if (solvable(nums)) return nums;
  }
  return [4, 6, 1, 1]; /* 兜底：一定有解 */
}
