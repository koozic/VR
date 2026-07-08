import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { loadBlockyCharacter } from '../three/loadBlockyCharacter.js';
import { disposeObject } from '../three/sceneUtils.js';

const THUMBNAIL_SIZE = 128;
const thumbnailCache = new Map();
let renderQueue = Promise.resolve();

async function renderCharacterThumbnail(characterId) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
  camera.position.set(0, 0.66, 2.72);
  camera.lookAt(0, 0.54, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, false);
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const keyLight = new THREE.DirectionalLight(0xffefd2, 2.25);
  keyLight.position.set(2.2, 3.4, 3);
  scene.add(keyLight);
  scene.add(new THREE.HemisphereLight(0xdceeff, 0x2d3029, 1.35));

  let model = null;
  try {
    const loaded = await loadBlockyCharacter(`thumbnail-${characterId}`, characterId);
    model = loaded.model;
    model.rotation.y = 0;
    scene.add(model);
    renderer.render(scene, camera);
    return renderer.domElement.toDataURL('image/png');
  } finally {
    if (model) {
      scene.remove(model);
      disposeObject(model);
    }
    renderer.dispose();
  }
}

function getThumbnail(characterId) {
  const cached = thumbnailCache.get(characterId);
  if (cached) return cached;

  const promise = renderQueue
    .catch(() => {})
    .then(() => renderCharacterThumbnail(characterId));
  renderQueue = promise;
  thumbnailCache.set(characterId, promise);
  return promise;
}

export default function CharacterThumbnail({ characterId, fallbackSrc }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let active = true;
    setSrc(null);

    getThumbnail(characterId)
      .then((thumbnailSrc) => {
        if (active) setSrc(thumbnailSrc);
      })
      .catch(() => {
        if (active) setSrc(fallbackSrc || null);
      });

    return () => {
      active = false;
    };
  }, [characterId, fallbackSrc]);

  if (!src) {
    return <span className="character-option__loading" aria-hidden="true" />;
  }

  return <img src={src} alt="" />;
}
