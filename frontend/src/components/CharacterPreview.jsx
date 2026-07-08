import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { loadBlockyCharacter } from '../three/loadBlockyCharacter.js';
import { disposeObject } from '../three/sceneUtils.js';

export default function CharacterPreview({ characterId }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let disposed = false;
    let animationId = 0;
    let activeModel = null;
    let mixer = null;
    let autoRotate = true;
    let dragging = false;
    let dragStartX = 0;
    let dragStartRotation = 0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151b1b);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
    camera.position.set(0, 0.68, 3.05);
    camera.lookAt(0, 0.52, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.domElement.className = 'entry-character-preview__canvas';
    container.appendChild(renderer.domElement);

    const keyLight = new THREE.DirectionalLight(0xffefd2, 2.2);
    keyLight.position.set(2.4, 3.8, 3.2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9ed7ff, 1.2);
    fillLight.position.set(-2.3, 1.8, 2.1);
    scene.add(fillLight);

    scene.add(new THREE.HemisphereLight(0xdceeff, 0x2c2f26, 1.25));

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.9, 0.1, 48),
      new THREE.MeshStandardMaterial({
        color: 0x2b3230,
        roughness: 0.62,
        metalness: 0.08,
      }),
    );
    pedestal.position.y = -0.06;
    scene.add(pedestal);

    const group = new THREE.Group();
    group.position.y = 0;
    scene.add(group);

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const startDrag = (event) => {
      event.preventDefault();
      dragging = true;
      autoRotate = false;
      dragStartX = event.clientX;
      dragStartRotation = group.rotation.y;
      renderer.domElement.setPointerCapture?.(event.pointerId);
      container.classList.add('entry-character-preview--dragging');
    };

    const moveDrag = (event) => {
      if (!dragging) return;
      event.preventDefault();
      const deltaX = event.clientX - dragStartX;
      group.rotation.y = dragStartRotation + deltaX * 0.012;
    };

    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      if (renderer.domElement.hasPointerCapture?.(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
      container.classList.remove('entry-character-preview--dragging');
    };

    renderer.domElement.addEventListener('pointerdown', startDrag);
    renderer.domElement.addEventListener('pointermove', moveDrag);
    renderer.domElement.addEventListener('pointerup', endDrag);
    renderer.domElement.addEventListener('pointercancel', endDrag);
    renderer.domElement.addEventListener('lostpointercapture', endDrag);

    const clock = new THREE.Clock();
    loadBlockyCharacter('entry-preview', characterId)
      .then(({ model, mixer: loadedMixer }) => {
        if (disposed) {
          disposeObject(model);
          return;
        }

        activeModel = model;
        mixer = loadedMixer;
        activeModel.rotation.y = 0;
        group.add(activeModel);
      })
      .catch(() => {});

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      if (autoRotate) {
        group.rotation.y += delta * 0.72;
      }
      mixer?.update(delta);
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', startDrag);
      renderer.domElement.removeEventListener('pointermove', moveDrag);
      renderer.domElement.removeEventListener('pointerup', endDrag);
      renderer.domElement.removeEventListener('pointercancel', endDrag);
      renderer.domElement.removeEventListener('lostpointercapture', endDrag);
      if (activeModel) {
        group.remove(activeModel);
        disposeObject(activeModel);
      }
      scene.remove(group);
      scene.remove(pedestal);
      pedestal.geometry.dispose();
      pedestal.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [characterId]);

  return (
    <div
      ref={containerRef}
      className="entry-character-preview"
      aria-label="선택한 캐릭터 3D 미리보기"
    />
  );
}
