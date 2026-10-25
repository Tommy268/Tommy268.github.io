/* 给文章页自动生成目录（宽屏浮动 / 窄屏折叠），并做滚动高亮 */
(function () {
  'use strict';

  var article = document.querySelector('article');
  if (!article) return;

  var heads = Array.prototype.slice.call(article.querySelectorAll('h2'));
  if (heads.length < 2) return; /* 只有一两个小节就没必要生成目录 */

  heads.forEach(function (h, i) {
    if (h.id) return;
    var s = (h.textContent || '').trim().toLowerCase()
      .replace(/[^\w\u4e00-\u9fff-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    h.id = s ? 'h-' + s.slice(0, 40) : 'h-' + (i + 1);
  });

  var links = [];

  function makeList() {
    var ol = document.createElement('ol');
    heads.forEach(function (h) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent.replace(/^#\s*/, '');
      li.appendChild(a);
      ol.appendChild(li);
      links.push(a);
    });
    return ol;
  }

  /* 宽屏：右侧浮动 */
  var toc = document.createElement('nav');
  toc.className = 'toc';
  toc.setAttribute('aria-label', '文章目录');
  toc.appendChild(makeList());
  document.body.appendChild(toc);

  /* 窄屏：正文里折叠一份 */
  var det = document.createElement('details');
  det.className = 'toc-mobile';
  var sum = document.createElement('summary');
  sum.textContent = '目录 · 共 ' + heads.length + ' 节';
  det.appendChild(sum);
  det.appendChild(makeList());

  var meta = article.querySelector('.meta');
  if (meta && meta.parentNode) {
    meta.parentNode.insertBefore(det, meta.nextSibling);
  } else {
    article.insertBefore(det, article.firstChild);
  }

  /* 滚动高亮 */
  var ticking = false;

  function spy() {
    ticking = false;
    var current = heads[0];
    for (var i = 0; i < heads.length; i++) {
      if (heads[i].getBoundingClientRect().top <= 130) current = heads[i];
    }
    /* 滚到底部时高亮最后一节 */
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = heads[heads.length - 1];
    }
    for (var k = 0; k < links.length; k++) {
      links[k].classList.toggle('on', links[k].getAttribute('href') === '#' + current.id);
    }
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(spy);
    }
  }, { passive: true });

  window.addEventListener('resize', spy, { passive: true });

  /* 点击折叠目录后自动收起 */
  det.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') det.open = false;
  });

  spy();
})();
