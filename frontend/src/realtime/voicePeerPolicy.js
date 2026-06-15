export function shouldInitiateVoiceOffer(localUserId, remoteUserId) {
  return Boolean(
    localUserId
    && remoteUserId
    && localUserId !== remoteUserId
    && localUserId.localeCompare(remoteUserId) < 0
  );
}
