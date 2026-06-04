import * as THREE from 'three';

const _toTarget = new THREE.Vector3();

export function findNearbyExhibit(visitorPosition, exhibitFrames, threshold = 3.2, cameraForward = null) {
  let closest = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const frame of exhibitFrames) {
    const distance = new THREE.Vector3(
      frame.position.x,
      visitorPosition.y,
      frame.position.z,
    ).distanceTo(visitorPosition);

    if (distance < threshold && distance < closestDistance) {
      if (cameraForward) {
        _toTarget.copy(frame.position).sub(visitorPosition).normalize();
        if (cameraForward.angleTo(_toTarget) > Math.PI / 3) continue;
      }
      closest = frame.exhibit;
      closestDistance = distance;
    }
  }

  return closest;
}

export function findNearestExhibit(visitorPosition, exhibitFrames) {
  let closest = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const frame of exhibitFrames) {
    const distance = new THREE.Vector3(
      frame.position.x,
      visitorPosition.y,
      frame.position.z,
    ).distanceTo(visitorPosition);

    if (distance < closestDistance) {
      closest = frame.exhibit;
      closestDistance = distance;
    }
  }

  return closest ? { exhibit: closest, distance: Math.round(closestDistance * 10) / 10 } : null;
}
