# Estudo IST

App de estudo por cadeiras. Para os colegas é **um único ficheiro**: `dist/estudo.html`.

## Site

Cada push para a `main` corre o build e publica em **https://gabrielbennettcarvalho.github.io/gustavodotcom/** (workflow em `.github/workflows/pages.yml`). Se o build falhar na validação, o site não é atualizado: vê o erro no separador Actions.

## Gerar o ficheiro

```
python3 build.py
```

O build valida o conteúdo (ids repetidos, respostas fora das opções, lições inexistentes, diagramas partidos) e só gera o HTML se estiver tudo certo. Precisa de Python 3 e Node.

## Estrutura

```
src/
  manifesto.json        cadeiras incluídas e ordem dos ficheiros
  motor/                igual para todas as cadeiras
    nucleo.js           registo: ESTUDO.cadeira / .licoes / .perguntas
    app_topo.js         estado, menu de cadeiras, home, sessões, exame
    app_resto.js        quiz, resultados, biblioteca, banco, eventos
    style.css
  cadeiras/
    ams/
      cadeira.js        nome, temas, cores, extras (detetive de diagramas)
      estilo.css        cores dos temas
      render.js         desenho de BPMN/ArchiMate (só o AMS usa)
      licoes/*.js
      perguntas/*.js
      registo.json      gerado pelo build; não editar à mão
```

## Acrescentar matéria a uma cadeira

Cria (ou edita) um ficheiro em `cadeiras/<id>/perguntas/` com:

```js
ESTUDO.perguntas('ams', [
  { id: 'bpmn-99', t: 'bpmn', l: 2, q: '…', o: ['…', '…'], a: 1, e: '…', les: 'bpmn-gw' },
]);
```

Se o ficheiro for novo, acrescenta-o à lista da cadeira em `manifesto.json`. Lições: o mesmo com `ESTUDO.licoes`.

Para uma pergunta só aparecer no exame simulado: `reservada: 'exame'`.

## Acrescentar uma cadeira

1. `src/cadeiras/<id>/cadeira.js` com `ESTUDO.cadeira({ id, sigla, nome, ano, semestre, titulo, temas: {…} })`.
2. Opcional: `render` (para o campo `d` das perguntas) e `extras` (secções só desta cadeira, ver o detetive no AMS).
3. Acrescentar a cadeira e os seus ficheiros a `manifesto.json`.

## Regras que não se partem

- **Nunca mudar o `id` de uma pergunta já publicada.** O progresso dos estudantes (e a futura chave de importação) está ligado ao id. Para corrigir uma pergunta, edita o texto e mantém o id.
- `registo.json` só cresce. O build trata disso.
