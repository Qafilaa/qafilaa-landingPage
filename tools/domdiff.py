# -*- coding: utf-8 -*-
"""Structural diff: design handoff markup vs the prerendered React output.

Both sides are parsed into trees and compared node by node — tag, attributes,
every CSS declaration, and text. Attribute order, declaration order, entity
spelling and whitespace are normalised away; nothing else is.
"""
import os as _os
# Resolve everything from the repo root so this works on a fresh clone and in CI.
REPO = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
TOOLS = _os.path.join(REPO, 'tools')
import html
import io
import re
import sys
from html.parser import HTMLParser

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
        'meta', 'param', 'source', 'track', 'wbr'}
# Attributes that legitimately differ between the two renderers.
DROP_ATTRS = {'inert'}


class Node:
    __slots__ = ('tag', 'attrs', 'kids', 'text', 'parent')

    def __init__(self, tag, attrs=None):
        self.tag = tag
        self.attrs = attrs or {}
        self.kids = []
        self.text = []
        self.parent = None

    def path(self):
        out, n = [], self
        while n is not None and n.tag != '#root':
            i = n.parent.kids.index(n) if n.parent else 0
            label = n.tag
            for k in ('id', 'data-sec', 'data-lpage'):
                if k in n.attrs:
                    label += '[%s=%s]' % (k, n.attrs[k])
                    break
            out.append('%s:%d' % (label, i))
            n = n.parent
        return '/'.join(reversed(out))


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('#root')
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        n = Node(tag, dict((k, v if v is not None else '') for k, v in attrs))
        n.parent = self.stack[-1]
        self.stack[-1].kids.append(n)
        if tag not in VOID:
            self.stack.append(n)

    def handle_startendtag(self, tag, attrs):
        n = Node(tag, dict((k, v if v is not None else '') for k, v in attrs))
        n.parent = self.stack[-1]
        self.stack[-1].kids.append(n)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        if data.strip():
            self.stack[-1].text.append(data)

    def handle_comment(self, data):
        pass


def norm_text(parts):
    return re.sub(r'\s+', ' ', ' '.join(parts)).strip()


def split_decls(style):
    out, buf, depth, quote = [], [], 0, None
    for ch in style:
        if quote:
            buf.append(ch)
            if ch == quote:
                quote = None
            continue
        if ch in '"\'':
            quote = ch
            buf.append(ch)
            continue
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        if ch == ';' and depth == 0:
            out.append(''.join(buf))
            buf = []
            continue
        buf.append(ch)
    if buf:
        out.append(''.join(buf))
    return [d for d in (s.strip() for s in out) if d]


def norm_style(style):
    """Declarations as {prop: value}, whitespace and quoting normalised."""
    d = {}
    for decl in split_decls(style or ''):
        if ':' not in decl:
            continue
        k, v = decl.split(':', 1)
        k = k.strip().lower()
        v = re.sub(r'\s+', ' ', v.strip())
        v = v.replace('"', "'")
        v = re.sub(r"\s*,\s*", ",", v)
        d[k] = v
    return d


def norm_attrs(n):
    out = {}
    for k, v in n.attrs.items():
        k = k.lower()
        if k in DROP_ATTRS:
            continue
        if k == 'style':
            continue
        # React serialises an uncontrolled input's defaultValue as `value`
        v = re.sub(r'\s+', ' ', html.unescape(v or '')).strip()
        if k in ('required', 'checked', 'disabled', 'open', 'selected'):
            v = k                       # `required="required"` == `required=""`
        out[k] = v
    return out


DIFFS = []


def walk(a, b, limit=400):
    if len(DIFFS) >= limit:
        return
    if a.tag != b.tag:
        DIFFS.append('TAG   %s: %s != %s' % (a.path(), a.tag, b.tag))
        return
    aa, ba = norm_attrs(a), norm_attrs(b)
    for k in sorted(set(aa) | set(ba)):
        if aa.get(k) != ba.get(k):
            DIFFS.append('ATTR  %s @%s: %r != %r' % (a.path(), k, aa.get(k), ba.get(k)))
    sa, sb = norm_style(a.attrs.get('style')), norm_style(b.attrs.get('style'))
    for k in sorted(set(sa) | set(sb)):
        if sa.get(k) != sb.get(k):
            DIFFS.append('STYLE %s {%s}: %r != %r' % (a.path(), k, sa.get(k), sb.get(k)))
    ta, tb = norm_text(a.text), norm_text(b.text)
    if ta != tb:
        DIFFS.append('TEXT  %s: %r != %r' % (a.path(), ta[:120], tb[:120]))
    if len(a.kids) != len(b.kids):
        DIFFS.append('KIDS  %s: %d != %d  (%s | %s)' % (
            a.path(), len(a.kids), len(b.kids),
            ','.join(k.tag for k in a.kids[:12]), ','.join(k.tag for k in b.kids[:12])))
    for ka, kb in zip(a.kids, b.kids):
        walk(ka, kb, limit)


def parse(src):
    t = Tree()
    t.feed(src)
    t.close()
    return t.root


def count(n):
    return 1 + sum(count(k) for k in n.kids)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    ref_html = io.open(sys.argv[1], encoding='utf-8').read()
    cand_html = io.open(sys.argv[2], encoding='utf-8').read()
    A, B = parse(ref_html), parse(cand_html)
    print('reference nodes: %d   candidate nodes: %d' % (count(A) - 1, count(B) - 1))
    walk(A, B)
    if not DIFFS:
        print('\nIDENTICAL — no structural, attribute, style or text differences.')
    else:
        print('\n%d difference(s):\n' % len(DIFFS))
        for d in DIFFS[:200]:
            print(' ', d)
