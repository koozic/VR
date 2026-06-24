/* 전시관 타입별 조명 설정. 분위기에 따라 조명 색상/개수/위치가 달라짐 */

import * as THREE from 'three';
import { hexToThree } from './sceneUtils.js';

export function setupLighting(scene, roomConfig, roomY) {
  /* 우주 전시관: 은은한 청회색 조명 하나만 */
  if (Number(roomConfig?.id) === 2) {
    scene.add(new THREE.HemisphereLight(0x75849a, 0x10141b, 0.34));
    return;
  }

  const isHistoryGallery = Number(roomConfig?.id) === 3;
  const isRetroGallery = Number(roomConfig?.id) === 4;

  /* 레트로 게임관: 보라색 분위기 + 5개의 컬러 포인트 조명 */
  if (isRetroGallery) {
    scene.add(new THREE.HemisphereLight(0xb8a4ff, 0x2e163d, 0.92));
    scene.add(new THREE.AmbientLight(0x704090, 0.72));

    const fill = new THREE.DirectionalLight(0xffd8ff, 1.05);
    fill.position.set(-4, roomY + 7, 5);
    scene.add(fill);

    const roomFill = new THREE.PointLight(0xffd7ff, 1.55, 14, 1.55);
    roomFill.position.set(0, roomY + 3.8, 0);
    scene.add(roomFill);

    const coloredLights = [
      [-5.4, 3.6, -7.2, 0xff4080, 1.65],
      [5.4, 3.6, -7.2, 0x40a0ff, 1.65],
      [-5.4, 3.6, 7.2, 0xff40c0, 1.45],
      [5.4, 3.6, 7.2, 0x60ff80, 1.45],
      [0, 3.6, -7.2, 0xff80ff, 1.9],
      [0, 3.8, 3.5, 0xfff0c0, 1.6],
    ];
    coloredLights.forEach(([x, y, z, color, inten]) => {
      const light = new THREE.PointLight(color, inten, 10.5, 1.7);
      light.position.set(x, roomY + y, z);
      scene.add(light);
    });
    return;
  }

  /* 메인/역사관: 부드러운 전반 조명 + 그림자를 만드는 방향광 + 스포트라이트 */
  const ambientColor = hexToThree(roomConfig?.ambientLightColor);
  const intensity = roomConfig?.lightIntensity ?? 1.18;

  scene.add(new THREE.HemisphereLight(ambientColor, isHistoryGallery ? 0x3a2a1a : 0x26302d, intensity));

  /* 주광(Key Light): 왼쪽 위에서 비추어 그림자 생성 */
  const key = new THREE.DirectionalLight(isHistoryGallery ? 0xffe8c8 : 0xfff1d6, isHistoryGallery ? 0.9 : 1.3);
  const keyY = isHistoryGallery ? 6 : 8;
  key.position.set(-4.5, roomY + keyY, 5);
  key.castShadow = true;
  const shadowRes = isHistoryGallery ? 1024 : 2048;
  key.shadow.mapSize.set(shadowRes, shadowRes);
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
