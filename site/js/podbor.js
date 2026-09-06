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
