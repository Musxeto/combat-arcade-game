// Battle Log — Scrolling combat narration
import { useRef, useEffect } from 'react';
import type { BattleEvent } from '../engine/GameEngine';
import './BattleLog.css';

interface BattleLogProps {
  events: BattleEvent[];
}

export function BattleLog({ events }: BattleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length]);

  const getEventColor = (type: BattleEvent['type']): string => {
    switch (type) {
      case 'hit': return 'var(--neon-red)';
      case 'dodge': return 'var(--neon-green)';
      case 'special': return 'var(--neon-magenta)';
      case 'heal': return 'var(--neon-green)';
      case 'reflect': return 'var(--neon-cyan)';
      case 'ko': return 'var(--neon-yellow)';
      case 'info': return 'var(--text-secondary)';
      default: return 'var(--text-primary)';
    }
  };

  const getEventIcon = (type: BattleEvent['type']): string => {
    switch (type) {
      case 'hit': return '💥';
      case 'dodge': return '💨';
      case 'special': return '✨';
      case 'heal': return '💚';
      case 'reflect': return '🪞';
      case 'ko': return '☠️';
      case 'info': return '📢';
      default: return '•';
    }
  };

  // Show only last 6 events
  const visibleEvents = events.slice(-6);

  return (
    <div className="battle-log" ref={scrollRef}>
      {visibleEvents.map((event, i) => (
        <div
          key={events.length - visibleEvents.length + i}
          className="battle-log__entry"
          style={{
            color: getEventColor(event.type),
            opacity: 0.5 + (i / visibleEvents.length) * 0.5,
          }}
        >
          <span className="battle-log__icon">{getEventIcon(event.type)}</span>
          <span className="battle-log__text pixel-text-sm">{event.message}</span>
        </div>
      ))}
    </div>
  );
}
