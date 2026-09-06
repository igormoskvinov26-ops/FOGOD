# -*- coding: utf-8 -*-
"""Сетка из STEP -> GLB для браузера.

    python3 step_to_mesh.py модель.stp модель.npz 8 1.5
    python3 mesh_to_glb.py модель.npz модель.glb

Почему свой экспорт, а не готовый GLB из макета v10: тот сжат
EXT_meshopt_compression и требует полного GLTFLoader плюс декодер —
лишние ~140 КБ скрипта на первом экране. Здесь GLB простой: браузеру
хватает пятидесяти строк разбора.

Два решения, которые режут вес вдвое:

  нормали не пишем      — материал включает flatShading, и three считает
                          нормали в шейдере через производные. Заодно это
                          ровно тот вид, что на CAD-рендерах компании;
  вершины свариваем     — по позиции, с округлением до 0.1 мм. Без нормалей
                          сваривать безопасно: разрыва затенения не будет.

Цвета берутся по геометрии тела, как и в растеризаторе: крепёж по размеру,
фланцевое кольцо по тому, что оно тонкое, широкое и в плане квадратное.
Это чинит дефект готового GLB, где фланцы получили латунь вместо жёлтого.
"""
import argparse
import json
import os
import struct

import numpy as np

RED, YELLOW, STEEL = (0.69, 0.10, 0.09), (0.81, 0.78, 0.10), (0.59, 0.60, 0.62)
GROUPS = [('fogod-red', RED), ('flange-yellow', YELLOW), ('steel', STEEL)]


def part_group(tris, gid, n):
    """0 — корпус, 1 — фланцевое кольцо, 2 — крепёж."""
    g = np.zeros(n, np.int8)
    for k in range(n):
        V = tris[gid == k].reshape(-1, 3)
        small, mid, big = np.sort(V.max(0) - V.min(0))
        if big < 120:
            g[k] = 2
        elif big > 300 and small < big * 0.14 and mid > big * 0.85:
            g[k] = 1
    return g


def weld(tri, scale):
    """Треугольники (n,3,3) в МИЛЛИМЕТРАХ -> уникальные вершины + индексы.

    Сваривать надо до перевода в метры: округление 0.1 применяется к
    миллиметрам. Если сначала поделить на 1000, тот же ключ округлит до
    100 мм и склеит всю модель в десяток точек.
    """
    V = tri.reshape(-1, 3)
    key = np.round(V * 10).astype(np.int64)            # округление до 0.1 мм
    _, first, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
    return (V[first] * scale).astype(np.float32), inv.astype(np.uint32)


def pad4(b, fill=b'\x00'):
    """Выравнивание чанка до 4 байт.

    Спецификация glTF требует РАЗНЫЙ набивочный байт: JSON добивается
    пробелами, двоичный чанк — нулями. Нули в хвосте JSON ломают разбор
    в браузере: JSON.parse спотыкается о них после закрывающей скобки.
    """
    return b + fill * (-len(b) % 4)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('npz'); ap.add_argument('out')
    ap.add_argument('--scale', type=float, default=0.001, help='мм -> метры')
    a = ap.parse_args()

    d = np.load(a.npz)
    tris, gid = d['tris'], d['gid']
    grp = part_group(tris, gid, int(gid.max()) + 1)[gid]

    centre = tris.reshape(-1, 3).mean(0)
    bin_parts, accessors, prims, views = [], [], [], []
    offset = 0

    for gi, (name, _) in enumerate(GROUPS):
        sel = tris[grp == gi]
        if not len(sel):
            continue
        pos, idx = weld(sel - centre, a.scale)
        u16 = len(pos) <= 65535
        idx_b = pad4(idx.astype(np.uint16 if u16 else np.uint32).tobytes())
        pos_b = pad4(pos.tobytes())

        views.append({'buffer': 0, 'byteOffset': offset, 'byteLength': len(idx_b)}); offset += len(idx_b)
        views.append({'buffer': 0, 'byteOffset': offset, 'byteLength': len(pos_b)}); offset += len(pos_b)
        bin_parts += [idx_b, pos_b]

        ai = len(accessors)
        accessors.append({'bufferView': len(views) - 2, 'componentType': 5123 if u16 else 5125,
                          'count': int(len(idx)), 'type': 'SCALAR'})
        accessors.append({'bufferView': len(views) - 1, 'componentType': 5126,
                          'count': int(len(pos)), 'type': 'VEC3',
                          'min': pos.min(0).tolist(), 'max': pos.max(0).tolist()})
        prims.append({'attributes': {'POSITION': ai + 1}, 'indices': ai, 'material': gi, 'mode': 4})
        print('%-14s вершин %6d, треугольников %6d' % (name, len(pos), len(idx) // 3))

    blob = b''.join(bin_parts)
    gltf = {
        'asset': {'version': '2.0', 'generator': 'FOGOD STEP -> GLB (design/tools)'},
        'scene': 0, 'scenes': [{'nodes': [0]}],
        'nodes': [{'name': 'Фильтр 109', 'mesh': 0}],
        'meshes': [{'name': 'assembly', 'primitives': prims}],
        'materials': [{'name': n, 'doubleSided': True,
                       'pbrMetallicRoughness': {'baseColorFactor': list(c) + [1.0],
                                                'metallicFactor': 0.35 if n == 'steel' else 0.15,
                                                'roughnessFactor': 0.45 if n == 'steel' else 0.62}}
                      for n, c in GROUPS[:len(prims)]],
        'accessors': accessors, 'bufferViews': views,
        'buffers': [{'byteLength': len(blob)}],
    }
    js = pad4(json.dumps(gltf, separators=(',', ':')).encode(), b' ')
    glb = (struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob)) +
           struct.pack('<II', len(js), 0x4E4F534A) + js +
           struct.pack('<II', len(blob), 0x004E4942) + blob)
    open(a.out, 'wb').write(glb)
    print('%s: %.2f МБ' % (a.out, len(glb) / 1e6))


if __name__ == '__main__':
    main()
