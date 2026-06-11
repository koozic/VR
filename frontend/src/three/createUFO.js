/* 코드로 생성한 UFO 전시물. 회전 돔 + 하단 컬러 라이트 + 부유 애니메이션 */
import * as THREE from "three";

const UFO_POSITION = new THREE.Vector3(6.0, 1.85, -5.0);

export function createUFO() {
  const exhibit = new THREE.Group();
  exhibit.name = "ufo-exhibit";
  exhibit.position.copy(UFO_POSITION);

  const mount = new THREE.Group();
  exhibit.add(mount);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.15,
    metalness: 0.9,
    emissive: 0x556677,
    emissiveIntensity: 0.3,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0xccccdd,
    roughness: 0.2,
    metalness: 0.85,
    emissive: 0x556677,
    emissiveIntensity: 0.25,
  });

  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 1.0, 0.2, 32),
    bodyMat,
  );
  disc.position.y = 0;
  mount.add(disc);

  const upperHull = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.7, 0.18, 32),
    bodyMat,
  );
  upperHull.position.y = 0.16;
  mount.add(upperHull);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      roughness: 0.05,
      metalness: 0.0,
      transparent: true,
      opacity: 0.4,
      emissive: 0x4488cc,
      emissiveIntensity: 0.1,
      envMapIntensity: 0.5,
    }),
  );
  dome.position.y = 0.32;
  mount.add(dome);

  const innerDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      emissive: 0x88ccff,
      emissiveIntensity: 0.5,
    }),
  );
  innerDome.position.set(0, 0.35, 0.12);
  mount.add(innerDome);

  const rimRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.025, 12, 48),
    new THREE.MeshBasicMaterial({
      color: 0x6688aa,
      transparent: true,
      opacity: 0.5,
    }),
  );
  rimRing.position.y = 0.05;
  rimRing.rotation.x = Math.PI / 2;
  mount.add(rimRing);

  const lowerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.88, 0.015, 12, 48),
    darkMat,
  );
  lowerRing.position.y = -0.05;
  lowerRing.rotation.x = Math.PI / 2;
  mount.add(lowerRing);

  const bottomLightColors = [
    0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff, 0x44ffff,
  ];
  const bottomLights = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2;
    const lightMat = new THREE.MeshStandardMaterial({
      color: bottomLightColors[i],
      emissive: bottomLightColors[i],
      emissiveIntensity: 0.8,
    });
    const lightMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      lightMat,
    );
    lightMesh.position.set(
      Math.cos(angle) * 0.75,
      -0.08,
      Math.sin(angle) * 0.75,
    );
    mount.add(lightMesh);
    bottomLights.push(lightMesh);
  }

  const centerLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      emissive: 0x88ccff,
      emissiveIntensity: 1.0,
    }),
  );
  centerLight.position.set(0, -0.1, 0);
  mount.add(centerLight);

  const glowRing = new THREE.Mesh(
    new THREE.RingGeometry(0.4, 0.9, 48),
    new THREE.MeshBasicMaterial({
      color: 0x4488cc,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  glowRing.position.y = -0.03;
  glowRing.rotation.x = -Math.PI / 2;
  mount.add(glowRing);

  exhibit.userData.update = (elapsed) => {
    mount.rotation.y += 0.008;
    mount.position.y = Math.sin(elapsed * 0.4 + 1.0) * 0.06;

    bottomLights.forEach((light, index) => {
      const phase = (index / bottomLights.length) * Math.PI * 2;
      light.material.emissiveIntensity =
        0.5 + Math.sin(elapsed * 2.0 + phase) * 0.4;
    });

    centerLight.material.emissiveIntensity =
      0.8 + Math.sin(elapsed * 3.0) * 0.3;
    glowRing.material.opacity = 0.04 + Math.sin(elapsed * 1.5) * 0.03;
    rimRing.material.opacity = 0.35 + Math.sin(elapsed * 1.2) * 0.15;
  };

  return exhibit;
}
