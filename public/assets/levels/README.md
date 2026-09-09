# level backgrounds

One painted background PNG per floor, named by floor id:

```
1.png, 2.png, 3.png, ..., 13.png
```

Loaded automatically by `PreloadScene` as `level_bg_<id>`. `src/utils/levelBuilder.js` reads each image's native size at load time (levels don't need to be a fixed resolution) and positions it using that floor's `groundY` value from `src/config/floors.js` — the row, in that image's own pixels, where the walkable floor line actually sits. Every floor's `groundY` was measured by eye against a ruler overlay; if you swap in new art, re-check where the floor line falls and update `groundY` to match, or Rati will appear to float above or sink into the new background.

A floor with no `<id>.png` here falls back to a flat theme-colored ground (see `floor.bg`/`floor.ground` in `floors.js`) instead of crashing.
