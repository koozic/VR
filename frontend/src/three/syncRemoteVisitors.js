/* 매 프레임마다 다른 방문자들의 위치를 받아 아바타를 움직이거나 제거함 */
import * as THREE from 'three';
import { createRemoteVisitor } from './createRemoteVisitor.js';
import { disposeObject, offsetNearbyRemoteUser } from './sceneUtils.js';

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

    const emoteIsActive = user.emote
      && Number.isFinite(user.emoteReceivedAt)
      && Date.now() - user.emoteReceivedAt < 8000;
    object.userData.setEmote?.(emoteIsActive ? user.emote : null);
  });

  objectMap.forEach((object, userId) => {
    if (seen.has(userId)) return;
    scene.remove(object);
    disposeObject(object);
    objectMap.delete(userId);
  });
}
