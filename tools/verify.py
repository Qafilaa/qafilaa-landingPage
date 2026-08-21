# -*- coding: utf-8 -*-
"""Verify the built site against the design handoff, route by route.

The reference is the handoff's own markup with the two intended deviations
applied (real legal URLs, and the waitlist honeypot CLAUDE.md 5 requires), so a
clean run must print zero differences. Anything it reports is real drift.
"""
import os as _os
# Resolve everything from the repo root so this works on a fresh clone and in CI.
REPO = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
TOOLS = _os.path.join(REPO, 'tools')
import io
import os
import re
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')

HERE = os.path.dirname(os.path.abspath(__file__))
DIST = _os.path.join(REPO, 'dist')
SRC = os.path.join(TOOLS, 'design', 'Qafilaa Site v2.dc.html')
LINES = io.open(SRC, encoding='utf-8').read().split('\n')

ROUTES = ['privacy-policy', 'terms-and-conditions', 'delete-account',
          'delete-data', 'support', 'security']

HONEYPOT = ('<input data-wlcompany="1" type="text" name="company" tabindex="-1" '
            'autocomplete="off" aria-hidden="true" style="position:absolute; width:1px; '
            'height:1px; padding:0; border:0; opacity:0; pointer-events:none;">')


def seg(a, b):
    return '\n'.join(LINES[a - 1:b])


def relink(html):
    for r in ROUTES:
        html = html.replace('href="https://qafilaa.in/%s"' % r, 'href="/%s"' % r)
        html = html.replace('href="#%s" data-lgoto="%s"' % (r, r), 'href="/%s"' % r)
        html = html.replace('href="#%s"' % r, 'href="/%s"' % r)
    return re.sub(r'\s*data-lgoto="[^"]*"', '', html)


def root_of(path):
    """The prerendered markup inside #root, minus the outer page wrapper."""
    doc = io.open(path, encoding='utf-8').read()
    i = doc.index('<div id="root">') + len('<div id="root">')
    j = doc.rindex('</div>')
    return doc[i:j]


def unwrap(body, pattern):
    body = re.sub(pattern, '', body, count=1).rstrip()
    return body[:-len('</div>')] if body.endswith('</div>') else body


def diff(name, ref, cand):
    r = os.path.join(HERE, '_ref.html')
    c = os.path.join(HERE, '_cand.html')
    with io.open(r, 'w', encoding='utf-8', newline='\n') as f:
        f.write(ref)
    with io.open(c, 'w', encoding='utf-8', newline='\n') as f:
        f.write(cand)
    p = subprocess.run([sys.executable, os.path.join(HERE, 'domdiff.py'), r, c],
                       capture_output=True, text=True, encoding='utf-8')
    out = p.stdout.strip()
    ok = 'IDENTICAL' in out
    print('\n=== %s ===' % name)
    print(out if not ok else out.splitlines()[0] + '\n  IDENTICAL')
    return ok


# ── home ────────────────────────────────────────────────────────────────────
ref = '\n'.join(LINES[304:388]) + '\n' + '\n'.join(LINES[390:906]) + '\n' + LINES[1409]
ref = relink(ref)
form = '<form data-waitlist="1"'
i = ref.index('>', ref.index(form)) + 1
ref = ref[:i] + '\n' + HONEYPOT + ref[i:]

cand = unwrap(root_of(os.path.join(DIST, 'index.html')),
              r'^\s*<div id="qf-site" data-app="1" style="position:relative">')

# The site footer intentionally diverges from the handoff: it now carries the
# full set of store-required policy links (Apple Guideline 1.2, Play Child
# Safety Standards, EU DSA/EAA). Everything above it must still match exactly,
# so cut both sides at the footer and check its links separately.
ref_body, ref_foot = ref.split('<footer', 1)
cand_body, cand_foot = cand.split('<footer', 1)

results = [diff('/  (landing: chrome + 22 waypoints, above the footer)', ref_body, cand_body)]

REQUIRED_FOOTER_LINKS = [
    '/privacy-policy', '/terms-and-conditions', '/cookies', '/licenses',
    '/community-guidelines', '/child-safety', '/report', '/security',
    '/data-safety', '/permissions', '/subprocessors',
    '/delete-data', '/delete-account',
    '/support', '/contact', '/accessibility',
    'mailto:admin@qafilaa.in',
]
missing = [h for h in REQUIRED_FOOTER_LINKS if ('href="%s"' % h) not in cand_foot]
print('\n=== / footer (intentionally diverged) ===')
print('  %d/%d required links present' % (len(REQUIRED_FOOTER_LINKS) - len(missing), len(REQUIRED_FOOTER_LINKS)))
if missing:
    print('  MISSING: ' + ', '.join(missing))
results.append(not missing)

# ── legal routes ────────────────────────────────────────────────────────────
LEGAL = [('privacy-policy', 933, 1078), ('terms-and-conditions', 1081, 1171),
         ('delete-account', 1174, 1243), ('delete-data', 1246, 1318),
         ('support', 1321, 1359), ('security', 1362, 1401)]

# Apple Guideline 5.1.1 requires the privacy policy itself to name the third
# parties with access to user data and confirm they give the same or greater
# protection. The handoff's section 5 stops short of that, so one paragraph was
# added; fold it into the reference so this check stays a true zero.
EQUAL_PROTECTION = (
    "<p style=\"margin:14px 0 0; font-size:17px; line-height:1.72; color:#4A4842; text-wrap:pretty;\">"
    "Every service provider we use is named on the <a href=\"/subprocessors\">Subprocessors</a> page, with what it does "
    "and what it can see. Each is bound by contract to confidentiality and data-protection terms, is permitted to use "
    "your data only to provide the service to us, and is required to provide the same or greater protection of your "
    "personal data than this policy promises you. None of them is permitted to use it for their own purposes, and none "
    "of them is an advertising network or a data broker.</p>"
)
# Four handoff documents ship undated; the build adds the publication date so
# every policy page carries one. Fold it in so this stays a true zero.
UNDATED = {'delete-account', 'delete-data', 'support', 'security'}
DATE_LINE = (
    '<div style="font-family:' + chr(39) + 'Space Grotesk' + chr(39) + ',sans-serif; font-size:12px; '
    'letter-spacing:.14em; text-transform:uppercase; color:#6E6B63; margin-top:18px;">'
    'Last updated: 20/08/2026</div>'
)


# The shipped app carries Firebase Analytics (lib/core/analytics/, wired in
# main.dart), on by default in release and gated by the diagnostics switch in
# Settings. The handoff's section 2 lists Crashlytics but not Analytics, which
# leaves the binding document understating what is collected. Apple 5.1.1 and
# Play's Data safety both require it to be named.
ANALYTICS_ANCHOR = ('<li><b style="color:#23241F;">Diagnostics:</b> app version, platform and crash reports, '
                    'through Google Firebase Crashlytics. Crash reports carry no identifier for you and no '
                    'request contents.</li>')
ANALYTICS_BULLET = ('<li><b style="color:#23241F;">Product analytics:</b> which screens you open and which '
                    'actions you use, through Google Firebase Analytics. Event and screen names, not the '
                    'contents of your notes, trips or messages. It is on by default in released builds, and the '
                    'diagnostics switch in Settings turns it and crash reporting off together.</li>')


def add_analytics_disclosure(html):
    assert ANALYTICS_ANCHOR in html, 'privacy diagnostics bullet not found'
    return html.replace(ANALYTICS_ANCHOR, ANALYTICS_ANCHOR + ANALYTICS_BULLET, 1)


MERGER = ("In the event of a merger, acquisition, or restructuring, data may be transferred "
          "as part of that transaction, subject to this policy.")

for route, a, b in LEGAL:
    ref = relink(seg(a, b)).replace(' style="display:none;"', '', 1)
    if route in UNDATED:
        k = ref.index('</h1>') + len('</h1>')
        ref = ref[:k] + DATE_LINE + ref[k:]
    if route == 'privacy-policy':
        ref = add_analytics_disclosure(ref)
        k = ref.index('</p>', ref.index(MERGER)) + 4
        ref = ref[:k] + EQUAL_PROTECTION + ref[k:]
    ref = re.sub(r'^\s*<article [^>]*>', '<article>', ref, count=1)
    ref += '\n' + relink(seg(1403, 1406))

    body = root_of(os.path.join(DIST, route, 'index.html'))
    # keep only the <article> and the legal footer; the shell is hand-written
    art = re.search(r'<article[\s\S]*</article>', body)
    foot = re.search(r'<div data-legalfoot="1"[\s\S]*?</div></div>', body)
    assert art, route
    cand = art.group(0)
    if foot:
        cand += '\n' + foot.group(0)[:foot.group(0).rindex('</div>')]
    results.append(diff('/%s' % route, ref, cand))

print('\n' + '─' * 60)
print('%d/%d routes identical to the handoff' % (sum(results), len(results)))
sys.exit(0 if all(results) else 1)
