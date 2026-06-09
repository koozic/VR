/* 코드로 생성한 블랙홀 전시물. 강착 원반, 제트, 입자 시스템을 애니메이션 */
import * as THREE from 'three';

const BLACKHOLE_POSITION = new THREE.Vector3(0, 0, -8.0);

function createAccretionTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  gradient.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.1, 'rgba(50, 20, 80, 0)');
  gradient.addColorStop(0.22, 'rgba(180, 60, 120, 0.95)');
  gradient.addColorStop(0.32, 'rgba(255, 120, 50, 0.98)');
  gradient.addColorStop(0.42, 'rgba(255, 200, 80, 0.9)');
  gradient.addColorStop(0.5, 'rgba(200, 180, 100, 0.7)');
  gradient.addColorStop(0.6, 'rgba(120, 100, 180, 0.5)');
  gradient.addColorStop(0.75, 'rgba(60, 50, 140, 0.2)');
  gradient.addColorStop(1.0, 'rgba(0, 0, 30, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 800; i += 1) {
    const r = 120 + Math.random() * 200;
    const angle = Math.random() * Math.PI * 2;
    const dx = 256 + Math.cos(angle) * r;
    const dy = 256 + Math.sin(angle) * r;
    const brightness = Math.random() * 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    ctx.fillRect(dx, dy, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

function createPedestal() {
  const pedestal = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.52, 0.16, 40),
    new THREE.MeshStandardMaterial({
      color: 0x1a2230,
      roughness: 0.8,
      metalness: 0.1,
      emissive: 0x0a1220,
      emissiveIntensity: 0.5,
    }),
  );
  base.position.y = 0.08;
  pedestal.add(base);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.47, 0.018, 10, 40),
    new THREE.MeshBasicMaterial({ color: 0x6a8aaa }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.17;
  pedestal.add(rim);
  return pedestal;
}

export function createBlackHole() {
  const exhibit = new THREE.Group();
  exhibit.name = 'black-hole-exhibit';
  exhibit.position.copy(BLACKHOLE_POSITION);
  exhibit.rotation.y = Math.atan2(-BLACKHOLE_POSITION.x, -BLACKHOLE_POSITION.z);

  exhibit.add(createPedestal());

  const mount = new THREE.Group();
  mount.position.y = 0.2;
  exhibit.add(mount);

  const keyLight = new THREE.SpotLight(0x8888ff, 3, 6, Math.PI / 5, 0.5, 1.4);
  keyLight.position.set(0.5, 2.5, 1.2);
  keyLight.target.position.set(0, 0.5, 0);
  exhibit.add(keyLight, keyLight.target);

  const fillLight = new THREE.PointLight(0x6644aa, 2.5, 4, 1.35);
  fillLight.position.set(-0.4, 1.2, -1.0);
  exhibit.add(fillLight);

  const eventHorizon = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 32, 24),
    new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.0,
      metalness: 0.0,
      emissive: 0x000000,
    }),
  );
  eventHorizon.position.y = 0.7;
  mount.add(eventHorizon);

  const horizonGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 24, 18),
    new THREE.MeshBasicMaterial({
      color: 0x442266,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  horizonGlow.position.y = 0.7;
  mount.add(horizonGlow);

  const diskMat = new THREE.MeshBasicMaterial({
    map: createAccretionTexture(),
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const diskGeometry = new THREE.RingGeometry(0.5, 1.8, 80);
  const disk = new THREE.Mesh(diskGeometry, diskMat);
  disk.position.y = 0.7;
  disk.rotation.x = -Math.PI / 3;
  mount.add(disk);

  const innerDiskMat = new THREE.MeshBasicMaterial({
    color: 0xff8844,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const innerDisk = new THREE.Mesh(
    new THREE.RingGeometry(0.35, 0.48, 48),
    innerDiskMat,
  );
  innerDisk.position.y = 0.7;
  innerDisk.rotation.x = -Math.PI / 3;
  mount.add(innerDisk);

  const outerGlow = new THREE.Mesh(
    new THREE.RingGeometry(1.8, 2.4, 64),
    new THREE.MeshBasicMaterial({
      color: 0x6644aa,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  outerGlow.position.y = 0.7;
  outerGlow.rotation.x = -Math.PI / 3;
  mount.add(outerGlow);

  const particleCount = 300;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSizes = new Float32Array(particleCount);
  const particleSpeeds = new Float32Array(particleCount);
  const particleRadii = new Float32Array(particleCount);
  const particleAngles = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i += 1) {
    particleRadii[i] = 0.5 + Math.random() * 1.8;
    particleAngles[i] = Math.random() * Math.PI * 2;
    particleSpeeds[i] = 0.3 + Math.random() * 0.8;
    particleSizes[i] = 0.015 + Math.random() * 0.025;
    const offsetY = (Math.random() - 0.5) * 0.15;
    particlePositions[i * 3] = Math.cos(particleAngles[i]) * particleRadii[i];
    particlePositions[i * 3 + 1] = 0.7 + offsetY;
    particlePositions[i * 3 + 2] = Math.sin(particleAngles[i]) * particleRadii[i];
  }

  const particleGeom = new THREE.BufferGeometry();
  particleGeom.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
  particleGeom.setAttribute('size', new THREE.Float32BufferAttribute(particleSizes, 1));

  const particleMat = new THREE.PointsMaterial({
    color: 0xffaa66,
    size: 0.025,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(particleGeom, particleMat);
  mount.add(particles);

  const jetGroup = new THREE.Group();
  jetGroup.position.y = 0.7;

  const jetMat = new THREE.MeshBasicMaterial({
    color: 0x8866ff,
    transparent: true,
    opacity: 0.06,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const jetGeometry = new THREE.ConeGeometry(0.02, 0.8, 6);

  const jetTop = new THREE.Mesh(jetGeometry, jetMat);
  jetTop.position.set(0, 0.5, 0);
  jetTop.rotation.x = 0;
  jetGroup.add(jetTop);

  const jetBottom = new THREE.Mesh(jetGeometry.clone(), jetMat);
  jetBottom.position.set(0, -0.5, 0);
  jetBottom.rotation.x = Math.PI;
  jetGroup.add(jetBottom);

  mount.add(jetGroup);

  exhibit.userData.update = (elapsed, delta) => {
    disk.rotation.z += delta * 0.4;
    innerDisk.rotation.z += delta * 0.7;
    outerGlow.rotation.z += delta * 0.15;

    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i += 1) {
      particleAngles[i] += delta * particleSpeeds[i] * (0.5 / Math.max(particleRadii[i], 0.3));
      const r = particleRadii[i];
      pos[i * 3] = Math.cos(particleAngles[i]) * r;
      pos[i * 3 + 1] = 0.7 + Math.sin(elapsed * 0.5 + i * 0.1) * 0.05;
      pos[i * 3 + 2] = Math.sin(particleAngles[i]) * r;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    horizonGlow.material.opacity = 0.12 + Math.sin(elapsed * 1.2) * 0.05;
    innerDiskMat.opacity = 0.15 + Math.sin(elapsed * 2.0) * 0.08;
    particleMat.opacity = 0.55 + Math.sin(elapsed * 0.7) * 0.2;
    jetGroup.rotation.y += delta * 0.2;
  };

  return exhibit;
}
