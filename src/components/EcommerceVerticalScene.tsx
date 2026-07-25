"use client";

import { useMemo } from "react";
import { IndustryOrbitScene } from "@/components/IndustryOrbitScene";
import {
  buildBeautyScene,
  buildClothingScene,
  buildCpgScene,
  buildFoodScene,
  buildPetScene,
  buildSupplementScene,
} from "@/lib/industry-scenes/builders";
import type { OrbitMountOptions } from "@/lib/industry-scenes/three-kit";
import type { EcommerceSceneStage } from "@/lib/industries-nav";

type SceneConfig = {
  build: () => ReturnType<typeof buildBeautyScene>;
  ariaLabel: string;
  className?: string;
  options: OrbitMountOptions;
};

const SCENE_CONFIG: Record<
  Exclude<EcommerceSceneStage, "laptop" | "alcohol-fulfillment">,
  SceneConfig
> = {
  "beauty-studio": {
    build: buildBeautyScene,
    ariaLabel:
      "Interactive 3D beauty studio with product shelves, packing table, and label printer",
    className: "pw-orbit-scene-light",
    options: {
      cameraPosition: [4.2, 3.6, 4.8],
      lookAt: [0.1, 0.95, 0.05],
      baseRotY: -0.7,
      baseRotX: 0.28,
      fov: 34,
    },
  },
  "clothing-boutique": {
    build: buildClothingScene,
    ariaLabel:
      "Interactive 3D clothing boutique with garment rack, folding table, and shipping boxes",
    options: {
      cameraPosition: [4.8, 3.8, 5.2],
      lookAt: [0.2, 0.9, 0.1],
      baseRotY: -0.55,
      baseRotX: 0.32,
      fov: 32,
    },
  },
  "cpg-pallet": {
    build: buildCpgScene,
    ariaLabel:
      "Interactive 3D CPG pallet with cartons, product packaging, and a hand truck",
    options: {
      cameraPosition: [4.0, 3.4, 4.4],
      lookAt: [0.15, 0.55, 0.1],
      baseRotY: -0.6,
      baseRotX: 0.4,
      fov: 34,
    },
  },
  "food-shop": {
    build: buildFoodScene,
    ariaLabel:
      "Interactive 3D specialty food shop with jar shelves, counter, and tablet POS",
    options: {
      cameraPosition: [4.6, 3.8, 5.0],
      lookAt: [0.1, 0.95, 0.05],
      baseRotY: -0.65,
      baseRotX: 0.3,
      fov: 32,
    },
  },
  "pet-table": {
    build: buildPetScene,
    ariaLabel:
      "Interactive 3D pet brand packing table with treats, jars, scale, and laptop",
    options: {
      cameraPosition: [4.2, 3.5, 4.6],
      lookAt: [0.1, 0.85, 0.05],
      baseRotY: -0.55,
      baseRotX: 0.35,
      fov: 34,
    },
  },
  "supplement-lab": {
    build: buildSupplementScene,
    ariaLabel:
      "Interactive 3D supplement packing scene with amber bottles, capsules, and shipping box",
    options: {
      cameraPosition: [3.6, 3.0, 4.0],
      lookAt: [0.15, 0.4, 0.05],
      baseRotY: -0.55,
      baseRotX: 0.42,
      fov: 34,
    },
  },
};

export function EcommerceVerticalScene({
  stage,
}: {
  stage: Exclude<EcommerceSceneStage, "laptop" | "alcohol-fulfillment">;
}) {
  const config = SCENE_CONFIG[stage];
  const options = useMemo(() => SCENE_CONFIG[stage].options, [stage]);

  return (
    <IndustryOrbitScene
      buildScene={config.build}
      ariaLabel={config.ariaLabel}
      className={config.className}
      options={options}
    />
  );
}
