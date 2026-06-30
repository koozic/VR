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

  const video = document.createElement('video');
  video.src = url;
  video.muted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.tabIndex = -1;
  video.setAttribute('aria-hidden', 'true');

  wrapper.appendChild(video);

  const isMuted = { current: true };
  const toggleMute = () => {
    video.muted = !video.muted;
    isMuted.current = video.muted;
    video.play().catch(() => {});
  };
  panelsByUrl.set(url, { toggleMute, isMuted });
  video.play().catch(() => {});

  const panel = new CSS3DObject(wrapper);
  panel.userData.toggleMute = toggleMute;
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
