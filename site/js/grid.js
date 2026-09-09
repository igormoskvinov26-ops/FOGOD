/* Кинетическая сетка: узлы тянутся к курсору, клик пускает рябь.
 *
 * Для водоочистки это ближе к теме, чем падающие капли: возмущение
 * поверхности. Узлы держатся на пружине и возвращаются на место, поэтому
 * покой у сетки строгий — никакого постоянного дрожания.
 *
 * Сетка держится нитями между соседями, а не россыпью точек: гнётся именно
 * нить, и деформация читается. Яркость считается от смещения — спокойная
 * сетка едва различима, а под курсором и по фронту волны проступает сама.
 * Никакого свечения сверху.
 *
 * ── Где она уместна (пересмотрено 09.09.2026)
 *
 * Раньше слой висел на всех 21 странице и считался всё время, пока
 * открыта вкладка. Приём сильный, но фоном под каталогом и контактами он
 * не значит ничего — просто шум, который вдобавок постоянно жжёт кадры.
 *
 * Теперь сетка привязана к одной секции — той, что помечена
 * `data-grid-host`, это «Принцип работы». Там возмущение потока и есть
 * предмет разговора, и появление слоя читается как продолжение текста, а
 * не как обои. Секции нет на странице — слой снимается совсем.
 * Секция ушла из окна — цикл останавливается.
 */
(function () {
  var cv = document.getElementById('grid');
  if (!cv) return;

  var host = document.querySelector('[data-grid-host]');
  if (!host) { cv.remove(); return; }      // страница без секции-хозяина

  var ctx = cv.getContext('2d');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, dpr = 1, pts = [], cols = 0, rows = 0, raf = 0, last = 0;
  var px = -9999, py = -9999, waves = [], STEP = 34;
  /* Появление и угасание слоя. Держится здесь, а не на CSS-переходе
     прозрачности: такой переход на полноэкранном fixed-холсте зависает в
     состоянии running с currentTime 0 и, как переход, перебивает и класс, и
     инлайн-стиль — слой оставался невидимым насовсем. Умножением на vis
     внутри отрисовки это делается надёжно и заодно бесплатно. */
  var vis = 0, target = 0;

  var PULL_R = 215, PULL_K = 54;      // радиус и сила притяжения к курсору
  var WAVE_V = 470, WAVE_W = 100;     // скорость фронта и его толщина
  var SPRING = 62, DAMP = 6.4;

  function build() {
    // Фоновому слою вторая точка на пиксель не нужна: это тонкие линии на
    // тёмном, разницы не видно, а пикселей вчетверо больше
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Шаг сетки. Был 34: на 1440×900 это 1161 узел и 2250 отрезков за кадр,
    // и слой съедал почти весь бюджет (замер: 5 кадров в секунду у своей
    // секции против 62 там, где слоя нет). 46 даёт вдвое меньше и того и
    // другого, а рисунок остаётся тем же — нить просто длиннее.
    STEP = W < 640 ? 56 : 46;
    cols = Math.ceil(W / STEP) + 1;
    rows = Math.ceil(H / STEP) + 1;
    pts = new Array(cols * rows);
    for (var j = 0; j < rows; j++)
      for (var i = 0; i < cols; i++)
        pts[j * cols + i] = { bx: i * STEP, by: j * STEP, x: i * STEP, y: j * STEP, vx: 0, vy: 0, m: 0 };
  }

  function step(t) {
    var dt = Math.min((t - last) / 1000, 0.033);
    last = t;

    vis += (target - vis) * (1 - Math.exp(-3.4 * dt));
    if (target === 0 && vis < 0.012) {           // догорело — гасим и выходим
      ctx.clearRect(0, 0, W, H);
      raf = 0;
      return;
    }

    for (var w = waves.length - 1; w >= 0; w--) {
      waves[w].r += WAVE_V * dt;
      waves[w].a *= 0.984;
      if (waves[w].a < 0.02 || waves[w].r > Math.max(W, H) * 1.25) waves.splice(w, 1);
    }

    ctx.clearRect(0, 0, W, H);

    // Затухание одно на кадр, а не два возведения в степень на каждый узел:
    // от точки оно не зависит вовсе, а узлов под тысячу
    var damp = Math.exp(-DAMP * dt);
    var quiet = waves.length === 0;

    for (var k = 0; k < pts.length; k++) {
      var p = pts[k];

      // Узел в покое и вне досягаемости курсора трогать незачем: пружина
      // его уже вернула, интегрировать нечего. В спокойном кадре это
      // отсекает почти всю сетку
      if (quiet && p.m === 0 && p.vx === 0 && p.vy === 0) {
        var qx = p.bx - px, qy = p.by - py;
        if (qx * qx + qy * qy >= PULL_R * PULL_R) continue;
      }

      var ax = (p.bx - p.x) * SPRING, ay = (p.by - p.y) * SPRING;

      var dx = p.bx - px, dy = p.by - py, d2 = dx * dx + dy * dy;
      if (d2 < PULL_R * PULL_R) {
        var d = Math.sqrt(d2) || 1, f = (1 - d / PULL_R);
        ax -= (dx / d) * f * f * PULL_K * SPRING * 0.34;
        ay -= (dy / d) * f * f * PULL_K * SPRING * 0.34;
      }

      for (var w2 = 0; w2 < waves.length; w2++) {
        var wv = waves[w2];
        var wx = p.bx - wv.x, wy = p.by - wv.y;
        var wd = Math.sqrt(wx * wx + wy * wy) || 1;
        var off = Math.abs(wd - wv.r);
        if (off < WAVE_W) {
          var g = Math.cos(off / WAVE_W * 1.5708) * wv.a * 64 * SPRING * 0.34;
          ax += (wx / wd) * g;
          ay += (wy / wd) * g;
        }
      }

      p.vx = (p.vx + ax * dt) * damp;
      p.vy = (p.vy + ay * dt) * damp;
      p.x += p.vx * dt; p.y += p.vy * dt;

      var ox = p.x - p.bx, oy = p.y - p.by;
      p.m = Math.min(Math.sqrt(ox * ox + oy * oy) / 22, 1);

      // Дотлевающие доли пикселя не считаем: узел садится на место, и
      // следующий кадр его пропустит целиком
      if (p.m < 0.004 && Math.abs(p.vx) < 0.6 && Math.abs(p.vy) < 0.6) {
        p.x = p.bx; p.y = p.by; p.vx = p.vy = 0; p.m = 0;
      }
    }

    // Нити между соседями. Без них узлы читаются россыпью точек, а не
    // сеткой, и вся деформация пропадает: гнётся именно нить.
    // Два прохода вместо тысячи обводок: покой одной линией, возмущённое —
    // второй. Иначе 2200 stroke за кадр.
    ctx.lineWidth = 1;
    for (var pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass ? 'rgba(211,67,73,' + (0.40 * vis).toFixed(3) + ')'
                             : 'rgba(150,169,183,' + (0.12 * vis).toFixed(3) + ')';
      ctx.beginPath();
      for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
          var p0 = pts[j * cols + i];
          var hot = p0.m > 0.14;
          if (hot !== !!pass) continue;
          if (i < cols - 1) {
            var pr = pts[j * cols + i + 1];
            ctx.moveTo(p0.x, p0.y); ctx.lineTo(pr.x, pr.y);
          }
          if (j < rows - 1) {
            var pd = pts[(j + 1) * cols + i];
            ctx.moveTo(p0.x, p0.y); ctx.lineTo(pd.x, pd.y);
          }
        }
      }
      ctx.stroke();
    }

    for (var n = 0; n < pts.length; n++) {
      var q = pts[n];
      if (q.m < 0.1) continue;                 // в покое узлы не рисуем: их держат нити
      ctx.fillStyle = 'rgba(213,83,86,' + ((0.15 + q.m * 0.65) * vis).toFixed(3) + ')';
      var sz = q.m > 0.6 ? 3 : 2.2;
      ctx.fillRect(q.x - sz / 2, q.y - sz / 2, sz, sz);
    }
    raf = requestAnimationFrame(step);
  }

  // near — секция в окне. Цикл крутится и на угасании, иначе слой не
  // догорит, а просто пропадёт кадром
  var near = false;
  function start() {
    if (raf || reduced || document.hidden) return;
    if (!near && vis < 0.012) return;
    last = performance.now();
    raf = requestAnimationFrame(step);
  }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  build();
  addEventListener('resize', build);
  addEventListener('pointermove', function (e) { px = e.clientX; py = e.clientY; }, { passive: true });
  addEventListener('pointerleave', function () { px = py = -9999; });
  addEventListener('pointerdown', function (e) {
    if (!near) return;
    waves.push({ x: e.clientX, y: e.clientY, r: 0, a: 1 });
    if (waves.length > 5) waves.shift();
  }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  /* Запас в пол-экрана: слой должен проступить к тому моменту, когда до
     секции долистали, а не включаться на её кромке. */
  function enter(on) {
    near = on;
    target = on ? 1 : 0;
    if (!reduced) { start(); return; }
    // без движения: ни проявления, ни угасания — один кадр или чистый холст
    vis = target;
    if (on) { last = performance.now(); step(last); stop(); }
    else ctx.clearRect(0, 0, W, H);
  }

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (e) { enter(e[0].isIntersecting); },
                             { rootMargin: '50% 0px' }).observe(host);
  } else {
    enter(true);
  }
})();
