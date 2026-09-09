# Skillfull Will

A pixel-art 2D side-scrolling platformer built with Phaser 3 + Vite. You play **Rati**, climbing the 12-story Skillwill Tower through real painted floor art, fighting spiders and themed mobs floor by floor, and facing the final boss **Kosta** on the 13th floor balcony.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173). The game canvas is 1280x720, and pressing SPACE on the title screen also requests real browser fullscreen (that keypress is the one moment a user gesture makes the Fullscreen API work — some embedded/iframe contexts may reject it, in which case the game just stays windowed at its normal scaled size).

## Controls

| Key | Action |
|---|---|
| ← / → | Move |
| Space | Jump |
| X | Punch |
| C | Mind Blow (special ability, see below) |

## Floors

| Floor | Theme | Combat |
|---|---|---|
| 1 | White lobby | No |
| 2–3 | Red | Yes |
| 4–5 | Blue | Yes |
| 6–7 | Yellow | Yes |
| 8–9 | Purple | Yes |
| 10–11 | Yellow (second zone) | Yes |
| 12 | Office | No |
| 13 | Balcony — boss fight vs Kosta | Yes |

Everything about a floor (colors, enemy counts, intro text, `groundY`) lives in [src/config/floors.js](src/config/floors.js) — edit that file to change layout, difficulty, or add more floors.

## Art status

- **Rati (player) and all 13 floor backgrounds are real, painted art** — see `public/assets/character/` and `public/assets/levels/`.
- **Spiders, mobs, and Kosta are still auto-generated placeholder sprites.** Drop real art into `public/assets/enemies/spider/spider.png`, `public/assets/enemies/mob/mob.png`, or `public/assets/boss/kosta/kosta.png` and it's picked up automatically — no code changes needed. See each folder's README.

### Rati's animations

Unlike the enemy/boss slots (single spritesheet PNG), Rati's art ships as **one PNG per frame** — see `public/assets/character/<idle|run|jump|punch|mind_blow>/`, each with a README, plus `public/assets/character/manifest.json` from the original art pack. Frame counts/fps/scale live in [src/config/character.js](src/config/character.js).

**`animations/` in the repo root is the pristine source art** (one folder per animation, plus `manifest.json` and the original zip). `public/assets/character/` holds the *processed* frames the game actually loads. If you need to rebuild, always start from `animations/` — never from the processed copies.

Processing does three things, and each one matters:

1. **Removes baked-in debug markup.** The export has a frame-number caption under the feet plus stray guide lines/letters. All of it is near-black (value ≤92) or a 1–3px hairline, whereas the real effect art — the ground shadows and the punch impact burst — is light grey (≥110) and the mind_blow aura is saturated purple. So cleanup keeps anything bright or colourful and erases only genuinely dark/thin bits. **Do not** simplify this to "erase everything that isn't the character": the punch burst and the airborne shadows are separate shapes, and blanket-erasing them guts the punch and jump animations.
2. **Aligns the animations to each other, per animation — never per frame.** idle/run/jump were drawn ~20px higher on the canvas than punch/mind_blow, so each animation gets one uniform shift. Shifting *per frame* destroys the motion that's deliberately in the art (the jump's tuck and rise, mind_blow's levitation at the apex). Alignment is measured from the **shoes**, not the sprite bounding box — each frame's soft grey shadow extends ~6px below the feet, so aligning on the bbox anchors Rati by his shadow's lower edge and leaves him hovering. Every animation's shoe line now sits at native y=224, which is what `CHARACTER_ORIGIN`/`CHARACTER_BODY` in `character.js` are built around.
3. **Strips the ground shadow from the airborne jump frames**, since physics lifts the sprite during a jump and a shadow travelling with him would hang in mid-air. Grounded animations keep theirs.

### Level backgrounds

Each floor's painted background is `public/assets/levels/<floorId>.png`, loaded at native resolution — [src/utils/levelBuilder.js](src/utils/levelBuilder.js) positions it using that floor's `groundY` (the row, in the image's own pixels, where the floor line sits) so every floor's walkable line lands at the same on-screen height regardless of how tall the source art is. A floor with no matching PNG falls back to a flat theme-colored ground instead of crashing.

## Special abilities (per character)

**Rati's special is Mind Blow** (key **C**): he levitates briefly, invulnerable, then deals AoE damage to every enemy/boss within range. A cooldown bar in the HUD (bottom-left, under the HP bar) shows when it's recharging vs ready. Tuning (damage, radius, cooldown) lives in `PLAYER_STATS.mindBlow` in [src/config/character.js](src/config/character.js); the logic is in `Player.useMindBlow()` in [src/entities/Player.js](src/entities/Player.js).

Future Skillwill characters would get their own ability the same way — tell me the character and what it should do.

## Project structure

```
src/
  main.js              Phaser game config, scene list
  config/
    floors.js          All 13 floors' data (theme, enemies, intro text, groundY)
    character.js        Rati's animation config, display scale, collision box, stats
    controls.js         Key bindings
  scenes/
    BootScene.js         -> Preload
    PreloadScene.js      Loads real art (per-frame character PNGs + level backgrounds), falls back to placeholders
    TitleScene.js        Title screen
    FloorScene.js        Generic scene used for floors 1–12
    BossScene.js         Floor 13 — Kosta fight
    HUDScene.js          HP bar / lives / floor name overlay (runs in parallel)
    GameOverScene.js
    VictoryScene.js
  entities/
    Player.js            Movement, punch, Mind Blow, animations, damage/invulnerability
    Enemy.js             Spiders + themed mobs (patrol AI, HP, contact damage)
    Boss.js               Kosta — phases, dash attacks, spawns spider adds
  utils/
    gameState.js          HP/lives/checkpoint singleton shared across scenes
    levelBuilder.js        Builds a floor's background/ground/camera/world bounds from its config + art
    placeholderArt.js      Generates placeholder pixel sprites at runtime (enemies/boss, and Rati as a fallback)
public/assets/            Drop real art here (see folder READMEs)
```

## Current gameplay rules

- Each floor is a side-scrolling level — reach the elevator at the far right to advance (you don't have to kill every enemy).
- Floor entrance = checkpoint. Dying resets you to full HP at your current floor's checkpoint and costs one life.
- Running out of lives ends the game (Game Over screen, restart from floor 1).
- Defeating Kosta on floor 13 ends the game with a Victory screen.

## Not built yet (by design, waiting on your input)

- Real enemy/boss art (placeholders are wired and swappable, see above)
- Sound effects and music (the game is currently silent)
- Mobile/touch controls
- Any additional per-floor puzzle/task beyond "reach the exit" (we can add these later per floor in `floors.js`)
