// odpočet 9 → 0 ako v hre; potom už len čaká, kým hráč klikne
(function () {
  var box = document.querySelector('[data-countdown]');
  var num = box.querySelector('.game-over__count-num');
  if (document.documentElement.classList.contains('motion-off') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    box.hidden = true;
    return;
  }
  var n = 9;
  var timer = setInterval(function () {
    n -= 1;
    num.textContent = n;
    if (n === 0) {
      clearInterval(timer);
      box.classList.add('is-over');
      box.querySelector('.game-over__count-label').textContent = 'GAME OVER';
      num.textContent = '';
    }
  }, 1000);
})();
