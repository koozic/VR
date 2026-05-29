import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

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

  const panel = new CSS3DObject(wrapper);
  panel.scale.setScalar(0.0045);

  return panel;
}
