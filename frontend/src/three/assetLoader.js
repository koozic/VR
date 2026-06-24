/* Shared GLTF/DRACO loader cache for reusable 3D assets. */

import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { assetUrl } from './assetUrl.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(assetUrl('assets/draco/'));

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const gltfCache = new Map();

THREE.Cache.enabled = true;

function cloneMaterial(material) {
  if (!material) return material;
  if (Array.isArray(material)) return material.map((entry) => entry?.clone?.() || entry);
  return material.clone?.() || material;
}

function cloneSceneForUse(sourceScene) {
  const clone = SkeletonUtils.clone(sourceScene);
  clone.traverse((child) => {
    if (!child.isMesh) return;
    child.geometry = child.geometry?.clone?.() || child.geometry;
    child.material = cloneMaterial(child.material);
  });
  return clone;
}

export function loadGltf(url) {
  let cached = gltfCache.get(url);
  if (!cached) {
    cached = gltfLoader.loadAsync(url);
    gltfCache.set(url, cached);
  }
  return cached;
}

export async function loadGltfScene(url) {
  const gltf = await loadGltf(url);
  return cloneSceneForUse(gltf.scene);
}

export async function loadGltfAsset(url) {
  const gltf = await loadGltf(url);
  return {
    scene: cloneSceneForUse(gltf.scene),
    animations: gltf.animations || [],
  };
}
