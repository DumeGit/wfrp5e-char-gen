// Session-only edit history. Navigation/filters never enter the comparison.
const clone = (value) => structuredClone(value);
export function historyProjection({ draft, document }) {
  const { step, ...values } = draft;
  return JSON.stringify({ document, draft: values });
}

// Keep every recorded occurrence, including identical consecutive dice rolls.
export function mergeRollHistory(previous = [], current = []) {
  const result = clone(current),
    counts = new Map();
  for (const roll of current) {
    const key = JSON.stringify(roll);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  for (const roll of previous) {
    const key = JSON.stringify(roll),
      remaining = counts.get(key) || 0;
    if (remaining) counts.set(key, remaining - 1);
    else result.push(clone(roll));
  }
  return result;
}

export function restoreDraftSnapshot(target, current, { player = false } = {}) {
  // Replacement drafts have independent dice histories and navigation.
  if (target.document !== current.document) return target;
  target.draft.step = current.draft.step;
  target.setupOpen = current.setupOpen;
  target.draft.rolls = mergeRollHistory(
    target.draft.rolls,
    current.draft.rolls,
  );
  if (player) {
    for (const key of ["speciesAttempts", "careerAttempts", "charAttempts"])
      target.draft[key] = Math.max(
        target.draft[key] || 0,
        current.draft[key] || 0,
      );
  }
  return target;
}

export function createDraftHistory(
  initial,
  {
    limit = 60,
    project = historyProjection,
    restore = restoreDraftSnapshot,
  } = {},
) {
  let current = clone(initial),
    activeGroup = null;
  const past = [],
    future = [];
  return {
    get canUndo() {
      return past.length > 0;
    },
    get canRedo() {
      return future.length > 0;
    },
    breakGroup() {
      activeGroup = null;
    },
    record(next, { group = null } = {}) {
      if (project(current) === project(next)) {
        current = clone(next);
        return false;
      }
      if (!group || group !== activeGroup) {
        past.push(current);
        if (past.length > limit) past.shift();
      }
      future.length = 0;
      current = clone(next);
      activeGroup = group;
      return true;
    },
    travel(direction) {
      const from = direction === "undo" ? past : future;
      const to = direction === "undo" ? future : past;
      if (!from.length) return null;
      to.push(clone(current));
      current = restore(from.pop(), clone(current));
      activeGroup = null;
      return clone(current);
    },
  };
}
