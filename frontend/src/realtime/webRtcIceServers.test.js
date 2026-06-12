import assert from 'node:assert/strict';
import test from 'node:test';
import { buildWebRtcIceServers } from './webRtcIceServers.js';

test('uses the default STUN server without environment settings', () => {
  assert.deepEqual(buildWebRtcIceServers(), [
    { urls: ['stun:stun.l.google.com:19302'] },
  ]);
});

test('adds configured TURN servers with their credentials', () => {
  assert.deepEqual(buildWebRtcIceServers({
    VITE_WEBRTC_STUN_URLS: 'stun:stun.example.com:3478',
    VITE_WEBRTC_TURN_URLS: 'turn:turn.example.com:3478, turns:turn.example.com:5349',
    VITE_WEBRTC_TURN_USERNAME: ' gallery-user ',
    VITE_WEBRTC_TURN_CREDENTIAL: 'temporary-password',
  }), [
    { urls: ['stun:stun.example.com:3478'] },
    {
      urls: [
        'turn:turn.example.com:3478',
        'turns:turn.example.com:5349',
      ],
      username: 'gallery-user',
      credential: 'temporary-password',
    },
  ]);
});

test('ignores an incomplete TURN configuration', () => {
  assert.deepEqual(buildWebRtcIceServers({
    VITE_WEBRTC_TURN_URLS: 'turn:turn.example.com:3478',
    VITE_WEBRTC_TURN_USERNAME: 'gallery-user',
  }), [
    { urls: ['stun:stun.l.google.com:19302'] },
  ]);
});
