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
    '17px': '--qf-fs-17',
    '18px': '--qf-fs-18',
    '19px': '--qf-fs-19',
    '20px': '--qf-fs-20',
    '21px': '--qf-fs-21',
    '22px': '--qf-fs-22',
    '24px': '--qf-fs-24',
}

# What each becomes at <= 899px.
#
# The floor (9-11.5px) goes UP: those are uppercase micro-labels at .14em
# tracking, unreadable on a handset. The ceiling (17-24px) comes DOWN: the
# handoff scales its headlines for mobile but never its body copy, so a phone
# got a 19px paragraph and 56px-tall buttons and the whole page read zoomed in.
# Gentle on purpose -- 17px is the dominant size and carries the legal prose,
# which should stay comfortable to read, so it only loses a point.
FONT_NARROW = {
    '--qf-fs-9': '12px',
    '--qf-fs-10': '12px',
    '--qf-fs-105': '12px',
    '--qf-fs-11': '12px',
    '--qf-fs-115': '12px',
    '--qf-fs-17': '16px',
    '--qf-fs-18': '16.5px',
    '--qf-fs-19': '17px',
    '--qf-fs-20': '18px',
    '--qf-fs-21': '18.5px',
    '--qf-fs-22': '19px',
    '--qf-fs-24': '20px',
}

_FS = re.compile(r"""font-size:(9px|10px|10\.5px|11px|11\.5px|17px|18px|19px|20px|21px|22px|24px)(?=[;"' ])""")


def fluid_type(text):
    """Point every hard-coded micro font-size at its custom property."""
    return _FS.sub(lambda m: 'font-size:var(%s)' % FONT_VARS[m.group(1)], text)


# ── the nav tagline ─────────────────────────────────────────────────────────
# Requested addition: the brand line sits beside the wordmark in the top bar.
# It is the line the logo lockup already carries, so the mark and the bar say
# the same thing. Hidden below 1080px by the responsive layer, where the pill
# has only enough room for the mark, the menu and the call to action.
NL_INDENT = '\n        '

NAVTAG = ('<span data-navtag="1" style="font-family:' + chr(39) + 'Space Grotesk' + chr(39) + ',sans-serif; '
          'font-size:var(--qf-fs-11); letter-spacing:.14em; text-transform:uppercase; color:var(--sur); '
          'white-space:nowrap; padding-left:12px; margin-left:2px; '
          'border-left:1px solid var(--line);">Built by a rider, for riders</span>')


def add_nav_tagline(html):
    """Put the brand line beside the wordmark in the top bar.

    Anchored on the hook and its closing tag, never on the whole span: the
    wordmark carries `font-size:19px`, which `fluid_type` rewrites, so matching
    the literal made this silently stop finding it.
    """
    key = 'data-navword="1"'
    if key not in html:
        return html
    i = html.index('</span>', html.index(key)) + len('</span>')
    return html[:i] + NL_INDENT + NAVTAG + html[i:]


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
