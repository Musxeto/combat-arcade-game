// HUD — HP bars, turn counter, names, phase indicator
import type { PlayerState } from '../engine/GameEngine';
import type { BattlePhase } from '../config/constants';
import './HUD.css';

interface HUDProps {
  player1: PlayerState;
  player2: PlayerState;
  turnCount: number;
  phase: BattlePhase;
}

export function HUD({ player1, player2, turnCount, phase }: HUDProps) {
  const getHpClass = (ratio: number) => {
    if (ratio > 0.5) return 'hp-bar-fill--high';
    if (ratio > 0.25) return 'hp-bar-fill--mid';
    return 'hp-bar-fill--low';
  };

  const p1Ratio = player1.currentHp / player1.maxHp;
  const p2Ratio = player2.currentHp / player2.maxHp;

  const phaseText = {
    intro: 'READY...',
    attack_select: player1.isAttacker ? 'P1 ATTACKING' : 'P2 ATTACKING',
    defend_select: player1.isAttacker ? 'P2 DEFEND!' : 'P1 DEFEND!',
    animating: '...',
    result: 'RESULT',
    switch_turns: 'SWITCHING...',
    ko: 'K.O.!',
    victory: 'VICTORY!',
  };

  return (
    <div className="hud">
      {/* Player 1 */}
      <div className="hud__player hud__player--left">
        <div className="hud__name-row">
          <span className="hud__name pixel-text-sm" style={{ color: player1.character.color }}>
            {player1.character.name}
          </span>
          <span className="hud__hp-text pixel-text-sm">
            {player1.currentHp}/{player1.maxHp}
          </span>
        </div>
        <div className="hp-bar-container">
          <div
            className={`hp-bar-fill ${getHpClass(p1Ratio)}`}
            style={{ width: `${p1Ratio * 100}%` }}
          />
        </div>
        <div className="hud__archetype pixel-text-sm">
          {player1.character.archetype}
          {player1.isAttacker && <span className="hud__role hud__role--attack">⚔ ATK</span>}
          {!player1.isAttacker && <span className="hud__role hud__role--defend">🛡 DEF</span>}
        </div>
      </div>

      {/* Center Info */}
      <div className="hud__center">
        <div className="hud__turn pixel-text-sm">ROUND {turnCount}</div>
        <div className="hud__phase pixel-text-sm">{phaseText[phase]}</div>
        <div className="hud__vs pixel-text">VS</div>
      </div>

      {/* Player 2 */}
      <div className="hud__player hud__player--right">
        <div className="hud__name-row">
          <span className="hud__hp-text pixel-text-sm">
            {player2.currentHp}/{player2.maxHp}
          </span>
          <span className="hud__name pixel-text-sm" style={{ color: player2.character.color }}>
            {player2.character.name}
          </span>
        </div>
        <div className="hp-bar-container">
          <div
            className={`hp-bar-fill ${getHpClass(p2Ratio)}`}
            style={{ width: `${p2Ratio * 100}%`, marginLeft: 'auto' }}
          />
        </div>
        <div className="hud__archetype pixel-text-sm" style={{ textAlign: 'right' }}>
          {player2.isAttacker && <span className="hud__role hud__role--attack">⚔ ATK</span>}
          {!player2.isAttacker && <span className="hud__role hud__role--defend">🛡 DEF</span>}
          {player2.character.archetype}
        </div>
      </div>
    </div>
  );
}
