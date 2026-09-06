# -*- coding: utf-8 -*-
"""Кадр фирменных шевронов из вектора.

    python3 chevrons_from_vector.py ../assets/chevrons-vector.pdf ../assets/chevrons-band.jpg

Раньше артворк вырезали из подложки слайда — на больших экранах кромки
были мылом. Теперь он рендерится из исходного PDF (1148x1633 мм), поэтому
кадр можно пересобрать под любое разрешение.

Кадр берётся по всей высоте и почти по всей ширине: в вёрстке артворк
прижат вправо и масштабируется по высоте полосы, поэтому вертикальный
кадр даёт стрелку целиком, а не её кусок.
"""
import argparse
import os

import pymupdf
from PIL import Image

Image.MAX_IMAGE_PIXELS = None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pdf'); ap.add_argument('out')
    ap.add_argument('--dpi', type=int, default=200)
    ap.add_argument('--width', type=int, default=1100)
    ap.add_argument('--left', type=float, default=0.06, help='левая граница кадра, доля ширины')
    ap.add_argument('--quality', type=int, default=88)
    a = ap.parse_args()

    pix = pymupdf.open(a.pdf)[0].get_pixmap(dpi=a.dpi)
    im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    im = im.crop((int(im.width * a.left), 0, im.width, im.height))
    im = im.resize((a.width, round(a.width * im.height / im.width)), Image.LANCZOS)
    im.save(a.out, quality=a.quality, optimize=True)
    print('%s  %dx%d  %d КБ' % (a.out, im.width, im.height, os.path.getsize(a.out) // 1024))


if __name__ == '__main__':
    main()
