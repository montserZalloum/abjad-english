# Mission

<!--
  Owner: humans only. This file is on the protected list; the factory cannot edit it.
  This file is the PRD compressed to the part the agent has to obey. When the product
  changes, this file has to change in the same commit, or the factory keeps building
  the old scope and nothing warns you.
-->

**Derived from:** `docs/PRD.md`
**Last reconciled with that PRD:** 2026-09-04

## What أبجد إنجليزي (Abjad English) is

A simple, interactive web app that teaches the 26 English letters — pronunciation,
writing, and shape — to Arabic-speaking children and beginners. The interface chrome
(titles, instructions, feedback) is Arabic; the teaching material (letters and words)
is English. A child browses a grid of letters, opens one to see it large in both cases
with a word and picture, hears it pronounced, traces it with a finger or mouse, and
answers short multiple-choice quizzes about it.

Single assumption baked into the design: **one device, one learner, one browser.** All
progress lives in that browser's localStorage. There is no server side at all.

## Who it is for

- Arabic-speaking children (roughly 5–8) learning the English alphabet for the first time
- Arabic-speaking adult beginners, as a secondary audience

Abjad English is not a general English course, and it is not a classroom management tool.

## Core capabilities (in scope)

The factory may accept issues in these areas.

**Alphabet directory**
- Grid of all 26 letters
- Letter detail screen: uppercase + lowercase shown large (e.g. `Aa`)
- Audio pronunciation of the letter, played on demand

**Word–image association**
- Each letter paired with one English word that starts with it and an image
- The word shown with its Arabic translation and an Arabic-script approximate
  pronunciation (e.g. Apple → أبل → تفاحة)

**Letter tracing**
- A simple canvas where the learner traces the letter shape with finger/stylus/mouse

**Quiz**
- Short multiple-choice questions: hear a letter and pick it from 3 options, or see a
  letter and pick the matching word/image
- Answer positions must be randomised; the correct answer must never be predictable
  by position

**Progress**
- Which letters have been studied, stored in localStorage only

## Out of scope (the factory must never build this)

Issues asking for any of these are rejected at triage, even when they are popular,
well argued, and easy to implement. This list is how drift gets recognised as drift.

**Never, not "not yet."** Everything here is rejected forever. Anything merely deferred
belongs in the backlog, not in this list.

**Accounts and data**
- No user accounts, logins, or passwords
- No cloud database or server-side storage of any kind
- No analytics, telemetry, or syncing progress across devices

**Curriculum**
- No grammar teaching
- No sentence construction or phrases — letters and one word per letter only
- No numbers, colours, or other vocabulary sets as new content domains

**Adults**
- No teacher dashboard, no parent dashboard, no progress reporting to anyone

**Platforms and surfaces**
- No native mobile or desktop apps — this is a web app
- No backend API, public or private
- No social features: no sharing, comments, reactions, or leaderboards

**Money**
- No payments, subscriptions, ads, or in-app purchases

## Hard invariants (not tunable by any issue)

These are not features. They are properties that define what Abjad English is. The
factory cannot modify them even if an issue asks nicely, gives a good reason, or calls
it a bug. Changing one requires a human commit.

1. **Nothing leaves the device.** The app makes zero runtime network calls beyond
   fetching its own static assets. All state is localStorage. This exists because the
   users are children; their data does not travel.
2. **Chrome is Arabic, content is English.** Titles, instructions, and feedback are
   Arabic (RTL). Letters and words are English. A screen that mixes this up is a
   drop-everything bug.
3. **All content is child-appropriate.** Words, images, and audio must be suitable for
   a 5-year-old and correct — a wrong letter↔sound↔word mapping is teaching a mistake.
4. **The app must start.** A blank page or a crash on load is a drop-everything bug;
   the merge gate treats "could not start it" as failure, never as "nothing wrong".
5. **The factory cannot modify governance files.** `MISSION.md`, `FACTORY_RULES.md`
   and `CLAUDE.md` are the constitution. A PR touching any of them is an automatic
   reject.

## Allowed evolutions

Explicitly in scope, so the factory does not reject them as architectural drift:

- Completing content for all 26 letters (words, images, audio, transliterations)
- New quiz question formats within the letters-and-words scope
- Better art and audio assets for existing content
- Accessibility improvements (larger touch targets, contrast, reduced motion)

## Definition of done

Every change the factory ships clears all three gates. A PR that skips any of them is
not done.

**Gate 1 — static checks and tests pass.** `npm test` (unit) and `npm run validate`
(content validation) are green.

**Gate 2 — content quality bar.** Every letter entry is complete and distinct: correct
word, correct Arabic translation and transliteration, an image, and an audio file that
actually loads. No placeholder text, no duplicate words across letters, no quiz that
repeats the same question pattern back to back.

**Gate 3 — the end-to-end path passes as a real user.**

1. Serve the app and open it in a headless browser
2. The 26-letter grid renders (this is also `APP_STARTED` — a crashed app cannot
   produce it)
3. Tap letter A → detail screen shows `Aa`, the word with its Arabic translation and
   transliteration, and the audio control
4. Play the pronunciation → the audio file loads and plays without error
5. Trace the letter → strokes register on the canvas
6. Answer one quiz question → feedback shows, progress is written to localStorage
7. Reload the page → the progress is still there

This runs on every change that touches runnable code, including ones that "seem
unrelated". It is not optional.

## Non-goals

Abjad English is explicitly not trying to be: a full language course, a school
platform, a game engine, a multi-user product, or a data product.

When in doubt, the answer is "that is out of scope."

## Open questions — decisions nobody has made yet

These are undecided, not forbidden. **The factory may propose an answer to any of
them**, build against it, and record what it assumed — the merge is then held for a
human, so nothing ships on a guess and nothing stops for one. See `FACTORY_RULES.md` §7.

- **Q1** Audio sourcing: recorded human voice, generated TTS, or synthesized? The
  skeleton ships with a generated placeholder per letter; the factory may propose the
  permanent source.
- **Q2** Image sourcing: hand-drawn, generated, or licensed set? Same rule as Q1.
- **Q3** Quiz cadence: how many questions per letter visit before the letter counts as
  "studied"? The skeleton uses one; the real number is a product value the factory may
  propose.

**Except these, which do stop the factory** — they are on the irreversible list
(`FACTORY_RULES.md` §7.3) rather than open in the ordinary sense:

- Anything that would send learner data off the device (invariant 1 — not negotiable)
- Changing which language is the teaching language vs the interface language

Once answered, an entry moves to `.factory/decisions.md` with its answer and date, and
stops being asked. **A decision is asked once.**

## What the factory does NOT own — permanently human

The factory's scope is smaller than the product's. A green gate means the layer a
machine can check is intact — never that "the product is good".

- **Does it FEEL right** — pacing, reward feel, whether tracing is satisfying,
  whether a child wants to come back
- **Does it LOOK right** — layout, hierarchy, whether the app reads as friendly to a
  5-year-old, whether two states read as different
- **Is it UNDERSTANDABLE** — can a first-time child (or their parent, unprompted) work
  out what to do

The factory owns the content data, the quiz logic, the progress logic, and the tracing
mechanics: the layer whose correctness can be asserted. The list above is reviewed by
a human, on purpose, forever.
