const DEFAULT_STUN_URLS = ['stun:stun.l.google.com:19302'];

function parseUrlList(value) {
  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
}

export function buildWebRtcIceServers(env = {}) {
  const configuredStunUrls = parseUrlList(env.VITE_WEBRTC_STUN_URLS);
  const stunUrls = configuredStunUrls.length > 0
    ? configuredStunUrls
    : DEFAULT_STUN_URLS;
  const iceServers = [{ urls: stunUrls }];

  const turnUrls = parseUrlList(env.VITE_WEBRTC_TURN_URLS);
  const turnUsername = env.VITE_WEBRTC_TURN_USERNAME?.trim();
  const turnCredential = env.VITE_WEBRTC_TURN_CREDENTIAL;

  if (turnUrls.length > 0 && turnUsername && turnCredential) {
    iceServers.push({
      urls: turnUrls,
      username: turnUsername,
      credential: turnCredential,
    });
  }

  return iceServers;
}
