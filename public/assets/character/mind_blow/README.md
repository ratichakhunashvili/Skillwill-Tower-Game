# mind_blow animation

Rati's special ability art — one PNG per frame (not a spritesheet):

```
mind_blow_01.png, ..., mind_blow_13.png
```

**Format:** 256x256 transparent canvas per frame, character facing right, all 13 frames used (no blank trailing frame in this set). Frame count/fps and the ability's damage/radius/cooldown are configured in `src/config/character.js` → `CHARACTER_ANIMATIONS.mind_blow` and `PLAYER_STATS.mindBlow`.

Triggered with the special key (`CONTROLS.special`, currently `C`) — see `Player.useMindBlow()` in `src/entities/Player.js`.
