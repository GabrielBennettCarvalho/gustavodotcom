# gustavodotcom — Estudo IST

A study app for IST courses. For students it is **one file**: `dist/estudo.html`, also served at
**https://gabrielbennettcarvalho.github.io/gustavodotcom/**.

The code and file names are in English; everything students see is in Portuguese.

## Build

```
python3 build.py
```

Validates the content (duplicate ids, answers out of range, missing lessons, broken diagrams) and only writes
`dist/estudo.html` if everything passes. Needs Python 3 and Node.

Every push to `main` runs the same build on GitHub Actions and publishes the site
(`.github/workflows/pages.yml`). If validation fails, the site is not updated: check the Actions tab.

## Layout

```
src/
  manifest.json          courses included and the order of their files
  engine/                shared by every course
    registry.js          STUDY.course / .lessons / .questions / .ids
    progress-key.js      the "other device" key: encode, decode, merge
    app-core.js          state, course menu, course home, sessions, mock exam
    app-views.js         quiz, results, library, question bank, other device, events
    style.css
  courses/
    ams/
      course.js          name, topics, colours, extras (diagram detective)
      theme.css          topic colours
      render.js          BPMN/ArchiMate drawing (only AMS uses it)
      lessons/*.js
      questions/*.js
      ids.json           written by the build; never edit by hand
    oc/                  Organização de Computadores (same layout; render.js draws address fields, tables and pipeline diagrams)
    rc/                  Redes de Computadores (render.js draws space-time diagrams, topologies, addresses)
    ml/                  Aprendizagem / Machine Learning (render.js draws data tables, matrices,
                         point plots and decision trees; exam problems split into steps in questions/exam.js)
    so/                  Sistemas Operativos (route.js: the exam route; skills.js: past exams and problem types;
                         render.js: address fields and page tables / TLB)
  vendor/qrcode.js       QR code generator (MIT, Kazuhiko Arase)
tools/validate.js        content checks, used by build.py
```

## Adding content to a course

Create (or edit) a file in `src/courses/<id>/questions/`:

```js
STUDY.questions('ams', [
  { id: 'bpmn-99', t: 'bpmn', l: 2, q: '…', o: ['…', '…'], a: 1, e: '…', les: 'bpmn-gw' },
]);
```

Fields: `id` unique text · `t` topic · `l` level 1–4 · `q` question · `o` 2–6 options · `a` index of the right
option (or a list) · `e` explanation. Optional: `w` note per wrong option, `les` lesson id, `ctx` case lesson
shown above the question, `d` diagram, `src` source, `fixed` don't shuffle options, `reserved: 'exam'` only in
the mock exam, `calc: true` the question needs calculations (hidden by "Só teoria", the only ones in "Só contas", tagged "Contas"), `step: '2/3'`
step of a guided calculation, `code` a code listing shown above the options, `k` the exam problem type (when it is not the
one of its lesson; `k: ''` for none), `kind: 'method' | 'check' | 'bug'` (Que método? / Verificação / Onde está o erro?),
`card: n` the card of its lesson it is about (see below).

New file? Add it to the course's list in `manifest.json`. Lessons work the same way with `STUDY.lessons`.

### Lessons in cards (Aprender)

A lesson's `html` can be split into cards with `<!--card-->` markers, one idea per card (2 or 3 cards of about 300–600
characters; a short lesson stays whole). Each question of the lesson names its card with `card: n`. Aprender then shows
card 1, one question on it, card 2, one question on it, and so on, and ends the lesson with two questions on the earlier
cards, asked after other cards so they need recall ("Revisão rápida · cartões anteriores"). The theory shown after an answer is only that question's card.
A lesson with no markers works as before: the whole text, then its two easiest questions. The build checks that every
`card` exists and warns about a card with no question of its own. All APRE lessons are in cards; the other courses aren't yet.

## Adding a course

1. `src/courses/<id>/course.js` with `STUDY.course({ id, code, name, year, semester, tagline, topics: {…} })`.
2. Optional: `render` (draws the `d` field) and `extras` (sections only this course has; see AMS).
   Also optional (see OC): `levels` (with `tag`/`sub` shown on the level map), `map` (level map title, `link: 'bus'`,
   `start`/`end` icons, legend), `exam: { n, min, penalty: 'options' }` (mock exam size, minutes and real grading where a
   wrong answer costs 1/number of options; `book: true` for an open-book exam, see Cábula), `verdict: { ok, ko }` (tags such as HIT/MISS), `logo` (SVG for the top bar).
   Course-only CSS can be scoped with `:root[data-course="<id>"]`.
   Also optional (see SO): `route`, the **exam route** mode. It follows the parts of the exam in order:
   `route: { title, desc, heading, intro, stops: [{ id, part, title, pts, sum, brief, drillIntro, lessons: [ids], topics: [t], drill }] }`.
   Each stop opens with `brief` (HTML: what this part of the exam asks), then each lesson followed by two of its questions
   (an easy one and one a level up), then `drill` questions (level 3–4 of `topics`, default 5) as in the exam.
   It can live in its own file that calls `STUDY.course({ id, route: {...} })` after course.js.
   For the exam (see ML): `parts` (`[{ id, label, topics, note, past }]`, one per test; a part with no topics shows as "em breve"; `past` lists that test's past exams),
   `past` (the past exams the questions come from, newest first, as written at the start of `src`) and `skills`
   (`[{ id, t, label, les: [lessons], seen: [past exams], sheet: 'HTML for the cheat sheet' }]`; `core: true` makes a
   type priority even when it never came up on its own, for base matter such as OC's bits or virtual memory).
3. Add the course and its files to `manifest.json`.

## For the exam: readiness, priority, past exams, cheat sheet

- **Prontidão**: a checklist of the course's `skills` (exam problem types). A type is *pronto* when every one of its
  questions was answered right and none is waiting in review. The course home shows the summary and the type to train next
  (the first one not ready yet, in course order).
- **Priority / supplementary**: in a course with `skills`, levels, mastery and the mock exam use only priority questions:
  those whose type has `seen` exams, or whose `src` names an exam. The rest go to "Suplementares". Aprender and Revisão use all.
- **Exames anteriores**: questions grouped by the exam in their `src` ("Exame 1 2024/25, 6.b" → "Exame 1 2024/25"),
  in the exam's order. Works in every course; a `src` naming two exams is left out.
- **Cábula**: the `sheet` of each type you got wrong at least once (or pinned), with your notes. It can be printed.
  In an open-book course (`exam.book`, APRE today) it is also used while solving, as the real sheet would be:
  - practice questions (not Aprender) and each step of a key problem have a "Cábula" fold with that type's entry
    (the step's own lesson decides the type); opening it is free and never counts as a hint;
  - the mock exam has a "Cábula" button: the student's own sheet (or every type while they have none), with the timer running;
  - after a wrong answer the note box asks "o que te faltou?", and the note lands in that type's entry;
  - in the last 3 days before the test the plan adds "Rever e imprimir a tua cábula".

## Today's plan (Hoje)

The top of every course's home (`src/engine/app-plan.js`). It answers "what do I do now?": mistakes in review first, then each
exam problem type not ready yet, in the order the course teaches them (topic order, then the order of `skills`; its theory if unseen, up to 3 lessons or about 12 minutes at a time, then
its key problem or its questions). A topic's lessons that belong to no type (APRE's Dados) come after that topic's types. A key problem left half done comes right after the mistakes. Courses without `skills` go
topic by topic and level by level. With everything ready, it offers the mock exam.

- **Pace:** with the test date and the minutes per day (15, 30, 45 or 60), the work left is spread over the days left.
  When it doesn't fit, the lessons outside every type are cut first, then the types that came up least, and the card says which.
- **Times:** shown as ranges. They start wide and narrow to the student's own pace, measured from their sessions (`S.pace`).
- **Today:** time studied and tasks done today are in `S.today`; lessons seen are in `S.seenL`. Both travel in the progress key.
- **Explorar:** everything else on the home (levels, topics, modes, past exams, settings) is folded under it.

## Formulas with a legend (Formulário)

A course lists its formulas in `course.js`: `formulas: { id: { t, name, f, legend: [[symbol, meaning], …], note } }`.
Any text (questions, explanations, lessons, cheat sheets, key problems) writes `{f:id}` to show the formula, or
`{f:id|text}` to show its own wording (a variant, or the formula with that problem's indices) with the same legend.
The formula is underlined; a tap opens a card with what each symbol means: beside the content on a wide screen, under
the formula otherwise, at the bottom on a phone. "Para o exame" → Formulário lists them all, by topic.
The build fails on an unknown id, and on tags in options, step names or `also` (shown as plain text).
Write the legend in the notation of the lectures, and say in `note` when the slides write it differently.

## Key problems (Problemas-chave)

The big exam problems, solved by typing the key values (`src/engine/app-problems.js`; content in `STUDY.problems`, see
`src/courses/ml/problems.js`). A type has stages: `guided`, `half`, `alone` (`alone: true`: no hints). Each stage is a whole problem:
`{ id, kind, src, pts, stmt, d, sol, les, steps }`, and each step `{ name, ask, ans, show, c, hints, miss, also, e, les }`.
`sol` is the stage's final result, `{ t, d }` (text and a diagram such as the finished tree), shown on the end screen.
The end screen also folds out the whole worked solution, every step with its line.
`ans` is a list (vector) or a list of lists (matrix); `show` has the same shape and marks cells already given.

- A step never blocks: hints, then the answer. `miss` names a known mistake (`{ v: wrong value, m: what went wrong }`).
- A concept (`c`) done cleanly comes filled in next time, except in `alone` stages and reviews.
- A clean first problem finishes the type. Otherwise the next stage is due the next day ("Fazer já" skips the wait).
- A type can have several `alone` stages (extra full-length practice). A failed `alone` stage goes back to the last stage
  with help, and the next `alone` one is the one seen longest ago, so a retry gets new data.
- A finished type comes back once, with no hints, a week later.
- A problem left half done (back button, closed tab, refresh) is kept in `S.pbCur` for 3 days and picks up at the same step.
- Progress is in `S.prob` and travels in the progress key. Never change a published problem or stage id.

## Skip, Tudo / Só teoria / Só contas, and theme

- **Saltar** (key S): in training a skipped question is not a mistake; it goes to Revisão → Saltadas until answered.
  In the mock exam it is a blank answer (0 points).
- **Tudo / Só teoria / Só contas** (shown only in courses with `calc: true` questions) filters every mode: levels,
  Aprender, Revisão, mock exam and extras. "Só teoria" hides `calc: true` questions and "Só contas" shows only those.
  In "Só contas", Aprender skips lessons that have no calculation questions. Level progress counts only what is shown,
  but a level never locks again when you switch: a level passed with theory only (or with everything) stays open,
  and a level with nothing shown in the current mode doesn't block the next one. The old `noCalc: true` setting
  becomes "Só teoria".
- The top bar cycles the colour theme (auto / claro / escuro), saved per device. Total XP is the sum of all courses.

## Progress and the "other device" key

Progress lives in the browser (`localStorage`). The **Outro dispositivo** screen packs it into a key
(link + QR on the site, text in the local file) that another device merges in; nothing is ever overwritten.
Besides the answers, notes, XP and test date, it carries the lessons seen, the key problems, the pace and today's plan,
in a block at the end that older copies of the app skip. Format details are at the top of `src/engine/progress-key.js`.

## Rules that must not be broken

- **Never change the `id` of a published question.** Students' progress and their keys point at it.
  To fix a question, edit its text and keep the id.
- `ids.json` only grows. The build takes care of it.
- Don't edit `dist/estudo.html` by hand: the build overwrites it.
