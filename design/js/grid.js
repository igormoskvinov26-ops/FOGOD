/* Кинетическая сетка: узлы тянутся к курсору, клик пускает рябь.
 *
 * Для водоочистки это ближе к теме, чем падающие капли: возмущение
 * поверхности. Узлы держатся на пружине и возвращаются на место, поэтому
 * покой у сетки строгий — никакого постоянного дрожания.
 *
 * Яркость узла считается от его смещения: спокойная сетка почти не видна,
 * а под курсором и по фронту волны сама проступает. Это и есть весь эффект,
 * никакого свечения сверху.
 */
(function () {
  var cv = document.getElementById('grid');
  if (!cv) return;

  var ctx = cv.getContext('2d');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, dpr = 1, pts = [], cols = 0, rows = 0, raf = 0, last = 0;
  var px = -9999, py = -9999, waves = [], STEP = 34;

  var PULL_R = 215, PULL_K = 54;      // радиус и сила притяжения к курсору
  var WAVE_V = 470, WAVE_W = 100;     // скорость фронта и его толщина
  var SPRING = 62, DAMP = 6.4;

  function build() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    STEP = W < 640 ? 42 : 34;
    cols = Math.ceil(W / STEP) + 1;
    rows = Math.ceil(H / STEP) + 1;
    pts = new Array(cols * rows);
    for (var j = 0; j < rows; j++)
      for (var i = 0; i < cols; i++)
        pts[j * cols + i] = { bx: i * STEP, by: j * STEP, x: i * STEP, y: j * STEP, vx: 0, vy: 0 };
  }

  function step(t) {
    var dt = Math.min((t - last) / 1000, 0.033);
    last = t;

    for (var w = waves.length - 1; w >= 0; w--) {
      waves[w].r += WAVE_V * dt;
      waves[w].a *= 0.984;
      if (waves[w].a < 0.02 || waves[w].r > Math.max(W, H) * 1.25) waves.splice(w, 1);
    }

    ctx.clearRect(0, 0, W, H);

    for (var k = 0; k < pts.length; k++) {
      var p = pts[k];
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

      p.vx = (p.vx + ax * dt) * Math.exp(-DAMP * dt);
      p.vy = (p.vy + ay * dt) * Math.exp(-DAMP * dt);
      p.x += p.vx * dt; p.y += p.vy * dt;

      var ox = p.x - p.bx, oy = p.y - p.by;
      var m = Math.min(Math.sqrt(ox * ox + oy * oy) / 22, 1);
      var a = 0.17 + m * 0.62;
      ctx.fillStyle = m > 0.42
        ? 'rgba(96,168,238,' + a + ')'
        : 'rgba(120,152,190,' + a + ')';
      var sz = m > 0.6 ? 3 : 2.2;
      ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
    }
    raf = requestAnimationFrame(step);
  }

  function start() { if (!raf && !reduced) { last = performance.now(); raf = requestAnimationFrame(step); } }
  function stop()  { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  build();
  addEventListener('resize', build);
  addEventListener('pointermove', function (e) { px = e.clientX; py = e.clientY; }, { passive: true });
  addEventListener('pointerleave', function () { px = py = -9999; });
  addEventListener('pointerdown', function (e) {
    waves.push({ x: e.clientX, y: e.clientY, r: 0, a: 1 });
    if (waves.length > 5) waves.shift();
  }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  if (reduced) { /* покой: сетка рисуется один раз */ last = performance.now(); step(last); stop(); }
  else start();
})();
