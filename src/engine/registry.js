/* ===== Course registry =====
   Each course calls, from its own files:
     STUDY.course({ id, code, name, topics, ... })   → configuration
     STUDY.lessons(id, [ ... ])                        → lessons (theory)
     STUDY.questions(id, [ ... ])                      → questions
     STUDY.problems(id, [ ... ])                       → key problems, solved by typing the values
   The order of these calls doesn't matter. Each course is wrapped in its own scope by the build. */
window.STUDY = (() => {
  const courses = {}, order = [];
  const get = id => {
    if (!courses[id]) { order.push(id); courses[id] = { id, lessons: [], questions: [], problems: [], extras: [] }; }
    return courses[id];
  };
  return {
    courses, order,
    course(cfg) { const c = get(cfg.id); const { lessons, questions, problems } = c; Object.assign(c, cfg, { lessons, questions, problems }); if (!c.extras) c.extras = []; },
    lessons(id, arr) { get(id).lessons.push(...arr); },
    questions(id, arr) { get(id).questions.push(...arr); },
    problems(id, arr) { get(id).problems.push(...arr); },
    // Injected by build.py from courses/<id>/ids.json: the fixed position of every question id.
    ids(id, arr) { get(id).ids = arr; },
  };
})();
