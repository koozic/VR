import * as THREE from 'three';
import { createGreekSculpture } from './createGreekSculpture.js';
import { greekSculptureModels } from './greekSculptureDescriptions.js';

const STATUE_POSITIONS = [
  new THREE.Vector3(-6.5, 0, -7.0),
  new THREE.Vector3(6.5, 0, -7.0),
  new THREE.Vector3(0.0, 0, 0.0),
  new THREE.Vector3(-6.5, 0, 7.0),
  new THREE.Vector3(6.5, 0, 7.0),
];

const STATUE_OPTIONS = [
  { pedestalDiameter: 1.5, loadDelay: 0 },
  { noPedestal: true, scale: 1.5, loadDelay: 300 },
  { noPedestal: true, yaw: -Math.PI / 2, pedestalDiameter: 1.5, loadDelay: 600 },
  { pedestalDiameter: 1.5, loadDelay: 900 },
  { pedestalDiameter: 1.5, loadDelay: 1200 },
];

let wallGlowTexture = null;

function createSpotTarget(scene, position) {
  const target = new THREE.Object3D();
  target.position.copy(position);
  scene.add(target);
  return target;
}

function getWallGlowTexture() {
  if (wallGlowTexture) return wallGlowTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 4, 128, 128, 124);
  gradient.addColorStop(0, 'rgba(255, 232, 190, 0.52)');
  gradient.addColorStop(0.42, 'rgba(255, 220, 160, 0.24)');
  gradient.addColorStop(1, 'rgba(255, 210, 140, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  wallGlowTexture = new THREE.CanvasTexture(canvas);
  wallGlowTexture.colorSpace = THREE.SRGBColorSpace;
  return wallGlowTexture;
}

function addFloorGlow(scene, position, size = 1.75, opacity = 0.68) {
  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(size, 48),
    new THREE.MeshBasicMaterial({
      map: getWallGlowTexture(),
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    }),
  );
  glow.position.set(position.x, 0.012, position.z);
  glow.rotation.x = -Math.PI / 2;
  glow.renderOrder = 1;
  scene.add(glow);
}

function addCeilingSpotFixture(scene, position) {
  const fixture = new THREE.Group();
  fixture.position.set(position.x, 5.82, position.z);

  const housingMat = new THREE.MeshStandardMaterial({
    color: 0x7a5a36,
    roughness: 0.48,
    metalness: 0.24,
    emissive: 0x1c1006,
    emissiveIntensity: 0.08,
  });
  const lensMat = new THREE.MeshBasicMaterial({
    color: 0xffefd0,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });

  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.18, 28), housingMat);
  fixture.add(housing);

  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.27, 28), lensMat);
  lens.position.y = -0.095;
  lens.rotation.x = -Math.PI / 2;
  fixture.add(lens);

  scene.add(fixture);
}

function createGreekSculptureLighting(scene) {
  const warm = 0xffead0;
  const coolSoft = 0xdbeaff;
  const centerIndex = 2;

  STATUE_POSITIONS.forEach((position, index) => {
    addCeilingSpotFixture(scene, position);

    if (index === centerIndex) {
      addFloorGlow(scene, position, 2.05, 0.72);

      const target = createSpotTarget(scene, position.clone().add(new THREE.Vector3(0, 0.22, 0)));
      const topLight = new THREE.SpotLight(warm, 5.4, 8.6, Math.PI / 5.7, 0.86, 1.35);
      topLight.position.set(position.x, 5.58, position.z);
      topLight.target = target;
      topLight.castShadow = false;
      scene.add(topLight);

      const softFill = new THREE.PointLight(warm, 0.45, 3.2, 1.9);
      softFill.position.set(position.x, 2.2, position.z);
      softFill.castShadow = false;
      scene.add(softFill);
      return;
    }

    const fromViewer = index === centerIndex
      ? new THREE.Vector3(0, 0, 1)
      : new THREE.Vector3(-position.x, 0, -position.z);
    if (fromViewer.lengthSq() < 0.001) {
      fromViewer.set(0, 0, 1);
    }
    fromViewer.normalize();

    const floorSpot = position.clone().addScaledVector(fromViewer, 0.42);
    addFloorGlow(scene, floorSpot, 1.75, 0.68);

    const lightPosition = position.clone()
      .addScaledVector(fromViewer, index === centerIndex ? 3.1 : 2.55)
      .add(new THREE.Vector3(0, index === centerIndex ? 2.55 : 2.3, 0));
    const target = createSpotTarget(scene, floorSpot.clone().add(new THREE.Vector3(0, 0.22, 0)));

    const frontLight = new THREE.SpotLight(
      index === 1 ? coolSoft : warm,
      2.85,
      7.2,
      Math.PI / 6.4,
      0.9,
      1.9,
    );
    frontLight.position.copy(lightPosition);
    frontLight.target = target;
    frontLight.castShadow = false;
    scene.add(frontLight);
  });
}

export function createGreekGalleryContent(scene) {
  createGreekSculptureLighting(scene);

  const models = greekSculptureModels.map((model, index) => {
    const position = STATUE_POSITIONS[index] || new THREE.Vector3(0, 0, 0);
    return createGreekSculpture(
      model.id,
      position,
      STATUE_OPTIONS[index] || { pedestalDiameter: 1.5 },
    );
  });

  models.forEach((model) => scene.add(model));

  const frames = models.map((model, index) => ({
    exhibit: {
      ...greekSculptureModels[index],
      id: `model-${greekSculptureModels[index].id}`,
    },
    position: model.position.clone(),
  }));

  return { models, frames };
}
