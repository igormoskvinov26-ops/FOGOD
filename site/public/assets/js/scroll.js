/* Движение при прокрутке.
 *
 * Три правила, на которых это не превращается в аттракцион:
 *
 *   содержание важнее эффекта — прячет не CSS сам по себе, а флаг
 *   has-reveal, который ставит скрипт. Не выполнился скрипт, выключено
 *   движение в системе, нет IntersectionObserver — страница просто видна
 *   целиком, без единого спрятанного блока;
 *
 *   двигаются только transform и opacity — верстка не пересчитывается,
 *   прокрутка не дёргается;
 *
 *   каждый блок проявляется один раз. Повторное появление при обратной
 *   прокрутке — это уже аттракцион, а не подача.
 */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('has-reveal')) return;   // флаг ставит голова страницы

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  // Проявляем не всё подряд: заголовки разделов, карточки, строки графика
  // и два крупных блока. Список намеренно короткий.
  var groups = [
    '.sec-head', '.claim-inner > *', '.demo', '.fam-card',
    '.apply div', '.step', '.chart-row', '.prod',
  ];
  groups.forEach(function (sel) {
    var list = [].slice.call(document.querySelectorAll(sel));
    list.forEach(function (el, i) {
      el.classList.add('reveal');
      // лесенка внутри группы, но не длиннее четверти секунды: иначе
      // последняя карточка приезжает, когда читатель уже ушёл ниже
      if (i) el.style.setProperty('--rd', Math.min(i, 5) * 45 + 'ms');
      io.observe(el);
    });
  });

  // ── Параллакс шевронов в секции аргумента.
  //    Смещение считается от положения секции в окне и отдаётся в CSS
  //    переменной: сам артворк лежит в ::before, из JS его не достать.
  var claim = document.querySelector('.claim');
  if (claim) {
    var raf = 0;
    var move = function () {
      raf = 0;
      var r = claim.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var k = (innerHeight / 2 - (r.top + r.height / 2)) / innerHeight;
      claim.style.setProperty('--chev-y', (k * 46).toFixed(1) + 'px');
    };
    addEventListener('scroll', function () {
      if (!raf) raf = requestAnimationFrame(move);
    }, { passive: true });
    move();
  }
})();
