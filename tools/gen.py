# -*- coding: utf-8 -*-
"""Generate the React component files for Qafilaa Site v2 from the .dc.html."""
import os as _os
# Resolve everything from the repo root so this works on a fresh clone and in CI.
REPO = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
TOOLS = _os.path.join(REPO, 'tools')
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from h2jsx import convert  # noqa: E402

SRC = os.path.join(TOOLS, 'design', 'Qafilaa Site v2.dc.html')
OUT = _os.path.join(REPO, 'src', 'site')

LINES = open(SRC, encoding='utf-8').read().split('\n')

ROUTES = ['privacy-policy', 'terms-and-conditions', 'delete-account',
          'delete-data', 'support', 'security']

SECTIONS = [
    (359, 380, 'Trailhead'), (383, 399, 'TheSplit'), (402, 417, 'SetUpOnce'),
    (420, 424, 'Permissions'), (427, 442, 'TheSendOff'), (445, 459, 'PlanTheTrip'),
    (462, 480, 'BringTheCrew'), (483, 503, 'DayWisePlan'), (506, 516, 'WhereYouSleep'),
    (519, 546, 'TheMoney'), (549, 586, 'PapersAndLists'), (589, 602, 'Notes'),
    (605, 618, 'AlongTheWay'), (621, 638, 'TheLobby'), (641, 658, 'RollOut'),
    (661, 692, 'LiveConvoy'), (695, 708, 'Navigation'), (711, 752, 'Safety'),
    (755, 781, 'NoSignal'), (784, 816, 'SettingsAndSupport'), (819, 846, 'EndOfTheRide'),
    (849, 874, 'TheEnd'),
]

LEGAL = [
    (901, 1046, 'PrivacyPolicyBody'), (1049, 1139, 'TermsBody'),
    (1142, 1211, 'DeleteAccountBody'), (1214, 1286, 'DeleteDataBody'),
    (1289, 1327, 'SupportBody'), (1330, 1369, 'SecurityBody'),
]


def seg(a, b):
    return '\n'.join(LINES[a - 1:b])


def relink(html):
    """Legal pages are real prerendered routes now, not a hash overlay."""
    for r in ROUTES:
        html = html.replace('href="https://qafilaa.in/%s"' % r, 'href="/%s"' % r)
        html = html.replace('href="#%s" data-lgoto="%s"' % (r, r), 'href="/%s"' % r)
        html = html.replace('href="#%s"' % r, 'href="/%s"' % r)
    html = re.sub(r'\s*data-lgoto="[^"]*"', '', html)
    return html


def reindent(jsx, extra):
    pad = ' ' * extra
    return '\n'.join((pad + ln) if ln.strip() else ln for ln in jsx.split('\n'))


def write(path, body):
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'wb') as f:
        f.write(body.replace('\r\n', '\n').encode('utf-8'))
    print('wrote', path, len(body))


HEAD = ('// Generated from `Qafilaa Site v2.dc.html` (handoff 12), lines %s.\n'
        '// Transcribed 1:1 — every data-* hook is read by src/site/engine.ts,\n'
        '// which has no compile-time link to this markup. Do not rename them.\n')

HONEYPOT = '''            {/* honeypot: real people leave it empty, bots fill it in (see src/api.ts) */}
            <input
              data-wlcompany="1"
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, border: 0, opacity: 0, pointerEvents: 'none' }}
            />'''


def add_honeypot(jsx):
    """CLAUDE.md 5 requires the bot trap the design's bare form does not carry."""
    anchor = '<form data-waitlist="1"'
    assert anchor in jsx, 'waitlist form not found'
    j = jsx.index('>', jsx.index(anchor)) + 1
    return jsx[:j] + '\n' + HONEYPOT + jsx[j:]



NL = chr(10)

SUR_STYLE = ("{ fontFamily: \"'Space Grotesk',sans-serif\", fontSize: '11px', letterSpacing: '.14em', "
             "textTransform: 'uppercase', color: 'var(--sur)' }")

# The handoff ships three footer columns. Every policy route has to be reachable
# from the footer (Apple 1.2 published contact, Play Child Safety Standards, EU
# DSA/EAA), so it carries five. Declared divergence — see CLAUDE.md section 3.
FOOTER_COLUMNS = [
    ('Product', [('#ride', 'Live convoy'), ('#safety', 'Safety'),
                 ('#offline', 'No signal'), ('#join', 'Get the app')]),
    ('Support', [('/support', 'Help centre'), ('/contact', 'Contact'),
                 ('mailto:admin@qafilaa.in', 'admin@qafilaa.in'), ('/accessibility', 'Accessibility')]),
    ('Safety', [('/community-guidelines', 'Community guidelines'), ('/child-safety', 'Child safety'),
                ('/report', 'Report content'), ('/security', 'Security')]),
    ('Your data', [('/data-safety', 'Data safety'), ('/permissions', 'Permissions'),
                   ('/subprocessors', 'Subprocessors'), ('/delete-data', 'Delete my data'),
                   ('/delete-account', 'Delete my account')]),
    ('Legal', [('/privacy-policy', 'Privacy'), ('/terms-and-conditions', 'Terms'),
               ('/cookies', 'Cookies'), ('/licenses', 'Open source')]),
]


def rebuild_footer(jsx):
    """Swap the handoff's three link columns for the full store-required set."""
    anchor = "<div style={{ display: 'flex', gap: '34px', flexWrap: 'wrap', fontSize: '14px' }}>"
    assert anchor in jsx, 'footer link block not found'
    start = jsx.index(anchor)
    depth, i = 0, start
    while i < len(jsx):
        if jsx.startswith('<div', i):
            depth += 1
        elif jsx.startswith('</div>', i):
            depth -= 1
            if depth == 0:
                i += len('</div>')
                break
        i += 1
    out = ["<div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', fontSize: '14px' }}>"]
    for label, links in FOOTER_COLUMNS:
        out.append("            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>")
        out.append('              <span data-plot="1" style={%s}>%s</span>' % (SUR_STYLE, label))
        for href, text in links:
            out.append('              <a href="%s">%s</a>' % (href, text))
        out.append('            </div>')
    out.append('          </div>')
    return jsx[:start] + NL.join(out) + jsx[i:]


# App Store Review Guideline 5.1.1 requires the privacy policy itself to name the
# third parties with access to user data and confirm they give the same or
# greater protection. The handoff's section 5 stops short of that.
EQUAL_PROTECTION = (
    '<p style="margin:14px 0 0; font-size:17px; line-height:1.72; color:#4A4842; text-wrap:pretty;">'
    'Every service provider we use is named on the <a href="/subprocessors">Subprocessors</a> page, with what it does '
    'and what it can see. Each is bound by contract to confidentiality and data-protection terms, is permitted to use '
    'your data only to provide the service to us, and is required to provide the same or greater protection of your '
    'personal data than this policy promises you. None of them is permitted to use it for their own purposes, and none '
    'of them is an advertising network or a data broker.</p>'
)
MERGER = ('In the event of a merger, acquisition, or restructuring, data may be transferred '
          'as part of that transaction, subject to this policy.')


def add_equal_protection(html):
    assert MERGER in html, 'privacy section 5 anchor not found'
    k = html.index('</p>', html.index(MERGER)) + 4
    return html[:k] + EQUAL_PROTECTION + html[k:]



# Four of the handoff's six documents carry no date at all, while Privacy says
# "Last updated" and Terms says "Effective date". An undated policy page is a
# real defect - you cannot tell which version you agreed to - so the missing
# ones get the date this version was published. Not an invention: that is
# exactly what it is. The two that already carry their own authored date keep it.
UNDATED = {'DeleteAccountBody', 'DeleteDataBody', 'SupportBody', 'SecurityBody'}
PUBLISHED = '20/08/2026'
DATE_LINE = (
    '<div style="font-family:' + chr(39) + 'Space Grotesk' + chr(39) + ',sans-serif; font-size:12px; '
    'letter-spacing:.14em; text-transform:uppercase; color:#6E6B63; margin-top:18px;">'
    'Last updated: ' + PUBLISHED + '</div>'
)


def add_date_line(html):
    """Insert the handoff's own date-line markup straight after the h1."""
    k = html.index('</h1>') + len('</h1>')
    return html[:k] + DATE_LINE + html[k:]



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


# ── sections ────────────────────────────────────────────────────────────────
names = []
for i, (a, b, name) in enumerate(SECTIONS):
    jsx = convert(relink(seg(a, b))).strip()
    if name == 'TheEnd':
        jsx = add_honeypot(rebuild_footer(jsx))
    body = HEAD % ('%d-%d' % (a, b))
    body += '\nexport function %s() {\n  return (\n%s\n  );\n}\n' % (
        name, reindent(jsx, 4))
    write('sections/%s.tsx' % name, body)
    names.append(name)

index = HEAD % '359-874'
index += '\n' + '\n'.join(
    "export { %s } from './%s';" % (n, n) for n in names) + '\n'
write('sections/index.ts', index)

# ── chrome ──────────────────────────────────────────────────────────────────
chrome = convert(seg(292, 356)).strip()
body = HEAD % '292-356'
body += """
export function Chrome() {
  return (
    <>
%s
    </>
  );
}
""" % reindent(chrome, 6)
write('chrome/Chrome.tsx', body)

# the shortcuts dialog is the LAST element in the design, after every section
shortcuts = convert(seg(1378, 1378)).strip()
body = HEAD % '1378'
body += """
export function Shortcuts() {
  return (
%s
  );
}
""" % reindent(shortcuts, 4)
write('chrome/Shortcuts.tsx', body)

# ── legal bodies ────────────────────────────────────────────────────────────
lnames = []
for a, b, name in LEGAL:
    raw = relink(seg(a, b))
    # the overlay hid every page but one; as real routes they are always shown
    raw = raw.replace(' style="display:none;"', '', 1)
    if name == 'PrivacyPolicyBody':
        raw = add_equal_protection(raw)
        raw = add_analytics_disclosure(raw)
    if name in UNDATED:
        raw = add_date_line(raw)
    raw = re.sub(r'^\s*<article [^>]*>', '<article>', raw, count=1)
    raw = re.sub(r'</article>\s*$', '</article>', raw)
    jsx = convert(raw).strip()
    body = HEAD % ('%d-%d' % (a, b))
    body += '\nexport function %s() {\n  return (\n%s\n  );\n}\n' % (
        name, reindent(jsx, 4))
    write('legal/%s.tsx' % name, body)
    lnames.append(name)

write('legal/bodies.ts', (HEAD % '901-1369') + '\n' + '\n'.join(
    "export { %s } from './%s';" % (n, n) for n in lnames) + '\n')

# ── legal footer strip (shared by every legal route) ────────────────────────
foot = convert(relink(seg(1371, 1374))).strip()
body = HEAD % "1371-1374"
body += '\nexport function LegalFoot() {\n  return (\n%s\n  );\n}\n' % reindent(foot, 4)
write('legal/LegalFoot.tsx', body)

print('done')
