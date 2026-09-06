"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Plus, Minus } from "lucide-react";

export function KineticGrid() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0, height = 0, frame = 0, visible = true;
    const pointer = { x: -1000, y: -1000 };
    let ripples: { x: number; y: number; started: number }[] = [];
    const resize = () => {
      width = el.clientWidth; height = el.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = width * dpr; el.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const spacing = width < 700 ? 42 : 54;
      const step = 14;
      const nowRipples = reduced.matches ? [] : ripples.filter(ripple => time - ripple.started < 1900);
      ripples = nowRipples;

      const warp = (x: number, y: number) => {
        let warpedX = x;
        let warpedY = y;
        let energy = 0;
        if (!reduced.matches) {
          const pointerDx = pointer.x - x;
          const pointerDy = pointer.y - y;
          const pointerDistance = Math.hypot(pointerDx, pointerDy) || 1;
          const proximity = Math.max(0, 1 - pointerDistance / 290);
          const pull = proximity * proximity * 38;
          warpedX += pointerDx / pointerDistance * pull;
          warpedY += pointerDy / pointerDistance * pull;
          energy = proximity;

          for (const ripple of nowRipples) {
            const age = time - ripple.started;
            const rippleDx = x - ripple.x;
            const rippleDy = y - ripple.y;
            const distance = Math.hypot(rippleDx, rippleDy) || 1;
            const radius = age * .25;
            const band = Math.max(0, 1 - Math.abs(distance - radius) / 72) * (1 - age / 1900);
            warpedX += rippleDx / distance * band * 13;
            warpedY += rippleDy / distance * band * 13;
            energy = Math.max(energy, band);
          }

          const ambient = Math.sin(x * .006 + y * .004 - time * .00025) * 1.4;
          warpedY += ambient;
        }
        return { x: warpedX, y: warpedY, energy };
      };

      ctx.lineWidth = .72;
      ctx.strokeStyle = "rgba(150, 169, 183, .12)";
      for (let y = 0; y <= height + spacing; y += spacing) {
        ctx.beginPath();
        for (let x = -step; x <= width + step; x += step) {
          const point = warp(x, y);
          if (x === -step) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
      }
      for (let x = 0; x <= width + spacing; x += spacing) {
        ctx.beginPath();
        for (let y = -step; y <= height + step; y += step) {
          const point = warp(x, y);
          if (y === -step) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
      }

      for (let y = 0; y <= height + spacing; y += spacing) {
        for (let x = 0; x <= width + spacing; x += spacing) {
          const point = warp(x, y);
          const alpha = .13 + point.energy * .72;
          ctx.beginPath();
          ctx.fillStyle = point.energy > .04
            ? `rgba(213, 83, 86, ${alpha})`
            : "rgba(175, 190, 201, .18)";
          const radius = .9 + point.energy * 1.45;
          ctx.moveTo(point.x, point.y - radius * 1.75);
          ctx.quadraticCurveTo(point.x + radius * 1.35, point.y + radius * .25, point.x, point.y + radius * 1.28);
          ctx.quadraticCurveTo(point.x - radius * 1.35, point.y + radius * .25, point.x, point.y - radius * 1.75);
          ctx.fill();
          if (point.energy > .12) {
            ctx.beginPath();
            ctx.fillStyle = "rgba(255, 235, 218, .35)";
            ctx.arc(point.x - radius * .28, point.y - radius * .45, Math.max(.35, radius * .18), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      if (!reduced.matches && pointer.x > 0) {
        const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 220);
        glow.addColorStop(0, "rgba(210, 71, 75, .07)");
        glow.addColorStop(.55, "rgba(180, 112, 67, .025)");
        glow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(pointer.x - 220, pointer.y - 220, 440, 440);
      }
      if (visible && !reduced.matches && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const restart = () => { cancelAnimationFrame(frame); draw(performance.now()); };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        pointer.x = -1000; pointer.y = -1000; return;
      }
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    };
    const ripple = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom || reduced.matches) return;
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, started: performance.now() });
      if (ripples.length > 4) ripples.shift();
      restart();
    };
    const leave = () => { pointer.x = -1000; pointer.y = -1000; };
    const observer = new ResizeObserver(() => { resize(); restart(); }); observer.observe(el);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; restart(); }); intersection.observe(el);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", ripple, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", restart);
    reduced.addEventListener("change", restart);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", ripple); document.removeEventListener("pointerleave", leave); document.removeEventListener("visibilitychange", restart); reduced.removeEventListener("change", restart); };
  }, []);
  return <canvas className="kinetic-grid" ref={canvas} aria-hidden="true" />;
}

const products = {
  full: { code: "ОВГД · ПОЛНОПОТОЧНЫЕ", title: "Весь поток. Под контролем.", description: "Очистка всего объёма рабочей среды непосредственно в основной технологической линии.", image: "/filter-fullflow.webp", alt: "Полнопоточный фильтр ОВГД", specs: [["Назначение", "Основная технологическая линия"], ["Режим работы", "Непрерывный"], ["Очистка элемента", "Автоматическая обратная промывка"]] },
  bypass: { code: "ОВГД · НЕПОЛНОПОТОЧНЫЕ", title: "Чистота каждого цикла.", description: "Постоянная очистка части потока в отдельном контуре. Для интеграции в действующее оборудование.", image: "/filter-bypass.webp", alt: "Неполнопоточный фильтр ОВГД", specs: [["Назначение", "Циркуляционные системы"], ["Подключение", "Параллельно основной линии"], ["Исполнение", "Под параметры вашей системы"]] },
};

export function FilterShowcase({ variant = "full", hero = false }: { variant?: keyof typeof products; hero?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [touchLayout, setTouchLayout] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    const sync = () => setTouchLayout(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const active = hovered || pinned || touchLayout;
  const p = products[variant];
  const id = `${hero ? "hero" : "catalog"}-${variant}-specs`;
  return <article className={`filter-showcase ${hero ? "filter-showcase-hero" : ""} ${active ? "is-active" : ""}`}
    onPointerEnter={e => { if (e.pointerType === "mouse") setHovered(true); }}
    onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setHovered(true)}
    onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setHovered(false); }}>
    <div className="filter-information">
      <p className="equipment-code">{p.code}</p>
      <h3>{p.title}</h3>
      {!hero && <p className="filter-description">{p.description}</p>}
      <div id={id} className="filter-specs" aria-hidden={!active}>
        <dl>{p.specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </div>
      <a className="filter-inquiry" href="#request">{hero ? "Подобрать фильтр" : "Запросить исполнение"} <ArrowRight size={16} /></a>
    </div>
    <button type="button" className="filter-object" aria-expanded={active} aria-controls={id} onClick={() => setPinned(!pinned)} aria-label={`${p.alt}: ${active ? "свернуть" : "показать"} характеристики`}>
      <img className="filter-render" src={p.image} alt={p.alt} loading={hero ? "eager" : "lazy"} />
      <span className="filter-control">{active ? <Minus size={16} /> : <Plus size={16} />} {active ? "Характеристики открыты" : "Показать характеристики"}</span>
    </button>
    <span className="filter-index" aria-hidden="true">{variant === "full" ? "01" : "02"} / ОВГД</span>
  </article>;
}
