# -*- coding: utf-8 -*-
"""Markup-level departures from the handoff, shared by gen.py and verify.py.

Both have to apply the same transform: gen.py so the shipped component omits
the block, verify.py so the reference it diffs against omits it too. Keeping
them in one place is the only thing stopping those two from drifting apart.
"""


def strip_hud(html):
    """Remove the flying phone's HUD -- the caption rail under the device.

    Divergence #10. Handoff 13 hung a floating panel under the flying phone
    carrying the flow name, a step counter, a dot rail and prev/next. Rejected
    on review: it crowds the section it floats over and reads as chrome rather
    than as the product.

    The engine's HUD code is deliberately left in place and goes quiet on its
    own: paintHud() and the flight positioning are already null-guarded, so
    putting this block back is the whole of restoring the feature.

    The one thing that is NOT self-guarding is buildHud()'s own
    `if (!this.hud) return`. The roll-out button and the arrow-key flow
    navigation are wired after it, so genengine.py removes that line -- see
    divergence #10 in CLAUDE.md. Do not put it back.
    """
    lines = html.split('\n')
    start = None
    for k, line in enumerate(lines):
        if '<div data-phonehud="1"' in line:
            start = k
            break
    if start is None:
        return html

    # The handoff writes one element per line, so div depth over whole lines is
    # enough to find the close. Counting is what keeps this working when the
    # designer edits inside the block.
    depth, end = 0, None
    for k in range(start, len(lines)):
        depth += lines[k].count('<div') - lines[k].count('</div>')
        if depth == 0:
            end = k
            break
    assert end is not None, 'the [data-phonehud] block never closes'

    del lines[start:end + 1]
    return '\n'.join(lines)
