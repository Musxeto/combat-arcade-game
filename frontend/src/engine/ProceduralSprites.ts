// Procedural pixel-art character generator
// Draws characters directly on canvas using rectangles
// Each archetype has unique body proportions and color palette

import type { Character } from '../config/characters';
import { CHAR_BASE_WIDTH, CHAR_BASE_HEIGHT } from '../config/constants';
import type { AnimationState } from '../config/constants';

interface Limb {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  rotation?: number;
}

interface FrameData {
  body: Limb;
  head: Limb;
  leftArm: Limb;
  rightArm: Limb;
  leftLeg: Limb;
  rightLeg: Limb;
  extras?: Limb[];
}

/**
 * Generate a frame of a procedural pixel-art character
 */
export function generateFrame(
  character: Character,
  state: AnimationState,
  frameIndex: number,
  facing: 'left' | 'right'
): FrameData {
  const p = character.bodyProportions;
  const color = character.color;
  const color2 = character.colorSecondary;

  // Base dimensions
  const bw = Math.floor(CHAR_BASE_WIDTH * p.width);
  const bh = Math.floor(CHAR_BASE_HEIGHT * p.height);
  const headW = Math.floor(20 * p.headSize);
  const headH = Math.floor(20 * p.headSize);
  const armW = 8;
  const armH = Math.floor(30 * p.armLength);
  const legW = 10;
  const legH = Math.floor(35 * p.legLength);
  const bodyW = Math.floor(24 * p.bulk);
  const bodyH = Math.floor(36 * p.height);

  // Center offsets
  const cx = 0;
  const cy = 0;

  // Animations modify limb positions
  let bodyOffsetY = 0;
  let leftArmAngle = 0;
  let rightArmAngle = 0;
  let leftArmExtend = 0;
  let rightArmExtend = 0;
  let leftLegAngle = 0;
  let rightLegAngle = 0;
  let headTilt = 0;
  const extras: Limb[] = [];

  switch (state) {
    case 'idle': {
      // Gentle breathing bob
      bodyOffsetY = Math.sin(frameIndex * Math.PI / 2) * 3;
      leftArmAngle = Math.sin(frameIndex * Math.PI / 2) * 5;
      rightArmAngle = -Math.sin(frameIndex * Math.PI / 2) * 5;
      break;
    }
    case 'attack_1': {
      // Punch - arm extends forward
      const t = frameIndex / 5;
      rightArmExtend = Math.sin(t * Math.PI) * 30;
      rightArmAngle = -20;
      bodyOffsetY = Math.sin(t * Math.PI) * -2;
      break;
    }
    case 'attack_2': {
      // Kick - leg swings forward
      const t = frameIndex / 5;
      rightLegAngle = Math.sin(t * Math.PI) * 45;
      bodyOffsetY = Math.sin(t * Math.PI) * -3;
      leftArmAngle = 15;
      break;
    }
    case 'attack_3': {
      // Heavy - full body lunge
      const t = frameIndex / 7;
      rightArmExtend = Math.sin(t * Math.PI) * 35;
      leftArmExtend = Math.sin(t * Math.PI) * 15;
      rightArmAngle = -30;
      leftArmAngle = 20;
      bodyOffsetY = Math.sin(t * Math.PI) * -5;
      // Impact flash at peak
      if (frameIndex === 4) {
        extras.push({
          x: (facing === 'right' ? 40 : -40), y: -20,
          w: 16, h: 16, color: '#fff'
        });
      }
      break;
    }
    case 'attack_4': {
      // Signature move - dramatic pose
      const t = frameIndex / 7;
      rightArmExtend = Math.sin(t * Math.PI) * 25;
      rightArmAngle = -40 + Math.sin(t * Math.PI) * 20;
      leftArmAngle = 30 - Math.sin(t * Math.PI) * 15;
      bodyOffsetY = Math.sin(t * Math.PI) * -6;
      // Character glow
      if (frameIndex >= 2 && frameIndex <= 5) {
        extras.push({
          x: -bodyW / 2 - 4, y: -bodyH - headH - 8,
          w: bodyW + 8, h: bodyH + headH + 8,
          color: color + '40'
        });
      }
      break;
    }
    case 'dodge': {
      // Sidestep with afterimage
      const t = frameIndex / 4;
      const dodgeDir = facing === 'right' ? -1 : 1;
      bodyOffsetY = Math.sin(t * Math.PI) * -8;
      headTilt = dodgeDir * 15;
      // Afterimage
      if (frameIndex > 0 && frameIndex < 4) {
        extras.push({
          x: dodgeDir * 20 * (frameIndex), y: bodyOffsetY + 5,
          w: bodyW, h: bodyH,
          color: color + '30'
        });
      }
      break;
    }
    case 'hit': {
      // Recoil backward
      const t = frameIndex / 3;
      const recoilDir = facing === 'right' ? -1 : 1;
      bodyOffsetY = Math.sin(t * Math.PI) * 4;
      headTilt = recoilDir * -10;
      leftArmAngle = recoilDir * 20;
      rightArmAngle = recoilDir * 15;
      break;
    }
    case 'victory': {
      // Arms raised, bounce
      const t = frameIndex / 5;
      leftArmAngle = -60 + Math.sin(t * Math.PI * 2) * 15;
      rightArmAngle = 60 - Math.sin(t * Math.PI * 2) * 15;
      bodyOffsetY = Math.abs(Math.sin(t * Math.PI * 2)) * -8;
      break;
    }
    case 'defeat': {
      // Collapse to ground
      const t = Math.min(frameIndex / 4, 1);
      bodyOffsetY = t * 40;
      headTilt = t * 30;
      leftArmAngle = t * 60;
      rightArmAngle = t * -60;
      leftLegAngle = t * 30;
      rightLegAngle = t * -20;
      break;
    }
  }

  // Build frame with facing direction
  const dir = facing === 'right' ? 1 : -1;

  return {
    body: {
      x: cx - bodyW / 2,
      y: cy - bodyH + bodyOffsetY,
      w: bodyW,
      h: bodyH,
      color: color,
    },
    head: {
      x: cx - headW / 2 + headTilt * 0.3,
      y: cy - bodyH - headH + bodyOffsetY + headTilt * 0.1,
      w: headW,
      h: headH,
      color: lightenColor(color, 20),
    },
    leftArm: {
      x: cx - bodyW / 2 - armW + dir * leftArmExtend * 0.3,
      y: cy - bodyH + 4 + bodyOffsetY,
      w: armW,
      h: armH,
      color: color2,
      rotation: leftArmAngle,
    },
    rightArm: {
      x: cx + bodyW / 2 + dir * rightArmExtend,
      y: cy - bodyH + 4 + bodyOffsetY,
      w: armW,
      h: armH,
      color: color2,
      rotation: rightArmAngle,
    },
    leftLeg: {
      x: cx - bodyW / 4 - legW / 2,
      y: cy + bodyOffsetY,
      w: legW,
      h: legH,
      color: darkenColor(color, 30),
      rotation: leftLegAngle,
    },
    rightLeg: {
      x: cx + bodyW / 4 - legW / 2,
      y: cy + bodyOffsetY,
      w: legW,
      h: legH,
      color: darkenColor(color, 30),
      rotation: rightLegAngle,
    },
    extras,
  };
}

/**
 * Draw a complete character frame on canvas
 */
export function drawCharacterFrame(
  ctx: CanvasRenderingContext2D,
  character: Character,
  state: AnimationState,
  frameIndex: number,
  x: number,
  y: number,
  facing: 'left' | 'right',
  scale: number = 2.5,
  flashWhite: boolean = false
): void {
  const frame = generateFrame(character, state, frameIndex, facing);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing === 'left' ? -scale : scale, scale);

  // Draw extras behind (glow effects)
  frame.extras?.forEach(extra => {
    ctx.fillStyle = flashWhite ? '#ffffff' : extra.color;
    ctx.fillRect(extra.x, extra.y, extra.w, extra.h);
  });

  // Draw limbs in order: legs, body, arms, head
  drawLimb(ctx, frame.leftLeg, flashWhite);
  drawLimb(ctx, frame.rightLeg, flashWhite);
  drawLimb(ctx, frame.body, flashWhite);
  drawLimb(ctx, frame.leftArm, flashWhite);
  drawLimb(ctx, frame.rightArm, flashWhite);
  drawLimb(ctx, frame.head, flashWhite);

  // Draw eyes on head
  if (!flashWhite) {
    const headX = frame.head.x;
    const headY = frame.head.y;
    const headW = frame.head.w;
    const headH = frame.head.h;
    ctx.fillStyle = '#ffffff';
    const eyeSize = 3;
    const eyeY = headY + headH * 0.35;

    if (state === 'defeat') {
      // X eyes
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(headX + headW * 0.25, eyeY, eyeSize, eyeSize);
      ctx.fillRect(headX + headW * 0.6, eyeY, eyeSize, eyeSize);
    } else {
      ctx.fillRect(headX + headW * 0.25, eyeY, eyeSize, eyeSize);
      ctx.fillRect(headX + headW * 0.6, eyeY, eyeSize, eyeSize);
    }
  }

  ctx.restore();
}

function drawLimb(ctx: CanvasRenderingContext2D, limb: Limb, flashWhite: boolean): void {
  ctx.save();

  if (limb.rotation) {
    ctx.translate(limb.x + limb.w / 2, limb.y);
    ctx.rotate((limb.rotation * Math.PI) / 180);
    ctx.fillStyle = flashWhite ? '#ffffff' : limb.color;
    ctx.fillRect(-limb.w / 2, 0, limb.w, limb.h);
  } else {
    ctx.fillStyle = flashWhite ? '#ffffff' : limb.color;
    ctx.fillRect(limb.x, limb.y, limb.w, limb.h);
  }

  ctx.restore();
}

/**
 * Draw a character preview (for character select screen)
 */
export function drawCharacterPreview(
  ctx: CanvasRenderingContext2D,
  character: Character,
  x: number,
  y: number,
  scale: number = 1.5
): void {
  drawCharacterFrame(ctx, character, 'idle', 0, x, y, 'right', scale);
}

// Color utility functions
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + percent);
  const b = Math.min(255, (num & 0x0000ff) + percent);
  return `rgb(${r}, ${g}, ${b})`;
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - percent);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - percent);
  const b = Math.max(0, (num & 0x0000ff) - percent);
  return `rgb(${r}, ${g}, ${b})`;
}
