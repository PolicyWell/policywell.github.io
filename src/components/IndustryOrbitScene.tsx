"use client";

import { useEffect, useId, useRef } from "react";
import type { Group } from "three";
import {
  mountOrbitScene,
  type OrbitMountOptions,
} from "@/lib/industry-scenes/three-kit";

type IndustryOrbitSceneProps = {
  buildScene: () => Group;
  className?: string;
  canvasClassName?: string;
  ariaLabel: string;
  options?: OrbitMountOptions;
};

export function IndustryOrbitScene({
  buildScene,
  className = "",
  canvasClassName = "pw-orbit-scene-canvas",
  ariaLabel,
  options,
}: IndustryOrbitSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    return mountOrbitScene(mount, buildScene, options);
  }, [buildScene, options]);

  return (
    <div
      className={`pw-orbit-scene ${className}`.trim()}
      role="img"
      aria-labelledby={labelId}
    >
      <span id={labelId} className="sr-only">
        {ariaLabel}
      </span>
      <div ref={mountRef} className={canvasClassName} />
    </div>
  );
}
