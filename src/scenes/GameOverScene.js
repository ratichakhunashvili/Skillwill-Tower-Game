import Phaser from 'phaser';
import { resetGame } from '../utils/gameState.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create() {
    this.scene.stop('HUD');
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#1a0000');
    this.add.text(width / 2, height * 0.4, 'GAME OVER', {
      fontFamily: 'monospace', fontSize: '48px', color: '#e74c3c'
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.6, 'Press SPACE to try again', {
      fontFamily: 'monospace', fontSize: '24px', color: '#ffffff'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      resetGame();
      this.scene.start('Title');
    });
  }
}
