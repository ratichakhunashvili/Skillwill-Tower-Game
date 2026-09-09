# idle animation

Put your idle spritesheet here, named exactly:

```
idle.png
```

**Format:** one horizontal row of equal-size frames (frame 0, 1, 2, ... left to right), transparent background, facing **right**.

**Current config** (edit in `src/config/character.js` → `CHARACTER_ANIMATIONS.idle` to match your actual art):
- frame size: 32 x 48 px
- frame count: 2
- frame rate: 3 fps

As soon as a valid `idle.png` matching the configured frame size/count is here, the game uses it automatically instead of the placeholder sprite — no code changes needed beyond updating the numbers above if your frame size differs.
