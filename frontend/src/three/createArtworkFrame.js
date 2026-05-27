import * as THREE from 'three';

const palette = [0x315f72, 0xb5523a, 0x6d7f3f, 0xc4a35a];

export function createArtworkFrame(artwork) {
  const group = new THREE.Group();

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.7, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x2b2926, roughness: 0.55 }),
  );
  group.add(frame);

  const canvas = new THREE.Mesh(
    new THREE.PlaneGeometry(1.86, 1.34),
    new THREE.MeshStandardMaterial({
      color: palette[artwork.id % palette.length],
      roughness: 0.62,
      metalness: 0.05,
    }),
  );
  canvas.position.z = 0.08;
  group.add(canvas);

  const accent = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.16),
    new THREE.MeshStandardMaterial({ color: 0xf4eee2, roughness: 0.9 }),
  );
  accent.position.set(0, -0.42, 0.09);
  group.add(accent);

  group.userData = {
    artworkId: artwork.id,
    title: artwork.title,
  };

  return group;
}

