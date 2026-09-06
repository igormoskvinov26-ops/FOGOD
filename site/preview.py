# -*- coding: utf-8 -*-
"""Собрать public/ в один файл для показа до деплоя.

    python3 preview.py            # -> preview/wfogod-preview.html

Все 21 страница, CSS, скрипты и картинки складываются в один HTML.
Страницы показываются в iframe ровно теми же файлами, что уедут на
хостинг: та же вёрстка, те же скрипты. Ссылки внутри работают.
Это средство показа, а не сборки — на хостинг заливается public/.
"""
import os, re, json, base64, posixpath, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PUB  = os.path.join(ROOT, 'public')
OUT  = os.path.join(ROOT, 'preview')

MIME = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml', '.webp': 'image/webp'}

TITLES = {}

def pages():
    out = []
    for dirpath, _, files in os.walk(PUB):
        for f in sorted(files):
            if f.endswith('.html'):
                p = os.path.relpath(os.path.join(dirpath, f), PUB).replace(os.sep, '/')
                out.append(p)
    order = ['index.html', 'katalog.html', 'podbor.html', 'kontakty.html', '404.html']
    return sorted(out, key=lambda p: (order.index(p) if p in order else 9,
                                      p.split('/')[0], p))

def resolve(page, href):
    """Относительная ссылка -> путь от корня сайта."""
    return posixpath.normpath(posixpath.join(posixpath.dirname(page), href))

def strip_body(page, src):
    body = src.split('<body>', 1)[1].rsplit('</body>', 1)[0]
    m = re.search(r'<title>(.*?)</title>', src, re.S)
    TITLES[page] = re.sub(r'\s+', ' ', m.group(1)).strip() if m else page

    def fix_href(m):
        q, href = m.group(1), m.group(2)
        if re.match(r'^(https?:|tel:|mailto:|#|data:)', href):
            return m.group(0)
        frag = ''
        if '#' in href:
            href, frag = href.split('#', 1)
            frag = '#' + frag
        if not href:
            return m.group(0)
        return 'href=' + q + '#/' + resolve(page, href) + frag + q

    def fix_src(m):
        q, src_ = m.group(1), m.group(2)
        if re.match(r'^(https?:|data:)', src_):
            return m.group(0)
        return 'src=' + q + '__IMG:' + posixpath.basename(src_) + '__' + q

    body = re.sub(r'<script src="[^"]*"[^>]*></script>', '', body)
    body = re.sub(r'href=(["\'])(.*?)\1', fix_href, body)
    body = re.sub(r'src=(["\'])(.*?)\1', fix_src, body)
    return body

def collect():
    bodies, scripts, per_page = {}, {}, {}
    for p in pages():
        src = open(os.path.join(PUB, p), encoding='utf-8').read()
        bodies[p] = strip_body(p, src)
        # у страницы может быть несколько скриптов: свой и общий слой сетки
        per_page[p] = [n for n in re.findall(r'<script src="[^"]*?/([\w.-]+\.js)"', src)
                       if n != 'hero3d.js']
    js_dir = os.path.join(PUB, 'assets', 'js')
    for name in sorted(os.listdir(js_dir)):
        # vendor/ — папка, а hero3d.js это ES-модуль с импортами и загрузкой
        # модели по сети: внутри одного файла превью он работать не может.
        # Там остаётся тот же рендер, что и без WebGL.
        if name == 'hero3d.js' or not os.path.isfile(os.path.join(js_dir, name)):
            continue
        js = open(os.path.join(js_dir, name), encoding='utf-8').read()
        # путь к кадру оборота собирается в рантайме, токен в разметке его не
        # поймает — подменяем на выборку из встроенной карты
        js = js.replace("'assets/img/turn/' + key + '-0' + i + '.webp'",
                        "window.__TURN__[key + '-0' + i]")
        js = js.replace("im.src = 'assets/img/turn/' + key + '-0' + i + '.webp';",
                        "im.src = window.__TURN__[key + '-0' + i];")
        scripts[name] = js
    css = open(os.path.join(PUB, 'assets', 'css', 'main.css'), encoding='utf-8').read()
    imgs = {}
    img_dir = os.path.join(PUB, 'assets', 'img')
    files = []
    for dp, _, fs in os.walk(img_dir):          # кадры оборота лежат в подпапке
        files += [os.path.join(dp, f) for f in fs]
    for full in sorted(files):
        name = os.path.basename(full)
        raw = open(full, 'rb').read()
        mime = MIME.get(os.path.splitext(name)[1].lower(), 'application/octet-stream')
        imgs[name] = 'data:' + mime + ';base64,' + base64.b64encode(raw).decode()
    css = re.sub(r'url\((["\']?)([^)"\']*/)?([\w.\-]+\.(?:png|jpe?g|svg))\1\)',
                 lambda m: 'url(' + imgs.get(m.group(3), m.group(0)) + ')'
                 if m.group(3) in imgs else m.group(0), css)
    return bodies, scripts, per_page, css, imgs


SHELL = r'''<title>Превью wfogod.ru</title>
<style>
:root{ --navy:#123A63; --blue:#1268C3; }
*{box-sizing:border-box}
body{margin:0;background:#0E2540;font:400 14px/1.4 "IBM Plex Sans",system-ui,sans-serif;
     color:#fff;height:100vh;display:flex;flex-direction:column;overflow:hidden}
.bar{display:flex;align-items:center;gap:16px;padding:0 16px;height:46px;flex:0 0 auto;
     background:#0A1C30;border-bottom:1px solid #1E3A5C}
.tag{font:600 11px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.09em;
     text-transform:uppercase;color:#E0A92A;white-space:nowrap}
.note{font:400 12px/1 "IBM Plex Sans",system-ui,sans-serif;color:#8AA4C0;white-space:nowrap}
select{background:#12293F;color:#fff;border:1px solid #24486E;border-radius:0;
       padding:6px 8px;font:400 13px/1 "IBM Plex Sans",system-ui,sans-serif;
       max-width:46vw;flex:0 1 auto}
.sp{flex:1 1 auto}
.w{display:flex;border:1px solid #24486E;flex:0 0 auto}
.w button{background:transparent;color:#8AA4C0;border:0;border-radius:0;cursor:pointer;
          padding:6px 11px;font:500 12px/1 "IBM Plex Mono",ui-monospace,monospace}
.w button + button{border-left:1px solid #24486E}
.w button[aria-pressed="true"]{background:#1268C3;color:#fff}
.stage{flex:1 1 auto;overflow:auto;display:flex;justify-content:center;background:#0E2540}
.frame{flex:0 0 auto;width:100%;height:100%;background:#fff}
.stage.w375 .frame{width:375px;border-left:1px solid #1E3A5C;border-right:1px solid #1E3A5C}
.stage.w900 .frame{width:900px;border-left:1px solid #1E3A5C;border-right:1px solid #1E3A5C}
iframe{display:block;width:100%;height:100%;border:0}
#inline{display:none}
body.is-inline .stage{display:block;overflow:auto}
body.is-inline .frame{width:100%;height:auto;background:transparent}
body.is-inline iframe{display:none}
body.is-inline #inline{display:block}
@media (max-width:640px){ .note{display:none} .bar{gap:10px;padding:0 10px} }
</style>

<div class="bar">
  <span class="tag">Превью</span>
  <span class="note">не задеплоено · это файлы из public/</span>
  <select id="nav" aria-label="Страница"></select>
  <span class="sp"></span>
  <div class="w" role="group" aria-label="Ширина окна">
    <button data-w="375">375</button>
    <button data-w="900">900</button>
    <button data-w="" aria-pressed="true">Во всю</button>
  </div>
</div>
<div class="stage" id="stage"><div class="frame"><iframe id="fr" title="Страница сайта"></iframe><div id="inline"></div></div></div>

<script>
(function(){
  var D = window.__PREVIEW__, cur = '';
  var fr = document.getElementById('fr'), nav = document.getElementById('nav'),
      stage = document.getElementById('stage');

  Object.keys(D.titles).forEach(function(p){
    var o = document.createElement('option');
    o.value = p; o.textContent = D.titles[p];
    nav.appendChild(o);
  });

  function hook(page){
    var dir = page.indexOf('/') > -1 ? page.slice(0, page.lastIndexOf('/') + 1) : '';
    return 'var DIR=' + JSON.stringify(dir) + ';' +
      'function res(h){var p=(h.charAt(0)==="/"?h.slice(1):DIR+h).split("/"),o=[];' +
      'for(var i=0;i<p.length;i++){if(p[i]===".."){o.pop();}else if(p[i]&&p[i]!=="."){o.push(p[i]);}}' +
      'return o.join("/");}' +
      'document.addEventListener("click",function(e){' +
      'var a=e.target.closest&&e.target.closest("a");if(!a)return;' +
      'var h=a.getAttribute("href")||"";' +
      'if(h.slice(0,2)==="#/"){e.preventDefault();parent.postMessage({go:h.slice(2)},"*");return;}' +
      'if(h.charAt(0)==="#"){if(h.length>1){var t=document.getElementById(h.slice(1));' +
      'if(t){e.preventDefault();t.scrollIntoView({behavior:"smooth"});}}return;}' +
      'if(/^(https?:|tel:|mailto:|data:)/.test(h))return;' +
      'var f="",i=h.indexOf("#");if(i>-1){f=h.slice(i);h=h.slice(0,i);}' +
      'if(!h)return;e.preventDefault();parent.postMessage({go:res(h)+f},"*");' +
      '});';
  }

  function imgs(html){
    return html.replace(/__IMG:([\w.\-]+)__/g, function(m, n){ return D.imgs[n] || m; });
  }

  var inline = false, loaded = {};

  function showInline(page, frag){
    window.__TURN__ = D.turn;
    var host = document.getElementById('inline');
    host.innerHTML = imgs(D.bodies[page]);
    (D.perPage[page] || []).forEach(function (n) {
      if (loaded[n]) return;                 // слушатели вешаются на документ,
      loaded[n] = true;                      // повторный запуск их бы удвоил
      var sc = document.createElement('script');
      sc.textContent = D.scripts[n] || '';
      document.body.appendChild(sc);
    });
    if (frag) {
      var t = document.getElementById(frag);
      if (t) t.scrollIntoView();
    }
    document.getElementById('stage').scrollTop = frag ? document.getElementById('stage').scrollTop : 0;
  }

  function goInline(){
    if (inline) return;
    inline = true;
    document.body.classList.add('is-inline');
    var st = document.createElement('style');
    st.textContent = D.css;
    document.head.appendChild(st);
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      if (a.closest('.bar')) return;
      var h = a.getAttribute('href') || '';
      if (h.slice(0, 2) === '#/') { e.preventDefault(); location.hash = h; }
    });
    cur = '';
    route();
  }

  function show(page, frag){
    if (!D.bodies[page]) page = '404.html';
    if (inline) {
      if (page !== cur) { cur = page; nav.value = page; showInline(page, frag); }
      else if (frag) { var t = document.getElementById(frag); if (t) t.scrollIntoView({behavior:'smooth'}); }
      return;
    }
    if (page !== cur) {
      var js = (D.perPage[page] || []).map(function (n) { return D.scripts[n] || ''; }).join('\n;\n');
      fr.srcdoc = '<!doctype html><html lang="ru"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap">' +
        '<style>' + D.css + '</style></head><body>' +
        '<' + 'script>window.__TURN__=' + JSON.stringify(D.turn) + ';<' + '/script>' +
        imgs(D.bodies[page]) +
        '<' + 'script>' + js + '<' + '/script>' +
        '<' + 'script>' + hook(page) + (frag ? scrollTo_(frag) : '') + '<' + '/script>' +
        '</body></html>';
      cur = page;
      nav.value = page;
      setTimeout(function () {                // iframe мог быть запрещён песочницей
        var d = null;
        try { d = fr.contentDocument; } catch (e) {}
        if (!d || !d.body || !d.body.children.length) goInline();
      }, 700);
    } else if (frag) {
      var t = fr.contentDocument && fr.contentDocument.getElementById(frag);
      if (t) t.scrollIntoView({behavior: 'smooth'});
    }
  }

  function scrollTo_(f){
    return 'window.addEventListener("load",function(){var t=document.getElementById(' +
           JSON.stringify(f) + ');if(t)t.scrollIntoView();});';
  }

  function route(){
    var h = location.hash.replace(/^#\/?/, '') || 'index.html';
    var frag = '', i = h.indexOf('#');
    if (i > -1) { frag = h.slice(i + 1); h = h.slice(0, i); }
    show(h || 'index.html', frag);
  }

  window.addEventListener('message', function(e){
    if (e.data && e.data.go) location.hash = '#/' + e.data.go;
  });
  window.addEventListener('hashchange', route);
  nav.addEventListener('change', function(){ location.hash = '#/' + nav.value; });

  document.querySelectorAll('.w button').forEach(function(b){
    b.addEventListener('click', function(){
      document.querySelectorAll('.w button').forEach(function(x){ x.removeAttribute('aria-pressed'); });
      b.setAttribute('aria-pressed', 'true');
      stage.className = 'stage' + (b.dataset.w ? ' w' + b.dataset.w : '');
    });
  });

  route();
})();
</script>
'''


def main():
    bodies, scripts, per_page, css, imgs = collect()
    turn = {os.path.splitext(k)[0]: v for k, v in imgs.items() if k.endswith('.webp')}
    payload = json.dumps({'bodies': bodies, 'scripts': scripts, 'perPage': per_page,
                          'css': css, 'imgs': imgs, 'titles': TITLES, 'turn': turn},
                         ensure_ascii=False).replace('</', r'<\/')
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, 'wfogod-preview.html')
    # <title> должен лежать в самом начале файла: публикатор ищет его
    # только в первых килобайтах, а блок данных занимает больше мегабайта
    head, rest = SHELL.split('\n', 1)
    open(path, 'w', encoding='utf-8').write(
        head + '\n<script>window.__PREVIEW__ = ' + payload + ';</script>\n' + rest)
    kb = os.path.getsize(path) // 1024
    print('Превью: %d страниц, %d КБ -> %s' % (len(bodies), kb, path))

if __name__ == '__main__':
    main()
