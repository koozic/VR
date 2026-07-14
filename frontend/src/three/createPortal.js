/* 전시실 간 이동용 포털 생성. 캔버스 텍스처 + 토러스 링 + 포인트 라이트 */
import * as THREE from 'three';

function toCssColor(value, fallback) {
  if (value == null) return fallback;
  return `#${new THREE.Color(value).getHexString()}`;
}

function normalizePortalLabel(label) {
  return String(label || '')
    .replace(/\s*입구\s*$/u, '')
    .trim();
}

function createPortalSignTexture({ label, glowColor, accentColor }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const text = normalizePortalLabel(label);

  ctx.fillStyle = '#08000f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, 'rgba(255, 53, 200, 0.2)');
  gradient.addColorStop(0.5, 'rgba(37, 217, 255, 0.25)');
  gradient.addColorStop(1, 'rgba(255, 53, 200, 0.2)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 12;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 28;
  ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let fontSize = 112;
  ctx.font = `900 ${fontSize}px system-ui, sans-serif`;
  while (ctx.measureText(text).width > 820 && fontSize > 54) {
    fontSize -= 4;
    ctx.font = `900 ${fontSize}px system-ui, sans-serif`;
  }

  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 28;
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 8;
  ctx.strokeText(text, 512, 128);

  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#f5fbff';
  ctx.fillText(text, 512, 128);

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  for (let y = 0; y < canvas.height; y += 8) {
    ctx.fillRect(0, y, canvas.width, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createPortalSign({ label, glowColor, ringColor }) {
  if (!label) return null;

  const sign = new THREE.Group();
  sign.name = 'portal-neon-sign';
  sign.position.set(0, 2.05, 0.03);

  const glowCss = toCssColor(glowColor, '#25d9ff');
  const accentCss = toCssColor(ringColor, '#ff35c8');
  const texture = createPortalSignTexture({
    label,
    glowColor: glowCss,
    accentColor: accentCss,
  });

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(2.65, 0.55, 0.12),
    new THREE.MeshStandardMaterial({
      color: 0x12041c,
      emissive: ringColor ?? 0x2a0838,
      emissiveIntensity: 0.65,
      roughness: 0.38,
      metalness: 0.45,
    }),
  );
  sign.add(frame);

  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(2.48, 0.42),
    new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false,
    }),
  );
  face.position.z = 0.066;
  sign.add(face);

  const light = new THREE.PointLight(glowColor ?? 0x75f2e8, 0.7, 3.4, 2);
  light.position.set(0, 0, 0.34);
  sign.add(light);

  return sign;
}

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
    labelText,
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

  const sign = createPortalSign({ label: labelText, glowColor, ringColor });
  if (sign) group.add(sign);

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
