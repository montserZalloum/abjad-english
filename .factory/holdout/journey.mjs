// HOLDOUT JOURNEY. The builder CANNOT read this file (.factory/holdout/ is blocked
// by --disallowedTools on every node and protected on the diff).
//
// Written BEFORE the product grew past the skeleton. The four scenarios come from the
// interview, and each one COMPOSES features - the failure mode that actually ships is
// parts that pass alone and fail together:
//
//   S1 wrong-answer-never-marks-progress    (quiz x progress, wrong path first)
//   S2 progress-survives-reload-and-detour  (quiz x progress x navigation x restart)
//   S3 the-quiz-cannot-be-tapped-by-pattern (quiz across 8 fresh visits: the correct
//      answer's POSITION and the distractor SET must both vary - a quiz that always
//      puts the answer in the same slot teaches position, not letters)
//   S4 every-complete-letter-works-through-the-UI (content x grid x detail x assets:
//      each complete letter's word starts with it ON SCREEN, its image renders, its
//      audio loads when tapped)
//
// Values asserted here (تفاحة, أبْل, the localStorage key shape) are the product's
// own public contract; the scenarios around them exist nowhere else in the repo.
//
// Usage: node journey.mjs <port>    Prints HOLDOUT_ASSERTIONS=N on success,
// HOLDOUT_FAIL lines and exit 1 on failure.

import { launchBrowser } from '../../harness/browser.mjs';

const PORT = process.argv[2];
if (!PORT) { console.error('usage: node journey.mjs <port>'); process.exit(2); }

let assertions = 0;
const failures = [];
function expect(name, ok, detail = '') {
  assertions += 1;
  if (!ok) failures.push(`${name}: ${detail}`);
}

const browser = await launchBrowser({ tag: 'holdout' });
const base = `http://127.0.0.1:${PORT}/index.html`;

// Trace letter A with real pointer strokes, landing on its quiz.
async function traceToQuiz() {
  await browser.tap('[data-letter="A"]');
  await browser.tap('#go-trace');
  await browser.waitFor(`!!document.getElementById('trace-canvas')`, 4000);
  await browser.evaluate(`(() => {
    const c = document.getElementById('trace-canvas');
    const r = c.getBoundingClientRect();
    const ev = (t, x, y) => c.dispatchEvent(new PointerEvent(t,
      { bubbles: true, clientX: r.left + x, clientY: r.top + y }));
    ev('pointerdown', 20, 20);
    for (let i = 1; i <= 20; i += 1) ev('pointermove', 20 + i * 12, i % 2 ? 260 : 20);
    ev('pointerup', 260, 20);
    ev('pointerdown', 20, 260);
    for (let i = 1; i <= 20; i += 1) ev('pointermove', 20 + i * 12, i % 2 ? 20 : 260);
    ev('pointerup', 260, 260);
  })()`);
  await browser.waitFor(`!!document.getElementById('quiz')`, 4000);
}

async function quizState() {
  return browser.evaluate(`({
    options: [...document.querySelectorAll('#quiz-options button')].map(b => b.textContent),
  })`);
}

try {
  // --- S1: a wrong answer must NEVER write progress -------------------------
  await browser.navigate(base);
  await traceToQuiz();
  const q1 = await quizState();
  const wrongIdx = q1.options.findIndex((o) => o !== 'A');
  expect('S1 quiz offers a wrong option', wrongIdx >= 0, JSON.stringify(q1));
  await browser.tap(`#quiz-options button[data-index="${wrongIdx}"]`);
  expect('S1 wrong answer leaves localStorage empty',
    (await browser.evaluate(`localStorage.getItem('abjad.progress.v1')`)) === null,
    await browser.evaluate(`localStorage.getItem('abjad.progress.v1')`));

  // --- S2: correct answer saves; a detour and a restart keep it -------------
  await browser.tap(
    `#quiz-options button[data-index="${q1.options.indexOf('A')}"]`);
  const saved = await browser.evaluate(
    `JSON.parse(localStorage.getItem('abjad.progress.v1') || '{}')`);
  expect('S2 progress written after correct answer',
    Array.isArray(saved.studied) && saved.studied.length === 1 && saved.studied[0] === 'A',
    JSON.stringify(saved));

  // The detour: leave the letter (trace screen → letter screen → grid), visit a
  // stub letter, come back via the grid.
  await browser.tap('#back-letter');
  await browser.tap('#back-grid');
  await browser.tap('[data-letter="B"]');
  const stubShown = await browser.evaluate(
    `(document.getElementById('coming-soon')?.textContent ?? '')`);
  expect('S2 a stub letter shows coming-soon, not broken content',
    stubShown.includes('قريباً'), stubShown);
  await browser.tap('#back-grid');
  const stillMarked = await browser.evaluate(
    `document.querySelector('[data-letter="A"]').classList.contains('studied')`);
  expect('S2 A still studied after the detour', stillMarked);

  await browser.navigate(base); // the restart
  expect('S2 progress survives a full reload', await browser.evaluate(
    `document.querySelector('[data-letter="A"]').classList.contains('studied')`));
  const persisted = await browser.evaluate(
    `JSON.parse(localStorage.getItem('abjad.progress.v1')).studied`);
  expect('S2 stored state is exactly [A] - nothing extra crept in',
    Array.isArray(persisted) && persisted.length === 1 && persisted[0] === 'A',
    JSON.stringify(persisted));

  // --- S3: the answer's position and the distractors must vary ---------------
  const positions = new Set();
  const distractorSets = new Set();
  for (let visit = 0; visit < 8; visit += 1) {
    await browser.navigate(base);
    // eslint-disable-next-line no-await-in-loop
    await traceToQuiz();
    // eslint-disable-next-line no-await-in-loop
    const q = await quizState();
    positions.add(q.options.indexOf('A'));
    distractorSets.add(q.options.filter((o) => o !== 'A').sort().join(','));
  }
  expect('S3 correct-answer position varies across visits',
    positions.size >= 2, `positions seen: ${[...positions].join(',')}`);
  expect('S3 distractor sets vary across visits',
    distractorSets.size >= 2, `${distractorSets.size} distinct sets in 8 visits`);

  // --- S4: every complete letter works through the UI ------------------------
  const complete = await browser.evaluate(
    `(async () => { const m = await import('/content/letters.js');
      return m.LETTERS.filter(m.isComplete).map(e => e.letter); })()`);
  expect('S4 at least one letter is complete', complete.length >= 1,
    `complete=${JSON.stringify(complete)}`);
  for (const ch of complete) {
    // eslint-disable-next-line no-await-in-loop
    await browser.navigate(base);
    // eslint-disable-next-line no-await-in-loop
    await browser.tap(`[data-letter="${ch}"]`);
    // Wait for the image to actually finish loading - complete+naturalWidth is a
    // race if evaluated the instant the screen mounts.
    // eslint-disable-next-line no-await-in-loop
    const imgReady = await browser.waitFor(
      `(() => { const i = document.getElementById('word-image');
        return !!i && i.complete && i.naturalWidth > 0; })()`, 5000);
    // eslint-disable-next-line no-await-in-loop
    const detail = await browser.evaluate(`(() => {
      const pick = (id) => document.getElementById(id)?.textContent ?? '';
      return {
        big: pick('big-letter').trim(),
        en: pick('word-en'), tr: pick('word-transliteration'), ar: pick('word-ar'),
      };
    })()`);
    expect(`S4 ${ch}: screen shows both cases`, detail.big === `${ch}${ch.toLowerCase()}`,
      detail.big);
    expect(`S4 ${ch}: word on screen starts with the letter`,
      detail.en.startsWith(ch), detail.en);
    expect(`S4 ${ch}: Arabic fields render as Arabic`,
      /[؀-ۿ]/.test(detail.tr) && /[؀-ۿ]/.test(detail.ar),
      `tr=${detail.tr} ar=${detail.ar}`);
    expect(`S4 ${ch}: image rendered`, imgReady);
    // eslint-disable-next-line no-await-in-loop
    await browser.tap('#play-audio');
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 700));
    // eslint-disable-next-line no-await-in-loop
    const heard = await browser.evaluate(
      `performance.getEntriesByType('resource').some(r => r.name.includes('/${ch}.m4a'))`);
    expect(`S4 ${ch}: audio loaded when tapped`, heard);
  }

  // The whole run stayed clean: no console errors, no failed requests.
  expect('run produced no console errors', browser.consoleErrors.length === 0,
    browser.consoleErrors.slice(0, 2).join(' | '));
  expect('run produced no failed requests', browser.failedRequests().length === 0,
    browser.failedRequests().slice(0, 2).join(' | '));
} catch (e) {
  failures.push(`driver: ${e.message}`);
} finally {
  await browser.close();
}

if (failures.length) {
  for (const f of failures) console.log(`  HOLDOUT_FAIL  ${f}`);
  console.log(`HOLDOUT_FAILED assertions=${assertions} failures=${failures.length}`);
  process.exit(1);
}
console.log(`HOLDOUT_ASSERTIONS=${assertions}`);
