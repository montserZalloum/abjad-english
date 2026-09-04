// Quiz logic. Pure and importable; the DOM layer renders what this returns.
// rng is injectable so tests can pin the shuffle.

import { LETTERS } from '../content/letters.js';

// "Which one is the letter X?" — three letter options, exactly one correct,
// correct position decided by rng so it cannot be learned by position.
export function makeLetterQuestion(letter, rng = Math.random) {
  const distractorPool = LETTERS.map((entry) => entry.letter).filter(
    (ch) => ch !== letter,
  );
  const distractors = shuffle(distractorPool, rng).slice(0, 2);
  const options = shuffle([letter, ...distractors], rng);
  return {
    prompt: `أين حرف ${letter}؟`,
    options,
    correctIndex: options.indexOf(letter),
  };
}

export function isCorrect(question, chosenIndex) {
  return chosenIndex === question.correctIndex;
}

function shuffle(items, rng) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
