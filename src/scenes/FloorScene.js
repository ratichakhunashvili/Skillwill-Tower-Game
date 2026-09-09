import Phaser from 'phaser';
import { getFloor, nextFloorId, WORLD } from '../config/floors.js';
import { PLAYER_STATS } from '../config/character.js';
import { state, setCheckpoint } from '../utils/gameState.js';
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

    const groundTop = WORLD.height - WORLD.groundHeight;

    this.cameras.main.setBackgroundColor(floor.bg);
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);

    // subtle vertical accent stripes for theme flavor
    for (let x = 60; x < WORLD.width; x += 220) {
      this.add.rectangle(x, 0, 6, WORLD.height, floor.accent, 0.12).setOrigin(0, 0);
    }

    this.solids = this.physics.add.staticGroup();
    const ground = this.add.rectangle(0, groundTop, WORLD.width, WORLD.groundHeight, floor.ground).setOrigin(0, 0);
    this.physics.add.existing(ground, true);
    this.solids.add(ground);

    if (floor.hasCombat) {
      const plat1 = this.add.rectangle(480, groundTop - 70, 100, 12, floor.ground).setOrigin(0, 0);
      const plat2 = this.add.rectangle(980, groundTop - 100, 100, 12, floor.ground).setOrigin(0, 0);
      [plat1, plat2].forEach(p => { this.physics.add.existing(p, true); this.solids.add(p); });
    }

    // exit door marker
    const door = this.add.rectangle(WORLD.width - 34, groundTop - 60, 24, 60, floor.accent).setOrigin(0, 0);
    const exitZone = this.add.zone(WORLD.width - 22, groundTop - 30, 24, 60);
    this.physics.add.existing(exitZone, true);

    this.player = new Player(this, 40, groundTop - 40);
    this.physics.add.collider(this.player.sprite, this.solids);

    this.enemyGroup = this.physics.add.group();
    const enemyPositions = this.buildEnemyPositions(floor, groundTop);
    enemyPositions.forEach(({ x, type }) => {
      const enemy = new Enemy(this, x, groundTop, type, floor.accent);
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy.sprite);
    });
    this.physics.add.collider(this.enemyGroup, this.solids);
    this.physics.add.overlap(this.player.sprite, this.enemyGroup, this.onEnemyContact, undefined, this);
    this.physics.add.overlap(this.player.sprite, exitZone, this.onReachExit, undefined, this);

    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);

    if (floor.intro) {
      const t = this.add.text(this.scale.width / 2, 34, floor.intro, {
        fontFamily: 'monospace', fontSize: '8px', color: '#ffffff', align: 'center',
        wordWrap: { width: this.scale.width - 20 }
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(999);
      this.tweens.add({ targets: t, alpha: 0, delay: 2400, duration: 600, onComplete: () => t.destroy() });
    }
  }

  buildEnemyPositions(floor, groundTop) {
    const positions = [];
    const usableStart = 220;
    const usableEnd = WORLD.width - 220;
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
  }
}
