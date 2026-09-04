// Progress store: which letters the learner has studied.
// Pure logic with injected storage, so node tests drive it without a browser.

const KEY = 'abjad.progress.v1';

export function createProgressStore(storage) {
  function load() {
    const raw = storage.getItem(KEY);
    if (raw === null) return { studied: [] };
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // A corrupt save is surfaced, not silently treated as empty.
      throw new Error(`corrupt progress in localStorage under ${KEY}`);
    }
    if (!parsed || !Array.isArray(parsed.studied)) {
      throw new Error(`corrupt progress in localStorage under ${KEY}`);
    }
    return parsed;
  }

  function save(state) {
    storage.setItem(KEY, JSON.stringify(state));
  }

  return {
    load,
    isStudied(letter) {
      return load().studied.includes(letter);
    },
    markStudied(letter) {
      const state = load();
      if (!state.studied.includes(letter)) {
        state.studied.push(letter);
        save(state);
      }
      return state;
    },
  };
}
