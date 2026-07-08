/* YouTube 동영상을 CSS3D iframe으로 전시하는 패널. 음소거/음소거 해제 제어 지원 */
import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

const PANEL_WIDTH = 640;
const PANEL_HEIGHT = 360;
const PANEL_BORDER = 18;
const PANEL_SCALE = 0.0045;

const panelsByVideo = new Map();

function waitForIframe(iframe, retries = 20) {
  return new Promise((resolve) => {
    if (iframe.contentWindow) return resolve(true);
    let count = 0;
    const id = setInterval(() => {
      if (iframe.contentWindow || ++count >= retries) {
        clearInterval(id);
        resolve(iframe.contentWindow != null);
      }
    }, 200);
  });
}

export function getPanelState(videoId) {
  return videoId ? panelsByVideo.get(videoId) || null : null;
}

function sendYouTubeCommand(iframe, command) {
  if (!iframe.contentWindow) return;
  iframe.contentWindow.postMessage(
    JSON.stringify({ event: 'command', func: command, args: '' }),
    '*',
  );
}

export function createYouTubePanel(videoId) {
  const wrapper = document.createElement('div');
  wrapper.className = 'youtube-panel';

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&disablekb=1&fs=0&modestbranding=1&playsinline=1&iv_load_policy=3&rel=0&enablejsapi=1`;
  iframe.title = 'Gallery video';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  iframe.tabIndex = -1;
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('frameborder', '0');

  wrapper.appendChild(iframe);

  const isMuted = { current: true };
  const state = {
    isMuted,
    disposed: false,
    toggleMute: null,
    dispose: null,
  };
  const toggleMute = () => {
    if (state.disposed) return;
    const command = isMuted.current ? 'unMute' : 'mute';
    waitForIframe(iframe).then(() => {
      if (state.disposed) return;
      sendYouTubeCommand(iframe, command);
    });
    isMuted.current = !isMuted.current;
  };
  const dispose = () => {
    if (state.disposed) return;
    state.disposed = true;
    sendYouTubeCommand(iframe, 'mute');
    sendYouTubeCommand(iframe, 'stopVideo');
    iframe.src = 'about:blank';
    wrapper.replaceChildren();
    if (panelsByVideo.get(videoId) === state) {
      panelsByVideo.delete(videoId);
    }
  };
  state.toggleMute = toggleMute;
  state.dispose = dispose;
  panelsByVideo.set(videoId, state);

  const panel = new CSS3DObject(wrapper);
  panel.userData.toggleMute = toggleMute;
  panel.userData.disposeMedia = dispose;
  panel.scale.setScalar(PANEL_SCALE);

  // This transparent WebGL plane punches a hole through the canvas for the
  // CSS3D iframe while preserving depth-tested objects in front of the video.
  const depthMask = new THREE.Mesh(
    new THREE.PlaneGeometry(
      PANEL_WIDTH + PANEL_BORDER * 2,
      PANEL_HEIGHT + PANEL_BORDER * 2,
    ),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: 0,
      blending: THREE.NoBlending,
      fog: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    }),
  );
  depthMask.name = 'youtube-depth-mask';
  depthMask.position.z = 6;
  panel.add(depthMask);

  return panel;
}
