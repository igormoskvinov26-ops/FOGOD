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
/* Подбор: пять шагов. Среда первой — единственный жёсткий признак,
   ошибка в нём делает весь подбор бессмысленным. Счётчик подходящих
   виден с первого экрана. */
(function () {
  'use strict';
  var DATA = window.FOGOD.DATA;

  var STEPS = [
    { k:'sreda', t:'Рабочая среда', q:'Какую среду очищаем?',
      hint:'Единственный жёсткий признак: ошибка в нём делает весь подбор бессмысленным.',
      opts:['Вода','Масло','СОЖ','Агрессивные среды'] },
    { k:'q',   t:'Расход',   q:'Какая производительность нужна?', unit:'м³/ч',
      hint:'Отсекаются исполнения, у которых заданный расход вне рабочего диапазона.' },
    { k:'mkm', t:'Тонкость', q:'Какая тонкость фильтрации нужна?', unit:'мкм',
      hint:'Отсекаются исполнения грубее требуемого.' },
    { k:'bar', t:'Давление', q:'Рабочее давление на объекте?', unit:'бар',
      hint:'Отсекаются исполнения, не рассчитанные на это давление.' },
    { k:'dn',  t:'Присоединение', q:'Присоединение и условный проход?', unit:'мм',
      hint:'Не отсекает, но влияет на ранжирование: совпадение по DN избавляет от переходника.' }
  ];

  var w = { step:0, sreda:'Вода', q:'', mkm:'', bar:'', dn:'' };

  function match(r) {
    if (r.sredy.indexOf(w.sreda) === -1) return 'no';
    return numeric(r, w.q, w.mkm, w.bar);
  }

  function split() {
    var kn = [], un = [];
    DATA.forEach(function (r) {
      var m = match(r);
      if (m === 'known') kn.push(r); else if (m === 'unknown') un.push(r);
    });
    return { known: kn, unknown: un };
  }

  function render() {
    var rail = STEPS.map(function (s, i) {
      var cls = i === w.step ? ' is-now' : (i < w.step ? ' is-done' : '');
      var v = w[s.k];
      return '<div class="step-item' + cls + '"><span class="n">' + ('0'+(i+1)).slice(-2) + '</span>' +
             '<span>' + esc(s.t) + (v ? '<span class="v">' + esc(v) + (s.unit ? ' ' + s.unit : '') + '</span>' : '') +
             '</span></div>';
    }).join('');
    rail += '<div class="step-item' + (w.step >= STEPS.length ? ' is-now' : '') +
            '"><span class="n">→</span><span>Результат</span></div>';
    document.getElementById('wiz-rail').innerHTML = rail;

    var r = split(), out = '';

    if (w.step < STEPS.length) {
      var s = STEPS[w.step];
      var field = s.opts
        ? '<select id="wiz-in">' + s.opts.map(function (o) {
            return '<option' + (w[s.k] === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>'
        : '<input id="wiz-in" type="number" min="0" value="' + esc(w[s.k]) + '" placeholder="значение">' +
          '<span class="unit">' + s.unit + '</span>';
      out = '<div class="wiz-panel">' +
        '<span class="label">Шаг ' + (w.step + 1) + ' из ' + STEPS.length + '</span>' +
        '<h2>' + esc(s.q) + '</h2>' +
        '<p class="hint">' + esc(s.hint) + '</p>' +
        '<div class="wiz-field">' + field + '</div>' +
        '<div class="wiz-nav">' +
          (w.step ? '<button class="btn ghost" type="button" data-wiz="back">Назад</button>' : '') +
          '<button class="btn" type="button" data-wiz="next">' +
            (w.step === STEPS.length - 1 ? 'Показать результат' : 'Далее') + '</button>' +
          '<span class="wiz-count">подходит <b>' + r.known.length + '</b>' +
            (r.unknown.length ? ' · <i>' + r.unknown.length + ' уточняется</i>' : '') + '</span>' +
        '</div></div>';
    } else {
      out = '<div class="toolbar"><div class="found">' + r.known.length + ' подходит' +
        (r.unknown.length ? ' <span>+ ' + r.unknown.length + ' требуют уточнения</span>' : '') + '</div>' +
        '<div class="sortwrap"><button class="btn ghost" type="button" data-wiz="reset">Начать заново</button></div></div>';
      if (r.known.length) out += '<div class="rows">' + r.known.map(function (x) { return rowHTML(x, true); }).join('') + '</div>';
      else out += '<div class="empty"><h3>Под заданные параметры готового исполнения нет</h3>' +
        '<p>Это не отказ. Фильтры изготавливаются любых типоразмеров — пришлите параметры объекта, и мы посчитаем нестандартное исполнение.</p>' +
        '<a class="btn" href="index.html#zayavka">Рассчитать под ТЗ</a></div>';
      if (r.unknown.length) out += '<div class="zone-head"><h2>Характеристики уточняются</h2>' +
        '<span class="n">' + r.unknown.length + '</span></div>' +
        '<p class="zone-note">По этим исполнениям числовые характеристики не опубликованы. Инженер подтвердит применимость по опросному листу.</p>' +
        '<div class="rows">' + r.unknown.map(function (x) { return rowHTML(x, true); }).join('') + '</div>';
      out += tzBlock();
    }
    document.getElementById('wiz-out').innerHTML = out;
  }

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-wiz]'); if (!b) return;
    var a = b.dataset.wiz;
    if (a === 'back')  w.step--;
    if (a === 'reset') w = { step:0, sreda:'Вода', q:'', mkm:'', bar:'', dn:'' };
    if (a === 'next') {
      var i = document.getElementById('wiz-in');
      if (i) w[STEPS[w.step].k] = i.value;
      w.step++;
    }
    render();
  });

  render();
})();
