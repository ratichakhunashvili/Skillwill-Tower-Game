import Phaser from 'phaser';
import { state } from '../utils/gameState.js';
import { getFloor } from '../config/floors.js';
import { PLAYER_STATS } from '../config/character.js';
import { CONTROLS } from '../config/controls.js';

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUD');
  }

  create() {
    this.barBg = this.add.rectangle(18, 18, 240, 18, 0x000000).setOrigin(0, 0).setScrollFactor(0).setDepth(1000);
    this.barFill = this.add.rectangle(21, 21, 234, 12, 0xe74c3c).setOrigin(0, 0).setScrollFactor(0).setDepth(1001);
    this.hpText = this.add.text(18, 40, '', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' }).setScrollFactor(0).setDepth(1001);
    this.livesText = this.add.text(this.scale.width - 18, 18, '', { fontFamily: 'monospace', fontSize: '20px', color: '#ffffff' })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(1001);
    this.floorText = this.add.text(this.scale.width / 2, 18, '', { fontFamily: 'monospace', fontSize: '20px', color: '#ffffff' })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(1001);

    // Mind Blow cooldown indicator: a small labeled bar that fills as the
    // ability recharges and glows bright purple the moment it's ready.
    this.mindBlowLabel = this.add.text(18, 76, `MIND BLOW (${CONTROLS.special})`, {
      fontFamily: 'monospace', fontSize: '13px', color: '#cbb4e0'
    }).setScrollFactor(0).setDepth(1001);
    this.mindBlowBarBg = this.add.rectangle(18, 96, 160, 12, 0x000000).setOrigin(0, 0).setScrollFactor(0).setDepth(1000);
    this.mindBlowBarFill = this.add.rectangle(20, 98, 156, 8, 0x8e44ad).setOrigin(0, 0).setScrollFactor(0).setDepth(1001);

    // Fullscreen is opt-in only, toggleable anytime during play too.
    this.input.keyboard.on('keydown-F', () => {
      if (!this.scale.fullscreen.available) return;
      try { this.scale.toggleFullscreen(); } catch (e) { /* fullscreen not available here */ }
    });
  }

  update() {
    const pct = Phaser.Math.Clamp(state.hp / state.maxHp, 0, 1);
    this.barFill.width = 234 * pct;
    this.barFill.fillColor = pct > 0.5 ? 0x2ecc71 : pct > 0.25 ? 0xf1c40f : 0xe74c3c;
    this.hpText.setText(`${state.hp}/${state.maxHp}`);
    this.livesText.setText(`Lives: ${state.lives}`);
    const floor = getFloor(state.currentFloorId);
    this.floorText.setText(floor ? floor.name : '');

    const cooldownMs = PLAYER_STATS.mindBlow.cooldownMs;
    const remaining = state.mindBlowReadyAt - this.time.now;
    const ready = remaining <= 0;
    const readyPct = ready ? 1 : Phaser.Math.Clamp(1 - remaining / cooldownMs, 0, 1);
    this.mindBlowBarFill.width = 156 * readyPct;
    this.mindBlowBarFill.fillColor = ready ? 0xbb6bdd : 0x5a3d6b;
  }
}
