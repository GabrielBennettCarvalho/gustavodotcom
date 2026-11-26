/* ===== Course registry =====
   Each course calls, from its own files:
     STUDY.course({ id, code, name, topics, ... })   → configuration
     STUDY.lessons(id, [ ... ])                        → lessons (theory)
     STUDY.questions(id, [ ... ])                      → questions
     STUDY.problems(id, [ ... ])                       → key problems, solved by typing the values
     STUDY.labs(id, [ ... ])                           → graph labs: animated algorithms with a problem generator
     STUDY.builds(id, [ ... ])                         → diagram exercises (Oficina de diagramas, app-build.js)
   The order of these calls doesn't matter. Each course is wrapped in its own scope by the build. */
window.STUDY = (() => {
  const courses = {}, order = [];
  const get = id => {
    if (!courses[id]) { order.push(id); courses[id] = { id, lessons: [], questions: [], problems: [], labs: [], builds: [], extras: [] }; }
    return courses[id];
  };
  return {
    courses, order,
    course(cfg) { const c = get(cfg.id); const { lessons, questions, problems, labs, builds } = c; Object.assign(c, cfg, { lessons, questions, problems, labs, builds }); if (!c.extras) c.extras = []; },
    labs(id, arr) { get(id).labs.push(...arr); },
    builds(id, arr) { get(id).builds.push(...arr); },
    lessons(id, arr) { get(id).lessons.push(...arr); },
    questions(id, arr) { get(id).questions.push(...arr); },
    problems(id, arr) { get(id).problems.push(...arr); },
    // Injected by build.py from courses/<id>/ids.json: the fixed position of every question id.
    ids(id, arr) { get(id).ids = arr; },
  };
})();
