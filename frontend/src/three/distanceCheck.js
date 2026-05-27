import * as THREE from 'three';

export function findNearbyArtwork(visitorPosition, artworkFrames, threshold = 3.2) {
  let closest = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const frame of artworkFrames) {
    const distance = new THREE.Vector3(
      frame.position.x,
      visitorPosition.y,
      frame.position.z + 1.2,
    ).distanceTo(visitorPosition);

    if (distance < threshold && distance < closestDistance) {
      closest = frame.artwork;
      closestDistance = distance;
    }
  }

  return closest;
}

