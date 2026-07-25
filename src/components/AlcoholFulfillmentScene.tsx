"use client";

import { useEffect, useId, useRef } from "react";
import * as THREE from "three";

const WOOD = 0xc4a882;
const WOOD_DARK = 0xa88968;
const BOX = 0xc4a574;
const BOX_DARK = 0xa8885a;
const WINE = 0x6b1f3a;
const WINE_DEEP = 0x4a1528;
const METAL = 0x4a5560;
const PAPER = 0xf3efe6;
const SCREEN = 0xe8eef2;

function makeMat(
  color: number,
  opts: { roughness?: number; metalness?: number } = {},
) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.65,
    metalness: opts.metalness ?? 0.05,
  });
}

function wineBottle(height = 0.42, color = WINE): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.06, height * 0.62, 16),
    makeMat(color, { roughness: 0.25, metalness: 0.15 }),
  );
  body.position.y = (height * 0.62) / 2;
  const shoulder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.055, height * 0.16, 16),
    makeMat(color, { roughness: 0.25, metalness: 0.15 }),
  );
  shoulder.position.y = height * 0.62 + height * 0.08;
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.028, height * 0.18, 12),
    makeMat(color, { roughness: 0.25, metalness: 0.15 }),
  );
  neck.position.y = height * 0.78;
  const foil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, height * 0.06, 12),
    makeMat(0xb08d3e, { metalness: 0.55, roughness: 0.35 }),
  );
  foil.position.y = height * 0.9;
  g.add(body, shoulder, neck, foil);
  return g;
}

function cardboardBox(
  w: number,
  h: number,
  d: number,
  open = false,
): THREE.Group {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    makeMat(BOX, { roughness: 0.9 }),
  );
  shell.position.y = h / 2;
  g.add(shell);

  if (open) {
    const flapMat = makeMat(BOX_DARK, { roughness: 0.92 });
    const flapGeo = new THREE.BoxGeometry(w * 0.48, 0.02, d * 0.9);
    const left = new THREE.Mesh(flapGeo, flapMat);
    left.position.set(-w * 0.28, h + 0.01, 0);
    left.rotation.z = 0.9;
    const right = new THREE.Mesh(flapGeo, flapMat);
    right.position.set(w * 0.28, h + 0.01, 0);
    right.rotation.z = -0.9;
    g.add(left, right);

    // foam insert
    const foam = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.82, h * 0.35, d * 0.82),
      makeMat(0xd9dde0, { roughness: 1 }),
    );
    foam.position.y = h * 0.55;
    g.add(foam);
  } else {
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.45, h * 0.22),
      makeMat(0xf7f4ee, { roughness: 1 }),
    );
    label.position.set(0, h * 0.55, d / 2 + 0.005);
    g.add(label);
  }
  return g;
}

function buildScene(): THREE.Group {
  const root = new THREE.Group();

  // Table
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.12, 2.0),
    makeMat(WOOD, { roughness: 0.7 }),
  );
  top.position.y = 1.05;
  root.add(top);

  const shelf = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.08, 1.85),
    makeMat(WOOD_DARK, { roughness: 0.75 }),
  );
  shelf.position.y = 0.42;
  root.add(shelf);

  for (const [x, z] of [
    [-1.45, -0.8],
    [1.45, -0.8],
    [-1.45, 0.8],
    [1.45, 0.8],
  ] as const) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 1.05, 0.12),
      makeMat(WOOD_DARK),
    );
    leg.position.set(x, 0.525, z);
    root.add(leg);
  }

  // Open pack box with bottles
  const openBox = cardboardBox(0.85, 0.45, 0.7, true);
  openBox.position.set(-0.55, 1.11, -0.15);
  root.add(openBox);
  for (const [bx, bz] of [
    [-0.18, -0.08],
    [0.05, 0.1],
    [0.22, -0.12],
  ] as const) {
    const b = wineBottle(0.38, bx > 0 ? WINE_DEEP : WINE);
    b.position.set(-0.55 + bx, 1.28, -0.15 + bz);
    root.add(b);
  }

  // Standing bottles on table
  const standA = wineBottle(0.48);
  standA.position.set(-1.25, 1.11, 0.15);
  standA.rotation.z = 0.08;
  const standB = wineBottle(0.46, WINE_DEEP);
  standB.position.set(-1.05, 1.11, 0.35);
  standB.rotation.z = -0.35;
  standB.rotation.x = 0.15;
  root.add(standA, standB);

  // Closed foam box with bottles peeking
  const pack = cardboardBox(0.7, 0.4, 0.55, true);
  pack.position.set(0.15, 1.11, -0.45);
  root.add(pack);
  for (const x of [-0.12, 0.05, 0.2] as const) {
    const b = wineBottle(0.34);
    b.position.set(0.15 + x, 1.28, -0.45);
    root.add(b);
  }

  // Laptop
  const laptop = new THREE.Group();
  laptop.position.set(0.85, 1.12, 0.15);
  laptop.rotation.y = -0.35;
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.03, 0.45),
    makeMat(0xb8c0c8, { metalness: 0.55, roughness: 0.35 }),
  );
  base.position.y = 0.02;
  const lid = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.45, 0.03),
    makeMat(0x9aa3ab, { metalness: 0.5, roughness: 0.35 }),
  );
  lid.position.set(0, 0.28, -0.2);
  lid.rotation.x = -0.35;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 0.38),
    makeMat(SCREEN, { roughness: 0.4 }),
  );
  screen.position.set(0, 0.28, -0.175);
  screen.rotation.x = -0.35;
  laptop.add(base, lid, screen);
  root.add(laptop);

  // Clipboard
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.02, 0.48),
    makeMat(0xd8dde3, { metalness: 0.2, roughness: 0.45 }),
  );
  board.position.set(-1.15, 1.13, 0.55);
  board.rotation.y = 0.4;
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.38),
    makeMat(PAPER, { roughness: 1 }),
  );
  paper.position.set(-1.15, 1.145, 0.55);
  paper.rotation.set(-Math.PI / 2, 0, 0.4);
  root.add(board, paper);

  // Under-shelf boxes
  const underL = cardboardBox(0.7, 0.35, 0.55);
  underL.position.set(-0.7, 0.46, 0.1);
  const underR = cardboardBox(0.55, 0.3, 0.5);
  underR.position.set(0.55, 0.46, -0.15);
  root.add(underL, underR);

  // Stack of boxes to the right
  const stack: Array<[number, number, number, number, number, number]> = [
    [1.85, 0, 0.55, 0.55, 0.4, 0.45],
    [1.85, 0.4, 0.55, 0.5, 0.35, 0.4],
    [1.85, 0.75, 0.55, 0.55, 0.38, 0.42],
    [2.35, 0, 0.35, 0.48, 0.36, 0.4],
    [2.25, 0.36, 0.15, 0.42, 0.32, 0.38],
    [2.45, 0, 0.85, 0.4, 0.34, 0.36],
  ];
  for (const [x, y, z, w, h, d] of stack) {
    const box = cardboardBox(w, h, d);
    box.position.set(x, y, z);
    box.rotation.y = (x + z) * 0.05;
    root.add(box);
  }

  // Hand truck
  const cart = new THREE.Group();
  cart.position.set(0.15, 0, 1.15);
  cart.rotation.y = 0.45;
  const frameMat = makeMat(METAL, { metalness: 0.65, roughness: 0.4 });
  const leftRail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 1.15, 10),
    frameMat,
  );
  leftRail.position.set(-0.22, 0.55, 0);
  const rightRail = leftRail.clone();
  rightRail.position.x = 0.22;
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.025, 8, 16, Math.PI),
    frameMat,
  );
  handle.rotation.x = Math.PI / 2;
  handle.position.set(0, 1.15, 0);
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.04, 0.35),
    frameMat,
  );
  plate.position.set(0, 0.08, 0.15);
  const wheelL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.06, 16),
    makeMat(0x22272b, { roughness: 0.8 }),
  );
  wheelL.rotation.z = Math.PI / 2;
  wheelL.position.set(-0.28, 0.12, -0.05);
  const wheelR = wheelL.clone();
  wheelR.position.x = 0.28;
  cart.add(leftRail, rightRail, handle, plate, wheelL, wheelR);

  // Crate with empties
  const crate = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.28, 0.4),
    makeMat(0x9a7a52, { roughness: 0.85 }),
  );
  crate.position.set(0.15, 0.28, 1.35);
  crate.rotation.y = 0.45;
  root.add(cart, crate);
  for (const [x, z] of [
    [-0.12, -0.08],
    [0.05, 0.05],
    [0.15, -0.1],
    [-0.05, 0.1],
    [0.18, 0.08],
  ] as const) {
    const empty = wineBottle(0.28, 0xd7c4a8);
    empty.position.set(0.15 + x, 0.42, 1.35 + z);
    empty.rotation.y = 0.45;
    root.add(empty);
  }

  // Ground disc shadow catcher (subtle)
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(3.8, 48),
    new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0.35,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.001;
  root.add(ground);

  root.rotation.y = -0.55;
  root.rotation.x = 0.35;
  return root;
}

/**
 * Interactive Three.js isometric fulfillment scene for Alcoholic Beverage.
 */
export function AlcoholFulfillmentScene({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(4.8, 4.2, 5.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      width: "100%",
      height: "100%",
      display: "block",
      touchAction: "none",
    });

    const root = buildScene();
    scene.add(root);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(5, 8, 4);
    const fill = new THREE.DirectionalLight(0xb8c4d0, 0.45);
    fill.position.set(-4, 3, -2);
    const rim = new THREE.PointLight(0xffd9c2, 0.35, 12);
    rim.position.set(1, 3, 2);
    scene.add(ambient, key, fill, rim);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0, down: false, px: 0, py: 0 };
    const onMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.ty = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      if (pointer.down) {
        pointer.x += (e.clientX - pointer.px) * 0.005;
        pointer.y += (e.clientY - pointer.py) * 0.004;
        pointer.px = e.clientX;
        pointer.py = e.clientY;
      }
    };
    const onDown = (e: PointerEvent) => {
      pointer.down = true;
      pointer.px = e.clientX;
      pointer.py = e.clientY;
      mount.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      pointer.down = false;
      try {
        mount.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    mount.addEventListener("pointermove", onMove);
    mount.addEventListener("pointerdown", onDown);
    mount.addEventListener("pointerup", onUp);
    mount.addEventListener("pointercancel", onUp);

    const resize = () => {
      const width = mount.clientWidth || 640;
      const height = mount.clientHeight || 420;
      camera.aspect = width / Math.max(height, 1);
      camera.fov = width < 520 ? 36 : 32;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const clock = new THREE.Clock();
    const baseRotY = -0.55;
    const baseRotX = 0.35;

    const frame = () => {
      const t = clock.getElapsedTime();
      if (reducedMotion) {
        root.rotation.set(baseRotX, baseRotY, 0);
        root.position.y = 0;
      } else {
        const hoverX = pointer.down ? 0 : pointer.tx * 0.15;
        const hoverY = pointer.down ? 0 : pointer.ty * 0.08;
        root.rotation.y = baseRotY + pointer.x + hoverX + Math.sin(t * 0.25) * 0.03;
        root.rotation.x = baseRotX + pointer.y * 0.35 + hoverY;
        root.position.y = Math.sin(t * 0.8) * 0.04;
      }
      camera.lookAt(0.4, 0.85, 0.2);
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(frame);
    };
    raf = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", onMove);
      mount.removeEventListener("pointerdown", onDown);
      mount.removeEventListener("pointerup", onUp);
      mount.removeEventListener("pointercancel", onUp);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material;
        if (!mat) return;
        for (const m of Array.isArray(mat) ? mat : [mat]) m.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      className={`pw-alcohol-scene ${className}`.trim()}
      role="img"
      aria-labelledby={labelId}
    >
      <span id={labelId} className="sr-only">
        Interactive 3D fulfillment table with wine bottles, shipping boxes, and
        a laptop storefront
      </span>
      <div ref={mountRef} className="pw-alcohol-scene-canvas" />
    </div>
  );
}
