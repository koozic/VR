import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { createExhibitFrame } from './createExhibitFrame.js';
import { createYouTubePanel } from './createYouTubePanel.js';
import { createGamePanel } from './createGamePanel.js';
import { createPortal } from './createPortal.js';
import { createDocent } from './createDocent.js';
import { createSolarSystem } from './createSolarSystem.js';
import { createSpaceShuttle } from './createSpaceShuttle.js';
import { createAstronaut } from './createAstronaut.js';
import { createGeminiSpacesuit } from './createGeminiSpacesuit.js';
import { createMarsRover } from './createMarsRover.js';
import { createRocket } from './createRocket.js';

import { createSatellite } from './createSatellite.js';
import { createUFO } from './createUFO.js';
import { createBlackHole } from './createBlackHole.js';
import { spaceGalleryModels } from './spaceGalleryDescriptions.js';
import { greekSculptureModels } from './greekSculptureDescriptions.js';
import { createGreekSculpture } from './createGreekSculpture.js';
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

const columnMat = new THREE.MeshStandardMaterial({
  color: 0xddd0c0,
  roughness: 0.45,
  metalness: 0.02,
});

function createGreekColumn() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.1, 20), columnMat);
  base.position.y = 0.05;
  g.add(base);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 4.0, 20), columnMat);
  shaft.position.y = 2.1;
  g.add(shaft);
  const echinus = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.16, 20), columnMat);
  echinus.position.y = 4.18;
  g.add(echinus);
  const abacus = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.42), columnMat);
  abacus.position.y = 4.29;
  g.add(abacus);
  g.traverse((child) => {
    if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
  });
  return g;
}

function createRemoteVisitor(user) {
  const group = new THREE.Group();
  group.name = `remote-${user.userId}`;

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 0.92, 16),
    new THREE.MeshStandardMaterial({
      color: 0x5ec8ff,
      roughness: 0.48,
      emissive: 0x10394a,
      emissiveIntensity: 0.28,
    }),
  );
  body.position.y = 0.62;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xf2f5ef,
      roughness: 0.42,
      emissive: 0x202c35,
      emissiveIntensity: 0.16,
    }),
  );
  head.position.y = 1.22;
  head.castShadow = true;
  group.add(head);

  const direction = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.28, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffcf66,
      roughness: 0.38,
      emissive: 0x5a3600,
      emissiveIntensity: 0.2,
    }),
  );
  direction.position.set(0, 1.2, -0.28);
  direction.rotation.x = Math.PI / 2;
  group.add(direction);

  return group;
}

function disposeObject(object) {
  object.traverse((child) => {
    if (!child.isMesh) return;
    child.geometry?.dispose();
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => material.dispose?.());
    } else {
      child.material?.dispose?.();
    }
  });
}

function offsetNearbyRemoteUser(userId, target, localPosition) {
  const flatDistance = localPosition
    ? Math.hypot(target.x - localPosition.x, target.z - localPosition.z)
    : Infinity;
  if (flatDistance >= 0.9) {
    return target;
  }

  const hash = Array.from(userId || 'visitor').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const angle = (hash % 360) * (Math.PI / 180);
  target.x += Math.cos(angle) * 1.15;
  target.z += Math.sin(angle) * 1.15;
  return target;
}

function syncRemoteVisitors(scene, objectMap, users, localPosition) {
  const seen = new Set();

  users.forEach((user) => {
    seen.add(user.userId);
    let object = objectMap.get(user.userId);
    if (!object) {
      object = createRemoteVisitor(user);
      objectMap.set(user.userId, object);
      scene.add(object);
    }

    const targetY = Math.max(0.05, (user.y ?? 1.6) - 1.35);
    const target = offsetNearbyRemoteUser(
      user.userId,
      new THREE.Vector3(user.x ?? 0, targetY, user.z ?? 0),
      localPosition,
    );
    object.position.lerp(target, 0.32);
    object.rotation.y = user.yaw ?? 0;
  });

  objectMap.forEach((object, userId) => {
    if (seen.has(userId)) return;
    scene.remove(object);
    disposeObject(object);
    objectMap.delete(userId);
  });
}

function buildRoom(scene, roomConfig, roomY) {
  const isSpaceGallery = Number(roomConfig?.id) === 2;
  const isHistoryGallery = Number(roomConfig?.id) === 3;
  const isRetroGallery = Number(roomConfig?.id) === 4;
  const wallColor = isSpaceGallery ? 0x252a31 : isHistoryGallery ? 0xc8bca8 : isRetroGallery ? 0x180a20 : hexToThree(roomConfig?.wallColor);
  const floorColor = isSpaceGallery ? 0x30363f : isHistoryGallery ? 0x9a8a78 : isRetroGallery ? 0x0d0810 : hexToThree(roomConfig?.floorColor);
  const ceilingColor = isSpaceGallery ? 0x1b2027 : isHistoryGallery ? 0xb8ac98 : isRetroGallery ? 0x0a0410 : hexToThree(roomConfig?.ceilingColor);

  const wallMat = new THREE.MeshStandardMaterial({
    color: wallColor,
    roughness: 0.82,
    emissive: isSpaceGallery ? wallColor : isHistoryGallery ? 0x1a1410 : isRetroGallery ? 0x0f0418 : 0x000000,
    emissiveIntensity: isSpaceGallery ? 0.42 : isHistoryGallery ? 0.06 : isRetroGallery ? 0.3 : 0,
  });
  const floorMat = new THREE.MeshStandardMaterial({
    color: floorColor,
    roughness: 0.88,
    metalness: 0.02,
    emissive: isSpaceGallery ? floorColor : isHistoryGallery ? 0x14100a : isRetroGallery ? 0x080210 : 0x000000,
    emissiveIntensity: isSpaceGallery ? 0.34 : isHistoryGallery ? 0.05 : isRetroGallery ? 0.25 : 0,
  });
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: ceilingColor,
    roughness: 0.82,
    emissive: isSpaceGallery ? ceilingColor : isHistoryGallery ? 0x14100a : isRetroGallery ? 0x080210 : 0x000000,
    emissiveIntensity: isSpaceGallery ? 0.36 : isHistoryGallery ? 0.04 : isRetroGallery ? 0.2 : 0,
  });
  const darkTrim = new THREE.MeshStandardMaterial({
    color: isSpaceGallery ? 0x515b68 : isHistoryGallery ? 0x6a5a48 : isRetroGallery ? 0x402060 : 0x242826,
    roughness: 0.65,
    emissive: isSpaceGallery ? 0x303b49 : isHistoryGallery ? 0x1a1410 : isRetroGallery ? 0x301848 : 0x000000,
    emissiveIntensity: isSpaceGallery ? 0.5 : isHistoryGallery ? 0.08 : isRetroGallery ? 0.6 : 0,
  });

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

  if (isHistoryGallery) {
    [-8, 8].forEach((x) => {
      [-5.5, 5.5].forEach((z) => {
        const col = createGreekColumn();
        col.position.set(x, roomY, z);
        scene.add(col);
      });
    });
    [-10, 10].forEach((z) => {
      [-5.5, 5.5].forEach((x) => {
        const col = createGreekColumn();
        col.position.set(x, roomY, z);
        scene.add(col);
      });
    });
  }
}

function setupLighting(scene, roomConfig, roomY) {
  if (Number(roomConfig?.id) === 2) {
    scene.add(new THREE.HemisphereLight(0x75849a, 0x10141b, 0.34));
    return;
  }

  const isHistoryGallery = Number(roomConfig?.id) === 3;
  const isRetroGallery = Number(roomConfig?.id) === 4;

  if (isRetroGallery) {
    scene.add(new THREE.HemisphereLight(0x403060, 0x0a0410, 0.3));
    scene.add(new THREE.AmbientLight(0x201030, 0.25));

    const coloredLights = [
      [-5.4, 3.6, -7.2, 0xff4080, 1.2],
      [5.4, 3.6, -7.2, 0x40a0ff, 1.2],
      [-5.4, 3.6, 7.2, 0xff40c0, 1.0],
      [5.4, 3.6, 7.2, 0x60ff80, 1.0],
      [0, 3.6, -7.2, 0xff80ff, 1.4],
    ];
    coloredLights.forEach(([x, y, z, color, inten]) => {
      const light = new THREE.PointLight(color, inten, 8, 1.8);
      light.position.set(x, roomY + y, z);
      scene.add(light);
    });
    return;
  }

  const ambientColor = hexToThree(roomConfig?.ambientLightColor);
  const intensity = roomConfig?.lightIntensity ?? 1.18;

  scene.add(new THREE.HemisphereLight(ambientColor, isHistoryGallery ? 0x3a2a1a : 0x26302d, intensity));

  const key = new THREE.DirectionalLight(isHistoryGallery ? 0xffe8c8 : 0xfff1d6, isHistoryGallery ? 0.9 : 1.3);
  const keyY = isHistoryGallery ? 6 : 8;
  key.position.set(-4.5, roomY + keyY, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 50;
  key.shadow.camera.left = -12;
  key.shadow.camera.right = 12;
  key.shadow.camera.top = 14;
  key.shadow.camera.bottom = -14;
  scene.add(key);

  const lightPositions = isHistoryGallery
    ? [
        [-5.4, 3.6, -7.2],
        [0, 3.6, -7.2],
        [5.4, 3.6, -7.2],
      ]
    : [
        [-5.4, 3.84, -7.2],
        [0, 3.84, -7.2],
        [5.4, 3.84, -7.2],
        [-5.4, 3.84, 7.2],
        [0, 3.84, 7.2],
        [5.4, 3.84, 7.2],
      ];

  lightPositions.forEach(([x, y, z]) => {
    const lightColor = isHistoryGallery ? 0xffdbb8 : 0xfff0d0;
    const light = new THREE.PointLight(lightColor, isHistoryGallery ? 0.7 : 1.1, 9, 1.8);
    light.position.set(x, roomY + y, z);
    scene.add(light);

    const fixtureMat = isHistoryGallery
      ? new THREE.MeshStandardMaterial({
          color: 0xb8a088,
          roughness: 0.5,
          metalness: 0.15,
          emissive: 0x2a1a0a,
        })
      : new THREE.MeshStandardMaterial({
          color: 0xf0dfb7,
          roughness: 0.3,
          metalness: 0.35,
          emissive: 0x33250c,
        });

    const fixture = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.28, 0.18, 24),
      fixtureMat,
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
  remoteUsers = [],
  onLocalPoseChange,
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const cssRendererRef = useRef(null);
  const focusRef = useRef(null);
  const onExhibitFocusRef = useRef(onExhibitFocus);
  const onProximityUpdateRef = useRef(onProximityUpdate);
  const onRoomChangeRef = useRef(onRoomChange);
  const onLocalPoseChangeRef = useRef(onLocalPoseChange);
  const cameraTargetRef = useRef(null);
  const remoteUsersRef = useRef(remoteUsers);

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
    onLocalPoseChangeRef.current = onLocalPoseChange;
  }, [onLocalPoseChange]);

  useEffect(() => {
    remoteUsersRef.current = remoteUsers;
  }, [remoteUsers]);

  useEffect(() => {
    cameraTargetRef.current = cameraTarget;
  }, [cameraTarget]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.domElement.className = 'scene-webgl';
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
    const isSpaceGallery = Number(roomConfig?.id) === 2;
    const isHistoryGallery = Number(roomConfig?.id) === 3;
    const isRetroGallery = Number(roomConfig?.id) === 4;
    renderer.toneMappingExposure = isSpaceGallery ? 0.78 : isHistoryGallery ? 0.95 : isRetroGallery ? 0.7 : 1.04;
    scene.background = new THREE.Color(isSpaceGallery ? 0x080b11 : isHistoryGallery ? 0x1a1510 : isRetroGallery ? 0x08040c : 0x111414);
    scene.fog = new THREE.Fog(isSpaceGallery ? 0x080b11 : isHistoryGallery ? 0x1a1510 : isRetroGallery ? 0x08040c : 0x111414, 14, 36);

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
    const retroGameFrames = [];
    const portalObjects = [];
    const remoteUserObjects = new Map();
    const solarSystem = isSpaceGallery ? createSolarSystem() : null;
    const spaceShuttle = isSpaceGallery ? createSpaceShuttle() : null;
    const astronaut = isSpaceGallery ? createAstronaut() : null;
    const geminiSpacesuit = isSpaceGallery ? createGeminiSpacesuit() : null;
    const marsRover = isSpaceGallery ? createMarsRover() : null;
    const rocket = isSpaceGallery ? createRocket() : null;

    const satellite = isSpaceGallery ? createSatellite() : null;
    const ufo = isSpaceGallery ? createUFO() : null;
    const blackHole = isSpaceGallery ? createBlackHole() : null;
    if (solarSystem) scene.add(solarSystem);
    if (spaceShuttle) scene.add(spaceShuttle);
    if (astronaut) scene.add(astronaut);
    if (geminiSpacesuit) scene.add(geminiSpacesuit);
    if (marsRover) scene.add(marsRover);
    if (rocket) scene.add(rocket);

    if (satellite) scene.add(satellite);
    if (ufo) scene.add(ufo);
    if (blackHole) scene.add(blackHole);

    const greekStatuePositions = [
      new THREE.Vector3(-6.5, 0, -7.0),
      new THREE.Vector3(6.5, 0, -7.0),
      new THREE.Vector3(0.0, 0, 0.0),
      new THREE.Vector3(-6.5, 0, 7.0),
      new THREE.Vector3(6.5, 0, 7.0),
    ];

    const greekStatueOptions = [
      { pedestalDiameter: 1.5, loadDelay: 0 },
      { noPedestal: true, scale: 1.5, loadDelay: 300 },
      { noPedestal: true, yaw: -Math.PI / 2, pedestalDiameter: 1.5, loadDelay: 600 },
      { pedestalDiameter: 1.5, loadDelay: 900 },
      { pedestalDiameter: 1.5, loadDelay: 1200 },
    ];

    const greekStatues = isHistoryGallery
      ? greekSculptureModels.map((model, i) => {
          const pos = greekStatuePositions[i] || new THREE.Vector3(0, 0, 0);
          return createGreekSculpture(model.id, pos, greekStatueOptions[i] || { pedestalDiameter: 1.5 });
        })
      : [];

    greekStatues.forEach((statue) => {
      if (statue) scene.add(statue);
    });

    const spaceModelFrames = isSpaceGallery ? [
      { exhibit: { ...spaceGalleryModels[0], id: 'model-solar-system' }, position: solarSystem.position.clone() },
      { exhibit: { ...spaceGalleryModels[1], id: 'model-space-shuttle' }, position: spaceShuttle.position.clone() },
      { exhibit: { ...spaceGalleryModels[2], id: 'model-astronaut' }, position: astronaut.position.clone() },
      { exhibit: { ...spaceGalleryModels[3], id: 'model-gemini-spacesuit' }, position: geminiSpacesuit.position.clone() },
      { exhibit: { ...spaceGalleryModels[4], id: 'model-mars-rover' }, position: marsRover.position.clone() },
      { exhibit: { ...spaceGalleryModels[5], id: 'model-rocket' }, position: rocket.position.clone() },

      { exhibit: { ...spaceGalleryModels[7], id: 'model-satellite' }, position: satellite.position.clone() },
      { exhibit: { ...spaceGalleryModels[8], id: 'model-ufo' }, position: ufo.position.clone() },
      { exhibit: { ...spaceGalleryModels[9], id: 'model-black-hole' }, position: blackHole.position.clone() },
    ] : [];

    const greekModelFrames = isHistoryGallery
      ? greekStatues.map((statue, i) => ({
          exhibit: { ...greekSculptureModels[i], id: `model-${greekSculptureModels[i].id}` },
          position: statue.position.clone(),
        }))
      : [];

    let yaw = ct ? ct.yaw : 0;
    let pitch = 0;

    const placeY = (posY) => (posY || 2) + roomY;

    exhibits.forEach((exhibit) => {
      if ((isSpaceGallery || isHistoryGallery) && exhibit.type !== 'portal') return;
      if (isRetroGallery && exhibit.type !== 'portal' && exhibit.type !== 'game') return;

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
      } else if (exhibit.type === 'game' && exhibit.contentUrl) {
        const panel = createGamePanel(exhibit);
        panel.position.set(placement.x, ey, placement.z);
        panel.rotation.y = placement.rotationY;
        panel.translateZ(-0.03);
        scene.add(panel);
        const entry = { exhibit, object: panel, position: panel.position.clone() };
        if (isRetroGallery) retroGameFrames.push(entry);
        frames.push(entry);
      } else if (exhibit.type === 'portal') {
        const portalGroup = createPortal({
          targetRoomId: exhibit.contentUrl,
          targetPosX: exhibit.portalTargetX,
          targetPosZ: exhibit.portalTargetZ,
          targetYaw: exhibit.portalTargetYaw,
          portalColor: exhibit.portalColor,
          ringColor: exhibit.ringColor,
          ringEmissive: exhibit.ringEmissive,
          glowColor: exhibit.glowColor,
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
      onLocalPoseChangeRef.current?.({
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        yaw,
      });
      syncRemoteVisitors(scene, remoteUserObjects, remoteUsersRef.current, camera.position);

      docent.userData.update?.(clock.elapsedTime, delta);
      solarSystem?.userData.update?.(clock.elapsedTime, delta);
      spaceShuttle?.userData.update?.(clock.elapsedTime, delta);
      astronaut?.userData.update?.(clock.elapsedTime, delta);
      geminiSpacesuit?.userData.update?.(clock.elapsedTime, delta);
      marsRover?.userData.update?.(clock.elapsedTime, delta);
      rocket?.userData.update?.(clock.elapsedTime, delta);

      satellite?.userData.update?.(clock.elapsedTime, delta);
      ufo?.userData.update?.(clock.elapsedTime, delta);
      blackHole?.userData.update?.(clock.elapsedTime, delta);

      greekStatues.forEach((statue) => {
        statue?.userData.update?.(clock.elapsedTime, delta);
      });

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

      const _cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const nearbyExhibit = findNearbyExhibit(camera.position, frames, 3.2, _cameraForward);
      const nearbyModel = findNearbyExhibit(camera.position, [...spaceModelFrames, ...greekModelFrames], 4.5, _cameraForward);
      const nearbyRetroGame = isRetroGallery ? findNearbyExhibit(camera.position, retroGameFrames, 4.5, _cameraForward) : null;
      const focusTarget = nearbyExhibit || nearbyModel || nearbyRetroGame;
      if (focusTarget && focusRef.current !== focusTarget.id) {
        focusRef.current = focusTarget.id;
        onExhibitFocusRef.current?.(focusTarget.id);
      }

      const nearest = findNearestExhibit(camera.position, [...frames, ...spaceModelFrames, ...greekModelFrames, ...retroGameFrames]);

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
