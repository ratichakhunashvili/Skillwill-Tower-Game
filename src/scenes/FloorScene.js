import Phaser from 'phaser';
import { getFloor, nextFloorId } from '../config/floors.js';
import { PLAYER_STATS } from '../config/character.js';
import { state, setCheckpoint } from '../utils/gameState.js';
import { buildLevel } from '../utils/levelBuilder.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';

export default class FloorScene extends Phaser.Scene {
  constructor() {
    super('Floor');
  }

  init(data) {
    this.floorId = data.floorId;
  }

  create() {
    const floor = getFloor(this.floorId);
    setCheckpoint(this.floorId);
    this.transitioning = false;
    this.enemies = [];

    const { worldWidth, groundY, solids } = buildLevel(this, floor);
    this.solids = solids;
    this.groundY = groundY;

    // exit zone at the far right, roughly where the elevator is drawn
    const exitZone = this.add.zone(worldWidth - 60, groundY - 70, 100, 140);
    this.physics.add.existing(exitZone, true);

    this.player = new Player(this, 70, groundY);
    this.physics.add.collider(this.player.sprite, this.solids);

    this.enemyGroup = this.physics.add.group();
    const enemyPositions = this.buildEnemyPositions(floor, worldWidth);
    enemyPositions.forEach(({ x, type }) => {
      const enemy = new Enemy(this, x, groundY, type, floor.accent);
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy.sprite);
    });
    this.physics.add.collider(this.enemyGroup, this.solids);
    this.physics.add.overlap(this.player.sprite, this.enemyGroup, this.onEnemyContact, undefined, this);
    this.physics.add.overlap(this.player.sprite, exitZone, this.onReachExit, undefined, this);

    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);

    if (floor.intro) {
      const t = this.add.text(this.scale.width / 2, 26, floor.intro, {
        fontFamily: 'monospace', fontSize: '19px', color: '#ffffff', align: 'center',
        wordWrap: { width: this.scale.width - 60 }
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(999);
      this.tweens.add({ targets: t, alpha: 0, delay: 2400, duration: 600, onComplete: () => t.destroy() });
    }
  }

  buildEnemyPositions(floor, worldWidth) {
    const positions = [];
    const usableStart = 220;
    const usableEnd = worldWidth - 220;
    const total = floor.enemies.spider + floor.enemies.mob;
    if (total === 0) return positions;
    const step = (usableEnd - usableStart) / total;
    let i = 0;
    for (let s = 0; s < floor.enemies.spider; s++, i++) {
      positions.push({ x: usableStart + step * i + step / 2, type: 'spider' });
    }
    for (let m = 0; m < floor.enemies.mob; m++, i++) {
      positions.push({ x: usableStart + step * i + step / 2, type: 'mob' });
    }
    return positions;
  }

  onEnemyContact(playerSprite, enemySprite) {
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

  onReachExit() {
    if (this.transitioning) return;
    this.transitioning = true;
    const next = nextFloorId(this.floorId);
    if (next == null) return;
    if (next === 13) {
      this.scene.start('Boss', { floorId: 13 });
    } else {
      this.scene.start('Floor', { floorId: next });
    }
  }

  update(time) {
    this.player.update(time);
    this.enemies.forEach(e => { if (!e.dead) e.update(); });

    if (this.player.isPunching && !this.player.hasDealtDamage) {
      const hitbox = this.player.getPunchHitbox();
      this.enemies.forEach(enemy => {
        if (enemy.dead) return;
        const bounds = enemy.sprite.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, bounds)) {
          enemy.takeDamage(PLAYER_STATS.punchDamage);
          this.player.hasDealtDamage = true;
        }
      });
    }

    if (this.player.isMindBlowing && !this.player.hasDealtMindBlowDamage) {
      const circle = this.player.getMindBlowCircle();
      this.enemies.forEach(enemy => {
        if (enemy.dead) return;
        if (Phaser.Geom.Intersects.CircleToRectangle(circle, enemy.sprite.getBounds())) {
          enemy.takeDamage(PLAYER_STATS.mindBlow.damage);
        }
      });
      this.player.hasDealtMindBlowDamage = true;
    }
  }
}
