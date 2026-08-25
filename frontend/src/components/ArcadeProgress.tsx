// Arcade Progress — Defeated opponents tracker for campaign mode
import { CHARACTERS } from '../config/characters';
import type { Character } from '../config/characters';
import './ArcadeProgress.css';

interface ArcadeProgressProps {
  playerCharacter: Character;
  defeatedIds: number[];
  onNextFight: () => void;
  onBack: () => void;
}

export function ArcadeProgress({ playerCharacter, defeatedIds, onNextFight, onBack }: ArcadeProgressProps) {
  const opponents = CHARACTERS.filter(c => c.id !== playerCharacter.id);
  const totalDefeated = defeatedIds.length;
  const totalOpponents = opponents.length;
  const allDefeated = totalDefeated >= totalOpponents;

  return (
    <div className="arcade-progress">
      <div className="arcade-progress__header">
        <button className="neon-btn pixel-text-sm" onClick={onBack}>
          ← MENU
        </button>
        <h1 className="arcade-progress__title pixel-text">ARCADE MODE</h1>
        <div className="arcade-progress__player pixel-text-sm" style={{ color: playerCharacter.color }}>
          {playerCharacter.name}
        </div>
      </div>

      <div className="arcade-progress__counter pixel-text">
        <span className="text-glow-cyan">{totalDefeated}</span>
        <span className="arcade-progress__slash">/</span>
        <span>{totalOpponents}</span>
        <span className="arcade-progress__label pixel-text-sm">DEFEATED</span>
      </div>

      <div className="arcade-progress__grid">
        {opponents.map(char => {
          const isDefeated = defeatedIds.includes(char.id);
          return (
            <div
              key={char.id}
              className={`arcade-progress__card game-card ${isDefeated ? 'arcade-progress__card--defeated' : ''}`}
              style={{ '--char-color': char.color } as React.CSSProperties}
            >
              <span className="arcade-progress__char-name pixel-text-sm" style={{ color: char.color }}>
                {char.name}
              </span>
              <span className="arcade-progress__archetype" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {char.archetype}
              </span>
              {isDefeated && (
                <div className="arcade-progress__defeated-overlay">
                  <span className="arcade-progress__check">✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="arcade-progress__actions">
        {allDefeated ? (
          <div className="arcade-progress__win">
            <h2 className="pixel-text text-glow-cyan" style={{ fontSize: '24px' }}>
              🏆 ARCADE COMPLETE! 🏆
            </h2>
            <p className="pixel-text-sm" style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              {playerCharacter.name} is the champion!
            </p>
            <button className="neon-btn neon-btn--green" onClick={onBack} style={{ marginTop: '16px' }}>
              MAIN MENU
            </button>
          </div>
        ) : (
          <button
            id="next-fight"
            className="neon-btn neon-btn--magenta arcade-progress__next-btn"
            onClick={onNextFight}
          >
            ⚔ NEXT FIGHT ⚔
          </button>
        )}
      </div>
    </div>
  );
}
