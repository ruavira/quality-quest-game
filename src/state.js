// Quality Quest — application state (single source of truth, localStorage persistence)

const STORAGE_KEYS = {
  profile:  "qq:profile",
  progress: "qq:progress",
  badges:   "qq:badges",
  settings: "qq:settings",
  meta:     "qq:meta",
};

const DEFAULT_STATE = {
  profile: null,        // null until onboarding step 2 saved
  progress: {
    completedScenarioIds: [],
    answers: {},        // scenarioId → { correct, attempts, lastAt, reflection }
    history: [],        // append-only attempt events; older saved states migrate safely
    competency: {},     // tag → { right, wrong, streakRight, streakWrong }
    currentTier: 1,
    moduleTier: {},     // moduleId → tier player is currently in
    sessionStartAt: null,
  },
  badges: [],
  settings: {
    reducedMotion: false,
    showChartTable: false,
    language: "en",
  },
  meta: {
    firstSeenAt: null,
    lastSeenAt: null,
    installPromptDismissedAt: null,
  },
};

const listeners = new Set();
let state = loadAll();

function loadAll() {
  const s = structuredClone(DEFAULT_STATE);
  for (const key of Object.keys(STORAGE_KEYS)) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS[key]);
      if (raw) s[key] = { ...s[key], ...JSON.parse(raw) };
    } catch { /* corrupt key — ignore, default wins */ }
  }
  if (!Array.isArray(s.progress.history)) s.progress.history = [];
  if (!s.meta.firstSeenAt) s.meta.firstSeenAt = Date.now();
  s.meta.lastSeenAt = Date.now();
  return s;
}

function persist(slice) {
  try {
    localStorage.setItem(STORAGE_KEYS[slice], JSON.stringify(state[slice]));
  } catch { /* storage full or denied; play continues, no crash */ }
}

function notify() { for (const fn of listeners) fn(state); }

export function getState() { return state; }

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ---- Profile ----

export function saveProfile(profile) {
  state.profile = { ...(state.profile || {}), ...profile, savedAt: Date.now() };
  persist("profile");
  notify();
}

export function clearAll() {
  for (const k of Object.values(STORAGE_KEYS)) localStorage.removeItem(k);
  state = loadAll();
  notify();
}

// ---- Progress ----

export function recordAnswer(scenario, { correct }) {
  const id = scenario.id;
  const prev = state.progress.answers[id] || { attempts: 0 };
  const answeredAt = Date.now();
  const reviewDueAt = correct
    ? (prev.attempts > 0 ? answeredAt + 14 * 86400000 : answeredAt + 30 * 86400000)
    : answeredAt + 14 * 86400000;
  state.progress.answers[id] = {
    correct,
    attempts: prev.attempts + 1,
    lastAt: answeredAt,
    reviewDueAt,
    reflection: prev.reflection || null,
  };
  state.progress.history.push({ scenarioId: id, correct: !!correct, at: answeredAt });
  if (correct && !state.progress.completedScenarioIds.includes(id)) {
    state.progress.completedScenarioIds.push(id);
  }
  for (const tag of (scenario.competency_tags || [])) {
    const c = state.progress.competency[tag] || { right: 0, wrong: 0, streakRight: 0, streakWrong: 0 };
    if (correct) { c.right += 1; c.streakRight += 1; c.streakWrong = 0; }
    else         { c.wrong += 1; c.streakWrong += 1; c.streakRight = 0; }
    state.progress.competency[tag] = c;
  }
  if (!state.progress.sessionStartAt) state.progress.sessionStartAt = Date.now();
  persist("progress");
  notify();
}

export function recordReflection(scenarioId, reflection) {
  const answer = state.progress.answers[scenarioId];
  if (!answer || !reflection) return;
  answer.reflection = reflection;
  const latest = [...state.progress.history].reverse().find(item => item.scenarioId === scenarioId);
  if (latest) latest.reflection = reflection;
  persist("progress");
  notify();
}

export function reviewQueue(now = Date.now()) {
  return Object.entries(state.progress.answers)
    .filter(([, answer]) => answer.reviewDueAt && answer.reviewDueAt <= now)
    .sort((a, b) => a[1].reviewDueAt - b[1].reviewDueAt)
    .map(([scenarioId]) => scenarioId);
}

export function setModuleTier(moduleId, tier) {
  state.progress.moduleTier[moduleId] = tier;
  persist("progress");
  notify();
}

// ---- Badges ----

export function awardBadge(id) {
  if (!state.badges.includes(id)) {
    state.badges.push(id);
    persist("badges");
    notify();
    return true;
  }
  return false;
}

// ---- Settings ----

export function setSetting(key, value) {
  state.settings[key] = value;
  persist("settings");
  notify();
}

// ---- Meta ----

export function setMeta(key, value) {
  state.meta[key] = value;
  persist("meta");
  notify();
}

// ---- Export / import ----

export function exportTranscript() {
  return {
    schema: "quality-quest-transcript@2",
    exportedAt: new Date().toISOString(),
    profile: state.profile,
    progress: state.progress,
    badges: state.badges,
  };
}
