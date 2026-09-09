import Phaser from 'phaser';
import { CHARACTER_ANIMATIONS } from '../config/character.js';
import { FLOORS } from '../config/floors.js';

// ---------------------------------------------------------------------------
// Tries to load real art for Rati (idle/run/jump/punch/mind_blow), the
// spider/mob enemies, the boss, and every floor's background. Anything not
// found simply doesn't register a texture — entities then fall back to a
// generated placeholder automatically (see PLACEHOLDER usage in
// entities/*.js and utils/placeholderArt.js). 404s in the console for
// missing files here are expected and harmless.
//
// Rati's animations are shipped as one PNG per frame (not a spritesheet),
// so each frame is loaded as its own image keyed `char_<anim>_<n>`
// (1-based, zero-padded to 2 digits, matching the source filenames).
// ---------------------------------------------------------------------------
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this.load.on('loaderror', () => { /* expected when real art isn't in place yet */ });

    Object.entries(CHARACTER_ANIMATIONS).forEach(([name, cfg]) => {
      for (let i = 1; i <= cfg.frameCount; i++) {
        const n = String(i).padStart(2, '0');
        this.load.image(`char_${name}_${i}`, `assets/character/${name}/${name}_${n}.png`);
      }
    });

    this.load.image('enemy_spider', 'assets/enemies/spider/spider.png');
    this.load.image('enemy_mob', 'assets/enemies/mob/mob.png');
    this.load.image('boss_kosta', 'assets/boss/kosta/kosta.png');

    FLOORS.forEach(floor => {
      this.load.image(`level_bg_${floor.id}`, `assets/levels/${floor.id}.png`);
    });
  }

  create() {
    this.scene.start('Title');
  }
}
