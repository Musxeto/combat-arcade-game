// Result Screen — Win/Lose display after battle
import type { Character } from '../config/characters';
import './ResultScreen.css';

interface ResultScreenProps {
  winner: Character;
  loser: Character;
  isPlayerWin: boolean;
  onContinue: () => void;
  onRematch?: () => void;
  mode: 'campaign' | 'vs_local' | 'online';
}

export function ResultScreen({ winner, loser, isPlayerWin, onContinue, onRematch, mode }: ResultScreenProps) {
  return (
    <div className="result-screen">
      <div className="result-screen__backdrop" />

      <div className="result-screen__content">
        {/* Result header */}
        <div className={`result-screen__header ${isPlayerWin ? 'result-screen__header--win' : 'result-screen__header--lose'}`}>
          <h1 className="result-screen__title pixel-text-xl">
            {isPlayerWin ? 'VICTORY!' : 'DEFEAT'}
          </h1>
          <div className="result-screen__subtitle pixel-text-sm">
            {isPlayerWin
              ? `${winner.name} wins the battle!`
              : `${loser.name} has been defeated...`
            }
          </div>
        </div>

        {/* Character display */}
        <div className="result-screen__fighters">
          <div className="result-screen__fighter result-screen__fighter--winner">
            <div
              className="result-screen__fighter-glow"
              style={{ background: winner.color + '20', borderColor: winner.color }}
            />
            <span className="pixel-text" style={{ color: winner.color }}>
              {winner.name}
            </span>
            <span className="result-screen__label pixel-text-sm text-glow-cyan">WINNER</span>
          </div>

          <div className="result-screen__vs pixel-text">VS</div>

          <div className="result-screen__fighter result-screen__fighter--loser">
            <span className="pixel-text" style={{ color: loser.color, opacity: 0.5 }}>
              {loser.name}
            </span>
            <span className="result-screen__label pixel-text-sm" style={{ color: 'var(--neon-red)' }}>K.O.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="result-screen__actions">
          <button
            id="result-continue"
            className="neon-btn neon-btn--green"
            onClick={onContinue}
          >
            {mode === 'campaign' ? (isPlayerWin ? 'NEXT FIGHT' : 'TRY AGAIN') : 'CONTINUE'}
          </button>
          {onRematch && (
            <button
              id="result-rematch"
              className="neon-btn neon-btn--yellow"
              onClick={onRematch}
            >
              REMATCH
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
