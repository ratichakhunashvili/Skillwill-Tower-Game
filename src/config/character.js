// ---------------------------------------------------------------------------
// Character animation + stat config for Rati.
//
// ART FORMAT: unlike the original placeholder pipeline, Rati's real art is
// NOT a spritesheet. Each animation frame is its own transparent PNG on a
// 256x256 canvas, named <anim>_01.png, <anim>_02.png, ... (see
// public/assets/character/<anim>/ and the manifest.json dropped alongside
// them). PreloadScene loads every frame as its own texture keyed
// `char_<anim>_<n>`, and Player.js stitches them into a Phaser animation.
//
// NOTE on the source pack, and why every frame got reprocessed in place:
//  1. The very last frame in idle/run/jump/punch (e.g. idle_08.png) is a
//     fully blank/empty canvas — frameCount below excludes it.
//  2. Every frame originally carried small baked-in debug markup (a frame
//     number caption, stray guide lines/letters) near/below the feet, and —
//     more importantly — each pose was NOT registered to a common foot
//     position: idle/run/jump's feet sat noticeably higher in the 256
//     canvas than punch/mind_blow's crouch. Anchoring the sprite to a
//     single fixed point (as this config does) against ungroomed art like
//     that is exactly what makes a character hover/sink when switching
//     animations. Every source PNG has been cleaned (markup erased) and
//     shifted so every frame's foot line sits at the same canvas position:
//     native (128, 231). CHARACTER_ORIGIN below is that point expressed as
//     a Phaser origin fraction. If new art is dropped in, re-register it
//     the same way (or these numbers will need re-measuring).
// ---------------------------------------------------------------------------

export const CHARACTER_NATIVE_SIZE = 256; // every source frame is a 256x256 canvas

// Shrinks the whole 256x256 canvas so Rati reads at a sensible size on
// screen. Change this one number to resize Rati everywhere (animations +
// collision box scale with it).
export const CHARACTER_SCALE = 0.85;

// Sprite origin, as Phaser fractions (0-1) of the 256x256 canvas — the
// point in every frame that maps to Player's (x, y). Every frame is
// registered so its feet sit at native (128, 231); this is that point
// expressed as a fraction, so `y` is Rati's actual ground-contact row
// rather than the canvas edge.
export const CHARACTER_ORIGIN = { x: 128 / 256, y: 231 / 256 };

// Collision box, in NATIVE (pre-scale) pixels — Player.js scales it via
// Phaser's body.setSize/setOffset. Sized to idle/run/jump's resting
// silhouette (not punch/mind_blow's extended reach, which use their own
// separate hitbox/AoE circle instead of the body) and anchored to the same
// native (128, 231) foot point every frame now shares.
export const CHARACTER_BODY = { width: 76, height: 121, offsetX: 90, offsetY: 110 };

export const CHARACTER_ANIMATIONS = {
  idle: { frameCount: 7, frameRate: 6, repeat: -1 },
  run: { frameCount: 9, frameRate: 12, repeat: -1 },
  jump: { frameCount: 7, frameRate: 10, repeat: 0 },
  punch: { frameCount: 7, frameRate: 12, repeat: 0 },
  mind_blow: { frameCount: 13, frameRate: 10, repeat: 0 }
};

export const PLAYER_STATS = {
  maxHp: 100,
  lives: 3,
  moveSpeed: 140,
  jumpVelocity: 360,
  punchDamage: 15,
  punchRange: 56,
  punchCooldownMs: 350,
  invulnerableAfterHitMs: 900,
  // Mind Blow (key CONTROLS.special): Rati levitates in place, briefly
  // invulnerable, then blasts every enemy/boss within `radius` of him for
  // `damage`. durationMs roughly matches the 13-frame mind_blow animation
  // at its suggested_fps (13 frames / 10fps ≈ 1.3s).
  mindBlow: {
    damage: 40,
    radius: 170,
    durationMs: 1300,
    cooldownMs: 8000,
    liftHeight: 55
  }
};
