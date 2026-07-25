"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";

type IndustryLaptopFrameProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Interactive Three.js laptop chassis with an HTML screen portal.
 * Pointer tilt rotates the device; screen content is a live React tree
 * clipped into the display frame (Coverwatch-style product demos).
 */
export function IndustryLaptopFrame({
  children,
  className = "",
}: IndustryLaptopFrameProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const labelId = useId();

  useEffect(() => {
    const mount = mountRef.current;
    const screenEl = screenRef.current;
    if (!mount || !screenEl) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 1.55, 5.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.pointerEvents = "none";

    const root = new THREE.Group();
    scene.add(root);

    const silver = new THREE.MeshStandardMaterial({
      color: 0xc8ced2,
      metalness: 0.72,
      roughness: 0.28,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x1a1d21,
      metalness: 0.4,
      roughness: 0.55,
    });
    const hingeMat = new THREE.MeshStandardMaterial({
      color: 0x9aa3ab,
      metalness: 0.8,
      roughness: 0.25,
    });

    // Base / keyboard deck
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 2.35), silver);
    base.position.set(0, 0.06, 0.15);
    root.add(base);

    const palm = new THREE.Mesh(new THREE.BoxGeometry(3.45, 0.04, 1.05), dark);
    palm.position.set(0, 0.14, 0.55);
    root.add(palm);

    const trackpad = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.02, 0.72),
      new THREE.MeshStandardMaterial({
        color: 0xb0b8c0,
        metalness: 0.55,
        roughness: 0.35,
      }),
    );
    trackpad.position.set(0, 0.16, 0.78);
    root.add(trackpad);

    // Lid group (screen bezel) — slightly open
    const lid = new THREE.Group();
    lid.position.set(0, 0.12, -1.0);
    lid.rotation.x = -1.12;
    root.add(lid);

    const lidBack = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.28, 0.08), silver);
    lidBack.position.set(0, 1.14, -0.02);
    lid.add(lidBack);

    const bezel = new THREE.Mesh(new THREE.BoxGeometry(3.35, 2.05, 0.04), dark);
    bezel.position.set(0, 1.14, 0.04);
    lid.add(bezel);

    // Invisible screen plane used only for projecting HTML overlay bounds
    const screenPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.05, 1.82),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.001,
        depthWrite: false,
      }),
    );
    screenPlane.position.set(0, 1.14, 0.07);
    lid.add(screenPlane);

    const hinge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 3.5, 16),
      hingeMat,
    );
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(0, 0.12, -1.0);
    root.add(hinge);

    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(3.2, 5.5, 4.2);
    const fill = new THREE.DirectionalLight(0xb8c8d8, 0.45);
    fill.position.set(-4, 2, -2);
    scene.add(ambient, key, fill);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.tx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.ty = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    };
    mount.addEventListener("pointermove", onMove);

    const corner = new THREE.Vector3();
    const projectScreen = () => {
      const rect = mount.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) return;

      // Project the four corners of the screen plane into CSS pixels
      const geom = screenPlane.geometry as THREE.PlaneGeometry;
      const w = (geom.parameters.width as number) / 2;
      const h = (geom.parameters.height as number) / 2;
      const localCorners = [
        new THREE.Vector3(-w, h, 0),
        new THREE.Vector3(w, h, 0),
        new THREE.Vector3(w, -h, 0),
        new THREE.Vector3(-w, -h, 0),
      ];

      const pts = localCorners.map((c) => {
        corner.copy(c);
        screenPlane.localToWorld(corner);
        corner.project(camera);
        return {
          x: (corner.x * 0.5 + 0.5) * rect.width,
          y: (-corner.y * 0.5 + 0.5) * rect.height,
        };
      });

      const minX = Math.min(...pts.map((p) => p.x));
      const maxX = Math.max(...pts.map((p) => p.x));
      const minY = Math.min(...pts.map((p) => p.y));
      const maxY = Math.max(...pts.map((p) => p.y));

      // Approximate lid perspective with a mild skew from corner deltas
      const topDx = pts[1].x - pts[0].x;
      const botDx = pts[2].x - pts[3].x;
      const skew = ((topDx - botDx) / Math.max(rect.width, 1)) * 18;

      screenEl.style.left = `${minX}px`;
      screenEl.style.top = `${minY}px`;
      screenEl.style.width = `${Math.max(maxX - minX, 1)}px`;
      screenEl.style.height = `${Math.max(maxY - minY, 1)}px`;
      screenEl.style.transform = `perspective(900px) rotateX(${(-pointer.y * 4).toFixed(2)}deg) skewX(${skew.toFixed(2)}deg)`;
      screenEl.style.opacity = "1";
    };

    const resize = () => {
      const width = mount.clientWidth || 640;
      const height = mount.clientHeight || 420;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      projectScreen();
    };
    resize();
    window.addEventListener("resize", resize);
    setReady(true);

    let raf = 0;
    const clock = new THREE.Clock();
    const renderFrame = () => {
      const t = clock.getElapsedTime();
      pointer.x += (pointer.tx - pointer.x) * 0.07;
      pointer.y += (pointer.ty - pointer.y) * 0.07;

      if (reducedMotion) {
        root.rotation.set(-0.12, 0.18, 0);
      } else {
        root.rotation.y = pointer.x * 0.28 + Math.sin(t * 0.35) * 0.04;
        root.rotation.x = -0.1 - pointer.y * 0.12;
        root.position.y = Math.sin(t * 0.9) * 0.03;
      }

      camera.lookAt(0, 0.85, 0);
      renderer.render(scene, camera);
      projectScreen();
      raf = window.requestAnimationFrame(renderFrame);
    };
    raf = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", onMove);
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
      className={`pw-industry-laptop ${className}`.trim()}
      role="img"
      aria-labelledby={labelId}
    >
      <span id={labelId} className="sr-only">
        Interactive laptop preview of an ecommerce storefront
      </span>
      <div ref={mountRef} className="pw-industry-laptop-canvas" />
      <div
        ref={screenRef}
        className={`pw-industry-laptop-screen${ready ? " is-ready" : ""}`}
      >
        <div className="pw-industry-laptop-screen-inner">{children}</div>
      </div>
    </div>
  );
}
