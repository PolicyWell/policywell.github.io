import * as THREE from "three";
import { addShadowDisc, box, cyl, mat } from "./three-kit";

function cardboard(
  w: number,
  h: number,
  d: number,
  open = false,
): THREE.Group {
  const g = new THREE.Group();
  const shell = box(w, h, d, 0xc4a574, { roughness: 0.92 });
  shell.position.y = h / 2;
  g.add(shell);
  if (open) {
    const flap = box(w * 0.48, 0.02, d * 0.9, 0xa8885a, { roughness: 0.95 });
    const l = flap.clone();
    l.position.set(-w * 0.28, h + 0.01, 0);
    l.rotation.z = 0.85;
    const r = flap.clone();
    r.position.set(w * 0.28, h + 0.01, 0);
    r.rotation.z = -0.85;
    g.add(l, r);
  } else {
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.4, h * 0.2),
      mat(0xf7f4ee, { roughness: 1 }),
    );
    label.position.set(0, h * 0.55, d / 2 + 0.004);
    g.add(label);
  }
  return g;
}

function bottle(color: number, h = 0.35): THREE.Group {
  const g = new THREE.Group();
  const body = cyl(0.05, 0.055, h * 0.65, color, {
    roughness: 0.28,
    metalness: 0.12,
  });
  body.position.y = (h * 0.65) / 2;
  const neck = cyl(0.018, 0.04, h * 0.28, color, {
    roughness: 0.28,
    metalness: 0.12,
  });
  neck.position.y = h * 0.72;
  const cap = cyl(0.02, 0.02, h * 0.08, 0xf2f2f2, { roughness: 0.5 });
  cap.position.y = h * 0.92;
  g.add(body, neck, cap);
  return g;
}

function jar(color: number, r = 0.07, h = 0.12): THREE.Group {
  const g = new THREE.Group();
  const body = cyl(r, r, h, color, { roughness: 0.35, metalness: 0.08 });
  body.position.y = h / 2;
  const lid = cyl(r * 1.05, r * 1.05, 0.025, 0xf5f0e8, { roughness: 0.6 });
  lid.position.y = h + 0.01;
  g.add(body, lid);
  return g;
}

function plant(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const pot = cyl(0.06 * scale, 0.05 * scale, 0.08 * scale, 0xf0ebe3);
  pot.position.y = 0.04 * scale;
  const leaf = box(0.12 * scale, 0.14 * scale, 0.03 * scale, 0x5f8f6a, {
    roughness: 0.85,
  });
  leaf.position.y = 0.16 * scale;
  leaf.rotation.z = 0.2;
  g.add(pot, leaf);
  return g;
}

/** Beauty studio corner — shelves, packing table, label printer. */
export function buildBeautyScene(): THREE.Group {
  const root = new THREE.Group();

  const floor = box(3.6, 0.08, 3.2, 0xf2ebe3, { roughness: 0.9 });
  floor.position.set(0.2, 0.04, 0.1);
  const wallL = box(0.1, 2.4, 3.2, 0xf7f1ea, { roughness: 1 });
  wallL.position.set(-1.55, 1.2, 0.1);
  const wallR = box(3.6, 2.4, 0.1, 0xf3ece4, { roughness: 1 });
  wallR.position.set(0.2, 1.2, -1.45);
  root.add(floor, wallL, wallR);

  // Shelves on left
  for (const y of [1.55, 1.05, 0.55] as const) {
    const shelf = box(1.5, 0.06, 0.35, 0xd7c4a8);
    shelf.position.set(-1.15, y, -0.9);
    root.add(shelf);
  }
  const colors = [0xf5f5f5, 0xd8b4a6, 0x8b5a3c, 0x6b9e9b, 0xf0e6df];
  for (let i = 0; i < 8; i++) {
    const b = bottle(colors[i % colors.length], 0.22 + (i % 3) * 0.04);
    b.position.set(-1.45 + (i % 4) * 0.22, 1.58, -0.9);
    root.add(b);
  }
  for (let i = 0; i < 5; i++) {
    const j = jar(colors[(i + 2) % colors.length], 0.06, 0.08);
    j.position.set(-1.4 + i * 0.2, 1.08, -0.85);
    root.add(j);
  }
  root.add(plant(1.1));
  root.children[root.children.length - 1].position.set(-1.5, 1.58, -0.7);

  // Desk
  const desk = box(2.2, 0.1, 1.1, 0xd9c7a8);
  desk.position.set(0.35, 0.85, 0.35);
  for (const [x, z] of [
    [-0.9, -0.4],
    [0.9, -0.4],
    [-0.9, 0.4],
    [0.9, 0.4],
  ] as const) {
    const leg = box(0.08, 0.85, 0.08, 0xc4ae8d);
    leg.position.set(0.35 + x, 0.425, 0.35 + z);
    root.add(leg);
  }
  root.add(desk);

  // Products on desk
  for (let i = 0; i < 4; i++) {
    const tube = cyl(0.035, 0.04, 0.16, [0x7eb8c9, 0xf0a07a, 0xffffff, 0x5b8c7a][i], {
      roughness: 0.4,
    });
    tube.position.set(-0.25 + i * 0.14, 0.98, 0.15);
    root.add(tube);
  }
  const lipstick = cyl(0.015, 0.015, 0.1, 0xc45c5c);
  lipstick.position.set(-0.4, 0.96, 0.35);
  root.add(lipstick);

  const shipBox = cardboard(0.28, 0.22, 0.22);
  shipBox.position.set(0.55, 0.9, 0.25);
  root.add(shipBox);

  // Label printer
  const printer = box(0.35, 0.22, 0.28, 0xf4f4f4, { roughness: 0.45 });
  printer.position.set(0.95, 1.01, 0.45);
  const roll = cyl(0.08, 0.08, 0.22, 0xffffff, { roughness: 0.7 });
  roll.rotation.z = Math.PI / 2;
  roll.position.set(0.95, 0.95, 0.7);
  root.add(printer, roll);

  // Under desk bins
  const bin = box(0.4, 0.22, 0.3, 0x8fa8c0);
  bin.position.set(0.1, 0.35, 0.35);
  root.add(bin);

  // Pegboard / art
  const board = box(0.55, 0.7, 0.04, 0xeee7de);
  board.position.set(0.9, 1.55, -1.38);
  const art = box(0.4, 0.5, 0.03, 0xf7f3ec);
  art.position.set(1.45, 1.55, -1.38);
  const circle = cyl(0.1, 0.1, 0.02, 0x7eb8c9);
  circle.rotation.x = Math.PI / 2;
  circle.position.set(1.4, 1.6, -1.35);
  root.add(board, art, circle);

  // Filing cabinet
  const cab = box(0.55, 0.7, 0.45, 0xf0ebe4);
  cab.position.set(-1.1, 0.35, 0.55);
  root.add(cab);

  // Floor boxes
  const open = cardboard(0.35, 0.22, 0.3, true);
  open.position.set(-0.2, 0.08, 1.15);
  const small = cardboard(0.22, 0.18, 0.2);
  small.position.set(0.15, 0.08, 1.25);
  root.add(open, small);

  return root;
}

/** Clothing boutique room — rack, folding table, fitting room, boxes. */
export function buildClothingScene(): THREE.Group {
  const root = new THREE.Group();
  addShadowDisc(root, 3.4);

  const floor = box(4.2, 0.08, 3.6, 0xd2b48c, { roughness: 0.85 });
  floor.position.set(0.1, 0.04, 0);
  const wallBack = box(4.2, 2.2, 0.1, 0xf3eee6);
  wallBack.position.set(0.1, 1.1, -1.7);
  const wallSide = box(0.1, 2.2, 3.6, 0xefe8de);
  wallSide.position.set(-2.0, 1.1, 0);
  const wainscot = box(4.2, 0.55, 0.08, 0xc4a882);
  wainscot.position.set(0.1, 0.35, -1.64);
  root.add(floor, wallBack, wallSide, wainscot);

  // Clothing rack
  const rail = cyl(0.03, 0.03, 2.2, 0x4a5560, { metalness: 0.5, roughness: 0.4 });
  rail.rotation.z = Math.PI / 2;
  rail.position.set(-0.7, 1.45, -0.9);
  const postL = cyl(0.035, 0.035, 1.45, 0x4a5560, { metalness: 0.5 });
  postL.position.set(-1.75, 0.72, -0.9);
  const postR = postL.clone();
  postR.position.x = 0.35;
  root.add(rail, postL, postR);

  const hues = [0xe8d5b5, 0xd9a066, 0xc9783a, 0xf0ebe3, 0x3d5a80, 0x2f4a3a, 0xb85c38, 0x6b4f3a];
  for (let i = 0; i < 8; i++) {
    const shirt = box(0.28, 0.55, 0.08, hues[i], { roughness: 0.8 });
    shirt.position.set(-1.55 + i * 0.24, 1.15, -0.9);
    root.add(shirt);
  }

  // Display table with folded stacks
  const tableTop = box(1.3, 0.08, 0.7, 0xb8956c);
  tableTop.position.set(0.15, 0.55, 0.35);
  const leg = box(0.08, 0.55, 0.08, 0x9a7a52);
  for (const [x, z] of [
    [-0.5, -0.25],
    [0.5, -0.25],
    [-0.5, 0.25],
    [0.5, 0.25],
  ] as const) {
    const l = leg.clone();
    l.position.set(0.15 + x, 0.275, 0.35 + z);
    root.add(l);
  }
  root.add(tableTop);
  for (let i = 0; i < 6; i++) {
    const stack = box(0.28, 0.12 + (i % 3) * 0.04, 0.22, hues[i], {
      roughness: 0.85,
    });
    stack.position.set(-0.25 + (i % 3) * 0.32, 0.68, 0.2 + Math.floor(i / 3) * 0.28);
    root.add(stack);
  }

  // Fitting curtain
  const rod = cyl(0.02, 0.02, 1.0, 0x6b7280, { metalness: 0.4 });
  rod.rotation.z = Math.PI / 2;
  rod.position.set(1.35, 1.7, -1.2);
  const curtain = box(0.7, 1.5, 0.05, 0x3f3f46, { roughness: 0.9 });
  curtain.position.set(1.35, 0.9, -1.2);
  root.add(rod, curtain);

  // Glass doors
  const door = box(0.7, 1.6, 0.06, 0xe8f0f5, { roughness: 0.25, metalness: 0.1, opacity: 0.7 });
  door.position.set(1.7, 0.9, 0.85);
  const door2 = door.clone();
  door2.position.x = 2.35;
  root.add(door, door2);

  // Shipping boxes
  for (const [x, y, z, s] of [
    [1.85, 0.08, 1.15, 0.35],
    [2.2, 0.08, 1.35, 0.28],
    [1.95, 0.4, 1.25, 0.3],
    [2.35, 0.35, 1.05, 0.25],
  ] as const) {
    const b = cardboard(s, s * 0.85, s * 0.9);
    b.position.set(x, y, z);
    root.add(b);
  }

  return root;
}

/** CPG pallet platform — cartons, bottle, hand truck. */
export function buildCpgScene(): THREE.Group {
  const root = new THREE.Group();
  addShadowDisc(root, 2.8);

  const platform = box(3.2, 0.12, 3.2, 0xd7c4a8, { roughness: 0.75 });
  platform.position.y = 0.06;
  root.add(platform);

  // Pallet
  const pallet = box(1.15, 0.12, 1.0, 0xc4a882);
  pallet.position.set(-0.7, 0.18, -0.2);
  root.add(pallet);
  for (const [x, y, z] of [
    [-0.95, 0.35, -0.4],
    [-0.55, 0.35, -0.4],
    [-0.95, 0.35, 0.0],
    [-0.55, 0.35, 0.0],
    [-0.75, 0.62, -0.2],
  ] as const) {
    const c = cardboard(0.38, 0.28, 0.32);
    c.position.set(x, y, z);
    root.add(c);
  }

  // Tall product boxes
  const tall = box(0.35, 0.95, 0.28, 0xf0ebe3, { roughness: 0.7 });
  tall.position.set(0.25, 0.6, -0.35);
  const mid = box(0.55, 0.35, 0.28, 0xc8c2b8, { roughness: 0.7 });
  mid.position.set(0.55, 0.3, 0.05);
  const bottle = cyl(0.09, 0.1, 0.45, 0xc4a574, { roughness: 0.35 });
  bottle.position.set(0.95, 0.35, -0.15);
  const cap = cyl(0.07, 0.07, 0.06, 0x2a2a2a);
  cap.position.set(0.95, 0.6, -0.15);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.14, 0.22),
    mat(0xf7f4ee),
  );
  label.position.set(0.95, 0.35, -0.04);
  root.add(tall, mid, bottle, cap, label);

  // Hand truck
  const cart = new THREE.Group();
  cart.position.set(1.15, 0.12, 0.75);
  cart.rotation.y = -0.4;
  const frame = mat(0x6b7280, { metalness: 0.55, roughness: 0.4 });
  const rail = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 8, 20, Math.PI), frame);
  rail.rotation.x = Math.PI / 2;
  rail.position.set(0, 0.85, 0);
  const left = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8), frame);
  left.position.set(-0.22, 0.45, 0);
  const right = left.clone();
  right.position.x = 0.22;
  const plate = box(0.5, 0.04, 0.35, 0xc4a882);
  plate.position.set(0, 0.08, 0.15);
  const wheel = cyl(0.1, 0.1, 0.05, 0x22272b);
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(-0.28, 0.1, -0.05);
  const wheel2 = wheel.clone();
  wheel2.position.x = 0.28;
  cart.add(rail, left, right, plate, wheel, wheel2);
  root.add(cart);

  return root;
}

/** Specialty food shop — shelves of jars, counter, tablet. */
export function buildFoodScene(): THREE.Group {
  const root = new THREE.Group();
  addShadowDisc(root, 3.5);

  const floor = box(3.8, 0.08, 3.4, 0xf0ebe3);
  floor.position.set(0, 0.04, 0);
  const wallB = box(3.8, 2.3, 0.12, 0xe8dfd2);
  wallB.position.set(0, 1.15, -1.55);
  const wallL = box(0.12, 2.3, 3.4, 0xe6ddd0);
  wallL.position.set(-1.85, 1.15, 0);
  root.add(floor, wallB, wallL);

  // Window frames
  for (const z of [-0.9, 0.9] as const) {
    const frame = box(0.08, 1.7, 1.0, 0x4a5568);
    frame.position.set(-1.78, 1.0, z);
    const glass = box(0.04, 1.45, 0.8, 0xdbe7f0, { roughness: 0.2, opacity: 0.55 });
    glass.position.set(-1.74, 1.0, z);
    root.add(frame, glass);
  }

  // Back shelves
  for (const y of [1.7, 1.2, 0.7] as const) {
    const shelf = box(2.4, 0.06, 0.35, 0xc4a882);
    shelf.position.set(-0.3, y, -1.25);
    root.add(shelf);
  }
  const jarColors = [0xc45c26, 0xd4a017, 0xb85c38, 0xe8d5a3, 0x8b1e1e, 0xf0c27a];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 7; i++) {
      const j = jar(jarColors[(i + row) % jarColors.length], 0.06, 0.11);
      j.position.set(-1.2 + i * 0.28, [1.73, 1.23, 0.73][row], -1.2);
      root.add(j);
    }
  }

  // Counter
  const counter = box(1.4, 0.85, 0.7, 0xf4f0ea);
  counter.position.set(0.35, 0.42, 0.55);
  const top = box(1.5, 0.06, 0.78, 0xd9c7a8);
  top.position.set(0.35, 0.88, 0.55);
  root.add(counter, top);

  const openBox = cardboard(0.4, 0.25, 0.35, true);
  openBox.position.set(0.05, 0.91, 0.45);
  root.add(openBox);

  // Tablet
  const tablet = box(0.32, 0.02, 0.42, 0x1f2933, { metalness: 0.4, roughness: 0.4 });
  tablet.position.set(0.7, 0.95, 0.55);
  tablet.rotation.x = -0.5;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.26, 0.34),
    mat(0xf5f7fa),
  );
  screen.position.set(0.7, 0.97, 0.55);
  screen.rotation.x = -0.5;
  root.add(tablet, screen);

  // Side cabinet jars
  for (let i = 0; i < 4; i++) {
    const j = jar(jarColors[i], 0.05, 0.1);
    j.position.set(1.2, 0.55 + (i % 2) * 0.35, -0.9 + Math.floor(i / 2) * 0.35);
    root.add(j);
  }

  return root;
}

/** Pet packing table — treats, jars, scale, laptop. */
export function buildPetScene(): THREE.Group {
  const root = new THREE.Group();
  addShadowDisc(root, 3.0);

  const platform = box(3.4, 0.1, 2.6, 0xf4f0ea);
  platform.position.y = 0.05;
  const table = box(2.8, 0.1, 1.8, 0xb8956c);
  table.position.set(0, 0.95, 0);
  for (const [x, z] of [
    [-1.2, -0.7],
    [1.2, -0.7],
    [-1.2, 0.7],
    [1.2, 0.7],
  ] as const) {
    const leg = box(0.12, 0.9, 0.12, 0x9a7a52);
    leg.position.set(x, 0.5, z);
    root.add(leg);
  }
  const shelf = box(2.6, 0.08, 1.6, 0xa88968);
  shelf.position.set(0, 0.35, 0);
  root.add(platform, table, shelf);

  // Treat bags
  const bagColors = [0x2f2a26, 0xd4a017, 0xf5f0e6, 0x3d8b8b];
  for (let i = 0; i < 4; i++) {
    const bag = box(0.22, 0.4, 0.08, bagColors[i], { roughness: 0.85 });
    bag.position.set(-1.05 + i * 0.28, 1.2, -0.35);
    bag.rotation.y = 0.1 * i;
    root.add(bag);
  }

  // Jars
  for (let i = 0; i < 5; i++) {
    const j = jar(0xf3efe6, 0.08, 0.16);
    j.position.set(-0.15 + i * 0.2, 1.0, -0.55);
    root.add(j);
  }

  // Scale + bowl
  const scale = box(0.35, 0.06, 0.28, 0xd0d5db, { metalness: 0.35, roughness: 0.4 });
  scale.position.set(0.15, 1.03, 0.25);
  const bowl = cyl(0.12, 0.1, 0.05, 0xb0b6bd, { metalness: 0.4 });
  bowl.position.set(0.15, 1.1, 0.25);
  root.add(scale, bowl);

  // Laptop
  const laptop = box(0.7, 0.03, 0.45, 0x2a2f36, { metalness: 0.45, roughness: 0.4 });
  laptop.position.set(0.9, 1.02, 0.15);
  const lid = box(0.7, 0.42, 0.03, 0x1f242b, { metalness: 0.4 });
  lid.position.set(0.9, 1.25, -0.05);
  lid.rotation.x = -0.4;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.34), mat(0xf5f7fa));
  screen.position.set(0.9, 1.25, -0.02);
  screen.rotation.x = -0.4;
  root.add(laptop, lid, screen);

  // Under shelf boxes + basket
  const under = cardboard(0.45, 0.25, 0.35);
  under.position.set(-0.7, 0.2, 0.2);
  const basket = box(0.4, 0.22, 0.3, 0xd2b48c, { roughness: 0.9 });
  basket.position.set(0.8, 0.25, 0.35);
  root.add(under, basket);

  // Floor bowl
  const petBowl = cyl(0.16, 0.14, 0.07, 0x3f3f46);
  petBowl.position.set(0.2, 0.12, 1.15);
  root.add(petBowl);

  return root;
}

/** Supplement lab — amber bottles, capsules, powder, shipping box. */
export function buildSupplementScene(): THREE.Group {
  const root = new THREE.Group();
  addShadowDisc(root, 2.6);

  const platform = box(2.8, 0.1, 2.8, 0xf7f7f7, { roughness: 0.55 });
  platform.position.y = 0.05;
  root.add(platform);

  const amber = 0x8b4513;
  const dark = 0x3b2212;
  for (const [x, z, c, h] of [
    [-0.45, -0.15, amber, 0.42],
    [-0.1, -0.35, dark, 0.48],
  ] as const) {
    const body = cyl(0.12, 0.13, h, c, { roughness: 0.3, metalness: 0.08 });
    body.position.set(x, 0.1 + h / 2, z);
    const cap = cyl(0.11, 0.11, 0.07, 0xf5f5f5);
    cap.position.set(x, 0.1 + h + 0.03, z);
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 0.22),
      mat(0xffffff),
    );
    label.position.set(x, 0.1 + h * 0.45, z + 0.14);
    root.add(body, cap, label);
  }

  // Capsule jar
  const jarBody = cyl(0.08, 0.08, 0.12, 0xe8eef2, {
    roughness: 0.25,
    opacity: 0.75,
  });
  jarBody.position.set(0.25, 0.16, 0.15);
  root.add(jarBody);
  for (let i = 0; i < 6; i++) {
    const cap = cyl(0.015, 0.015, 0.04, 0xf0ebe3);
    cap.position.set(
      0.2 + (i % 3) * 0.035,
      0.14,
      0.1 + Math.floor(i / 3) * 0.04,
    );
    root.add(cap);
  }

  // Scoop + powder
  const scoop = box(0.06, 0.02, 0.16, 0xc4a882);
  scoop.position.set(0.15, 0.12, 0.45);
  scoop.rotation.y = 0.5;
  const powder = cyl(0.09, 0.09, 0.015, 0xf5f0e6, { roughness: 1 });
  powder.position.set(0.05, 0.11, 0.55);
  root.add(scoop, powder);

  // Open shipping box
  const ship = cardboard(0.55, 0.4, 0.45, true);
  ship.position.set(0.85, 0.1, -0.15);
  root.add(ship);

  return root;
}
