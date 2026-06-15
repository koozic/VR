import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const CHARACTER_COUNT = 18;
const ASSET_PATH = '/assets/blocky-characters/';
const TARGET_HEIGHT = 1.2;

const loader = new GLTFLoader();

function hashUserId(userId) {
  let hash = 0;
  const str = String(userId);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % CHARACTER_COUNT;
}

export function loadBlockyCharacter(userId) {
  const index = hashUserId(userId);
  const letter = String.fromCharCode(97 + index);
  const url = `${ASSET_PATH}character-${letter}.glb`;

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1;

        model.position.set(
          -center.x * scale,
          -bounds.min.y * scale,
          -center.z * scale,
        );
        model.scale.setScalar(scale);
        model.rotation.y = Math.PI;

        const mixer = new THREE.AnimationMixer(model);
        const clips = gltf.animations || [];
        const actions = {};

        clips.forEach((clip) => {
          const name = clip.name.toLowerCase();
          const action = mixer.clipAction(clip);
          action.enabled = true;
          if (name.includes('walk') || name.includes('run')) {
            actions.walk = action;
          } else if (name.includes('idle') || name.includes('stand') || name.includes('still')) {
            actions.idle = action;
          }
        });

        if (!actions.idle && clips.length > 0) {
          actions.idle = mixer.clipAction(clips[0]);
        }
        if (!actions.walk && clips.length > 1) {
          actions.walk = mixer.clipAction(clips[1]);
        }

        if (actions.idle) {
          actions.idle.play();
        } else if (actions.walk) {
          actions.walk.play();
        }

        resolve({ model, mixer, actions });
      },
      undefined,
      (error) => {
        console.error('Failed to load blocky character:', error);
        reject(error);
      },
    );
  });
}
