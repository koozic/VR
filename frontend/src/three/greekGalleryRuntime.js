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

function normalizeAngle(angle) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

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

function getBackingWallSpot(position, fromViewer, isCenter) {
  const direction = fromViewer.clone().multiplyScalar(-1).normalize();
  const candidates = [];
  const wallLimit = 10.78;
  const sideWallLimit = 8.78;

  if (Math.abs(direction.x) > 0.001) {
    const wallX = direction.x > 0 ? sideWallLimit : -sideWallLimit;
    const t = (wallX - position.x) / direction.x;
    if (t > 0) {
      candidates.push({
        t,
        x: wallX,
        z: THREE.MathUtils.clamp(position.z + direction.z * t, -9.4, 9.4),
        rotationY: direction.x > 0 ? -Math.PI / 2 : Math.PI / 2,
      });
    }
  }

  if (Math.abs(direction.z) > 0.001) {
    const wallZ = direction.z > 0 ? wallLimit : -wallLimit;
    const t = (wallZ - position.z) / direction.z;
    if (t > 0) {
      candidates.push({
        t,
        x: THREE.MathUtils.clamp(position.x + direction.x * t, -7.4, 7.4),
        z: wallZ,
        rotationY: direction.z > 0 ? Math.PI : 0,
      });
    }
  }

  const wall = candidates.sort((a, b) => a.t - b.t)[0] || {
    x: position.x,
    z: -wallLimit,
    rotationY: 0,
  };

  return {
    position: new THREE.Vector3(wall.x, isCenter ? 2.35 : 2.05, wall.z),
    rotationY: wall.rotationY,
    size: isCenter ? 4.0 : 3.25,
  };
}

function addWallGlow(scene, spot) {
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(spot.size, spot.size),
    new THREE.MeshBasicMaterial({
      map: getWallGlowTexture(),
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  glow.position.copy(spot.position);
  glow.rotation.y = spot.rotationY;
  glow.renderOrder = 1;
  scene.add(glow);
}

function wallSpotOverlapsDecorativePainting(spot) {
  const padding = 0.35;
  return DECORATIVE_PAINTINGS.some((painting) => {
    const rotationDelta = Math.abs(normalizeAngle(spot.rotationY - painting.rotationY));
    if (rotationDelta > 0.01) return false;

    const spotHalf = spot.size * 0.5;
    const spotYMin = spot.position.y - spotHalf;
    const spotYMax = spot.position.y + spotHalf;
    const paintingYMin = painting.position.y - painting.height * 0.5 - padding;
    const paintingYMax = painting.position.y + painting.height * 0.5 + padding;
    const overlapsY = spotYMin <= paintingYMax && spotYMax >= paintingYMin;
    if (!overlapsY) return false;

    if (Math.abs(Math.sin(spot.rotationY)) > 0.5) {
      const spotZMin = spot.position.z - spotHalf;
      const spotZMax = spot.position.z + spotHalf;
      const paintingZMin = painting.position.z - painting.width * 0.5 - padding;
      const paintingZMax = painting.position.z + painting.width * 0.5 + padding;
      return spotZMin <= paintingZMax && spotZMax >= paintingZMin;
    }

    const spotXMin = spot.position.x - spotHalf;
    const spotXMax = spot.position.x + spotHalf;
    const paintingXMin = painting.position.x - painting.width * 0.5 - padding;
    const paintingXMax = painting.position.x + painting.width * 0.5 + padding;
    return spotXMin <= paintingXMax && spotXMax >= paintingXMin;
  });
}

function createGreekSculptureLighting(scene) {
  const warm = 0xffead0;
  const coolSoft = 0xdbeaff;
  const centerIndex = 2;

  STATUE_POSITIONS.forEach((position, index) => {
    const fromViewer = index === centerIndex
      ? new THREE.Vector3(0, 0, 1)
      : new THREE.Vector3(-position.x, 0, -position.z);
    if (fromViewer.lengthSq() < 0.001) {
      fromViewer.set(0, 0, 1);
    }
    fromViewer.normalize();

    const wallSpot = getBackingWallSpot(position, fromViewer, index === centerIndex);
    const hasClearBackingWall = !wallSpotOverlapsDecorativePainting(wallSpot);
    if (hasClearBackingWall) {
      addWallGlow(scene, wallSpot);
    }

    const lightPosition = position.clone()
      .addScaledVector(fromViewer, index === centerIndex ? 3.1 : 2.55)
      .add(new THREE.Vector3(0, index === centerIndex ? 2.55 : 2.3, 0));
    const targetPosition = hasClearBackingWall
      ? wallSpot.position
      : position.clone().add(new THREE.Vector3(0, index === centerIndex ? 1.35 : 1.18, 0));
    const target = createSpotTarget(scene, targetPosition);

    const frontLight = new THREE.SpotLight(
      index === 1 ? coolSoft : warm,
      hasClearBackingWall ? (index === centerIndex ? 5.2 : 3.15) : 2.4,
      hasClearBackingWall ? (index === centerIndex ? 15 : 12) : 5.6,
      hasClearBackingWall ? (index === centerIndex ? Math.PI / 8 : Math.PI / 7) : Math.PI / 7.5,
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
