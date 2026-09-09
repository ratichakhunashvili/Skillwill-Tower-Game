import { WORLD } from '../config/floors.js';

// How far down the viewport the ground line sits. Leaves headroom above to
// show off the painted backgrounds, and a little margin below the ground
// so a bit of floor/reflection is visible under Rati's feet.
const GROUND_SCREEN_Y = 587;

// Thickness of the invisible ground collider (world px). Only its top edge
// matters for platforming, so this just needs to be tall enough that fast
// falls can't tunnel through it in one physics step.
const GROUND_COLLIDER_THICKNESS = 60;

/**
 * Builds one floor's background + ground collider + world/camera bounds.
 *
 * If public/assets/levels/<floor.id>.png exists, it's used as-is at native
 * resolution, shifted vertically so floor.groundY (that image's own floor
 * line) lands at the shared WORLD.groundY — so every floor's walkable line
 * ends up at the same world-space height regardless of how tall or short
 * its source art is, and the camera framing below never has to special-case
 * individual floors.
 *
 * If no background art exists for this floor yet, falls back to the
 * original flat theme-colored ground + decorative stripes so a
 * future/placeholder floor never crashes or renders blank.
 *
 * Returns { worldWidth, worldHeight, groundY, solids } for the scene to use
 * when placing the player, enemies, and the exit zone.
 */
export function buildLevel(scene, floor) {
  const bgKey = `level_bg_${floor.id}`;
  const hasBg = scene.textures.exists(bgKey);

  let worldWidth;
  let worldHeight;

  scene.cameras.main.setBackgroundColor(floor.bg);

  if (hasBg) {
    const src = scene.textures.get(bgKey).getSourceImage();
    worldWidth = src.width;
    const bgOffsetY = WORLD.groundY - floor.groundY;
    worldHeight = bgOffsetY + src.height;
    scene.add.image(0, bgOffsetY, bgKey).setOrigin(0, 0);
  } else {
    worldWidth = WORLD.fallbackWidth;
    worldHeight = WORLD.groundY + GROUND_COLLIDER_THICKNESS;
    for (let x = 60; x < worldWidth; x += 220) {
      scene.add.rectangle(x, 0, 6, WORLD.groundY, floor.accent, 0.12).setOrigin(0, 0);
    }
  }

  const solids = scene.physics.add.staticGroup();
  const ground = scene.add
    .rectangle(0, WORLD.groundY, worldWidth, GROUND_COLLIDER_THICKNESS, floor.ground, hasBg ? 0 : 1)
    .setOrigin(0, 0);
  scene.physics.add.existing(ground, true);
  solids.add(ground);

  scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);

  const camTop = Math.max(0, WORLD.groundY - GROUND_SCREEN_Y);
  scene.cameras.main.setBounds(0, camTop, worldWidth, WORLD.viewHeight);

  return { worldWidth, worldHeight, groundY: WORLD.groundY, solids };
}
