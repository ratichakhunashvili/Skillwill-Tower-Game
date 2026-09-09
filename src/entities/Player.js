import Phaser from 'phaser';
import { CHARACTER_ANIMATIONS, PLAYER_STATS } from '../config/character.js';
import { CONTROLS } from '../config/controls.js';
import { buildPlaceholderAnimFrames } from '../utils/placeholderArt.js';
import { state as gameState, damagePlayer } from '../utils/gameState.js';

const PLACEHOLDER_COLOR = 0x2ecc71; // Will's placeholder color — swap out once real art is in

let animsReady = false;

/**
 * Builds the idle/run/jump/punch animations once (globally — Phaser's
 * animation manager is shared across all scenes). Prefers real spritesheets
 * loaded by PreloadScene (keys "char_idle" etc.); falls back to generated
 * placeholder frames when real art isn't present yet.
 */
function ensureAnimations(scene) {
  if (animsReady) return;
  animsReady = true;

  Object.entries(CHARACTER_ANIMATIONS).forEach(([name, cfg]) => {
    const realKey = `char_${name}`;
    let frames;
    if (scene.textures.exists(realKey)) {
      frames = scene.anims.generateFrameNumbers(realKey, { start: 0, end: cfg.frameCount - 1 });
    } else {
      const keys = buildPlaceholderAnimFrames(scene, name, cfg.frameCount, cfg.frameWidth, cfg.frameHeight, PLACEHOLDER_COLOR);
      frames = keys.map(key => ({ key }));
    }
    scene.anims.create({ key: name, frames, frameRate: cfg.frameRate, repeat: cfg.repeat });
  });
}

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    ensureAnimations(scene);

    const idleAnim = scene.anims.get('idle');
    const initialFrame = idleAnim.frames[0];

    this.sprite = scene.physics.add.sprite(x, y, initialFrame.textureKey, initialFrame.textureFrame);
    this.sprite.setDataEnabled();
    this.sprite.data.set('owner', this);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setSize(
      Math.round(CHARACTER_ANIMATIONS.idle.frameWidth * 0.5),
      Math.round(CHARACTER_ANIMATIONS.idle.frameHeight * 0.85)
    );
    this.sprite.setMaxVelocity(PLAYER_STATS.moveSpeed, 600);
    this.sprite.setDragX(900);

    this.facing = 1;
    this.isPunching = false;
    this.hasDealtDamage = false;
    this.nextPunchAllowed = 0;
    this.invulnerableUntil = 0;

    this.keys = scene.input.keyboard.addKeys({
      left: 'LEFT',
      right: 'RIGHT',
      jump: CONTROLS.jump,
      punch: CONTROLS.punch
    });

    this.sprite.anims.play('idle');
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  get body() { return this.sprite.body; }

  update(time) {
    const onGround = this.body.blocked.down || this.body.touching.down;
    const k = this.keys;

    if (!this.isPunching) {
      if (k.left.isDown) {
        this.sprite.setVelocityX(-PLAYER_STATS.moveSpeed);
        this.facing = -1;
        this.sprite.setFlipX(true);
      } else if (k.right.isDown) {
        this.sprite.setVelocityX(PLAYER_STATS.moveSpeed);
        this.facing = 1;
        this.sprite.setFlipX(false);
      } else {
        this.sprite.setVelocityX(0);
      }

      if (Phaser.Input.Keyboard.JustDown(k.jump) && onGround) {
        this.sprite.setVelocityY(-PLAYER_STATS.jumpVelocity);
      }
    }

    if (Phaser.Input.Keyboard.JustDown(k.punch)) {
      this.punch(time);
    }

    // animation state
    if (this.isPunching) {
      // handled by punch(); keep current anim playing
    } else if (!onGround) {
      this.sprite.anims.play('jump', true);
    } else if (Math.abs(this.body.velocity.x) > 5) {
      this.sprite.anims.play('run', true);
    } else {
      this.sprite.anims.play('idle', true);
    }
  }

  punch(time) {
    if (time < this.nextPunchAllowed) return;
    this.nextPunchAllowed = time + PLAYER_STATS.punchCooldownMs;
    this.isPunching = true;
    this.hasDealtDamage = false;
    this.sprite.setVelocityX(0);
    this.sprite.anims.play('punch', true);
    this.scene.time.delayedCall(220, () => { this.isPunching = false; });
  }

  /** Rectangle in front of the player, only meaningful while isPunching. */
  getPunchHitbox() {
    const w = PLAYER_STATS.punchRange;
    const h = 24;
    const x = this.facing === 1 ? this.sprite.x + this.sprite.body.width / 2 : this.sprite.x - this.sprite.body.width / 2 - w;
    const y = this.sprite.y - h / 2;
    return new Phaser.Geom.Rectangle(x, y, w, h);
  }

  takeDamage(amount, time) {
    if (time < this.invulnerableUntil) return null;
    this.invulnerableUntil = time + PLAYER_STATS.invulnerableAfterHitMs;
    const result = damagePlayer(amount);
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      duration: 90,
      yoyo: true,
      repeat: 3
    });
    return result;
  }

  get hp() { return gameState.hp; }
  get maxHp() { return gameState.maxHp; }
  get lives() { return gameState.lives; }

  destroy() {
    this.sprite.destroy();
  }
}
