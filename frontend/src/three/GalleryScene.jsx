import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { createArtworkFrame } from './createArtworkFrame.js';
import { createDocent } from './createDocent.js';
import { findNearbyArtwork } from './distanceCheck.js';

const YOUTUBE_VIDEO_ID = 'klIxS5o65C4';
const YOUTUBE_POSITION = new THREE.Vector3(0, 2, -3.74);
const YOUTUBE_THRESHOLD = 2.2;

function createYouTubePanel() {
  const wrapper = document.createElement('div');
  wrapper.className = 'youtube-panel';

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&disablekb=1&fs=0&modestbranding=1&playsinline=1&iv_load_policy=3&rel=0`;
  iframe.title = 'Gallery video';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  iframe.tabIndex = -1;
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('frameborder', '0');

  wrapper.appendChild(iframe);

  const panel = new CSS3DObject(wrapper);
  panel.position.set(0, 2, -3.74);
  panel.scale.setScalar(0.0045);

  return panel;
}

function getArtworkXPosition(index, total) {
  if (total === 2) {
    return index === 0 ? -3.3 : 3.3;
  }

  return (index - (total - 1) / 2) * 4.6;
}

export default function GalleryScene({ artworks, onArtworkFocus }) {
  const containerRef = useRef(null);
  const focusRef = useRef(null);
  const onArtworkFocusRef = useRef(onArtworkFocus);

  useEffect(() => {
    onArtworkFocusRef.current = onArtworkFocus;
  }, [onArtworkFocus]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101418);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.6, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.className = 'scene-canvas';
    container.appendChild(renderer.domElement);

    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(container.clientWidth, container.clientHeight);
    cssRenderer.domElement.className = 'scene-css3d';
    container.appendChild(cssRenderer.domElement);

    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x28313a, 1.8);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 3.5, 22, Math.PI / 5, 0.45, 1);
    spotLight.position.set(0, 6, 4);
    scene.add(spotLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 18),
      new THREE.MeshStandardMaterial({ color: 0x9a9488, roughness: 0.78 }),
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(18, 4.5, 0.24),
      new THREE.MeshStandardMaterial({ color: 0xe8e0d2, roughness: 0.7 }),
    );
    backWall.position.set(0, 2.25, -4);
    scene.add(backWall);

    const frames = artworks.map((artwork, index) => {
      const x = getArtworkXPosition(index, artworks.length);
      const frame = createArtworkFrame(artwork);
      frame.position.set(x, 2, -3.82);
      scene.add(frame);
      return { artwork, object: frame, position: frame.position.clone() };
    });

    const youtubePanel = createYouTubePanel();
    scene.add(youtubePanel);

    const docent = createDocent();
    camera.add(docent);
    scene.add(camera);

    const pressedKeys = new Set();
    const handleKeyDown = (event) => pressedKeys.add(event.key.toLowerCase());
    const handleKeyUp = (event) => pressedKeys.delete(event.key.toLowerCase());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const clock = new THREE.Clock();
    let animationId = 0;

    const animate = () => {
      const delta = clock.getDelta();
      const deltaMs = delta * 1000;
      const speed = delta * 4;

      if (pressedKeys.has('w') || pressedKeys.has('arrowup')) camera.position.z -= speed;
      if (pressedKeys.has('s') || pressedKeys.has('arrowdown')) camera.position.z += speed;
      if (pressedKeys.has('a') || pressedKeys.has('arrowleft')) camera.position.x -= speed;
      if (pressedKeys.has('d') || pressedKeys.has('arrowright')) camera.position.x += speed;

      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -7.5, 7.5);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -2.6, 7.5);
      camera.lookAt(camera.position.x, 1.5, -4);

      docent.userData.update?.(clock.elapsedTime, delta);

      frames.forEach(({ object }) => {
        const s = object.userData.gifState;
        if (!s || !s.active || !s.frames.length) return;
        s.accum += deltaMs;
        if (s.accum >= s.frames[s.current].delay) {
          s.accum = 0;
          const prev = s.frames[s.current];
          s.current = (s.current + 1) % s.frames.length;
          const next = s.frames[s.current];
          const { left, top, width: fw, height: fh } = next.dims;

          // Apply previous frame's disposal before drawing the new one
          if (prev.disposalType === 2 && prev.dims) {
            s.ctx.clearRect(prev.dims.left, prev.dims.top, prev.dims.width, prev.dims.height);
          }

          // Composite new frame with alpha blending via temp canvas
          s.tempCanvas.width = fw;
          s.tempCanvas.height = fh;
          const imgData = s.tempCtx.createImageData(fw, fh);
          imgData.data.set(next.patch);
          s.tempCtx.putImageData(imgData, 0, 0);
          s.ctx.drawImage(s.tempCanvas, left, top);
          s.texture.needsUpdate = true;
        }
      });

      const distToYoutube = camera.position.distanceTo(YOUTUBE_POSITION);

      if (distToYoutube < YOUTUBE_THRESHOLD) {
        if (focusRef.current !== -1) {
          focusRef.current = -1;
          onArtworkFocusRef.current?.(-1);
        }
      } else {
        const nearbyArtwork = findNearbyArtwork(camera.position, frames);
        if (nearbyArtwork && focusRef.current !== nearbyArtwork.id) {
          focusRef.current = nearbyArtwork.id;
          onArtworkFocusRef.current?.(nearbyArtwork.id);
        }
      }

      renderer.render(scene, camera);
      cssRenderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      cssRenderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      container.removeChild(cssRenderer.domElement);
    };
  }, [artworks]);

  return <div ref={containerRef} className="scene-canvas" />;
}
