import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Character } from '../config/characters';
import { ARENAS } from '../config/arenas';
import type { Arena } from '../config/arenas';
import { CANVAS_WIDTH, CANVAS_HEIGHT, P1_X, P2_X, WS_URL } from '../config/constants';
import type { AnimationState, BattlePhase } from '../config/constants';
import { useGameLoop } from '../hooks/useGameLoop';
import { useWebSocket } from '../hooks/useWebSocket';
import { ParticleSystem } from '../engine/ParticleSystem';
import { renderBattleFrame } from '../engine/SpriteRenderer';
import { HUD } from './HUD';
import { AttackPanel } from './AttackPanel';
import { DefendPanel } from './DefendPanel';
import { BattleLog } from './BattleLog';
import { ResultScreen } from './ResultScreen';
import { soundManager } from '../engine/SoundManager';
import './BattleArena.css';

interface OnlineBattleProps {
  roomCode: string;
  playerId: string;
  playerName: string;
  player1Char: Character;
  player2Char: Character;
  arenaId: number;
  initialGameState: any;
  initialEvents: any[];
  onBackToMenu: () => void;
}

export function OnlineBattle({
  roomCode,
  playerId,
  playerName,
  player1Char,
  player2Char,
  arenaId,
  initialGameState,
  initialEvents,
  onBackToMenu,
}: OnlineBattleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useMemo(() => new ParticleSystem(), []);
  const spriteFrameRef = useRef({ p1: 0, p2: 0, timer: 0 });

  const arena: Arena = ARENAS.find((a) => a.id === arenaId) || ARENAS[0];

  const wsUrl = `${WS_URL}/${roomCode}/${playerId}`;
  const { isConnected, lastMessage, sendMessage } = useWebSocket(wsUrl);

  const [gameState, setGameState] = useState<any>(initialGameState);
  const [events, setEvents] = useState<any[]>(initialEvents || []);
  const [phase, setPhase] = useState<BattlePhase>('intro');
  const [p1AnimState, setP1AnimState] = useState<AnimationState>('idle');
  const [p2AnimState, setP2AnimState] = useState<AnimationState>('idle');
  const [shakeActive, setShakeActive] = useState(false);
  const [flashP1, setFlashP1] = useState(false);
  const [flashP2, setFlashP2] = useState(false);
  const [voltHint, setVoltHint] = useState<number | null>(null);

  const isPlayer1 = gameState?.player1?.id === playerId;
  const isMyTurnToAttack = (isPlayer1 && gameState?.player1?.is_attacker) || (!isPlayer1 && gameState?.player2?.is_attacker);
  const isMyTurnToDefend = (isPlayer1 && !gameState?.player1?.is_attacker) || (!isPlayer1 && !gameState?.player2?.is_attacker);

  // Trigger shake & flash helpers
  const triggerShake = useCallback(() => {
    setShakeActive(true);
    setTimeout(() => setShakeActive(false), 400);
  }, []);

  const triggerFlash = useCallback((player: 'p1' | 'p2') => {
    if (player === 'p1') {
      setFlashP1(true);
      setTimeout(() => setFlashP1(false), 200);
    } else {
      setFlashP2(true);
      setTimeout(() => setFlashP2(false), 200);
    }
  }, []);

  // Handle intro transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('attack_select');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Handle WebSocket updates
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'attack_executed': {
        const { attacker_id, attack_slot, damage, volt_hint, events: newEvents } = lastMessage.data;
        const attackerIsP1 = attacker_id === gameState?.player1?.id;
        const anim = (`attack_${(attack_slot % 4) + 1}`) as AnimationState;

        if (attackerIsP1) {
          setP1AnimState(anim);
        } else {
          setP2AnimState(anim);
        }

        setEvents((prev) => [...prev, ...newEvents]);
        setVoltHint(volt_hint);
        setPhase('defend_select');

        setTimeout(() => {
          if (attackerIsP1) setP1AnimState('idle');
          else setP2AnimState('idle');
        }, 1000);
        break;
      }

      case 'defense_resolved': {
        const { defender_id, dodged, game_state, events: newEvents } = lastMessage.data;
        const defenderIsP1 = defender_id === gameState?.player1?.id;

        setPhase('animating');

        if (dodged) {
          if (defenderIsP1) setP1AnimState('dodge');
          else setP2AnimState('dodge');
        } else {
          if (defenderIsP1) setP1AnimState('hit');
          else setP2AnimState('hit');
          triggerShake();
          triggerFlash(defenderIsP1 ? 'p1' : 'p2');
        }

        setEvents((prev) => [...prev, ...newEvents]);
        setGameState(game_state);

        setTimeout(() => {
          if (game_state.is_over) {
            setPhase('ko');
            const winnerIsP1 = game_state.winner_id === gameState?.player1?.id;
            if (winnerIsP1) {
              setP1AnimState('victory');
              setP2AnimState('defeat');
            } else {
              setP1AnimState('defeat');
              setP2AnimState('victory');
            }
            setTimeout(() => setPhase('victory'), 2000);
          } else {
            setP1AnimState('idle');
            setP2AnimState('idle');
            // Request turn switch from server if we are host
            if (isPlayer1) {
              sendMessage('switch_turns');
            }
          }
        }, 1200);
        break;
      }

      case 'turn_switched': {
        const { game_state } = lastMessage.data;
        setGameState(game_state);
        setP1AnimState('idle');
        setP2AnimState('idle');
        setVoltHint(null);
        setPhase('attack_select');
        break;
      }
    }
  }, [lastMessage, gameState, isPlayer1, sendMessage, triggerShake, triggerFlash]);

  // Main canvas render loop
  useGameLoop(
    useCallback(
      (deltaTime: number, time: number) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        spriteFrameRef.current.timer += deltaTime;
        if (spriteFrameRef.current.timer > 0.1) {
          spriteFrameRef.current.timer = 0;
          spriteFrameRef.current.p1 = (spriteFrameRef.current.p1 + 1) % 8;
          spriteFrameRef.current.p2 = (spriteFrameRef.current.p2 + 1) % 8;
        }

        particles.update(deltaTime);

        const shakeOffset = shakeActive
          ? { x: (Math.random() - 0.5) * 12, y: (Math.random() - 0.5) * 8 }
          : { x: 0, y: 0 };

        renderBattleFrame(
          ctx,
          arena,
          player1Char,
          player2Char,
          p1AnimState,
          p2AnimState,
          spriteFrameRef.current.p1,
          spriteFrameRef.current.p2,
          P1_X,
          P2_X,
          particles,
          time,
          shakeOffset,
          flashP1,
          flashP2
        );

        if (phase === 'intro') {
          ctx.save();
          ctx.font = '48px "Press Start 2P"';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffe600';
          ctx.shadowColor = '#ffe600';
          ctx.shadowBlur = 30;
          ctx.fillText('FIGHT!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
          ctx.restore();
        }

        if (phase === 'ko') {
          ctx.save();
          ctx.font = '64px "Press Start 2P"';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ff1744';
          ctx.shadowColor = '#ff1744';
          ctx.shadowBlur = 40;
          ctx.fillText('K.O.!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
          ctx.restore();
        }
      },
      [arena, player1Char, player2Char, p1AnimState, p2AnimState, particles, shakeActive, flashP1, flashP2, phase]
    )
  );


  // Emit particles on hit/dodge/ko
  const lastEventCount = useRef(0);
  if (events.length > lastEventCount.current) {
    const newEvents = events.slice(lastEventCount.current);
    for (const event of newEvents) {
      if (event.type === 'hit') {
        const targetX = gameState?.player1?.is_attacker ? P2_X : P1_X;
        particles.emitHitBurst(targetX, CANVAS_HEIGHT * 0.6, '#ff00e5');
        soundManager.playHit();
      } else if (event.type === 'dodge') {
        const targetX = gameState?.player1?.is_attacker ? P2_X : P1_X;
        particles.emitDodgePuff(targetX, CANVAS_HEIGHT * 0.65, 1);
        soundManager.playDodge();
      } else if (event.type === 'special') {
        soundManager.playSpecial();
      } else if (event.type === 'ko') {
        particles.emitKOExplosion(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.55, '#ffe600');
        soundManager.playKO();
      }
    }
    lastEventCount.current = events.length;
  }

  // Format player state for HUD component
  const hudPlayer1 = {
    character: player1Char,
    currentHp: gameState?.player1?.current_hp ?? player1Char.hp,
    maxHp: gameState?.player1?.max_hp ?? player1Char.hp,
    isAttacker: gameState?.player1?.is_attacker ?? true,
    consecutiveHits: gameState?.player1?.consecutive_hits ?? 0,
    misdirectUsed: false,
    attackOrder: [0, 1, 2, 3],
  };

  const hudPlayer2 = {
    character: player2Char,
    currentHp: gameState?.player2?.current_hp ?? player2Char.hp,
    maxHp: gameState?.player2?.max_hp ?? player2Char.hp,
    isAttacker: gameState?.player2?.is_attacker ?? false,
    consecutiveHits: gameState?.player2?.consecutive_hits ?? 0,
    misdirectUsed: false,
    attackOrder: [0, 1, 2, 3],
  };

  const handleAttack = (slot: number) => {
    sendMessage('attack', { attack_slot: slot });
  };

  const handleDefend = (guess: number) => {
    sendMessage('defend', { guess_index: guess });
  };

  const myCharacter = isPlayer1 ? player1Char : player2Char;
  const isWinner = gameState?.winner_id === playerId;

  return (
    <div className="battle-arena">
      <div className={`battle-arena__canvas-wrapper ${shakeActive ? 'shake' : ''}`}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="battle-arena__canvas"
        />

        <HUD
          player1={hudPlayer1}
          player2={hudPlayer2}
          turnCount={gameState?.turn_count ?? 1}
          phase={phase}
        />
      </div>

      <div className="battle-arena__controls">
        {phase === 'attack_select' && isMyTurnToAttack && (
          <AttackPanel
            character={myCharacter}
            onAttack={handleAttack}
            disabled={false}
          />
        )}

        {phase === 'attack_select' && !isMyTurnToAttack && (
          <div className="battle-arena__waiting pixel-text-sm">
            ⏳ OPPONENT IS CHOOSING AN ATTACK...
          </div>
        )}

        {phase === 'defend_select' && isMyTurnToDefend && (
          <DefendPanel
            onDefend={handleDefend}
            disabled={false}
            voltHint={voltHint}
            timerEnabled={true}
            timerDuration={8}
          />
        )}

        {phase === 'defend_select' && !isMyTurnToDefend && (
          <div className="battle-arena__waiting pixel-text-sm">
            ⏳ OPPONENT IS PREDICTING YOUR MOVE...
          </div>
        )}

        {phase === 'animating' && (
          <div className="battle-arena__waiting pixel-text-sm">
            ⚔ RESOLVING COMBAT...
          </div>
        )}

        <BattleLog events={events} />
      </div>

      {phase === 'victory' && (
        <ResultScreen
          winner={isWinner ? myCharacter : (isPlayer1 ? player2Char : player1Char)}
          loser={isWinner ? (isPlayer1 ? player2Char : player1Char) : myCharacter}
          isPlayerWin={isWinner}
          mode="online"
          onContinue={onBackToMenu}
        />
      )}

      <div className="crt-overlay" />
    </div>
  );
}
