# -*- coding: utf-8 -*-
"""Build the favicon / PWA icon set from the brand mark.

The shipped brand assets are all landscape (132x80, 180x109, 994x603), so the
site had no square icon at all: the favicon was a squashed 132x80 PNG and the
web manifest declared two non-square icons, which fails PWA installability.

Nothing here recolours or crops the mark. It trims the transparent margin,
centres the artwork on a white square (the treatment the shipped icon-180
already uses), and pads. Maskable variants pad further so the mark survives
Android's circular mask.
"""
import os as _os
# Resolve everything from the repo root so this works on a fresh clone and in CI.
REPO = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
TOOLS = _os.path.join(REPO, 'tools')
import io
import os
import sys

from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'brand', 'logo-mark.png')
OUT = _os.path.join(REPO, 'public', 'brand')
BG = (255, 255, 255, 255)

art = Image.open(SRC).convert('RGBA')
art = art.crop(art.getchannel('A').getbbox())          # trim transparent margin only
print('trimmed artwork: %sx%s' % art.size)


def square(size, inset):
    """Centre the mark on a `size` white square, occupying `inset` of the box."""
    canvas = Image.new('RGBA', (size, size), BG)
    box = int(size * inset)
    w, h = art.size
    scale = min(box / w, box / h)
    w2, h2 = max(1, round(w * scale)), max(1, round(h * scale))
    resized = art.resize((w2, h2), Image.LANCZOS)
    canvas.alpha_composite(resized, ((size - w2) // 2, (size - h2) // 2))
    return canvas


def save(img, name, rgb=False):
    path = os.path.join(OUT, name)
    (img.convert('RGB') if rgb else img).save(path, optimize=True)
    print('  %-28s %sx%s  %5d bytes' % (name, img.size[0], img.size[1], os.path.getsize(path)))


print('standard icons (86% inset):')
for size in (16, 32, 48, 96, 192, 512):
    save(square(size, 0.86), 'icon-%d.png' % size)

# iOS renders apple-touch-icon on an opaque tile and applies its own rounding,
# so it needs a flat background and a little more breathing room.
save(square(180, 0.78).convert('RGB'), 'apple-touch-icon.png', rgb=True)

# Android maskable: everything outside the central 80% circle can be clipped.
print('maskable icons (60% inset, safe for a circular mask):')
for size in (192, 512):
    save(square(size, 0.60), 'icon-maskable-%d.png' % size)

# Multi-resolution .ico for legacy browsers and Windows tiles.
ico = os.path.join(OUT, os.pardir, 'favicon.ico')
square(48, 0.86).convert('RGB').save(ico, sizes=[(16, 16), (32, 32), (48, 48)])
print('  %-28s %5d bytes' % ('favicon.ico', os.path.getsize(ico)))
