/* 3D 장면에서 자주 쓰는 작은 도구들 모음 */

/* CSS 색상(#e8e0d2)을 Three.js 숫자 색상(0xe8e0d2)으로 변환 */
export function hexToThree(hex) {
  if (!hex) return 0xe8e0d2;
  const cleaned = hex.replace('#', '');
  const val = parseInt(cleaned, 16);
  return Number.isNaN(val) ? 0xe8e0d2 : val;
}

/* 3D 오브젝트의 메모리(gpu 자원)를 정리. 장면에서 제거할 때 호출 */
export function disposeObject(object) {
  object.traverse((child) => {
    if (!child.isMesh && !child.isSprite) return;
    child.geometry?.dispose?.();
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => {
        material.map?.dispose?.();
        material.dispose?.();
      });
    } else {
      child.material?.map?.dispose?.();
      child.material?.dispose?.();
    }
  });
}

/* 다른 방문자가 나와 너무 가까우면(0.9m 이하) 옆으로 밀어내서 겹치지 않게 함 */
export function offsetNearbyRemoteUser(userId, target, localPosition) {
  const flatDistance = localPosition
    ? Math.hypot(target.x - localPosition.x, target.z - localPosition.z)
    : Infinity;
  if (flatDistance >= 0.9) {
    return target;
  }

  const hash = Array.from(userId || 'visitor').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const angle = (hash % 360) * (Math.PI / 180);
  target.x += Math.cos(angle) * 1.15;
  target.z += Math.sin(angle) * 1.15;
  return target;
}
