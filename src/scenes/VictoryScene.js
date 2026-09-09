import Phaser from 'phaser';
import { resetGame } from '../utils/gameState.js';

export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super('Victory');
  }

  create() {
    this.scene.stop('HUD');
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#87ceeb');
    this.add.text(width / 2, height * 0.38, 'KOSTA DEFEATED', {
      fontFamily: 'monospace', fontSize: '32px', color: '#ffffff'
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.5, 'You cleared Skillwill Tower.', {
      fontFamily: 'monospace', fontSize: '18px', color: '#222222'
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.68, 'Press SPACE to play again', {
      fontFamily: 'monospace', fontSize: '16px', color: '#333333'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      resetGame();
      this.scene.start('Title');
    });
  }
}
