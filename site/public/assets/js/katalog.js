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
/* Каталог: фасетный отбор. Строки уже отрисованы на сервере —
   скрипт только перерисовывает их при изменении отбора. */
(function () {
  'use strict';
  var D = window.FOGOD, DATA = D.DATA, FAMS = D.FAMS;

  /* Отрасли в фасетах нет намеренно: это ось для посадочных страниц,
     а не для отбора — инженер не выбирает фильтр по отрасли. */
  var GROUPS = [
    { key:'princip', t:'Принцип фильтрации', multi:false },
    { key:'shema',   t:'Схема включения',    multi:false },
    { key:'regen',   t:'Регенерация',        multi:false },
    { key:'privod',  t:'Привод очистки',     multi:false },
    { key:'sredy',   t:'Рабочая среда',      multi:true  },
    { key:'ispoln',  t:'Исполнение',         multi:true  }
  ];

  var st = { fam:null, f:{}, q:'', mkm:'', bar:'', sort:'fam' };
  GROUPS.forEach(function (g) { st.f[g.key] = []; });

  function terms(key) {
    var multi = GROUPS.filter(function (g) { return g.key === key; })[0].multi, out = [];
    DATA.forEach(function (r) {
      var v = r[key]; if (!v) return;
      (multi ? v : [v]).forEach(function (t) { if (out.indexOf(t) === -1) out.push(t); });
    });
    return out;
  }

  function hits(r, key, chosen) {
    if (!chosen.length) return true;
    var v = r[key]; if (!v) return false;
    var arr = Array.isArray(v) ? v : [v];
    return chosen.some(function (c) { return arr.indexOf(c) !== -1; });
  }

  function facetsOk(r) {
    if (st.fam && r.fam !== st.fam) return false;
    return GROUPS.every(function (g) { return hits(r, g.key, st.f[g.key]); });
  }

  function split() {
    var kn = [], un = [];
    DATA.forEach(function (r) {
      if (!facetsOk(r)) return;
      var n = numeric(r, st.q, st.mkm, st.bar);
      if (n === 'known') kn.push(r); else if (n === 'unknown') un.push(r);
    });
    function cmp(a, b) {
      if (st.sort === 'q')   return (a.q ? a.q[0] : 1e9) - (b.q ? b.q[0] : 1e9);
      if (st.sort === 'mkm') return (a.mkm ? a.mkm[0] : 1e9) - (b.mkm ? b.mkm[0] : 1e9);
      return FAMS.indexOf(a.fam) - FAMS.indexOf(b.fam);
    }
    return { known: kn.sort(cmp), unknown: un.sort(cmp) };
  }

  function countFor(key, term) {
    return DATA.filter(function (r) {
      if (st.fam && r.fam !== st.fam) return false;
      var ok = GROUPS.every(function (g) { return g.key === key || hits(r, g.key, st.f[g.key]); });
      if (!ok) return false;
      var v = r[key]; if (!v) return false;
      return (Array.isArray(v) ? v : [v]).indexOf(term) !== -1;
    }).length;
  }

  function renderTabs() {
    document.querySelectorAll('.fam-tab').forEach(function (b) {
      b.setAttribute('aria-pressed', String((b.dataset.fam || null) === st.fam));
    });
  }

  function renderFacets() {
    var h = '';
    GROUPS.forEach(function (g) {
      var ts = terms(g.key); if (!ts.length) return;
      h += '<div class="fgroup"><h3>' + esc(g.t) + '</h3>';
      ts.forEach(function (t) {
        var n = countFor(g.key, t), on = st.f[g.key].indexOf(t) !== -1;
        h += '<label class="opt' + (n === 0 && !on ? ' off' : '') + '">' +
             '<input type="checkbox" data-g="' + g.key + '" value="' + esc(t) + '"' +
             (on ? ' checked' : '') + (n === 0 && !on ? ' disabled' : '') + '>' +
             '<span>' + esc(t) + '</span><span class="n">' + n + '</span></label>';
      });
      h += '</div>';
    });
    h += '<div class="fgroup"><h3>Параметры объекта</h3>' +
      '<div class="num"><label for="n-q">Расход<em>м³/ч</em></label><input id="n-q" type="number" min="0" value="' + esc(st.q) + '"></div>' +
      '<div class="num"><label for="n-mkm">Тонкость<em>мкм</em></label><input id="n-mkm" type="number" min="0" value="' + esc(st.mkm) + '"></div>' +
      '<div class="num"><label for="n-bar">Давление<em>бар</em></label><input id="n-bar" type="number" min="0" value="' + esc(st.bar) + '"></div>' +
      '</div>';
    document.getElementById('facets').innerHTML = h;
  }

  function renderChips() {
    var c = [];
    if (st.fam) c.push({ g:'fam', v:st.fam, t:'семейство' });
    GROUPS.forEach(function (g) {
      st.f[g.key].forEach(function (v) { c.push({ g:g.key, v:v, t:g.t }); });
    });
    if (st.q)   c.push({ g:'q',   v:st.q + ' м³/ч', t:'расход' });
    if (st.mkm) c.push({ g:'mkm', v:st.mkm + ' мкм', t:'тонкость' });
    if (st.bar) c.push({ g:'bar', v:st.bar + ' бар', t:'давление' });
    document.getElementById('chips').innerHTML = c.map(function (x) {
      return '<button class="chip" type="button" data-cg="' + x.g + '" data-cv="' + esc(x.v) + '">' +
             '<b>' + esc(x.t) + '</b>' + esc(x.v) + '<span class="x">×</span></button>';
    }).join('');
    document.getElementById('reset').disabled = c.length === 0;
  }

  function renderRows() {
    var r = split(), h = '', n = r.known.length;
    document.querySelector('.found').innerHTML =
      n + ' ' + plural(n, 'исполнение', 'исполнения', 'исполнений') +
      (r.unknown.length ? ' <span>+ ' + r.unknown.length + ' требуют уточнения</span>' : '');

    if (n) h += '<div class="rows">' + r.known.map(function (x) { return rowHTML(x, true); }).join('') + '</div>';
    else h += '<div class="empty"><h3>Под заданные параметры готового исполнения нет</h3>' +
      '<p>Это не отказ. Изготовление под конкретное ТЗ — обычная практика ФОГОД, а не исключение: пришлите параметры объекта, и мы посчитаем нестандартное исполнение.</p>' +
      '<a class="btn" href="index.html#zayavka">Рассчитать под ТЗ</a></div>';

    if (r.unknown.length) h += '<div class="zone-head"><h2>Характеристики уточняются</h2>' +
      '<span class="n">' + r.unknown.length + '</span></div>' +
      '<p class="zone-note">По этим исполнениям числовые характеристики не опубликованы, поэтому автоматически проверить их по вашим параметрам нельзя. Инженер подтвердит применимость по опросному листу.</p>' +
      '<div class="rows">' + r.unknown.map(function (x) { return rowHTML(x, true); }).join('') + '</div>';

    h += tzBlock();
    document.getElementById('out').innerHTML = h;
  }

  function render()     { renderTabs(); renderFacets(); renderChips(); renderRows(); }
  /* ввод числа не пересобирает рейл: иначе теряется фокус и каретка */
  function renderSoft() { renderChips(); renderRows(); }

  document.addEventListener('click', function (ev) {
    var tab = ev.target.closest('.fam-tab');
    if (tab) { st.fam = tab.dataset.fam || null; render(); return; }
    var chip = ev.target.closest('.chip');
    if (chip) {
      var g = chip.dataset.cg;
      if (g === 'fam') { st.fam = null; render(); return; }
      if (g === 'q' || g === 'mkm' || g === 'bar') {
        st[g] = ''; var el = document.getElementById('n-' + g); if (el) el.value = '';
        renderSoft(); return;
      }
      st.f[g] = st.f[g].filter(function (v) { return v !== chip.dataset.cv; });
      render(); return;
    }
    if (ev.target.id === 'reset') {
      st.fam = null; st.q = st.mkm = st.bar = '';
      GROUPS.forEach(function (g) { st.f[g.key] = []; });
      render();
    }
  });

  document.addEventListener('change', function (ev) {
    var t = ev.target;
    if (t.dataset && t.dataset.g) {
      var arr = st.f[t.dataset.g];
      if (t.checked) { if (arr.indexOf(t.value) === -1) arr.push(t.value); }
      else st.f[t.dataset.g] = arr.filter(function (v) { return v !== t.value; });
      render();
    }
    if (t.id === 'sort') { st.sort = t.value; renderRows(); }
  });

  /* input, а не change: иначе фильтр применяется только по потере фокуса */
  document.addEventListener('input', function (ev) {
    var map = { 'n-q':'q', 'n-mkm':'mkm', 'n-bar':'bar' }, k = map[ev.target.id];
    if (k) { st[k] = ev.target.value; renderSoft(); }
  });

  render();
})();
