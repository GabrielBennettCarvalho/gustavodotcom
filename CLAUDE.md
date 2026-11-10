# CLAUDE.md

Study app for IST (LEIC) courses: gamified multiple-choice training, bundled into one HTML file.
Full field reference and layout are in README.md. Read it only when you need a detail that is not here.

## Build and check

- `python build.py`: validates all content, then writes `dist/estudo.html`. Run it after every change.
  Read its WARN lines too: a question that leans on a previous one, or a right answer that is the longest option.
- To test in a browser: the `dist` entry in `.claude/launch.json` serves `dist/` at http://localhost:8765/estudo.html.
  Progress lives in `localStorage` key `estudo-ist-v2`. Seed it from JS to test a state, then clear it.

## Do not read (big, generated or vendored)

- `dist/estudo.html` is the build output (~900 KB). Never read it or grep it. Read `src/` instead.
- `src/courses/*/ids.json` is written by the build; never edit it.
- `src/vendor/qrcode.js` is third-party code.

## Where things are

- `src/engine/app-core.js`: state, settings, filters (`shown`, `trainPool`, `mastery`, `unlocked`), Home screen, sessions.
- `src/engine/app-views.js`: quiz, feedback, results, library, bank/import, sync screen, all event handlers.
- `src/engine/app-plan.js`: Hoje, the plan at the top of every course home (README explains how it picks tasks).
- `src/engine/app-problems.js`: Problemas-chave, typed exam problems (README has the fields). Content: `src/courses/<id>/problems.js`.
- `src/engine/progress-key.js`: the cross-device progress key. Its format is versioned: change it with care.
- `src/courses/<id>/course.js`: topics, levels, map, exam rules, extras. `render.js` draws that course's `d` diagrams.
- `src/courses/<id>/questions/<topic>.js` and `lessons/*.js`. New files must be added to `src/manifest.json`.

## Content rules (break none of these)

- Never change or reuse the `id` of a published question. To fix one, edit its text and keep the id.
- Students see Portuguese (Portugal); code, comments and file names are in English.
- Every question stands alone: it repeats its own data and never says "no mesmo problema" or similar.
- Keep option lengths balanced, so the right answer is not the longest. Four options, matching the exams.
- `calc: true` marks a question that needs calculations; the Tudo / Só teoria / Só contas switch depends on it.
- Exam questions carry `src` starting with an exam name ("Exame 1 2024/25, 6.b"): it drives Exames anteriores and priority.
  In courses with `skills` (ML), a question with no exam type (by lesson or `k`) is supplementary.
- Long exam problems are split into steps with `ch` (problem id) and `step: 'k/n'`, each step self-contained.
- APRE lessons are split into cards with `<!--card-->`, and each question says which with `card: n`. A new question on such
  a lesson needs its `card`; a new card needs at least one question (the build warns).
- Lessons are trusted HTML. Question text only supports `**bold**`, `` `code` `` and line breaks, so write
  math with Unicode (Σ, σ, ∂, ŷ, ², ₁).
- A formula with symbols a student may not know goes in the course's `formulas` with a legend, and text points at it with
  `{f:id}` or `{f:id|own wording}` (README, Formulário). Never inside an option.

## Working efficiently

- Look things up with grep before reading. Question files are long, so read only the range you need.
- Adding questions: open the last ~20 lines of the topic file to copy the style and see the highest id.
- Engine change: keep it generic, because every course uses it. Course-only behaviour goes in `course.js` extras or CSS
  scoped by `:root[data-course="<id>"]`.
