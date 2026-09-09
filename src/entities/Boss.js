import { generateBossTexture } from '../utils/placeholderArt.js';

const KOSTA_COLOR = 0x2c003e;

const PHASES = {
  1: { speed: 95, dashCooldown: 2000, dashSpeed: 340, damage: 18 },
  2: { speed: 135, dashCooldown: 1400, dashSpeed: 440, damage: 22 } // hp <= 50%
};

export default class Boss {
  constructor(scene, x, groundY, { onSpawnAdd } = {}) {
    this.scene = scene;
    this.maxHp = 400;
    this.hp = this.maxHp;
    this.dead = false;
    this.onSpawnAdd = onSpawnAdd;
    this.name = 'Kosta';

    const realKey = 'boss_kosta';
    const w = 56;
    const h = 72;
    const textureKey = scene.textures.exists(realKey)
      ? realKey
      : generateBossTexture(scene, `ph_boss_${KOSTA_COLOR}`, KOSTA_COLOR, w, h);

    this.sprite = scene.physics.add.sprite(x, groundY - h / 2, textureKey);
    this.sprite.setDataEnabled();
    this.sprite.data.set('owner', this);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setImmovable(true);
    this.sprite.body.setAllowGravity(true);

    this.state = 'idle'; // idle | dashing | cooldown
    this.nextDashAt = scene.time.now + 1500;
    this.nextAddAt = scene.time.now + 6000;
  }

  get phase() {
    return this.hp <= this.maxHp * 0.5 ? PHASES[2] : PHASES[1];
  }

  update(time, playerX) {
    if (this.dead) return;
    const p = this.phase;
    const dir = playerX < this.sprite.x ? -1 : 1;
    this.sprite.setFlipX(dir < 0);

    if (this.state === 'dashing') {
      this.sprite.setVelocityX(p.dashSpeed * this.dashDir);
      if (time > this.dashEndAt) {
        this.state = 'cooldown';
        this.sprite.setVelocityX(0);
      }
      return;
    }

    // idle drift toward player at base speed
    const dist = Math.abs(playerX - this.sprite.x);
    if (dist > 40) {
      this.sprite.setVelocityX(p.speed * dir);
    } else {
      this.sprite.setVelocityX(0);
    }

    if (time > this.nextDashAt) {
      this.state = 'dashing';
      this.dashDir = dir;
      this.dashEndAt = time + 350;
      this.nextDashAt = time + p.dashCooldown;
      this.scene.tweens.add({ targets: this.sprite, alpha: 0.5, duration: 100, yoyo: true });
    }

    if (time > this.nextAddAt && this.onSpawnAdd) {
      this.onSpawnAdd();
      this.nextAddAt = time + 7000;
    }
  }

  get contactDamage() {
    return this.phase.damage;
  }

  takeDamage(amount) {
    if (this.dead) return;
    this.hp = Math.max(0, this.hp - amount);
    this.scene.tweens.add({ targets: this.sprite, alpha: 0.3, duration: 70, yoyo: true });
    if (this.hp <= 0) this.die();
  }

  die() {
    this.dead = true;
    this.sprite.body.enable = false;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      angle: 90,
      duration: 600,
      onComplete: () => this.sprite.destroy()
    });
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
}
