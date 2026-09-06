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
  for (const prim of json.meshes[0].primitives) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(read(prim.attributes.POSITION), 3));
    g.setIndex(new THREE.BufferAttribute(read(prim.indices), 1));
    const m = json.materials[prim.material];
    const pbr = m.pbrMetallicRoughness || {};
    const c = pbr.baseColorFactor || [1, 1, 1, 1];
    group.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({
      color: new THREE.Color().setRGB(c[0], c[1], c[2], THREE.SRGBColorSpace),
      metalness: pbr.metallicFactor ?? 0.2,
      roughness: pbr.roughnessFactor ?? 0.6,
      // нормалей в файле нет: плоская заливка считается в шейдере через
      // производные. Это и есть вид CAD-рендеров компании
      flatShading: true,
      side: THREE.DoubleSide,
    })));
  }
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

  scene.add(new THREE.AmbientLight(0xffffff, 0.22));
  const key = new THREE.DirectionalLight(0xfff2dc, 3.4); key.position.set(4, 6, 5);
  const fill = new THREE.DirectionalLight(0xd34349, 1.15); fill.position.set(-6, 1, 3);
  const rim = new THREE.DirectionalLight(0xc6dcf2, 2.1); rim.position.set(-2, 3, -6);
  scene.add(key, fill, rim);

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

  function frame() {
    const box = new THREE.Box3().setFromObject(pivot);
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    pivot.children.forEach(o => o.position.sub(centre));
    radius = Math.max(Math.hypot(size.x, size.z) * 0.5, size.y * 0.5);
    camera.position.set(0, radius * 0.16, radius * 2.75);
    camera.lookAt(0, 0, 0);
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
  }

  // ── вращение мышью. OrbitControls не нужен: нам хватает двух углов
  //    с пределами и затуханием
  let yaw = CFG.start, pitch = 0, tYaw = CFG.start, tPitch = 0;
  let drag = false, lx = 0, ly = 0;
  const clamp = (v, l) => Math.max(-l, Math.min(l, v));

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
  const stop = e => { drag = false; cv.classList.remove('is-drag'); };
  cv.addEventListener('pointerup', stop);
  cv.addEventListener('pointercancel', stop);

  // ── сдвиг вправо, когда выбран тип: слева освобождается поле под параметры
  let focus = 0, tFocus = 0;
  const picker = document.querySelector('.hero-pick');
  if (picker) {
    picker.addEventListener('pointerenter', () => { tFocus = 1; });
    picker.addEventListener('pointerleave', () => { tFocus = 0; });
    picker.addEventListener('focusin', () => { tFocus = 1; });
    picker.addEventListener('focusout', () => { tFocus = 0; });
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
    focus += (tFocus - focus) * k;
    const idle = reduced || drag || tFocus ? 0 : Math.sin(t * 0.00034) * 0.05;
    pivot.rotation.set(pitch, yaw + idle, 0);
    slide.position.x = focus * radius * 0.42;
    slide.scale.setScalar(1 - focus * 0.14);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  addEventListener('resize', size);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) { t0 = performance.now(); raf = requestAnimationFrame(tick); }
  });

  await show('pp');
  size();
  if (reduced) renderer.render(scene, camera);
  else { t0 = performance.now(); raf = requestAnimationFrame(tick); }

  // переключение типа берём у существующего выбора
  document.querySelectorAll('.hero-pick .pick').forEach(b => {
    ['mouseenter', 'focus', 'click'].forEach(ev =>
      b.addEventListener(ev, () => show(b.dataset.key)));
  });
}

if (document.readyState === 'complete') boot();
else addEventListener('load', boot);
