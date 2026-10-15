/* ===== Registo de cadeiras =====
   Cada cadeira chama, nos seus ficheiros:
     ESTUDO.cadeira({ id, sigla, nome, temas, ... })   → configuração
     ESTUDO.licoes(id, [ ... ])                         → lições (teoria)
     ESTUDO.perguntas(id, [ ... ])                      → perguntas
   A ordem dos ficheiros não importa entre estas três chamadas. */
window.ESTUDO = (() => {
  const cadeiras = {}, ordem = [];
  const get = id => {
    if (!cadeiras[id]) { ordem.push(id); cadeiras[id] = { id, licoes: [], perguntas: [], extras: [] }; }
    return cadeiras[id];
  };
  return {
    cadeiras, ordem,
    cadeira(cfg) { const c = get(cfg.id); const { licoes, perguntas } = c; Object.assign(c, cfg, { licoes, perguntas }); if (!c.extras) c.extras = []; },
    licoes(id, arr) { get(id).licoes.push(...arr); },
    perguntas(id, arr) { get(id).perguntas.push(...arr); },
  };
})();
