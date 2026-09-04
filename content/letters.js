// Letter content for Abjad English.
//
// A letter entry is either STUB (letter + lowercase only — detail screen shows
// "coming soon") or COMPLETE (word, arabic, transliteration, image, audio).
// The walking skeleton ships A complete; completing B–Z is factory issue work.
// scripts/validateContent.mjs enforces the shape of both kinds.

export const LETTERS = [
  {
    letter: 'A',
    lowercase: 'a',
    word: 'Apple',
    arabic: 'تفاحة',
    transliteration: 'أبْل',
    image: 'assets/images/apple.svg',
    audio: 'assets/audio/A.m4a',
  },
  { letter: 'B', lowercase: 'b' },
  { letter: 'C', lowercase: 'c' },
  { letter: 'D', lowercase: 'd' },
  { letter: 'E', lowercase: 'e' },
  { letter: 'F', lowercase: 'f' },
  { letter: 'G', lowercase: 'g' },
  { letter: 'H', lowercase: 'h' },
  { letter: 'I', lowercase: 'i' },
  { letter: 'J', lowercase: 'j' },
  { letter: 'K', lowercase: 'k' },
  { letter: 'L', lowercase: 'l' },
  { letter: 'M', lowercase: 'm' },
  { letter: 'N', lowercase: 'n' },
  { letter: 'O', lowercase: 'o' },
  { letter: 'P', lowercase: 'p' },
  { letter: 'Q', lowercase: 'q' },
  { letter: 'R', lowercase: 'r' },
  { letter: 'S', lowercase: 's' },
  { letter: 'T', lowercase: 't' },
  { letter: 'U', lowercase: 'u' },
  { letter: 'V', lowercase: 'v' },
  { letter: 'W', lowercase: 'w' },
  { letter: 'X', lowercase: 'x' },
  { letter: 'Y', lowercase: 'y' },
  { letter: 'Z', lowercase: 'z' },
];

export function getLetter(ch) {
  const found = LETTERS.find((entry) => entry.letter === ch);
  if (!found) throw new Error(`unknown letter: ${ch}`);
  return found;
}

export function isComplete(entry) {
  return Boolean(entry.word);
}
