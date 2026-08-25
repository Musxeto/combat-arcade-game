// How To Play — Game instructions screen
import './HowToPlay.css';

interface HowToPlayProps {
  onBack: () => void;
}

export function HowToPlay({ onBack }: HowToPlayProps) {
  return (
    <div className="how-to-play">
      <div className="how-to-play__header">
        <button className="neon-btn pixel-text-sm" onClick={onBack}>
          ← BACK
        </button>
        <h1 className="how-to-play__title pixel-text">HOW TO PLAY</h1>
        <div style={{ width: 80 }} />
      </div>

      <div className="how-to-play__content">
        <section className="how-to-play__section game-card">
          <h2 className="pixel-text-sm text-glow-cyan">⚔ COMBAT SYSTEM</h2>
          <p>This is a <strong>turn-based fighting game</strong>. Each round:</p>
          <ol>
            <li>The <strong>attacker</strong> picks one of 4 attacks</li>
            <li>The <strong>defender</strong> tries to <strong>predict</strong> which attack was chosen</li>
            <li>If the defender guesses correctly → <span style={{ color: 'var(--neon-green)' }}>DODGE!</span> (no damage)</li>
            <li>If the defender guesses wrong → <span style={{ color: 'var(--neon-red)' }}>HIT!</span> (attack damage applied)</li>
            <li>Roles swap and the fight continues until one fighter's HP reaches 0</li>
          </ol>
        </section>

        <section className="how-to-play__section game-card">
          <h2 className="pixel-text-sm text-glow-magenta">✨ SPECIAL POWERS</h2>
          <p>Each of the 11 fighters has a <strong>unique special ability</strong> that triggers automatically:</p>
          <ul>
            <li><strong>Raze</strong> — Blood Fury: +5 damage below 40% HP</li>
            <li><strong>Kova</strong> — Iron Wall: 30% chance to halve incoming damage</li>
            <li><strong>Jinx</strong> — Misdirect: Attack slots are shuffled once per fight</li>
            <li><strong>Echo</strong> — Mirror Strike: Reflects 10 damage on successful dodge</li>
            <li><strong>Sage</strong> — Mend: Heals 8 HP after each successful hit</li>
            <li><strong>Volt</strong> — Lightning Reflex: Eliminates 1 wrong guess when defending</li>
            <li><strong>Grim</strong> — Crushing Blow: Attack 3 deals +10 vs healthy enemies</li>
            <li><strong>Nyx</strong> — Execute: +15 damage when enemy HP is below 25%</li>
            <li><strong>Atlas</strong> — Aegis: Blocks 5 flat damage from every hit</li>
            <li><strong>Chaos</strong> — Dice Roll: All attack damages randomized (10-30)</li>
            <li><strong>Zenith</strong> — Perfect Balance: +3 damage per consecutive hit</li>
          </ul>
        </section>

        <section className="how-to-play__section game-card">
          <h2 className="pixel-text-sm" style={{ color: 'var(--neon-yellow)', textShadow: '0 0 10px rgba(255, 230, 0, 0.5)' }}>
            🎮 GAME MODES
          </h2>
          <ul>
            <li><strong>Campaign</strong> — Fight all 10 opponents in random order. Beat them all to win!</li>
            <li><strong>VS Local</strong> — Two players on the same device, alternating turns</li>
            <li><strong>Online</strong> — Create or join a room to battle a friend over the internet</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
