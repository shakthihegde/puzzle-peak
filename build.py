#!/usr/bin/env python3
"""Inline src/ into two single-file builds: dist/index.html (artifact page body) and dist/puzzle-peak.html (standalone)."""
import json, pathlib
root = pathlib.Path(__file__).parent
src = root / 'src'
order = json.loads((src / 'order.json').read_text())
js = '\n'.join((src / f).read_text() for f in order)
css = (src / 'style.css').read_text()
fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Lexend:wght@400;500;600&display=swap">'
body = f'''<title>Puzzle Peak</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Ad-free gifted-test practice: CogAT, CCAT, OLSAT, NNAT, ISEE and math-contest style questions with explanations.">
{fonts}
<style>
{css}
</style>
<div id="app"></div>
<noscript><p style="padding:20px">Puzzle Peak needs JavaScript turned on.</p></noscript>
<script>
{js}
</script>
'''
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist' / 'index.html').write_text(body)
standalone = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="theme-color" content="#1e8f96">
</head><body>
{body}
</body></html>
'''
(root / 'dist' / 'puzzle-peak.html').write_text(standalone)
print(f"built: {len(body)/1024:.0f} KB")

# ---- docs/: installable web app for static hosting (GitHub Pages, Cloudflare Pages, Netlify) ----
import hashlib, shutil
site = root / 'docs'
site.mkdir(exist_ok=True)
version = hashlib.sha1(body.encode()).hexdigest()[:10]
head_extra = '''<meta name="robots" content="noindex, nofollow">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" type="image/png" href="icon-192.png">
<meta name="apple-mobile-web-app-title" content="Puzzle Peak">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="mobile-web-app-capable" content="yes">'''
sw_register = '<script>if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(function () {});</script>'
site_html = standalone.replace('<meta name="theme-color" content="#1e8f96">', '<meta name="theme-color" content="#1e8f96">\n' + head_extra).replace('</body></html>', sw_register + '\n</body></html>')
(site / 'index.html').write_text(site_html)
(site / 'manifest.webmanifest').write_text(json.dumps({
    "name": "Puzzle Peak", "short_name": "Puzzle Peak", "description": "Gifted-test practice with explanations",
    "start_url": "./", "scope": "./", "display": "standalone", "orientation": "any",
    "background_color": "#eef2f8", "theme_color": "#1e8f96",
    "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]
}, indent=2))
(site / 'sw.js').write_text('''// Offline cache: serve from cache, refresh in the background so the next launch gets updates.
const V = 'pp-%s';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const key = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(caches.open(V).then(async (c) => {
    const hit = await c.match(key, { ignoreSearch: true });
    const net = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) c.put(key, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
''' % version)
for f in ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png']:
    shutil.copy(root / 'site-assets' / f, site / f)
(site / '.nojekyll').write_text('')
print(f"docs/ ready (cache version {version})")
