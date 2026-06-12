/* 그리스 조각상 전시물 생성. GLB 로드 전 절차적 대리석 조각상을 먼저 표시 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const MARBLE = {
  color: 0xebe3d8,
  roughness: 0.35,
  metalness: 0.05,
  emissive: 0x2a2218,
  emissiveIntensity: 0.08,
};
const MARBLE_DARK = {
  color: 0xd0c8bc,
  roughness: 0.4,
  metalness: 0.05,
  emissive: 0x1a1410,
  emissiveIntensity: 0.06,
};
const MARBLE_WARM = {
  color: 0xe8dfd0,
  roughness: 0.3,
  metalness: 0.03,
  emissive: 0x2a1a0a,
  emissiveIntensity: 0.1,
};

function mat(props) {
  const { roughness, metalness, ...rest } = props;
  return new THREE.MeshPhongMaterial({
    specular: 0x111111,
    shininess: 12,
    ...rest,
  });
}

const MODEL_URLS = {
  'venus-de-milo': '/assets/greek/venus-de-milo.glb',
  'winged-victory': '/assets/greek/winged-victory.glb',
  'laocoon': '/assets/greek/laocoon.glb',
  'discobolus': '/assets/greek/discobolus.glb',
  'thinker': '/assets/greek/thinker.glb',
};

function createPedestal(diameter) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(diameter * 0.5, diameter * 0.55, 0.22, 20), mat(MARBLE)));
  g.children[0].position.y = 0.11;
  const mid = new THREE.Mesh(new THREE.CylinderGeometry(diameter * 0.44, diameter * 0.47, 0.3, 20), mat(MARBLE_DARK));
  mid.position.y = 0.35;
  g.add(mid);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(diameter * 0.38, diameter * 0.4, 0.1, 20), mat(MARBLE));
  top.position.y = 0.54;
  g.add(top);
  const trim = new THREE.Mesh(new THREE.TorusGeometry(diameter * 0.41, 0.012, 8, 20), new THREE.MeshBasicMaterial({ color: 0xb8a890, transparent: true, opacity: 0.3 }));
  trim.rotation.x = Math.PI / 2;
  trim.position.y = 0.6;
  g.add(trim);
  return g;
}

function createAmphora() {
  const pts = [];
  const profile = [
    [0, 0], [0.08, 0], [0.1, 0.02], [0.12, 0.06], [0.2, 0.12], [0.32, 0.18],
    [0.38, 0.24], [0.36, 0.32], [0.28, 0.38], [0.16, 0.42], [0.04, 0.44],
    [0.02, 0.46], [0.04, 0.5], [0.1, 0.54], [0.14, 0.56], [0.12, 0.58],
    [0.06, 0.6], [0.04, 0.64], [0.06, 0.66], [0.08, 0.68], [0.06, 0.7],
    [0.02, 0.72], [0.02, 0.74],
  ];
  profile.forEach(([x, y]) => pts.push(new THREE.Vector2(x, y)));
  const geom = new THREE.LatheGeometry(pts, 20);
  const mesh = new THREE.Mesh(geom, mat(MARBLE_WARM));
  mesh.castShadow = true;
  return mesh;
}

function createKouros() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.6, 12), mat(MARBLE));
  body.position.y = 0.3;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), mat(MARBLE));
  head.position.y = 0.72;
  g.add(head);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.06, 8), mat(MARBLE_DARK));
  neck.position.y = 0.65;
  g.add(neck);
  [[-0.12, 0.42], [0.12, 0.42]].forEach(([x, y]) => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.35, 8), mat(MARBLE));
    arm.position.set(x, y, 0);
    arm.rotation.z = x < 0 ? 0.15 : -0.15;
    arm.rotation.x = 0.1;
    g.add(arm);
  });
  [[-0.06, 0.08, 0.04], [0.06, 0.08, 0.04]].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.22, 8), mat(MARBLE));
    leg.position.set(x, y, z);
    g.add(leg);
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.04, 12), mat(MARBLE_DARK));
  base.position.y = -0.01;
  g.add(base);
  return g;
}

function createWingedFigure() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.5, 12), mat(MARBLE));
  body.position.y = 0.25;
  body.rotation.z = 0.05;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), mat(MARBLE));
  head.position.set(0, 0.6, -0.02);
  g.add(head);
  [[-1, 0.32], [1, 0.32]].forEach(([sx, y]) => {
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.quadraticCurveTo(sx * 0.3, 0.15, sx * 0.5, 0);
    wingShape.quadraticCurveTo(sx * 0.35, -0.08, 0, 0);
    const wingGeom = new THREE.ShapeGeometry(wingShape);
    const wing = new THREE.Mesh(wingGeom, mat({ ...MARBLE, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
    wing.position.set(sx * 0.08, y, 0);
    wing.rotation.y = sx > 0 ? -0.3 : 0.3;
    wing.rotation.x = -0.1;
    g.add(wing);
    const wing2 = wing.clone();
    wing2.position.set(sx * 0.08, y - 0.08, -0.02);
    wing2.scale.setScalar(0.7);
    wing2.rotation.y = sx > 0 ? -0.5 : 0.5;
    g.add(wing2);
  });
  const draperyShape = new THREE.Shape();
  draperyShape.moveTo(-0.08, 0);
  draperyShape.quadraticCurveTo(-0.12, 0.2, -0.06, 0.35);
  draperyShape.quadraticCurveTo(0, 0.38, 0.06, 0.35);
  draperyShape.quadraticCurveTo(0.12, 0.2, 0.08, 0);
  const drapeGeom = new THREE.ShapeGeometry(draperyShape);
  const drape = new THREE.Mesh(drapeGeom, mat({ ...MARBLE_DARK, side: THREE.DoubleSide }));
  drape.position.set(0, 0.05, 0.06);
  g.add(drape);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.04, 12), mat(MARBLE_DARK));
  base.position.y = -0.01;
  g.add(base);
  return g;
}

function createDiscobolus() {
  const g = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.3, 12), mat(MARBLE));
  torso.position.y = 0.15;
  torso.rotation.z = 0.2;
  g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), mat(MARBLE));
  head.position.set(-0.02, 0.35, 0);
  head.rotation.z = -0.15;
  g.add(head);
  const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.25, 8), mat(MARBLE));
  rArm.position.set(0.18, 0.25, 0.02);
  rArm.rotation.z = -1.2;
  rArm.rotation.x = 0.3;
  g.add(rArm);
  const discus = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 16), mat({ ...MARBLE, color: 0xd8cfc0 }));
  discus.position.set(0.35, 0.38, 0.04);
  discus.rotation.z = 0.3;
  g.add(discus);
  const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.2, 8), mat(MARBLE));
  lArm.position.set(-0.12, 0.2, -0.03);
  lArm.rotation.z = 0.8;
  lArm.rotation.x = -0.2;
  g.add(lArm);
  [[-0.04, 0.03, 0.03], [0.04, 0.03, 0.03]].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.18, 8), mat(MARBLE));
    leg.position.set(x, y, z);
    leg.rotation.z = x < 0 ? -0.1 : 0.1;
    g.add(leg);
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.04, 12), mat(MARBLE_DARK));
  base.position.y = -0.01;
  g.add(base);
  return g;
}

function createSeatedThinker() {
  const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.16), mat(MARBLE_DARK));
  seat.position.y = 0.03;
  g.add(seat);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.22, 12), mat(MARBLE));
  torso.position.set(0, 0.18, -0.02);
  torso.rotation.x = 0.1;
  g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), mat(MARBLE));
  head.position.set(-0.01, 0.34, -0.04);
  head.rotation.x = 0.2;
  g.add(head);
  const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.18, 8), mat(MARBLE));
  rArm.position.set(0.12, 0.22, -0.04);
  rArm.rotation.z = -0.8;
  rArm.rotation.x = 0.5;
  g.add(rArm);
  const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.12, 8), mat(MARBLE));
  lArm.position.set(-0.1, 0.28, -0.05);
  lArm.rotation.z = 0.7;
  lArm.rotation.x = 0.3;
  g.add(lArm);
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), mat(MARBLE));
  hand.position.set(-0.02, 0.31, -0.07);
  g.add(hand);
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.12, 8), mat(MARBLE));
  legL.position.set(-0.05, 0.08, 0.04);
  legL.rotation.x = 0.3;
  g.add(legL);
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.12, 8), mat(MARBLE));
  legR.position.set(0.05, 0.08, 0.04);
  legR.rotation.x = 0.3;
  g.add(legR);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.04, 12), mat(MARBLE_DARK));
  base.position.y = -0.01;
  g.add(base);
  return g;
}

function createLaocoonGroup() {
  const g = new THREE.Group();
  const mainBody = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.5, 12), mat(MARBLE));
  mainBody.position.y = 0.25;
  mainBody.rotation.z = -0.05;
  g.add(mainBody);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), mat(MARBLE));
  head.position.set(0, 0.55, -0.02);
  head.rotation.x = -0.15;
  g.add(head);
  [[0.12, 0.3], [-0.12, 0.3]].forEach(([x, y]) => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.3, 8), mat(MARBLE));
    arm.position.set(x, y, 0);
    arm.rotation.z = x > 0 ? -0.6 : 0.6;
    arm.rotation.x = 0.2;
    g.add(arm);
  });
  [[0.1, 0.12, 0.25], [-0.1, 0.12, 0.25]].forEach(([x, y, s]) => {
    const child = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), mat(MARBLE));
    child.position.set(x, y + 0.08, 0.05);
    g.add(child);
    const childBody = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.12, 8), mat(MARBLE));
    childBody.position.set(x, y, 0.04);
    childBody.rotation.z = x > 0 ? -0.2 : 0.2;
    g.add(childBody);
  });
  const snakePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.04, 0.4, 0.02),
    new THREE.Vector3(0.12, 0.45, 0.04),
    new THREE.Vector3(0.18, 0.35, 0.02),
    new THREE.Vector3(0.12, 0.25, 0),
    new THREE.Vector3(0.08, 0.15, 0.02),
  ]);
  const snakeGeom = new THREE.TubeGeometry(snakePath, 12, 0.015, 6, false);
  const snake = new THREE.Mesh(snakeGeom, mat({ ...MARBLE_DARK, color: 0xb8b0a4 }));
  g.add(snake);
  const snake2Path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.04, 0.35, 0.02),
    new THREE.Vector3(-0.1, 0.4, 0.04),
    new THREE.Vector3(-0.15, 0.3, 0.01),
    new THREE.Vector3(-0.08, 0.2, 0),
  ]);
  const snake2Geom = new THREE.TubeGeometry(snake2Path, 10, 0.012, 6, false);
  const snake2 = new THREE.Mesh(snake2Geom, mat({ ...MARBLE_DARK, color: 0xb8b0a4 }));
  g.add(snake2);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.04, 12), mat(MARBLE_DARK));
  base.position.y = -0.01;
  g.add(base);
  return g;
}

const sculptureBuilders = {
  'venus-de-milo': () => createKouros(),
  'winged-victory': () => createWingedFigure(),
  'discobolus': () => createDiscobolus(),
  'laocoon': () => createLaocoonGroup(),
  'david': () => createKouros(),
  'thinker': () => createSeatedThinker(),
};

const _loader = new GLTFLoader();
const _dracoLoader = new DRACOLoader();
_dracoLoader.setDecoderPath('/assets/draco/');
_loader.setDRACOLoader(_dracoLoader);

THREE.Cache.enabled = true;

const proceduralScales = {
  'venus-de-milo': 0.6,
  'david': 0.6,
  'laocoon': 0.7,
};

export function createGreekSculpture(modelId, position, options = {}) {
  const { pedestalDiameter = 0.9, noPedestal, yaw, scale = 1, loadDelay = 0 } = options;

  const exhibit = new THREE.Group();
  exhibit.name = `greek-sculpture-${modelId}`;
  exhibit.position.copy(position);
  exhibit.rotation.y = yaw !== undefined ? yaw : Math.atan2(-position.x, -position.z);

  const mountY = noPedestal ? 0 : 0.62;

  if (!noPedestal) {
    const pedestal = createPedestal(pedestalDiameter);
    exhibit.add(pedestal);
  }

  const mount = new THREE.Group();
  mount.position.y = mountY;
  exhibit.add(mount);

  // Show procedural marble sculpture immediately (no lag)
  const builder = sculptureBuilders[modelId] || createAmphora;
  const procedural = builder();
  procedural.scale.setScalar(proceduralScales[modelId] || 0.7);
  mount.add(procedural);

  if (!noPedestal) {
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.04, 16), mat(MARBLE_DARK));
    plinth.position.y = -0.02;
    mount.add(plinth);
  }

  // Load GLB with stagger — replaces procedural when ready
  const modelUrl = MODEL_URLS[modelId];
  if (modelUrl) {
    setTimeout(() => {
      _loader.load(
        modelUrl,
        (gltf) => {
          const scene = gltf.scene;
          const box = new THREE.Box3().setFromObject(scene);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const targetScale = (3.0 / maxDim) * scale;
          scene.scale.setScalar(targetScale);
          scene.position.x = -(box.min.x + box.max.x) / 2 * targetScale;
          scene.position.y = -box.min.y * targetScale;
          scene.position.z = -(box.min.z + box.max.z) / 2 * targetScale;
          scene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          while (mount.children.length) mount.remove(mount.children[0]);
          mount.add(scene);
        },
        undefined,
        (error) => {
          console.warn(`GLB load failed for ${modelId}:`, error);
        },
      );
    }, loadDelay);
  }

  exhibit.userData.update = (elapsed) => {
    mount.position.y = mountY + Math.sin(elapsed * 0.3 + position.x) * (noPedestal ? 0.003 : 0.006);
  };

  return exhibit;
}
