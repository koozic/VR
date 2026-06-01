import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { createExhibitFrame } from './createExhibitFrame.js';
import { createYouTubePanel } from './createYouTubePanel.js';
import { createPortal } from './createPortal.js';
import { createDocent } from './createDocent.js';
import { findNearbyExhibit, findNearestExhibit } from './distanceCheck.js';

function hexToThree(hex) {
  if (!hex) return 0xe8e0d2;
  const cleaned = hex.replace('#', '');
  const val = parseInt(cleaned, 16);
  return Number.isNaN(val) ? 0xe8e0d2 : val;
}

function makeBox(scene, width, height, depth, material, position) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.copy(position);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);
}

function buildRoom(scene, roomConfig, roomY) {
  const wallColor = hexToThree(roomConfig?.wallColor);
  const floorColor = hexToThree(roomConfig?.floorColor);
  const ceilingColor = hexToThree(roomConfig?.ceilingColor);

  const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.78 });
  const floorMat = new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.88, metalness: 0.02 });
  const ceilingMat = new THREE.MeshStandardMaterial({ color: ceilingColor, roughness: 0.78 });
  const darkTrim = new THREE.MeshStandardMaterial({ color: 0x242826, roughness: 0.65 });

  const off = (x, y, z) => new THREE.Vector3(x, roomY + y, z);

  makeBox(scene, 18, 0.18, 22, floorMat, off(0, -0.09, 0));
  makeBox(scene, 18, 0.18, 22, ceilingMat, off(0, 4.42, 0));
  makeBox(scene, 18, 4.5, 0.22, wallMat, off(0, 2.15, -11));
  makeBox(scene, 18, 4.5, 0.22, wallMat, off(0, 2.15, 11));
  makeBox(scene, 0.22, 4.5, 22, wallMat, off(-9, 2.15, 0));
  makeBox(scene, 0.22, 4.5, 22, wallMat, off(9, 2.15, 0));

  const trims = [
    [18, 0.12, 0.16, 0, 0.24, -10.84],
    [18, 0.12, 0.16, 0, 0.24, 10.84],
    [0.16, 0.12, 22, -8.84, 0.24, 0],
    [0.16, 0.12, 22, 8.84, 0.24, 0],
    [18, 0.1, 0.12, 0, 3.92, -10.83],
    [18, 0.1, 0.12, 0, 3.92, 10.83],
    [0.12, 0.1, 22, -8.83, 3.92, 0],
    [0.12, 0.1, 22, 8.83, 3.92, 0],
  ];
  trims.forEach(([w, h, d, x, y, z]) => {
    makeBox(scene, w, h, d, darkTrim, off(x, y, z));
  });

  const step = 3.5;
  for (let i = -7; i <= 7; i += step) {
    makeBox(scene, 0.04, 0.012, 21.6, darkTrim, off(i, 0.012, 0));
    makeBox(scene, 17.6, 0.012, 0.04, darkTrim, off(0, 0.014, i));
  }
}

function setupLighting(scene, roomConfig, roomY) {
  const ambientColor = hexToThree(roomConfig?.ambientLightColor);
  const intensity = roomConfig?.lightIntensity ?? 1.18;

  scene.add(new THREE.HemisphereLight(ambientColor, 0x26302d, intensity));

  const key = new THREE.DirectionalLight(0xfff1d6, 1.3);
  key.position.set(-4.5, roomY + 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 50;
  key.shadow.camera.left = -12;
  key.shadow.camera.right = 12;
  key.shadow.camera.top = 14;
  key.shadow.camera.bottom = -14;
  scene.add(key);

  const lightPositions = [
    [-5.4, 3.84, -7.2],
    [0, 3.84, -7.2],
    [5.4, 3.84, -7.2],
    [-5.4, 3.84, 7.2],
    [0, 3.84, 7.2],
    [5.4, 3.84, 7.2],
  ];

  lightPositions.forEach(([x, y, z]) => {
    const light = new THREE.PointLight(0xfff0d0, 1.1, 9, 1.8);
    light.position.set(x, roomY + y, z);
    scene.add(light);

    const fixture = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.28, 0.18, 24),
      new THREE.MeshStandardMaterial({
        color: 0xf0dfb7,
        roughness: 0.3,
        metalness: 0.35,
        emissive: 0x33250c,
      }),
    );
    fixture.position.set(x, roomY + y + 0.18, z);
    fixture.rotation.x = Math.PI;
    scene.add(fixture);
  });
}

const WALL_PLACEMENTS = [
  { axis: 'z', value: -10.82, rotationY: 0 },
  { axis: 'x', value: -8.82, rotationY: Math.PI / 2 },
  { axis: 'x', value: 8.82, rotationY: -Math.PI / 2 },
  { axis: 'z', value: 10.82, rotationY: Math.PI },
];

function placeExhibitOnWall(exhibit, { snapToWall = false } = {}) {
  let x = exhibit.positionX ?? 0;
  const y = exhibit.positionY ?? 2;
  let z = exhibit.positionZ ?? -10.82;

  const nearestWall = WALL_PLACEMENTS.reduce((nearest, wall) => {
    const distance = Math.abs((wall.axis === 'x' ? x : z) - wall.value);
    return distance < nearest.distance ? { wall, distance } : nearest;
  }, { wall: null, distance: Infinity });

  const indexedWall = WALL_PLACEMENTS[exhibit.wallIndex];
  const wall = nearestWall.distance <= 2 ? nearestWall.wall : indexedWall;
  const rotationY = wall?.rotationY ?? exhibit.rotationY ?? 0;

  if (snapToWall && wall) {
    if (wall.axis === 'x') x = wall.value;
    if (wall.axis === 'z') z = wall.value;
  }

  return { x, y, z, rotationY };
}

export default function GalleryScene({
  exhibits,
  roomConfig,
  onExhibitFocus,
  onProximityUpdate,
  onRoomChange,
  cameraTarget,
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const cssRendererRef = useRef(null);
  const focusRef = useRef(null);
  const onExhibitFocusRef = useRef(onExhibitFocus);
  const onProximityUpdateRef = useRef(onProximityUpdate);
  const onRoomChangeRef = useRef(onRoomChange);
  const cameraTargetRef = useRef(null);

  useEffect(() => {
    onExhibitFocusRef.current = onExhibitFocus;
  }, [onExhibitFocus]);

  useEffect(() => {
    onProximityUpdateRef.current = onProximityUpdate;
  }, [onProximityUpdate]);

  useEffect(() => {
    onRoomChangeRef.current = onRoomChange;
  }, [onRoomChange]);

  useEffect(() => {
    cameraTargetRef.current = cameraTarget;
  }, [cameraTarget]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.domElement.className = 'scene-canvas';
    container.appendChild(renderer.domElement);

    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(container.clientWidth, container.clientHeight);
    cssRenderer.domElement.className = 'scene-css3d';
    container.appendChild(cssRenderer.domElement);

    rendererRef.current = renderer;
    cssRendererRef.current = cssRenderer;

    const handleResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      cssRenderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      container.removeChild(cssRenderer.domElement);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const renderer = rendererRef.current;
    const cssRenderer = cssRendererRef.current;
    if (!container || !renderer || !exhibits) return;

    const cameraY = roomConfig?.cameraY ?? 1.6;
    const roomY = cameraY - 1.6;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111414);
    scene.fog = new THREE.Fog(0x111414, 18, 46);

    const camera = new THREE.PerspectiveCamera(
      72,
      container.clientWidth / container.clientHeight,
      0.1, 100,
    );
    const ct = cameraTargetRef.current;
    if (ct) {
      camera.position.set(ct.x, cameraY, ct.z);
    } else {
      camera.position.set(0, cameraY, 8.2);
    }

    buildRoom(scene, roomConfig, roomY);
    setupLighting(scene, roomConfig, roomY);

    const frames = [];
    const portalObjects = [];
    let yaw = ct ? ct.yaw : 0;
    let pitch = 0;

    const placeY = (posY) => (posY || 2) + roomY;

    exhibits.forEach((exhibit) => {
      const placement = placeExhibitOnWall(exhibit, {
        snapToWall: exhibit.type !== 'portal',
      });
      const ey = placeY(placement.y);
      if (exhibit.type === 'youtube' && exhibit.contentUrl) {
        const panel = createYouTubePanel(exhibit.contentUrl);
        panel.position.set(placement.x, ey, placement.z);
        panel.rotation.y = placement.rotationY;
        scene.add(panel);
        frames.push({ exhibit, object: panel, position: panel.position.clone() });
      } else if (exhibit.type === 'portal') {
        const portalGroup = createPortal({
          targetRoomId: exhibit.contentUrl,
          targetPosX: exhibit.portalTargetX,
          targetPosZ: exhibit.portalTargetZ,
          targetYaw: exhibit.portalTargetYaw,
        });
        portalGroup.position.set(placement.x, ey, placement.z);
        portalGroup.rotation.y = placement.rotationY;
        scene.add(portalGroup);
        portalObjects.push({
          title: exhibit.title,
          group: portalGroup,
          position: portalGroup.position.clone(),
          targetRoomId: exhibit.contentUrl,
          targetPosX: exhibit.portalTargetX,
          targetPosZ: exhibit.portalTargetZ,
          targetYaw: exhibit.portalTargetYaw,
          cooldown: 0,
        });
      } else {
        const frame = createExhibitFrame(exhibit);
        frame.position.set(placement.x, ey, placement.z);
        frame.rotation.y = placement.rotationY;
        scene.add(frame);
        frames.push({ exhibit, object: frame, position: frame.position.clone() });
      }
    });

    const docent = createDocent();
    camera.add(docent);
    scene.add(camera);

    const pressedKeys = new Set();
    const handleKeyDown = (event) => pressedKeys.add(event.key.toLowerCase());
    const handleKeyUp = (event) => pressedKeys.delete(event.key.toLowerCase());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const handleMouseMove = (event) => {
      if (document.pointerLockElement !== renderer.domElement) return;
      yaw -= event.movementX * 0.0022;
      pitch -= event.movementY * 0.0022;
      pitch = Math.max(-Math.PI / 2.6, Math.min(Math.PI / 2.6, pitch));
    };

    const handleCanvasClick = () => {
      renderer.domElement.requestPointerLock();
    };

    window.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleCanvasClick);

    const clock = new THREE.Clock();
    let animationId = 0;

    const _forward = new THREE.Vector3();
    const _right = new THREE.Vector3();
    const _up = new THREE.Vector3(0, 1, 0);
    const velocity = new THREE.Vector3();

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const deltaMs = delta * 1000;

      camera.quaternion.setFromEuler(
        new THREE.Euler(pitch, yaw, 0, 'YXZ'),
      );

      const forward = Number(pressedKeys.has('w') || pressedKeys.has('arrowup'))
        - Number(pressedKeys.has('s') || pressedKeys.has('arrowdown'));
      const strafe = Number(pressedKeys.has('d') || pressedKeys.has('arrowright'))
        - Number(pressedKeys.has('a') || pressedKeys.has('arrowleft'));

      const speed = pressedKeys.has('shiftleft') || pressedKeys.has('shiftright') ? 5.4 : 3.2;

      if (forward !== 0 || strafe !== 0) {
        _forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
        _forward.y = 0;
        _forward.normalize();
        _right.crossVectors(_forward, _up).normalize();

        velocity.x = _forward.x * forward * speed + _right.x * strafe * speed;
        velocity.z = _forward.z * forward * speed + _right.z * strafe * speed;
      } else {
        velocity.x = THREE.MathUtils.damp(velocity.x, 0, 9, delta);
        velocity.z = THREE.MathUtils.damp(velocity.z, 0, 9, delta);
      }

      camera.position.x += velocity.x * delta;
      camera.position.z += velocity.z * delta;

      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -8.2, 8.2);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -9.8, 9.8);

      docent.userData.update?.(clock.elapsedTime, delta);

      frames.forEach(({ object }) => {
        const s = object.userData?.gifState;
        if (!s || !s.active || !s.frames?.length) return;
        s.accum += deltaMs;
        if (s.accum >= s.frames[s.current].delay) {
          s.accum = 0;
          const prev = s.frames[s.current];
          s.current = (s.current + 1) % s.frames.length;
          const next = s.frames[s.current];
          const { left, top, width: fw, height: fh } = next.dims;

          if (prev.disposalType === 2 && prev.dims) {
            s.ctx.clearRect(prev.dims.left, prev.dims.top, prev.dims.width, prev.dims.height);
          }

          s.tempCanvas.width = fw;
          s.tempCanvas.height = fh;
          const imgData = s.tempCtx.createImageData(fw, fh);
          imgData.data.set(next.patch);
          s.tempCtx.putImageData(imgData, 0, 0);
          s.ctx.drawImage(s.tempCanvas, left, top);
          s.texture.needsUpdate = true;
        }
      });

      const nearbyExhibit = findNearbyExhibit(camera.position, frames);
      if (nearbyExhibit && focusRef.current !== nearbyExhibit.id) {
        focusRef.current = nearbyExhibit.id;
        onExhibitFocusRef.current?.(nearbyExhibit.id);
      }

      const nearest = findNearestExhibit(camera.position, frames);

      const elapsed = clock.elapsedTime;
      let nearestPortalDist = Infinity;
      let nearestPortalTitle = null;

      portalObjects.forEach((portal, index) => {
        portal.cooldown = Math.max(0, portal.cooldown - delta);

        portal.group.rotation.z = Math.sin(elapsed * 1.5 + index) * 0.035;
        const surfaceMat = portal.group.children[0].material;
        if (surfaceMat) {
          surfaceMat.opacity = 0.72 + Math.sin(elapsed * 3 + index) * 0.12;
          if (surfaceMat.map) {
            surfaceMat.map.rotation = elapsed * 0.12 + index;
          }
        }

        if (portal.cooldown > 0) return;

        const dist = camera.position.distanceTo(portal.group.position);
        if (dist < nearestPortalDist) {
          nearestPortalDist = dist;
          nearestPortalTitle = portal.title;
        }

        if (dist < 1.75) {
          portal.cooldown = 2;
          onRoomChangeRef.current?.(
            portal.targetRoomId,
            portal.targetPosX,
            portal.targetPosZ,
            portal.targetYaw,
          );
        }
      });

      if (nearestPortalTitle && nearestPortalDist < 3.2) {
        onProximityUpdateRef.current?.({
          exhibit: { title: nearestPortalTitle },
          distance: Math.round(nearestPortalDist * 10) / 10,
        });
      } else {
        onProximityUpdateRef.current?.(nearest);
      }

      renderer.render(scene, camera);
      cssRenderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    if (ct) {
      yaw = ct.yaw;
      pitch = 0;
    }

    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      scene.traverse((child) => {
        if (child.isCSS3DObject && child.element && child.element.parentNode) {
          child.element.parentNode.removeChild(child.element);
        }
        if (child.isMesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose?.());
          } else {
            child.material?.dispose?.();
          }
        }
      });
    };
  }, [exhibits, roomConfig]);

  return (
    <div ref={containerRef} className="scene-canvas">
      <div className="focus-reticle" aria-hidden="true" />
    </div>
  );
}
