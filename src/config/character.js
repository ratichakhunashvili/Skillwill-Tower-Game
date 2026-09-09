// ---------------------------------------------------------------------------
// Character animation + stat config.
//
// HOW TO DROP IN YOUR REAL ART:
//   1. For each animation, put a spritesheet PNG at:
//        public/assets/character/<name>/<name>.png
//      e.g. public/assets/character/idle/idle.png
//   2. The spritesheet must be a single horizontal row of equally-sized
//      frames (frame 0, frame 1, frame 2, ... left to right).
//   3. Update frameWidth / frameHeight / frameCount / frameRate below to
//      match your actual art. That's it — no other code changes needed.
//      The game will automatically use your art instead of the generated
//      placeholder the moment a valid PNG is found at that path.
// ---------------------------------------------------------------------------

export const CHARACTER_ANIMATIONS = {
  idle: { frameWidth: 32, frameHeight: 48, frameCount: 2, frameRate: 3, repeat: -1 },
  run: { frameWidth: 32, frameHeight: 48, frameCount: 4, frameRate: 10, repeat: -1 },
  jump: { frameWidth: 32, frameHeight: 48, frameCount: 1, frameRate: 1, repeat: 0 },
  punch: { frameWidth: 32, frameHeight: 48, frameCount: 2, frameRate: 14, repeat: 0 }
};

export const PLAYER_STATS = {
  maxHp: 100,
  lives: 3,
  moveSpeed: 140,
  jumpVelocity: 360,
  punchDamage: 15,
  punchRange: 26,
  punchCooldownMs: 350,
  invulnerableAfterHitMs: 900
};
