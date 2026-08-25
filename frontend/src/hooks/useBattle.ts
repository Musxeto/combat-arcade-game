// React state management for a battle
// Wraps GameEngine with React state and manages phase transitions cleanly

import { useState, useCallback, useRef } from 'react';
import type { Character } from '../config/characters';
import { AI_THINK_DELAY_MS, PHASE_TRANSITION_DELAY, HIT_PAUSE_DURATION, KO_SLOW_MO_DURATION } from '../config/constants';
import type { AnimationState, BattlePhase } from '../config/constants';
import { GameEngine } from '../engine/GameEngine';
import type { BattleEvent, BattleState } from '../engine/GameEngine';

export interface BattleActions {
  selectAttack: (attackIndex: number) => void;
  selectDefense: (guessIndex: number) => void;
  startBattle: () => void;
  reset: () => void;
}

export interface BattleHookState {
  phase: BattlePhase;
  battleState: BattleState | null;
  p1AnimState: AnimationState;
  p2AnimState: AnimationState;
  p1AnimFrame: number;
  p2AnimFrame: number;
  events: BattleEvent[];
  recentEvents: BattleEvent[];
  voltHint: number | null;
  shakeActive: boolean;
  flashP1: boolean;
  flashP2: boolean;
  winner: 'p1' | 'p2' | null;
  isAiTurn: boolean;
}

export function useBattle(
  p1Character: Character | null,
  p2Character: Character | null,
  isVsAi: boolean = true
): [BattleHookState, BattleActions] {
  const engineRef = useRef<GameEngine | null>(null);

  const [phase, setPhase] = useState<BattlePhase>('intro');
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [p1AnimState, setP1AnimState] = useState<AnimationState>('idle');
  const [p2AnimState, setP2AnimState] = useState<AnimationState>('idle');
  const [p1AnimFrame, setP1AnimFrame] = useState(0);
  const [p2AnimFrame, setP2AnimFrame] = useState(0);
  const [events, setEvents] = useState<BattleEvent[]>([]);
  const [recentEvents, setRecentEvents] = useState<BattleEvent[]>([]);
  const [voltHint, setVoltHint] = useState<number | null>(null);
  const [shakeActive, setShakeActive] = useState(false);
  const [flashP1, setFlashP1] = useState(false);
  const [flashP2, setFlashP2] = useState(false);
  const [winner, setWinner] = useState<'p1' | 'p2' | null>(null);
  const [isAiTurn, setIsAiTurn] = useState(false);

  // Store pending attack
  const pendingAttackRef = useRef<{ actualIndex: number; damage: number } | null>(null);

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

  // Use refs for forward-referencing in async callbacks
  const handleDefenseSelectRef = useRef<(guessIndex: number, actualOverride?: number) => void>(() => {});
  const handleAttackSelectRef = useRef<(attackIndex: number) => void>(() => {});

  const triggerAiDefense = useCallback((actualAttack: number) => {
    setIsAiTurn(true);
    setTimeout(() => {
      const aiGuess = Math.floor(Math.random() * 4);
      handleDefenseSelectRef.current(aiGuess, actualAttack);
    }, AI_THINK_DELAY_MS);
  }, []);

  const triggerAiAttack = useCallback(() => {
    setIsAiTurn(true);
    setTimeout(() => {
      const aiChoice = Math.floor(Math.random() * 4);
      handleAttackSelectRef.current(aiChoice);
    }, AI_THINK_DELAY_MS);
  }, []);

  const handleAttackSelect = useCallback((attackIndex: number) => {
    const engine = engineRef.current;
    if (!engine) return;

    const { actualIndex, damage, events: newEvents } = engine.executeAttack(attackIndex);
    pendingAttackRef.current = { actualIndex, damage };

    const attacker = engine.getAttacker();
    const isP1Attacking = attacker === engine.getBattleState().player1;
    const attackAnimState: AnimationState = `attack_${attackIndex + 1}` as AnimationState;

    if (isP1Attacking) {
      setP1AnimState(attackAnimState);
      setP1AnimFrame(0);
    } else {
      setP2AnimState(attackAnimState);
      setP2AnimFrame(0);
    }

    setEvents(prev => [...prev, ...newEvents]);
    setRecentEvents(newEvents);

    // Check Volt hint
    const defender = engine.getDefender();
    if (defender.character.name === 'Volt') {
      const hint = engine.getVoltHint(actualIndex);
      setVoltHint(hint);
    } else {
      setVoltHint(null);
    }

    // Move to defend phase
    setTimeout(() => {
      setPhase('defend_select');

      if (isP1Attacking) {
        setP1AnimState('idle');
      } else {
        setP2AnimState('idle');
      }

      if (isVsAi && isP1Attacking) {
        triggerAiDefense(actualIndex);
      } else if (isVsAi && !isP1Attacking) {
        setIsAiTurn(false);
      }
    }, PHASE_TRANSITION_DELAY);
  }, [isVsAi, triggerAiDefense]);

  handleAttackSelectRef.current = handleAttackSelect;

  const handleDefenseSelect = useCallback((guessIndex: number, actualOverride?: number) => {
    const engine = engineRef.current;
    const pending = pendingAttackRef.current;
    if (!engine || !pending) return;

    const actualIndex = actualOverride !== undefined ? actualOverride : pending.actualIndex;
    const { dodged, events: newEvents } = engine.attemptDodge(guessIndex, actualIndex, pending.damage);

    const state = engine.getBattleState();
    const isP1Defending = !state.player1.isAttacker;

    setPhase('animating');
    setIsAiTurn(false);

    if (dodged) {
      if (isP1Defending) {
        setP1AnimState('dodge');
        setP1AnimFrame(0);
      } else {
        setP2AnimState('dodge');
        setP2AnimFrame(0);
      }
    } else {
      if (isP1Defending) {
        setP1AnimState('hit');
        setP1AnimFrame(0);
      } else {
        setP2AnimState('hit');
        setP2AnimFrame(0);
      }
      triggerShake();
      triggerFlash(isP1Defending ? 'p1' : 'p2');
    }

    setEvents(prev => [...prev, ...newEvents]);
    setRecentEvents(newEvents);
    setBattleState(engine.getBattleState());
    pendingAttackRef.current = null;

    const delay = state.isOver ? KO_SLOW_MO_DURATION : HIT_PAUSE_DURATION;

    setTimeout(() => {
      const finalState = engine.getBattleState();

      if (finalState.isOver) {
        setPhase('ko');
        const winnerIsP1 = finalState.winner?.character.id === p1Character?.id;
        setWinner(winnerIsP1 ? 'p1' : 'p2');

        if (winnerIsP1) {
          setP1AnimState('victory');
          setP2AnimState('defeat');
        } else {
          setP1AnimState('defeat');
          setP2AnimState('victory');
        }

        setTimeout(() => setPhase('victory'), 2000);
      } else {
        engine.switchTurns();
        setBattleState(engine.getBattleState());
        setP1AnimState('idle');
        setP2AnimState('idle');
        setPhase('attack_select');

        const newState = engine.getBattleState();
        if (isVsAi && !newState.player1.isAttacker) {
          triggerAiAttack();
        } else {
          setIsAiTurn(false);
        }
      }
    }, delay);
  }, [p1Character, isVsAi, triggerShake, triggerFlash, triggerAiAttack]);

  handleDefenseSelectRef.current = handleDefenseSelect;

  const startBattle = useCallback(() => {
    if (!p1Character || !p2Character) return;

    const engine = new GameEngine(p1Character, p2Character);
    engineRef.current = engine;
    const state = engine.startBattle();

    setBattleState(state);
    setEvents(state.events);
    setRecentEvents(state.events);
    setP1AnimState('idle');
    setP2AnimState('idle');
    setP1AnimFrame(0);
    setP2AnimFrame(0);
    setVoltHint(null);
    setWinner(null);
    setIsAiTurn(false);

    setPhase('intro');
    setTimeout(() => {
      setPhase('attack_select');
      if (isVsAi && !state.player1.isAttacker) {
        triggerAiAttack();
      }
    }, 2000);
  }, [p1Character, p2Character, isVsAi, triggerAiAttack]);

  const selectAttack = useCallback((attackIndex: number) => {
    if (phase !== 'attack_select' || isAiTurn) return;
    handleAttackSelect(attackIndex);
  }, [phase, isAiTurn, handleAttackSelect]);

  const selectDefense = useCallback((guessIndex: number) => {
    if (phase !== 'defend_select' || isAiTurn) return;
    handleDefenseSelect(guessIndex);
  }, [phase, isAiTurn, handleDefenseSelect]);

  const reset = useCallback(() => {
    engineRef.current = null;
    setBattleState(null);
    setPhase('intro');
    setEvents([]);
    setRecentEvents([]);
    setP1AnimState('idle');
    setP2AnimState('idle');
    setWinner(null);
    setVoltHint(null);
    setIsAiTurn(false);
  }, []);

  return [
    {
      phase,
      battleState,
      p1AnimState,
      p2AnimState,
      p1AnimFrame,
      p2AnimFrame,
      events,
      recentEvents,
      voltHint,
      shakeActive,
      flashP1,
      flashP2,
      winner,
      isAiTurn,
    },
    {
      selectAttack,
      selectDefense,
      startBattle,
      reset,
    },
  ];
}
