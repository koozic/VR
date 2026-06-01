import * as THREE from 'three';

export function findNearbyExhibit(visitorPosition, exhibitFrames, threshold = 3.2) {
  let closest = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const frame of exhibitFrames) {
    const distance = new THREE.Vector3(
      frame.position.x,
      visitorPosition.y,
      frame.position.z + 1.2,
    ).distanceTo(visitorPosition);

    if (distance < threshold && distance < closestDistance) {
      closest = frame.exhibit;
      closestDistance = distance;
    }
  }

  return closest;
}

