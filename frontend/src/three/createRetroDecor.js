import * as THREE from 'three';

const CYAN = 0x25d9ff;
const MAGENTA = 0xff35c8;
const PURPLE = 0x8a5cff;

function basicMaterial(color, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: opacity >= 1,
  });
}

function createFloorStrip(width, depth, x, z, color, materialList) {
  const material = basicMaterial(color, 0.62);
  materialList.push(material);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(width, 0.018, depth), material);
  strip.position.set(x, 0.012, z);
  return strip;
}

function createRetroFloor(materialList) {
  const floor = new THREE.Group();
  floor.name = 'retro-neon-floor';

  const ringMaterial = basicMaterial(MAGENTA, 0.55);
  materialList.push(ringMaterial);
  const cabinetRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.65, 0.035, 8, 96),
    ringMaterial,
  );
  cabinetRing.rotation.x = Math.PI / 2;
  cabinetRing.position.y = 0.022;
  floor.add(cabinetRing);

  floor.add(
    createFloorStrip(15.2, 0.045, 0, -8.25, CYAN, materialList),
    createFloorStrip(15.2, 0.045, 0, 8.25, CYAN, materialList),
    createFloorStrip(0.045, 16.5, -7.55, 0, MAGENTA, materialList),
    createFloorStrip(0.045, 16.5, 7.55, 0, MAGENTA, materialList),
  );

  const tileGeometry = new THREE.BoxGeometry(0.72, 0.016, 0.72);
  [-6.45, 6.45].forEach((x, laneIndex) => {
    for (let z = -6.6, index = 0; z <= 6.6; z += 1.2, index += 1) {
      const color = (index + laneIndex) % 2 === 0 ? PURPLE : CYAN;
      const material = basicMaterial(color, 0.2);
      materialList.push(material);
      const tile = new THREE.Mesh(tileGeometry, material);
      tile.position.set(x, 0.013, z);
      floor.add(tile);
    }
  });

  return floor;
}

function createArcadeSign(materialList) {
  const sign = new THREE.Group();
  sign.name = 'retro-arcade-sign';
  sign.position.set(0, 3.55, -10.72);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.9, 0.12),
    new THREE.MeshStandardMaterial({
      color: 0x12041c,
      emissive: 0x2a0838,
      emissiveIntensity: 0.8,
      roughness: 0.38,
      metalness: 0.45,
    }),
  );
  sign.add(frame);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  context.fillStyle = '#08000f';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '900 150px system-ui, sans-serif';
  context.shadowColor = '#ff35c8';
  context.shadowBlur = 34;
  context.strokeStyle = '#ff35c8';
  context.lineWidth = 12;
  context.strokeText('ARCADE', 512, 128);
  context.shadowColor = '#25d9ff';
  context.shadowBlur = 20;
  context.fillStyle = '#f5fbff';
  context.fillText('ARCADE', 512, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const signMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(4.95, 0.7), signMaterial);
  face.position.z = 0.066;
  sign.add(face);

  return sign;
}

function createSpeakerTower(x) {
  const speaker = new THREE.Group();
  speaker.position.set(x, 0, -8.9);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 1.85, 0.72),
    new THREE.MeshStandardMaterial({
      color: 0x100d18,
      emissive: 0x13061d,
      emissiveIntensity: 0.45,
      roughness: 0.72,
    }),
  );
  body.position.y = 0.925;
  speaker.add(body);

  [0.58, 1.28].forEach((y, index) => {
    const cone = new THREE.Mesh(
      new THREE.CylinderGeometry(index === 0 ? 0.28 : 0.2, 0.16, 0.05, 32),
      new THREE.MeshStandardMaterial({
        color: 0x17111f,
        emissive: index === 0 ? MAGENTA : CYAN,
        emissiveIntensity: 0.32,
        roughness: 0.45,
      }),
    );
    cone.rotation.x = Math.PI / 2;
    cone.position.set(0, y, 0.38);
    speaker.add(cone);
  });

  return speaker;
}

function createSideMachine({ x, color, label }) {
  const machine = new THREE.Group();
  machine.position.set(x, 0, 5.9);
  machine.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 2.05, 0.75),
    new THREE.MeshStandardMaterial({
      color: 0x17121f,
      emissive: color,
      emissiveIntensity: 0.12,
      roughness: 0.48,
      metalness: 0.22,
    }),
  );
  body.position.y = 1.025;
  machine.add(body);

  const display = new THREE.Mesh(
    new THREE.PlaneGeometry(0.68, 0.78),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.56 }),
  );
  display.position.set(0, 1.35, 0.381);
  machine.add(display);

  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.08, 0.05),
    new THREE.MeshBasicMaterial({ color: 0xdceaff }),
  );
  slot.position.set(0, 0.62, 0.405);
  machine.add(slot);

  machine.name = label;
  return machine;
}

export function createRetroDecor(roomY = 0) {
  const group = new THREE.Group();
  group.name = 'retro-gallery-decor';
  group.position.y = roomY;

  const animatedMaterials = [];
  const floor = createRetroFloor(animatedMaterials);
  const sign = createArcadeSign(animatedMaterials);
  group.add(
    floor,
    sign,
    createSpeakerTower(-7.35),
    createSpeakerTower(7.35),
    createSideMachine({ x: -8.25, color: MAGENTA, label: 'coin-changer' }),
    createSideMachine({ x: 8.25, color: CYAN, label: 'retro-vending-machine' }),
  );

  group.userData.update = (elapsed) => {
    const pulse = 0.82 + Math.sin(elapsed * 1.8) * 0.18;
    animatedMaterials.forEach((material, index) => {
      if ('opacity' in material) {
        material.opacity = Math.max(0.14, pulse * (index < 5 ? 0.62 : 0.24));
      }
    });
  };

  return group;
}
