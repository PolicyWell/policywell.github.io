"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const PINE = 0x0f2f28;
const MOSS = 0x3d6b5a;
const SAGE = 0x8fafa0;
const BRICK_A = 0x2a5748;
const BRICK_B = 0x1f4338;
const BRICK_C = 0x356b58;

function createDocumentTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  ctx.fillStyle = "#f7fbf8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // dog-ear
  ctx.fillStyle = "#dfece5";
  ctx.beginPath();
  ctx.moveTo(380, 0);
  ctx.lineTo(512, 0);
  ctx.lineTo(512, 132);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c5d6cc";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(380, 0);
  ctx.lineTo(380, 132);
  ctx.lineTo(512, 132);
  ctx.stroke();

  ctx.fillStyle = "#3d6b5a";
  ctx.fillRect(72, 96, 220, 14);
  ctx.fillRect(72, 128, 160, 14);

  ctx.strokeStyle = "#2f6f55";
  ctx.lineWidth = 22;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(140, 320);
  ctx.lineTo(210, 390);
  ctx.lineTo(360, 230);
  ctx.stroke();

  ctx.fillStyle = "#0f2f28";
  ctx.font = "700 54px Manrope, system-ui, sans-serif";
  ctx.fillText("Policy 404", 72, 520);

  ctx.fillStyle = "#5c6b64";
  ctx.font = "400 28px Manrope, system-ui, sans-serif";
  ctx.fillText("Not verified", 72, 568);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createShieldOutline(): THREE.Line {
  const shape = new THREE.Shape();
  shape.moveTo(0, 1.35);
  shape.lineTo(1.05, 1.15);
  shape.lineTo(1.15, 0.15);
  shape.quadraticCurveTo(1.05, -0.55, 0, -1.45);
  shape.quadraticCurveTo(-1.05, -0.55, -1.15, 0.15);
  shape.lineTo(-1.05, 1.15);
  shape.lineTo(0, 1.35);

  const points = shape.getPoints(64);
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map((p) => new THREE.Vector3(p.x, p.y, 0)),
  );
  const material = new THREE.LineBasicMaterial({
    color: SAGE,
    transparent: true,
    opacity: 0.85,
  });
  const line = new THREE.LineLoop(geometry, material);
  line.scale.setScalar(1.55);
  line.position.set(0, 0.35, -0.2);
  return line;
}

function createWell(): THREE.Group {
  const group = new THREE.Group();
  const brickMats = [BRICK_A, BRICK_B, BRICK_C].map(
    (color) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.9,
        metalness: 0.04,
      }),
  );

  const outer = new THREE.Mesh(
    new THREE.CylinderGeometry(1.55, 1.7, 1.15, 48, 1, true),
    new THREE.MeshStandardMaterial({
      color: BRICK_A,
      roughness: 0.92,
      metalness: 0.05,
      side: THREE.DoubleSide,
    }),
  );
  outer.position.y = 0.15;
  group.add(outer);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.52, 0.16, 16, 64),
    new THREE.MeshStandardMaterial({
      color: MOSS,
      roughness: 0.75,
      metalness: 0.08,
    }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.72;
  group.add(rim);

  const water = new THREE.Mesh(
    new THREE.CircleGeometry(1.25, 48),
    new THREE.MeshStandardMaterial({
      color: PINE,
      roughness: 0.25,
      metalness: 0.35,
      emissive: PINE,
      emissiveIntensity: 0.15,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.05;
  group.add(water);

  const brickGeo = new THREE.BoxGeometry(0.42, 0.22, 0.28);
  const rows = 4;
  const perRow = 18;
  for (let row = 0; row < rows; row++) {
    for (let i = 0; i < perRow; i++) {
      const angle = (i / perRow) * Math.PI * 2 + (row % 2) * (Math.PI / perRow);
      const radius = 1.48;
      const brick = new THREE.Mesh(
        brickGeo,
        brickMats[(i + row) % brickMats.length],
      );
      brick.position.set(
        Math.cos(angle) * radius,
        0.05 + row * 0.24,
        Math.sin(angle) * radius,
      );
      brick.rotation.y = -angle;
      brick.scale.set(1, 1, 0.85 + ((i * 17) % 5) * 0.03);
      group.add(brick);
    }
  }

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.85, 2.05, 0.22, 48),
    new THREE.MeshStandardMaterial({
      color: 0x163a31,
      roughness: 0.95,
      metalness: 0.02,
    }),
  );
  base.position.y = -0.45;
  group.add(base);

  return group;
}

function createDocument(): THREE.Group {
  const group = new THREE.Group();
  const texture = createDocumentTexture();

  const page = new THREE.Mesh(
    new THREE.PlaneGeometry(1.05, 1.32),
    new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.55,
      metalness: 0.02,
      side: THREE.DoubleSide,
    }),
  );
  group.add(page);

  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(1.05, 1.32),
    new THREE.MeshStandardMaterial({
      color: 0xe2ede7,
      roughness: 0.8,
      metalness: 0.02,
    }),
  );
  back.position.z = -0.02;
  back.rotation.y = Math.PI;
  group.add(back);

  const fold = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.28),
    new THREE.MeshStandardMaterial({
      color: 0xd5e4dc,
      roughness: 0.6,
      side: THREE.DoubleSide,
    }),
  );
  fold.position.set(0.385, 0.52, 0.015);
  fold.rotation.z = -Math.PI / 4;
  group.add(fold);

  group.position.set(0, 1.55, 0);
  return group;
}

export function PolicyWell404Scene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xe7f0eb, 0.045);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 1.45, 5.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    const well = createWell();
    const documentGroup = createDocument();
    const shield = createShieldOutline();
    root.add(well, documentGroup, shield);

    const ambient = new THREE.AmbientLight(0xdfece5, 0.7);
    const key = new THREE.DirectionalLight(0xf5faf7, 1.15);
    key.position.set(3.5, 6, 4);
    const fill = new THREE.DirectionalLight(SAGE, 0.45);
    fill.position.set(-4, 2, -2);
    const glow = new THREE.PointLight(0x8fdfa8, 0.35, 10, 2);
    glow.position.set(0, 1.8, 1.2);
    scene.add(ambient, key, fill, glow);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(6, 64),
      new THREE.MeshStandardMaterial({
        color: 0xd7e6de,
        roughness: 1,
        metalness: 0,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.56;
    scene.add(ground);

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, holding: false };
    let glowStrength = 0.35;
    let spinBoost = 0;

    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      pointer.targetX = nx;
      pointer.targetY = ny;
    };
    const onPointerDown = () => {
      pointer.holding = true;
    };
    const onPointerUp = () => {
      pointer.holding = false;
    };

    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    const resize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const clock = new THREE.Clock();
    const disposedGeometries = new Set<THREE.BufferGeometry>();
    const disposedMaterials = new Set<THREE.Material>();

    const safeDispose = (object: THREE.Object3D) => {
      object.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry && !disposedGeometries.has(mesh.geometry)) {
          disposedGeometries.add(mesh.geometry);
          mesh.geometry.dispose();
        }
        const material = mesh.material;
        if (!material) return;
        const mats = Array.isArray(material) ? material : [material];
        for (const mat of mats) {
          if (disposedMaterials.has(mat)) continue;
          disposedMaterials.add(mat);
          for (const value of Object.values(mat)) {
            if (value instanceof THREE.Texture) value.dispose();
          }
          mat.dispose();
        }
      });
    };

    const applyPose = (t: number) => {
      pointer.x += (pointer.targetX - pointer.x) * 0.06;
      pointer.y += (pointer.targetY - pointer.y) * 0.06;

      const holdTarget = pointer.holding ? 1 : 0;
      glowStrength += (0.35 + holdTarget * 1.4 - glowStrength) * 0.08;
      spinBoost += ((pointer.holding ? 1.8 : 0) - spinBoost) * 0.06;
      glow.intensity = glowStrength;

      if (reducedMotion) {
        root.rotation.set(-0.08, 0.2, 0);
        documentGroup.position.y = 1.55;
        documentGroup.rotation.set(0, 0.15, 0);
      } else {
        root.rotation.y = pointer.x * 0.35 + t * (0.12 + spinBoost * 0.35);
        root.rotation.x = -pointer.y * 0.18;
        documentGroup.position.y = 1.55 + Math.sin(t * 1.4) * 0.08;
        documentGroup.rotation.y = Math.sin(t * 0.7) * 0.25 + spinBoost * 0.4;
        documentGroup.rotation.z = Math.sin(t * 0.9) * 0.05;
        shield.rotation.z = Math.sin(t * 0.35) * 0.03;
        camera.position.x = pointer.x * 0.35;
        camera.position.y = 1.45 + pointer.y * -0.15;
      }

      camera.lookAt(0, 0.7, 0);
    };

    if (reducedMotion) {
      applyPose(0);
      renderer.render(scene, camera);
    } else {
      const renderFrame = () => {
        applyPose(clock.getElapsedTime());
        renderer.render(scene, camera);
        raf = window.requestAnimationFrame(renderFrame);
      };
      raf = window.requestAnimationFrame(renderFrame);
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerdown", onPointerDown);
      safeDispose(scene);
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="pw-404-canvas" aria-hidden="true" />;
}
