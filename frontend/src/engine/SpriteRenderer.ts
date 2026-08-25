// Canvas rendering pipeline for sprites + arena backgrounds
import type { Arena } from '../config/arenas';
import type { Character } from '../config/characters';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../config/constants';
import type { AnimationState } from '../config/constants';
import { drawCharacterFrame } from './ProceduralSprites';
import { ParticleSystem } from './ParticleSystem';

/**
 * Draw the arena background procedurally on canvas
 */
export function drawArenaBackground(ctx: CanvasRenderingContext2D, arena: Arena, time: number): void {
  const w = CANVAS_WIDTH;
  const h = CANVAS_HEIGHT;

  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, arena.bgGradient[0]);
  grad.addColorStop(0.5, arena.bgGradient[1]);
  grad.addColorStop(1, arena.bgGradient[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Arena-specific elements
  switch (arena.id) {
    case 1: drawNeonAlley(ctx, time); break;
    case 2: drawVolcanoRim(ctx, time); break;
    case 3: drawFrozenDojo(ctx, time); break;
    case 4: drawRooftopSunset(ctx, time); break;
    case 5: drawDarkForest(ctx, time); break;
    case 6: drawColosseum(ctx, time); break;
    case 7: drawSkyPlatform(ctx, time); break;
    case 8: drawUndergroundLab(ctx, time); break;
    case 9: drawDesertRuins(ctx, time); break;
    case 10: drawTempleGardens(ctx, time); break;
    case 11: drawTheVoid(ctx, time); break;
  }

  // Ground plane
  ctx.fillStyle = arena.groundColor;
  ctx.fillRect(0, GROUND_Y + 60, w, h - GROUND_Y - 60);

  // Ground line
  ctx.strokeStyle = arena.ambientColor + '60';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 60);
  ctx.lineTo(w, GROUND_Y + 60);
  ctx.stroke();

  // Ambient particles
  drawAmbientParticles(ctx, arena, time);
}

/**
 * Draw ambient particles per arena type
 */
function drawAmbientParticles(ctx: CanvasRenderingContext2D, arena: Arena, time: number): void {
  const p = arena.particle;
  ctx.fillStyle = p.color;

  for (let i = 0; i < p.count; i++) {
    const seed = i * 137.508; // golden angle
    let x, y;

    switch (p.type) {
      case 'rain':
        x = ((seed * 7.3 + time * p.speed * 30) % CANVAS_WIDTH);
        y = ((seed * 3.7 + time * p.speed * 200) % CANVAS_HEIGHT);
        ctx.fillRect(x, y, 1, 6);
        break;
      case 'embers':
        x = ((seed * 7.3 + Math.sin(time + seed) * 40) % CANVAS_WIDTH);
        y = ((seed * 3.7 - time * p.speed * 20) % CANVAS_HEIGHT + CANVAS_HEIGHT) % CANVAS_HEIGHT;
        ctx.fillRect(x, y, 2 + Math.sin(time * 2 + seed) * 1, 2);
        break;
      case 'snow':
        x = ((seed * 7.3 + Math.sin(time * 0.5 + seed) * 30 + time * 10) % CANVAS_WIDTH);
        y = ((seed * 3.7 + time * p.speed * 30) % CANVAS_HEIGHT);
        ctx.fillRect(x, y, 2, 2);
        break;
      case 'petals':
        x = ((seed * 7.3 + Math.sin(time + seed * 0.5) * 50) % CANVAS_WIDTH);
        y = ((seed * 3.7 + time * p.speed * 25) % CANVAS_HEIGHT);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.sin(time + seed) * 0.5);
        ctx.fillRect(-2, -1, 4, 2);
        ctx.restore();
        break;
      case 'fog':
        x = ((seed * 7.3 + time * p.speed * 10) % (CANVAS_WIDTH + 200)) - 100;
        y = GROUND_Y - 20 + Math.sin(seed) * 80;
        ctx.globalAlpha = 0.06 + Math.sin(time * 0.3 + seed) * 0.03;
        ctx.fillStyle = p.color;
        ctx.fillRect(x, y, 80 + Math.sin(seed) * 40, 20);
        ctx.globalAlpha = 1;
        break;
      case 'dust':
        x = ((seed * 7.3 + time * p.speed * 15) % CANVAS_WIDTH);
        y = GROUND_Y + 40 + Math.sin(time + seed) * 20;
        ctx.fillRect(x, y, 2, 2);
        break;
      case 'sparks':
        if (Math.random() > 0.92) {
          x = Math.random() * CANVAS_WIDTH;
          y = Math.random() * CANVAS_HEIGHT * 0.7;
          ctx.fillRect(x, y, 2, 2);
        }
        break;
      case 'clouds':
        x = ((seed * 7.3 + time * p.speed * 8) % (CANVAS_WIDTH + 300)) - 150;
        y = GROUND_Y + 80 + Math.sin(seed) * 40;
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = p.color;
        ctx.fillRect(x, y, 100 + Math.sin(seed) * 60, 15);
        ctx.globalAlpha = 1;
        break;
      case 'sand':
        x = ((seed * 7.3 + time * p.speed * 40) % CANVAS_WIDTH);
        y = GROUND_Y + 20 + Math.sin(seed * 2) * 30;
        ctx.fillRect(x, y, 1, 1);
        break;
      case 'grid':
        // Handled in drawTheVoid
        break;
    }
  }
}

// ---- Arena-specific background drawing functions ----

function drawNeonAlley(ctx: CanvasRenderingContext2D, time: number): void {
  // Buildings
  const buildings = [
    { x: 20, w: 80, h: 280 },
    { x: 120, w: 60, h: 240 },
    { x: 200, w: 90, h: 300 },
    { x: 650, w: 70, h: 260 },
    { x: 740, w: 100, h: 310 },
    { x: 860, w: 80, h: 250 },
  ];

  for (const b of buildings) {
    ctx.fillStyle = '#0d0221';
    ctx.fillRect(b.x, GROUND_Y + 60 - b.h, b.w, b.h);
    // Windows
    for (let wy = GROUND_Y + 60 - b.h + 20; wy < GROUND_Y + 40; wy += 25) {
      for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 18) {
        ctx.fillStyle = Math.random() > 0.3 ?
          `hsl(${280 + Math.sin(time + wx) * 60}, 100%, ${50 + Math.sin(time * 2 + wy) * 20}%)` :
          '#1a0a3e';
        ctx.fillRect(wx, wy, 8, 12);
      }
    }
  }

  // Neon signs
  ctx.fillStyle = `rgba(255, 0, 229, ${0.3 + Math.sin(time * 3) * 0.15})`;
  ctx.fillRect(130, GROUND_Y - 180, 40, 8);
  ctx.fillStyle = `rgba(0, 245, 255, ${0.3 + Math.cos(time * 2.5) * 0.15})`;
  ctx.fillRect(700, GROUND_Y - 200, 50, 8);

  // Puddle reflections
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#ff00e5';
  ctx.fillRect(300, GROUND_Y + 70, 120, 4);
  ctx.fillStyle = '#00f5ff';
  ctx.fillRect(550, GROUND_Y + 75, 80, 3);
  ctx.globalAlpha = 1;
}

function drawVolcanoRim(ctx: CanvasRenderingContext2D, time: number): void {
  // Distant mountains
  ctx.fillStyle = '#330000';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 20);
  ctx.lineTo(150, GROUND_Y - 120);
  ctx.lineTo(300, GROUND_Y + 10);
  ctx.lineTo(500, GROUND_Y - 80);
  ctx.lineTo(700, GROUND_Y + 20);
  ctx.lineTo(800, GROUND_Y - 60);
  ctx.lineTo(960, GROUND_Y + 20);
  ctx.lineTo(960, GROUND_Y + 60);
  ctx.lineTo(0, GROUND_Y + 60);
  ctx.fill();

  // Lava glow
  ctx.fillStyle = `rgba(255, 80, 0, ${0.15 + Math.sin(time * 1.5) * 0.08})`;
  ctx.fillRect(0, GROUND_Y + 30, CANVAS_WIDTH, 40);

  // Lava cracks
  ctx.strokeStyle = `rgba(255, 120, 0, ${0.4 + Math.sin(time * 2) * 0.2})`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(100 + i * 180, GROUND_Y + 65);
    ctx.lineTo(120 + i * 180 + Math.sin(time + i) * 10, GROUND_Y + 80);
    ctx.lineTo(140 + i * 180, GROUND_Y + 90);
    ctx.stroke();
  }
}

function drawFrozenDojo(ctx: CanvasRenderingContext2D, time: number): void {
  // Ice pillars
  const pillars = [60, 180, 780, 880];
  for (const px of pillars) {
    ctx.fillStyle = `rgba(160, 216, 234, ${0.3 + Math.sin(time + px) * 0.1})`;
    ctx.fillRect(px, GROUND_Y - 200, 20, 260);
    ctx.fillRect(px - 5, GROUND_Y - 200, 30, 8);
  }

  // Dojo roof silhouette
  ctx.fillStyle = '#0d1a2e';
  ctx.beginPath();
  ctx.moveTo(300, GROUND_Y - 120);
  ctx.lineTo(480, GROUND_Y - 180);
  ctx.lineTo(660, GROUND_Y - 120);
  ctx.lineTo(660, GROUND_Y - 100);
  ctx.lineTo(300, GROUND_Y - 100);
  ctx.fill();

  // Frozen floor shimmer
  ctx.fillStyle = `rgba(160, 216, 234, ${0.08 + Math.sin(time * 0.8) * 0.04})`;
  ctx.fillRect(0, GROUND_Y + 55, CANVAS_WIDTH, 10);
}

function drawRooftopSunset(ctx: CanvasRenderingContext2D, time: number): void {
  // Sun
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(480, GROUND_Y - 100, 50 + Math.sin(time * 0.5) * 3, 0, Math.PI * 2);
  ctx.fill();

  // City silhouette
  ctx.fillStyle = '#1a1a1a';
  const heights = [120, 180, 140, 200, 160, 220, 130, 190, 150, 170, 210, 140, 180];
  for (let i = 0; i < heights.length; i++) {
    ctx.fillRect(i * 75, GROUND_Y + 60 - heights[i], 70, heights[i]);
  }

  // Orange haze
  ctx.fillStyle = `rgba(255, 140, 66, ${0.1 + Math.sin(time * 0.3) * 0.05})`;
  ctx.fillRect(0, GROUND_Y - 40, CANVAS_WIDTH, 100);
}

function drawDarkForest(ctx: CanvasRenderingContext2D, time: number): void {
  // Trees
  const trees = [40, 120, 200, 700, 800, 900];
  for (const tx of trees) {
    // Trunk
    ctx.fillStyle = '#1a0d0a';
    ctx.fillRect(tx, GROUND_Y - 180, 15, 240);
    // Canopy
    ctx.fillStyle = '#0d2e0d';
    ctx.beginPath();
    ctx.arc(tx + 7, GROUND_Y - 190, 40 + Math.sin(time * 0.5 + tx) * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glowing eyes
  const eyePairs = [
    { x: 90, y: GROUND_Y - 60 },
    { x: 760, y: GROUND_Y - 40 },
    { x: 850, y: GROUND_Y - 80 },
  ];
  for (const eye of eyePairs) {
    const alpha = 0.4 + Math.sin(time * 2 + eye.x) * 0.3;
    ctx.fillStyle = `rgba(57, 255, 20, ${alpha})`;
    ctx.fillRect(eye.x, eye.y, 4, 3);
    ctx.fillRect(eye.x + 10, eye.y, 4, 3);
  }
}

function drawColosseum(ctx: CanvasRenderingContext2D, time: number): void {
  // Arches
  ctx.strokeStyle = '#4a3520';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(60 + i * 120, GROUND_Y - 80, 50, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#2e2210';
    ctx.fillRect(60 + i * 120 - 50, GROUND_Y - 80, 100, 140);
  }

  // Torches
  const torchPositions = [100, 340, 620, 860];
  for (const tx of torchPositions) {
    ctx.fillStyle = '#4a3520';
    ctx.fillRect(tx, GROUND_Y - 130, 6, 40);
    ctx.fillStyle = `rgba(255, 150, 0, ${0.6 + Math.sin(time * 4 + tx) * 0.3})`;
    ctx.fillRect(tx - 3, GROUND_Y - 140, 12, 12);
  }

  // Crowd silhouettes
  ctx.fillStyle = 'rgba(30, 20, 10, 0.8)';
  for (let i = 0; i < 40; i++) {
    const cx = 50 + i * 22;
    const cy = GROUND_Y - 200 + Math.sin(i * 0.7 + time * 2) * 3;
    ctx.fillRect(cx, cy, 10, 14);
    ctx.fillRect(cx + 2, cy - 6, 6, 6);
  }
}

function drawSkyPlatform(ctx: CanvasRenderingContext2D, _time: number): void {
  // Clouds below
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(i * 180 - 40, GROUND_Y + 80 + i * 15, 160, 20);
  }

  // Platform edges
  ctx.fillStyle = '#455a64';
  ctx.fillRect(100, GROUND_Y + 55, CANVAS_WIDTH - 200, 15);
  ctx.fillStyle = '#37474f';
  ctx.fillRect(100, GROUND_Y + 70, CANVAS_WIDTH - 200, 30);
}

function drawUndergroundLab(ctx: CanvasRenderingContext2D, time: number): void {
  // Screens
  const screens = [
    { x: 30, y: GROUND_Y - 200, w: 60, h: 40 },
    { x: 120, y: GROUND_Y - 160, w: 50, h: 35 },
    { x: 780, y: GROUND_Y - 190, w: 55, h: 40 },
    { x: 870, y: GROUND_Y - 150, w: 60, h: 35 },
  ];
  for (const s of screens) {
    ctx.fillStyle = '#0d1a2e';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.fillStyle = `rgba(0, 229, 255, ${0.2 + Math.sin(time * 2 + s.x) * 0.1})`;
    ctx.fillRect(s.x + 3, s.y + 3, s.w - 6, s.h - 6);
    // Scan line
    const scanY = s.y + 3 + ((time * 30 + s.x) % (s.h - 6));
    ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.fillRect(s.x + 3, scanY, s.w - 6, 2);
  }

  // Pipes
  ctx.strokeStyle = '#37474f';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y - 30);
  ctx.lineTo(200, GROUND_Y - 30);
  ctx.moveTo(760, GROUND_Y - 30);
  ctx.lineTo(960, GROUND_Y - 30);
  ctx.stroke();
}

function drawDesertRuins(ctx: CanvasRenderingContext2D, _time: number): void {
  // Crumbling pillars
  const pillars = [
    { x: 80, h: 200, broken: false },
    { x: 200, h: 140, broken: true },
    { x: 720, h: 180, broken: false },
    { x: 850, h: 120, broken: true },
  ];
  for (const p of pillars) {
    ctx.fillStyle = '#b89060';
    ctx.fillRect(p.x, GROUND_Y + 60 - p.h, 25, p.h);
    if (p.broken) {
      ctx.fillStyle = '#d4a76a';
      ctx.fillRect(p.x - 5, GROUND_Y + 60 - p.h, 35, 8);
      // Rubble
      ctx.fillRect(p.x + 30, GROUND_Y + 45, 15, 15);
      ctx.fillRect(p.x + 40, GROUND_Y + 50, 10, 10);
    } else {
      ctx.fillRect(p.x - 8, GROUND_Y + 60 - p.h, 41, 10);
      ctx.fillRect(p.x - 8, GROUND_Y + 55, 41, 10);
    }
  }
}

function drawTempleGardens(ctx: CanvasRenderingContext2D, time: number): void {
  // Cherry tree
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(100, GROUND_Y - 200, 20, 260);
  ctx.fillRect(80, GROUND_Y - 200, 10, 60);
  // Canopy
  ctx.fillStyle = `rgba(255, 150, 180, ${0.4 + Math.sin(time * 0.5) * 0.1})`;
  ctx.beginPath();
  ctx.arc(110, GROUND_Y - 220, 70, 0, Math.PI * 2);
  ctx.fill();

  // Water
  ctx.fillStyle = `rgba(100, 180, 255, ${0.15 + Math.sin(time * 0.8) * 0.05})`;
  ctx.fillRect(400, GROUND_Y + 40, 200, 25);

  // Stones
  ctx.fillStyle = '#5d6d7e';
  ctx.fillRect(350, GROUND_Y + 45, 20, 12);
  ctx.fillRect(620, GROUND_Y + 48, 15, 10);
  ctx.fillRect(470, GROUND_Y + 42, 18, 14);
}

function drawTheVoid(ctx: CanvasRenderingContext2D, time: number): void {
  // Grid floor (perspective)
  ctx.strokeStyle = `rgba(181, 74, 255, ${0.2 + Math.sin(time * 0.5) * 0.1})`;
  ctx.lineWidth = 1;

  // Horizontal grid lines
  for (let i = 0; i < 15; i++) {
    const y = GROUND_Y + 60 + i * 8 + i * i * 0.5;
    const alpha = 0.3 - i * 0.015;
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  // Vertical grid lines (perspective converging)
  for (let i = 0; i < 20; i++) {
    const x = CANVAS_WIDTH / 2 + (i - 10) * (40 + Math.abs(i - 10) * 5);
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, GROUND_Y + 60);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;

  // Energy pillars
  const pillarPositions = [150, 810];
  for (const px of pillarPositions) {
    ctx.fillStyle = `rgba(181, 74, 255, ${0.15 + Math.sin(time * 2 + px) * 0.1})`;
    ctx.fillRect(px - 3, GROUND_Y - 200, 6, 260);
    // Glow
    ctx.fillStyle = `rgba(181, 74, 255, ${0.05 + Math.sin(time * 2 + px) * 0.03})`;
    ctx.fillRect(px - 15, GROUND_Y - 200, 30, 260);
  }
}

/**
 * Full render pipeline for a battle frame
 */
export function renderBattleFrame(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  p1Char: Character,
  p2Char: Character,
  p1State: AnimationState,
  p2State: AnimationState,
  p1Frame: number,
  p2Frame: number,
  p1X: number,
  p2X: number,
  particles: ParticleSystem,
  time: number,
  shakeOffset: { x: number; y: number } = { x: 0, y: 0 },
  p1Flash: boolean = false,
  p2Flash: boolean = false
): void {
  ctx.save();
  ctx.translate(shakeOffset.x, shakeOffset.y);

  // Clear
  ctx.clearRect(-10, -10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20);

  // Background
  drawArenaBackground(ctx, arena, time);

  // Characters
  drawCharacterFrame(ctx, p1Char, p1State, p1Frame, p1X, GROUND_Y, 'right', 2.5, p1Flash);
  drawCharacterFrame(ctx, p2Char, p2State, p2Frame, p2X, GROUND_Y, 'left', 2.5, p2Flash);

  // Particles
  particles.draw(ctx);

  ctx.restore();
}
