import Phaser from 'phaser';
import { state } from '../utils/gameState.js';
import { getFloor } from '../config/floors.js';

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUD');
  }

  create() {
    this.barBg = this.add.rectangle(8, 8, 100, 8, 0x000000).setOrigin(0, 0).setScrollFactor(0).setDepth(1000);
    this.barFill = this.add.rectangle(9, 9, 98, 6, 0xe74c3c).setOrigin(0, 0).setScrollFactor(0).setDepth(1001);
    this.hpText = this.add.text(8, 18, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ffffff' }).setScrollFactor(0).setDepth(1001);
    this.livesText = this.add.text(this.scale.width - 8, 8, '', { fontFamily: 'monospace', fontSize: '10px', color: '#ffffff' })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(1001);
    this.floorText = this.add.text(this.scale.width / 2, 8, '', { fontFamily: 'monospace', fontSize: '10px', color: '#ffffff' })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(1001);
  }

  update() {
    const pct = Phaser.Math.Clamp(state.hp / state.maxHp, 0, 1);
    this.barFill.width = 98 * pct;
    this.barFill.fillColor = pct > 0.5 ? 0x2ecc71 : pct > 0.25 ? 0xf1c40f : 0xe74c3c;
    this.hpText.setText(`${state.hp}/${state.maxHp}`);
    this.livesText.setText(`Lives: ${state.lives}`);
    const floor = getFloor(state.currentFloorId);
    this.floorText.setText(floor ? floor.name : '');
  }
}
