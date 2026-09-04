// Content validation gate (MISSION Gate 2).
// Structural rules apply to all 26 letters; completeness rules apply to any
// entry that has started (has a word). Exit 1 on any violation.

import { existsSync } from 'node:fs';
import { LETTERS } from '../content/letters.js';

const root = new URL('..', import.meta.url).pathname;
const errors = [];
let checks = 0;

function check(ok, message) {
  checks += 1;
  if (!ok) errors.push(message);
}

// --- structural: all 26 letters, unique, both cases -------------------------
check(LETTERS.length === 26, `expected 26 letters, found ${LETTERS.length}`);
const seen = new Set();
for (const entry of LETTERS) {
  check(/^[A-Z]$/.test(entry.letter ?? ''), `bad letter field: ${JSON.stringify(entry)}`);
  check(/^[a-z]$/.test(entry.lowercase ?? ''), `bad lowercase for ${entry.letter}`);
  check(entry.lowercase === entry.letter?.toLowerCase(),
    `case mismatch for ${entry.letter}`);
  check(!seen.has(entry.letter), `duplicate letter ${entry.letter}`);
  seen.add(entry.letter);
}

// --- completeness: any entry with a word must be fully formed ---------------
const words = new Set();
for (const entry of LETTERS) {
  if (!entry.word) continue; // stub — completeness is factory issue work
  check(/^[A-Z][a-z]+$/.test(entry.word), `${entry.letter}: bad word "${entry.word}"`);
  check(entry.word.startsWith(entry.letter),
    `${entry.letter}: word "${entry.word}" does not start with the letter`);
  check(!words.has(entry.word), `duplicate word "${entry.word}"`);
  words.add(entry.word);
  check(typeof entry.arabic === 'string' && /[؀-ۿ]/.test(entry.arabic),
    `${entry.letter}: arabic translation missing or not Arabic`);
  check(typeof entry.transliteration === 'string' && /[؀-ۿ]/.test(entry.transliteration),
    `${entry.letter}: transliteration missing or not Arabic`);
  check(typeof entry.image === 'string' && existsSync(join(root, entry.image)),
    `${entry.letter}: image missing on disk: ${entry.image}`);
  check(typeof entry.audio === 'string' && existsSync(join(root, entry.audio)),
    `${entry.letter}: audio missing on disk: ${entry.audio}`);
}

function join(base, rel) {
  return new URL(rel, `file://${base}/`).pathname;
}

if (errors.length > 0) {
  console.error(`CONTENT FAILED (${errors.length}/${checks} checks failed)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`CONTENT_OK checks=${checks} complete=${words.size}/26`);
