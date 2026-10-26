/* 首页：滚动进度条 + 分区渐入 + 左侧分区导航 */
(function () {
  'use strict';

  /* ---- 顶部进度条 ---- */
  var bar = document.getElementById('progress');

  function onScroll() {
    if (bar) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }
    syncRail();
  }

  /* ---- 左侧分区导航高亮 ---- */
  var railLinks = Array.prototype.slice.call(document.querySelectorAll('.sec-rail a'));

  function syncRail() {
    if (!railLinks.length) return;
    var current = null;
    railLinks.forEach(function (a) {
      var el = document.getElementById(a.dataset.sec);
      if (!el) return;
      if (el.getBoundingClientRect().top <= window.innerHeight * 0.45) current = a;
    });
    railLinks.forEach(function (a) { a.classList.toggle('on', a === current); });
  }

  /* ---- 分区渐入 ---- */
  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(items, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();
