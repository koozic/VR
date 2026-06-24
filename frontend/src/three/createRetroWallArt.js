import * as THREE from 'three';

const POSTERS = [
  {
    title: 'INSERT COIN',
    subtitle: 'ARCADE FLOOR',
    colors: ['#ff2fd6', '#27d8ff'],
    position: [-6.2, 2.25, -10.86],
    rotationY: 0,
  },
  {
    title: 'HIGH SCORE',
    subtitle: '999999',
    colors: ['#ffe66d', '#ff3d81'],
    position: [0, 2.25, -10.86],
    rotationY: 0,
  },
  {
    title: 'PRESS START',
    subtitle: 'READY PLAYER',
    colors: ['#7cff6b', '#35a7ff'],
    position: [6.2, 2.25, -10.86],
    rotationY: 0,
  },
  {
    title: 'NEON DRIVE',
    subtitle: 'MIDNIGHT RUN',
    colors: ['#a367ff', '#00f5d4'],
    position: [-8.86, 2.25, 0],
    rotationY: Math.PI / 2,
  },
  {
    title: 'PIXEL HERO',
    subtitle: '8 BIT LEGEND',
    colors: ['#ff9f1c', '#ff3d81'],
    position: [8.86, 2.25, 0],
    rotationY: -Math.PI / 2,
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

function createPosterLight(color, position, roomY) {
  const light = new THREE.PointLight(color, 0.55, 4.2, 2);
  light.position.set(position[0], roomY + position[1] + 0.15, position[2]);
  return light;
}

export function createRetroWallArt(scene, roomY = 0) {
  const group = new THREE.Group();
  group.name = 'retro-wall-art';

  POSTERS.forEach((poster) => {
    const texture = createPosterTexture(poster);
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 2.15, 0.08),
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

    const image = new THREE.Mesh(
      new THREE.PlaneGeometry(1.48, 1.94),
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
    image.position.z = 0.046;
    frame.add(image);
    group.add(frame);

    group.add(createPosterLight(new THREE.Color(poster.colors[0]), poster.position, roomY));
  });

  scene.add(group);
  return group;
}
