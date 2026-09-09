// ---------------------------------------------------------------------------
// Generates simple pixel-style placeholder textures at runtime so the game
// is playable before real art exists. Nothing here is loaded from disk —
// it's all drawn with Phaser.Graphics and baked into textures.
//
// Real character art (see src/config/character.js) always takes priority
// over these placeholders once it's dropped into public/assets/character/.
// ---------------------------------------------------------------------------

/**
 * Draws one humanoid placeholder frame and bakes it into a texture.
 * Returns the texture key.
 */
function drawHumanoidFrame(scene, textureKey, w, h, color, pose) {
  const g = scene.add.graphics();
  const headR = Math.round(w * 0.22);
  const bodyW = Math.round(w * 0.42);
  const bodyH = Math.round(h * 0.42);
  const cx = w / 2;
  const headCY = headR + 2 + (pose.headBob || 0);
  const bodyTop = headCY + headR - 2;

  // legs
  g.fillStyle(color, 1);
  const legW = Math.round(bodyW * 0.32);
  const legH = h - (bodyTop + bodyH);
  const legGap = pose.legSpread || 0;
  g.fillRect(cx - bodyW / 2 + 1, bodyTop + bodyH, legW, legH - (pose.legLift1 || 0));
  g.fillRect(cx + bodyW / 2 - legW - 1 + legGap, bodyTop + bodyH, legW, legH - (pose.legLift2 || 0));

  // body
  g.fillStyle(color, 1);
  g.fillRoundedRect(cx - bodyW / 2, bodyTop, bodyW, bodyH, 3);

  // arms
  const armW = Math.round(bodyW * 0.28);
  const armH = Math.round(bodyH * 0.85);
  g.fillStyle(color, 1);
  const leftArmAngle = pose.leftArm || 0;
  const rightArmAngle = pose.rightArm || 0;
  g.fillRect(cx - bodyW / 2 - armW + 2, bodyTop + 2 + leftArmAngle, armW, armH);
  g.fillRect(cx + bodyW / 2 - 2, bodyTop + 2 + rightArmAngle, armW, armH);

  // punch fist extension
  if (pose.punchExtend) {
    g.fillStyle(0xffffff, 1);
    g.fillRect(cx + bodyW / 2 + armW - 2, bodyTop + 2 + rightArmAngle, pose.punchExtend, 5);
  }

  // head
  g.fillStyle(0xffe0bd, 1);
  g.fillCircle(cx, headCY, headR);
  // simple face dot (facing right)
  g.fillStyle(0x222222, 1);
  g.fillCircle(cx + headR * 0.35, headCY - 1, 1.5);

  g.generateTexture(textureKey, w, h);
  g.destroy();
  return textureKey;
}

const POSES = {
  idle: [
    { headBob: 0, legLift1: 0, legLift2: 0 },
    { headBob: 1, legLift1: 0, legLift2: 0 }
  ],
  run: [
    { legLift1: 4, legLift2: 0, leftArm: 2, rightArm: -2 },
    { legLift1: 0, legLift2: 0, leftArm: 0, rightArm: 0 },
    { legLift1: 0, legLift2: 4, leftArm: -2, rightArm: 2 },
    { legLift1: 0, legLift2: 0, leftArm: 0, rightArm: 0 }
  ],
  jump: [
    { legLift1: 3, legLift2: 3, leftArm: -3, rightArm: -3, headBob: -2 }
  ],
  punch: [
    { rightArm: -1, punchExtend: 3 },
    { rightArm: -1, punchExtend: 9 }
  ]
};

/**
 * Builds placeholder frame textures for one animation and returns the
 * ordered list of texture keys (one per frame) ready to hand to
 * scene.anims.create({ frames: keys.map(key => ({ key })) , ... }).
 */
export function buildPlaceholderAnimFrames(scene, animName, frameCount, frameWidth, frameHeight, color) {
  const poses = POSES[animName] || POSES.idle;
  const keys = [];
  for (let i = 0; i < frameCount; i++) {
    const pose = poses[i % poses.length];
    const key = `ph_${animName}_${i}_${color}`;
    if (!scene.textures.exists(key)) {
      drawHumanoidFrame(scene, key, frameWidth, frameHeight, color, pose);
    }
    keys.push(key);
  }
  return keys;
}

export function generateSpiderTexture(scene, key, color, w = 24, h = 16) {
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  const cx = w / 2;
  const cy = h * 0.55;
  const bodyR = h * 0.32;
  g.lineStyle(2, color, 1);
  // legs
  for (let i = 0; i < 4; i++) {
    const spread = 4 + i * 3;
    g.beginPath();
    g.moveTo(cx - bodyR * 0.6, cy);
    g.lineTo(cx - spread - 4, cy - 3 + i);
    g.strokePath();
    g.beginPath();
    g.moveTo(cx + bodyR * 0.6, cy);
    g.lineTo(cx + spread + 4, cy - 3 + i);
    g.strokePath();
  }
  g.fillStyle(color, 1);
  g.fillEllipse(cx, cy, bodyR * 2, bodyR * 1.6);
  g.fillStyle(0xff0000, 1);
  g.fillCircle(cx - 2, cy - 1, 1);
  g.fillCircle(cx + 2, cy - 1, 1);
  g.generateTexture(key, w, h);
  g.destroy();
  return key;
}

export function generateMobTexture(scene, key, color, w = 26, h = 26) {
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillRoundedRect(1, h * 0.25, w - 2, h * 0.75 - 1, 4);
  g.fillCircle(w / 2, h * 0.28, w * 0.32);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(w / 2 - 4, h * 0.26, 2.2);
  g.fillCircle(w / 2 + 4, h * 0.26, 2.2);
  g.fillStyle(0x111111, 1);
  g.fillCircle(w / 2 - 4, h * 0.26, 1);
  g.fillCircle(w / 2 + 4, h * 0.26, 1);
  g.generateTexture(key, w, h);
  g.destroy();
  return key;
}

export function generateBossTexture(scene, key, color, w = 56, h = 72) {
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillRoundedRect(w * 0.15, h * 0.3, w * 0.7, h * 0.65, 6);
  g.fillCircle(w / 2, h * 0.22, w * 0.24);
  // horns
  g.fillTriangle(w * 0.3, h * 0.12, w * 0.38, h * 0.02, w * 0.42, h * 0.14);
  g.fillTriangle(w * 0.7, h * 0.12, w * 0.62, h * 0.02, w * 0.58, h * 0.14);
  g.fillStyle(0xff2222, 1);
  g.fillCircle(w * 0.42, h * 0.21, 3);
  g.fillCircle(w * 0.58, h * 0.21, 3);
  g.generateTexture(key, w, h);
  g.destroy();
  return key;
}
