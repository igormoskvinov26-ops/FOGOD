window.FOGOD = {"DATA": [{"id": "ovgd-pp", "nm": "ОВГД полнопоточный", "fam": "Гидродинамические", "sub": "Весь поток через фильтр, самоочистка гидродинамикой. Отвод шлама периодический, потерь жидкости нет.", "princip": "Гидродинамический", "shema": "Полнопоточная", "regen": "Самоочистка потоком", "privod": "Без механизма", "sredy": ["Вода", "Масло", "СОЖ"], "ispoln": ["Углеродистая сталь", "Нержавеющая сталь"], "q": [3, 8000], "mkm": [25, null], "bar": [2, 25], "poteri": "нет"}, {"id": "ovgd-npp", "nm": "ОВГД неполнопоточный", "fam": "Гидродинамические", "sub": "Очищается часть потока в контуре. Компактнее в обвязке, отвод шлама постоянный.", "princip": "Гидродинамический", "shema": "Неполнопоточная", "regen": "Самоочистка потоком", "privod": "Без механизма", "sredy": ["Вода", "Масло", "СОЖ"], "ispoln": ["Углеродистая сталь", "Нержавеющая сталь"], "q": [3, 8000], "mkm": [25, null], "bar": [2, 25], "poteri": "до 10 %"}, {"id": "gc", "nm": "Фильтр-гидроциклон", "fam": "Гидродинамические", "sub": "Отделение песка и окалины центробежной силой. В составе ОВГД или как отдельный аппарат.", "princip": "Гидроциклонный", "shema": null, "regen": "Самоочистка потоком", "privod": "Без механизма", "sredy": ["Вода"], "ispoln": ["Углеродистая сталь", "Нержавеющая сталь"], "q": null, "mkm": null, "bar": null, "poteri": null}, {"id": "schetki", "nm": "Фильтр со щётками", "fam": "С обратной промывкой", "sub": "Загрязнения остаются на поверхности сетки, набор щёток снимает их электроприводом. Управление по времени, по перепаду давления или вручную.", "princip": "Сетчатый", "shema": "Полнопоточная", "regen": "Обратная промывка щётками", "privod": "Электропривод", "sredy": ["Вода", "Масло", "СОЖ"], "ispoln": ["Углеродистая сталь", "Нержавеющая сталь"], "q": [25, 9300], "mkm": [80, 3000], "bar": [2, 25], "poteri": null}, {"id": "disk", "nm": "Дисковый фильтр", "fam": "Дисковые", "sub": "Пакет плотно сжатых полимерных дисков. При самопромывке диски разжимаются, обратный поток смывает загрязнения — подача не прерывается.", "princip": "Дисковый", "shema": "Полнопоточная", "regen": "Обратная промывка разжатием дисков", "privod": null, "sredy": ["Вода"], "ispoln": null, "q": null, "mkm": null, "bar": null, "poteri": "низкий расход"}, {"id": "nasyp", "nm": "Насыпной фильтр", "fam": "Насыпные", "sub": "Слой гранулированной загрузки — кварцевый песок, антрацит. Удаляет взвешенные вещества, ил, ржавчину, водоросли.", "princip": "Насыпной", "shema": "Полнопоточная", "regen": "Обратная промывка", "privod": null, "sredy": ["Вода"], "ispoln": null, "q": null, "mkm": null, "bar": null, "poteri": "небольшой объём"}, {"id": "gidravl", "nm": "Гидравлический фильтр", "fam": "Гидравлические", "sub": "Работает на энергии потока: подвод электропитания на объекте не требуется, специальное основание не нужно.", "princip": "Сетчатый", "shema": "Полнопоточная", "regen": "Обратная промывка", "privod": "Энергия потока", "sredy": ["Вода"], "ispoln": null, "q": null, "mkm": null, "bar": null, "poteri": "≈1 %"}, {"id": "agr", "nm": "Для агрессивных сред", "fam": "Специальные", "sub": "Материальное исполнение — нержавеющая сталь или PVDF. Для химических и других производств с агрессивными средами.", "princip": "Сетчатый", "shema": null, "regen": null, "privod": null, "sredy": ["Агрессивные среды"], "ispoln": ["Нержавеющая сталь", "PVDF"], "q": null, "mkm": null, "bar": null, "poteri": null}, {"id": "rukav", "nm": "Рукавный (мешочный)", "fam": "Специальные", "sub": "Водные среды, алифатические и ароматические растворители, щелочные и высокощелочные среды, кислотные и высококислотные растворы.", "princip": "Рукавный", "shema": null, "regen": "Сменный элемент", "privod": "Ручной", "sredy": ["Вода", "Агрессивные среды"], "ispoln": ["Нержавеющая сталь", "PVDF"], "q": null, "mkm": null, "bar": null, "poteri": null}, {"id": "korzina", "nm": "Корзинчатый", "fam": "Специальные", "sub": "Фильтрующая корзина съёмная относительно корпуса — удобный доступ к внутренней полости и лёгкое удаление осадка.", "princip": "Корзинчатый", "shema": null, "regen": "Ручная разборка", "privod": "Ручной", "sredy": ["Вода"], "ispoln": ["Нержавеющая сталь"], "q": null, "mkm": null, "bar": null, "poteri": null}], "FAMS": ["Гидродинамические", "С обратной промывкой", "Дисковые", "Насыпные", "Гидравлические", "Специальные"], "FAM_SLUG": {"Гидродинамические": "gidrodinamicheskie", "С обратной промывкой": "s-obratnoj-promyvkoj", "Дисковые": "diskovye", "Насыпные": "nasypnye", "Гидравлические": "gidravlicheskie", "Специальные": "specialnye"}};
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
        '<a class="btn" href="index.html#zayavka">Запросить КП</a>' +
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
