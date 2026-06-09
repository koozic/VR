/* 코드로 생성한 새턴 V 로켓 전시물. 3단 분리형 + 발사대 타워 포함 */
import * as THREE from 'three';

const ROCKET_POSITION = new THREE.Vector3(-5.5, 0, -8.0);

function createBasePlate() {
  const plate = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.2, 0.18, 40),
    new THREE.MeshStandardMaterial({
      color: 0x222d39,
      roughness: 0.72,
      metalness: 0.18,
      emissive: 0x0c1725,
      emissiveIntensity: 0.48,
    }),
  );
  base.position.y = 0.09;
  plate.add(base);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.12, 0.025, 10, 48),
    new THREE.MeshBasicMaterial({ color: 0x82a9ce }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.19;
  plate.add(rim);

  const gridMat = new THREE.MeshBasicMaterial({
    color: 0x4a5a6a,
    transparent: true,
    opacity: 0.3,
    wireframe: true,
  });
  const grid = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.05, 0.02, 8),
    gridMat,
  );
  grid.position.y = 0.185;
  plate.add(grid);

  return plate;
}

function createFin(angle) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.35, 0);
  shape.lineTo(0.35, 0.5);
  shape.lineTo(0, 0.6);
  shape.closePath();

  const geom = new THREE.ShapeGeometry(shape);
  const fin = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({
    color: 0xcc4444,
    roughness: 0.6,
    metalness: 0.1,
    emissive: 0x331111,
    emissiveIntensity: 0.15,
  }));
  fin.position.set(0, 0, 0);
  fin.rotation.y = angle;
  fin.rotation.x = -Math.PI / 2;
  return fin;
}

export function createRocket() {
  const exhibit = new THREE.Group();
  exhibit.name = 'rocket-exhibit';
  exhibit.position.copy(ROCKET_POSITION);
  exhibit.rotation.y = Math.atan2(-ROCKET_POSITION.x, -ROCKET_POSITION.z);

  exhibit.add(createBasePlate());

  const rocket = new THREE.Group();
  rocket.position.y = 0.22;
  exhibit.add(rocket);

  const keyLight = new THREE.SpotLight(0xd7ebff, 7, 10, Math.PI / 5, 0.5, 1.4);
  keyLight.position.set(0.8, 4.5, 1.5);
  keyLight.target.position.set(0, 1.8, 0);
  exhibit.add(keyLight, keyLight.target);

  const fillLight = new THREE.PointLight(0xb6d8ff, 4, 6, 1.35);
  fillLight.position.set(-1.0, 2.5, -1.0);
  exhibit.add(fillLight);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xe8eef0,
    roughness: 0.35,
    metalness: 0.15,
    emissive: 0x182838,
    emissiveIntensity: 0.15,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x404850,
    roughness: 0.5,
    metalness: 0.2,
    emissive: 0x101828,
    emissiveIntensity: 0.18,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xcc4444,
    roughness: 0.5,
    metalness: 0.1,
    emissive: 0x331111,
    emissiveIntensity: 0.12,
  });

  const stage1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.35, 1.0, 20),
    bodyMat,
  );
  stage1.position.y = 0.6;
  rocket.add(stage1);

  const stripe1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.305, 0.305, 0.06, 20),
    accentMat,
  );
  stripe1.position.y = 0.9;
  rocket.add(stripe1);

  const stripe2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.302, 0.302, 0.04, 20),
    darkMat,
  );
  stripe2.position.y = 0.3;
  rocket.add(stripe2);

  const interstage1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.3, 0.12, 20),
    darkMat,
  );
  interstage1.position.y = 1.16;
  rocket.add(interstage1);

  const stage2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.26, 0.8, 20),
    bodyMat,
  );
  stage2.position.y = 1.62;
  rocket.add(stage2);

  const interstage2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.24, 0.1, 20),
    darkMat,
  );
  interstage2.position.y = 2.07;
  rocket.add(interstage2);

  const stage3 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.2, 0.6, 20),
    bodyMat,
  );
  stage3.position.y = 2.42;
  rocket.add(stage3);

  const fairing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.18, 0.5, 20),
    new THREE.MeshStandardMaterial({
      color: 0xcc4444,
      roughness: 0.4,
      metalness: 0.1,
      emissive: 0x331111,
      emissiveIntensity: 0.12,
    }),
  );
  fairing.position.y = 2.97;
  rocket.add(fairing);

  const noseCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.15, 20),
    new THREE.MeshStandardMaterial({
      color: 0xf0f4f6,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x182838,
      emissiveIntensity: 0.12,
    }),
  );
  noseCone.position.y = 3.27;
  rocket.add(noseCone);

  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI * 2;
    const fin = createFin(angle);
    fin.position.y = 0.05;
    rocket.add(fin);
  }

  const nozzleMat = new THREE.MeshStandardMaterial({
    color: 0x303840,
    roughness: 0.6,
    metalness: 0.5,
    emissive: 0x101520,
    emissiveIntensity: 0.2,
  });
  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.28, 0.12, 20),
    nozzleMat,
  );
  nozzle.position.y = 0.04;
  rocket.add(nozzle);

  const towerMat = new THREE.MeshStandardMaterial({
    color: 0x5a6a7a,
    roughness: 0.6,
    metalness: 0.3,
    emissive: 0x1a2a3a,
    emissiveIntensity: 0.15,
  });
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 1.0, 0.06),
    towerMat,
  );
  tower.position.set(0.55, 0.6, 0);
  rocket.add(tower);

  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.04, 0.04),
    towerMat,
  );
  arm.position.set(0.4, 0.95, 0);
  rocket.add(arm);

  const arm2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.03, 0.03),
    towerMat,
  );
  arm2.position.set(0.38, 0.65, 0);
  rocket.add(arm2);

  exhibit.userData.update = (elapsed) => {
    rocket.position.y = 0.22 + Math.sin(elapsed * 0.35) * 0.015;
  };

  return exhibit;
}
