import * as THREE from 'three';
import { loadBlockyCharacter } from './loadBlockyCharacter.js';

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

  const nameLabel = createNameLabel(user.nickname || 'Visitor');
  nameLabel.position.y = 1.45;
  group.add(nameLabel);

  loadBlockyCharacter(user.userId).then(({ model, mixer, actions }) => {
    if (!group.parent) return;

    const walkAction = actions.walk;
    const idleAction = actions.idle;

    const crossFadeDuration = 0.15;
    let currentAction = idleAction || walkAction;
    let movingState = false;

    function setMoving(moving) {
      const to = moving ? (walkAction || idleAction) : (idleAction || walkAction);
      if (!to || movingState === moving) return;

      movingState = moving;
      if (currentAction === to) return;

      const from = currentAction;
      to.reset().play();
      if (from) {
        from.crossFadeTo(to, crossFadeDuration, true);
      }
      currentAction = to;
    }

    mixer.addEventListener('finished', () => {
      if (currentAction) currentAction.play();
    });

    group.userData.animMixer = mixer;
    group.userData.setMoving = setMoving;
    group.userData.modelLoaded = true;

    group.add(model);
  }).catch(() => {});

  const { sprite: emoteSprite, setEmote } = createEmoteSprite();
  group.add(emoteSprite);
  group.userData.emoteSprite = emoteSprite;
  group.userData.setEmote = setEmote;

  return group;
}

function createNameLabel(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 64;

  ctx.font = 'bold 22px "Noto Sans KR", sans-serif';

  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  const textWidth = ctx.measureText(text).width;
  const bgW = Math.max(textWidth + 32, 60);
  const bgH = 36;
  const rx = (canvas.width - bgW) / 2;
  const ry = (canvas.height - bgH) / 2;
  ctx.beginPath();
  ctx.roundRect(rx, ry, bgW, bgH, 8);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.8, 0.2, 1);
  return sprite;
}
