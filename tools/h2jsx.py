# -*- coding: utf-8 -*-
"""Mechanical HTML -> JSX converter for the Qafilaa Site v3 handoff.

Deliberately dumb and total: it tokenises tags/text/comments and rewrites
attributes. It never reflows or "improves" markup, so the output is a 1:1
transcription of the design.
"""
import os as _os
# Resolve everything from the repo root so this works on a fresh clone and in CI.
REPO = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
TOOLS = _os.path.join(REPO, 'tools')
import re
import sys

# True HTML void elements only. SVG shapes (<path>, <circle>, ...) are written
# with explicit closing tags in the handoff, and JSX accepts `<path ...></path>`
# — self-closing them here would orphan the `</path>` that follows.
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
        'meta', 'param', 'source', 'track', 'wbr'}

# attributes React spells differently
ATTR = {
    'class': 'className', 'for': 'htmlFor', 'tabindex': 'tabIndex',
    # React 18 does not know `fetchPriority` (that landed in 19); left lowercase
    # it passes straight through to the DOM without a warning.
    'crossorigin': 'crossOrigin',
    'autocomplete': 'autoComplete', 'maxlength': 'maxLength',
    'minlength': 'minLength', 'readonly': 'readOnly', 'colspan': 'colSpan',
    'rowspan': 'rowSpan', 'srcset': 'srcSet', 'usemap': 'useMap',
    'contenteditable': 'contentEditable', 'spellcheck': 'spellCheck',
    'autofocus': 'autoFocus', 'novalidate': 'noValidate',
    'enctype': 'encType', 'formaction': 'formAction', 'accesskey': 'accessKey',
    'datetime': 'dateTime', 'http-equiv': 'httpEquiv', 'srclang': 'srcLang',
    'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin', 'stroke-dasharray': 'strokeDasharray',
    'stroke-dashoffset': 'strokeDashoffset', 'stroke-opacity': 'strokeOpacity',
    'stroke-miterlimit': 'strokeMiterlimit',
    'fill-rule': 'fillRule', 'fill-opacity': 'fillOpacity',
    'clip-rule': 'clipRule', 'clip-path': 'clipPath',
    'stop-color': 'stopColor', 'stop-opacity': 'stopOpacity',
    'text-anchor': 'textAnchor', 'dominant-baseline': 'dominantBaseline',
    'font-family': 'fontFamily', 'font-size': 'fontSize',
    'font-weight': 'fontWeight', 'letter-spacing': 'letterSpacing',
    'marker-end': 'markerEnd', 'marker-start': 'markerStart',
    'vector-effect': 'vectorEffect', 'shape-rendering': 'shapeRendering',
    'color-interpolation-filters': 'colorInterpolationFilters',
    'gradientunits': 'gradientUnits', 'patternunits': 'patternUnits',
    'preserveaspectratio': 'preserveAspectRatio', 'viewbox': 'viewBox',
    'stdDeviation': 'stdDeviation',
}
# boolean attributes: emit bare in JSX
BOOL = {'required', 'disabled', 'checked', 'readonly', 'multiple', 'selected',
        'autofocus', 'novalidate', 'open', 'hidden', 'inert', 'async', 'defer'}
# React types these as numbers; `tabIndex="0"` is a type error in TSX.
NUMERIC = {'tabIndex', 'rowSpan', 'colSpan', 'span', 'start', 'maxLength',
           'minLength', 'size', 'cols', 'rows'}

# value/checked on inputs must become uncontrolled defaults
DEFAULTS = {'value': 'defaultValue', 'checked': 'defaultChecked'}

CSS_VAR = re.compile(r'^--')


def css_prop(name):
    name = name.strip()
    if CSS_VAR.match(name):
        return "'" + name + "'"
    if name.startswith('-webkit-') or name.startswith('-moz-') or name.startswith('-ms-'):
        # -webkit-foo-bar -> WebkitFooBar
        head, rest = name.split('-', 2)[1], name.split('-', 2)[2] if name.count('-') > 1 else ''
        parts = name.lstrip('-').split('-')
        out = parts[0].capitalize() + ''.join(p.capitalize() for p in parts[1:])
        return out
    parts = name.split('-')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])


def split_decls(style):
    """Split on ';' that are not inside parens or quotes."""
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


def style_obj(style):
    items = []
    for decl in split_decls(style):
        if ':' not in decl:
            continue
        k, v = decl.split(':', 1)
        v = v.strip()
        prop = css_prop(k)
        val = v.replace('\\', '\\\\').replace("'", "\\'")
        items.append('%s: \'%s\'' % (prop, val))
    return '{ ' + ', '.join(items) + ' }'


ATTR_RE = re.compile(r'([:\w][-:\w.]*)\s*(?:=\s*("[^"]*"|\'[^\']*\'|[^\s"\'>`=]+))?', re.S)


def convert_attrs(raw, tag):
    out = []
    for m in ATTR_RE.finditer(raw):
        name = m.group(1)
        val = m.group(2)
        if val is not None and len(val) >= 2 and val[0] in '"\'' and val[-1] == val[0]:
            val = val[1:-1]
        lname = name.lower()

        if lname == 'style':
            out.append('style={%s}' % style_obj(val or ''))
            continue

        # React 18 renders a camelCase `fetchPriority` verbatim and warns; the
        # types reject the lowercase spelling. A spread gives the correct DOM
        # attribute with neither complaint. (React 19 makes this unnecessary.)
        if lname == 'fetchpriority':
            out.append("{...{ fetchpriority: '%s' }}" % val)
            continue

        if tag in ('input', 'select', 'textarea') and lname in DEFAULTS:
            name = DEFAULTS[lname]
            lname = name.lower()
        elif lname in ATTR:
            name = ATTR[lname]
        elif lname.startswith('data-') or lname.startswith('aria-'):
            pass  # keep verbatim
        elif lname in BOOL or name.islower():
            name = ATTR.get(lname, name)

        if val is None:
            out.append(name)
            continue
        if lname in BOOL and val.lower() in ('', name.lower(), 'true'):
            out.append(name)
            continue
        if name in NUMERIC and re.fullmatch(r'-?\d+', val or ''):
            out.append('%s={%s}' % (name, val))
            continue
        # JSX string literal: escape braces is unnecessary inside quotes, but
        # a literal double quote must be moved into an expression container.
        if '"' in val:
            out.append('%s={%s}' % (name, repr(val).replace('\\n', '\\n')))
        else:
            out.append('%s="%s"' % (name, val))
    return out


TOKEN = re.compile(r'(<!--.*?-->|</[^>]+>|<[^>]+>)', re.S)


def convert(html, indent=0):
    parts = TOKEN.split(html)
    out = []
    for p in parts:
        if not p:
            continue
        if p.startswith('<!--'):
            body = p[4:-3].strip()
            out.append('{/* %s */}' % body.replace('*/', '*\\/'))
            continue
        if p.startswith('</'):
            out.append(p)
            continue
        if p.startswith('<'):
            inner = p[1:-1]
            self_closed = inner.rstrip().endswith('/')
            if self_closed:
                inner = inner.rstrip()[:-1]
            m = re.match(r'\s*([-\w:]+)\s*(.*)$', inner, re.S)
            if not m:
                out.append(p)
                continue
            tag, rest = m.group(1), m.group(2)
            attrs = convert_attrs(rest, tag.lower())
            head = '<' + tag + (' ' + ' '.join(attrs) if attrs else '')
            if self_closed or tag.lower() in VOID:
                out.append(head + ' />')
            else:
                out.append(head + '>')
            continue
        # text node
        txt = p.replace('{', '&#123;').replace('}', '&#125;')
        out.append(txt)
    return ''.join(out)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    src = open(sys.argv[1], encoding='utf-8').read()
    lines = src.split('\n')
    a, b = int(sys.argv[2]), int(sys.argv[3])
    seg = '\n'.join(lines[a - 1:b])
    sys.stdout.write(convert(seg))
