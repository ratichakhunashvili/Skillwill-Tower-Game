# punch animation

Put your punch spritesheet here, named exactly:

```
punch.png
```

**Format:** one horizontal row of equal-size frames (frame 0, 1, 2, ... left to right), transparent background, facing **right**. Plays once per punch (roughly 220ms window), so keep it short.

**Current config** (edit in `src/config/character.js` → `CHARACTER_ANIMATIONS.punch` to match your actual art):
- frame size: 32 x 48 px
- frame count: 2
- frame rate: 14 fps

As soon as a valid `punch.png` matching the configured frame size/count is here, the game uses it automatically instead of the placeholder sprite — no code changes needed beyond updating the numbers above if your frame size differs.
