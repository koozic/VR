import * as THREE from 'three';
import { loadBlockyCharacter } from './loadBlockyCharacter.js';

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

    const crossFadeDuration = 0.25;
    let currentAction = idleAction || walkAction;

    function setMoving(moving) {
      const from = moving ? (idleAction || walkAction) : (walkAction || idleAction);
      const to = moving ? (walkAction || idleAction) : (idleAction || walkAction);
      if (!from || !to || from === to) return;
      from.crossFadeTo(to, crossFadeDuration, true);
      to.reset().play();
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
