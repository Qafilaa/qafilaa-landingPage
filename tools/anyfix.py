# -*- coding: utf-8 -*-
"""Annotate the ported engine's implicit anys, driven by tsc's own diagnostics.

The engine is a 1:1 port of untyped JS whose algorithms are load-bearing for the
visual result, so nothing here reshapes code — it only inserts `: any` /
`: any[]` at the exact positions tsc reports, and re-runs until clean.
"""
import os as _os
# Resolve everything from the repo root so this works on a fresh clone and in CI.
REPO = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
TOOLS = _os.path.join(REPO, 'tools')
import io
import re
import subprocess
import sys

REPO = REPO
TARGET = 'src/site/engine.ts'


def diagnostics():
    p = subprocess.run(['npx.cmd', 'tsc', '--noEmit'], cwd=REPO,
                       capture_output=True, text=True, shell=False)
    out = (p.stdout or '') + (p.stderr or '')
    hits = []
    for m in re.finditer(r'^(\S+?)\((\d+),(\d+)\): error (TS\d+): (.*)$', out, re.M):
        hits.append(dict(file=m.group(1).replace('\\', '/'), line=int(m.group(2)),
                         col=int(m.group(3)), code=m.group(4), msg=m.group(5)))
    return hits, out


for round_no in range(1, 25):
    hits, raw = diagnostics()
    mine = [h for h in hits if h['file'].endswith('engine.ts')]
    other = [h for h in hits if not h['file'].endswith('engine.ts')]
    print('round %d: %d engine.ts errors, %d elsewhere' % (round_no, len(mine), len(other)))
    if not mine:
        if other:
            print('\n'.join('  %(file)s(%(line)d,%(col)d) %(code)s %(msg)s' % h for h in other[:30]))
        break

    lines = io.open(REPO + '\\' + TARGET.replace('/', '\\'), encoding='utf-8').read().split('\n')
    # apply bottom-up so earlier edits never shift later positions
    edits = []
    unhandled = []
    for h in mine:
        code, msg = h['code'], h['msg']
        if code == 'TS7006':                       # implicit-any parameter
            name = re.search(r"Parameter '(\w+)'", msg).group(1)
            edits.append((h['line'], h['col'], name, ': any'))
        elif code == 'TS7034':                     # implicit any[] declaration
            name = re.search(r"Variable '(\w+)'", msg).group(1)
            edits.append((h['line'], h['col'], name, ': any[]'))
        elif code == 'TS7005':
            pass                                   # use site; TS7034 fixes the cause
        elif code == 'TS7031':                     # binding element
            name = re.search(r"Binding element '(\w+)'", msg).group(1)
            edits.append((h['line'], h['col'], name, ': any'))
        else:
            unhandled.append(h)

    if unhandled:
        print('  unhandled:')
        for h in unhandled[:20]:
            print('    (%(line)d,%(col)d) %(code)s %(msg)s' % h)
            print('      >', lines[h['line'] - 1][max(0, h['col'] - 30):h['col'] + 60])
        if not edits:
            sys.exit(1)

    seen = set()
    for line, col, name, ann in sorted(set(edits), key=lambda e: (-e[0], -e[1])):
        if (line, col) in seen:
            continue
        seen.add((line, col))
        src = lines[line - 1]
        i = col - 1
        if src[i:i + len(name)] != name:
            print('  SKIP mismatch at %d,%d expected %r got %r' % (line, col, name, src[i:i + 12]))
            continue
        j = i + len(name)
        # `x => ...` is a bare arrow parameter: annotating it needs parentheses,
        # `(x) => ...` and `f(a, b)` do not.
        if ann == ': any' and src[j:].lstrip().startswith('=>'):
            lines[line - 1] = src[:i] + '(' + name + ': any)' + src[j:]
        else:
            lines[line - 1] = src[:j] + ann + src[j:]

    io.open(REPO + '\\' + TARGET.replace('/', '\\'), 'w', encoding='utf-8',
            newline='\n').write('\n'.join(lines))
