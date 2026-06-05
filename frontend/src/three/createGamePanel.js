import * as THREE from 'three';

const PANEL_WIDTH = 3.84;
const PANEL_HEIGHT = 2.4;

function fitText(ctx, text, maxWidth, initialSize, minSize = 24) {
  let size = initialSize;
  do {
    ctx.font = `700 ${size}px system-ui, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  } while (size > minSize);
  return minSize;
}

function createPanelTexture(game) {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');

  const background = ctx.createRadialGradient(640, 380, 80, 640, 400, 760);
  background.addColorStop(0, '#21103a');
  background.addColorStop(0.68, '#10071c');
  background.addColorStop(1, '#050208');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255, 110, 199, 0.55)';
  ctx.lineWidth = 8;
  ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.28)';
  ctx.lineWidth = 3;
  ctx.strokeRect(64, 64, canvas.width - 128, canvas.height - 128);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff6ec7';
  ctx.shadowBlur = 26;
  ctx.fillStyle = '#ff9bdd';
  fitText(ctx, game.title, 1040, 76);
  ctx.fillText(game.title, 640, 310);

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(220, 190, 255, 0.72)';
  ctx.font = '500 30px system-ui, sans-serif';
  const subtitle = [game.creator, game.year].filter(Boolean).join(' · ');
  ctx.fillText(subtitle, 640, 405);

  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#62f6ff';
  ctx.font = '600 34px system-ui, sans-serif';
  ctx.fillText('가까이 다가가 게임 정보를 확인하세요', 640, 555);

  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#ffffff';
  for (let y = 0; y < canvas.height; y += 8) {
    ctx.fillRect(0, y, canvas.width, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function createGamePanel(game) {
  const group = new THREE.Group();

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(PANEL_WIDTH + 0.16, PANEL_HEIGHT + 0.16, 0.08),
    new THREE.MeshStandardMaterial({
      color: 0x24132d,
      emissive: 0x3a1248,
      emissiveIntensity: 0.45,
      roughness: 0.55,
      metalness: 0.25,
    }),
  );
  frame.castShadow = true;
  frame.receiveShadow = true;
  group.add(frame);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(PANEL_WIDTH, PANEL_HEIGHT),
    new THREE.MeshBasicMaterial({
      map: createPanelTexture(game),
      side: THREE.FrontSide,
      toneMapped: false,
    }),
  );
  screen.position.z = 0.045;
  group.add(screen);

  group.userData.gameUrl = game.gameUrl;
  group.userData.exhibitId = game.id;
  return group;
}
