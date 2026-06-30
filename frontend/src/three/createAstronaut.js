/* NASA 우주인 EVA 우주복 3D 모델을 GLB로 로드하고 받침대에 배치 */
import * as THREE from 'three';
import { loadGltfScene } from './assetLoader.js';
import { assetUrl } from './assetUrl.js';

const ASTRONAUT_MODEL_URL = assetUrl('assets/astronaut/astronaut.glb');
const ASTRONAUT_EXHIBIT_POSITION = new THREE.Vector3(3.2, 0, 10.0);

function createPedestal() {
  const pedestal = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.82, 0.18, 40),
    new THREE.MeshStandardMaterial({
      color: 0x222d39,
      roughness: 0.72,
      metalness: 0.18,
      emissive: 0x0c1725,
      emissiveIntensity: 0.48,
    }),
  );
  base.position.y = 0.09;
  pedestal.add(base);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.75, 0.025, 10, 48),
    new THREE.MeshBasicMaterial({ color: 0x82a9ce }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.19;
  pedestal.add(rim);
  return pedestal;
}

function brightenMaterial(material) {
  if (!material?.isMeshStandardMaterial) return;
  material.emissive.setHex(0x182938);
  material.emissiveIntensity = 0.28;
}

export function createAstronaut() {
  const exhibit = new THREE.Group();
  exhibit.name = 'nasa-astronaut-exhibit';
  exhibit.position.copy(ASTRONAUT_EXHIBIT_POSITION);
  exhibit.rotation.y = Math.atan2(-ASTRONAUT_EXHIBIT_POSITION.x, -ASTRONAUT_EXHIBIT_POSITION.z);
  exhibit.add(createPedestal());

  const astronautMount = new THREE.Group();
  astronautMount.position.y = 0.22;
  exhibit.add(astronautMount);

  const keyLight = new THREE.SpotLight(0xd7ebff, 5.5, 7, Math.PI / 5, 0.52, 1.4);
  keyLight.position.set(1.6, 3.3, 1.8);
  keyLight.target.position.set(0, 1.15, 0);
  exhibit.add(keyLight, keyLight.target);

  const fillLight = new THREE.PointLight(0xb6d8ff, 7, 5.5, 1.35);
  fillLight.position.set(-0.7, 1.8, -1.15);
  exhibit.add(fillLight);

  loadGltfScene(ASTRONAUT_MODEL_URL)
    .then((astronaut) => {
      if (!astronautMount.parent) return;
      const bounds = new THREE.Box3().setFromObject(astronaut);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const normalizedScale = size.y > 0 ? 2.25 / size.y : 1;

      astronaut.position.set(
        -center.x * normalizedScale,
        -bounds.min.y * normalizedScale,
        -center.z * normalizedScale,
      );
      astronaut.scale.setScalar(normalizedScale);
      astronaut.traverse((child) => {
        if (!child.isMesh) return;
        child.castShadow = true;
        child.receiveShadow = true;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(brightenMaterial);
      });
      astronautMount.add(astronaut);
    })
    .catch((error) => {
      console.error('Failed to load NASA astronaut model:', error);
    });

  exhibit.userData.update = (elapsed) => {
    astronautMount.position.y = 0.22 + Math.sin(elapsed * 0.65 + 1.4) * 0.025;
  };

  return exhibit;
}
