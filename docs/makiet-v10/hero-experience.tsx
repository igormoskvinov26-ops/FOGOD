"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import { ArrowRight, Check, Maximize2, Minus, Plus } from "lucide-react";
import { Group, MathUtils, Mesh, MeshStandardMaterial } from "three";

function FilterModel({ focused, reducedMotion }: { focused: boolean; reducedMotion: boolean }) {
  const motion = useRef<Group>(null);
  const idle = useRef<Group>(null);
  const { scene } = useGLTF("/filter-109.glb");
  const model = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    model.traverse(object => {
      if (!(object instanceof Mesh)) return;
      // The assembly is interactively rotated as a whole. Keeping culling off
      // avoids a child mesh dropping out when its imported bounds are stale.
      object.frustumCulled = false;
      const material = object.material;
      const materials = Array.isArray(material) ? material : [material];
      for (const item of materials) {
        if (item instanceof MeshStandardMaterial) item.envMapIntensity = 1.35;
      }
    });
  }, [model]);

  useFrame(({ clock }, delta) => {
    if (!motion.current || !idle.current) return;
    motion.current.position.x = MathUtils.damp(motion.current.position.x, focused ? .52 : 0, 4.2, delta);
    motion.current.position.y = MathUtils.damp(motion.current.position.y, focused ? .04 : 0, 4.2, delta);
    const scale = MathUtils.damp(motion.current.scale.x, focused ? .84 : 1, 4.2, delta);
    motion.current.scale.setScalar(scale);
    // Keep the hero in a controlled three-quarter view. An unbounded idle
    // rotation eventually turns the filter edge-on, which reads as a missing
    // model. The gentle oscillation is deliberately limited to a few degrees.
    const idleYaw = reducedMotion || focused ? 0 : Math.sin(clock.elapsedTime * .34) * .06;
    idle.current.rotation.set(0, -.32 + idleYaw, 0);
  });

  return (
    <group ref={motion}>
      <group ref={idle} rotation={[0, -.32, 0]}>
        <primitive object={model} />
      </group>
    </group>
  );
}

function FilterStage({ focused, reducedMotion }: { focused: boolean; reducedMotion: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, .18, 4.15], fov: 31, near: .1, far: 100 }}
      dpr={[1, 1.65]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop="always"
    >
      <ambientLight intensity={.7} />
      <directionalLight position={[4, 5, 6]} intensity={3.2} color="#fff3df" />
      <directionalLight position={[-4, 1, 3]} intensity={2.1} color="#d84f54" />
      <spotLight position={[0, 6, -2]} intensity={4.5} angle={.46} penumbra={.8} color="#f0a928" />
      <Environment resolution={128}>
        <Lightformer intensity={4} position={[0, 4, 5]} scale={[8, 2, 1]} color="#fff4df" />
        <Lightformer intensity={2} position={[-5, 1, 2]} scale={[3, 5, 1]} color="#c8343b" />
        <Lightformer intensity={1.5} position={[4, -1, 1]} scale={[2, 4, 1]} color="#e3a525" />
      </Environment>
      <Suspense fallback={null}>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={.08}
          rotateSpeed={.55}
          minAzimuthAngle={-.58}
          maxAzimuthAngle={.58}
          minPolarAngle={Math.PI / 2 - .24}
          maxPolarAngle={Math.PI / 2 + .24}
          target={[0, 0, 0]}
        />
        <FilterModel focused={focused} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  );
}

const specifications = [
  ["Тип", "Гидродинамический фильтр ОВГД"],
  ["Исполнение", "Полнопоточное"],
  ["Режим", "Непрерывная фильтрация"],
  ["Очистка", "Автоматическая обратная промывка"],
];

export function HeroExperience() {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const focused = hovered || pinned;

  useEffect(() => {
    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setCoarsePointer(media.matches);
      setReducedMotion(reduced.matches);
    };
    sync();
    media.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div className={`container hero-inner hero-experience ${focused ? "is-model-focused" : ""}`}>
      <div className="hero-copy" aria-hidden={focused} inert={focused}>
        <p className="overline">Промышленная водоподготовка</p>
        <h1>Чистая среда.<br /><span>Непрерывный процесс.</span></h1>
        <p className="lead">Проектирование и производство самоочищающихся фильтров для воды, масел, СОЖ и других жидкостей.</p>
        <div className="hero-actions">
          <a className="primary-button" href="#request">Получить расчёт <ArrowRight size={17} /></a>
          <a className="secondary-link" href="#equipment">Перейти к оборудованию</a>
        </div>
        <ul className="hero-points">
          <li><Check size={16} /> Серийные и индивидуальные исполнения</li>
          <li><Check size={16} /> Собственное производство</li>
          <li><Check size={16} /> Заводские испытания</li>
        </ul>
      </div>

      <section
        className="filter3d-shell"
        aria-label="Интерактивная модель фильтра ОВГД"
        onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
        onPointerLeave={() => setHovered(false)}
      >
        <div className="filter3d-specifications" aria-hidden={!focused}>
          <p className="equipment-code">ОВГД · ФИЛЬТР 109</p>
          <h2>Технические<br />характеристики</h2>
          <dl>
            {specifications.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
          <a className="filter-inquiry" href="#request">Подобрать исполнение <ArrowRight size={16} /></a>
        </div>

        <div className="filter3d-stage">
          <FilterStage focused={focused} reducedMotion={reducedMotion} />
          <div className="filter3d-vignette" aria-hidden="true" />
          <span className="filter3d-drag-hint"><Maximize2 size={14} /> Зажмите и вращайте</span>
        </div>

        <button
          type="button"
          className="filter3d-mode"
          aria-expanded={focused}
          onClick={() => setPinned(value => !value)}
        >
          {focused ? <Minus size={16} /> : <Plus size={16} />}
          {focused ? "Закрыть характеристики" : coarsePointer ? "Открыть характеристики" : "Характеристики"}
        </button>
        <div className="hero-model-caption"><span>Интерактивная CAD-модель</span><span>Серия ОВГД</span></div>
      </section>
    </div>
  );
}

useGLTF.preload("/filter-109.glb");
