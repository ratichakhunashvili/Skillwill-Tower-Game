import Phaser from 'phaser';
import { resetGame } from '../utils/gameState.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#111111');

    this.add.text(width / 2, height * 0.32, 'SKILLFULL WILL', {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.32 + 38, 'Skillwill Tower', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#999999'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.62, 'Press SPACE to start', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#f1c40f'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.78, 'Arrows: Move   Space: Jump   X: Punch   C: Mind Blow', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#777777'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
    this.input.once('pointerdown', () => this.startGame());
  }

  startGame() {
    resetGame();
    this.scene.start('Floor', { floorId: 1 });
    this.scene.launch('HUD');
  }
}
