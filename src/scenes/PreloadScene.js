import Phaser from 'phaser';
import { CHARACTER_ANIMATIONS } from '../config/character.js';

// ---------------------------------------------------------------------------
// Tries to load real art for the character (idle/run/jump/punch), the
// spider/mob enemies, and the boss. Anything not found simply doesn't
// register a texture — every entity class then falls back to a generated
// placeholder automatically. 404s in the console for missing files here
// are expected and harmless.
// ---------------------------------------------------------------------------
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this.load.on('loaderror', () => { /* expected when real art isn't in place yet */ });

    Object.entries(CHARACTER_ANIMATIONS).forEach(([name, cfg]) => {
      this.load.spritesheet(`char_${name}`, `assets/character/${name}/${name}.png`, {
        frameWidth: cfg.frameWidth,
        frameHeight: cfg.frameHeight
      });
    });

    this.load.image('enemy_spider', 'assets/enemies/spider/spider.png');
    this.load.image('enemy_mob', 'assets/enemies/mob/mob.png');
    this.load.image('boss_kosta', 'assets/boss/kosta/kosta.png');
  }

  create() {
    this.scene.start('Title');
  }
}
