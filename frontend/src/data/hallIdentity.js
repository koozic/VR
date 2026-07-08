export const HALL_KINDS = {
  MAIN: 'main',
  SPACE: 'space',
  HISTORY: 'history',
  RETRO: 'retro',
};

const FALLBACK_ID_TO_KIND = new Map([
  [1, HALL_KINDS.MAIN],
  [2, HALL_KINDS.SPACE],
  [3, HALL_KINDS.HISTORY],
  [4, HALL_KINDS.RETRO],
]);

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ');
}

function kindFromKey(key) {
  const normalized = normalizeText(key);
  return Object.values(HALL_KINDS).includes(normalized) ? normalized : null;
}

function kindFromName(name) {
  const normalized = normalizeText(name);
  if (!normalized) return null;
  if (normalized.includes('main')) return HALL_KINDS.MAIN;
  if (normalized.includes('space')) return HALL_KINDS.SPACE;
  if (normalized.includes('history')) return HALL_KINDS.HISTORY;
  if (normalized.includes('retro') || normalized.includes('game')) return HALL_KINDS.RETRO;
  return null;
}

export function getHallKind(hall) {
  return (
    kindFromKey(hall?.key) ||
    kindFromName(hall?.name) ||
    FALLBACK_ID_TO_KIND.get(Number(hall?.id)) ||
    null
  );
}

export function isHallKind(hall, kind) {
  return getHallKind(hall) === kind;
}
