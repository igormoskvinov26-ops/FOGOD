/* Мини-подбор на главной: три параметра. Полный — на /podbor.html */
(function () {
  'use strict';
  var DATA = window.FOGOD.DATA;
  var elS = document.getElementById('f-sreda'),
      elQ = document.getElementById('f-q'),
      elM = document.getElementById('f-mkm'),
      out = document.getElementById('results');
  if (!out) return;

  var MEDIA = { voda:'Вода', maslo:'Масло', sozh:'СОЖ', agr:'Агрессивные среды' };

  function head(t) {
    return '<div class="res-head"><span>' + t + '</span><span>Расход, м³/ч</span>' +
           '<span>Тонкость, мкм</span><span>Потери</span></div>';
  }
  function line(r) {
    return '<div class="res-row">' +
      '<div class="nm">' + esc(r.nm) + '<em>' + esc(r.sub.slice(0, 70)) + '</em></div>' +
      cell(r.q) + cell(r.mkm) +
      '<span class="cell"><b>' + esc(r.poteri || 'н/д') + '</b></span></div>';
  }
  function cell(a) {
    if (!a) return '<span class="cell nd">уточняется</span>';
    if (a[1] === null) return '<span class="cell">от <b>' + a[0] + '</b></span>';
    return '<span class="cell"><b>' + a[0] + '–' + a[1] + '</b></span>';
  }

  function run() {
    var sreda = MEDIA[elS.value] || elS.value;
    var kn = [], un = [];
    DATA.forEach(function (r) {
      if (r.sredy.indexOf(sreda) === -1) return;
      var n = numeric(r, elQ.value, elM.value, null);
      if (n === 'known') kn.push(r); else if (n === 'unknown') un.push(r);
    });

    var h = '';
    if (kn.length) h += head('Подходит') + kn.map(line).join('');
    else h += '<div class="res-empty">Под эти параметры готовой позиции в линейке нет.</div>';
    if (un.length) h += head('Требуют уточнения характеристик') + un.map(line).join('');
    h += '<div class="res-note"><p><b>Не нашлось точного совпадения?</b> Изготовление под конкретное ТЗ — наша обычная практика, а не исключение. ' +
         '<a href="podbor.html" style="color:#fff;text-decoration:underline">Пройдите полный подбор</a> или оставьте параметры объекта.</p></div>';
    out.innerHTML = h;
  }

  document.getElementById('f-go').addEventListener('click', run);
  [elS, elQ, elM].forEach(function (el) {
    el.addEventListener('change', run);
    el.addEventListener('input', run);
  });
  run();
})();
