import Phaser from 'phaser';
import { getFloor } from '../config/floors.js';
import { PLAYER_STATS } from '../config/character.js';
import { state, setCheckpoint } from '../utils/gameState.js';
import { buildLevel } from '../utils/levelBuilder.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Boss from '../entities/Boss.js';

export default class BossScene extends Phaser.Scene {
  constructor() {
    super('Boss');
  }

  create() {
    const floor = getFloor(13);
    setCheckpoint(13);
    this.adds = [];
    this.transitioning = false;

    const { worldWidth, groundY, solids } = buildLevel(this, floor);
    this.solids = solids;
    this.groundY = groundY;

    this.player = new Player(this, 80, groundY);
    this.physics.add.collider(this.player.sprite, this.solids);

    this.boss = new Boss(this, worldWidth - 160, groundY, { onSpawnAdd: () => this.spawnAdd(groundY, floor.accent) });
    this.physics.add.collider(this.boss.sprite, this.solids);
    this.physics.add.overlap(this.player.sprite, this.boss.sprite, this.onBossContact, undefined, this);

    this.addGroup = this.physics.add.group();
    this.physics.add.collider(this.addGroup, this.solids);
    this.physics.add.overlap(this.player.sprite, this.addGroup, this.onAddContact, undefined, this);

    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);

    // boss health bar (screen space)
    this.add.text(this.scale.width / 2, 10, 'KOSTA', { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);
    this.bossBarBg = this.add.rectangle(this.scale.width / 2, 30, 380, 14, 0x000000).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);
    this.bossBarFill = this.add.rectangle(this.scale.width / 2 - 188, 32, 376, 10, 0x8e44ad).setOrigin(0, 0).setScrollFactor(0).setDepth(1001);

    const intro = floor.intro;
    if (intro) {
      const t = this.add.text(this.scale.width / 2, 54, intro, {
        fontFamily: 'monospace', fontSize: '14px', color: '#ffffff', align: 'center',
        wordWrap: { width: this.scale.width - 40 }
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(999);
      this.tweens.add({ targets: t, alpha: 0, delay: 2400, duration: 600, onComplete: () => t.destroy() });
    }
  }

  spawnAdd(groundY, accent) {
    if (this.boss.dead) return;
    const worldWidth = this.physics.world.bounds.width;
    const x = Phaser.Math.Clamp(this.boss.x + Phaser.Math.Between(-80, 80), 60, worldWidth - 60);
    const enemy = new Enemy(this, x, groundY, 'spider', accent);
    this.adds.push(enemy);
    this.addGroup.add(enemy.sprite);
  }

  onBossContact() {
    if (this.boss.dead) return;
    const result = this.player.takeDamage(this.boss.contactDamage, this.time.now);
    if (result) this.handlePlayerHitResult(result);
  }

  onAddContact(playerSprite, enemySprite) {
    const enemy = enemySprite.data.get('owner');
    if (!enemy || enemy.dead) return;
    const result = this.player.takeDamage(enemy.damage, this.time.now);
    if (result) this.handlePlayerHitResult(result);
  }

  handlePlayerHitResult(result) {
    if (result.gameOver) {
      this.scene.stop('HUD');
      this.scene.start('GameOver');
    } else if (result.dead) {
      this.scene.restart({ floorId: state.checkpointFloorId });
    }
  }

  update(time) {
    this.player.update(time);
    if (!this.boss.dead) this.boss.update(time, this.player.x);
    this.adds.forEach(e => { if (!e.dead) e.update(); });

    this.bossBarFill.width = 376 * Phaser.Math.Clamp(this.boss.hp / this.boss.maxHp, 0, 1);

    if (this.player.isPunching && !this.player.hasDealtDamage) {
      const hitbox = this.player.getPunchHitbox();

      if (!this.boss.dead && Phaser.Geom.Intersects.RectangleToRectangle(hitbox, this.boss.sprite.getBounds())) {
        this.boss.takeDamage(PLAYER_STATS.punchDamage);
        this.player.hasDealtDamage = true;
      }

      this.adds.forEach(enemy => {
        if (enemy.dead || this.player.hasDealtDamage) return;
        if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, enemy.sprite.getBounds())) {
          enemy.takeDamage(PLAYER_STATS.punchDamage);
          this.player.hasDealtDamage = true;
        }
      });
    }

    if (this.player.isMindBlowing && !this.player.hasDealtMindBlowDamage) {
      const circle = this.player.getMindBlowCircle();
      if (!this.boss.dead && Phaser.Geom.Intersects.CircleToRectangle(circle, this.boss.sprite.getBounds())) {
        this.boss.takeDamage(PLAYER_STATS.mindBlow.damage);
      }
      this.adds.forEach(enemy => {
        if (enemy.dead) return;
        if (Phaser.Geom.Intersects.CircleToRectangle(circle, enemy.sprite.getBounds())) {
          enemy.takeDamage(PLAYER_STATS.mindBlow.damage);
        }
      });
      this.player.hasDealtMindBlowDamage = true;
    }

    if (this.boss.dead && !this.transitioning) {
      this.transitioning = true;
      this.time.delayedCall(700, () => this.scene.start('Victory'));
    }
  }
}
