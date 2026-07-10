import * as THREE from 'three';

const SPEAKER_BODY = {
  width: 1.15,
  height: 1.8,
  depth: 0.42,
};

function createMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.48,
    metalness: 0.16,
    ...options,
  });
}

function createWoofer(y, radius, accentColor) {
  const group = new THREE.Group();
  group.position.set(0, y, SPEAKER_BODY.depth / 2 + 0.018);

  const outer = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.045, 48),
    createMaterial(0x111317, {
      emissive: 0x05070a,
      emissiveIntensity: 0.4,
    }),
  );
  outer.rotation.x = Math.PI / 2;
  group.add(outer);

  const cone = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.72, radius * 0.38, 0.052, 48),
    createMaterial(0x252a2f, {
      emissive: accentColor,
      emissiveIntensity: 0.08,
      roughness: 0.72,
    }),
  );
  cone.rotation.x = Math.PI / 2;
  cone.position.z = 0.028;
  group.add(cone);

  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.22, 24, 12),
    new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.72,
      toneMapped: false,
    }),
  );
  cap.scale.z = 0.24;
  cap.position.z = 0.063;
  group.add(cap);

  return group;
}

export function createSpeakerExhibit(exhibit) {
  const group = new THREE.Group();
  const accentColor = exhibit.speakerAccentColor ?? 0xff35c8;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(SPEAKER_BODY.width, SPEAKER_BODY.height, SPEAKER_BODY.depth),
    createMaterial(0x15181d, {
      emissive: 0x05080c,
      emissiveIntensity: 0.34,
      roughness: 0.58,
      metalness: 0.2,
    }),
  );
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const grille = new THREE.Mesh(
    new THREE.BoxGeometry(SPEAKER_BODY.width - 0.16, SPEAKER_BODY.height - 0.16, 0.035),
    new THREE.MeshBasicMaterial({
      color: 0x060708,
      transparent: true,
      opacity: 0.7,
    }),
  );
  grille.position.z = SPEAKER_BODY.depth / 2 + 0.026;
  group.add(grille);

  group.add(createWoofer(0.24, 0.31, accentColor));
  group.add(createWoofer(-0.5, 0.24, accentColor));

  const tweeter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.04, 32),
    new THREE.MeshBasicMaterial({
      color: 0xdcecff,
      transparent: true,
      opacity: 0.86,
      toneMapped: false,
    }),
  );
  tweeter.rotation.x = Math.PI / 2;
  tweeter.position.set(0, -0.78, SPEAKER_BODY.depth / 2 + 0.06);
  group.add(tweeter);

  const glow = new THREE.PointLight(accentColor, 0.62, 3.2, 2);
  glow.position.set(0, 0.28, 0.68);
  group.add(glow);

  const neon = new THREE.Mesh(
    new THREE.BoxGeometry(SPEAKER_BODY.width + 0.08, 0.028, 0.028),
    new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.68,
      toneMapped: false,
    }),
  );
  neon.position.set(0, SPEAKER_BODY.height / 2 + 0.045, SPEAKER_BODY.depth / 2);
  group.add(neon);

  const scale = exhibit.scale ? Math.max(0.78, exhibit.scale * 0.72) : 1;
  group.scale.setScalar(scale);

  group.userData = {
    exhibitId: exhibit.id,
    title: exhibit.title,
    update: (elapsed) => {
      const pulse = 0.5 + Math.sin(elapsed * 2.1 + (exhibit.id || 0)) * 0.5;
      glow.intensity = 0.46 + pulse * 0.3;
      neon.material.opacity = 0.46 + pulse * 0.24;
      group.rotation.z = Math.sin(elapsed * 0.75 + (exhibit.id || 0)) * 0.008;
    },
  };

  return group;
}
