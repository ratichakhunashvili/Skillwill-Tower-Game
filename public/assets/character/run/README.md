# run animation

Rati's real art lives here as one PNG per frame (not a spritesheet):

```
run_01.png, run_02.png, ..., run_09.png
```

**Format:** 256x256 transparent canvas per frame, character facing right. Frame count/fps are configured in `src/config/character.js` → `CHARACTER_ANIMATIONS.run`.

Note: the original export's `run_10.png` is a blank/empty frame (a small bug in the art pack) and is intentionally excluded — `frameCount: 9` in the config stops one frame early.

To swap in new/updated art, replace files here keeping the same naming pattern and update `frameCount` in `character.js` if the count changes. See `public/assets/character/manifest.json` for the original per-animation frame/fps notes from the art pack.
