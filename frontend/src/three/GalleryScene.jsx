import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { createExhibitFrame } from './createExhibitFrame.js';
import { createYouTubePanel } from './createYouTubePanel.js';
import { createGamePanel } from './createGamePanel.js';
import { createPortal } from './createPortal.js';
import { createDocent } from './createDocent.js';
import { createSolarSystem } from './createSolarSystem.js';
import { createSpaceShuttle } from './createSpaceShuttle.js';
import { createAstronaut } from './createAstronaut.js';
import { createGeminiSpacesuit } from './createGeminiSpacesuit.js';
import { createMarsRover } from './createMarsRover.js';
import { createRocket } from './createRocket.js';
import { createSatellite } from './createSatellite.js';
import { createUFO } from './createUFO.js';
import { createBlackHole } from './createBlackHole.js';
import { spaceGalleryModels } from './spaceGalleryDescriptions.js';
import { greekSculptureModels } from './greekSculptureDescriptions.js';
import { createGreekSculpture } from './createGreekSculpture.js';
import { findNearbyExhibit, findNearestExhibit } from './distanceCheck.js';
import { buildRoom } from './buildRoom.js';
import { setupLighting } from './setupLighting.js';
import { placeExhibitOnWall } from './placeExhibit.js';
import { syncRemoteVisitors } from './syncRemoteVisitors.js';

/* 3D 전시관의 핵심 컴포넌트. 방 생성 → 작품 배치 → 유저 이동 → 애니메이션까지 전부 관리 */

export default function GalleryScene({
  exhibits,
  roomConfig,
  onExhibitFocus,
  onProximityUpdate,
  onRoomChange,
  cameraTarget,
  remoteUsers = [],
  onLocalPoseChange,
}) {
  /* 첫 번째 useEffect: WebGL/CSS3D 렌더러 생성 (컴포넌트 마운트 시 1회만 실행) */
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const cssRendererRef = useRef(null);
  /* 현재 포커스된 작품 ID (중복 호출 방지) */
  const focusRef = useRef(null);
  /* props가 바뀌어도 애니메이션 루프 안에서는 ref로 접근 (useEffect 재실행 방지) */
  const onExhibitFocusRef = useRef(onExhibitFocus);
  const onProximityUpdateRef = useRef(onProximityUpdate);
  const onRoomChangeRef = useRef(onRoomChange);
  const onLocalPoseChangeRef = useRef(onLocalPoseChange);
  const cameraTargetRef = useRef(null);
  const remoteUsersRef = useRef(remoteUsers);

  useEffect(() => { onExhibitFocusRef.current = onExhibitFocus; }, [onExhibitFocus]);
  useEffect(() => { onProximityUpdateRef.current = onProximityUpdate; }, [onProximityUpdate]);
  useEffect(() => { onRoomChangeRef.current = onRoomChange; }, [onRoomChange]);
  useEffect(() => { onLocalPoseChangeRef.current = onLocalPoseChange; }, [onLocalPoseChange]);
  useEffect(() => { remoteUsersRef.current = remoteUsers; }, [remoteUsers]);
  useEffect(() => { cameraTargetRef.current = cameraTarget; }, [cameraTarget]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.domElement.className = 'scene-webgl';
    container.appendChild(renderer.domElement);

    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(container.clientWidth, container.clientHeight);
    cssRenderer.domElement.className = 'scene-css3d';
    container.appendChild(cssRenderer.domElement);

    rendererRef.current = renderer;
    cssRendererRef.current = cssRenderer;

    const handleResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      cssRenderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      container.removeChild(cssRenderer.domElement);
    };
  }, []);

  /* 두 번째 useEffect: 전시관(exhibits/roomConfig)이 바뀔 때마다 3D 장면을 처음부터 다시 그림 */
  useEffect(() => {
    const container = containerRef.current;
    const renderer = rendererRef.current;
    const cssRenderer = cssRendererRef.current;
    if (!container || !renderer || !exhibits) return;

    const cameraY = roomConfig?.cameraY ?? 1.6;
    const roomY = cameraY - 1.6;

    /* 장면 생성 + 전시관 타입별 배경색/안개 */
    const scene = new THREE.Scene();
    const isSpaceGallery = Number(roomConfig?.id) === 2;
    const isHistoryGallery = Number(roomConfig?.id) === 3;
    const isRetroGallery = Number(roomConfig?.id) === 4;
    renderer.toneMappingExposure = isSpaceGallery ? 0.78 : isHistoryGallery ? 0.95 : isRetroGallery ? 0.7 : 1.04;
    scene.background = new THREE.Color(isSpaceGallery ? 0x080b11 : isHistoryGallery ? 0x1a1510 : isRetroGallery ? 0x08040c : 0x111414);
    scene.fog = new THREE.Fog(isSpaceGallery ? 0x080b11 : isHistoryGallery ? 0x1a1510 : isRetroGallery ? 0x08040c : 0x111414, 14, 36);

    const camera = new THREE.PerspectiveCamera(
      72,
      container.clientWidth / container.clientHeight,
      0.1, 100,
    );
    const ct = cameraTargetRef.current;
    if (ct) {
      camera.position.set(ct.x, cameraY, ct.z);
    } else {
      camera.position.set(0, cameraY, 8.2);
    }

    /* 방 구조와 조명은 별도 파일에 위임 */
    buildRoom(scene, roomConfig, roomY);
    setupLighting(scene, roomConfig, roomY);

    /* frames: 벽에 걸린 작품들 / retroGameFrames: 게임 패널 / portalObjects: 포탈 / remoteUserObjects: 다른 방문자 */
    const frames = [];
    const retroGameFrames = [];
    const portalObjects = [];
    const remoteUserObjects = new Map();
    const solarSystem = isSpaceGallery ? createSolarSystem() : null;
    const spaceShuttle = isSpaceGallery ? createSpaceShuttle() : null;
    const astronaut = isSpaceGallery ? createAstronaut() : null;
    const geminiSpacesuit = isSpaceGallery ? createGeminiSpacesuit() : null;
    const marsRover = isSpaceGallery ? createMarsRover() : null;
    const rocket = isSpaceGallery ? createRocket() : null;
    const satellite = isSpaceGallery ? createSatellite() : null;
    const ufo = isSpaceGallery ? createUFO() : null;
    const blackHole = isSpaceGallery ? createBlackHole() : null;

    [solarSystem, spaceShuttle, astronaut, geminiSpacesuit, marsRover, rocket, satellite, ufo, blackHole].forEach((model) => {
      if (model) scene.add(model);
    });

    const greekStatuePositions = [
      new THREE.Vector3(-6.5, 0, -7.0),
      new THREE.Vector3(6.5, 0, -7.0),
      new THREE.Vector3(0.0, 0, 0.0),
      new THREE.Vector3(-6.5, 0, 7.0),
      new THREE.Vector3(6.5, 0, 7.0),
    ];

    const greekStatueOptions = [
      { pedestalDiameter: 1.5, loadDelay: 0 },
      { noPedestal: true, scale: 1.5, loadDelay: 300 },
      { noPedestal: true, yaw: -Math.PI / 2, pedestalDiameter: 1.5, loadDelay: 600 },
      { pedestalDiameter: 1.5, loadDelay: 900 },
      { pedestalDiameter: 1.5, loadDelay: 1200 },
    ];

    const greekStatues = isHistoryGallery
      ? greekSculptureModels.map((model, i) => {
          const pos = greekStatuePositions[i] || new THREE.Vector3(0, 0, 0);
          return createGreekSculpture(model.id, pos, greekStatueOptions[i] || { pedestalDiameter: 1.5 });
        })
      : [];

    greekStatues.forEach((statue) => {
      if (statue) scene.add(statue);
    });

    const spaceModelFrames = isSpaceGallery ? [
      { exhibit: { ...spaceGalleryModels[0], id: 'model-solar-system' }, position: solarSystem.position.clone() },
      { exhibit: { ...spaceGalleryModels[1], id: 'model-space-shuttle' }, position: spaceShuttle.position.clone() },
      { exhibit: { ...spaceGalleryModels[2], id: 'model-astronaut' }, position: astronaut.position.clone() },
      { exhibit: { ...spaceGalleryModels[3], id: 'model-gemini-spacesuit' }, position: geminiSpacesuit.position.clone() },
      { exhibit: { ...spaceGalleryModels[4], id: 'model-mars-rover' }, position: marsRover.position.clone() },
      { exhibit: { ...spaceGalleryModels[5], id: 'model-rocket' }, position: rocket.position.clone() },
      { exhibit: { ...spaceGalleryModels[7], id: 'model-satellite' }, position: satellite.position.clone() },
      { exhibit: { ...spaceGalleryModels[8], id: 'model-ufo' }, position: ufo.position.clone() },
      { exhibit: { ...spaceGalleryModels[9], id: 'model-black-hole' }, position: blackHole.position.clone() },
    ] : [];

    const greekModelFrames = isHistoryGallery
      ? greekStatues.map((statue, i) => ({
          exhibit: { ...greekSculptureModels[i], id: `model-${greekSculptureModels[i].id}` },
          position: statue.position.clone(),
        }))
      : [];

    let yaw = ct ? ct.yaw : 0;
    let pitch = 0;

    const placeY = (posY) => (posY || 2) + roomY;

    exhibits.forEach((exhibit) => {
      if (isRetroGallery && exhibit.type !== 'portal' && exhibit.type !== 'game') return;

      const placement = placeExhibitOnWall(exhibit, {
        snapToWall: exhibit.type !== 'portal',
      });
      const ey = placeY(placement.y);
      if (exhibit.type === 'youtube' && exhibit.contentUrl) {
        const panel = createYouTubePanel(exhibit.contentUrl);
        panel.position.set(placement.x, ey, placement.z);
        panel.rotation.y = placement.rotationY;
        scene.add(panel);
        frames.push({ exhibit, object: panel, position: panel.position.clone() });
      } else if (exhibit.type === 'game' && exhibit.contentUrl) {
        const panel = createGamePanel(exhibit);
        panel.position.set(placement.x, ey, placement.z);
        panel.rotation.y = placement.rotationY;
        panel.translateZ(-0.03);
        scene.add(panel);
        const entry = { exhibit, object: panel, position: panel.position.clone() };
        if (isRetroGallery) retroGameFrames.push(entry);
        frames.push(entry);
      } else if (exhibit.type === 'portal') {
        const portalGroup = createPortal({
          targetRoomId: exhibit.contentUrl,
          targetPosX: exhibit.portalTargetX,
          targetPosZ: exhibit.portalTargetZ,
          targetYaw: exhibit.portalTargetYaw,
          portalColor: exhibit.portalColor,
          ringColor: exhibit.ringColor,
          ringEmissive: exhibit.ringEmissive,
          glowColor: exhibit.glowColor,
        });
        portalGroup.position.set(placement.x, ey, placement.z);
        portalGroup.rotation.y = placement.rotationY;
        scene.add(portalGroup);
        portalObjects.push({
          title: exhibit.title,
          group: portalGroup,
          position: portalGroup.position.clone(),
          targetRoomId: exhibit.contentUrl,
          targetPosX: exhibit.portalTargetX,
          targetPosZ: exhibit.portalTargetZ,
          targetYaw: exhibit.portalTargetYaw,
          cooldown: 0,
        });
      } else {
        const frame = createExhibitFrame(exhibit);
        frame.position.set(placement.x, ey, placement.z);
        frame.rotation.y = placement.rotationY;
        scene.add(frame);
        frames.push({ exhibit, object: frame, position: frame.position.clone() });
      }
    });

    /* AI 도슨트 드론을 카메라에 붙임 (항상 시야 안에 있음) */
    const docent = createDocent();
    camera.add(docent);
    scene.add(camera);

    /* 키보드 입력: WASD + 방향키 + Shift(달리기) */
    const pressedKeys = new Set();
    const handleKeyDown = (event) => pressedKeys.add(event.key.toLowerCase());
    const handleKeyUp = (event) => pressedKeys.delete(event.key.toLowerCase());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    /* 마우스: 포인터 잠금 상태에서 시야 회전 */
    const handleMouseMove = (event) => {
      if (document.pointerLockElement !== renderer.domElement) return;
      yaw -= event.movementX * 0.0022;
      pitch -= event.movementY * 0.0022;
      pitch = Math.max(-Math.PI / 2.6, Math.min(Math.PI / 2.6, pitch));
    };

    /* 캔버스 클릭 시 마우스 포인터 잠금 */
    const handleCanvasClick = () => {
      renderer.domElement.requestPointerLock();
    };

    window.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleCanvasClick);

    /* === 애니메이션 루프 시작 === */
    const clock = new THREE.Clock();
    let animationId = 0;

      /* === 이동 처리 === */
    const _forward = new THREE.Vector3();
    const _right = new THREE.Vector3();
    const _up = new THREE.Vector3(0, 1, 0);
    const velocity = new THREE.Vector3();

    /* 매 프레임 실행되는 함수: 이동/충돌/애니메이션/렌더링 전부 여기서 처리 */
    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const deltaMs = delta * 1000;

      camera.quaternion.setFromEuler(
        new THREE.Euler(pitch, yaw, 0, 'YXZ'),
      );

      const forward = Number(pressedKeys.has('w') || pressedKeys.has('arrowup'))
        - Number(pressedKeys.has('s') || pressedKeys.has('arrowdown'));
      const strafe = Number(pressedKeys.has('d') || pressedKeys.has('arrowright'))
        - Number(pressedKeys.has('a') || pressedKeys.has('arrowleft'));

      const speed = pressedKeys.has('shiftleft') || pressedKeys.has('shiftright') ? 5.4 : 3.2;

      if (forward !== 0 || strafe !== 0) {
        _forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
        _forward.y = 0;
        _forward.normalize();
        _right.crossVectors(_forward, _up).normalize();

        velocity.x = _forward.x * forward * speed + _right.x * strafe * speed;
        velocity.z = _forward.z * forward * speed + _right.z * strafe * speed;
      } else {
        velocity.x = THREE.MathUtils.damp(velocity.x, 0, 9, delta);
        velocity.z = THREE.MathUtils.damp(velocity.z, 0, 9, delta);
      }

      camera.position.x += velocity.x * delta;
      camera.position.z += velocity.z * delta;

      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -8.2, 8.2);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -9.8, 9.8);
      onLocalPoseChangeRef.current?.({
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        yaw,
      });
      syncRemoteVisitors(scene, remoteUserObjects, remoteUsersRef.current, camera.position);

      docent.userData.update?.(clock.elapsedTime, delta);
      solarSystem?.userData.update?.(clock.elapsedTime, delta);
      spaceShuttle?.userData.update?.(clock.elapsedTime, delta);
      astronaut?.userData.update?.(clock.elapsedTime, delta);
      geminiSpacesuit?.userData.update?.(clock.elapsedTime, delta);
      marsRover?.userData.update?.(clock.elapsedTime, delta);
      rocket?.userData.update?.(clock.elapsedTime, delta);
      satellite?.userData.update?.(clock.elapsedTime, delta);
      ufo?.userData.update?.(clock.elapsedTime, delta);
      blackHole?.userData.update?.(clock.elapsedTime, delta);

      greekStatues.forEach((statue) => {
        statue?.userData.update?.(clock.elapsedTime, delta);
      });

      frames.forEach(({ object }) => {
        const s = object.userData?.gifState;
        if (!s || !s.active || !s.frames?.length) return;
        s.accum += deltaMs;
        if (s.accum >= s.frames[s.current].delay) {
          s.accum = 0;
          const prev = s.frames[s.current];
          s.current = (s.current + 1) % s.frames.length;
          const next = s.frames[s.current];
          const { left, top, width: fw, height: fh } = next.dims;

          if (prev.disposalType === 2 && prev.dims) {
            s.ctx.clearRect(prev.dims.left, prev.dims.top, prev.dims.width, prev.dims.height);
          }

          s.tempCanvas.width = fw;
          s.tempCanvas.height = fh;
          const imgData = s.tempCtx.createImageData(fw, fh);
          imgData.data.set(next.patch);
          s.tempCtx.putImageData(imgData, 0, 0);
          s.ctx.drawImage(s.tempCanvas, left, top);
          s.texture.needsUpdate = true;
        }
      });

      /* 근접 감지: 벽걸이(3.2m) / 3D 모델(4.5m) 중 먼저 발견된 작품에 포커스 */
      const allModelFrames = [...spaceModelFrames, ...greekModelFrames, ...retroGameFrames];
      const nearbyWall = findNearbyExhibit(camera.position, frames, 3.2);
      const nearbyModel = findNearbyExhibit(camera.position, allModelFrames, 4.5);
      const nearbyExhibit = nearbyWall || nearbyModel;

      if (nearbyExhibit && focusRef.current !== nearbyExhibit.id) {
        focusRef.current = nearbyExhibit.id;
        onExhibitFocusRef.current?.(nearbyExhibit.id, {
          userPosition: {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
          },
          hallId: roomConfig?.id,
        });
      } else if (!nearbyExhibit) {
        focusRef.current = null;
      }

      const allExhibitFrames = [...frames, ...spaceModelFrames, ...greekModelFrames, ...retroGameFrames];
      const nearest = findNearestExhibit(camera.position, allExhibitFrames);

      const elapsed = clock.elapsedTime;
      let nearestPortalDist = Infinity;
      let nearestPortalTitle = null;

      portalObjects.forEach((portal, index) => {
        portal.cooldown = Math.max(0, portal.cooldown - delta);

        portal.group.rotation.z = Math.sin(elapsed * 1.5 + index) * 0.035;
        const surfaceMat = portal.group.children[0].material;
        if (surfaceMat) {
          surfaceMat.opacity = 0.72 + Math.sin(elapsed * 3 + index) * 0.12;
          if (surfaceMat.map) {
            surfaceMat.map.rotation = elapsed * 0.12 + index;
          }
        }

        if (portal.cooldown > 0) return;

        const dist = camera.position.distanceTo(portal.group.position);
        if (dist < nearestPortalDist) {
          nearestPortalDist = dist;
          nearestPortalTitle = portal.title;
        }

        if (dist < 1.75) {
          portal.cooldown = 2;
          onRoomChangeRef.current?.(
            portal.targetRoomId,
            portal.targetPosX,
            portal.targetPosZ,
            portal.targetYaw,
          );
        }
      });

      if (nearestPortalTitle && nearestPortalDist < 3.2) {
        onProximityUpdateRef.current?.({
          exhibit: { title: nearestPortalTitle },
          distance: Math.round(nearestPortalDist * 10) / 10,
        });
      } else {
        onProximityUpdateRef.current?.(nearest);
      }

      /* WebGL + CSS3D 동시 렌더링 */
      renderer.render(scene, camera);
      cssRenderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    if (ct) {
      yaw = ct.yaw;
      pitch = 0;
    }

    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    /* 정리(cleanup): 전시관 이동 시 이전 장면의 리소스를 모두 해제 */
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      scene.traverse((child) => {
        if (child.isCSS3DObject && child.element && child.element.parentNode) {
          child.element.parentNode.removeChild(child.element);
        }
        if (child.isMesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose?.());
          } else {
            child.material?.dispose?.();
          }
        }
      });
    };
  }, [exhibits, roomConfig]);

  return (
    <div ref={containerRef} className="scene-canvas">
      <div className="focus-reticle" aria-hidden="true" />
    </div>
  );
}
