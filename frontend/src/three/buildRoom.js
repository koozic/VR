/* Builds the 3D room shell: floor, walls, ceiling, trims, grid lines, and columns. */

import * as THREE from 'three';
import { hexToThree } from './sceneUtils.js';

const ROOM_THEMES = {
  2: {
    wall: 0x252a31,
    floor: 0x30363f,
    ceiling: 0x1b2027,
    wallEmissive: 'wall',
    wallEmissiveIntensity: 0.42,
    floorEmissive: 'floor',
    floorEmissiveIntensity: 0.34,
    ceilingEmissive: 'ceiling',
    ceilingEmissiveIntensity: 0.36,
    trim: 0x515b68,
    trimEmissive: 0x303b49,
    trimEmissiveIntensity: 0.5,
  },
  3: {
    wall: 0xc8bca8,
    floor: 0x9a8a78,
    ceiling: 0xb8ac98,
    wallEmissive: 0x1a1410,
    wallEmissiveIntensity: 0.06,
    floorEmissive: 0x14100a,
    floorEmissiveIntensity: 0.05,
    ceilingEmissive: 0x14100a,
    ceilingEmissiveIntensity: 0.04,
    trim: 0x6a5a48,
    trimEmissive: 0x1a1410,
    trimEmissiveIntensity: 0.08,
  },
  4: {
    wall: 0x3a1f50,
    floor: 0x241632,
    ceiling: 0x1b0d28,
    wallEmissive: 0x321748,
    wallEmissiveIntensity: 0.62,
    floorEmissive: 0x211030,
    floorEmissiveIntensity: 0.52,
    ceilingEmissive: 0x1c0b2a,
    ceilingEmissiveIntensity: 0.42,
    trim: 0x623090,
    trimEmissive: 0x4a2470,
    trimEmissiveIntensity: 0.78,
  },
};

const columnMat = new THREE.MeshStandardMaterial({
  color: 0xddd0c0,
  roughness: 0.45,
  metalness: 0.02,
});

function getTheme(roomConfig) {
  const roomId = Number(roomConfig?.id);
  const preset = ROOM_THEMES[roomId];

  if (preset) {
    return {
      ...preset,
      id: roomId,
      wallEmissive: preset.wallEmissive === 'wall' ? preset.wall : preset.wallEmissive,
      floorEmissive: preset.floorEmissive === 'floor' ? preset.floor : preset.floorEmissive,
      ceilingEmissive:
        preset.ceilingEmissive === 'ceiling' ? preset.ceiling : preset.ceilingEmissive,
    };
  }

  return {
    id: roomId,
    wall: hexToThree(roomConfig?.wallColor),
    floor: hexToThree(roomConfig?.floorColor),
    ceiling: hexToThree(roomConfig?.ceilingColor),
    wallEmissive: 0x000000,
    wallEmissiveIntensity: 0,
    floorEmissive: 0x000000,
    floorEmissiveIntensity: 0,
    ceilingEmissive: 0x000000,
    ceilingEmissiveIntensity: 0,
    trim: 0x242826,
    trimEmissive: 0x000000,
    trimEmissiveIntensity: 0,
  };
}

function makeBox(scene, width, height, depth, material, position) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.copy(position);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);
}

function createGreekColumn(topY = 4.33) {
  const group = new THREE.Group();
  const heightOffset = topY - 4.33;
  const shaftHeight = 4.0 + heightOffset;

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.1, 20), columnMat);
  base.position.y = 0.05;
  group.add(base);

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, shaftHeight, 20), columnMat);
  shaft.position.y = 2.1 + heightOffset / 2;
  group.add(shaft);

  const echinus = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.16, 20), columnMat);
  echinus.position.y = 4.18 + heightOffset;
  group.add(echinus);

  const abacus = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.42), columnMat);
  abacus.position.y = 4.29 + heightOffset;
  group.add(abacus);

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return group;
}

export function buildRoom(scene, roomConfig, roomY) {
  const theme = getTheme(roomConfig);
  const isHistoryGallery = theme.id === 3;
  const ceilingBottomY = isHistoryGallery ? 6.0 : 4.33;
  const ceilingCenterY = ceilingBottomY + 0.09;
  const wallHeight = ceilingBottomY + 0.17;
  const wallCenterY = (ceilingBottomY - 0.1) / 2;
  const upperTrimY = ceilingBottomY - 0.41;

  const wallMat = new THREE.MeshStandardMaterial({
    color: theme.wall,
    roughness: 0.82,
    emissive: theme.wallEmissive,
    emissiveIntensity: theme.wallEmissiveIntensity,
  });
  const floorMat = new THREE.MeshStandardMaterial({
    color: theme.floor,
    roughness: 0.88,
    metalness: 0.02,
    emissive: theme.floorEmissive,
    emissiveIntensity: theme.floorEmissiveIntensity,
  });
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: theme.ceiling,
    roughness: 0.82,
    emissive: theme.ceilingEmissive,
    emissiveIntensity: theme.ceilingEmissiveIntensity,
  });
  const darkTrim = new THREE.MeshStandardMaterial({
    color: theme.trim,
    roughness: 0.65,
    emissive: theme.trimEmissive,
    emissiveIntensity: theme.trimEmissiveIntensity,
  });

  const off = (x, y, z) => new THREE.Vector3(x, roomY + y, z);

  makeBox(scene, 18, 0.18, 22, floorMat, off(0, -0.09, 0));
  makeBox(scene, 18, 0.18, 22, ceilingMat, off(0, ceilingCenterY, 0));
  makeBox(scene, 18, wallHeight, 0.22, wallMat, off(0, wallCenterY, -11));
  makeBox(scene, 18, wallHeight, 0.22, wallMat, off(0, wallCenterY, 11));
  makeBox(scene, 0.22, wallHeight, 22, wallMat, off(-9, wallCenterY, 0));
  makeBox(scene, 0.22, wallHeight, 22, wallMat, off(9, wallCenterY, 0));

  const trims = [
    [18, 0.12, 0.16, 0, 0.24, -10.84],
    [18, 0.12, 0.16, 0, 0.24, 10.84],
    [0.16, 0.12, 22, -8.84, 0.24, 0],
    [0.16, 0.12, 22, 8.84, 0.24, 0],
    [18, 0.1, 0.12, 0, upperTrimY, -10.83],
    [18, 0.1, 0.12, 0, upperTrimY, 10.83],
    [0.12, 0.1, 22, -8.83, upperTrimY, 0],
    [0.12, 0.1, 22, 8.83, upperTrimY, 0],
  ];
  trims.forEach(([width, height, depth, x, y, z]) => {
    makeBox(scene, width, height, depth, darkTrim, off(x, y, z));
  });

  const step = 3.5;
  for (let i = -7; i <= 7; i += step) {
    makeBox(scene, 0.04, 0.012, 21.6, darkTrim, off(i, 0.012, 0));
    makeBox(scene, 17.6, 0.012, 0.04, darkTrim, off(0, 0.014, i));
  }

  if (isHistoryGallery) {
    [-8, 8].forEach((x) => {
      [-5.5, 5.5].forEach((z) => {
        const column = createGreekColumn(ceilingBottomY);
        column.position.set(x, roomY, z);
        scene.add(column);
      });
    });
    [-10, 10].forEach((z) => {
      [-5.5, 5.5].forEach((x) => {
        const column = createGreekColumn(ceilingBottomY);
        column.position.set(x, roomY, z);
        scene.add(column);
      });
    });
  }
}
