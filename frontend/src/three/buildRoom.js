/* Builds the 3D room shell: floor, walls, ceiling, trims, grid lines, and columns. */

import * as THREE from 'three';
import { hexToThree } from './sceneUtils.js';

const BOX_GEOMETRIES = new Map();
const COLUMN_GEOMETRIES = {
  base: new THREE.CylinderGeometry(0.3, 0.35, 0.1, 20),
  shaft: new THREE.CylinderGeometry(0.2, 0.25, 4.0, 20),
  echinus: new THREE.CylinderGeometry(0.3, 0.22, 0.16, 20),
  abacus: new THREE.BoxGeometry(0.42, 0.08, 0.42),
};

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
    wall: 0x180a20,
    floor: 0x0d0810,
    ceiling: 0x0a0410,
    wallEmissive: 0x0f0418,
    wallEmissiveIntensity: 0.3,
    floorEmissive: 0x080210,
    floorEmissiveIntensity: 0.25,
    ceilingEmissive: 0x080210,
    ceilingEmissiveIntensity: 0.2,
    trim: 0x402060,
    trimEmissive: 0x301848,
    trimEmissiveIntensity: 0.6,
  },
};

const columnMat = new THREE.MeshStandardMaterial({
  color: 0xddd0c0,
  roughness: 0.45,
  metalness: 0.02,
});
const matrix = new THREE.Matrix4();

function getBoxGeometry(width, height, depth) {
  const key = `${width}:${height}:${depth}`;
  let geometry = BOX_GEOMETRIES.get(key);
  if (!geometry) {
    geometry = new THREE.BoxGeometry(width, height, depth);
    BOX_GEOMETRIES.set(key, geometry);
  }
  return geometry;
}

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
  const mesh = new THREE.Mesh(getBoxGeometry(width, height, depth), material);
  mesh.position.copy(position);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);
}

function makeInstancedBoxes(scene, boxes, material, roomY) {
  const groups = new Map();

  boxes.forEach(([width, height, depth, x, y, z]) => {
    const key = `${width}:${height}:${depth}`;
    const group = groups.get(key) || { width, height, depth, positions: [] };
    group.positions.push([x, roomY + y, z]);
    groups.set(key, group);
  });

  groups.forEach(({ width, height, depth, positions }) => {
    const mesh = new THREE.InstancedMesh(
      getBoxGeometry(width, height, depth),
      material,
      positions.length,
    );
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    positions.forEach(([x, y, z], index) => {
      matrix.makeTranslation(x, y, z);
      mesh.setMatrixAt(index, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);
  });
}

function createGreekColumn() {
  const group = new THREE.Group();

  const base = new THREE.Mesh(COLUMN_GEOMETRIES.base, columnMat);
  base.position.y = 0.05;
  group.add(base);

  const shaft = new THREE.Mesh(COLUMN_GEOMETRIES.shaft, columnMat);
  shaft.position.y = 2.1;
  group.add(shaft);

  const echinus = new THREE.Mesh(COLUMN_GEOMETRIES.echinus, columnMat);
  echinus.position.y = 4.18;
  group.add(echinus);

  const abacus = new THREE.Mesh(COLUMN_GEOMETRIES.abacus, columnMat);
  abacus.position.y = 4.29;
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
  makeInstancedBoxes(scene, trims, darkTrim, roomY);

  const step = 3.5;
  const floorGrid = [];
  for (let i = -7; i <= 7; i += step) {
    floorGrid.push([0.04, 0.012, 21.6, i, 0.012, 0]);
    floorGrid.push([17.6, 0.012, 0.04, 0, 0.014, i]);
  }
  makeInstancedBoxes(scene, floorGrid, darkTrim, roomY);

  if (isHistoryGallery) {
    [-8, 8].forEach((x) => {
      [-5.5, 5.5].forEach((z) => {
        const column = createGreekColumn();
        column.position.set(x, roomY, z);
        scene.add(column);
      });
    });
    [-10, 10].forEach((z) => {
      [-5.5, 5.5].forEach((x) => {
        const column = createGreekColumn();
        column.position.set(x, roomY, z);
        scene.add(column);
      });
    });
  }
}
