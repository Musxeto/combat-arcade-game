// Battle Arena — Main fight screen with canvas rendering
import { useRef, useCallback, useMemo } from 'react';
import type { Character } from '../config/characters';
import type { Arena } from '../config/arenas';
import { CANVAS_WIDTH, CANVAS_HEIGHT, P1_X, P2_X } from '../config/constants';
import { useGameLoop } from '../hooks/useGameLoop';
import { useBattle } from '../hooks/useBattle';
import { ParticleSystem } from '../engine/ParticleSystem';
import { renderBattleFrame } from '../engine/SpriteRenderer';
import { HUD } from './HUD';
import { AttackPanel } from './AttackPanel';
import { DefendPanel } from './DefendPanel';
import { BattleLog } from './BattleLog';
import { ResultScreen } from './ResultScreen';
import './BattleArena.css';

import { soundManager } from '../engine/SoundManager';

interface BattleArenaProps {
  player1: Character;
  player2: Character;
  arena: Arena;
  isVsAi: boolean;
  onBattleEnd: (winner: 'p1' | 'p2') => void;
  onBack: () => void;
}

export function BattleArena({ player1, player2, arena, isVsAi, onBattleEnd, onBack }: BattleArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useMemo(() => new ParticleSystem(), []);
  const animFrameCounter = useRef(0);

  const [state, actions] = useBattle(player1, player2, isVsAi);

  // Start battle on mount
  const hasStarted = useRef(false);
  if (!hasStarted.current) {
    hasStarted.current = true;
    // Defer to next tick to ensure state is ready
    setTimeout(() => actions.startBattle(), 100);
  }

  // Sprite animation frame counter
  const spriteFrameRef = useRef({ p1: 0, p2: 0, timer: 0 });

  // Main render loop
  useGameLoop(useCallback((deltaTime: number, time: number) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Update sprite animation frames
    spriteFrameRef.current.timer += deltaTime;
    if (spriteFrameRef.current.timer > 0.1) { // ~10fps sprite animation
      spriteFrameRef.current.timer = 0;
      spriteFrameRef.current.p1 = (spriteFrameRef.current.p1 + 1) % 8;
      spriteFrameRef.current.p2 = (spriteFrameRef.current.p2 + 1) % 8;
    }

    // Update particles
    particles.update(deltaTime);

    // Screen shake
    const shakeOffset = state.shakeActive
      ? { x: (Math.random() - 0.5) * 12, y: (Math.random() - 0.5) * 8 }
      : { x: 0, y: 0 };

    // Render
    renderBattleFrame(
      ctx,
      arena,
      player1,
      player2,
      state.p1AnimState,
      state.p2AnimState,
      spriteFrameRef.current.p1,
      spriteFrameRef.current.p2,
      P1_X,
      P2_X,
      particles,
      time,
      shakeOffset,
      state.flashP1,
      state.flashP2
    );

    // Draw "FIGHT!" text during intro
    if (state.phase === 'intro') {
      const introAlpha = Math.min(1, (time * 2) % 3);
      ctx.save();
      ctx.globalAlpha = introAlpha;
      ctx.font = '48px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffe600';
      ctx.shadowColor = '#ffe600';
      ctx.shadowBlur = 30;
      ctx.fillText('FIGHT!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.restore();
    }

    // Draw KO text
    if (state.phase === 'ko') {
      ctx.save();
      ctx.font = '64px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff1744';
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 40;
      ctx.fillText('K.O.!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
      ctx.restore();
    }
  }, [arena, player1, player2, state, particles]));

  // Emit particles and play sound effects on hit/dodge events
  const lastEventCount = useRef(0);
  if (state.events.length > lastEventCount.current) {
    const newEvents = state.events.slice(lastEventCount.current);
    for (const event of newEvents) {
      if (event.type === 'hit') {
        const targetX = state.battleState?.player1.isAttacker ? P2_X : P1_X;
        particles.emitHitBurst(targetX, CANVAS_HEIGHT * 0.6, event.defender === player1.name ? player1.color : player2.color);
        soundManager.playHit();
      } else if (event.type === 'dodge') {
        const targetX = state.battleState?.player1.isAttacker ? P2_X : P1_X;
        particles.emitDodgePuff(targetX, CANVAS_HEIGHT * 0.65, state.battleState?.player1.isAttacker ? 1 : -1);
        soundManager.playDodge();
      } else if (event.type === 'special') {
        soundManager.playSpecial();
      } else if (event.type === 'ko') {
        const targetX = state.winner === 'p1' ? P2_X : P1_X;
        particles.emitKOExplosion(targetX, CANVAS_HEIGHT * 0.55, state.winner === 'p1' ? player2.color : player1.color);
        soundManager.playKO();
      }
    }
    lastEventCount.current = state.events.length;
  }

  const isP1Attacking = state.battleState?.player1.isAttacker ?? true;

  return (
    <div className="battle-arena">
      {/* Canvas */}
      <div className={`battle-arena__canvas-wrapper ${state.shakeActive ? 'shake' : ''}`}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="battle-arena__canvas"
        />

        {/* HUD Overlay */}
        {state.battleState && (
          <HUD
            player1={state.battleState.player1}
            player2={state.battleState.player2}
            turnCount={state.battleState.turnCount}
            phase={state.phase}
          />
        )}
      </div>

      {/* Controls */}
      <div className="battle-arena__controls">
        {state.phase === 'attack_select' && isP1Attacking && !state.isAiTurn && (
          <AttackPanel
            character={player1}
            onAttack={actions.selectAttack}
            disabled={false}
          />
        )}

        {state.phase === 'attack_select' && !isP1Attacking && !isVsAi && !state.isAiTurn && (
          <AttackPanel
            character={player2}
            onAttack={actions.selectAttack}
            disabled={false}
          />
        )}

        {state.phase === 'defend_select' && !isP1Attacking && !state.isAiTurn && (
          <DefendPanel
            onDefend={actions.selectDefense}
            disabled={false}
            voltHint={state.voltHint}
          />
        )}

        {state.phase === 'defend_select' && isP1Attacking && !isVsAi && !state.isAiTurn && (
          <DefendPanel
            onDefend={actions.selectDefense}
            disabled={false}
            voltHint={state.voltHint}
          />
        )}

        {(state.phase === 'animating' || state.isAiTurn) && (
          <div className="battle-arena__waiting pixel-text-sm">
            {state.isAiTurn ? '🤖 AI is thinking...' : '⏳ Resolving...'}
          </div>
        )}

        {/* Battle Log */}
        <BattleLog events={state.events} />
      </div>

      {/* Result Screen */}
      {state.phase === 'victory' && state.winner && (
        <ResultScreen
          winner={state.winner === 'p1' ? player1 : player2}
          loser={state.winner === 'p1' ? player2 : player1}
          isPlayerWin={state.winner === 'p1'}
          mode={isVsAi ? 'campaign' : 'vs_local'}
          onContinue={() => onBattleEnd(state.winner!)}
          onRematch={() => {
            actions.reset();
            hasStarted.current = false;
            setTimeout(() => {
              hasStarted.current = true;
              actions.startBattle();
            }, 100);
          }}
        />
      )}

      {/* CRT Overlay */}
      <div className="crt-overlay" />
    </div>
  );
}
