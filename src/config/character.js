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
// NOTE on the source pack, and how every frame was reprocessed in place:
//  1. The very last frame in idle/run/jump/punch (e.g. idle_08.png) is a
//     fully blank/empty canvas — frameCount below excludes it.
//  2. Every frame carried small baked-in debug markup (a frame-number
//     caption, stray guide lines, a stray letter). That markup is all
//     near-black (avg value <= 92) or a 1-3px tall guide line, whereas the
//     real effect art — the ground shadows and the punch impact burst — is
//     light grey (value >= 110) and the mind_blow aura is saturated
//     purple. The cleanup keeps the largest component plus anything bright
//     or colourful and erases the rest. DON'T loosen this into "erase
//     everything that isn't the character": the punch impact burst and the
//     airborne ground shadows are separate components, and blanket-erasing
//     them silently guts the punch and jump animations.
//  3. idle/run/jump were drawn ~20px higher on the canvas than
//     punch/mind_blow, so the sets had to be aligned. That alignment is
//     applied PER ANIMATION (one uniform shift for all of an animation's
//     frames), never per frame: within an animation the vertical spread is
//     intentional motion — the jump's tuck and airborne rise, mind_blow's
//     levitation at the apex — and flattening each frame's bbox to a fixed
//     line destroys exactly that.
//  4. Alignment is measured from the SHOES, not the sprite's bbox. Each
//     frame also contains a soft grey ground shadow that extends ~6px
//     BELOW the feet, so aligning on the bbox bottom anchors Rati by his
//     shadow's lower edge and leaves him hovering above the floor. Shoe
//     pixels are identifiable because they're dark outlines or bright
//     white soles, while the shadow is flat mid-grey — that's how the
//     foot line was found. Every animation's shoe line now sits at native
//     y=224 and CHARACTER_ORIGIN is that point as a Phaser origin
//     fraction, so sprite.y is genuinely where Rati's feet meet the floor.
//  5. The airborne jump frames had their baked ground shadow removed:
//     physics lifts the sprite during a jump, so a shadow travelling with
//     him would hang in mid-air. Grounded animations keep theirs.
// ---------------------------------------------------------------------------

export const CHARACTER_NATIVE_SIZE = 256; // every source frame is a 256x256 canvas

// Shrinks the whole 256x256 canvas so Rati reads at a sensible size on
// screen. Change this one number to resize Rati everywhere (animations +
// collision box scale with it).
export const CHARACTER_SCALE = 0.85;

// Sprite origin, as Phaser fractions (0-1) of the 256x256 canvas — the
// point in every frame that maps to Player's (x, y). Every animation's
// shoe line sits at native y=224 and the feet are centred on native
// x=128, so `y` here is genuinely where Rati's feet meet the floor.
export const CHARACTER_ORIGIN = { x: 128 / 256, y: 224 / 256 };

// Collision box, in NATIVE (pre-scale) pixels — Player.js scales it via
// Phaser's body.setSize/setOffset. Sized to idle's resting silhouette, not
// punch/mind_blow's extended reach (those use their own hitbox/AoE circle
// instead of the body), and centred on the origin's x so the box stays
// symmetric when the sprite flips to face left. offsetY + height lands
// exactly on the native 224 shoe line, so the body's bottom edge always
// equals the sprite's y and Rati's feet can't drift off the floor.
export const CHARACTER_BODY = { width: 76, height: 117, offsetX: 90, offsetY: 107 };

export const CHARACTER_ANIMATIONS = {
  idle: { frameCount: 7, frameRate: 8, repeat: -1 },
  run: { frameCount: 9, frameRate: 18, repeat: -1 },
  jump: { frameCount: 7, frameRate: 15, repeat: 0 },
  punch: { frameCount: 7, frameRate: 18, repeat: 0 },
  mind_blow: { frameCount: 13, frameRate: 15, repeat: 0 }
};

export const PLAYER_STATS = {
  maxHp: 100,
  lives: 3,
  moveSpeed: 215,
  jumpVelocity: 430,
  // Snappier than a floaty default: paired with the higher world gravity
  // in main.js so jumps rise fast and come down fast instead of hanging.
  maxFallSpeed: 900,
  dragX: 1600,
  punchDamage: 15,
  punchRange: 56,
  // Extra recovery time added AFTER the punch animation itself finishes,
  // before another punch can start. The punch's own busy-lock and the
  // "can I punch again" gate are both derived from the actual 'punch'
  // animation's real duration at runtime (Player.punch()) rather than a
  // second hardcoded number — a fixed duration here that doesn't match the
  // animation's real length is exactly what caused the swing to visibly
  // get cut short and re-trigger mid-animation.
  punchRecoveryMs: 40,
  invulnerableAfterHitMs: 900,
  // Mind Blow (key CONTROLS.special): Rati charges up and levitates,
  // briefly invulnerable, then blasts every enemy/boss within `radius` of
  // him for `damage`. Its duration is read from the real 'mind_blow'
  // animation at runtime (Player.useMindBlow()), not hardcoded here, so it
  // can never drift out of sync with CHARACTER_ANIMATIONS.mind_blow above.
  // There's deliberately no lift/hover value here: the animation's own art
  // already lifts Rati off the ground at its apex, so adding a positional
  // tween on top of it made him rise twice as far as the art intends.
  mindBlow: {
    damage: 40,
    radius: 170,
    cooldownMs: 5000
  }
};
