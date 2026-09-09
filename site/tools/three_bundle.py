# -*- coding: utf-8 -*-
"""three.js из двух ES-модулей в один классический скрипт.

Нужно ровно для одного: превью (`preview.py`) — это один HTML-файл, внутри
которого нет ни сети, ни файловой системы. ES-модуль там не грузится: у
`import` нет адреса, по которому он мог бы сходить. Динамический
`import('data:...')` и `blob:` отпадают по другой причине — их режет CSP
страницы-артефакта, причём молча.

Поэтому оба чанка заворачиваются в IIFE, а связь между ними — обычная
переменная вместо `import`. Преобразование механическое, ручной правки в
исходнике three.js нет:

    core:    export{a as A,...}          ->  return {A: a, ...}
    module:  import{A as e,...}from"..." ->  const {A: e, ...} = CORE;
             export{Name,...}from"..."   ->  выбрасывается (эти же имена
                                             приходят из core целиком)
             export{x as Name,...}       ->  return {Name: x, ...}

Имена внутри чанков минифицированы и в обоих одинаковые (`e`, `t`, `n`),
поэтому чанки нельзя просто склеить — каждому нужна своя область
видимости. Отсюда две IIFE, а не одна.

⚠️ `window.__THREE__` занято самим three.js: core пишет туда номер ревизии,
чтобы ругаться на две копии библиотеки на странице. Пространство имён
кладётся в `window.__THREE_NS__`.
"""
import re


def _specifiers(body):
    """`x as y, z` -> [(x, y), ...] как написано, без интерпретации сторон.

    Стороны значат разное, и порядок нельзя зашивать здесь:
        export{a as B}  — B имя снаружи, a переменная внутри -> {B: a}
        import{A as b}  — A имя снаружи, b переменная внутри -> {A: b}
    То есть у export внешнее имя справа, у import — слева. Первая версия
    разбирала обе формы одинаково, и деструктуризация импорта выходила
    вывернутой: `const{e:Matrix3}` вместо `const{Matrix3:e}`. Падало не
    сразу, а на первом же `new n(...)` в теле — «n is not defined».
    """
    out = []
    for part in body.split(','):
        part = part.strip()
        if not part:
            continue
        if ' as ' in part:
            left, right = [x.strip() for x in part.split(' as ', 1)]
        else:
            left = right = part
        out.append((left, right))
    return out


def _cut(src, start_pat):
    """Вырезать инструкцию от start_pat до `;` после её закрывающей `}`."""
    m = re.search(start_pat, src)
    if not m:
        raise ValueError('не найдено: ' + start_pat)
    close = src.index('}', m.start())
    end = close + 1
    # `}from"./three.core.min.js"` — хвост с адресом тоже уходит
    tail = re.match(r'from"[^"]*"', src[end:])
    if tail:
        end += tail.end()
    if end < len(src) and src[end] == ';':
        end += 1
    return src[m.start():close], src[:m.start()] + src[end:]


def bundle(core_src, module_src):
    # ── core: единственный export -> return. `a as B` -> {B: a}
    body, core_rest = _cut(core_src, r'export\{')
    core_ns = ','.join('%s:%s' % (right, left)
                       for left, right in _specifiers(body[len('export{'):]))
    core = ('var __THREE_CORE__=(function(){"use strict";\n%s\nreturn{%s};\n})();'
            % (core_rest, core_ns))

    # ── module: import -> деструктуризация, re-export -> в мусор, export -> return
    # `A as b` -> {A: b}: у импорта внешнее имя слева, в отличие от export
    body, rest = _cut(module_src, r'import\{')
    imports = ','.join('%s:%s' % (left, right)
                       for left, right in _specifiers(body[len('import{'):]))

    # re-export core-имён: они и так придут из __THREE_CORE__ целиком
    reexport = re.search(r'export\{[^}]*\}from"', rest)
    if reexport:
        _, rest = _cut(rest, r'export\{[^}]*\}from"')

    body, rest = _cut(rest, r'export\{')
    exports = ','.join('%s:%s' % (right, left)
                       for left, right in _specifiers(body[len('export{'):]))

    mod = ('var __THREE_MOD__=(function(){"use strict";\nconst{%s}=__THREE_CORE__;\n%s\nreturn{%s};\n})();'
           % (imports, rest, exports))

    return ('(function(){%s\n%s\nwindow.__THREE_NS__=Object.assign({},__THREE_CORE__,__THREE_MOD__);})();'
            % (core, mod))


def build(vendor_dir):
    import os
    core = open(os.path.join(vendor_dir, 'three.core.min.js'), encoding='utf-8').read()
    module = open(os.path.join(vendor_dir, 'three.module.min.js'), encoding='utf-8').read()
    return bundle(core, module)
