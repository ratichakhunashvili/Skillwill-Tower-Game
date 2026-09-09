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
// NOTE: the source pack's very last frame in idle/run/jump/punch (e.g.
// idle_08.png) is a fully blank/empty canvas — a small bug in the export.
// frameCount below intentionally excludes that trailing blank frame so the
// animations don't flash empty every loop.
// ---------------------------------------------------------------------------

export const CHARACTER_NATIVE_SIZE = 256; // every source frame is a 256x256 canvas

// Shrinks the whole 256x256 canvas so Rati reads at a sensible size on
// screen. Rati's silhouette is ~135-140px tall inside that canvas, so at
// 0.6 he ends up roughly 80-85px tall in-game. Change this one number to
// resize Rati everywhere (animations + collision box scale with it).
export const CHARACTER_SCALE = 0.6;

// Collision box, in NATIVE (pre-scale) pixels — Player.js scales it via
// Phaser's body.setSize/setOffset. height is deliberately sized to reach
// the bottom of the 256 canvas (256 - offsetY) rather than hugging Rati's
// literal foot pixels: every frame's canvas has a few px of transparent
// padding below the feet, and that padding differs slightly frame to frame
// (idle/run/jump end ~226-227, punch/mind_blow ~230-231). Anchoring the box
// (and the sprite's origin, set in Player.js) to the canvas edge instead of
// the exact foot pixel keeps Rati's feet glued to the ground with zero
// jitter when the animation switches.
export const CHARACTER_BODY = { width: 80, height: 165, offsetX: 88, offsetY: 91 };

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
  punchRange: 40,
  punchCooldownMs: 350,
  invulnerableAfterHitMs: 900,
  // Mind Blow (key CONTROLS.special): Rati levitates in place, briefly
  // invulnerable, then blasts every enemy/boss within `radius` of him for
  // `damage`. durationMs roughly matches the 13-frame mind_blow animation
  // at its suggested_fps (13 frames / 10fps ≈ 1.3s).
  mindBlow: {
    damage: 40,
    radius: 140,
    durationMs: 1300,
    cooldownMs: 8000,
    liftHeight: 46
  }
};
