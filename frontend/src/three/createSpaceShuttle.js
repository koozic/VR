/* NASA 우주왕복선 GLB 모델을 로드하고 배기구 중심으로 받침대 정렬 */
import * as THREE from 'three';
import { loadGltfScene } from './assetLoader.js';
import { assetUrl } from './assetUrl.js';

const SHUTTLE_MODEL_URL = assetUrl('assets/space-shuttle/space-shuttle.glb');
const SHUTTLE_EXHIBIT_POSITION = new THREE.Vector3(5.35, 0, 9.1);

function createPedestal(diameter) {
  const pedestal = new THREE.Group();
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x202a36,
    roughness: 0.72,
    metalness: 0.2,
    emissive: 0x0c1623,
    emissiveIntensity: 0.5,
  });

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(diameter * 0.46, diameter * 0.5, 0.22, 48),
    baseMaterial,
  );
  base.position.y = 0.11;
  pedestal.add(base);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(diameter * 0.465, diameter * 0.015, 12, 64),
    new THREE.MeshBasicMaterial({ color: 0x638cb8 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.24;
  pedestal.add(rim);

  return pedestal;
}

function findExhaustCenter(shuttle, bounds) {
  const size = bounds.getSize(new THREE.Vector3());
  const rearLimit = bounds.min.x + size.x * 0.16;
  const upperLimit = bounds.min.z + size.z * 0.62;
  const exhaustBounds = new THREE.Box3();
  const point = new THREE.Vector3();

  shuttle.traverse((child) => {
    const position = child.geometry?.getAttribute?.('position');
    if (!position) return;

    for (let index = 0; index < position.count; index += 1) {
      point.fromBufferAttribute(position, index);
      if (point.x <= rearLimit && point.z <= upperLimit) exhaustBounds.expandByPoint(point);
    }
  });

  return exhaustBounds.isEmpty()
    ? bounds.getCenter(new THREE.Vector3())
    : exhaustBounds.getCenter(new THREE.Vector3());
}

function brightenMaterial(material) {
  if (!material?.isMeshStandardMaterial) return;
  material.emissive.setHex(0x182431);
  material.emissiveIntensity = 0.28;
}

export function createSpaceShuttle() {
  const exhibit = new THREE.Group();
  exhibit.name = 'nasa-space-shuttle-exhibit';
  exhibit.position.copy(SHUTTLE_EXHIBIT_POSITION);
  exhibit.rotation.y = Math.atan2(-SHUTTLE_EXHIBIT_POSITION.x, -SHUTTLE_EXHIBIT_POSITION.z);

  const shuttleMount = new THREE.Group();
  const shuttleBaseY = 0.035;
  shuttleMount.position.set(0, shuttleBaseY, 0);
  shuttleMount.rotation.set(0.04, 0, Math.PI / 2);
  exhibit.add(shuttleMount);

  const keyLight = new THREE.SpotLight(0xc8e4ff, 9, 12, Math.PI / 5, 0.5, 1.4);
  keyLight.position.set(2.4, 4.2, 2.6);
  keyLight.target.position.set(0, 1.15, 0);
  exhibit.add(keyLight, keyLight.target);

  const fillLight = new THREE.PointLight(0x9bc9ff, 4.5, 8, 1.4);
  fillLight.position.set(-1.6, 2.7, 1.4);
  exhibit.add(fillLight);

  loadGltfScene(SHUTTLE_MODEL_URL)
    .then((shuttle) => {
      if (!shuttleMount.parent) return;
      const bounds = new THREE.Box3().setFromObject(shuttle);
      const size = bounds.getSize(new THREE.Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z);
      const normalizedScale = maxAxis > 0 ? 4.2 / maxAxis : 1;
      const pedestalDiameter = size.y * normalizedScale * 1.15;
      const exhaustCenter = findExhaustCenter(shuttle, bounds);

      exhibit.add(createPedestal(pedestalDiameter));
      shuttle.position.set(
        -exhaustCenter.x * normalizedScale,
        -exhaustCenter.y * normalizedScale,
        -exhaustCenter.z * normalizedScale,
      );
      shuttle.scale.setScalar(normalizedScale);
      shuttle.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(brightenMaterial);
        }
      });

      shuttleMount.add(shuttle);
    })
    .catch((error) => {
      console.error('Failed to load NASA space shuttle model:', error);
    });

  exhibit.userData.collisionRadius = 1.0; // 충돌 감지용 반지름

  exhibit.userData.update = (elapsed) => {
    shuttleMount.position.y = shuttleBaseY + Math.sin(elapsed * 0.7) * 0.035;
  };

  return exhibit;
}
