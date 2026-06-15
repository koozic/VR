/* 같은 전시관에 있는 다른 방문자를 3D 아바타(파란색 원통 + 방향 표시)로 생성 */
import * as THREE from 'three';

const EMOTE_ICONS = Object.freeze({
  WAVE: '👋',
  CLAP: '👏',
  HEART: '❤️',
  POINT: '😂',
});

function roundedRectangle(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function createEmoteSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(0, 1.82, 0);
  sprite.scale.set(1.65, 0.62, 1);
  sprite.renderOrder = 10_000;
  sprite.frustumCulled = false;
  sprite.visible = false;

  let currentEmote = null;
  const setEmote = (emote) => {
    if (currentEmote === emote) {
      return;
    }
    currentEmote = emote;

    const label = EMOTE_ICONS[emote];
    if (!label) {
      sprite.visible = false;
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    roundedRectangle(context, 12, 10, 232, 70, 24);
    context.fillStyle = 'rgba(17, 24, 27, 0.96)';
    context.fill();
    context.strokeStyle = '#ffe9a8';
    context.lineWidth = 5;
    context.stroke();
    context.fillStyle = '#fff7e8';
    context.font = '42px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(label, 128, 46);
    texture.needsUpdate = true;
    sprite.visible = true;
  };

  return { sprite, setEmote };
}

export function createRemoteVisitor(user) {
  const group = new THREE.Group();
  group.name = `remote-${user.userId}`;

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 0.92, 16),
    new THREE.MeshStandardMaterial({
      color: 0x5ec8ff,
      roughness: 0.48,
      emissive: 0x10394a,
      emissiveIntensity: 0.28,
    }),
  );
  body.position.y = 0.62;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xf2f5ef,
      roughness: 0.42,
      emissive: 0x202c35,
      emissiveIntensity: 0.16,
    }),
  );
  head.position.y = 1.22;
  head.castShadow = true;
  group.add(head);

  const direction = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.28, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffcf66,
      roughness: 0.38,
      emissive: 0x5a3600,
      emissiveIntensity: 0.2,
    }),
  );
  direction.position.set(0, 1.2, -0.28);
  direction.rotation.x = Math.PI / 2;
  group.add(direction);

  const { sprite: emoteSprite, setEmote } = createEmoteSprite();
  group.add(emoteSprite);
  group.userData.emoteSprite = emoteSprite;
  group.userData.setEmote = setEmote;

  return group;
}
