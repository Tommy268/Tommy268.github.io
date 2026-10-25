/* 工具箱：全部在本地计算，不发起任何网络请求 */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- 标签页 ---------- */
  var tabs = $$('.tab');
  var panels = $$('.panel');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
      panels.forEach(function (p) { p.hidden = (p.id !== 'panel-' + tab.dataset.panel); });
    });
  });

  /* ---------- 复制 ---------- */
  function copyText(text) {
    if (!text) return Promise.resolve(false);
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = $(btn.dataset.copy);
      var text = target ? (target.value !== undefined ? target.value : target.textContent) : '';
      var old = btn.textContent;
      copyText(text).then(function (ok) {
        btn.textContent = ok ? '已复制' : '复制失败';
        setTimeout(function () { btn.textContent = old; }, 1200);
      });
    });
  });

  /* ---------- JSON ---------- */
  var jsonIn = $('#json-in');
  var jsonOut = $('#json-out');

  function jsonErrorDetail(text, err) {
    var m = /position (\d+)/.exec(err.message || '');
    if (!m) return err.message;
    var pos = Number(m[1]);
    var before = text.slice(0, pos);
    var line = before.split('\n').length;
    var col = pos - before.lastIndexOf('\n');
    return err.message + '\n第 ' + line + ' 行，第 ' + col + ' 列';
  }

  function runJson(mode) {
    var text = jsonIn.value;
    if (!text.trim()) {
      jsonOut.className = 'out';
      jsonOut.textContent = '请先粘贴一些 JSON。';
      return;
    }
    var value;
    try {
      value = JSON.parse(text);
    } catch (e) {
      jsonOut.className = 'out err';
      jsonOut.textContent = '✗ 解析失败\n' + jsonErrorDetail(text, e);
      return;
    }
    jsonOut.className = 'out ok';
    if (mode === 'minify') {
      jsonOut.textContent = JSON.stringify(value);
    } else if (mode === 'validate') {
      var depth = 0, count = 0;
      (function walk(v, d) {
        depth = Math.max(depth, d);
        count++;
        if (v && typeof v === 'object') {
          Object.keys(v).forEach(function (k) { walk(v[k], d + 1); });
        }
      })(value, 1);
      jsonOut.textContent = '✓ 合法的 JSON\n节点数 ' + count + '，嵌套深度 ' + depth;
    } else {
      jsonOut.textContent = JSON.stringify(value, null, 2);
    }
  }

  $$('[data-json]').forEach(function (btn) {
    btn.addEventListener('click', function () { runJson(btn.dataset.json); });
  });
  if (jsonIn) {
    jsonIn.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runJson('format'); }
    });
    if (jsonIn.value.trim()) {
      try { jsonIn.value = JSON.stringify(JSON.parse(jsonIn.value), null, 2); } catch (e) { /* 保留原样 */ }
      runJson('format');
    }
  }

  /* ---------- 时间戳 ---------- */
  var tsIn = $('#ts-in');
  var tsOut = $('#ts-out');
  var dtIn = $('#dt-in');
  var dtOut = $('#dt-out');

  function pad(n, w) {
    var s = String(Math.abs(n));
    while (s.length < (w || 2)) s = '0' + s;
    return n < 0 ? '-' + s : s;
  }

  function fmtLocal(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) +
      ' (UTC' + (d.getTimezoneOffset() <= 0 ? '+' : '-') +
      pad(Math.floor(Math.abs(d.getTimezoneOffset()) / 60)) +
      (Math.abs(d.getTimezoneOffset()) % 60 ? ':' + pad(Math.abs(d.getTimezoneOffset()) % 60) : '') + ')';
  }

  function fmtUtc(d) {
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) +
      ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' UTC';
  }

  function relative(d) {
    var diff = Date.now() - d.getTime();
    var abs = Math.abs(diff);
    var past = diff >= 0;
    var units = [
      [1000, '秒'], [60000, '分钟'], [3600000, '小时'],
      [86400000, '天'], [2592000000, '个月'], [31536000000, '年']
    ];
    if (abs < 3000) return '就是现在';
    var size = units[0][0], name = units[0][1];
    for (var i = 1; i < units.length; i++) {
      if (abs >= units[i][0]) { size = units[i][0]; name = units[i][1]; }
    }
    var n = Math.floor(abs / size);
    return n + ' ' + name + (past ? '前' : '后');
  }

  function showTimestamp(raw) {
    var text = String(raw).trim();
    if (!text) {
      tsOut.className = 'out';
      tsOut.textContent = '';
      return;
    }
    var n = Number(text);
    if (!isFinite(n)) {
      tsOut.className = 'out err';
      tsOut.textContent = '✗ 这不是一个数字。';
      return;
    }
    var isSeconds = Math.abs(n) < 1e12;
    var ms = isSeconds ? n * 1000 : n;
    var d = new Date(ms);
    if (isNaN(d.getTime())) {
      tsOut.className = 'out err';
      tsOut.textContent = '✗ 时间超出了有效范围。';
      return;
    }
    tsOut.className = 'out';
    tsOut.textContent = [
      '输入        ' + text + '  (' + (isSeconds ? '按秒理解' : '按毫秒理解') + ')',
      '本地时间    ' + fmtLocal(d),
      'UTC         ' + fmtUtc(d),
      'ISO 8601    ' + d.toISOString(),
      '相对现在    ' + relative(d),
      '秒 / 毫秒   ' + Math.floor(ms / 1000) + ' / ' + ms
    ].join('\n');
  }

  if (tsIn) {
    tsIn.addEventListener('input', function () { showTimestamp(tsIn.value); });
    var nowBtn = $('#ts-now');
    if (nowBtn) {
      nowBtn.addEventListener('click', function () {
        tsIn.value = String(Math.floor(Date.now() / 1000));
        showTimestamp(tsIn.value);
      });
    }
  }

  if (dtIn) {
    dtIn.value = (function () {
      var d = new Date();
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
        'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    })();
  }

  var dtGo = $('#dt-go');
  if (dtGo) {
    dtGo.addEventListener('click', function () {
      if (!dtIn.value) {
        dtOut.className = 'out err';
        dtOut.textContent = '✗ 先选一个日期时间。';
        return;
      }
      var d = new Date(dtIn.value);
      if (isNaN(d.getTime())) {
        dtOut.className = 'out err';
        dtOut.textContent = '✗ 日期格式不正确。';
        return;
      }
      dtOut.className = 'out';
      dtOut.textContent = [
        '秒          ' + Math.floor(d.getTime() / 1000),
        '毫秒        ' + d.getTime(),
        'ISO 8601    ' + d.toISOString()
      ].join('\n');
    });
  }

  /* ---------- 编码 ---------- */
  var codecIn = $('#codec-in');
  var codecOut = $('#codec-out');

  function toBase64(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    var chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(bin);
  }

  function fromBase64(str) {
    var clean = str.replace(/\s+/g, '');
    var bin = atob(clean);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function runCodec(kind) {
    var text = codecIn.value;
    var out;
    try {
      if (kind === 'b64enc') out = toBase64(text);
      else if (kind === 'b64dec') out = fromBase64(text);
      else if (kind === 'urlenc') out = encodeURIComponent(text);
      else out = decodeURIComponent(text.replace(/\+/g, ' '));
      codecOut.className = 'out';
      codecOut.textContent = out || '（结果为空）';
    } catch (e) {
      codecOut.className = 'out err';
      codecOut.textContent = '✗ 处理失败：' + e.message;
    }
  }

  $$('[data-codec]').forEach(function (btn) {
    btn.addEventListener('click', function () { runCodec(btn.dataset.codec); });
  });

  /* ---------- 密码 ---------- */
  var SETS = {
    lower: 'abcdefghijkmnopqrstuvwxyz',
    upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
    digit: '23456789',
    symbol: '!@#$%^&*()-_=+[]{}:,.?'
  };
  /* 去掉了 l/1/I/O/0 这类容易看错的字符 */

  var pwdLen = $('#pwd-len');
  var pwdLenLabel = $('#pwd-len-label');
  var pwdOut = $('#pwd-out');
  var pwdInfo = $('#pwd-info');

  function randInt(max) {
    if (window.crypto && crypto.getRandomValues) {
      var limit = Math.floor(0xffffffff / max) * max;
      var arr = new Uint32Array(1);
      var v;
      do { crypto.getRandomValues(arr); v = arr[0]; } while (v >= limit);
      return v % max;
    }
    return Math.floor(Math.random() * max);
  }

  function makePassword(len, keys) {
    var pool = '', groups = [];
    keys.forEach(function (k) { pool += SETS[k]; groups.push(SETS[k]); });
    if (!pool) return '';
    var chars = [];
    groups.forEach(function (g) { chars.push(g.charAt(randInt(g.length))); });
    while (chars.length < len) chars.push(pool.charAt(randInt(pool.length)));
    for (var i = chars.length - 1; i > 0; i--) {
      var j = randInt(i + 1);
      var tmp = chars[i]; chars[i] = chars[j]; chars[j] = tmp;
    }
    return chars.slice(0, len).join('');
  }

  function collectOptions() {
    var keys = [];
    ['lower', 'upper', 'digit', 'symbol'].forEach(function (k) {
      var box = $('#pwd-' + k);
      if (box && box.checked) keys.push(k);
    });
    return keys;
  }

  function updatePassword() {
    var len = Number(pwdLen.value);
    pwdLenLabel.textContent = len;
    var keys = collectOptions();
    if (!keys.length) {
      pwdOut.className = 'out err';
      pwdOut.textContent = '至少选一种字符类型。';
      pwdInfo.textContent = '';
      return;
    }
    var pwd = makePassword(len, keys);
    pwdOut.className = 'out';
    pwdOut.textContent = pwd;
    var poolSize = keys.reduce(function (sum, k) { return sum + SETS[k].length; }, 0);
    var bits = Math.round(len * Math.log2(poolSize));
    var level = bits < 50 ? '偏弱' : bits < 80 ? '够用' : bits < 120 ? '强' : '很强';
    pwdInfo.textContent = '字符池 ' + poolSize + ' 个，熵约 ' + bits + ' bit —— ' + level +
      '。已排除 l/1/I/O/0 这类易混字符。';
  }

  if (pwdLen) {
    pwdLen.addEventListener('input', updatePassword);
    ['lower', 'upper', 'digit', 'symbol'].forEach(function (k) {
      var box = $('#pwd-' + k);
      if (box) box.addEventListener('change', updatePassword);
    });
    $('#pwd-go').addEventListener('click', updatePassword);
    updatePassword();
  }

  /* ---------- 哈希 ---------- */
  var hashIn = $('#hash-in');
  var hashOut = $('#hash-out');
  var hashGo = $('#hash-go');

  function toHex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function (b) {
      return ('0' + b.toString(16)).slice(-2);
    }).join('');
  }

  if (hashGo) {
    hashGo.addEventListener('click', function () {
      var text = hashIn.value;
      if (!window.crypto || !crypto.subtle) {
        hashOut.className = 'out err';
        hashOut.textContent = '✗ 当前环境不支持 Web Crypto（需要 https 或 localhost 打开）。';
        return;
      }
      crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
        hashOut.className = 'out';
        hashOut.textContent = toHex(buf) + '\n\n（' + new TextEncoder().encode(text).length + ' 字节）';
      }, function (err) {
        hashOut.className = 'out err';
        hashOut.textContent = '✗ 计算失败：' + err.message;
      });
    });
  }

  /* ---------- 颜色 ---------- */
  var colorPick = $('#color-pick');
  var colorHex = $('#color-hex');
  var colorSwatch = $('#color-swatch');
  var colorOut = $('#color-out');

  function normalizeHex(input) {
    var v = String(input).trim();
    if (!v) return null;
    if (v.charAt(0) !== '#') v = '#' + v;
    if (/^#[0-9a-fA-F]{3}$/.test(v)) {
      v = '#' + v.charAt(1) + v.charAt(1) + v.charAt(2) + v.charAt(2) + v.charAt(3) + v.charAt(3);
    }
    return /^#[0-9a-fA-F]{6}$/.test(v) ? v.toLowerCase() : null;
  }

  function hexToRgb(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    var d = max - min;
    if (d !== 0) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
      else if (max === g) h = ((b - r) / d + 2);
      else h = ((r - g) / d + 4);
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function luminance(r, g, b) {
    var c = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function showColor(input, syncPicker) {
    var hex = normalizeHex(input);
    if (!hex) {
      colorOut.className = 'out err';
      colorOut.textContent = '✗ 请输入有效的 HEX，例如 #1f4fd8 或 #14d。';
      return;
    }
    var rgb = hexToRgb(hex);
    var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    var lum = luminance(rgb.r, rgb.g, rgb.b);
    var contrastWhite = (1.05) / (lum + 0.05);
    var contrastBlack = (lum + 0.05) / 0.05;
    colorSwatch.style.background = hex;
    if (syncPicker && colorPick.value !== hex) colorPick.value = hex;
    colorOut.className = 'out';
    colorOut.textContent = [
      'HEX     ' + hex.toUpperCase(),
      'RGB     rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')',
      'HSL     hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)',
      '',
      '相对亮度            ' + lum.toFixed(3),
      '与白色对比度        ' + contrastWhite.toFixed(2) + ':1' +
        (contrastWhite >= 4.5 ? '  ✓ 正文可用' : '  ✗ 正文对比不足'),
      '与黑色对比度        ' + contrastBlack.toFixed(2) + ':1' +
        (contrastBlack >= 4.5 ? '  ✓ 正文可用' : '  ✗ 正文对比不足')
    ].join('\n');
  }

  if (colorHex) {
    colorHex.addEventListener('input', function () { showColor(colorHex.value, true); });
    colorPick.addEventListener('input', function () {
      colorHex.value = colorPick.value;
      showColor(colorPick.value, false);
    });
    showColor(colorHex.value, false);
  }

  /* ---------- 文本统计 ---------- */
  var textIn = $('#text-in');

  function updateTextStats() {
    if (!textIn) return;
    var text = textIn.value;
    var chars = Array.from(text).length;
    var noSpace = Array.from(text.replace(/\s/g, '')).length;
    var cjk = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
    var words = (text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []).length;
    var lines = text ? text.split('\n').length : 0;
    var bytes = new TextEncoder().encode(text).length;

    $('#t-chars').textContent = chars;
    $('#t-nospace').textContent = noSpace;
    $('#t-cjk').textContent = cjk;
    $('#t-words').textContent = words;
    $('#t-lines').textContent = lines;
    $('#t-bytes').textContent = bytes;

    var minutes = chars / 400;
    $('#text-time').textContent = chars === 0
      ? '（开始输入后这里会显示阅读时长估算）'
      : '按每分钟 400 字估算，阅读约 ' + (minutes < 1 ? '不到 1' : Math.round(minutes)) + ' 分钟。';
  }

  if (textIn) {
    textIn.addEventListener('input', updateTextStats);
    updateTextStats();
  }
})();
