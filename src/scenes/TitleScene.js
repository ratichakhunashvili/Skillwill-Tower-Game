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
      fontSize: '53px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.32 + 50, 'Skillwill Tower', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#999999'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.62, 'Press SPACE to start', {
      fontFamily: 'monospace',
      fontSize: '29px',
      color: '#f1c40f'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.78, 'Arrows: Move   Space: Jump   X: Punch   C: Mind Blow', {
      fontFamily: 'monospace',
      fontSize: '19px',
      color: '#777777'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
    this.input.once('pointerdown', () => this.startGame());
  }

  startGame() {
    // Pressing SPACE/clicking here is a real user gesture, so this is the
    // one place the Fullscreen API is actually allowed to succeed without
    // a separate "click to go fullscreen" step. Some contexts (an iframe
    // without allowfullscreen, an unsupported browser) reject it — that's
    // fine, the game just stays windowed at its normal scaled size.
    if (this.scale.fullscreen.available && !this.scale.isFullscreen) {
      try { this.scale.startFullscreen(); } catch (e) { /* fullscreen not available here */ }
    }
    resetGame();
    this.scene.start('Floor', { floorId: 1 });
    this.scene.launch('HUD');
  }
}
