import type { Character } from '../config/characters';
import { soundManager } from '../engine/SoundManager';
import './AttackPanel.css';

interface AttackPanelProps {
  character: Character;
  onAttack: (index: number) => void;
  disabled: boolean;
}

export function AttackPanel({ character, onAttack, disabled }: AttackPanelProps) {
  const attackColors = ['var(--neon-cyan)', 'var(--neon-green)', 'var(--neon-yellow)', 'var(--neon-magenta)'];
  const attackIcons = ['👊', '🦶', '💥', '⚡'];

  return (
    <div className={`attack-panel ${disabled ? 'attack-panel--disabled' : ''}`}>
      <h3 className="attack-panel__title pixel-text-sm">
        {disabled ? 'WAIT...' : 'CHOOSE YOUR ATTACK!'}
      </h3>
      <div className="attack-panel__buttons">
        {character.attacks.map((atk, i) => (
          <button
            key={i}
            id={`attack-${i + 1}`}
            className="attack-panel__btn"
            style={{ '--atk-color': attackColors[i] } as React.CSSProperties}
            onClick={() => {
              soundManager.playSelect();
              onAttack(i);
            }}
            disabled={disabled}
          >
            <span className="attack-panel__icon">{attackIcons[i]}</span>
            <span className="attack-panel__name pixel-text-sm">{atk.name}</span>
            <span className="attack-panel__damage pixel-text-sm">
              {character.name === 'Chaos' ? '??' : atk.damage} DMG
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
