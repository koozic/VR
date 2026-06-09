/* 같은 전시관에 있는 다른 방문자를 3D 아바타(파란색 원통 + 방향 표시)로 생성 */
import * as THREE from 'three';

export function createRemoteVisitor(user) {
  const group = new THREE.Group();
  group.name = `remote-${user.userId}`;

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 0.92, 16),
    new THREE.MeshStandardMaterial({
      color: 0x5ec8ff,
      roughness: 0.48,
      emissive: 0x10394a,
      emissiveIntensity: 0.28,
    }),
  );
  body.position.y = 0.62;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xf2f5ef,
      roughness: 0.42,
      emissive: 0x202c35,
      emissiveIntensity: 0.16,
    }),
  );
  head.position.y = 1.22;
  head.castShadow = true;
  group.add(head);

  const direction = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.28, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffcf66,
      roughness: 0.38,
      emissive: 0x5a3600,
      emissiveIntensity: 0.2,
    }),
  );
  direction.position.set(0, 1.2, -0.28);
  direction.rotation.x = Math.PI / 2;
  group.add(direction);

  return group;
}
