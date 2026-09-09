# run animation

Put your run spritesheet here, named exactly:

```
run.png
```

**Format:** one horizontal row of equal-size frames (frame 0, 1, 2, ... left to right), transparent background, facing **right**.

**Current config** (edit in `src/config/character.js` → `CHARACTER_ANIMATIONS.run` to match your actual art):
- frame size: 32 x 48 px
- frame count: 4
- frame rate: 10 fps

As soon as a valid `run.png` matching the configured frame size/count is here, the game uses it automatically instead of the placeholder sprite — no code changes needed beyond updating the numbers above if your frame size differs.
