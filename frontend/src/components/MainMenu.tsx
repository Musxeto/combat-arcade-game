// Main Menu — Title screen with animated title and arcade menu
import { useState, useRef, useEffect } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/constants';
import type { Screen } from '../config/constants';
import { soundManager } from '../engine/SoundManager';
import './MainMenu.css';

interface MainMenuProps {
  onNavigate: (screen: Screen) => void;
}

export function MainMenu({ onNavigate }: MainMenuProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Animate title entrance
  useEffect(() => {
    setTimeout(() => setShowMenu(true), 800);
  }, []);

  // Background animation
  useGameLoop((_, time) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const w = CANVAS_WIDTH;
    const h = CANVAS_HEIGHT;

    // Dark background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    // Animated grid floor
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const y = h * 0.6 + i * 12 + i * i * 0.3;
      ctx.globalAlpha = 0.3 - i * 0.015;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let i = 0; i < 24; i++) {
      const x = w / 2 + (i - 12) * (35 + Math.abs(i - 12) * 4);
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.moveTo(w / 2, h * 0.6);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Fighting silhouettes
    drawSilhouette(ctx, 180, h * 0.5, time, 'right');
    drawSilhouette(ctx, w - 180, h * 0.5, time, 'left');

    // Floating particles
    for (let i = 0; i < 30; i++) {
      const seed = i * 137.508;
      const px = (seed * 7.3 + Math.sin(time * 0.3 + seed) * 50) % w;
      const py = (seed * 3.7 + Math.sin(time * 0.5 + seed * 0.7) * 30 + time * 8) % h;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 245, 255, 0.3)' : 'rgba(255, 0, 229, 0.2)';
      ctx.fillRect(px, py, 2, 2);
    }
  });

  const menuItems: { label: string; screen: Screen; color: string }[] = [
    { label: 'CAMPAIGN', screen: 'character_select', color: 'var(--neon-cyan)' },
    { label: 'VS LOCAL', screen: 'character_select', color: 'var(--neon-magenta)' },
    { label: 'ONLINE', screen: 'multiplayer_lobby', color: 'var(--neon-yellow)' },
    { label: 'HOW TO PLAY', screen: 'how_to_play', color: 'var(--neon-green)' },
  ];

  return (
    <div className="main-menu">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="main-menu__bg"
      />

      <div className="main-menu__content">
        <div className={`main-menu__title ${showMenu ? 'main-menu__title--visible' : ''}`}>
          <h1 className="main-menu__title-text pixel-text-xl">
            THE KANJERS
          </h1>
          <p className="main-menu__subtitle pixel-text-sm">
            ARCADE FIGHTER
          </p>
        </div>

        <nav className={`main-menu__nav ${showMenu ? 'main-menu__nav--visible' : ''}`}>
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              id={`menu-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              className="main-menu__btn neon-btn"
              style={{
                animationDelay: `${0.8 + i * 0.15}s`,
                borderColor: hoveredIndex === i ? item.color : undefined,
                color: hoveredIndex === i ? item.color : undefined,
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                soundManager.playSelect();
                onNavigate(item.screen);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <p className="main-menu__footer pixel-text-sm">
          {'>> INSERT COIN <<'}
        </p>
      </div>
    </div>
  );
}

// Draw a simple fighter silhouette
function drawSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  facing: 'left' | 'right'
): void {
  const dir = facing === 'right' ? 1 : -1;
  const bob = Math.sin(time * 2) * 3;
  const alpha = 0.12;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = facing === 'right' ? '#00f5ff' : '#ff00e5';

  // Body
  ctx.fillRect(x - 15, y - 40 + bob, 30, 50);
  // Head
  ctx.fillRect(x - 10, y - 60 + bob, 20, 20);
  // Arms
  ctx.fillRect(x + dir * 15, y - 35 + bob + Math.sin(time * 3) * 5, 8, 30);
  ctx.fillRect(x - dir * 23, y - 35 + bob - Math.sin(time * 3) * 5, 8, 30);
  // Legs
  ctx.fillRect(x - 12, y + 10 + bob, 10, 35);
  ctx.fillRect(x + 2, y + 10 + bob, 10, 35);

  ctx.restore();
}
