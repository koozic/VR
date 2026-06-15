import * as THREE from 'three';
import { createRemoteVisitor } from './createRemoteVisitor.js';
import { disposeObject, offsetNearbyRemoteUser } from './sceneUtils.js';

const motionStates = new Map();
const MOVEMENT_THRESHOLD = 0.005;
const MOVEMENT_HOLD_MS = 120;

export function syncRemoteVisitors(scene, objectMap, users, localPosition) {
  const seen = new Set();

  users.forEach((user) => {
    seen.add(user.userId);
    let object = objectMap.get(user.userId);
    if (!object) {
      object = createRemoteVisitor(user);
      objectMap.set(user.userId, object);
      scene.add(object);
    }

    const targetY = Math.max(0.05, (user.y ?? 1.6) - 1.35);
    const target = offsetNearbyRemoteUser(
      user.userId,
      new THREE.Vector3(user.x ?? 0, targetY, user.z ?? 0),
      localPosition,
    );
    object.position.lerp(target, 0.32);
    object.rotation.y = user.yaw ?? 0;

    if (object.userData.setMoving) {
      const now = performance.now();
      const sourceX = user.x ?? 0;
      const sourceZ = user.z ?? 0;
      const motion = motionStates.get(user.userId);
      const targetChanged = motion
        && (Math.abs(sourceX - motion.x) > MOVEMENT_THRESHOLD
          || Math.abs(sourceZ - motion.z) > MOVEMENT_THRESHOLD);

      if (!motion) {
        motionStates.set(user.userId, { x: sourceX, z: sourceZ, lastMovedAt: 0 });
      } else {
        if (targetChanged) {
          motion.lastMovedAt = now;
        }
        motion.x = sourceX;
        motion.z = sourceZ;
        object.userData.setMoving(now - motion.lastMovedAt < MOVEMENT_HOLD_MS);
      }
    }

    const emoteIsActive = user.emote
      && Number.isFinite(user.emoteReceivedAt)
      && Date.now() - user.emoteReceivedAt < 8000;
    object.userData.setEmote?.(emoteIsActive ? user.emote : null);
    if (emoteIsActive && object.userData.emoteSprite) {
      const pulse = 1 + Math.sin(Date.now() * 0.009) * 0.06;
      object.userData.emoteSprite.scale.set(1.65 * pulse, 0.62 * pulse, 1);
    }
  });

  objectMap.forEach((object, userId) => {
    if (seen.has(userId)) return;

    if (object.userData.animMixer) {
      object.userData.animMixer.stopAllAction();
    }
    scene.remove(object);
    disposeObject(object);
    objectMap.delete(userId);
    motionStates.delete(userId);
  });
}
