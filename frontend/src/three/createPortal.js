/* 전시실 간 이동용 포털 생성. 캔버스 텍스처 + 토러스 링 + 포인트 라이트 */
import * as THREE from 'three';

function createPortalTexture() {
  const size = 512;
  const portalCanvas = document.createElement('canvas');
  portalCanvas.width = size;
  portalCanvas.height = size;
  const ctx = portalCanvas.getContext('2d');

  const gradient = ctx.createRadialGradient(256, 256, 34, 256, 256, 252);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.32, 'rgba(114, 222, 209, 0.72)');
  gradient.addColorStop(0.68, 'rgba(69, 106, 194, 0.54)');
  gradient.addColorStop(1, 'rgba(10, 13, 28, 0.02)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
  ctx.lineWidth = 5;
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    ctx.ellipse(256, 256, 84 + i * 22, 172 - i * 8, i * 0.35, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(portalCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.center.set(0.5, 0.5);
  return texture;
}

export function createPortal(options) {
  const {
    targetRoomId, targetPosX, targetPosZ, targetYaw,
    portalColor = 0xaef8ed,
    ringColor = 0x78e8db,
    ringEmissive = 0x247a75,
    glowColor = 0x75f2e8,
  } = options;

  const group = new THREE.Group();

  const texture = createPortalTexture();
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    color: portalColor,
    transparent: true,
    opacity: 0.86,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const surface = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 3.1), material);
  surface.position.z = 0.025;
  group.add(surface);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.18, 0.055, 18, 96),
    new THREE.MeshStandardMaterial({
      color: ringColor,
      emissive: ringEmissive,
      roughness: 0.26,
      metalness: 0.38,
    }),
  );
  ring.scale.y = 1.34;
  ring.castShadow = true;
  group.add(ring);

  const glow = new THREE.PointLight(glowColor, 1.6, 7, 2);
  glow.position.set(0, 0.15, 0.42);
  group.add(glow);

  group.userData = {
    type: 'portal',
    targetRoomId,
    targetPosX,
    targetPosZ,
    targetYaw,
    cooldown: 0,
    material,
    texture,
    portalGroup: group,
  };

  return group;
}
