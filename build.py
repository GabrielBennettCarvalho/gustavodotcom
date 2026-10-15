"""Junta src/ num único HTML: dist/estudo.html.
Uso: python3 build.py        (valida o conteúdo e gera o ficheiro)
Para uma cadeira nova: criar src/cadeiras/<id>/ e acrescentá-la ao manifesto.json."""
import json, pathlib, subprocess, sys
ROOT = pathlib.Path(__file__).parent; SRC = ROOT / 'src'; DIST = ROOT / 'dist'
man = json.loads((SRC / 'manifesto.json').read_text())
rd = lambda p: (SRC / p).read_text()

css = [rd('motor/style.css')]
cad_js = []
for cid, c in man['cadeiras'].items():
    base = f'cadeiras/{cid}/'
    css += [rd(base + f) for f in c.get('estilo', [])]
    body = '\n'.join(f'/* --- {base}{f} --- */\n' + rd(base + f) for f in c['ficheiros'])
    cad_js.append(f'/* ===== cadeira: {cid} ===== */\n(() => {{\n{body}\n}})();')   # cada cadeira no seu próprio âmbito

motor = [rd(f) for f in man['motor']]
nucleo, app = motor[0], '\n'.join(motor[1:])

# validação: carrega o conteúdo em Node e verifica ids, referências e respostas
check = SRC.parent / 'tools' / 'validar.js'
js_content = nucleo + '\n' + '\n'.join(cad_js)
(DIST).mkdir(exist_ok=True)
tmp = DIST / '.conteudo.js'; tmp.write_text(js_content)
r = subprocess.run(['node', str(check), str(tmp), str(SRC / 'cadeiras')], capture_output=True, text=True)
tmp.unlink()
print(r.stdout.strip())
if r.returncode: print(r.stderr.strip()); sys.exit('Build parado: corrige os erros acima.')

html = f'''<!doctype html>
<html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{man['titulo']}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=JetBrains+Mono:wght@400;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap">
<style>
{chr(10).join(css)}
</style></head><body>
<main class="wrap" id="app"><p style="padding:40px 0">A carregar…</p></main>
<script>
{nucleo}
</script>
<script>
{chr(10).join(cad_js)}
</script>
<script>
{app}
</script>
</body></html>
'''
out = DIST / 'estudo.html'; out.write_text(html)
print(f'OK → {out.relative_to(ROOT)} ({len(html)//1024} KB)')
