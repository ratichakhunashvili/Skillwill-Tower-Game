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

    this.add.text(width / 2, height * 0.85, 'F: Toggle Fullscreen', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#555555'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
    this.input.once('pointerdown', () => this.startGame());

    // Fullscreen is opt-in only — the game starts windowed by default, and
    // the player decides for themselves whether to go fullscreen.
    this.input.keyboard.on('keydown-F', () => {
      if (!this.scale.fullscreen.available) return;
      try { this.scale.toggleFullscreen(); } catch (e) { /* fullscreen not available here */ }
    });
  }

  startGame() {
    resetGame();
    this.scene.start('Floor', { floorId: 1 });
    this.scene.launch('HUD');
  }
}
