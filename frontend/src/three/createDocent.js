import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const DRONE_MODEL_URL = "/assets/drone/scene.gltf";
const DRONE_YAW = -0.28;
const STATIC_PROPELLER_GROUP_NAMES = [
  "Cylinder.155_26",
  "Cylinder.156_27",
  "Cylinder.157_28",
  "Cylinder.158_29",
  "Cylinder.160_30",
  "Cylinder.164_31",
  "Cylinder.176_35",
  "Cylinder.177_36",
  "Spins.002_45",
];
const STATIC_PROPELLER_MESH_NAMES = [
  "Object_83",
  "Object_108",
  "Object_109",
  "Object_110",
  "Object_111",
  "Object_113",
  "Object_114",
  "Object_115",
  "Object_117",
  "Object_119",
  "Object_120",
  "Object_121",
  "Object_122",
  "Object_124",
  "Object_126",
  "Object_127",
  "Object_128",
  "Object_129",
  "Object_130",
  "Object_131",
  "Object_132",
  "Object_133",
  "Object_142",
  "Object_143",
  "Object_144",
  "Object_146",
  "Object_147",
  "Object_148",
  "Object_169",
];

function createPropeller(position) {
  const rotor = new THREE.Group();
  rotor.position.copy(position);

  const bladeMaterial = new THREE.MeshStandardMaterial({
    color: 0x111820,
    metalness: 0.35,
    roughness: 0.42,
  });

  const bladeA = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.01, 0.026),
    bladeMaterial,
  );
  const bladeB = new THREE.Mesh(
    new THREE.BoxGeometry(0.026, 0.01, 0.24),
    bladeMaterial,
  );
  rotor.add(bladeA, bladeB);

  return rotor;
}

function isStaticPropellerPart(object) {
  return (
    STATIC_PROPELLER_GROUP_NAMES.includes(object.name) ||
    STATIC_PROPELLER_MESH_NAMES.includes(object.name)
  );
}

function isThinBladeMesh(object) {
  if (!object.isMesh) {
    return false;
  }

  const bounds = new THREE.Box3().setFromObject(object);
  const size = bounds.getSize(new THREE.Vector3());
  const sortedSize = [size.x, size.y, size.z].sort((a, b) => a - b);
  const [thinAxis, , longAxis] = sortedSize;

  return longAxis > 0.035 && longAxis < 0.24 && thinAxis / longAxis < 0.12;
}

function removeStaticPropellerParts(root) {
  const removableParts = [];

  root.traverse((child) => {
    if (isStaticPropellerPart(child) || isThinBladeMesh(child)) {
      removableParts.push(child);
    }
  });

  removableParts.forEach((part) => {
    part.parent?.remove(part);
  });
}

export function createDocent() {
  const group = new THREE.Group();
  group.name = "ai-docent-drone";
  const propellers = [];

  const modelRoot = new THREE.Group();
  modelRoot.name = "sketchfab-drone-model";
  group.add(modelRoot);

  const propellerMount = new THREE.Group();
  propellerMount.name = "docent-propeller-mount";
  propellerMount.rotation.y = DRONE_YAW;
  modelRoot.add(propellerMount);

  const keyLight = new THREE.PointLight(0x4cc9f0, 0.55, 1.8);
  keyLight.position.set(0, 0.15, 0.35);
  group.add(keyLight);

  const loader = new GLTFLoader();
  loader.load(
    DRONE_MODEL_URL,
    (gltf) => {
      const drone = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(drone);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z);
      const normalizedScale = maxAxis > 0 ? 0.95 / maxAxis : 1;

      drone.position.copy(center).multiplyScalar(-normalizedScale);
      drone.scale.setScalar(normalizedScale);
      drone.rotation.set(0, DRONE_YAW, 0);
      removeStaticPropellerParts(drone);

      drone.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      modelRoot.add(drone);

      [
        new THREE.Vector3(-0.31, -0.02, 0.18),
        new THREE.Vector3(0.31, -0.02, 0.18),
        new THREE.Vector3(-0.31, 0.06, -0.18),
        new THREE.Vector3(0.31, 0.06, -0.18),
      ].forEach((position) => {
        const propeller = createPropeller(position);
        propellerMount.add(propeller);
        propellers.push(propeller);
      });
    },
    undefined,
    (error) => {
      console.error("Failed to load docent drone model:", error);
    },
  );

  const baseY = -0.5;
  group.position.set(1.25, baseY, -2.15);
  group.scale.setScalar(0.82);

  group.userData.update = (elapsed, delta) => {
    group.position.y = baseY + Math.sin(elapsed * 2.2) * 0.035;
    group.rotation.z = Math.sin(elapsed * 1.6) * 0.035;
    group.rotation.x = Math.sin(elapsed * 1.25) * 0.02;

    propellers.forEach((propeller, index) => {
      propeller.rotation.y += delta * (index % 2 === 0 ? 34 : -34);
    });
  };

  return group;
}
