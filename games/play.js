/* 点击后才创建 iframe，避免一进页面就下载十几 MB 的游戏包 */
(function () {
  'use strict';

  var btn = document.getElementById('play');
  var stage = document.getElementById('stage');
  if (!btn || !stage) return;

  btn.addEventListener('click', function () {
    var iframe = document.createElement('iframe');
    iframe.src = btn.dataset.src;
    iframe.title = btn.dataset.title || '游戏';
    iframe.allow = 'autoplay; fullscreen; gamepad';
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;border:0;display:block;background:var(--surface)';
    stage.innerHTML = '';
    stage.appendChild(iframe);
  });
})();
