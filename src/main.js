import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import TitleScene from './scenes/TitleScene.js';
import FloorScene from './scenes/FloorScene.js';
import BossScene from './scenes/BossScene.js';
import HUDScene from './scenes/HUDScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';
import { WORLD } from './config/floors.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  pixelArt: true,
  roundPixels: true,
  width: WORLD.viewWidth,
  height: WORLD.viewHeight,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: WORLD.viewWidth,
    height: WORLD.viewHeight
  },
  physics: {
    default: 'arcade',
    arcade: {
      // High-ish gravity paired with PLAYER_STATS.jumpVelocity keeps jumps
      // snappy — rise fast, fall fast — rather than floaty.
      gravity: { y: 1350 },
      debug: false
    }
  },
  scene: [BootScene, PreloadScene, TitleScene, FloorScene, BossScene, HUDScene, GameOverScene, VictoryScene]
};

new Phaser.Game(config);
