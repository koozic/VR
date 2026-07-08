import * as THREE from 'three';

const POSTER_SCALE = 1.35;
const POSTER_MAX_WIDTH = 1.48 * POSTER_SCALE;
const POSTER_MAX_HEIGHT = 1.94 * POSTER_SCALE;
const FRAME_PADDING = 0.24;

const POSTERS = [
  {
    title: 'INSERT COIN',
    subtitle: 'ARCADE FLOOR',
    colors: ['#ff2fd6', '#27d8ff'],
    gameId: 'initial-d',
    imageUrl: 'https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/initialD.jpg',
    position: [-6.2, 2.25, -10.86],
    rotationY: 0,
  },
  {
    title: 'PRESS START',
    subtitle: 'READY PLAYER',
    colors: ['#7cff6b', '#35a7ff'],
    gameId: 'tech-romancer',
    imageUrl: 'https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/kikaio.webp',
    position: [6.2, 2.25, -10.86],
    rotationY: 0,
  },
  {
    title: 'NEON DRIVE',
    subtitle: 'MIDNIGHT RUN',
    colors: ['#a367ff', '#00f5d4'],
    gameId: 'age-of-war',
    imageUrl: 'https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/ageOfWar.jpg',
    position: [-8.86, 2.25, 0],
    rotationY: Math.PI / 2,
  },
  {
    title: 'PIXEL HERO',
    subtitle: '8 BIT LEGEND',
    colors: ['#ff9f1c', '#ff3d81'],
    gameId: 'pikachu-volleyball',
    imageUrl: 'https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/pika.png',
    position: [8.86, 2.25, 0],
    rotationY: -Math.PI / 2,
  },
  {
    title: 'HIGH SCORE',
    subtitle: 'HALL OF FAME',
    colors: ['#ffe45e', '#ff3d81'],
    gameId: 'tetrio',
    imageUrl: 'https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/tetris.jpg',
    position: [0, 2.25, 10.86],
    rotationY: Math.PI,
  },
];

function createPosterTexture({ title, subtitle, colors }) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#080016');
  gradient.addColorStop(0.5, '#160328');
  gradient.addColorStop(1, '#04000a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = colors[0];
  ctx.lineWidth = 18;
  ctx.shadowColor = colors[0];
  ctx.shadowBlur = 28;
  ctx.strokeRect(54, 54, canvas.width - 108, canvas.height - 108);

  ctx.shadowColor = colors[1];
  ctx.shadowBlur = 22;
  ctx.strokeStyle = colors[1];
  ctx.lineWidth = 6;
  for (let y = 160; y < 860; y += 74) {
    ctx.beginPath();
    ctx.moveTo(120, y);
    ctx.lineTo(canvas.width - 120, y);
    ctx.stroke();
  }

  ctx.shadowColor = colors[0];
  ctx.shadowBlur = 34;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 86px system-ui, sans-serif';
  title.split(' ').forEach((word, index, words) => {
    ctx.fillText(word, canvas.width / 2, 390 + (index - (words.length - 1) / 2) * 92);
  });

  ctx.shadowColor = colors[1];
  ctx.shadowBlur = 18;
  ctx.font = '700 42px system-ui, sans-serif';
  ctx.fillStyle = colors[1];
  ctx.fillText(subtitle, canvas.width / 2, 760);

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  for (let y = 0; y < canvas.height; y += 8) {
    ctx.fillRect(0, y, canvas.width, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function loadPosterImage(poster, onLoad) {
  if (!poster.imageUrl) return createPosterTexture(poster);

  const texture = new THREE.TextureLoader().load(
    poster.imageUrl,
    (loadedTexture) => onLoad?.(loadedTexture.image),
    undefined,
    () => {
      console.warn(`Failed to load retro poster image: ${poster.imageUrl}`);
    },
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createPosterLight(color, position, roomY) {
  const light = new THREE.PointLight(color, 0.65, 5.2, 2);
  light.position.set(position[0], roomY + position[1] + 0.15, position[2]);
  return light;
}

function createNeonRim(color) {
  const rim = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  ['top', 'bottom', 'left', 'right'].forEach((name) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.025), material);
    bar.name = name;
    bar.position.z = 0.071;
    rim.add(bar);
  });

  return rim;
}

function resizeNeonRim(rim, width, height) {
  const thickness = 0.035;
  const top = rim.getObjectByName('top');
  const bottom = rim.getObjectByName('bottom');
  const left = rim.getObjectByName('left');
  const right = rim.getObjectByName('right');

  top.scale.set(width, thickness, 1);
  bottom.scale.set(width, thickness, 1);
  top.position.y = height / 2;
  bottom.position.y = -height / 2;

  left.scale.set(thickness, height, 1);
  right.scale.set(thickness, height, 1);
  left.position.x = -width / 2;
  right.position.x = width / 2;
}

function resizePoster(frame, image, neonRim, sourceWidth, sourceHeight) {
  const aspect = sourceWidth / sourceHeight;
  const frameAspect = POSTER_MAX_WIDTH / POSTER_MAX_HEIGHT;
  const width = aspect >= frameAspect ? POSTER_MAX_WIDTH : POSTER_MAX_HEIGHT * aspect;
  const height = aspect >= frameAspect ? POSTER_MAX_WIDTH / aspect : POSTER_MAX_HEIGHT;
  const frameWidth = width + FRAME_PADDING;
  const frameHeight = height + FRAME_PADDING;

  frame.geometry.dispose();
  frame.geometry = new THREE.BoxGeometry(frameWidth, frameHeight, 0.08);
  image.scale.set(width, height, 1);
  resizeNeonRim(neonRim, frameWidth + 0.035, frameHeight + 0.035);
}

export function createRetroWallArt(scene, roomY = 0) {
  const group = new THREE.Group();
  group.name = 'retro-wall-art';
  group.userData.posterFrames = [];

  POSTERS.forEach((poster) => {
    const initialFrameWidth = POSTER_MAX_WIDTH + FRAME_PADDING;
    const initialFrameHeight = POSTER_MAX_HEIGHT + FRAME_PADDING;
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(initialFrameWidth, initialFrameHeight, 0.08),
      new THREE.MeshStandardMaterial({
        color: 0x12081a,
        roughness: 0.42,
        metalness: 0.35,
        emissive: 0x1b0826,
        emissiveIntensity: 0.35,
      }),
    );
    frame.position.set(poster.position[0], roomY + poster.position[1], poster.position[2]);
    frame.rotation.y = poster.rotationY;

    const neonRim = createNeonRim(new THREE.Color(poster.colors[0]));
    resizeNeonRim(neonRim, initialFrameWidth + 0.035, initialFrameHeight + 0.035);
    frame.add(neonRim);

    let image = null;
    const texture = loadPosterImage(poster, (sourceImage) => {
      if (!image || !sourceImage?.width || !sourceImage?.height) return;
      resizePoster(frame, image, neonRim, sourceImage.width, sourceImage.height);
    });
    image = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshStandardMaterial({
        map: texture,
        emissive: 0xffffff,
        emissiveMap: texture,
        emissiveIntensity: 0.32,
        roughness: 0.5,
        metalness: 0.02,
        side: THREE.DoubleSide,
      }),
    );
    image.scale.set(POSTER_MAX_WIDTH, POSTER_MAX_HEIGHT, 1);
    image.position.z = 0.046;
    frame.add(image);
    group.add(frame);
    group.userData.posterFrames.push({
      object: frame,
      position: frame.position.clone(),
      gameId: poster.gameId,
    });

    group.add(createPosterLight(new THREE.Color(poster.colors[0]), poster.position, roomY));
  });

  scene.add(group);
  return group;
}
