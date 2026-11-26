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
    calc.js              calculator maths: parser, exact fractions, natural-display HTML (window.CALC)
    app-core.js          state, course menu, course home, sessions, mock exam
    app-problems.js      Problemas-chave: typed exam problems, stage by stage
    app-plan.js          Hoje: the plan at the top of every course home
    app-calc.js          the calculator panel and its corner button
    app-views.js         quiz, results, library, question bank, other device, events
    graph.js             graph lab core (window.GRAPH): graphs, seeded random generator, algorithm registry
    graph-algos.js       graph lab algorithms, as animated steps: Dijkstra, distance vector (Bellman-Ford)
    graph-sound.js       small synthesized sound effects (window.SFX), mutable
    app-graph.js         graph lab player (GPLAYER) and the lab screen (view 'glab')
    app-build.js         diagram workshop (Oficina de diagramas): building a diagram from a statement (views 'builds', 'build')
    style.css
  courses/
    ams/
      course.js          name, topics, colours, parts (1.º and 2.º teste), skills, glossary, extras (diagram detective)
      theme.css          topic colours and UML fills
      render.js          BPMN/ArchiMate drawing (only AMS uses it)
      render-uml.js      UML drawing: use case, class, state machine and sequence diagrams (UML.render; d.only/d.hi for builds)
      cases.js           the 2nd test's past cases (MAP 2 TK, Exame 1 GoKnow), shared by lessons, questions and builds
      lessons/*.js       base.js and exam.js: 1st test; uml.js and exam2.js: 2nd test
      questions/*.js     sys…exam: 1st test; uml, uc, cls, stm, seq, exam2, uml-notation: 2nd test
      builds.js          the diagram workshop exercises (Oficina de diagramas)
      ids.json           written by the build; never edit by hand
    oc/                  Organização de Computadores (same layout; render.js draws address fields, tables and pipeline diagrams)
    rc/                  Redes de Computadores (render.js draws space-time diagrams, topologies, addresses)
    ml/                  Aprendizagem / Machine Learning (render.js draws data tables, matrices,
                         point plots and decision trees). Past exams: questions/exam.js (one section per exam, long
                         problems split into steps) and questions/exam2-2122.js (all of Exame 2 2021/22);
                         questions/prep.js holds the Que método? / Verificação questions and the calculation traps;
                         problems.js and problems-more.js are the key problems (Problemas-chave)
    so/                  Sistemas Operativos (route.js: the exam route; skills.js: past exams and problem types;
                         render.js: address fields and page tables / TLB)
    ieco/                Introdução à Economia, a HACS (render.js draws supply and demand plots with shaded surplus areas)
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
one of its lesson; `k: ''` for none), `kind: 'method' | 'check'` (Que método? / Verificação),
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
   `group: { id, title, eyebrow, desc }` puts the course in its own section below the main ones (IEco uses it for HACS,
   outside the main LEIC plan); `when` replaces the "3.º ano · 1.º sem." line on its card.
   For the exam (see ML): `parts` (`[{ id, label, topics, note, past, exam }]`, one per test; a part with no topics shows as "em breve"; `past` lists that test's past exams;
   `exam` overrides the course's mock exam rules while that part is chosen, see AMS; each part has its own test date, `settings.partDates`, and the readiness says "Prontidão para o 2.º teste"),
   `past` (the past exams the questions come from, newest first, as written at the start of `src`) and `skills`
   (`[{ id, t, label, les: [lessons], seen: [past exams], sheet: 'HTML for the cheat sheet' }]`; `core: true` makes a
   type priority even when it never came up on its own, for base matter such as OC's bits or virtual memory).
3. Add the course and its files to `manifest.json`.

## For the exam: readiness, priority, past exams, cheat sheet

- **Prontidão**: a checklist of the course's `skills` (exam problem types). A type is *pronto* when none of its
  questions is waiting in review, every past-exam one (`src` naming an exam) was answered right, and at least 60% of
  all of them were (at least 6; all when it has fewer): `READY_PCT`, `READY_MIN`. The checklist counts against that
  number, not the whole bank, and a round puts the questions still needed first, then fills up with others. The course home shows the summary and the type to train next
  (the first one not ready yet, in course order). A type with 8 or fewer questions left (`SKILL_FOCUS`) trains only those,
  mistakes first, from the checklist and from the plan; in AMS, a plan level task with fewer than 10 left does the same.
  In any session but the mock exam, a question waiting in review carries an "A rever" badge.
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
exam problem type not ready yet, in the order the course teaches them (topic order, then the order of `skills`). A topic's lessons that belong to no type (APRE's Dados) come after that topic's types. Courses without `skills` go
topic by topic and level by level. With everything ready, it offers the mock exam. Few lines, one per real piece of work:

- **Aprender e treinar:** when a type's unseen theory fits in one sitting (up to 3 lessons, about 12 minutes), its lessons and
  its questions are one task and one session. Longer theory goes first in batches, and the training waits until it is all seen.
  A key problem stays a task of its own.
- **Acabar o que está quase:** the types 1 to 3 questions from ready share one task (up to 12 questions), right after the mistakes.
- **Left half way:** a round started from the plan and left half way shows as "Continuar: …" right after the mistakes and resumes
  where it stopped (the "Ronda a meio" strip above the plan stays too). A key problem left half done also comes right after the mistakes.
- **New types, a few at a time:** the list holds at most 3 new types (more when the days left need it: new types left ÷ days
  left). With those done and minutes left, the next 3 come; the day ends only when its minutes do, and "Fazer mais um
  pouco" then opens more.

- **Pace:** with the test date and the minutes per day (15, 30, 45 or 60), the work left is spread over the days left.
  When it doesn't fit, nothing is dropped: the lessons outside every type, then the types that came up least, move to the
  end of the plan (done if there is time left), and the card says which and the minutes a day that would fit everything.
  Base types (in no past exam) never move, since the types after them build on them.
- **Work left:** counted in seconds from the student's own pace (`S.pace`), timed on every answer and lesson card (not
  in the mock exam or the daily review): a theory question (40 s until measured), a calculation, code or step question
  (until measured, the real exam's pace: `exam.min` ÷ `exam.n`), and reading (words ÷ 2 per second, scaled to the
  student). On top of the questions left: the mistakes they will bring (each answered right 2 more times, at the
  student's own error rate, 30% until 20 answers) and one mock exam with its review.
- **Times:** shown as ranges, the total and the minutes per day too. They start wide and narrow once 10 answers are timed.
- **Today:** time studied and tasks done today are in `S.today`; lessons seen are in `S.seenL`. Both travel in the progress key.
- **Explorar:** everything else on the home (levels, topics, modes, past exams, settings) is folded under it.
- **Daily review** (`app-plan.js`, end of file): two optional strips on the plan card, never in the plan list, never in
  the pace, never shown as a debt ("Hoje não" hides one for the day). **Aquecimento**: at most 3 questions answered
  right on earlier days and due again by their box (1, 3, 7, 14, 30 days), least known first, no `calc`, `ch` or `code`
  questions. **Fechar o dia** (once something was done today): at most 5 things from today, the key line of today's
  lessons first, then today's questions, wrong ones first. Each can be read (question, "Ver solução", then Sabia /
  Não sabia: reading never raises a box; "Não sabia" brings it back tomorrow) or done (a normal session; in Resumo de
  hoje a right answer doesn't raise the box, since the same day proves no spacing). No time is shown, only counts.

## Formulas with a legend (Formulário)

A course lists its formulas in `course.js`: `formulas: { id: { t, name, f, legend: [[symbol, meaning], …], note } }`.
Any text (questions, explanations, lessons, cheat sheets, key problems) writes `{f:id}` to show the formula, or
`{f:id|text}` to show its own wording (a variant, or the formula with that problem's indices) with the same legend.
The formula is underlined; a tap opens a card with what each symbol means: beside the content on a wide screen, under
the formula otherwise, at the bottom on a phone. "Para o exame" → Formulário lists them all, by topic.
The build fails on an unknown id, and on tags in options, step names or `also` (shown as plain text).
Write the legend in the notation of the lectures, and say in `note` when the slides write it differently.

**Abbreviations** (glossary): `glossary: { RMSE: 'what it stands for and means', … }` in `course.js`. Nothing to write in the
text: wherever an abbreviation appears (questions, explanations, lessons, cheat sheets), its first occurrence in each text
is underlined like a formula and a tap opens a card with the meaning. Answer options are left plain (they are buttons),
and so is text inside a formula, a link or `code`. Matching is case-sensitive and on whole words.

## Key problems (Problemas-chave)

The big exam problems, solved by typing the key values (`src/engine/app-problems.js`; content in `STUDY.problems`, see
`src/courses/ml/problems.js`). A type has stages: `guided`, `half`, `alone` (`alone: true`: no hints). Each stage is a whole problem:
`{ id, kind, src, pts, stmt, d, sol, les, steps }`, and each step `{ name, ask, ans, show, c, qs, hints, miss, also, e, les }`.
`sol` is the stage's final result, `{ t, d }` (text and a diagram such as the finished tree), shown on the end screen.
The end screen also folds out the whole worked solution, every step with its line.
`ans` is a list (vector) or a list of lists (matrix); `show` has the same shape and marks cells already given.

- A step never blocks: hints, then the answer. `miss` names a known mistake (`{ v: wrong value, m: what went wrong }`).
- A concept (`c`) done cleanly comes filled in next time, except in `alone` stages and reviews.
- `qs` lists the multiple-choice questions that ask for the same value (the same exam's questions). When the student
  already got them right, the step comes filled in ("já fizeste"), except in `alone` stages and reviews. If that would
  fill every step, the last one stays to do.
- A clean first problem finishes the type. Otherwise the next stage is due the next day ("Fazer já" skips the wait).
- An `alone` stage (and a review) is not walked step by step: it is one answer sheet, the statement and a box for each
  step's result (labelled by its `name`; the `ask` and the hints are not shown). The student solves on paper, checks
  everything at once, fixes what is wrong, or gives up with "Não sei: ver a resolução".
- A type can have several `alone` stages (extra full-length practice). A failed `alone` stage goes back to the last stage
  with help, and the next `alone` one is the one seen longest ago, so a retry gets new data.
- A finished type comes back once, with no hints, a week later.
- A problem left half done (back button, closed tab, refresh) is kept in `S.pbCur` for 3 days and picks up at the same step.
- Progress is in `S.prob` and travels in the progress key. Never change a published problem or stage id.

## Diagram workshop (Oficina de diagramas)

For exams that ask to *draw* a diagram from a statement (AMS 2nd test: use cases, class, state machine, sequence). Engine
`src/engine/app-build.js`, content `STUDY.builds(id, [...])` (AMS: `src/courses/ams/builds.js`). The method, "do texto ao
diagrama", is three turns spaced in days:

1. **Construir** (stage 0): the statement is read decision by decision. Each part is one decision and the diagram grows
   with each one resolved; tapping a piece of the diagram lights the sentences it comes from. Wrong choices get their
   own reason (`why`); after a wrong try "Ver a resposta" is offered. Ends with "Fazer já no papel" or tomorrow.
2. **No papel** (stage 1, due the next day): the statement alone and a timer (`min`); the student draws on paper, then
   marks a rubric (one line per part, `rub`, weighted by `pts`) against the full solution: Tenho / Em parte / Falta.
   75% (`BD_PASS`) or more finishes it and brings it back once on paper a week later; less goes back to Construir.
3. "Ver resolvido" (watch) plays the decisions with their answers, as a worked example, from the list, from the lessons
   in `les` and when stuck on paper. No progress.

A build: `{ id, t, skill, title, short, src, pts, min, ask, uod, d, given, parts, les, extra }`. `uod` is a list of
sentences `{ id, n, t }` (or headings `{ h }`), where `[[text|spanId]]` marks a span. `d` is the whole solution, drawn by
the course's render with `d.only` (pieces shown so far) and `d.hi` (just added); every piece has an id and the render marks
it `data-el` (sub-pieces: `Class:a` attributes, `edge:m` multiplicities). `given` is drawn from the start (a test that says
"completa"). A part: `{ id, kind, phase, ask, e, el, from, rub, pts, why }` with `kind`:
`spans` (tap the answers in the statement: `ans`, `opt` count either way), `pick` (several: `o`, `a`, `opt`), `one`
(`o`, `a`, or a list of accepted), `rows` (one choice per row: `rows: [{ lb, o, a, why }]`, e.g. both multiplicities).
The build checks that every `el` is a piece of `d`, every span and sentence exists, and warns about pieces no part adds.

- **Plan**: a type's build is a task of its own ("Construir: …", "No papel: …", "Rever no papel: …") after its theory and
  training; one at a time per type; a turn left half way comes first ("Acabar: …", kept in `S.bdCur` for 3 days).
  "Sem papel" also shows in a course with builds and holds the paper turns. The pace counts every turn still ahead.
- **Readiness**: a type is ready only when its builds (all but `extra: true`) are done on paper; each weighs 5 questions
  (`BD_W`). The checklist shows ✎ done/total.
- **Progress**: `S.bld = { id: { stage, done, due, last, best } }`, in the progress key extras (`bd`).

## Graph labs (animated algorithms)

A lab is a screen of its own (card in "Só de <curso>") that animates a graph algorithm step by step: the graph,
the code with the current line lit, an explanation per step and the tables as they fill. "Ver a resolução" plays it;
"Tu fazes" stops before each step that has a question (tap a node, or type numbers) and keeps a score. Sound effects
are synthesized (no files) and can be muted.

- Algorithms live in `src/engine/graph-algos.js`, generic: `GRAPH.algo({ id, name, code, run(g, p) => steps })`. A step
  is a full snapshot (format at the top of `graph.js`): node and edge classes, badges, arrows, packets, tables, sound,
  and an optional `ask` for practice. New algorithm (BFS, Prim, …) = one more `GRAPH.algo`, no player changes.
- A course registers labs in its own file with `STUDY.labs(id, [{ id, title, desc, meta, icon, kinds, examples }])`.
  A kind generates a fresh problem: `make(GRAPH, rnd, opts) => { title, algo, g, p, stmt }` (rnd is seeded;
  `GRAPH.generate` draws a planar-looking graph; `GRAPH.until` retries until a test passes, e.g. unique shortest paths).
  An example is a fixed problem (`{ id, label, algo, g, p, stmt }`, e.g. the slides' network). `opts` adds toggles
  (RC: poisoned reverse) that are merged into `p`.
- A graph is `{ n: { id: [x, y] }, e: [[a, b, cost, labelPos?]] }` in a 400 × 200 box: the same shape as RC's `d.topo`.
- A question with `anim: { title, algo, g, p, stmt }` gets "▶ Ver a resolução animada" in its feedback (an overlay player).
- A lab's `les: { lessonId: { ex, kind } }` links it to the lessons: the lesson ends with "▶ Ver o exemplo animado"
  (example `ex`), and every question on that lesson offers "Praticar com uma rede nova" (a generated `kind` problem in
  "Tu fazes", with "Outro problema" at the end). Both open over the page, so a session is never left.
- Labs keep no progress: generated problems have no ids. RC's lab is `src/courses/rc/lab.js`.
- A lab that is not a graph brings its own player: `mount(el, problem) => { mode, destroy }`, plus `exBtn` and
  `practiceBtn` for the labels of its lesson and question links. The lab screen, the links and the overlay use it in
  place of the graph player; `kinds`, `examples` and `les` work the same.

### OC: reordering in the pipeline (`src/courses/oc/lab.js`)

The student drags lines of code (or uses ↑ ↓) and presses Verificar. A model of the 5-stage pipeline (`OCPIPE`) judges
any order, with nothing written per problem: which dependence it breaks (register read/written either way, both
writing, two memory accesses with a store that may hit the same word, the closing branch), the cycles and the reason
for each bubble, and the best order (all valid orders are tried). With `consts`, an `addi r, r, k` may cross a lw/sw
based on r and the offset adjusts itself. Forwarding is `'full'`, `'none'` or a list of paths (ALU-ALU, MEM-ALU,
ALU-MEM, MEM-MEM, into D); branches resolve in D or X. 3 tries, then "Ver uma solução"; "Pista" shows where the bubbles
are, then one move that helps. Kinds generate straight-line code or a loop body; the examples are the lesson's and
three past exams' (their cycle counts match the official answers). The lesson `h-sched` and its questions link to it.

## Skip, Tudo / Só teoria / Só contas, and theme

- **Saltar** (key S): in training a skipped question is not a mistake; it goes to Revisão → Saltadas until answered.
  In the mock exam it is a blank answer (0 points).
- **Tudo / Só teoria / Só contas** (shown only in courses with `calc: true` questions) filters every mode: levels,
  Aprender, Revisão, mock exam and extras. "Só teoria" hides `calc: true` questions and "Só contas" shows only those.
  In "Só contas", Aprender skips lessons that have no calculation questions. Level progress counts only what is shown,
  but a level never locks again when you switch: a level passed with theory only (or with everything) stays open,
  and a level with nothing shown in the current mode doesn't block the next one. The old `noCalc: true` setting
  becomes "Só teoria".
- **Sem papel** (a button on the Hoje card, in courses with `calc: true` questions): for the bus or a treadmill. It
  is "Só teoria" saved per device for every course (`estudo-ist-nopaper`), not in the progress key; picking
  Tudo / Só teoria / Só contas turns it off. With either one on, the plan changes too: a type trains only its
  questions without calculations (the steps without them come as single questions), key problems and the mock exam
  wait for paper, and tasks done this way are logged apart (`…:np`), so their calculations still show up the same day
  with paper. The pace still counts the calculations, so days without them never shrink the work left. The button
  shows either one; turning it off turns both off.
- The top bar cycles the colour theme (auto / claro / escuro), saved per device. Total XP is the sum of all courses.

## Calculator

A round button in the corner of every course screen opens a calculator panel (a bottom sheet on a phone).
Definições → Calculadora turns the button on or off per course (`settings.calc`; by default on where the course has
`calc: true` questions, so off in AMS). The setting does not travel in the progress key.

- Typing goes to a hidden input; above it `calc.js` draws the expression as on paper while it is typed: `/` stacks a
  fraction, `^` raises an exponent, `_` lowers an index (`w_1`, `log_2`), `sqrt` draws a radical. A missing operand is
  an empty box and an unclosed bracket a faint one; Enter closes brackets by itself.
- `/` and `^` open a box, as on a graphing calculator: they type `/(` or `^(`, a bracket the layout hides, so `1/2+3`
  typed in a row is 1/(2+3) and stays in the denominator until → or `)` (a `(` typed right after is absorbed; backspace
  removes `/(` in one go). The caret right after that bracket sits past the whole fraction, exponent or root, and a tap
  past the end of the expression leaves every box. An exponent or `!` typed right after a fraction is for the whole fraction, so it gets brackets
  first: `2/3`, →, `^2` is (2/3)² (`CALC.fracBefore`). The x² key types `^2 `: no box, and the space puts what follows back on the line.
- The text has no boxes, so → at the end of it leaves the one being typed in (`CALC.exitText`): after a function's
  name or base it types `(` (`log_2` → log₂(□)), after an index or a one-piece exponent or denominator a space
  (`2^3 4` is 2³·4), inside an open bracket `)`.
- Numbers stay exact fractions while they can (BigInt): `0.1 + 0.2 = 3/10`, `sqrt(9/4) = 3/2`, `log_2(8) = 3`.
  Roots, logs and trig fall back to floats, which snap back to a fraction when within a few ulps (`sin(pi/6) = 1/2`).
- Products without a sign bind like `×`, left to right: `3/4 log_2(3/4)` is ¾·log₂(¾), as in an entropy sum.
- `x = 2` stores a variable, `ans` is the last result (an operator on an empty line starts from it), ↑ ↓ recall
  earlier expressions, tapping a result inserts it. Functions: sqrt cbrt ln log log_b exp sin cos tan asin acos atan
  sinh cosh tanh abs floor ceil round min max mean sigmoid nCr nPr, and `!`. Greek names (`eta`, `sigma`…) show as
  letters. Angles in radians.
- On a touch screen a keypad replaces the system keyboard, with `x` and `x=` keys for variables (`abc`, at the top,
  brings the system keyboard back for other names). The x₁ key adds an index to the letter before it, or types x₁.
- The panel's class is `calc-panel`, not `calc`: `.badge.calc` already marks calculation questions.
- Results can be copied: the button beside the live result and each history entry copies it as plain text (`3/4`,
  `-2`, `1.5e-7`; a huge integer whole), and a selection copies as `3/4 = 0.75`, one line per history entry
  (`show(v).p`, the `data-copy` of each piece). A drag over a history result selects it; a tap still inserts it.
- History, variables and ans are saved per device in `localStorage` key `estudo-ist-calc`.

## Progress and the "other device" key

Progress lives in the browser (`localStorage`). Every answer is saved as it is given. A round left half way (back to
the start, the formulas, a closed tab) is also kept, in `S.sesCur` for 3 days and on this device only: the course home
shows "Ronda a meio" with Continuar / Descartar (not for the mock exam, which has a clock).

The **Outro dispositivo** screen packs it into a key
(link + QR on the site, text in the local file) that another device merges in; nothing is ever overwritten.
Besides the answers, notes, XP and test date, it carries the lessons seen, the key problems, the diagram exercises, each test's date, the pace and today's plan,
in a block at the end that older copies of the app skip. Format details are at the top of `src/engine/progress-key.js`.

## Rules that must not be broken

- **Never change the `id` of a published question.** Students' progress and their keys point at it.
  To fix a question, edit its text and keep the id.
- `ids.json` only grows. The build takes care of it.
- Don't edit `dist/estudo.html` by hand: the build overwrites it.
