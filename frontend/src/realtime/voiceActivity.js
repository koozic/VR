export const VOICE_START_THRESHOLD = 0.06;
export const VOICE_CONTINUE_THRESHOLD = 0.032;
export const VOICE_SILENCE_HOLD_MS = 320;

export function calculateAudioRms(samples) {
  if (!samples?.length) return 0;

  let squareSum = 0;
  for (const sample of samples) {
    const normalized = (sample - 128) / 128;
    squareSum += normalized * normalized;
  }
  return Math.sqrt(squareSum / samples.length);
}

export function nextVoiceActivity({
  speaking,
  rms,
  now,
  lastVoiceAt,
}) {
  const threshold = speaking
    ? VOICE_CONTINUE_THRESHOLD
    : VOICE_START_THRESHOLD;

  if (rms >= threshold) {
    return { speaking: true, lastVoiceAt: now };
  }

  if (speaking && now - lastVoiceAt < VOICE_SILENCE_HOLD_MS) {
    return { speaking: true, lastVoiceAt };
  }

  return { speaking: false, lastVoiceAt };
}
