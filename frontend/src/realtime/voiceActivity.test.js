import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateAudioRms,
  nextVoiceActivity,
  VOICE_START_THRESHOLD,
  VOICE_SILENCE_HOLD_MS,
} from './voiceActivity.js';

test('calculates silence and audible sample levels', () => {
  assert.equal(calculateAudioRms(new Uint8Array([128, 128, 128, 128])), 0);
  assert.ok(calculateAudioRms(new Uint8Array([80, 176, 80, 176])) > 0.3);
});

test('starts speaking above the start threshold', () => {
  assert.deepEqual(nextVoiceActivity({
    speaking: false,
    rms: 0.08,
    now: 1000,
    lastVoiceAt: 0,
  }), {
    speaking: true,
    lastVoiceAt: 1000,
  });
});

test('does not start speaking below the stricter start threshold', () => {
  assert.equal(nextVoiceActivity({
    speaking: false,
    rms: VOICE_START_THRESHOLD - 0.001,
    now: 1000,
    lastVoiceAt: 0,
  }).speaking, false);
});

test('holds speaking briefly across natural pauses', () => {
  assert.equal(nextVoiceActivity({
    speaking: true,
    rms: 0,
    now: VOICE_SILENCE_HOLD_MS - 1,
    lastVoiceAt: 0,
  }).speaking, true);

  assert.equal(nextVoiceActivity({
    speaking: true,
    rms: 0,
    now: VOICE_SILENCE_HOLD_MS,
    lastVoiceAt: 0,
  }).speaking, false);
});
