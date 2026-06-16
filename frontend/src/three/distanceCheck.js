/* 유저 위치와 전시품 간 거리 계산 함수. 카메라 시야각을 함께 반영할 수 있다. */
import * as THREE from 'three';

const _toTarget = new THREE.Vector3();
const _flatForward = new THREE.Vector3();

function isInsideCameraView(visitorPosition, targetPosition, cameraForward, maxAngle = Math.PI / 3) {
  if (!cameraForward) return true;

  _flatForward.copy(cameraForward);
  _flatForward.y = 0;
  if (_flatForward.lengthSq() === 0) return true;
  _flatForward.normalize();

  _toTarget.set(
    targetPosition.x - visitorPosition.x,
    0,
    targetPosition.z - visitorPosition.z,
  );
  if (_toTarget.lengthSq() === 0) return true;
  _toTarget.normalize();

  return _flatForward.angleTo(_toTarget) <= maxAngle;
}

export function findNearbyExhibit(visitorPosition, exhibitFrames, threshold = 3.2, cameraForward = null) {
  let closest = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const frame of exhibitFrames) {
    if (!isInsideCameraView(visitorPosition, frame.position, cameraForward)) {
      continue;
    }

    const distance = new THREE.Vector3(
      frame.position.x,
      visitorPosition.y,
      frame.position.z,
    ).distanceTo(visitorPosition);

    if (distance < threshold && distance < closestDistance) {
      closest = frame.exhibit;
      closestDistance = distance;
    }
  }

  return closest;
}

export function findNearestExhibit(visitorPosition, exhibitFrames, cameraForward = null) {
  let closest = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const frame of exhibitFrames) {
    if (!isInsideCameraView(visitorPosition, frame.position, cameraForward)) {
      continue;
    }

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
