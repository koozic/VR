import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";
import { createExhibitFrame, updateAnimatedWebp } from "./createExhibitFrame.js";
import { createYouTubePanel } from "./createYouTubePanel.js";
import { createGamePanel } from "./createGamePanel.js";
import { createPortal } from "./createPortal.js";
import { createDocent } from "./createDocent.js";
import { findNearbyExhibit, findNearestExhibit } from "./distanceCheck.js";
import { buildRoom } from "./buildRoom.js";
import { setupLighting } from "./setupLighting.js";
import { placeExhibitOnWall } from "./placeExhibit.js";
import { syncRemoteVisitors } from "./syncRemoteVisitors.js";
import { useGalleryMovement } from "./hooks/useGalleryMovement.js";

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
  onLoadingChange,
}) {
  /* 첫 번째 useEffect: WebGL/CSS3D 렌더러 생성 (컴포넌트 마운트 시 1회만 실행) */
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const cssRendererRef = useRef(null);
  const [movementDomElement, setMovementDomElement] = useState(null);
  const [galleryRuntime, setGalleryRuntime] = useState({
    roomId: null,
    module: null,
  });

  /* 유저 이동 및 시야 회전 로직을 커스텀 훅으로 위임 */
  const movement = useGalleryMovement({
    domElement: movementDomElement,
    onLocalPoseChange,
  });

  /* 현재 포커스된 작품 ID (중복 호출 방지) */
  const focusRef = useRef(null);
  /* props가 바뀌어도 애니메이션 루프 안에서는 ref로 접근 (useEffect 재실행 방지) */
  const onExhibitFocusRef = useRef(onExhibitFocus);
  const onProximityUpdateRef = useRef(onProximityUpdate);
  const onRoomChangeRef = useRef(onRoomChange);
  const onLocalPoseChangeRef = useRef(onLocalPoseChange);
  const cameraTargetRef = useRef(null);
  const remoteUsersRef = useRef(remoteUsers);

  useEffect(() => {
    onExhibitFocusRef.current = onExhibitFocus;
  }, [onExhibitFocus]);
  useEffect(() => {
    onProximityUpdateRef.current = onProximityUpdate;
  }, [onProximityUpdate]);
  useEffect(() => {
    onRoomChangeRef.current = onRoomChange;
  }, [onRoomChange]);
  useEffect(() => {
    onLocalPoseChangeRef.current = onLocalPoseChange;
  }, [onLocalPoseChange]);
  useEffect(() => {
    remoteUsersRef.current = remoteUsers;
  }, [remoteUsers]);
  useEffect(() => {
    cameraTargetRef.current = cameraTarget;
  }, [cameraTarget]);

  useEffect(() => {
    const roomId = Number(roomConfig?.id);
    let active = true;

    // 특수 전시관이면 로딩 시작
    const isSpecialGallery = roomId === 2 || roomId === 3 || roomId === 4;
    if (isSpecialGallery && onLoadingChange) {
      onLoadingChange(true);
    }

    if (roomId === 2) {
      import("./spaceGalleryRuntime.js").then((module) => {
        if (active) {
          setGalleryRuntime({ roomId, module });
          if (onLoadingChange) onLoadingChange(false);
        }
      });
    } else if (roomId === 3) {
      import("./greekGalleryRuntime.js").then((module) => {
        if (active) {
          setGalleryRuntime({ roomId, module });
          if (onLoadingChange) onLoadingChange(false);
        }
      });
    } else if (roomId === 4) {
      import("./retroGalleryRuntime.js").then((module) => {
        if (active) {
          setGalleryRuntime({ roomId, module });
          if (onLoadingChange) onLoadingChange(false);
        }
      });
    } else {
      setGalleryRuntime({ roomId, module: null });
      if (onLoadingChange) onLoadingChange(false);
    }

    return () => {
      active = false;
    };
  }, [roomConfig?.id, onLoadingChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.domElement.className = "scene-webgl";
    container.appendChild(renderer.domElement);

    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(container.clientWidth, container.clientHeight);
    cssRenderer.domElement.className = "scene-css3d";
    container.appendChild(cssRenderer.domElement);

    rendererRef.current = renderer;
    cssRendererRef.current = cssRenderer;
    setMovementDomElement(renderer.domElement);

    const handleResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      cssRenderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
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
    if (
      (isSpaceGallery || isHistoryGallery || isRetroGallery) &&
      galleryRuntime.roomId !== Number(roomConfig?.id)
    )
      return;
    renderer.toneMappingExposure = isSpaceGallery
      ? 0.78
      : isHistoryGallery
        ? 0.95
        : isRetroGallery
          ? 1.35
          : 1.04;
    scene.background = new THREE.Color(
      isSpaceGallery
        ? 0x080b11
        : isHistoryGallery
          ? 0x1a1510
          : isRetroGallery
            ? 0x160b22
            : 0x111414,
    );
    scene.fog = new THREE.Fog(
      isSpaceGallery
        ? 0x080b11
        : isHistoryGallery
          ? 0x1a1510
          : isRetroGallery
            ? 0x160b22
            : 0x111414,
      14,
      36,
    );

    const camera = new THREE.PerspectiveCamera(
      72,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
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
    const spaceContent = isSpaceGallery
      ? galleryRuntime.module?.createSpaceGalleryContent(scene)
      : null;
    const greekContent = isHistoryGallery
      ? galleryRuntime.module?.createGreekGalleryContent(scene)
      : null;
    const retroContent = isRetroGallery
      ? galleryRuntime.module?.createRetroGalleryContent(scene, roomY)
      : null;
    const animatedGalleryModels = [
      ...(spaceContent?.models || []),
      ...(greekContent?.models || []),
      ...(retroContent?.models || []),
    ];
    const spaceModelFrames = spaceContent?.frames || [];
    const greekModelFrames = greekContent?.frames || [];
    const retroModelFrames = retroContent?.frames || [];

    const placeY = (posY) => (posY || 2) + roomY;

    exhibits.forEach((exhibit) => {
      if (isRetroGallery && exhibit.type !== "portal") return;

      const placement = placeExhibitOnWall(exhibit, {
        snapToWall: exhibit.type !== "portal",
      });
      const ey = placeY(placement.y);
      if (exhibit.type === "youtube" && exhibit.contentUrl) {
        const panel = createYouTubePanel(exhibit.contentUrl);
        panel.position.set(placement.x, ey, placement.z);
        panel.rotation.y = placement.rotationY;
        scene.add(panel);
        frames.push({
          exhibit,
          object: panel,
          position: panel.position.clone(),
        });
      } else if (exhibit.type === "game" && exhibit.contentUrl) {
        const panel = createGamePanel(exhibit);
        panel.position.set(placement.x, ey, placement.z);
        panel.rotation.y = placement.rotationY;
        panel.translateZ(-0.03);
        scene.add(panel);
        const entry = {
          exhibit,
          object: panel,
          position: panel.position.clone(),
        };
        if (isRetroGallery) retroGameFrames.push(entry);
        frames.push(entry);
      } else if (exhibit.type === "portal") {
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
        frames.push({
          exhibit,
          object: frame,
          position: frame.position.clone(),
        });
      }
    });

    /* AI 도슨트 드론을 카메라에 붙임 (항상 시야 안에 있음) */
    const docent = createDocent();
    camera.add(docent);
    scene.add(camera);

    /* === 애니메이션 루프 시작 === */
    const clock = new THREE.Clock();
    let animationId = 0;
    const cameraForward = new THREE.Vector3();

    /* 초기 위치 및 회전 설정 (방 진입 시) */
    const initialYaw = ct ? ct.yaw : 0;
    movement.reset(camera.position.x, camera.position.z, initialYaw, camera);

    /* 매 프레임 실행되는 함수: 이동/충돌/애니메이션/렌더링 전부 여기서 처리 */
    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const deltaMs = delta * 1000;
      const elapsed = clock.elapsedTime;
      camera.getWorldDirection(cameraForward);

      // 충돌 장애물 수집 (userData.collisionRadius가 있는 모델들)
      const obstacles = animatedGalleryModels
        .filter((m) => m?.userData?.collisionRadius)
        .map((m) => ({
          x: m.position.x,
          z: m.position.z,
          radius: m.userData.collisionRadius,
        }));

      // 이동 및 시야 회전 업데이트 (커스텀 훅에 위임)
      movement.update(delta, camera, cameraY, obstacles);

      syncRemoteVisitors(
        scene,
        remoteUserObjects,
        remoteUsersRef.current,
        camera.position,
      );

      remoteUserObjects.forEach((group) => {
        group.userData.animMixer?.update(delta);
      });

      docent.userData.update?.(clock.elapsedTime, delta);
      animatedGalleryModels.forEach((model) => {
        model?.userData.update?.(clock.elapsedTime, delta);
      });

      frames.forEach(({ object }) => {
        object.userData?.update?.(elapsed, delta);

        const isNearby = camera.position.distanceToSquared(object.position) < 18 * 18;
        const webp = object.userData?.webpState;
        if (webp?.active && isNearby) {
          updateAnimatedWebp(webp, deltaMs);
        }

        const s = object.userData?.gifState;
        if (!isNearby || !s || !s.active || !s.frames?.length) return;
        s.accum += deltaMs;
        if (s.accum >= s.frames[s.current].delay) {
          s.accum = 0;
          const prev = s.frames[s.current];
          s.current = (s.current + 1) % s.frames.length;
          const next = s.frames[s.current];
          const { left, top, width: fw, height: fh } = next.dims;

          if (prev.disposalType === 2 && prev.dims) {
            s.ctx.clearRect(
              prev.dims.left,
              prev.dims.top,
              prev.dims.width,
              prev.dims.height,
            );
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
      const allModelFrames = [
        ...spaceModelFrames,
        ...greekModelFrames,
        ...retroModelFrames,
        ...retroGameFrames,
      ];
      const nearbyWall = findNearbyExhibit(camera.position, frames, 3.2, cameraForward);
      const nearbyModel = findNearbyExhibit(
        camera.position,
        allModelFrames,
        4.5,
        cameraForward,
      );
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

      const allExhibitFrames = [
        ...frames,
        ...spaceModelFrames,
        ...greekModelFrames,
        ...retroModelFrames,
        ...retroGameFrames,
      ];
      const nearest = findNearestExhibit(camera.position, allExhibitFrames, cameraForward);

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

    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    /* 정리(cleanup): 전시관 이동 시 이전 장면의 리소스를 모두 해제 */
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      scene.traverse((child) => {
        child.userData?.webpState?.decoder?.close();
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
  }, [exhibits, roomConfig, galleryRuntime]);

  return (
    <div ref={containerRef} className="scene-canvas">
      <div className="focus-reticle" aria-hidden="true" />
    </div>
  );
}
