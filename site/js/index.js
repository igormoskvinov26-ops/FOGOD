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

/* Выбор типа фильтра в герое.
 * Наведение или фокус меняет аппарат: он выезжает вправо с доворотом,
 * а слева проступают параметры. Различает типы только «потери на очистку»
 * — остальные диапазоны у них общие, и придумывать разницу нельзя.
 */
(function () {
  var picks = [].slice.call(document.querySelectorAll('.hero-pick .pick'));
  var box = document.getElementById('hero-params');
  if (!picks.length || !box) return;

  var P = {
    pp: [['Расход', '3–8000 м³/ч', 0], ['Тонкость', 'от 25 мкм', 0],
         ['Давление', '2–25 бар', 0], ['Потери на очистку', 'нет', 1]],
    npp: [['Расход', '3–8000 м³/ч', 0], ['Тонкость', 'от 25 мкм', 0],
          ['Давление', '2–25 бар', 0], ['Потери на очистку', 'до 10 %', 0]]
  };
  var cur = null, spin = 0, FR = 4;   // 4 кадра = поворот на 45 градусов

  // Кадры оборота сняты с 3D-модели изделия (STEP из КОМПАСа). Вращение
  // настоящее: при выборе типа аппарат едет вправо и одновременно
  // проворачивается вокруг оси на 45 градусов. Дальше поворачивать нельзя —
  // на больших углах колонна уходит за корпус и силуэт разваливается.
  // Кадры подгружаются после отрисовки, чтобы не задерживать первый экран.
  var frames = {};
  function preload(key) {
    if (frames[key]) return;
    frames[key] = [];
    for (var i = 0; i < FR; i++) {
      var im = new Image();
      im.src = 'assets/img/turn/' + key + '-0' + i + '.webp';
      frames[key].push(im);
    }
  }
  addEventListener('load', function () { preload('pp'); preload('npp'); });

  function turn(key, el) {
    cancelAnimationFrame(spin);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    preload(key);
    var t0 = performance.now(), DUR = 700;
    (function step(t) {
      var k = Math.min((t - t0) / DUR, 1);
      var e = 1 - Math.pow(1 - k, 3);
      var i = Math.min(Math.round(e * (FR - 1)), FR - 1);
      el.src = 'assets/img/turn/' + key + '-0' + i + '.webp';
      if (k < 1) spin = requestAnimationFrame(step);
    })(t0);
  }

  function show(key) {
    if (key === cur || !P[key]) return;
    cur = key;
    picks.forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.key === key)); });
    document.querySelectorAll('.hero-shot').forEach(function (im) {
      im.classList.toggle('on', im.id === 'shot-' + key);
    });
    turn(key, document.getElementById('shot-' + key));
    box.classList.remove('on');
    box.innerHTML = P[key].map(function (r) {
      return '<span class="p"><span class="k">' + r[0] + '</span>' +
             '<span class="v' + (r[2] ? ' good' : '') + '">' + r[1] + '</span></span>';
    }).join('');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { box.classList.add('on'); });
    });
  }

  picks.forEach(function (b) {
    ['mouseenter', 'focus', 'click'].forEach(function (ev) {
      b.addEventListener(ev, function () { show(b.dataset.key); });
    });
  });
  show('pp');
})();
