import Phaser from 'phaser';
import { state } from '../utils/gameState.js';
import { getFloor } from '../config/floors.js';

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUD');
  }

  create() {
    this.barBg = this.add.rectangle(14, 14, 180, 14, 0x000000).setOrigin(0, 0).setScrollFactor(0).setDepth(1000);
    this.barFill = this.add.rectangle(16, 16, 176, 10, 0xe74c3c).setOrigin(0, 0).setScrollFactor(0).setDepth(1001);
    this.hpText = this.add.text(14, 30, '', { fontFamily: 'monospace', fontSize: '14px', color: '#ffffff' }).setScrollFactor(0).setDepth(1001);
    this.livesText = this.add.text(this.scale.width - 14, 14, '', { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(1001);
    this.floorText = this.add.text(this.scale.width / 2, 14, '', { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(1001);
  }

  update() {
    const pct = Phaser.Math.Clamp(state.hp / state.maxHp, 0, 1);
    this.barFill.width = 176 * pct;
    this.barFill.fillColor = pct > 0.5 ? 0x2ecc71 : pct > 0.25 ? 0xf1c40f : 0xe74c3c;
    this.hpText.setText(`${state.hp}/${state.maxHp}`);
    this.livesText.setText(`Lives: ${state.lives}`);
    const floor = getFloor(state.currentFloorId);
    this.floorText.setText(floor ? floor.name : '');
  }
}
