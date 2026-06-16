/* NASA 제미니 우주복 3D 모델을 GLB로 로드하고 받침대에 배치 */
import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { assetUrl } from './assetUrl.js';

const GEMINI_MODEL_URL = assetUrl('assets/gemini-spacesuit/gemini-spacesuit.glb');
const GEMINI_EXHIBIT_POSITION = new THREE.Vector3(7.2, 0, 7.7);

function createPedestal() {
  const pedestal = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.82, 0.18, 40),
    new THREE.MeshStandardMaterial({
      color: 0x272d38,
      roughness: 0.72,
      metalness: 0.18,
      emissive: 0x101827,
      emissiveIntensity: 0.48,
    }),
  );
  base.position.y = 0.09;
  pedestal.add(base);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.75, 0.025, 10, 48),
    new THREE.MeshBasicMaterial({ color: 0x8fa9d8 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.19;
  pedestal.add(rim);
  return pedestal;
}

function brightenMaterial(material) {
  if (!material?.isMeshStandardMaterial) return;
  material.emissive.setHex(0x202838);
  material.emissiveIntensity = 0.22;
}

export function createGeminiSpacesuit() {
  const exhibit = new THREE.Group();
  exhibit.name = 'nasa-gemini-spacesuit-exhibit';
  exhibit.position.copy(GEMINI_EXHIBIT_POSITION);
  exhibit.rotation.y = Math.atan2(-GEMINI_EXHIBIT_POSITION.x, -GEMINI_EXHIBIT_POSITION.z) + Math.PI;
  exhibit.add(createPedestal());

  const suitMount = new THREE.Group();
  suitMount.position.y = 0.22;
  exhibit.add(suitMount);

  const keyLight = new THREE.SpotLight(0xd5e2ff, 5.4, 7, Math.PI / 5, 0.52, 1.4);
  keyLight.position.set(1.4, 3.2, 1.5);
  keyLight.target.position.set(0, 1.1, 0);
  exhibit.add(keyLight, keyLight.target);

  const fillLight = new THREE.PointLight(0xaec8ff, 5.5, 5.5, 1.35);
  fillLight.position.set(-0.8, 1.7, -1.1);
  exhibit.add(fillLight);

  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(assetUrl('assets/draco/'));
  loader.setDRACOLoader(dracoLoader);
  loader.load(
    GEMINI_MODEL_URL,
    (gltf) => {
      const suit = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(suit);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const normalizedScale = size.y > 0 ? 2.25 / size.y : 1;

      suit.position.set(
        -center.x * normalizedScale,
        -bounds.min.y * normalizedScale,
        -center.z * normalizedScale,
      );
      suit.scale.setScalar(normalizedScale);
      suit.traverse((child) => {
        if (!child.isMesh) return;
        child.castShadow = true;
        child.receiveShadow = true;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(brightenMaterial);
      });
      suitMount.add(suit);
    },
    undefined,
    (error) => {
      console.error('Failed to load NASA Gemini spacesuit model:', error);
    },
  );

  exhibit.userData.update = (elapsed) => {
    suitMount.position.y = 0.22 + Math.sin(elapsed * 0.62 + 2.3) * 0.025;
  };

  return exhibit;
}
