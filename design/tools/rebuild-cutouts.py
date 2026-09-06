# -*- coding: utf-8 -*-
"""Пересборка альфы у продуктовых рендеров.

Вырезка в презентации сделана палочкой: вокруг фланцев и между болтами
остались непрозрачные пятна чистого белого. Отличить их от металла можно
по разбросу каналов — фон строго нейтральный (255,255,255), а болты и
блики всегда чуть окрашены. Дальше альфа доводится по цветовой дистанции
и кромка расклеивается с белого, иначе на тёмном полезет ореол.
"""
import os
import numpy as np
from PIL import Image, ImageFilter

def rebuild(path, out, maxh=1200, gain=1.0):
    im  = Image.open(path).convert('RGBA')
    arr = np.asarray(im).astype(np.float32)
    rgb, a0 = arr[..., :3], arr[..., 3]

    mn, mx = rgb.min(axis=2), rgb.max(axis=2)
    flat_white = (mn > 246) & ((mx - mn) <= 6)          # фон, а не металл
    ramp = np.clip((255.0 - mn - 8) / 26.0, 0, 1) * 255  # мягкая кромка

    a = np.where(flat_white, 0.0, np.minimum(a0, np.maximum(ramp, a0 * 0.0 + ramp)))
    a = np.where(a0 < 8, 0.0, a)
    # ступенчатая кромка палочки оставляет светлый ободок на тёмном фоне:
    # подъедаем альфу на пиксель, потом смягчаем
    a = Image.fromarray(a.astype(np.uint8), 'L')
    a = a.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    al = (np.asarray(a).astype(np.float32) / 255.0)[..., None]

    F = np.where(al > 0.02, (rgb - (1 - al) * 255.0) / np.maximum(al, 0.02), rgb)
    if gain != 1.0:                      # рендеры сняты с разной экспозицией
        F = F * gain
    res = Image.fromarray(np.concatenate([np.clip(F, 0, 255), al * 255], 2).astype(np.uint8), 'RGBA')
    bb = res.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox()
    res = res.crop(bb)
    if res.height > maxh:
        res = res.resize((round(res.width * maxh / res.height), maxh), Image.LANCZOS)
    res.save(out)
    print('%-12s -> %-11s %d КБ' % (os.path.basename(out), '%dx%d' % res.size,
                                    os.path.getsize(out) // 1024))

# Источники — вложенная графика презентаций. Распаковать так:
#   unzip -o '<презентация>.pptx' 'ppt/media/*' -d media/
#
# Какой аппарат чем является — по заводской схеме комплектации из docx
# (design/assets/tipy-shema.jpg): полнопоточный собран с бункером-
# гидроциклоном, неполнопоточный — с коллектором сброса.
if __name__ == '__main__':
    rebuild('media/6c2f3878/ppt/media/image-3-4.png', 'assets/ovgd-pp.png')
    # второй рендер снят темнее первого, выравниваю экспозицию
    rebuild('media/56c31bac/ppt/media/image-3-3.png', 'assets/ovgd-npp.png', gain=1.34)
