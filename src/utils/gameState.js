import { PLAYER_STATS } from '../config/character.js';
import { FLOORS } from '../config/floors.js';

// Simple singleton game state shared across scenes (ES modules are
// singletons, so every scene importing this gets the same object).
export const state = {
  hp: PLAYER_STATS.maxHp,
  maxHp: PLAYER_STATS.maxHp,
  lives: PLAYER_STATS.lives,
  maxLives: PLAYER_STATS.lives,
  currentFloorId: FLOORS[0].id,
  checkpointFloorId: FLOORS[0].id
};

export function resetGame() {
  state.hp = PLAYER_STATS.maxHp;
  state.lives = PLAYER_STATS.lives;
  state.currentFloorId = FLOORS[0].id;
  state.checkpointFloorId = FLOORS[0].id;
}

export function setCheckpoint(floorId) {
  state.checkpointFloorId = floorId;
  state.currentFloorId = floorId;
  state.hp = state.maxHp;
}

/**
 * Applies damage to the player. Returns { dead, gameOver }.
 * dead = this life is lost (hp hit 0), gameOver = lives also ran out.
 */
export function damagePlayer(amount) {
  state.hp = Math.max(0, state.hp - amount);
  if (state.hp <= 0) {
    state.lives -= 1;
    if (state.lives <= 0) {
      return { dead: true, gameOver: true };
    }
    state.hp = state.maxHp;
    return { dead: true, gameOver: false };
  }
  return { dead: false, gameOver: false };
}
