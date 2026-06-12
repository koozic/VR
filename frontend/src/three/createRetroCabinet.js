import * as THREE from 'three';

const CABINET_WIDTH = 0.82;
const CABINET_HEIGHT = 1.8;
const CABINET_DEPTH = 0.7;

const SCREEN_WIDTH = 0.58;
const SCREEN_HEIGHT = 0.44;
const SCREEN_Y = 1.08;

const MARQUEE_WIDTH = 0.6;
const MARQUEE_HEIGHT = 0.18;
const MARQUEE_Y = 1.62;

const CONTROL_WIDTH = 0.58;
const CONTROL_HEIGHT = 0.12;
const CONTROL_Y = 0.68;

function createMaterial(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    roughness: 0.5,
    metalness: 0.1,
    color,
    ...opts,
  });
}

const themeColors = {
  'pikachu-volleyball': { primary: 0xffcc00, accent: 0xcc2200, screen: 0x44aaff, neon: 0xffdd44 },
  'tetrio': { primary: 0x220044, accent: 0x00ccff, screen: 0x00aaff, neon: 0x00eeff },
  'age-of-war': { primary: 0x8b4513, accent: 0xcd853f, screen: 0xddaa44, neon: 0xff8800 },
  'initial-d': { primary: 0x000066, accent: 0x0044cc, screen: 0x4488ff, neon: 0x4488ff },
  'tech-romancer': { primary: 0x440044, accent: 0xcc0044, screen: 0xff4488, neon: 0xff44aa },
};

function createMarqueeText(game) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const title = game.title.split(' (')[0];
  let size = 48;
  ctx.font = `800 ${size}px system-ui, sans-serif`;
  while (ctx.measureText(title).width > 460 && size > 20) {
    size -= 2;
    ctx.font = `800 ${size}px system-ui, sans-serif`;
  }
  ctx.fillText(title, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createScreenTexture(game) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  const bg = ctx.createRadialGradient(320, 240, 20, 320, 240, 360);
  const colors = themeColors[game.id] || themeColors['pikachu-volleyball'];
  bg.addColorStop(0, '#000000');
  bg.addColorStop(0.6, '#050510');
  bg.addColorStop(1, '#000008');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.width; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0, 255, 255, 0.06)';
  for (let i = 0; i < canvas.height; i += 3) {
    ctx.fillRect(0, i, canvas.width, 1);
  }

  ctx.shadowColor = colors.neon ? '#00ff88' : '#00ffff';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 28px system-ui, sans-serif';
  ctx.fillText('INSERT COIN', 320, 160);

  ctx.shadowBlur = 8;
  ctx.font = '400 18px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('PRESS START', 320, 320);

  ctx.shadowBlur = 0;
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillText('가까이 다가가서 플레이하세요', 320, 420);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createRetroCabinet(game) {
  const group = new THREE.Group();
  const colors = themeColors[game.id] || themeColors['pikachu-volleyball'];

  const bodyMat = createMaterial(colors.primary, {
    roughness: 0.4,
    metalness: 0.15,
    emissive: colors.primary,
    emissiveIntensity: 0.08,
  });
  const accentMat = createMaterial(colors.accent, {
    roughness: 0.3,
    metalness: 0.3,
    emissive: colors.accent,
    emissiveIntensity: 0.15,
  });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(CABINET_WIDTH, CABINET_HEIGHT, CABINET_DEPTH),
    bodyMat,
  );
  body.position.y = CABINET_HEIGHT / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const accentStripV = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, CABINET_HEIGHT * 0.85, CABINET_DEPTH + 0.02),
    accentMat,
  );
  accentStripV.position.set(CABINET_WIDTH / 2 + 0.02, CABINET_HEIGHT / 2, 0);
  group.add(accentStripV);

  const accentStripV2 = accentStripV.clone();
  accentStripV2.position.x = -(CABINET_WIDTH / 2 + 0.02);
  group.add(accentStripV2);

  const marqueeMat = new THREE.MeshStandardMaterial({
    map: createMarqueeText(game),
    emissive: 0xffffff,
    emissiveIntensity: 0.5,
    emissiveMap: createMarqueeText(game),
    side: THREE.DoubleSide,
    transparent: true,
  });
  const marquee = new THREE.Mesh(
    new THREE.PlaneGeometry(MARQUEE_WIDTH, MARQUEE_HEIGHT),
    marqueeMat,
  );
  marquee.position.set(0, MARQUEE_Y, CABINET_DEPTH / 2 + 0.005);
  group.add(marquee);

  const bezelMat = createMaterial(0x111111, { roughness: 0.8, metalness: 0.0 });
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(SCREEN_WIDTH + 0.08, SCREEN_HEIGHT + 0.08, 0.04),
    bezelMat,
  );
  bezel.position.set(0, SCREEN_Y, CABINET_DEPTH / 2 + 0.005);
  group.add(bezel);

  const screenMat = new THREE.MeshBasicMaterial({
    map: createScreenTexture(game),
    toneMapped: false,
  });
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT),
    screenMat,
  );
  screen.position.set(0, SCREEN_Y, CABINET_DEPTH / 2 + 0.025);
  group.add(screen);

  const screenGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN_WIDTH + 0.15, SCREEN_HEIGHT + 0.15),
    new THREE.MeshBasicMaterial({
      color: colors.screen,
      transparent: true,
      opacity: 0.04,
      toneMapped: false,
    }),
  );
  screenGlow.position.set(0, SCREEN_Y, CABINET_DEPTH / 2 + 0.02);
  group.add(screenGlow);

  const controlPanelMat = createMaterial(0x222222, { roughness: 0.6, metalness: 0.1 });
  const controlPanel = new THREE.Mesh(
    new THREE.BoxGeometry(CONTROL_WIDTH, CONTROL_HEIGHT, 0.22),
    controlPanelMat,
  );
  controlPanel.position.set(0, CONTROL_Y, CABINET_DEPTH / 2 + 0.09);
  group.add(controlPanel);

  const joystickMat = createMaterial(0x333333, { roughness: 0.3, metalness: 0.4 });
  const joystickBase = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 8, 8),
    joystickMat,
  );
  joystickBase.position.set(-0.12, CONTROL_Y + 0.02, CABINET_DEPTH / 2 + 0.2);
  group.add(joystickBase);

  const joystickStick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.012, 0.045, 6),
    createMaterial(0x111111),
  );
  joystickStick.position.set(-0.12, CONTROL_Y + 0.045, CABINET_DEPTH / 2 + 0.2);
  group.add(joystickStick);

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.014, 6, 6),
    createMaterial(colors.accent, { emissive: colors.accent, emissiveIntensity: 0.2 }),
  );
  ball.position.set(-0.12, CONTROL_Y + 0.068, CABINET_DEPTH / 2 + 0.2);
  group.add(ball);

  [0.08, 0.14].forEach((dx) => {
    const btn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.018, 0.015, 6),
      createMaterial(0xcc2200, { emissive: 0xcc2200, emissiveIntensity: 0.15 }),
    );
    btn.position.set(dx, CONTROL_Y + 0.008, CABINET_DEPTH / 2 + 0.18);
    btn.rotation.x = 0;
    group.add(btn);
  });

  const coinMat = createMaterial(0x553300, {
    roughness: 0.7,
    metalness: 0.3,
    emissive: 0x553300,
    emissiveIntensity: 0.1,
  });
  const coinDoor = new THREE.Mesh(
    new THREE.PlaneGeometry(0.1, 0.14),
    coinMat,
  );
  coinDoor.position.set(0.2, 0.25, CABINET_DEPTH / 2 + 0.005);
  group.add(coinDoor);

  const neonMat = new THREE.MeshBasicMaterial({
    color: colors.neon,
    transparent: true,
    opacity: 0.6,
    toneMapped: false,
  });
  const neon = new THREE.Mesh(
    new THREE.BoxGeometry(CABINET_WIDTH + 0.08, 0.015, 0.015),
    neonMat,
  );
  neon.position.set(0, CABINET_HEIGHT + 0.01, CABINET_DEPTH / 2);
  group.add(neon);

  const neon2 = new THREE.Mesh(
    new THREE.BoxGeometry(CABINET_WIDTH + 0.08, 0.015, 0.015),
    neonMat,
  );
  neon2.position.set(0, CABINET_HEIGHT + 0.01, -CABINET_DEPTH / 2);
  group.add(neon2);

  group.userData.gameId = game.id;
  group.userData.gameUrl = game.gameUrl;
  group.userData.popup = game.popup;
  group.userData.collisionRadius = 0.45; // 충돌 감지용 반지름 (기존 0.55에서 조정)

  group.userData.update = (elapsed) => {
    const glow = screenGlow.material;
    glow.opacity = 0.03 + Math.sin(elapsed * 0.5) * 0.015;

    neonMat.opacity = 0.45 + Math.sin(elapsed * 1.2 + 0.5) * 0.15;

    ball.position.y = CONTROL_Y + 0.068 + Math.sin(elapsed * 2) * 0.003;
  };

  return group;
}
