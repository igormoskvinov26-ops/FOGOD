/* Дрейф капель на фоне.
 *
 * Это абстрактный атмосферный слой, а не вода: рисованная вода отдельным
 * планом выглядит дёшево рядом с настоящими рендерами. Здесь только мелкие
 * капли, которые сносит вниз, а прокрутка подталкивает их сильнее — эффект
 * движения сквозь взвесь.
 *
 * Правила, на которых он не превращается в снегопад:
 *   плотность низкая, прозрачность до 0.34, свечения нет,
 *   быстрые капли рисуются штрихом, а не точкой — это смаз, а не блик.
 */
(function () {
  var cv = document.getElementById('drops');
  if (!cv) return;

  var ctx = cv.getContext('2d');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, dpr = 1, ps = [], last = 0, push = 0, prevY = scrollY, raf = 0;

  var TINT = ['186,214,242', '154,190,226', '46,134,222'];

  function make(seedTop) {
    var d = 0.32 + Math.random() * 0.68;          // глубина: дальние мельче и медленнее
    return {
      x: Math.random() * W,
      y: seedTop ? -Math.random() * 60 : Math.random() * H,
      d: d,
      r: 0.5 + d * 1.9,
      vy: 9 + d * 20,
      vx: (Math.random() - 0.5) * 7 * d,
      a: (0.09 + Math.random() * 0.25) * d,
      c: TINT[(Math.random() * TINT.length) | 0]
    };
  }

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var want = Math.min(96, Math.round(W * H / 24000));
    if (W < 640) want = Math.round(want * 0.55);
    ps.length = 0;
    for (var i = 0; i < want; i++) ps.push(make(false));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      var v = p.vy + push * p.d;
      if (v > 34) {                                // быстрая — рисуем штрихом
        ctx.strokeStyle = 'rgba(' + p.c + ',' + p.a + ')';
        ctx.lineWidth = p.r * 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y + Math.min(v * 0.42, 26));
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(' + p.c + ',' + p.a + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();
      }
    }
  }

  function step(t) {
    var dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    push *= 0.94;                                   // толчок от прокрутки затухает
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      p.y += (p.vy + push * p.d) * dt;
      p.x += p.vx * dt;
      if (p.y - 30 > H) { ps[i] = make(true); }
      else if (p.x < -20) p.x = W + 20;
      else if (p.x > W + 20) p.x = -20;
    }
    draw();
    raf = requestAnimationFrame(step);
  }

  function start() { if (!raf && !reduced) { last = performance.now(); raf = requestAnimationFrame(step); } }
  function stop()  { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  size();
  addEventListener('resize', size);
  addEventListener('scroll', function () {
    push = Math.max(-90, Math.min(160, push + (scrollY - prevY) * 1.7));
    prevY = scrollY;
  }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  if (reduced) draw(); else start();
})();
