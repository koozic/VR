import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createExhibitFrame } from './createExhibitFrame.js';
import { createDocent } from './createDocent.js';
import { findNearbyExhibit } from './distanceCheck.js';

export default function GalleryScene({ exhibits, onExhibitFocus }) {
  const containerRef = useRef(null);
  const focusRef = useRef(null);
  const onExhibitFocusRef = useRef(onExhibitFocus);

  useEffect(() => {
    onExhibitFocusRef.current = onExhibitFocus;
  }, [onExhibitFocus]);

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

    const frames = exhibits.map((exhibit, index) => {
      const x = (index - (exhibits.length - 1) / 2) * 4;
      const frame = createExhibitFrame(exhibit);
      frame.position.set(x, 2, -3.82);
      scene.add(frame);
      return { exhibit, object: frame, position: frame.position.clone() };
    });

    const docent = createDocent();
    docent.position.set(-5.8, 0, 3.2);
    scene.add(docent);

    const pressedKeys = new Set();
    const handleKeyDown = (event) => pressedKeys.add(event.key.toLowerCase());
    const handleKeyUp = (event) => pressedKeys.delete(event.key.toLowerCase());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const clock = new THREE.Clock();
    let animationId = 0;

    const animate = () => {
      const delta = clock.getDelta();
      const speed = delta * 4;

      if (pressedKeys.has('w') || pressedKeys.has('arrowup')) camera.position.z -= speed;
      if (pressedKeys.has('s') || pressedKeys.has('arrowdown')) camera.position.z += speed;
      if (pressedKeys.has('a') || pressedKeys.has('arrowleft')) camera.position.x -= speed;
      if (pressedKeys.has('d') || pressedKeys.has('arrowright')) camera.position.x += speed;

      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -7.5, 7.5);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -2.6, 7.5);
      camera.lookAt(camera.position.x, 1.5, -4);

      docent.rotation.y += delta * 0.8;

      const nearbyExhibit = findNearbyExhibit(camera.position, frames);
      if (nearbyExhibit && focusRef.current !== nearbyExhibit.id) {
        focusRef.current = nearbyExhibit.id;
        onExhibitFocusRef.current?.(nearbyExhibit.id);
      }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [exhibits]);

  return <div ref={containerRef} className="scene-canvas" />;
}
