// journey.mjs — THE MAIN PATH, as a child walks it (interview R1.1):
//
//   serve → grid of 26 letters renders → tap A → Aa + Apple/أبْل/تفاحة + image
//   → hear the pronunciation → trace the letter → answer the quiz → progress
//   saved → reload → progress still there.
//
// These are the BUILDER-VISIBLE assertions. Three rules from e2e.py's contract:
// assert what a user would notice, count every assertion, exit non-zero on failure.
//
// Usage: node harness/journey.mjs <port> [screenshotDir]

import { launchBrowser } from './browser.mjs';

const PORT = process.argv[2];
const SHOTS = process.argv[3] || '.factory/runs';
if (!PORT) { console.error('usage: node harness/journey.mjs <port>'); process.exit(2); }

let steps = 0;
let failed = false;
function check(name, ok, detail = '') {
  steps += 1;
  if (ok) console.log(`  ok    ${name}`);
  else { failed = true; console.log(`  FAIL  ${name}  ${detail}`); }
  return ok;
}

const browser = await launchBrowser({ tag: 'e2e' });

try {
  await browser.navigate(`http://127.0.0.1:${PORT}/index.html`);

  // 1. The app started FOR REAL: the grid a child sees is in the DOM.
  const tiles = await browser.evaluate(
    `document.querySelectorAll('#letter-grid .letter-tile').length`);
  check('the 26-letter grid renders in the DOM', tiles === 26, `tiles=${tiles}`);
  if (tiles !== 26) throw new Error('no grid - nothing below is worth testing');

  // 2. The chrome is Arabic and RTL.
  const chromeOk = await browser.evaluate(
    `document.documentElement.dir === 'rtl' && /[\\u0600-\\u06FF]/.test(document.title)`);
  check('interface is Arabic and right-to-left', chromeOk);

  // 3. Tap A.
  await browser.tap('[data-letter="A"]');
  const big = await browser.evaluate(
    `document.getElementById('big-letter')?.textContent ?? ''`);
  check('letter screen shows both cases', big.trim() === 'Aa', `got "${big}"`);

  // 4. The word card: English word, transliteration, translation.
  const card = await browser.evaluate(`({
    en: document.getElementById('word-en')?.textContent ?? '',
    tr: document.getElementById('word-transliteration')?.textContent ?? '',
    ar: document.getElementById('word-ar')?.textContent ?? '',
  })`);
  check('word is shown in English', card.en === 'Apple', JSON.stringify(card));
  check('transliteration is Arabic', /[؀-ۿ]/.test(card.tr), `tr=${card.tr}`);
  check('translation is Arabic', /[؀-ۿ]/.test(card.ar), `ar=${card.ar}`);

  // 5. The image actually rendered - not just an <img> tag.
  const imgOk = await browser.evaluate(
    `(() => { const i = document.getElementById('word-image');
      return !!i && i.complete && i.naturalWidth > 0; })()`);
  check('the word image rendered', imgOk);

  // 6. Hear it: tapping plays a real audio resource, no error shown.
  await browser.tap('#play-audio');
  await new Promise((r) => setTimeout(r, 800));
  const audioLoaded = await browser.evaluate(
    `performance.getEntriesByType('resource').some(r => r.name.includes('A.m4a'))`);
  const audioErr = await browser.evaluate(
    `document.getElementById('play-audio')?.textContent.includes('تعذّر') ?? true`);
  check('the pronunciation audio loaded', audioLoaded && !audioErr,
    `loaded=${audioLoaded} errorShown=${audioErr}`);

  // 7. Trace it: pointer strokes like a finger, until the app says done.
  await browser.tap('#go-trace');
  check('the tracing canvas is up', await browser.waitFor(
    `!!document.getElementById('trace-canvas')`, 4000));
  await browser.evaluate(`(() => {
    const c = document.getElementById('trace-canvas');
    const r = c.getBoundingClientRect();
    const ev = (type, x, y) => c.dispatchEvent(new PointerEvent(type,
      { bubbles: true, clientX: r.left + x, clientY: r.top + y }));
    // Two long zigzag strokes - well over the completion target.
    ev('pointerdown', 20, 20);
    for (let i = 1; i <= 20; i += 1) ev('pointermove', 20 + i * 12, i % 2 ? 260 : 20);
    ev('pointerup', 260, 20);
    ev('pointerdown', 20, 260);
    for (let i = 1; i <= 20; i += 1) ev('pointermove', 20 + i * 12, i % 2 ? 20 : 260);
    ev('pointerup', 260, 260);
  })()`);
  check('tracing registers and completes', await browser.waitFor(
    `!!document.getElementById('quiz')`, 4000), 'quiz never appeared after tracing');

  // 8. The quiz: Arabic prompt, 3 options, exactly one is A.
  const quiz = await browser.evaluate(`({
    prompt: document.getElementById('quiz-prompt')?.textContent ?? '',
    options: [...document.querySelectorAll('#quiz-options button')].map(b => b.textContent),
  })`);
  check('quiz prompt is Arabic', /[؀-ۿ]/.test(quiz.prompt), quiz.prompt);
  check('quiz offers 3 options with exactly one A',
    quiz.options.length === 3 && quiz.options.filter((o) => o === 'A').length === 1,
    JSON.stringify(quiz.options));

  // 9. A wrong answer first: feedback, and NO progress.
  const wrongIndex = quiz.options.findIndex((o) => o !== 'A');
  await browser.tap(`#quiz-options button[data-index="${wrongIndex}"]`);
  const wrongFx = await browser.evaluate(
    `document.getElementById('quiz-feedback')?.textContent ?? ''`);
  const storedAfterWrong = await browser.evaluate(
    `localStorage.getItem('abjad.progress.v1')`);
  check('wrong answer gets try-again feedback', wrongFx.includes('حاول'), wrongFx);
  check('wrong answer saves no progress', storedAfterWrong === null,
    `stored=${storedAfterWrong}`);

  // 10. The correct answer: praise, and progress is written.
  const rightIndex = quiz.options.indexOf('A');
  await browser.tap(`#quiz-options button[data-index="${rightIndex}"]`);
  const progress = await browser.evaluate(
    `JSON.parse(localStorage.getItem('abjad.progress.v1') || '{}')`);
  check('correct answer marks the letter studied',
    Array.isArray(progress.studied) && progress.studied.includes('A'),
    JSON.stringify(progress));
  await browser.screenshot(`${SHOTS}/e2e-after-quiz.png`);

  // 11. THE PROMISE: reload, and the progress is still there.
  await browser.navigate(`http://127.0.0.1:${PORT}/index.html`);
  const studiedAfterReload = await browser.evaluate(
    `document.querySelector('[data-letter="A"]')?.classList.contains('studied') ?? false`);
  check('progress survives a reload', studiedAfterReload);

  // 12. Invariant 1: nothing left the device.
  const external = await browser.evaluate(
    `performance.getEntriesByType('resource')
      .map(r => r.name).filter(n => !n.startsWith(location.origin)).length`);
  check('zero external requests', external === 0, `${external} external`);

  // 13. The app ran clean the whole way.
  check('no console errors or page exceptions', browser.consoleErrors.length === 0,
    browser.consoleErrors.slice(0, 3).join(' | '));
  check('no failed requests', browser.failedRequests().length === 0,
    browser.failedRequests().slice(0, 3).join(' | '));
} catch (e) {
  failed = true;
  console.log(`  FAIL  driver: ${e.message}`);
  steps += 1;
} finally {
  await browser.close();
}

if (failed) { console.log(`JOURNEY_FAILED steps=${steps}`); process.exit(1); }
console.log(`JOURNEY_STEPS=${steps}`);
