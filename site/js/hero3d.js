/* Трёхмерный герой: настоящая модель изделия, вращение мышью.
 *
 * Зависимость ровно одна — three.js со своего хостинга. GLTFLoader и
 * OrbitControls не подключаются намеренно: это лишние ~150 КБ, а нужное
 * из них помещается ниже в полсотни строк. GLB собран нашим же
 * конвейером (design/tools/mesh_to_glb.py) без сжатия, поэтому декодер
 * тоже не нужен.
 *
 * Правила, на которых это не разваливается:
 *   без WebGL остаётся картинка — она лежит в разметке и просто не
 *   скрывается, а не подменяется заглушкой;
 *   загрузка начинается после первой отрисовки: 700 КБ модели не должны
 *   задерживать первый экран;
 *   поворот ограничен ±33°, дальше аппарат встаёт ребром и читается как
 *   пропавшая модель. Тот же вывод независимо получен в макете v10.
 */
const CFG = {
  three: 'assets/js/vendor/three.module.min.js',
  model: { pp: 'assets/model/ovgd-pp.glb', npp: 'assets/model/ovgd-npp.glb' },
  /* Выноски. Точки заданы долями габарита, поэтому переживают замену
     модели; подписи разные, потому что низ у исполнений действительно
     разный: у полнопоточного бункер-гидроциклон, у неполнопоточного
     коллектор сброса. Это подтверждено сборочным чертежом. */
  marks: {
    pp: ['Корпус фильтра', 'Ревизионная крышка', 'Бункер-гидроциклон'],
    npp: ['Корпус фильтра', 'Ревизионная крышка', 'Коллектор сброса'],
  },
  mode: { pp: 'Полнопоточное', npp: 'Неполнопоточное' },
  at: [[-0.12, 0.02, 0.42], [-0.10, 0.44, 0.16], [0.40, -0.08, 0.14]],
  labelY: [0.46, 0.16, 0.80],
  yaw: 0.58,          // предел поворота по горизонтали, рад
  pitch: 0.24,        // предел по вертикали от экватора
  start: -0.32,
};

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
              (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

/* Разбор GLB: только то, что кладёт наш экспорт — позиции, индексы,
   базовый цвет. Ни текстур, ни анимаций, ни сжатия здесь не бывает. */
async function loadGLB(url, THREE) {
  const buf = await (await fetch(url)).arrayBuffer();
  const dv = new DataView(buf);
  if (dv.getUint32(0, true) !== 0x46546C67) throw new Error('не GLB');
  let off = 12, json = null, bin = null;
  while (off < dv.byteLength) {
    const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
    const body = buf.slice(off + 8, off + 8 + len);
    if (type === 0x4E4F534A) json = JSON.parse(new TextDecoder().decode(body));
    else if (type === 0x004E4942) bin = body;
    off += 8 + len;
  }
  const view = i => {
    const v = json.bufferViews[i];
    return { off: v.byteOffset || 0, len: v.byteLength };
  };
  const read = i => {
    const a = json.accessors[i], v = view(a.bufferView);
    const Ctor = { 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array }[a.componentType];
    const per = a.type === 'VEC3' ? 3 : 1;
    return new Ctor(bin, v.off, a.count * per);
  };

  const group = new THREE.Group();
  const redMats = [];
  for (const prim of json.meshes[0].primitives) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(read(prim.attributes.POSITION), 3));
    g.setIndex(new THREE.BufferAttribute(read(prim.indices), 1));
    const m = json.materials[prim.material];
    const pbr = m.pbrMetallicRoughness || {};
    const c = pbr.baseColorFactor || [1, 1, 1, 1];
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setRGB(c[0], c[1], c[2], THREE.SRGBColorSpace),
      metalness: pbr.metallicFactor ?? 0.2,
      roughness: pbr.roughnessFactor ?? 0.6,
      // нормалей в файле нет: плоская заливка считается в шейдере через
      // производные. Это и есть вид CAD-рендеров компании
      flatShading: true,
      side: THREE.DoubleSide,
    });
    // корпус, а не крепёж и не сталь: только его красят инженерным режимом.
    // Базовый цвет сохранён отдельно — лерп идёт от него, а не от
    // предыдущего кадра, иначе на медленном таймере цвет уводит.
    if (m.name === 'fogod-red') { mat.userData.base = mat.color.clone(); redMats.push(mat); }
    group.add(new THREE.Mesh(g, mat));
  }
  group.userData.redMats = redMats;
  return group;
}

async function boot() {
  const stage = document.querySelector('.hero-shots');
  if (!stage || !hasWebGL()) return;          // без WebGL остаётся картинка

  // На узком экране трёхмерная сцена не грузится вовсе: 800 КБ модели
  // плюс 700 КБ движка на мобильном трафике — плата не за содержание, а
  // за украшение. Там остаётся рендер, снятый с той же модели.
  if (innerWidth < 900) return;

  const THREE = await import('./' + CFG.three.replace('assets/js/', ''));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cv = document.createElement('canvas');
  cv.className = 'hero-canvas';
  stage.appendChild(cv);

  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  renderer.setClearAlpha(0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  // Инженерный режим красит корпус в графит — тот же приём, что и в макете
  // v17, только цвет меняет материал модели, а не CSS-фильтр поверх неё.
  const GRAPHITE = new THREE.Color(0x707a82);

  scene.add(new THREE.AmbientLight(0xffffff, 0.22));
  const key = new THREE.DirectionalLight(0xfff2dc, 3.4); key.position.set(4, 6, 5);
  const fill = new THREE.DirectionalLight(0xd34349, 1.15); fill.position.set(-6, 1, 3);
  const rim = new THREE.DirectionalLight(0xc6dcf2, 2.1); rim.position.set(-2, 3, -6);
  scene.add(key, fill, rim);
  // заливка красная в покое — это цвет продукта, а не студийный свет.
  // В осмотре она остывает вместе с материалом, иначе графит на модели
  // всё равно читается красным из-за отражённого света
  const FILL_PRODUCT = fill.color.clone(), FILL_ENGINEERING = new THREE.Color(0x8fa6b8);

  /* Карта окружения строится в коде, без файла и без RoomEnvironment из
     examples: сталь с metalness отражает окружение, и без него крепёж на
     тёмном фоне выглядит мёртвым чёрным. Простой вертикальный градиент
     «тёмный низ — светлый верх» даёт металлу то, что нужно. */
  (function () {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 64;
    const g = c.getContext('2d').createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, '#cfe0f2');
    g.addColorStop(0.45, '#5c6b7a');
    g.addColorStop(1, '#0b0e12');
    const x = c.getContext('2d');
    x.fillStyle = g; x.fillRect(0, 0, 16, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromEquirectangular(tex).texture;
    pm.dispose(); tex.dispose();
  })();

  const pivot = new THREE.Group();       // наклон и поворот от мыши
  const slide = new THREE.Group();       // сдвиг вправо при выборе типа
  slide.add(pivot); scene.add(slide);

  const cache = {};
  let current = null, radius = 1;

  const marks = CFG.at.map(() => new THREE.Object3D());
  marks.forEach(m => pivot.add(m));

  function frame() {
    if (!current) return;
    // сброс до замера: иначе повторный показ той же модели центрирует её
    // второй раз и уводит из кадра
    current.position.set(0, 0, 0);
    current.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(current);
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    current.position.sub(centre);
    radius = Math.max(Math.hypot(size.x, size.z) * 0.5, size.y * 0.5);
    camera.position.set(0, radius * 0.16, radius * 2.75);
    camera.lookAt(0, 0, 0);
    marks.forEach((m, i) => m.position.set(
      CFG.at[i][0] * size.x, CFG.at[i][1] * size.y, CFG.at[i][2] * size.z));
  }

  async function show(key) {
    const url = CFG.model[key];
    if (!url) return;
    if (!cache[key]) cache[key] = await loadGLB(url, THREE);
    if (current) pivot.remove(current);
    current = cache[key];
    pivot.add(current);
    frame();
    stage.classList.add('is-3d');
    draft.retitle(key);
  }

  // ── вращение мышью. OrbitControls не нужен: нам хватает двух углов
  //    с пределами и затуханием
  let yaw = CFG.start, pitch = 0, tYaw = CFG.start, tPitch = 0;
  let drag = false, lx = 0, ly = 0;
  let inspOn = false, redBlend = 0;
  const clamp = (v, l) => Math.max(-l, Math.min(l, v));

  /* ── Чертёжный слой. Единственное, ради чего он написан руками, —
     выноски должны ехать за моделью. Точка привязки живёт в сцене,
     проецируется камерой в экранные координаты и каждый кадр тянет за
     собой полку и подпись. Статичный SVG поверх вращающегося холста
     (так сделано в макете v10) через полсекунды указывает в пустоту. */
  const draft = (function () {
    const box = document.getElementById('hero-draft');
    const outer = stage.parentElement;                 // .hero-stage
    if (!box || !outer) return { retitle() {}, sync() {} };
    const svg = box.querySelector('.hd-svg');
    const g = box.querySelector('.hd-lines');
    const calls = [...box.querySelectorAll('.hd-call')];
    const mode = document.querySelector('.hero-block .hb-mode');
    const ns = 'http://www.w3.org/2000/svg';
    const mk = (t, a) => { const e = document.createElementNS(ns, t);
      for (const k in a) e.setAttribute(k, a[k]); return e; };

    const axis = mk('line', { class: 'axis' });
    const ends = [mk('circle', { class: 'mark', r: 11 }), mk('circle', { class: 'mark', r: 11 })];
    const letters = [mk('text', { class: 'mark-t' }), mk('text', { class: 'mark-t' })];
    letters.forEach(t => t.textContent = 'A');
    const leads = calls.map(() => mk('path', { class: 'lead' }));
    const dots = calls.map(() => mk('circle', { class: 'dot', r: 4 }));
    g.append(axis, ...ends, ...letters, ...leads, ...dots);

    const v = new THREE.Vector3();
    let W = 0, H = 0, dx = 0;

    function measure() {
      const a = outer.getBoundingClientRect(), b = stage.getBoundingClientRect();
      W = a.width; H = a.height; dx = b.left - a.left;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      const y = H * 0.52;
      axis.setAttribute('x1', dx + 14); axis.setAttribute('x2', W - 14);
      axis.setAttribute('y1', y); axis.setAttribute('y2', y);
      [dx + 14, W - 14].forEach((x, i) => {
        ends[i].setAttribute('cx', x); ends[i].setAttribute('cy', y);
        letters[i].setAttribute('x', x); letters[i].setAttribute('y', y);
      });
      calls.forEach((el, i) => el.style.top = (CFG.labelY[i] * 100) + '%');
    }

    function sync() {
      if (!W) return;
      marks.forEach((m, i) => {
        m.getWorldPosition(v).project(camera);
        const x = dx + (v.x * 0.5 + 0.5) * (W - dx);
        const y = (-v.y * 0.5 + 0.5) * H;
        const ly = CFG.labelY[i] * H;
        const lx = calls[i].offsetWidth + 10;
        // выноска, которая пошла бы назад через собственную подпись, —
        // это не выноска. В такой кадр она просто гаснет
        const ok = v.z < 1 && x > lx + 44;
        calls[i].classList.toggle('on', ok);
        leads[i].style.opacity = dots[i].style.opacity = ok ? '' : '0';
        if (!ok) return;
        const elbow = Math.max(lx + 30, x - Math.abs(y - ly) - 18);
        leads[i].setAttribute('d', 'M' + x.toFixed(1) + ' ' + y.toFixed(1) +
          'L' + elbow.toFixed(1) + ' ' + ly.toFixed(1) + 'H' + lx);
        dots[i].setAttribute('cx', x.toFixed(1));
        dots[i].setAttribute('cy', y.toFixed(1));
      });
    }

    function retitle(k) {
      (CFG.marks[k] || []).forEach((t, i) => {
        const el = calls[i] && calls[i].querySelector('i');
        if (el) el.textContent = t;
      });
      if (mode) mode.textContent = CFG.mode[k] || '';
      measure();
    }

    const insp = on => { outer.classList.toggle('is-insp', on); inspOn = on; };
    return { retitle, sync, measure, insp };
  })();

  // Осмотр включается наведением на холст и держится, пока модель тянут:
  // увести курсор во время вращения — обычное дело, и слой не должен
  // мигать на полпути
  cv.addEventListener('pointerenter', () => draft.insp(true));
  cv.addEventListener('pointerleave', () => { if (!drag) draft.insp(false); });

  cv.addEventListener('pointerdown', e => {
    drag = true; lx = e.clientX; ly = e.clientY;
    cv.setPointerCapture(e.pointerId); cv.classList.add('is-drag');
  });
  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    tYaw = clamp(tYaw + (e.clientX - lx) * 0.006, CFG.yaw);
    tPitch = clamp(tPitch - (e.clientY - ly) * 0.004, CFG.pitch);
    lx = e.clientX; ly = e.clientY;
  });
  const stop = e => {
    drag = false; cv.classList.remove('is-drag');
    if (!cv.matches(':hover')) draft.insp(false);
  };
  cv.addEventListener('pointerup', stop);
  cv.addEventListener('pointercancel', stop);

  /* Доворот при прокрутке: пока первый экран уходит вверх, аппарат
     поворачивается на треть предела. Это не украшение — уходя, изделие
     показывает вторую сторону, а не просто уезжает. Ручное вращение
     важнее: пока тянут мышью, прокрутка в поворот не вмешивается. */
  let scrollYaw = 0;
  if (!reduced) {
    let sraf = 0;
    const onScroll = () => {
      sraf = 0;
      const r = stage.getBoundingClientRect();
      const k = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)));
      scrollYaw = k * CFG.yaw * 0.34;
    };
    addEventListener('scroll', () => { if (!sraf) sraf = requestAnimationFrame(onScroll); },
                     { passive: true });
    onScroll();
  }

  function size() {
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }

  let raf = 0, t0 = performance.now();
  function tick(t) {
    const dt = Math.min((t - t0) / 1000, 0.05); t0 = t;
    const k = 1 - Math.pow(0.001, dt);
    yaw += (tYaw - yaw) * k;
    pitch += (tPitch - pitch) * k;
    const idle = reduced || drag || inspOn ? 0 : Math.sin(t * 0.00034) * 0.05;
    pivot.rotation.set(pitch, yaw + idle + (drag ? 0 : scrollYaw), 0);
    redBlend += ((inspOn ? 1 : 0) - redBlend) * k;
    if (current && current.userData.redMats) {
      for (const mat of current.userData.redMats) mat.color.copy(mat.userData.base).lerp(GRAPHITE, redBlend);
    }
    fill.color.copy(FILL_PRODUCT).lerp(FILL_ENGINEERING, redBlend);
    fill.intensity = 1.15 - redBlend * 0.3;
    renderer.render(scene, camera);
    draft.sync();
    raf = requestAnimationFrame(tick);
  }

  addEventListener('resize', () => { size(); draft.measure(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) { t0 = performance.now(); raf = requestAnimationFrame(tick); }
  });

  // Герой показывает представительную модель без выбора исполнения —
  // выбор происходит ниже, в разделе «Оборудование». Как и в макете,
  // в герое переключателя нет.
  await show('pp');
  size();
  draft.measure();
  if (reduced) { renderer.render(scene, camera); draft.sync(); }
  else { t0 = performance.now(); raf = requestAnimationFrame(tick); }
}

if (document.readyState === 'complete') boot();
else addEventListener('load', boot);
