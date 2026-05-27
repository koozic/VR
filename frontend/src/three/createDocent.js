import * as THREE from 'three';

export function createDocent() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.32, 0.72, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0x264653, roughness: 0.55 }),
  );
  body.position.y = 0.86;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 32, 16),
    new THREE.MeshStandardMaterial({ color: 0xf2c6a0, roughness: 0.5 }),
  );
  head.position.y = 1.52;
  group.add(head);

  const badge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xe9c46a, roughness: 0.4 }),
  );
  badge.position.set(0.18, 1.04, 0.29);
  group.add(badge);

  return group;
}

