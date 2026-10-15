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
the mock exam.

New file? Add it to the course's list in `manifest.json`. Lessons work the same way with `STUDY.lessons`.

## Adding a course

1. `src/courses/<id>/course.js` with `STUDY.course({ id, code, name, year, semester, tagline, topics: {…} })`.
2. Optional: `render` (draws the `d` field) and `extras` (sections only this course has; see AMS).
3. Add the course and its files to `manifest.json`.

## Progress and the "other device" key

Progress lives in the browser (`localStorage`). The **Outro dispositivo** screen packs it into a key
(link + QR on the site, text in the local file) that another device merges in; nothing is ever overwritten.
Format details are at the top of `src/engine/progress-key.js`.

## Rules that must not be broken

- **Never change the `id` of a published question.** Students' progress and their keys point at it.
  To fix a question, edit its text and keep the id.
- `ids.json` only grows. The build takes care of it.
- Don't edit `dist/estudo.html` by hand: the build overwrites it.
