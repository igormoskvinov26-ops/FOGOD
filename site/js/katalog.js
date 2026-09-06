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
