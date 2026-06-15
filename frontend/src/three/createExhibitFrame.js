/* 전시품용 액자(프레임) 생성. 썸네일(GIF 포함) 로드 or 절차적 아트 캔버스 */
import * as THREE from 'three';
import { parseGIF, decompressFrames } from 'gifuct-js';

const PALETTES = [
  ['#162320', '#2a6f69', '#d7b46a', '#f5ede0', '#834f3d'],
  ['#1b2030', '#4477a1', '#e6d4b3', '#f28c74', '#0f141d'],
  ['#283024', '#617c58', '#cbd7bd', '#eee8d5', '#a55f44'],
  ['#231b1a', '#565056', '#d6c1a2', '#8fb6c8', '#f2efe6'],
  ['#10232d', '#1f6473', '#f1c27d', '#e7ece9', '#31313a'],
  ['#2d211d', '#7f5f4f', '#f1e3c8', '#6e9f91', '#1a2421'],
];

function generateArtCanvas(title, seed) {
  const size = 768;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const colors = PALETTES[seed % PALETTES.length];
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.48, colors[1]);
  gradient.addColorStop(1, colors[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  ctx.globalAlpha = 0.96;
  ctx.fillStyle = colors[3];
  ctx.beginPath();
  ctx.moveTo(0, size * (0.62 + seed * 0.01));
  for (let x = 0; x <= size; x += 52) {
    const y = size * 0.55 + Math.sin((x + seed * 37) * 0.014) * 58;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(size, size);
  ctx.lineTo(0, size);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = colors[4];
  for (let i = 0; i < 8; i += 1) {
    const x = ((seed * 93 + i * 137) % size) + 20;
    const y = ((seed * 61 + i * 83) % 360) + 80;
    const w = 56 + ((seed + i) % 5) * 22;
    const h = 70 + ((seed + i * 2) % 6) * 18;
    ctx.fillRect(x - w * 0.5, y, w, h);
    ctx.fillStyle = i % 2 ? colors[1] : colors[4];
  }

  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 1200; i += 1) {
    const value = 190 + Math.random() * 65;
    ctx.fillStyle = `rgb(${value} ${value} ${value})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(8, 10, 10, 0.52)';
  ctx.fillRect(34, size - 92, size - 68, 48);
  ctx.fillStyle = '#fff8ed';
  ctx.font = '700 28px system-ui, sans-serif';
  ctx.fillText(title, 56, size - 60);

  return canvas;
}

function planeSizeFromAspect(imageW, imageH, maxW, maxH) {
  const aspect = imageW / imageH;
  let w = maxW;
  let h = w / aspect;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  return { w, h };
}

function resizeFrame(frameMesh, canvasW, canvasH) {
  const border = 0.14;
  frameMesh.geometry = new THREE.BoxGeometry(canvasW + border, canvasH + border, 0.12);
}

function loadStaticImage(url, material, canvasMesh, maxW, maxH, frameMesh) {
  const loader = new THREE.TextureLoader();
  loader.load(
    url,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      const { w, h } = planeSizeFromAspect(texture.image.width, texture.image.height, maxW, maxH);
      canvasMesh.geometry = new THREE.PlaneGeometry(w, h);
      resizeFrame(frameMesh, w, h);
      material.map = texture;
      material.emissiveMap = texture;
      material.color.setHex(0xffffff);
      material.needsUpdate = true;
    },
    undefined,
    () => {
      /* fallback: keep placeholder color */
    },
  );
}

async function loadAnimatedWebpTexture(url, material, state, canvasMesh, maxW, maxH, frameMesh) {
  if (!url) return;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load WebP: ${response.status}`);
    if (!window.ImageDecoder) throw new Error('Animated WebP decoding is not supported');

    const decoder = new ImageDecoder({
      data: await response.arrayBuffer(),
      type: 'image/webp',
    });
    await decoder.tracks.ready;
    const track = decoder.tracks.selectedTrack;
    const firstFrame = await decoder.decode({ frameIndex: 0 });
    const width = firstFrame.image.displayWidth;
    const height = firstFrame.image.displayHeight;
    const { w, h } = planeSizeFromAspect(width, height, maxW, maxH);
    canvasMesh.geometry = new THREE.PlaneGeometry(w, h);
    resizeFrame(frameMesh, w, h);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(firstFrame.image, 0, 0, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.anisotropy = 8;

    material.map = texture;
    material.emissiveMap = texture;
    material.color.setHex(0xffffff);
    material.needsUpdate = true;

    state.active = true;
    state.decoder = decoder;
    state.ctx = ctx;
    state.texture = texture;
    state.width = width;
    state.height = height;
    state.frameCount = track.frameCount;
    state.current = 0;
    state.delay = Math.max((firstFrame.image.duration || 100000) / 1000, 16);
    state.decoding = false;
    firstFrame.image.close();
  } catch {
    loadStaticImage(url, material, canvasMesh, maxW, maxH, frameMesh);
  }
}

export function updateAnimatedWebp(state, deltaMs) {
  if (!state?.active || state.decoding || state.frameCount <= 1) return;

  state.accum += deltaMs;
  if (state.accum < state.delay) return;

  state.accum %= state.delay;
  state.current = (state.current + 1) % state.frameCount;
  state.decoding = true;
  state.decoder.decode({ frameIndex: state.current })
    .then(({ image }) => {
      state.ctx.clearRect(0, 0, state.width, state.height);
      state.ctx.drawImage(image, 0, 0, state.width, state.height);
      state.delay = Math.max((image.duration || 100000) / 1000, 16);
      state.texture.needsUpdate = true;
      image.close();
    })
    .catch(() => {
      state.active = false;
    })
    .finally(() => {
      state.decoding = false;
    });
}

export function createExhibitFrame(exhibit) {
  const wide = exhibit.wide;
  const frameW = wide ? 2.6 : 1.8;
  const frameH = wide ? 1.6 : 2.2;
  const maxW = wide ? 2.26 : 1.5;
  const maxH = wide ? 1.26 : 1.88;

  const group = new THREE.Group();

  const frameMesh = new THREE.Mesh(
    new THREE.BoxGeometry(frameW, frameH, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x2b2926, roughness: 0.55 }),
  );
  group.add(frameMesh);

  const canvasMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.62,
    metalness: 0.05,
    emissive: 0xffffff,
    emissiveIntensity: 0.16,
  });
  const canvasMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(maxW, maxH),
    canvasMat,
  );
  canvasMesh.position.z = 0.08;
  group.add(canvasMesh);

  if (exhibit.title === 'Star Field') {
    const artworkGlow = new THREE.PointLight(0xcfe3ff, 0.55, 3.2, 2);
    artworkGlow.position.set(0, 0, 0.65);
    artworkGlow.castShadow = false;
    group.add(artworkGlow);
    canvasMat.emissiveIntensity = 0.28;
  }

  const gifState = {
    active: false,
    frames: [],
    current: 0,
    accum: 0,
    ctx: null,
    imageData: null,
    texture: null,
  };

  const webpState = { active: false, accum: 0 };

  const imageUrl = exhibit.thumbnailUrl;
  if (imageUrl) {
    if (imageUrl.match(/\.gif($|[?#])/i)) {
      loadGifTexture(imageUrl, canvasMat, gifState, canvasMesh, maxW, maxH, frameMesh);
    } else if (imageUrl.match(/\.webp($|[?#])/i)) {
      loadAnimatedWebpTexture(imageUrl, canvasMat, webpState, canvasMesh, maxW, maxH, frameMesh);
    } else {
      loadStaticImage(imageUrl, canvasMat, canvasMesh, maxW, maxH, frameMesh);
    }
  } else {
    const seed = exhibit.id != null ? Number(exhibit.id) || 1 : 1;
    const artCanvas = generateArtCanvas(exhibit.title, seed);
    const texture = new THREE.CanvasTexture(artCanvas);

    const { w, h } = planeSizeFromAspect(artCanvas.width, artCanvas.height, maxW, maxH);
    canvasMesh.geometry = new THREE.PlaneGeometry(w, h);
    resizeFrame(frameMesh, w, h);

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    canvasMat.map = texture;
    canvasMat.emissiveMap = texture;
    canvasMat.color.setHex(0xffffff);
    canvasMat.needsUpdate = true;
  }

  const scale = exhibit.scale ?? 1;
  if (scale !== 1) {
    group.scale.set(scale, scale, scale);
  }

  group.userData = {
    exhibitId: exhibit.id,
    title: exhibit.title,
    gifState,
    webpState,
  };

  return group;
}

async function loadGifTexture(url, material, state, canvasMesh, maxW, maxH, frameMesh) {
  if (!url) return;
  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const gif = parseGIF(buffer);
    const frames = decompressFrames(gif, true);
    if (frames.length === 0) return;

    const width = gif.lsd.width;
    const height = gif.lsd.height;

    if (canvasMesh) {
      const { w, h } = planeSizeFromAspect(width, height, maxW, maxH);
      canvasMesh.geometry = new THREE.PlaneGeometry(w, h);
      resizeFrame(frameMesh, w, h);
    }

    const gifCanvas = document.createElement('canvas');
    gifCanvas.width = width;
    gifCanvas.height = height;
    const ctx = gifCanvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);

    const texture = new THREE.CanvasTexture(gifCanvas);
    texture.minFilter = THREE.LinearFilter;

    material.map = texture;
    material.emissiveMap = texture;
    material.color.setHex(0xffffff);
    material.needsUpdate = true;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    state.active = true;
    state.frames = frames;
    state.width = width;
    state.height = height;
    state.current = 0;
    state.accum = 0;
    state.ctx = ctx;
    state.imageData = imageData;
    state.texture = texture;
    state.tempCanvas = tempCanvas;
    state.tempCtx = tempCtx;

    imageData.data.set(frames[0].patch);
    ctx.putImageData(imageData, 0, 0);
    texture.needsUpdate = true;
  } catch {
    /* fallback: keep placeholder color */
  }
}
