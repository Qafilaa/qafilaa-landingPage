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


# ── the launch status line ─────────────────────────────────────────────
# The hero carries a one-line status under the social-proof line. The handoff
# was written while the app was still in review, so it reads "In review ·
# launching this month" in the warning colour. Both stores went live on
# 27/08/2026, which makes that line false and makes the warning colour wrong.
#
# Anchored on the colour + text, never the whole element: the div carries
# `font-size:11px`, which `fluid_type` rewrites, so matching the literal would
# silently stop finding it. Same trap `add_nav_tagline` documents.
LAUNCH_OLD = 'color:var(--warn);">In review · launching this month</div>'
LAUNCH_NEW = 'color:var(--acc2);">Out now on the App Store and Google Play</div>'


# The line above it is the social-proof strip. `wire()` overwrites it with the
# live signup count the moment the API answers, but the authored fallback is
# what a visitor sees first -- and on a static build, forever, if the API is
# down. "Join the riders already on the list" invites you onto a waitlist whose
# form handoff 14 deleted, which reads as a dead end now the app is downloadable.
# Replaced with something true whether or not the count ever lands.
WAITLINE_OLD = '<span data-waitline="1">Join the riders already on the list</span>'
WAITLINE_NEW = '<span data-waitline="1">Free on the App Store and Google Play</span>'


def set_launch_status(html):
    """Say what is actually shippable today, in the accent rather than the warning tone."""
    assert LAUNCH_OLD in html, 'the hero launch-status line moved'
    assert WAITLINE_OLD in html, 'the hero social-proof line moved'
    html = html.replace(LAUNCH_OLD, LAUNCH_NEW, 1)
    return html.replace(WAITLINE_OLD, WAITLINE_NEW, 1)


# ── the download FAQ ────────────────────────────────────────────────────────────
# The handoff was written before the app shipped, so the FAQ never answers the
# first question anyone asks once it has: where do I get it. The same question
# and answer go into the FAQPage JSON-LD in index.html -- Google requires the
# answer to be visible on the page carrying the markup, so these two must be
# added and edited together (CLAUDE.md section 7).
#
# Anchored on the first question's summary text, not on the whole element: the
# details carries font sizes `fluid_type` may start rewriting later.
FAQ_FIRST = 'Is there an app to track a group of bikers on a ride?</summary>'

DOWNLOAD_FAQ = (
    '<details class="qf-rcpt" style="border-bottom:1px solid var(--line); padding:11px 0;">'
    '<summary style="cursor:pointer; font-size:15px; font-weight:500; min-height:24px;">'
    'Where can I download Qafilaa?</summary>'
    '<p style="margin:8px 0 0; font-size:14px; line-height:1.55; color:var(--mut);">'
    'Qafilaa is free on the App Store and on Google Play, for iOS 15.5 and Android. The store links are at the end of this page.</p></details>'
)


def add_download_faq(html):
    """Put the download question at the top of the landing page FAQ."""
    assert FAQ_FIRST in html, 'the FAQ list moved'
    i = html.rindex('<details', 0, html.index(FAQ_FIRST))
    return html[:i] + DOWNLOAD_FAQ + html[i:]


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
