# -*- coding: utf-8 -*-
"""Audit the built site: every route's head, and every internal link."""
import os as _os
# Resolve everything from the repo root so this works on a fresh clone and in CI.
REPO = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
TOOLS = _os.path.join(REPO, 'tools')
import io
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
DIST = _os.path.join(REPO, 'dist')

pages = []
for root, _, files in os.walk(DIST):
    for f in files:
        if f.endswith('.html'):
            pages.append(os.path.join(root, f))
# /join is a standalone, noindex deep-link bounce page and 404.html is the
# CDN error document -- neither is a routable URL.
pages = [p for p in pages if 'join' not in p.replace(DIST, '') and not p.endswith('404.html')]


def route_of(path):
    rel = os.path.relpath(path, DIST).replace(os.sep, '/')
    return '/' if rel == 'index.html' else '/' + rel[: -len('/index.html')]


built = {route_of(p) for p in pages}
print('BUILT ROUTES (%d)\n' % len(built))
print('%-24s %-44s %-4s %s' % ('ROUTE', 'TITLE', 'LD', 'CANONICAL'))
print('-' * 118)

bad, checked = [], 0
for p in sorted(pages, key=route_of):
    r = route_of(p)
    doc = io.open(p, encoding='utf-8').read()
    title = re.search(r'<title>(.*?)</title>', doc).group(1)
    canon = re.search(r'<link rel="canonical" href="([^"]*)"', doc).group(1)
    ld = 'yes' if 'application/ld+json' in doc else 'no'
    print('%-24s %-44s %-4s %s' % (r, title[:44], ld, canon))
    for href in set(re.findall(r'href="(/[^"#?]*)"', doc)):
        checked += 1
        h = href.rstrip('/') or '/'
        if h in built:
            continue
        if os.path.exists(os.path.join(DIST, href.lstrip('/').replace('/', os.sep))):
            continue
        bad.append((r, href))

print('\nchecked %d internal links across %d pages' % (checked, len(pages)))
if bad:
    print('BROKEN LINKS:')
    for r, h in sorted(set(bad)):
        print('   %s  ->  %s' % (r, h))
    sys.exit(1)
print('no broken internal links')

# every route must be reachable from the landing page's footer
home = io.open(os.path.join(DIST, 'index.html'), encoding='utf-8').read()
foot = home[home.rindex('<footer'):]
unreachable = sorted(r for r in built if r != '/' and ('href="%s"' % r) not in foot)
print('\nroutes linked from the home footer: %d/%d' % (len(built) - 1 - len(unreachable), len(built) - 1))
if unreachable:
    print('NOT IN FOOTER: ' + ', '.join(unreachable))
    sys.exit(1)
