import Phaser from 'phaser';
import { CHARACTER_ANIMATIONS, CHARACTER_SCALE, CHARACTER_BODY, PLAYER_STATS } from '../config/character.js';
import { CONTROLS } from '../config/controls.js';
import { buildPlaceholderAnimFrames } from '../utils/placeholderArt.js';
import { state as gameState, damagePlayer } from '../utils/gameState.js';

const PLACEHOLDER_COLOR = 0x2ecc71; // used only if Rati's real art isn't found

let animsReady = false;

/**
 * Builds the idle/run/jump/punch/mind_blow animations once (globally —
 * Phaser's animation manager is shared across all scenes). Rati's real art
 * (see public/assets/character/) ships as one PNG per frame keyed
 * `char_<name>_<n>`, loaded by PreloadScene; falls back to generated
 * placeholder frames when real art isn't present for a given animation.
 */
function ensureAnimations(scene) {
  if (animsReady) return;
  animsReady = true;

  Object.entries(CHARACTER_ANIMATIONS).forEach(([name, cfg]) => {
    let frames;
    if (scene.textures.exists(`char_${name}_1`)) {
      frames = [];
      for (let i = 1; i <= cfg.frameCount; i++) {
        frames.push({ key: `char_${name}_${i}` });
      }
    } else {
      const keys = buildPlaceholderAnimFrames(scene, name, cfg.frameCount, CHARACTER_BODY.width, CHARACTER_BODY.height, PLACEHOLDER_COLOR);
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
    // Origin (0.5, 1) = bottom-center: `y` is Rati's feet/ground-contact
    // point, matching every source frame's shared 256px-tall canvas bottom
    // edge (see CHARACTER_BODY comment in config/character.js).
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(CHARACTER_SCALE);
    this.sprite.setDataEnabled();
    this.sprite.data.set('owner', this);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setSize(CHARACTER_BODY.width, CHARACTER_BODY.height);
    this.sprite.setOffset(CHARACTER_BODY.offsetX, CHARACTER_BODY.offsetY);
    this.sprite.setMaxVelocity(PLAYER_STATS.moveSpeed, 600);
    this.sprite.setDragX(900);

    this.facing = 1;
    this.isPunching = false;
    this.hasDealtDamage = false;
    this.nextPunchAllowed = 0;
    this.invulnerableUntil = 0;

    this.isMindBlowing = false;
    this.hasDealtMindBlowDamage = false;
    this.nextMindBlowAllowed = 0;

    this.keys = scene.input.keyboard.addKeys({
      left: 'LEFT',
      right: 'RIGHT',
      jump: CONTROLS.jump,
      punch: CONTROLS.punch,
      special: CONTROLS.special
    });

    this.sprite.anims.play('idle');
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  get body() { return this.sprite.body; }

  update(time) {
    const onGround = this.body.blocked.down || this.body.touching.down;
    const k = this.keys;
    const busy = this.isPunching || this.isMindBlowing;

    if (!busy) {
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

    if (Phaser.Input.Keyboard.JustDown(k.special)) {
      this.useMindBlow(time);
    }

    // animation state
    if (busy) {
      // handled by punch()/useMindBlow(); keep current anim playing
    } else if (!onGround) {
      this.sprite.anims.play('jump', true);
    } else if (Math.abs(this.body.velocity.x) > 5) {
      this.sprite.anims.play('run', true);
    } else {
      this.sprite.anims.play('idle', true);
    }
  }

  punch(time) {
    if (this.isMindBlowing || time < this.nextPunchAllowed) return;
    this.nextPunchAllowed = time + PLAYER_STATS.punchCooldownMs;
    this.isPunching = true;
    this.hasDealtDamage = false;
    this.sprite.setVelocityX(0);
    this.sprite.anims.play('punch', true);
    this.scene.time.delayedCall(220, () => { this.isPunching = false; });
  }

  /**
   * Mind Blow (special ability, key CONTROLS.special): Rati levitates in
   * place, briefly invulnerable, then deals AoE damage to everything within
   * PLAYER_STATS.mindBlow.radius of him. The scene (FloorScene/BossScene)
   * is responsible for applying that damage each frame it sees
   * `isMindBlowing && !hasDealtMindBlowDamage`, the same pattern already
   * used for punch's hitbox.
   */
  useMindBlow(time) {
    if (this.isPunching || this.isMindBlowing || time < this.nextMindBlowAllowed) return;
    const cfg = PLAYER_STATS.mindBlow;
    this.nextMindBlowAllowed = time + cfg.cooldownMs;
    this.isMindBlowing = true;
    this.hasDealtMindBlowDamage = false;
    this.invulnerableUntil = time + cfg.durationMs + 200;

    this.sprite.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.body.moves = false;
    this.sprite.anims.play('mind_blow', true);

    const startY = this.sprite.y;
    this.scene.tweens.add({
      targets: this.sprite,
      y: startY - cfg.liftHeight,
      duration: cfg.durationMs * 0.35,
      yoyo: true,
      hold: cfg.durationMs * 0.3,
      ease: 'Sine.easeInOut'
    });

    this.scene.time.delayedCall(cfg.durationMs, () => {
      this.isMindBlowing = false;
      this.sprite.y = startY;
      this.body.moves = true;
      this.body.setAllowGravity(true);
    });
  }

  /** Rectangle in front of the player, only meaningful while isPunching. */
  getPunchHitbox() {
    const w = PLAYER_STATS.punchRange;
    const h = 36;
    const centerY = this.body.center.y;
    const x = this.facing === 1 ? this.body.right : this.body.left - w;
    return new Phaser.Geom.Rectangle(x, centerY - h / 2, w, h);
  }

  /** Circle around the player, only meaningful while isMindBlowing. */
  getMindBlowCircle() {
    return new Phaser.Geom.Circle(this.sprite.x, this.body.center.y, PLAYER_STATS.mindBlow.radius);
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
