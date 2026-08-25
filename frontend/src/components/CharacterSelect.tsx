// Character Select — Pick your fighter grid
import { useState, useRef, useEffect, useCallback } from 'react';
import { CHARACTERS } from '../config/characters';
import type { Character } from '../config/characters';
import type { Screen } from '../config/constants';
import { drawCharacterPreview } from '../engine/ProceduralSprites';
import './CharacterSelect.css';

interface CharacterSelectProps {
  onSelect: (character: Character) => void;
  onBack: () => void;
  mode: 'campaign' | 'vs_local_p1' | 'vs_local_p2';
  defeatedIds?: number[];
  selectedP1?: Character | null;
}

export function CharacterSelect({ onSelect, onBack, mode, defeatedIds = [], selectedP1 }: CharacterSelectProps) {
  const [hoveredChar, setHoveredChar] = useState<Character | null>(null);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  const title = mode === 'vs_local_p2' ? 'PLAYER 2 — CHOOSE YOUR FIGHTER' : 'CHOOSE YOUR FIGHTER';

  // Draw character previews
  useEffect(() => {
    for (const char of CHARACTERS) {
      const canvas = canvasRefs.current.get(char.id);
      if (!canvas) continue;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCharacterPreview(ctx, char, canvas.width / 2, canvas.height * 0.75, 1.8);
    }
  }, []);

  const setCanvasRef = useCallback((id: number, el: HTMLCanvasElement | null) => {
    if (el) {
      canvasRefs.current.set(id, el);
    }
  }, []);

  const handleSelect = (char: Character) => {
    setSelectedChar(char);
    // Flash effect then confirm
    setTimeout(() => {
      onSelect(char);
    }, 600);
  };

  return (
    <div className="char-select">
      <div className="char-select__header">
        <button className="char-select__back neon-btn pixel-text-sm" onClick={onBack}>
          ← BACK
        </button>
        <h1 className="char-select__title pixel-text">{title}</h1>
        {selectedP1 && (
          <div className="char-select__p1-info pixel-text-sm">
            P1: {selectedP1.name}
          </div>
        )}
      </div>

      <div className="char-select__grid">
        {CHARACTERS.map(char => {
          const isDefeated = defeatedIds.includes(char.id);
          const isSelected = selectedChar?.id === char.id;
          const isP1Selected = selectedP1?.id === char.id;

          return (
            <button
              key={char.id}
              id={`char-${char.name.toLowerCase()}`}
              className={`char-select__card game-card ${isSelected ? 'char-select__card--selected' : ''} ${isDefeated ? 'char-select__card--defeated' : ''} ${isP1Selected ? 'char-select__card--p1-taken' : ''}`}
              style={{ '--char-color': char.color } as React.CSSProperties}
              onMouseEnter={() => setHoveredChar(char)}
              onMouseLeave={() => setHoveredChar(null)}
              onClick={() => !isDefeated && !isP1Selected && handleSelect(char)}
              disabled={isDefeated || isP1Selected}
            >
              <canvas
                ref={(el) => setCanvasRef(char.id, el)}
                width={80}
                height={100}
                className="char-select__preview"
              />
              <span className="char-select__name pixel-text-sm">{char.name}</span>
              {isDefeated && <span className="char-select__defeated-badge">✕</span>}
              {isP1Selected && <span className="char-select__p1-badge pixel-text-sm">P1</span>}
            </button>
          );
        })}
      </div>

      {/* Character Info Panel */}
      <div className={`char-select__info ${hoveredChar ? 'char-select__info--visible' : ''}`}>
        {hoveredChar && (
          <>
            <div className="char-select__info-header">
              <h2 className="pixel-text" style={{ color: hoveredChar.color }}>
                {hoveredChar.name}
              </h2>
              <span className="char-select__archetype pixel-text-sm">
                {hoveredChar.archetype}
              </span>
            </div>

            <div className="char-select__stats">
              <div className="char-select__stat">
                <span className="pixel-text-sm">HP</span>
                <div className="hp-bar-container" style={{ width: '200px', height: '12px' }}>
                  <div
                    className="hp-bar-fill hp-bar-fill--high"
                    style={{ width: `${(hoveredChar.hp / 120) * 100}%` }}
                  />
                </div>
                <span className="pixel-text-sm">{hoveredChar.hp}</span>
              </div>

              <div className="char-select__attacks">
                {hoveredChar.attacks.map((atk, i) => (
                  <div key={i} className="char-select__attack pixel-text-sm">
                    <span>{atk.name}</span>
                    <span className="text-glow-cyan">
                      {hoveredChar.name === 'Chaos' ? '??' : atk.damage}
                    </span>
                  </div>
                ))}
              </div>

              <div className="char-select__special">
                <span className="pixel-text-sm text-glow-magenta">
                  ★ {hoveredChar.specialPower.name}
                </span>
                <p className="char-select__special-desc">
                  {hoveredChar.specialPower.description}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
