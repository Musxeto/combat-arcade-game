// Defend Panel — 4 guess buttons for the defender
import { useState, useEffect, useRef } from 'react';
import { soundManager } from '../engine/SoundManager';
import './DefendPanel.css';

interface DefendPanelProps {
  onDefend: (guessIndex: number) => void;
  disabled: boolean;
  voltHint: number | null; // Index to eliminate (Volt's special)
  timerEnabled?: boolean;
  timerDuration?: number; // seconds
}

export function DefendPanel({ onDefend, disabled, voltHint, timerEnabled = false, timerDuration = 5 }: DefendPanelProps) {
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!timerEnabled || disabled) return;

    setTimeLeft(timerDuration);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up — random guess
          clearInterval(timerRef.current);
          const randomGuess = Math.floor(Math.random() * 4);
          onDefend(randomGuess);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timerEnabled, disabled, timerDuration]);

  const handleSelect = (index: number) => {
    soundManager.playSelect();
    if (timerRef.current) clearInterval(timerRef.current);
    onDefend(index);
  };

  const guessLabels = ['ATK 1', 'ATK 2', 'ATK 3', 'ATK 4'];
  const guessColors = ['var(--neon-cyan)', 'var(--neon-green)', 'var(--neon-yellow)', 'var(--neon-magenta)'];

  return (
    <div className={`defend-panel ${disabled ? 'defend-panel--disabled' : ''}`}>
      <h3 className="defend-panel__title pixel-text-sm">
        {disabled ? 'WAIT...' : 'PREDICT THE ATTACK!'}
      </h3>

      {timerEnabled && !disabled && (
        <div className={`defend-panel__timer pixel-text ${timeLeft <= 2 ? 'defend-panel__timer--urgent' : ''}`}>
          {timeLeft}
        </div>
      )}

      {voltHint !== null && !disabled && (
        <div className="defend-panel__hint pixel-text-sm">
          ⚡ Lightning Reflex: It's NOT {guessLabels[voltHint]}!
        </div>
      )}

      <div className="defend-panel__buttons">
        {guessLabels.map((label, i) => {
          const isEliminated = voltHint === i;
          return (
            <button
              key={i}
              id={`defend-${i + 1}`}
              className={`defend-panel__btn ${isEliminated ? 'defend-panel__btn--eliminated' : ''}`}
              style={{ '--def-color': guessColors[i] } as React.CSSProperties}
              onClick={() => handleSelect(i)}
              disabled={disabled || isEliminated}
            >
              <span className="defend-panel__label pixel-text-sm">{label}</span>
              <span className="defend-panel__icon">🛡</span>
              {isEliminated && <span className="defend-panel__x">✕</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
