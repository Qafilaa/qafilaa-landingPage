# -*- coding: utf-8 -*-
"""Transforms applied to the handoff, shared by gen.py, genengine.py and verify.py.

Both sides must apply the same transform: the generators so the shipped files
carry it, verify.py so the reference it diffs against carries it too. Keeping
them in one module is the only thing stopping those from drifting apart.
"""
import re

# ── fluid micro-type ────────────────────────────────────────────────────────
# The handoff hard-codes its micro-labels at 9-11.5px in *inline* styles, which
# no media query can reach. On a 27" display that is a considered choice; on a
# 360px handset it is 56 unreadable labels. Rewriting each one to a custom
# property lets a single media query raise the floor on small screens while
# leaving every desktop value byte-identical.
#
# Keyed by the literal that appears in the handoff, so a new size shows up as a
# miss in `audit_font_sizes()` rather than silently staying tiny.
FONT_VARS = {
    '9px': '--qf-fs-9',
    '10px': '--qf-fs-10',
    '10.5px': '--qf-fs-105',
    '11px': '--qf-fs-11',
    '11.5px': '--qf-fs-115',
}

# What each one becomes at <= 899px. Deliberately modest: these labels are
# uppercase with .14em tracking, so a big jump re-introduces the overflow the
# whole exercise is meant to remove.
FONT_NARROW = {
    '--qf-fs-9': '10.5px',
    '--qf-fs-10': '11.5px',
    '--qf-fs-105': '11.5px',
    '--qf-fs-11': '12px',
    '--qf-fs-115': '12px',
}

_FS = re.compile(r'font-size:(9px|10px|10\.5px|11px|11\.5px)(?=[;"\' ])')


def fluid_type(text):
    """Point every hard-coded micro font-size at its custom property."""
    return _FS.sub(lambda m: 'font-size:var(%s)' % FONT_VARS[m.group(1)], text)


def audit_font_sizes(text):
    """Sizes under 12px the map does not cover — these would stay unreadable."""
    found = set(re.findall(r'font-size:(\d+(?:\.\d+)?)px', text))
    return sorted(s for s in found if float(s) < 12 and (s + 'px') not in FONT_VARS)


def root_font_css():
    """The `:root` block gencss.py emits for the properties above."""
    wide = ',  '.join('%s:%s' % (v, k) for k, v in FONT_VARS.items())
    narrow = ',  '.join('%s:%s' % (k, v) for k, v in FONT_NARROW.items())
    return (':root{ %s; }\n' % wide,
            '  :root{ %s; }\n' % narrow)
