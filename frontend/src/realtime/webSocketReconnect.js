const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 10000;

export function getWebSocketReconnectDelay(attempt) {
  const safeAttempt = Number.isFinite(attempt)
    ? Math.max(0, Math.floor(attempt))
    : 0;
  const exponentialDelay = RECONNECT_BASE_DELAY_MS * (2 ** safeAttempt);
  return Math.min(exponentialDelay, RECONNECT_MAX_DELAY_MS);
}
