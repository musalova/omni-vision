const STORAGE_KEY = 'vision-remote-state-v2';

const MAX_HISTORY = 30;

const TIME_SLOTS = [
  { id: 'notte', start: 0, end: 6 },
  { id: 'mattina', start: 6, end: 12 },
  { id: 'pomeriggio', start: 12, end: 18 },
  { id: 'sera', start: 18, end: 24 },
];

const defaultTvProfiles = [
  {
    id: 'auto-discovery',
    name: 'Auto Scoperta (non conosco il codice)',
    brand: 'auto',
    detectedProfileId: null,
  },
  {
    id: 'zephir',
    name: 'Zephir (Conad)',
    brand: 'Zephir',
    detectedProfileId: null,
  },
  {
    id: 'ok-tv',
    name: 'OK. (TV)',
    brand: 'OK',
    detectedProfileId: null,
  },
];

const defaultState = {
  tvProfiles: defaultTvProfiles,
  activeTvId: 'zephir',
  voiceEnabled: false,
  lastCommand: null,
  preferences: {
    genreScores: {},
    channelScores: {},
    actorScores: {},
    timeSlotScores: {},
    likedPrograms: [],
    dislikedPrograms: [],
    watchHistory: [],
  },
};

function mergeTvProfiles(defaultProfiles, savedProfiles = []) {
  const byId = new Map(savedProfiles.map((tv) => [tv.id, tv]));
  const merged = defaultProfiles.map((tv) => ({ ...tv, ...byId.get(tv.id) }));
  const custom = savedProfiles.filter((tv) => !byId.has(tv.id) && !defaultProfiles.find((d) => d.id === tv.id));
  return [...merged, ...custom];
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...defaultState };
    const parsed = JSON.parse(saved);
    return {
      ...defaultState,
      ...parsed,
      tvProfiles: mergeTvProfiles(defaultTvProfiles, parsed.tvProfiles || []),
      preferences: {
        ...defaultState.preferences,
        ...(parsed.preferences || {}),
      },
    };
  } catch (error) {
    console.warn('Unable to load state', error);
    return { ...defaultState };
  }
}

function persistState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to persist state', error);
  }
}

function getTimeSlotId(date) {
  if (!date) return 'sera';
  const target = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const hour = target.getHours();
  const slot = TIME_SLOTS.find((entry) => hour >= entry.start && hour < entry.end);
  return slot?.id || 'sera';
}

function boostScore(map, key, delta = 1) {
  if (!key) return;
  map[key] = (map[key] || 0) + delta;
}

function addUnique(list, value, limit = MAX_HISTORY) {
  if (!value) return list;
  const filtered = list.filter((item) => item !== value);
  filtered.unshift(value);
  return filtered.slice(0, limit);
}

export function createStore() {
  let state = loadState();
  const listeners = new Set();

  function getState() {
    return state;
  }

  function setState(partial) {
    state = { ...state, ...partial };
    persistState(state);
    listeners.forEach((listener) => listener(state));
  }

  function updateTvProfile(tvId, updater) {
    state = {
      ...state,
      tvProfiles: state.tvProfiles.map((tv) => (tv.id === tvId ? { ...tv, ...updater(tv) } : tv)),
    };
    persistState(state);
    listeners.forEach((listener) => listener(state));
  }

  function recordWatchEvent(program) {
    const preferences = structuredClone(state.preferences);
    if (program?.genre) {
      boostScore(preferences.genreScores, program.genre, 1);
    }
    if (program?.channelId) {
      boostScore(preferences.channelScores, program.channelId, 1);
    }
    (program?.cast || []).forEach((actor) => boostScore(preferences.actorScores, actor, 1));
    const slotId = getTimeSlotId(program?.start);
    boostScore(preferences.timeSlotScores, slotId, 1);
    preferences.watchHistory = addUnique(preferences.watchHistory || [], program?.id);
    setState({ preferences });
  }

  function recordFeedback(program, sentiment) {
    if (!program) return;
    const preferences = structuredClone(state.preferences);
    const targetListKey = sentiment === 'like' ? 'likedPrograms' : 'dislikedPrograms';
    const oppositeListKey = sentiment === 'like' ? 'dislikedPrograms' : 'likedPrograms';

    const programId = program.id;
    preferences[targetListKey] = addUnique(preferences[targetListKey] || [], programId, 50);
    preferences[oppositeListKey] = (preferences[oppositeListKey] || []).filter((id) => id !== programId);

    const boost = sentiment === 'like' ? 3 : -2;
    if (program.genre) boostScore(preferences.genreScores, program.genre, boost);
    if (program.channelId) boostScore(preferences.channelScores, program.channelId, boost);
    (program.cast || []).forEach((actor) => boostScore(preferences.actorScores, actor, boost));
    const slotId = getTimeSlotId(program.start);
    boostScore(preferences.timeSlotScores, slotId, boost);

    setState({ preferences });
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    getState,
    setState,
    updateTvProfile,
    recordWatchEvent,
    recordFeedback,
    subscribe,
  };
}
