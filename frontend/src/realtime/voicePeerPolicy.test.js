import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldInitiateVoiceOffer } from './voicePeerPolicy.js';

test('chooses exactly one offerer for two voice users', () => {
  assert.equal(shouldInitiateVoiceOffer('visitor-a', 'visitor-b'), true);
  assert.equal(shouldInitiateVoiceOffer('visitor-b', 'visitor-a'), false);
});

test('does not create an offer without two different users', () => {
  assert.equal(shouldInitiateVoiceOffer('', 'visitor-b'), false);
  assert.equal(shouldInitiateVoiceOffer('visitor-a', ''), false);
  assert.equal(shouldInitiateVoiceOffer('visitor-a', 'visitor-a'), false);
});
