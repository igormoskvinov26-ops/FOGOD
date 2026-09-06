# -*- coding: utf-8 -*-
"""Сборка статического сайта ФОГОД.

    python3 build.py

Кладёт готовые файлы в public/. Заливать на хостинг можно как есть.
Страницы исполнений и семейств генерируются статически — поисковик
должен видеть ТТХ в HTML, а не собирать их скриптом.
"""
import os, re, shutil, html, datetime, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from data import SITE, OFFICES, FAMS, FAM_SLUG, FAM_INFO, DATA, PRIMENENIE

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT  = os.path.join(ROOT, 'public')
SRC  = os.path.join(ROOT, '..', 'design')
YEAR = datetime.date.today().year

e = html.escape

def rng(a, unit):
    if not a:  return '<span class="v nd">уточняется</span>'
    if a[1] is None: return f'<span class="v">от {a[0]} {unit}</span>'
    return f'<span class="v">{a[0]}–{a[1]} {unit}</span>'

def txt(x):
    return f'<span class="v">{e(x)}</span>' if x else '<span class="v nd">уточняется</span>'

# ─────────────────────────── каркас страницы ───────────────────────────

def nav(base, active):
    items = [('katalog.html','Каталог','katalog'), ('podbor.html','Подбор','podbor'),
             ('index.html#princip','Принцип работы','princip'),
             ('index.html#primenenie','Применение','primenenie'),
             ('index.html#proizvodstvo','Производство','proizvodstvo')]
    out = []
    for h, t, k in items:
        cls = ' class="is-active"' if k == active else ''
        out.append('<a href="' + base + h + '"' + cls + '>' + t + '</a>')
    return ''.join(out)

def page(*, path, title, desc, body, active='', crumbs=None):
    depth = path.count('/')
    base  = '../' * depth
    cr = ''
    if crumbs:
        parts = [f'<a href="{base}index.html">Главная</a>']
        for name, href in crumbs[:-1]:
            parts.append(f'<a href="{base}{href}">{e(name)}</a>')
        parts.append(f'<span>{e(crumbs[-1][0])}</span>')
        cr = ('<div class="crumbs"><div class="shell">' +
              '<span class="sl">/</span>'.join(parts) + '</div></div>')

    doc = f'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="https://{SITE['domain']}/{path}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap">
<link rel="stylesheet" href="{base}assets/css/main.css">
</head>
<body>
<canvas id="grid" aria-hidden="true"></canvas>

<div class="topbar"><div class="shell">
  <span class="city drop">{SITE['city']}</span>
  <a href="tel:+78633010045">{SITE['phone_full']}</a>
  <a href="mailto:{SITE['email']}">{SITE['email']}</a>
  <span class="sep"></span>
  <span class="soc"><a href="#">VK</a><a href="#">WhatsApp</a><a href="#">RuTube</a></span>
</div></div>

<header class="main"><div class="shell">
  <a class="logo" href="{base}index.html" aria-label="ФОГОД — промышленные фильтры">
    <img src="{base}assets/img/logo-white.png" alt="ФОГОД" width="199" height="44"></a>
  <nav class="primary">{nav(base, active)}</nav>
  <div class="head-right">
    <div class="head-phone">
      <div class="num">{SITE['phone']}</div>
      <div class="cap">пн–пт 9:00–18:00</div>
    </div>
    <a class="btn" href="{base}index.html#zayavka">Запросить КП</a>
  </div>
</div></header>

{cr}
{body}

<footer class="site"><div class="shell">
  <div class="foot-logo"><img src="{base}assets/img/logo-white.png" alt="ФОГОД" width="181" height="40"></div>
  <div class="foot-top">
    <div class="foot-col"><h4>Головной офис</h4>{_office(OFFICES[0])}</div>
    <div class="foot-col"><h4>Филиалы</h4>{''.join(_office(o) for o in OFFICES[1:])}</div>
    <div class="foot-col"><h4>Каталог</h4><ul>{''.join(
        f'<li><a href="{base}semeystvo/{FAM_SLUG[f]}.html">{e(f)}</a></li>' for f in FAMS)}</ul></div>
    <div class="foot-col"><h4>Компания</h4><ul>
      <li><a href="{base}podbor.html">Подбор оборудования</a></li>
      <li><a href="{base}index.html#princip">Принцип работы</a></li>
      <li><a href="{base}index.html#primenenie">Область применения</a></li>
      <li><a href="{base}index.html#proizvodstvo">Производство</a></li>
      <li><a href="{base}kontakty.html">Контакты</a></li>
    </ul></div>
  </div>
  <div class="foot-bottom">
    <span>© {YEAR} ООО «ФОГОД»</span>
    <a href="#">Политика обработки персональных данных</a>
    <span class="certs">{SITE['certs']}</span>
  </div>
</div></footer>
<script src="{base}assets/js/grid.js" defer></script>
</body>
</html>
'''
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w', encoding='utf-8').write(doc)
    return path

def _office(o):
    city, phone, mail, _ = o
    return (f'<div class="office"><div class="c">{e(city)}</div>'
            f'<div class="p">{e(phone)}</div>'
            f'<a href="mailto:{mail}">{mail}</a></div>')

# ─────────────────────────── компоненты ───────────────────────────

def row(r, base, show_fam=True):
    fam = (f'<div class="row-fam"><a href="{base}semeystvo/{FAM_SLUG[r["fam"]]}.html">'
           f'{e(r["fam"])}</a></div>') if show_fam else ''
    return f'''<div class="row">
      <div>{fam}
        <h3 class="nm"><a href="{base}filtr/{r['id']}.html">{e(r['nm'])}</a></h3>
        <p class="sub">{e(r['sub'])}</p>
        <div class="specs">
          <div><span class="k">Расход</span>{rng(r['q'],'м³/ч')}</div>
          <div><span class="k">Тонкость</span>{rng(r['mkm'],'мкм')}</div>
          <div><span class="k">Давление</span>{rng(r['bar'],'бар')}</div>
          <div><span class="k">Потери на очистку</span>{txt(r['poteri'])}</div>
          <div><span class="k">Привод</span>{txt(r['privod'])}</div>
        </div>
      </div>
      <div class="act">
        <a class="btn ghost" href="{base}filtr/{r['id']}.html">Подробнее</a>
        <a class="act-quiet" href="{base}index.html#zayavka">Запросить КП</a>
      </div>
    </div>'''

# ─────────────────────────── страницы ───────────────────────────

def card_page(r):
    base = '../'
    sib = [x for x in DATA if x['fam'] == r['fam'] and x['id'] != r['id']]
    def tr(k, v):
        cls = ' class="nd"' if 'nd' in v else ''
        val = re.sub(r'</?span[^>]*>', '', v)
        return f'<tr><th>{k}</th><td{cls}>{val}</td></tr>'
    rows = ''.join([
        tr('Производительность', rng(r['q'],'м³/ч')),
        tr('Тонкость фильтрации', rng(r['mkm'],'мкм')),
        tr('Рабочее давление', rng(r['bar'],'бар')),
        tr('Потери на очистку', txt(r['poteri'])),
        tr('Принцип фильтрации', txt(r['princip'])),
        tr('Схема включения', txt(r['shema'])),
        tr('Регенерация', txt(r['regen'])),
        tr('Привод очистки', txt(r['privod'])),
        tr('Рабочая среда', txt(', '.join(r['sredy']) if r['sredy'] else None)),
        tr('Исполнение', txt(', '.join(r['ispoln']) if r['ispoln'] else None)),
    ])
    sib_html = ''
    if sib:
        sib_html = ('<div class="siblings"><h2>Другие исполнения семейства</h2>'
                    '<div class="rows">' + ''.join(row(x, base, False) for x in sib) + '</div></div>')
    body = f'''
<div class="card-head"><div class="shell">
  <div class="card-fam"><a href="{base}semeystvo/{FAM_SLUG[r['fam']]}.html">{e(r['fam'])}</a></div>
  <h1>{e(r['nm'])}</h1>
  <p>{e(r['sub'])}</p>
</div></div>
<div class="card-body"><div class="shell">
  <div>
    <table class="ttx"><caption>Технические характеристики</caption><tbody>{rows}</tbody></table>
    <div class="card-text">
      <h2>Изготавливается под ваше ТЗ</h2>
      <p>Все гидродинамические фильтры рассчитываются и изготавливаются индивидуально: производительность, тонкость очистки, допустимый перепад давления, подвод и отвод среды, диаметры трубопроводов, рабочее давление.</p>
      <p>Типоразмер подбирается инженером по опросному листу. Приведённые характеристики — диапазон семейства, а не одной позиции.</p>
    </div>
    {sib_html}
  </div>
  <div><div class="aside-panel">
    <h3>Запросить КП</h3>
    <p>Пришлите параметры объекта — вернёмся с предложением и опросным листом.</p>
    <a class="btn" href="{base}index.html#zayavka">Отправить параметры</a>
    <a class="btn ghost" href="{base}podbor.html">Подобрать по расчёту</a>
    <div class="docs"><h4>Документы</h4>
      <a href="#">Опросный лист<span>ожидается</span></a>
      <a href="#">Паспорт изделия<span>ожидается</span></a>
      <a href="#">Габаритный чертёж<span>ожидается</span></a>
      <a href="#">Сертификаты<span>ожидается</span></a>
    </div>
  </div></div>
</div></div>'''
    return page(path=f"filtr/{r['id']}.html",
                title=f"{r['nm']} — {r['fam']} — ФОГОД",
                desc=r['sub'][:180], body=body, active='katalog',
                crumbs=[('Каталог','katalog.html'), (r['nm'], '')])

def family_page(fam):
    base = '../'
    info = FAM_INFO[fam]
    lst  = [r for r in DATA if r['fam'] == fam]
    def span(key, i, f):
        vals = [r[key][i] for r in lst if r[key]]
        return f(vals) if vals else None
    qlo, qhi = span('q',0,min), span('q',1,max)
    mlo      = span('mkm',0,min)
    blo, bhi = span('bar',0,min), span('bar',1,max)
    pot = [r['poteri'] for r in lst if r['poteri']]
    def cell(v, u, k):
        inner = (f'<div class="v nd">уточняется</div>' if v is None
                 else f'<div class="v">{v}<span class="u"> {u}</span></div>')
        return f'<div>{inner}<div class="k">{k}</div></div>'
    nums = ('<div class="fam-nums">'
        + cell(None if qlo is None else f'{qlo}–{qhi}', 'м³/ч', 'Производительность')
        + cell(None if mlo is None else f'от {mlo}', 'мкм', 'Тонкость фильтрации')
        + cell(None if blo is None else f'{blo}–{bhi}', 'бар', 'Рабочее давление')
        + ('<div><div class="v">' + e(pot[0]) + '</div>' if pot else '<div><div class="v nd">уточняется</div>')
        + '<div class="k">Потери на очистку</div></div></div>')
    adv = ''.join(f'<div><span class="t">{i+1:02d}</span><span>{e(a)}</span></div>'
                  for i, a in enumerate(info['adv']))
    body = f'''
<div class="fam-hero"><div class="shell">
  <span class="label">Семейство</span>
  <h1>{e(fam)}</h1>
  <p>{e(info['lead'])}</p>
  {nums}
</div></div>
<section class="band"><div class="shell">
  <div class="sec-head"><span class="label">Исполнения</span><h2>{len(lst)} в семействе</h2></div>
  <div class="rows">{''.join(row(r, base, False) for r in lst)}</div>
</div></section>
<section class="band alt"><div class="shell">
  <div class="sec-head"><span class="label">Преимущества</span><h2>Почему это семейство</h2></div>
  <div class="adv">{adv}</div>
</div></section>
<div class="shell"><div class="tz chevrons">
  <div><h3>Подберём типоразмер под ваш объект</h3>
  <p>Изготовление под конкретное ТЗ — обычная практика ФОГОД. Пришлите среду, расход, тонкость и давление.</p></div>
  <a class="btn" href="{base}podbor.html">Перейти к подбору</a>
</div></div>'''
    return page(path=f'semeystvo/{FAM_SLUG[fam]}.html',
                title=f'{fam} фильтры — каталог ФОГОД',
                desc=info['lead'][:180], body=body, active='katalog',
                crumbs=[('Каталог','katalog.html'), (fam,'')])

# ── тело главной и каталога переносим из макета, переписывая ссылки ──

def _mock():
    return open(os.path.join(SRC, 'sait.html'), encoding='utf-8').read()

def _slice(s, start, end):
    i = s.index(start) + len(start)
    return s[i:s.index(end, i)]

def _relink(s, base=''):
    s = s.replace('href="#/home/zayavka"', f'href="{base}index.html#zayavka"')
    s = s.replace('href="#/home/podbor"',  f'href="{base}podbor.html"')
    s = s.replace('href="#/home/princip"', f'href="{base}index.html#princip"')
    s = s.replace('href="#/home/primenenie"', f'href="{base}index.html#primenenie"')
    s = s.replace('href="#/home/proizvodstvo"', f'href="{base}index.html#proizvodstvo"')
    s = s.replace('href="#/home"',    f'href="{base}index.html"')
    s = s.replace('href="#/katalog"', f'href="{base}katalog.html"')
    s = s.replace('href="#/podbor"',  f'href="{base}podbor.html"')
    for fam, slug in FAM_SLUG.items():
        s = s.replace(f'href="#/semeystvo/{slug}"', f'href="{base}semeystvo/{slug}.html"')
    return s

def index_page():
    m = _mock()
    body = _slice(m, '<div class="view is-on" id="view-home">', '</div>\n<div class="view" id="view-katalog">')
    body = _relink(body)
    # карточки семейств ведут на посадочные, а не в каталог общим списком
    order = iter(FAMS)
    body = re.sub(r'<a class="fam-card" href="katalog\.html">',
                  lambda _m: f'<a class="fam-card" href="semeystvo/{FAM_SLUG[next(order)]}.html">', body)
    return page(path='index.html',
        title='ФОГОД — промышленные фильтры для очистки жидкостей',
        desc='Самоочищающиеся гидродинамические фильтры ТМ ФОГОД. Очистка воды, масла и СОЖ от механических примесей: 3–8000 м³/ч, до 25 мкм, 2–25 бар. Изготовление по вашему ТЗ.',
        body=body + '\n<script src="assets/js/index.js" defer></script>', active='')

def katalog_page():
    rows = ''.join(row(r, '') for r in DATA)
    tabs = ''.join(
        f'<button class="fam-tab" type="button" data-fam="{e(f)}" aria-pressed="false">{e(f)} '
        f'<span class="cnt">{len([r for r in DATA if r["fam"]==f])}</span></button>' for f in FAMS)
    body = f'''
<div class="cat-head"><div class="shell">
  <h1>Каталог промышленных фильтров</h1>
  <p>Шесть семейств и десять исполнений. Отберите по среде и параметрам объекта — или начните с семейства, если знаете, какая физика очистки вам нужна.</p>
</div></div>
<div class="fams"><div class="shell" id="fams">
  <button class="fam-tab" type="button" data-fam="" aria-pressed="true">Все семейства <span class="cnt">{len(DATA)}</span></button>{tabs}
</div></div>
<div class="work"><div class="shell">
  <aside class="rail">
    <div class="rail-top"><span class="t">Отбор</span>
      <button type="button" id="reset" disabled>сбросить всё</button></div>
    <div id="facets"></div>
  </aside>
  <div>
    <div class="toolbar">
      <div class="found">{len(DATA)} исполнений</div>
      <div class="sortwrap"><span>Сортировка</span>
        <select id="sort">
          <option value="fam">по семействам</option>
          <option value="q">по расходу</option>
          <option value="mkm">по тонкости</option>
        </select></div>
    </div>
    <div class="chips" id="chips"></div>
    <div id="out"><div class="rows">{rows}</div></div>
  </div>
</div></div>
<script src="assets/js/katalog.js" defer></script>'''
    return page(path='katalog.html', title='Каталог фильтров — ФОГОД',
        desc='Каталог промышленных фильтров ФОГОД: гидродинамические, с обратной промывкой, дисковые, насыпные, гидравлические, специальные. Отбор по среде, расходу, тонкости и давлению.',
        body=body, active='katalog', crumbs=[('Каталог','')])

def podbor_page():
    body = '''
<div class="wiz-head"><div class="shell">
  <h1>Подбор оборудования</h1>
  <p>Пять параметров объекта. Счётчик подходящих исполнений виден с первого шага — вы всегда знаете, сужается выборка или нет.</p>
</div></div>
<div class="wiz"><div class="shell">
  <div class="steps-rail" id="wiz-rail"></div>
  <div id="wiz-out"><noscript><p class="intro">Подбор работает со включённым JavaScript. Без него воспользуйтесь <a href="katalog.html">каталогом</a> или пришлите параметры объекта — рассчитаем вручную.</p></noscript></div>
</div></div>
<script src="assets/js/podbor.js" defer></script>'''
    return page(path='podbor.html', title='Подбор фильтра по параметрам — ФОГОД',
        desc='Подбор промышленного фильтра по среде, расходу, тонкости фильтрации и рабочему давлению. Если готового исполнения нет — рассчитаем под ваше ТЗ.',
        body=body, active='podbor', crumbs=[('Подбор','')])

def kontakty_page():
    cards = ''.join(f'''<div>
        <div class="t">{e(c)}</div>
        <div class="m"><a href="tel:{p.replace(' ','').replace('(','').replace(')','').replace('-','')}">{e(p)}</a><br>
        <a href="mailto:{m}">{m}</a></div></div>''' for c,p,m,_ in OFFICES)
    body = f'''
<div class="cat-head"><div class="shell">
  <h1>Контакты</h1>
  <p>Головной офис в Ростове-на-Дону и три филиала. Поставки по всей России и в ближнее зарубежье.</p>
</div></div>
<section class="band"><div class="shell">
  <div class="sec-head"><span class="label">Офисы</span><h2>Где мы есть</h2></div>
  <div class="apply">{cards}</div>
</div></section>
<section class="band alt"><div class="shell">
  <div class="sec-head"><span class="label">Реквизиты</span><h2>ООО «ФОГОД»</h2></div>
  <p class="intro">Российская Федерация, г. Ростов-на-Дону. Отечественный разработчик и производитель оборудования для водоподготовки и фильтров для очистки жидкостей от механических примесей.</p>
  <p class="intro">{SITE['certs']}</p>
</div></section>'''
    return page(path='kontakty.html', title='Контакты — ФОГОД',
        desc='Контакты ФОГОД: Ростов-на-Дону, Москва, Санкт-Петербург, Екатеринбург.',
        body=body, active='', crumbs=[('Контакты','')])

def notfound_page():
    body = '''
<div class="cat-head"><div class="shell">
  <h1>Страница не найдена</h1>
  <p>Возможно, адрес изменился. Загляните в каталог или подберите оборудование по параметрам объекта.</p>
</div></div>
<section class="band"><div class="shell">
  <div class="hero cta" style="display:flex;gap:12px;flex-wrap:wrap">
    <a class="btn lg" href="/katalog.html">Каталог</a>
    <a class="btn lg ghost" href="/podbor.html">Подбор</a>
  </div>
</div></section>'''
    return page(path='404.html', title='Страница не найдена — ФОГОД',
                desc='Страница не найдена.', body=body)

# ─────────────────────────── ассеты и служебное ───────────────────────────

def assets():
    css_dir = os.path.join(OUT, 'assets', 'css')
    js_dir  = os.path.join(OUT, 'assets', 'js')
    img_dir = os.path.join(OUT, 'assets', 'img')
    for d in (css_dir, js_dir, img_dir): os.makedirs(d, exist_ok=True)

    m = _mock()
    css = _slice(m, '<style>', '</style>')
    # data-URI шеврона -> файл: в статике картинка должна кэшироваться отдельно
    # артворк шевронов уже подставлен путём в исходнике
    # роутер не нужен: виды стали отдельными страницами
    css = css.replace('  .view { display: none; }\n  .view.is-on { display: block; }\n', '')
    css = css.replace('#view-semeystvo .row .fam', '.fam-page .row .fam')
    open(os.path.join(css_dir, 'main.css'), 'w', encoding='utf-8').write(css)

    turn_src = os.path.join(SRC, 'assets', 'turn')
    if os.path.isdir(turn_src):
        shutil.copytree(turn_src, os.path.join(img_dir, 'turn'), dirs_exist_ok=True)
    vid_dir = os.path.join(OUT, 'assets', 'video')
    os.makedirs(vid_dir, exist_ok=True)
    shutil.copy(os.path.join(SRC, 'assets', 'fogod-filter-demo.mp4'),
                os.path.join(vid_dir, 'filter-demo.mp4'))
    shutil.copy(os.path.join(SRC, 'assets', 'fogod-filter-poster.jpg'),
                os.path.join(img_dir, 'filter-poster.jpg'))
    for name in ('logo-blue.png', 'logo-white.png', 'ovgd-pp.png', 'ovgd-npp.png'):
        shutil.copy(os.path.join(SRC, 'assets', name), os.path.join(img_dir, name))
    shutil.copy(os.path.join(SRC, 'assets', 'chevrons-alpha.webp'),
                os.path.join(img_dir, 'chevrons.webp'))
    return css

def data_js():
    import json
    payload = {'DATA': DATA, 'FAMS': FAMS, 'FAM_SLUG': FAM_SLUG}
    return 'window.FOGOD = ' + json.dumps(payload, ensure_ascii=False) + ';\n'

def scripts():
    js_dir = os.path.join(OUT, 'assets', 'js')
    shared = data_js() + open(os.path.join(ROOT, 'js', 'shared.js'), encoding='utf-8').read()
    for name in ('katalog', 'podbor', 'index'):
        body = open(os.path.join(ROOT, 'js', name + '.js'), encoding='utf-8').read()
        open(os.path.join(js_dir, name + '.js'), 'w', encoding='utf-8').write(shared + body)
    # сетка идёт на каждую страницу и данных не требует
    shutil.copy(os.path.join(ROOT, 'js', 'grid.js'), os.path.join(js_dir, 'grid.js'))

def sitemap(paths):
    today = datetime.date.today().isoformat()
    urls = ''.join(
        f'  <url><loc>https://{SITE["domain"]}/{p}</loc><lastmod>{today}</lastmod></url>\n'
        for p in paths if p != '404.html')
    open(os.path.join(OUT, 'sitemap.xml'), 'w', encoding='utf-8').write(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '</urlset>\n')
    open(os.path.join(OUT, 'robots.txt'), 'w', encoding='utf-8').write(
        f'User-agent: *\nAllow: /\nSitemap: https://{SITE["domain"]}/sitemap.xml\n')

def main():
    if os.path.isdir(OUT): shutil.rmtree(OUT)
    os.makedirs(OUT)
    assets(); scripts()
    paths = [index_page(), katalog_page(), podbor_page(), kontakty_page(), notfound_page()]
    paths += [family_page(f) for f in FAMS]
    paths += [card_page(r) for r in DATA]
    sitemap(paths)
    n = sum(len(files) for _,_,files in os.walk(OUT))
    print(f'Собрано: {len(paths)} страниц, {n} файлов -> {OUT}')
    for p in paths: print('  ', p)

if __name__ == '__main__':
    main()
