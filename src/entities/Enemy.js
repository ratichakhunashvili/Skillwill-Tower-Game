import { generateSpiderTexture, generateMobTexture } from '../utils/placeholderArt.js';

const SPIDER_COLOR = 0x1a1a1a;

const STATS = {
  spider: { hp: 30, damage: 8, speed: 80, w: 24, h: 16 },
  mob: { hp: 55, damage: 14, speed: 55, w: 26, h: 26 }
};

export default class Enemy {
  constructor(scene, x, groundY, type, themeColor) {
    this.scene = scene;
    this.type = type;
    const stats = STATS[type] || STATS.spider;
    this.maxHp = stats.hp;
    this.hp = stats.hp;
    this.damage = stats.damage;
    this.speed = stats.speed;
    this.dead = false;

    const realKey = `enemy_${type}`;
    let textureKey;
    if (scene.textures.exists(realKey)) {
      textureKey = realKey;
    } else if (type === 'spider') {
      textureKey = generateSpiderTexture(scene, `ph_spider_${SPIDER_COLOR}`, SPIDER_COLOR, stats.w, stats.h);
    } else {
      textureKey = generateMobTexture(scene, `ph_mob_${themeColor}`, themeColor, stats.w, stats.h);
    }

    this.sprite = scene.physics.add.sprite(x, groundY - stats.h / 2, textureKey);
    this.sprite.setDataEnabled();
    this.sprite.data.set('owner', this);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0);
    this.sprite.setVelocityX(this.speed);
    this.direction = 1;

    // patrol bounds around spawn point
    this.minX = x - 90;
    this.maxX = x + 90;
  }

  update() {
    if (this.dead) return;
    if (this.sprite.x <= this.minX) this.direction = 1;
    else if (this.sprite.x >= this.maxX) this.direction = -1;
    this.sprite.setVelocityX(this.speed * this.direction);
    this.sprite.setFlipX(this.direction < 0);
  }

  takeDamage(amount) {
    if (this.dead) return;
    this.hp -= amount;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.2,
      duration: 60,
      yoyo: true
    });
    if (this.hp <= 0) this.die();
  }

  die() {
    this.dead = true;
    this.sprite.body.enable = false;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 0.4,
      duration: 200,
      onComplete: () => this.sprite.destroy()
    });
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
}
