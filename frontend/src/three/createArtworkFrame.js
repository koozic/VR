import * as THREE from 'three';
import { parseGIF, decompressFrames } from 'gifuct-js';

export function createArtworkFrame(artwork) {
  const group = new THREE.Group();

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.7, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x2b2926, roughness: 0.55 }),
  );
  group.add(frame);

  const canvasMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.62,
    metalness: 0.05,
  });
  const canvas = new THREE.Mesh(
    new THREE.PlaneGeometry(1.86, 1.34),
    canvasMat,
  );
  canvas.position.z = 0.08;
  group.add(canvas);

  const gifState = {
    active: false,
    frames: [],
    current: 0,
    accum: 0,
    ctx: null,
    imageData: null,
    texture: null,
  };

  loadGifTexture(artwork.imageUrl, canvasMat, gifState);

  group.userData = {
    artworkId: artwork.id,
    title: artwork.title,
    gifState,
  };

  return group;
}

async function loadGifTexture(url, material, state) {
  if (!url) return;

  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const gif = parseGIF(buffer);
    const frames = decompressFrames(gif, true);
    if (frames.length === 0) return;

    const width = gif.lsd.width;
    const height = gif.lsd.height;

    const gifCanvas = document.createElement('canvas');
    gifCanvas.width = width;
    gifCanvas.height = height;
    const ctx = gifCanvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);

    const texture = new THREE.CanvasTexture(gifCanvas);
    texture.minFilter = THREE.LinearFilter;

    material.map = texture;
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
    state.prevDims = null;
    state.prevDisposal = null;

    imageData.data.set(frames[0].patch);
    ctx.putImageData(imageData, 0, 0);
    texture.needsUpdate = true;
  } catch (e) {
    // fallback: keep placeholder color
  }
}
