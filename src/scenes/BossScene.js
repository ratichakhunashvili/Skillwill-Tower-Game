import Phaser from 'phaser';
import { getFloor, WORLD } from '../config/floors.js';
import { PLAYER_STATS } from '../config/character.js';
import { state, setCheckpoint } from '../utils/gameState.js';
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

    const groundTop = WORLD.height - WORLD.groundHeight;

    this.cameras.main.setBackgroundColor(floor.bg);
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);

    this.solids = this.physics.add.staticGroup();
    const ground = this.add.rectangle(0, groundTop, WORLD.width, WORLD.groundHeight, floor.ground).setOrigin(0, 0);
    this.physics.add.existing(ground, true);
    this.solids.add(ground);

    // balcony railing decoration
    this.add.rectangle(0, groundTop - 4, WORLD.width, 4, 0xffffff, 0.4).setOrigin(0, 0);

    this.player = new Player(this, 50, groundTop - 40);
    this.physics.add.collider(this.player.sprite, this.solids);

    this.boss = new Boss(this, WORLD.width - 120, groundTop, { onSpawnAdd: () => this.spawnAdd(groundTop, floor.accent) });
    this.physics.add.collider(this.boss.sprite, this.solids);
    this.physics.add.overlap(this.player.sprite, this.boss.sprite, this.onBossContact, undefined, this);

    this.addGroup = this.physics.add.group();
    this.physics.add.collider(this.addGroup, this.solids);
    this.physics.add.overlap(this.player.sprite, this.addGroup, this.onAddContact, undefined, this);

    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);

    // boss health bar (screen space)
    this.add.text(this.scale.width / 2, 6, 'KOSTA', { fontFamily: 'monospace', fontSize: '9px', color: '#ffffff' })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);
    this.bossBarBg = this.add.rectangle(this.scale.width / 2, 18, 220, 8, 0x000000).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);
    this.bossBarFill = this.add.rectangle(this.scale.width / 2 - 108, 19, 216, 6, 0x8e44ad).setOrigin(0, 0).setScrollFactor(0).setDepth(1001);

    const intro = getFloor(13).intro;
    if (intro) {
      const t = this.add.text(this.scale.width / 2, 34, intro, {
        fontFamily: 'monospace', fontSize: '8px', color: '#ffffff', align: 'center',
        wordWrap: { width: this.scale.width - 20 }
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(999);
      this.tweens.add({ targets: t, alpha: 0, delay: 2400, duration: 600, onComplete: () => t.destroy() });
    }
  }

  spawnAdd(groundTop, accent) {
    if (this.boss.dead) return;
    const x = Phaser.Math.Clamp(this.boss.x + Phaser.Math.Between(-80, 80), 60, WORLD.width - 60);
    const enemy = new Enemy(this, x, groundTop, 'spider', accent);
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

    this.bossBarFill.width = 216 * Phaser.Math.Clamp(this.boss.hp / this.boss.maxHp, 0, 1);

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

    if (this.boss.dead && !this.transitioning) {
      this.transitioning = true;
      this.time.delayedCall(700, () => this.scene.start('Victory'));
    }
  }
}
