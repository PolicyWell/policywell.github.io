import * as THREE from "three";

export function mat(
  color: number,
  opts: { roughness?: number; metalness?: number; opacity?: number } = {},
) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.65,
    metalness: opts.metalness ?? 0.05,
    transparent: opts.opacity !== undefined && opts.opacity < 1,
    opacity: opts.opacity ?? 1,
  });
}

export function box(
  w: number,
  h: number,
  d: number,
  color: number,
  opts?: { roughness?: number; metalness?: number; opacity?: number },
) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
}

export function cyl(
  rTop: number,
  rBot: number,
  h: number,
  color: number,
  opts?: {
    roughness?: number;
    metalness?: number;
    opacity?: number;
    segments?: number;
  },
) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(
      rTop,
      rBot,
      h,
      opts?.segments ?? 16,
    ),
    mat(color, opts),
  );
}

export function addShadowDisc(root: THREE.Group, radius = 3.2) {
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 48),
    new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 1,
      transparent: true,
      opacity: 0.28,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.001;
  root.add(ground);
}

export type OrbitMountOptions = {
  cameraPosition?: [number, number, number];
  lookAt?: [number, number, number];
  baseRotY?: number;
  baseRotX?: number;
  fov?: number;
};

/**
 * Mount an interactive orbiting Three.js root into a DOM node.
 * Returns a cleanup function.
 */
export function mountOrbitScene(
  mount: HTMLElement,
  build: () => THREE.Group,
  options: OrbitMountOptions = {},
): () => void {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(options.fov ?? 32, 1, 0.1, 100);
  const [cx, cy, cz] = options.cameraPosition ?? [4.6, 4.0, 5.0];
  camera.position.set(cx, cy, cz);

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

  const root = build();
  scene.add(root);

  const ambient = new THREE.AmbientLight(0xffffff, 0.72);
  const key = new THREE.DirectionalLight(0xffffff, 1.12);
  key.position.set(5, 8, 4);
  const fill = new THREE.DirectionalLight(0xb8c4d0, 0.42);
  fill.position.set(-4, 3, -2);
  const rim = new THREE.PointLight(0xffe6d2, 0.3, 14);
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
    camera.fov = width < 520 ? (options.fov ?? 32) + 4 : (options.fov ?? 32);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  resize();
  window.addEventListener("resize", resize);

  const baseRotY = options.baseRotY ?? -0.55;
  const baseRotX = options.baseRotX ?? 0.35;
  const [lx, ly, lz] = options.lookAt ?? [0.3, 0.9, 0.15];

  let raf = 0;
  const clock = new THREE.Clock();
  const frame = () => {
    const t = clock.getElapsedTime();
    if (reducedMotion) {
      root.rotation.set(baseRotX, baseRotY, 0);
      root.position.y = 0;
    } else {
      const hoverX = pointer.down ? 0 : pointer.tx * 0.15;
      const hoverY = pointer.down ? 0 : pointer.ty * 0.08;
      root.rotation.y =
        baseRotY + pointer.x + hoverX + Math.sin(t * 0.25) * 0.03;
      root.rotation.x = baseRotX + pointer.y * 0.35 + hoverY;
      root.position.y = Math.sin(t * 0.8) * 0.035;
    }
    camera.lookAt(lx, ly, lz);
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
      const material = mesh.material;
      if (!material) return;
      for (const m of Array.isArray(material) ? material : [material]) {
        m.dispose();
      }
    });
    renderer.dispose();
    if (renderer.domElement.parentElement === mount) {
      mount.removeChild(renderer.domElement);
    }
  };
}
