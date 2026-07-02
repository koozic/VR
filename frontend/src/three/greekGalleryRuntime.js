import * as THREE from 'three';
import { createGreekSculpture } from './createGreekSculpture.js';
import { greekSculptureModels } from './greekSculptureDescriptions.js';
import { assetUrl } from './assetUrl.js';

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

const DECORATIVE_PAINTINGS = [
  {
    url: assetUrl('assets/greek/decor/school-of-athens.webp'),
    width: 2.94,
    height: 1.8,
    position: new THREE.Vector3(-2.1, 3.28, -10.86),
    rotationY: 0,
  },
  {
    url: assetUrl('assets/greek/decor/greco-roman-gods.webp'),
    width: 2.56,
    height: 1.93,
    position: new THREE.Vector3(2.3, 3.28, -10.86),
    rotationY: 0,
  },
  {
    url: assetUrl('assets/greek/decor/death-of-caesar.jpg'),
    width: 4.9,
    height: 2.78,
    position: new THREE.Vector3(8.86, 3.35, 0),
    rotationY: -Math.PI / 2,
  },
  {
    url: assetUrl('assets/greek/decor/last-judgment.jpg'),
    width: 2.25,
    height: 2.58,
    position: new THREE.Vector3(-2.05, 3.35, 10.86),
    rotationY: Math.PI,
  },
  {
    url: assetUrl('assets/greek/decor/creation-of-adam.jpg'),
    width: 3.18,
    height: 2.58,
    position: new THREE.Vector3(2.55, 3.35, 10.86),
    rotationY: Math.PI,
  },
];

const textureLoader = new THREE.TextureLoader();
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

function createDecorativePainting(config, index) {
  const group = new THREE.Group();
  group.name = `greek-gallery-decorative-painting-${index + 1}`;
  group.position.copy(config.position);
  group.rotation.y = config.rotationY;
  group.userData.decorative = true;

  const depth = 0.065;
  const frameThickness = 0.1;
  const lipThickness = 0.035;
  const ornamentDepth = depth * 1.65;
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xd0a13a,
    roughness: 0.34,
    metalness: 0.42,
    emissive: 0x2a1704,
    emissiveIntensity: 0.06,
  });
  const antiqueGoldMat = new THREE.MeshStandardMaterial({
    color: 0x8d6222,
    roughness: 0.48,
    metalness: 0.32,
    emissive: 0x170b02,
    emissiveIntensity: 0.05,
  });
  const backingMat = new THREE.MeshStandardMaterial({
    color: 0x1a1110,
    roughness: 0.75,
  });
  const artMat = new THREE.MeshBasicMaterial({ color: 0x2a2420 });

  const outerW = config.width + frameThickness * 2;
  const outerH = config.height + frameThickness * 2;
  const backing = new THREE.Mesh(new THREE.BoxGeometry(outerW, outerH, depth), backingMat);
  backing.position.z = -0.018;
  backing.receiveShadow = true;
  group.add(backing);

  const art = new THREE.Mesh(new THREE.PlaneGeometry(config.width, config.height), artMat);
  art.position.z = 0.018;
  group.add(art);

  const addRail = (width, height, x, y, z, material) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(width, height, ornamentDepth), material);
    rail.position.set(x, y, z);
    rail.castShadow = true;
    rail.receiveShadow = true;
    group.add(rail);
    return rail;
  };

  addRail(outerW, frameThickness, 0, config.height / 2 + frameThickness / 2, 0.014, frameMat);
  addRail(outerW, frameThickness, 0, -config.height / 2 - frameThickness / 2, 0.014, frameMat);
  addRail(frameThickness, outerH, config.width / 2 + frameThickness / 2, 0, 0.014, frameMat);
  addRail(frameThickness, outerH, -config.width / 2 - frameThickness / 2, 0, 0.014, frameMat);

  const innerW = config.width + lipThickness * 2;
  const innerH = config.height + lipThickness * 2;
  addRail(innerW, lipThickness, 0, config.height / 2 + lipThickness / 2, 0.055, antiqueGoldMat);
  addRail(innerW, lipThickness, 0, -config.height / 2 - lipThickness / 2, 0.055, antiqueGoldMat);
  addRail(lipThickness, innerH, config.width / 2 + lipThickness / 2, 0, 0.055, antiqueGoldMat);
  addRail(lipThickness, innerH, -config.width / 2 - lipThickness / 2, 0, 0.055, antiqueGoldMat);

  const crestMat = new THREE.MeshStandardMaterial({
    color: 0xe1bb5a,
    roughness: 0.3,
    metalness: 0.45,
    emissive: 0x251505,
    emissiveIntensity: 0.07,
  });
  const crestTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.045, outerW * 0.72, 12),
    crestMat,
  );
  crestTop.rotation.z = Math.PI / 2;
  crestTop.position.set(0, outerH / 2 + 0.035, 0.04);
  group.add(crestTop);

  const crestBottom = crestTop.clone();
  crestBottom.position.y = -crestTop.position.y;
  group.add(crestBottom);

  setTimeout(() => {
    textureLoader.load(config.url, (texture) => {
      if (!group.parent) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      artMat.map = texture;
      artMat.color.setHex(0xffffff);
      artMat.needsUpdate = true;
    });
  }, 1800 + index * 180);

  return group;
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
  const decorativePaintings = DECORATIVE_PAINTINGS.map(createDecorativePainting);
  decorativePaintings.forEach((painting) => scene.add(painting));

  const frames = models.map((model, index) => ({
    exhibit: {
      ...greekSculptureModels[index],
      id: `model-${greekSculptureModels[index].id}`,
    },
    position: model.position.clone(),
  }));

  return { models: [...models, ...decorativePaintings], frames };
}
