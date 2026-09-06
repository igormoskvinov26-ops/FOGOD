# -*- coding: utf-8 -*-
"""Вырезка продуктовых рендеров под тёмный сайт.

Исходники — вложенная графика из docx компании: два рендера одной серии,
снятые одной камерой и одним светом, на чистом белом, без вырезки.

Ими заменены рендеры из презентаций, где «удаление фона» палочкой всё
испортило: у одного оставило непрозрачные белые пятна между болтами, у
другого (он лежал на ЧЁРНОМ фоне) съело теневые грани рёбер и стоек —
они того же цвета, что фон. На белом листе ни то, ни другое не видно,
на тёмном сайте аппарат выглядит дырявым. Автоматически тень от фона там
не отделить, поэтому взяты неиспорченные оригиналы.

Альфа считается по цветовой дистанции до белого — как в фирменной печати.
Фон отличается от металла по разбросу каналов: он строго нейтральный,
а болты и блики всегда чуть окрашены.
"""
import os

import numpy as np
from PIL import Image, ImageFilter


def rebuild(path, out, maxh=1200, gain=1.0, lift=0.0):
    im = Image.open(path).convert('RGBA')
    arr = np.asarray(im).astype(np.float32)
    rgb, a0 = arr[..., :3], arr[..., 3]
    mn, mx = rgb.min(axis=2), rgb.max(axis=2)

    flat_white = (mn > 244) & ((mx - mn) <= 6)
    ramp = np.clip((255.0 - mn - 6) / 22.0, 0, 1) * 255
    a = np.where(flat_white | (a0 < 8), 0.0, np.maximum(ramp, 40.0))

    # ступенчатая кромка даёт светлый ободок на тёмном: подъедаем на пиксель
    a = Image.fromarray(a.astype(np.uint8), 'L')
    a = a.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    al = (np.asarray(a).astype(np.float32) / 255.0)[..., None]

    F = np.where(al > 0.02, (rgb - (1 - al) * 255.0) / np.maximum(al, 0.02), rgb)
    if gain != 1.0:
        F = F * gain
    if lift:
        # теневые грани почти чёрные: на тёмном фоне сливаются с ним
        F = lift + F * ((255.0 - lift) / 255.0)

    res = Image.fromarray(np.concatenate([np.clip(F, 0, 255), al * 255], 2).astype(np.uint8), 'RGBA')
    bb = res.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox()
    res = res.crop(bb)
    if res.height > maxh:
        res = res.resize((round(res.width * maxh / res.height), maxh), Image.LANCZOS)
    res.save(out)
    print('%-13s -> %-11s %d КБ' % (os.path.basename(out), '%dx%d' % res.size,
                                    os.path.getsize(out) // 1024))


# Какой аппарат чем является — по заводской схеме комплектации из docx
# (design/assets/tipy-shema.jpg): полнопоточный собран с бункером-
# гидроциклоном, неполнопоточный — с коллектором сброса.
if __name__ == '__main__':
    rebuild('media/9359a6fb/word/media/image24.tiff', 'prod/ovgd-pp.png',  lift=30)
    rebuild('media/9359a6fb/word/media/image23.tiff', 'prod/ovgd-npp.png', lift=30)
