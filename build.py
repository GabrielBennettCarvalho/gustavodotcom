"""Bundles src/ into a single HTML file: dist/estudo.html.
Usage: python3 build.py   (validates the content first; needs Python 3 and Node)
New course: create src/courses/<id>/ and add it to src/manifest.json."""
import json, pathlib, subprocess, sys, tempfile

# Windows consoles default to cp1252: force UTF-8 so non-ASCII output never crashes the build.
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace'); sys.stderr.reconfigure(encoding='utf-8', errors='replace')

ROOT = pathlib.Path(__file__).parent
SRC, DIST = ROOT / 'src', ROOT / 'dist'
man = json.loads((SRC / 'manifest.json').read_text(encoding='utf-8'))
read = lambda p: (SRC / p).read_text(encoding='utf-8')

registry, *app = [read(f) for f in man['engine']]
css = [read('engine/style.css')]
course_js = []
for cid, c in man['courses'].items():
    base = f'courses/{cid}/'
    css += [read(base + f) for f in c.get('styles', [])]
    body = '\n'.join(f'/* --- {base}{f} --- */\n' + read(base + f) for f in c['files'])
    course_js.append((cid, f'/* ===== course: {cid} ===== */\n(() => {{\n{body}\n}})();'))   # each course in its own scope

# 1) validate content and update each course's ids.json (append-only)
with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as tmp:
    tmp.write(registry + '\n' + '\n'.join(js for _, js in course_js))
r = subprocess.run(['node', str(ROOT / 'tools' / 'validate.js'), tmp.name, str(SRC / 'courses')], capture_output=True, text=True, encoding='utf-8', errors='replace')
pathlib.Path(tmp.name).unlink()
print(r.stdout.strip())
if r.returncode:
    print(r.stderr.strip()); sys.exit('Build stopped: fix the errors above.')

# 2) the progress key refers to questions by their position in ids.json
ids_js = '\n'.join(f"STUDY.ids({json.dumps(cid)}, {read(f'courses/{cid}/ids.json').strip()});" for cid, _ in course_js)

vendor = '\n'.join(read(f) for f in man.get('vendor', []))
html = f'''<!doctype html>
<html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{man['title']}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=JetBrains+Mono:wght@400;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap">
<style>
{chr(10).join(css)}
</style></head><body>
<main class="wrap" id="app"><p style="padding:40px 0">A carregar…</p></main>
<script>
{vendor}
</script>
<script>
{registry}
</script>
<script>
{chr(10).join(js for _, js in course_js)}
{ids_js}
</script>
<script>
{chr(10).join(app)}
</script>
</body></html>
'''
DIST.mkdir(exist_ok=True)
out = DIST / 'estudo.html'
out.write_text(html, encoding='utf-8')
print(f'OK -> {out.relative_to(ROOT)} ({len(html) // 1024} KB)')
