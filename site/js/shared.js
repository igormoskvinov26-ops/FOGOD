/* Общее для интерактивных страниц. Данные приходят из window.FOGOD. */
(function () {
  'use strict';
  var D = window.FOGOD;

  window.esc = function (x) {
    return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  };

  window.fmt = function (a, unit) {
    if (!a) return '<span class="v nd">уточняется</span>';
    if (a[1] === null) return '<span class="v">от ' + a[0] + ' ' + unit + '</span>';
    return '<span class="v">' + a[0] + '–' + a[1] + ' ' + unit + '</span>';
  };

  window.txtv = function (x) {
    return x ? '<span class="v">' + esc(x) + '</span>' : '<span class="v nd">уточняется</span>';
  };

  window.rowHTML = function (r, showFam) {
    var fam = showFam === false ? '' :
      '<div class="row-fam"><a href="semeystvo/' + D.FAM_SLUG[r.fam] + '.html">' + esc(r.fam) + '</a></div>';
    return '<div class="row"><div>' + fam +
      '<h3 class="nm"><a href="filtr/' + r.id + '.html">' + esc(r.nm) + '</a></h3>' +
      '<p class="sub">' + esc(r.sub) + '</p>' +
      '<div class="specs">' +
        '<div><span class="k">Расход</span>' + fmt(r.q, 'м³/ч') + '</div>' +
        '<div><span class="k">Тонкость</span>' + fmt(r.mkm, 'мкм') + '</div>' +
        '<div><span class="k">Давление</span>' + fmt(r.bar, 'бар') + '</div>' +
        '<div><span class="k">Потери на очистку</span>' + txtv(r.poteri) + '</div>' +
        '<div><span class="k">Привод</span>' + txtv(r.privod) + '</div>' +
      '</div></div>' +
      '<div class="act">' +
        '<a class="act-quiet" href="index.html#zayavka">Запросить КП</a>' +
        '<a class="btn ghost" href="filtr/' + r.id + '.html">Подробнее</a>' +
      '</div></div>';
  };

  /* Склонение: 1 исполнение, 2 исполнения, 5 исполнений */
  window.plural = function (n, one, few, many) {
    var a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return one;
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
    return many;
  };

  /* Числовая проверка. Возвращает known | unknown | no.
     unknown — характеристик нет, исполнение не выбрасывается молча. */
  window.numeric = function (r, q, m, b) {
    var asked = false, unknown = false;
    function n(v) { var x = parseFloat(v); return isNaN(x) ? null : x; }
    q = n(q); m = n(m); b = n(b);
    if (q !== null) { asked = true; if (!r.q) unknown = true; else if (q < r.q[0] || q > r.q[1]) return 'no'; }
    if (m !== null) { asked = true;
      if (!r.mkm) unknown = true;
      else { if (m < r.mkm[0]) return 'no';
             if (r.mkm[1] !== null && m > r.mkm[1]) return 'no'; } }
    if (b !== null) { asked = true; if (!r.bar) unknown = true; else if (b < r.bar[0] || b > r.bar[1]) return 'no'; }
    if (!asked) return 'known';
    return unknown ? 'unknown' : 'known';
  };

  window.tzBlock = function () {
    return '<div class="tz chevrons">' +
      '<div><h3>Не нашли подходящего исполнения?</h3>' +
      '<p>Расчёт и изготовление по вашему техническому заданию. Пришлите среду, расход, тонкость и рабочее давление — вернёмся с предложением и опросным листом.</p></div>' +
      '<a class="btn" href="index.html#zayavka">Отправить параметры</a></div>';
  };
})();
