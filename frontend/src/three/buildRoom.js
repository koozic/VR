/* 전시관의 방 구조(벽/바닥/천장/기둥)를 3D로 만드는 함수들 */

import * as THREE from 'three';
import { hexToThree } from './sceneUtils.js';

/* 그리스식 기둥 재질 (황토색 석재 느낌) */
const columnMat = new THREE.MeshStandardMaterial({
  color: 0xddd0c0,
  roughness: 0.45,
  metalness: 0.02,
});

/* 직육면체 상자를 하나 만들어 장면에 추가. 벽/바닥/천장을 만드는 기본 단위 */
function makeBox(scene, width, height, depth, material, position) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.copy(position);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);
}

/* 그리스/도리아식 기둥 한 개 생성 (받침 → 몸통 → 주두 → 아바쿠스) */
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

/* 전시관 타입별로 벽/바닥/천장 색상과 트림(테두리 장식)을 배치 */
export function buildRoom(scene, roomConfig, roomY) {
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
