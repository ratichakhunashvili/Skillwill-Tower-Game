# jump animation

Put your jump spritesheet here, named exactly:

```
jump.png
```

**Format:** one horizontal row of equal-size frames (frame 0, 1, 2, ... left to right), transparent background, facing **right**. A single frame is fine (held for the whole time the player is airborne).

**Current config** (edit in `src/config/character.js` → `CHARACTER_ANIMATIONS.jump` to match your actual art):
- frame size: 32 x 48 px
- frame count: 1
- frame rate: 1 fps

As soon as a valid `jump.png` matching the configured frame size/count is here, the game uses it automatically instead of the placeholder sprite — no code changes needed beyond updating the numbers above if your frame size differs.
