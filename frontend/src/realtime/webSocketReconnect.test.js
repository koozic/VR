import assert from 'node:assert/strict';
import test from 'node:test';
import { getWebSocketReconnectDelay } from './webSocketReconnect.js';

test('increases the reconnect delay after each failure', () => {
  assert.equal(getWebSocketReconnectDelay(0), 1000);
  assert.equal(getWebSocketReconnectDelay(1), 2000);
  assert.equal(getWebSocketReconnectDelay(2), 4000);
  assert.equal(getWebSocketReconnectDelay(3), 8000);
});

test('limits the reconnect delay to ten seconds', () => {
  assert.equal(getWebSocketReconnectDelay(4), 10000);
  assert.equal(getWebSocketReconnectDelay(20), 10000);
});

test('uses the first delay for an invalid attempt value', () => {
  assert.equal(getWebSocketReconnectDelay(-1), 1000);
  assert.equal(getWebSocketReconnectDelay(Number.NaN), 1000);
});
