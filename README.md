# Skillfull Will

A pixel-art 2D side-scrolling platformer built with Phaser 3 + Vite. You play a Skillwill character climbing the 12-story Skillwill Tower, fighting spiders and themed mobs floor by floor, and facing the final boss **Kosta** on the 13th floor balcony.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Controls

| Key | Action |
|---|---|
| ← / → | Move |
| Space | Jump |
| X | Punch |

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

Everything about a floor (colors, enemy counts, intro text) lives in [src/config/floors.js](src/config/floors.js) — edit that file to change layout, difficulty, or add more floors.

## Adding your character's real art

The game currently uses **auto-generated placeholder sprites** so it's playable right away. To swap in real pixel art:

1. Put spritesheet PNGs in `public/assets/character/<idle|run|jump|punch>/<name>.png`. Each README in those folders explains the exact filename and frame format expected.
2. If your frame size/count differs from the defaults, update [src/config/character.js](src/config/character.js) (`CHARACTER_ANIMATIONS`) to match.
3. Reload the page — real art is used automatically the moment a matching file is found. No other code changes needed.

The same drop-in pattern works for enemies (`public/assets/enemies/spider/spider.png`, `public/assets/enemies/mob/mob.png`) and the boss (`public/assets/boss/kosta/kosta.png`), though those are optional — placeholders are fine for them long-term too.

## Special abilities (per character)

Each Skillwill character you give me will get its own special ability. The hook is already wired:
- Key **C** is reserved for it in [src/config/controls.js](src/config/controls.js) (`CONTROLS.special`).
- `Player` doesn't implement a special move yet — tell me the character and what their ability should do, and I'll add it to [src/entities/Player.js](src/entities/Player.js).

## Project structure

```
src/
  main.js              Phaser game config, scene list
  config/
    floors.js          All 13 floors' data (theme, enemies, intro text)
    character.js        Player animation frame config + stats (hp, speed, damage...)
    controls.js         Key bindings
  scenes/
    BootScene.js         -> Preload
    PreloadScene.js      Tries to load real art, falls back to placeholders
    TitleScene.js        Title screen
    FloorScene.js        Generic scene used for floors 1–12
    BossScene.js         Floor 13 — Kosta fight
    HUDScene.js          HP bar / lives / floor name overlay (runs in parallel)
    GameOverScene.js
    VictoryScene.js
  entities/
    Player.js            Movement, punch, animations, damage/invulnerability
    Enemy.js             Spiders + themed mobs (patrol AI, HP, contact damage)
    Boss.js               Kosta — phases, dash attacks, spawns spider adds
  utils/
    gameState.js          HP/lives/checkpoint singleton shared across scenes
    placeholderArt.js      Generates placeholder pixel sprites at runtime
public/assets/            Drop real art here (see folder READMEs)
```

## Current gameplay rules

- Each floor is a side-scrolling level — reach the elevator/exit door at the far right to advance (you don't have to kill every enemy).
- Floor entrance = checkpoint. Dying resets you to full HP at your current floor's checkpoint and costs one life.
- Running out of lives ends the game (Game Over screen, restart from floor 1).
- Defeating Kosta on floor 13 ends the game with a Victory screen.

## Not built yet (by design, waiting on your input)

- Real character/enemy/boss art (placeholders are wired and swappable, see above)
- Per-character special abilities
- Any additional per-floor puzzle/task beyond "reach the exit" (we can add these later per floor in `floors.js`)
