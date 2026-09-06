# -*- coding: utf-8 -*-
"""Оборот изделия из STEP: свой растеризатор поверх ядра OpenCASCADE.

    python3 step_to_mesh.py модель.stp модель.npz 3.0
    python3 render_turntable.py модель.npz вывод/ --frames 24

Зачем свой растеризатор, а не готовый движок: нужен PNG с настоящей альфой
и вид, совпадающий с существующими материалами компании. Их «рендеры» —
не фотографии, а CAD-виды с плоской заливкой, поэтому ламберт с мягким
контровым попадает в них точнее, чем любой «фотореалистичный» проход.

STEP AP203 цветов не хранит вовсе, поэтому детали красятся по геометрии
самого тела, а не по выдумке:
    диагональ < 120 мм                     -> крепёж, сталь
    тонкое, широкое и в плане квадратное   -> фланцевое кольцо, жёлтый
    остальное                              -> корпус, красный
Проверка на квадратность обязательна: без неё в жёлтый уходят рёбра-косынки,
они тоже тонкие и широкие, но вытянутые.

Кадры кадрируются по объединённому силуэту всего оборота, иначе изделие
«дышит» при вращении.
"""
import argparse
import os
import time

import numpy as np
from PIL import Image

RED, YELLOW, STEEL = (176, 26, 22), (206, 198, 26), (150, 152, 158)


def part_colors(tris, gid, n):
    col = np.zeros((n, 3), np.float32)
    for g in range(n):
        V = tris[gid == g].reshape(-1, 3)
        e = np.sort(V.max(0) - V.min(0))
        small, mid, big = e
        if big < 120:
            col[g] = STEEL
        elif big > 300 and small < big * 0.14 and mid > big * 0.85:
            col[g] = YELLOW
        else:
            col[g] = RED
    return col


def render(tris, cols, W, H, yaw, pitch=-0.20, ss=2):
    w, h = W * ss, H * ss
    V = tris.reshape(-1, 3).astype(np.float64)
    c = V.mean(0)
    P = V - c
    cy, sy = np.cos(yaw), np.sin(yaw)
    cp, sp = np.cos(pitch), np.sin(pitch)
    M = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]]) @ \
        np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]])
    P = P @ M.T

    Q = V - c
    span = max(np.sqrt((Q[:, 0] ** 2 + Q[:, 2] ** 2).max()) * 2,
               Q[:, 1].max() - Q[:, 1].min()) * 1.04
    dist = span * 3.0
    P[:, 2] -= dist
    f = min(w, h) * dist / span
    z = -P[:, 2]
    S = np.stack([w / 2 + P[:, 0] * f / z, h / 2 - P[:, 1] * f / z, z], 1).reshape(-1, 3, 3)

    N = np.cross(tris[:, 1] - tris[:, 0], tris[:, 2] - tris[:, 0]) @ M.T
    ln = np.linalg.norm(N, axis=1); ln[ln == 0] = 1
    N /= ln[:, None]
    L = np.array([-0.40, 0.66, 0.64]); L /= np.linalg.norm(L)
    face = np.clip(cols * (0.26 + 0.78 * np.clip(N @ L, 0, 1)
                           + 0.20 * np.clip(-N[:, 2], 0, 1) ** 3)[:, None], 0, 255)

    colbuf = np.zeros((h, w, 3), np.float32)
    zb = np.full((h, w), np.inf, np.float32)
    cov = np.zeros((h, w), np.float32)

    front = ((S[:, 1, 0] - S[:, 0, 0]) * (S[:, 2, 1] - S[:, 0, 1]) -
             (S[:, 2, 0] - S[:, 0, 0]) * (S[:, 1, 1] - S[:, 0, 1])) < 0
    idx = np.where(front)[0]
    idx = idx[np.argsort(-S[idx][:, :, 2].mean(1))]

    for i in idx:
        t, fc = S[i], face[i]
        x0 = max(int(t[:, 0].min()), 0); x1 = min(int(t[:, 0].max()) + 2, w)
        y0 = max(int(t[:, 1].min()), 0); y1 = min(int(t[:, 1].max()) + 2, h)
        if x1 <= x0 or y1 <= y0:
            continue
        px, py = np.meshgrid(np.arange(x0, x1) + 0.5, np.arange(y0, y1) + 0.5)
        d = ((t[1, 1] - t[2, 1]) * (t[0, 0] - t[2, 0]) + (t[2, 0] - t[1, 0]) * (t[0, 1] - t[2, 1]))
        if abs(d) < 1e-12:
            continue
        l0 = ((t[1, 1] - t[2, 1]) * (px - t[2, 0]) + (t[2, 0] - t[1, 0]) * (py - t[2, 1])) / d
        l1 = ((t[2, 1] - t[0, 1]) * (px - t[2, 0]) + (t[0, 0] - t[2, 0]) * (py - t[2, 1])) / d
        l2 = 1 - l0 - l1
        m = (l0 >= 0) & (l1 >= 0) & (l2 >= 0)
        if not m.any():
            continue
        zz = l0 * t[0, 2] + l1 * t[1, 2] + l2 * t[2, 2]
        sub = zb[y0:y1, x0:x1]
        upd = m & (zz < sub)
        if not upd.any():
            continue
        sub[upd] = zz[upd]
        colbuf[y0:y1, x0:x1][upd] = fc
        cov[y0:y1, x0:x1][upd] = 1.0

    img = Image.fromarray(np.concatenate([colbuf, (cov * 255)[..., None]], 2).astype(np.uint8), 'RGBA')
    return img.resize((W, H), Image.LANCZOS) if ss > 1 else img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('npz'); ap.add_argument('out')
    ap.add_argument('--frames', type=int, default=24)
    ap.add_argument('--w', type=int, default=760)
    ap.add_argument('--h', type=int, default=640)
    ap.add_argument('--name', default='f')
    ap.add_argument('--quality', type=int, default=84)
    a = ap.parse_args()

    d = np.load(a.npz)
    tris, gid = d['tris'], d['gid']
    cols = part_colors(tris, gid, int(gid.max()) + 1)[gid]
    os.makedirs(a.out, exist_ok=True)

    t0 = time.time()
    imgs = []
    for k in range(a.frames):
        imgs.append(render(tris, cols, a.w, a.h, 2 * np.pi * k / a.frames))
        print('  кадр %2d/%d  %.1f с' % (k + 1, a.frames, time.time() - t0), flush=True)

    # общий кадр по всему обороту, иначе изделие «дышит»
    box = None
    for im in imgs:
        b = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
        if b is None:
            continue
        box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]),
                                     max(box[2], b[2]), max(box[3], b[3]))
    pad = 6
    box = (max(box[0] - pad, 0), max(box[1] - pad, 0),
           min(box[2] + pad, a.w), min(box[3] + pad, a.h))

    total = 0
    for k, im in enumerate(imgs):
        p = os.path.join(a.out, '%s-%02d.webp' % (a.name, k))
        im.crop(box).save(p, quality=a.quality, method=6)
        total += os.path.getsize(p)
    print('%d кадров, %dx%d, %d КБ всего -> %s'
          % (a.frames, box[2] - box[0], box[3] - box[1], total // 1024, a.out), flush=True)


if __name__ == '__main__':
    main()
