import * as THREE from 'three';
import { loadGltfAsset } from './assetLoader.js';
import { assetUrl } from './assetUrl.js';

const CHARACTER_COUNT = 18;
const ASSET_PATH = assetUrl('assets/blocky-characters/');
const TARGET_HEIGHT = 1.2;
const FIRST_CHARACTER_CODE = 'a'.charCodeAt(0);
const LAST_CHARACTER_CODE = FIRST_CHARACTER_CODE + CHARACTER_COUNT - 1;

function hashUserId(userId) {
  let hash = 0;
  const str = String(userId);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % CHARACTER_COUNT;
}

function characterLetterFromId(characterId) {
  const match = String(characterId || '').match(/^character-([a-r])$/);
  if (!match) return null;

  const code = match[1].charCodeAt(0);
  return code >= FIRST_CHARACTER_CODE && code <= LAST_CHARACTER_CODE
    ? match[1]
    : null;
}

export function loadBlockyCharacter(userId, characterId) {
  const letter = characterLetterFromId(characterId)
    || String.fromCharCode(97 + hashUserId(userId));
  const url = `${ASSET_PATH}character-${letter}.glb`;

  return loadGltfAsset(url)
    .then(({ scene: model, animations }) => {
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
      const clips = animations || [];
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

      return { model, mixer, actions };
    })
    .catch((error) => {
      console.error('Failed to load blocky character:', error);
      throw error;
    });
}
