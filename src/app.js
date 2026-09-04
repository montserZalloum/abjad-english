// DOM glue for Abjad English. All rules live in src/*.js and content/letters.js;
// this file renders them and wires events. It imports the logic, never the reverse.

import { LETTERS, getLetter, isComplete } from '../content/letters.js';
import { createProgressStore } from './progress.js';
import { makeLetterQuestion, isCorrect } from './quiz.js';
import { createStrokeTracker } from './tracing.js';

const screen = document.getElementById('screen');
const progress = createProgressStore(window.localStorage);

function el(tag, attrs = {}, text = '') {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value;
    else node.setAttribute(key, value);
  }
  if (text) node.textContent = text;
  return node;
}

function showGrid() {
  screen.replaceChildren();
  const grid = el('div', { class: 'letter-grid', id: 'letter-grid' });
  for (const entry of LETTERS) {
    const tile = el('button', {
      class: `letter-tile${progress.isStudied(entry.letter) ? ' studied' : ''}`,
      'data-letter': entry.letter,
    });
    tile.append(document.createTextNode(entry.letter));
    if (progress.isStudied(entry.letter)) {
      tile.append(el('span', { class: 'check' }, '✓'));
    }
    tile.addEventListener('click', () => showLetter(entry.letter));
    grid.append(tile);
  }
  screen.append(grid);
}

function showLetter(ch) {
  const entry = getLetter(ch);
  screen.replaceChildren();

  screen.append(el('div', { class: 'big-letter', id: 'big-letter' },
    `${entry.letter}${entry.lowercase}`));

  if (!isComplete(entry)) {
    screen.append(el('p', { id: 'coming-soon' }, 'قريباً — هذا الحرف قيد التحضير'));
  } else {
    const card = el('div', { class: 'word-card', id: 'word-card' });
    card.append(el('img', { src: entry.image, alt: entry.word, id: 'word-image' }));
    card.append(el('p', { id: 'word-en' }, entry.word));
    card.append(el('p', { id: 'word-transliteration' }, entry.transliteration));
    card.append(el('p', { id: 'word-ar' }, entry.arabic));
    screen.append(card);

    const hear = el('button', { class: 'action', id: 'play-audio' }, '🔊 اسمع النطق');
    hear.addEventListener('click', async () => {
      const audio = new Audio(entry.audio);
      audio.addEventListener('error', () => {
        hear.textContent = '⚠️ تعذّر تشغيل الصوت';
      });
      await audio.play();
    });
    screen.append(hear);

    const trace = el('button', { class: 'action', id: 'go-trace' }, '✏️ تتبّع الحرف');
    trace.addEventListener('click', () => showTrace(entry));
    screen.append(trace);
  }

  const back = el('button', { class: 'action', id: 'back-grid' }, '⬅ عودة');
  back.addEventListener('click', showGrid);
  screen.append(back);
}

const TRACE_TARGET = 600; // total stroke length in canvas px that counts as traced

function showTrace(entry) {
  screen.replaceChildren();
  screen.append(el('p', {}, `تتبّع الحرف ${entry.letter} بإصبعك أو بالماوس`));

  const canvas = el('canvas', {
    id: 'trace-canvas', width: '300', height: '300',
  });
  screen.append(canvas);
  const status = el('p', { id: 'trace-status' }, '');
  screen.append(status);

  const ctx = canvas.getContext('2d');
  // The guide letter, drawn faintly underneath.
  ctx.font = '200px system-ui';
  ctx.fillStyle = '#f5d9a8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(entry.letter, 150, 160);

  const tracker = createStrokeTracker(TRACE_TARGET);
  let currentStroke = null;
  let completed = false;

  canvas.addEventListener('pointerdown', (event) => {
    currentStroke = [point(canvas, event)];
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!currentStroke) return;
    const p = point(canvas, event);
    currentStroke.push(p);
    ctx.strokeStyle = '#e34a6f';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(currentStroke[currentStroke.length - 2].x,
      currentStroke[currentStroke.length - 2].y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });
  canvas.addEventListener('pointerup', () => {
    if (!currentStroke || completed) return;
    tracker.addStroke(currentStroke);
    currentStroke = null;
    if (tracker.isComplete()) {
      completed = true;
      status.textContent = 'أحسنت!';
      status.id = 'trace-status';
      showQuiz(entry);
    }
  });

  const back = el('button', { class: 'action', id: 'back-letter' }, '⬅ عودة');
  back.addEventListener('click', () => showLetter(entry.letter));
  screen.append(back);
}

function point(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function showQuiz(entry) {
  const question = makeLetterQuestion(entry.letter);

  const quiz = el('div', { id: 'quiz' });
  quiz.append(el('p', { id: 'quiz-prompt' }, question.prompt));
  const options = el('div', { class: 'quiz-options', id: 'quiz-options' });
  question.options.forEach((option, index) => {
    const btn = el('button', { class: 'action', 'data-index': String(index) }, option);
    btn.addEventListener('click', () => {
      const feedback = el('p', { id: 'quiz-feedback' });
      if (isCorrect(question, index)) {
        feedback.className = 'feedback correct';
        feedback.textContent = 'صحيح! أحسنت 🎉';
        progress.markStudied(entry.letter);
      } else {
        feedback.className = 'feedback wrong';
        feedback.textContent = 'حاول مرة أخرى';
      }
      quiz.append(feedback);
    });
    options.append(btn);
  });
  quiz.append(options);
  screen.append(quiz);
}

showGrid();
