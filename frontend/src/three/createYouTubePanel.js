import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

const PANEL_WIDTH = 640;
const PANEL_HEIGHT = 360;
const PANEL_BORDER = 18;
const PANEL_SCALE = 0.0045;

let _unmute = null;
export function getUnmute() { return _unmute; }

export function createYouTubePanel(videoId) {
  const wrapper = document.createElement('div');
  wrapper.className = 'youtube-panel';

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&disablekb=1&fs=0&modestbranding=1&playsinline=1&iv_load_policy=3&rel=0`;
  iframe.title = 'Gallery video';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  iframe.tabIndex = -1;
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('frameborder', '0');

  wrapper.appendChild(iframe);

  const unmute = () => {
    iframe.contentWindow.postMessage(
      '{"event":"command","func":"unMute","args":""}',
      '*',
    );
  };
  _unmute = unmute;

  const panel = new CSS3DObject(wrapper);
  panel.userData.unmute = unmute;
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
