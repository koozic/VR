import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

const PANEL_WIDTH = 640;
const PANEL_HEIGHT = 360;
const PANEL_BORDER = 18;
const PANEL_SCALE = 0.0045;

const panelsByUrl = new Map();

export function getVideoPanelState(url) {
  return url ? panelsByUrl.get(url) || null : null;
}

export function createVideoPanel(url) {
  const wrapper = document.createElement('div');
  wrapper.className = 'video-panel';
  let objectUrl = null;
  let fallbackStarted = false;

  const video = document.createElement('video');
  video.src = url;
  video.crossOrigin = 'anonymous';
  video.muted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.tabIndex = -1;
  video.setAttribute('aria-hidden', 'true');

  wrapper.appendChild(video);

  const isMuted = { current: true };
  const state = {
    isMuted,
    disposed: false,
    toggleMute: null,
    dispose: null,
  };
  const toggleMute = () => {
    if (state.disposed) return;
    video.muted = !video.muted;
    isMuted.current = video.muted;
    video.play().catch(() => {});
  };
  const loadBlobFallback = async () => {
    if (state.disposed || fallbackStarted || !url) return;
    fallbackStarted = true;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Video fallback failed: ${response.status}`);
      const blob = await response.blob();
      if (state.disposed) return;

      objectUrl = URL.createObjectURL(blob);
      video.src = objectUrl;
      video.load();
      video.play().catch(() => {});
    } catch (error) {
      console.warn(`Failed to load video fallback: ${url}`, error);
    }
  };
  video.addEventListener('error', () => {
    loadBlobFallback();
  });
  const dispose = () => {
    if (state.disposed) return;
    state.disposed = true;
    video.pause();
    video.muted = true;
    video.removeAttribute('src');
    video.load();
    wrapper.replaceChildren();
    if (panelsByUrl.get(url) === state) {
      panelsByUrl.delete(url);
    }
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  };
  state.toggleMute = toggleMute;
  state.dispose = dispose;
  panelsByUrl.set(url, state);
  video.play().catch(() => {});

  const panel = new CSS3DObject(wrapper);
  panel.userData.toggleMute = toggleMute;
  panel.userData.disposeMedia = dispose;
  panel.scale.setScalar(PANEL_SCALE);

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
  depthMask.name = 'video-depth-mask';
  depthMask.position.z = 6;
  panel.add(depthMask);

  return panel;
}
