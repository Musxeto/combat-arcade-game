// App — Root component with screen navigation
import { useState, useCallback } from 'react';
import type { Screen, GameMode } from './config/constants';
import { CHARACTERS } from './config/characters';
import type { Character } from './config/characters';
import { getRandomArena } from './config/arenas';
import type { Arena } from './config/arenas';
import { MainMenu } from './components/MainMenu';
import { CharacterSelect } from './components/CharacterSelect';
import { BattleArena } from './components/BattleArena';
import { ArcadeProgress } from './components/ArcadeProgress';
import { HowToPlay } from './components/HowToPlay';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { OnlineBattle } from './components/OnlineBattle';
import './index.css';

interface OnlineMatchData {
  roomCode: string;
  playerId: string;
  playerName: string;
  p1Char: Character;
  p2Char: Character;
  arenaId: number;
  initialGameState: any;
  initialEvents: any[];
}

interface GameState {
  screen: Screen;
  mode: GameMode;
  playerCharacter: Character | null;
  opponentCharacter: Character | null;
  arena: Arena | null;
  defeatedIds: number[];
  usedArenaIds: number[];
  // VS Local
  player2Character: Character | null;
  vsLocalStep: 'p1_select' | 'p2_select' | 'battle';
  // Online Match
  onlineMatch: OnlineMatchData | null;
}

function App() {
  const [state, setState] = useState<GameState>({
    screen: 'main_menu',
    mode: 'campaign',
    playerCharacter: null,
    opponentCharacter: null,
    arena: null,
    defeatedIds: [],
    usedArenaIds: [],
    player2Character: null,
    vsLocalStep: 'p1_select',
    onlineMatch: null,
  });

  // Navigation
  const navigate = useCallback((screen: Screen, mode?: GameMode) => {
    setState(prev => ({
      ...prev,
      screen,
      mode: mode || prev.mode,
    }));
  }, []);

  // Handle main menu navigation
  const handleMenuNavigate = useCallback((screen: Screen) => {
    if (screen === 'character_select') {
      navigate('character_select', 'campaign');
    } else {
      navigate(screen);
    }
  }, [navigate]);

  // Character select handler
  const handleCharacterSelect = useCallback((character: Character) => {
    setState(prev => {
      if (prev.mode === 'campaign') {
        return {
          ...prev,
          playerCharacter: character,
          defeatedIds: [],
          usedArenaIds: [],
          screen: 'arcade_progress',
        };
      }
      if (prev.mode === 'vs_local') {
        if (prev.vsLocalStep === 'p1_select') {
          return {
            ...prev,
            playerCharacter: character,
            vsLocalStep: 'p2_select',
          };
        } else {
          // P2 selected, start battle
          const arena = getRandomArena();
          return {
            ...prev,
            player2Character: character,
            arena,
            screen: 'battle',
            vsLocalStep: 'battle',
          };
        }
      }
      return prev;
    });
  }, []);

  // Start next fight in arcade mode
  const handleNextFight = useCallback(() => {
    setState(prev => {
      if (!prev.playerCharacter) return prev;

      // Get remaining opponents
      const remainingOpponents = CHARACTERS.filter(
        c => c.id !== prev.playerCharacter!.id && !prev.defeatedIds.includes(c.id)
      );

      if (remainingOpponents.length === 0) return prev;

      // Random opponent + random arena
      const opponent = remainingOpponents[Math.floor(Math.random() * remainingOpponents.length)];
      const arena = getRandomArena(prev.usedArenaIds);

      return {
        ...prev,
        opponentCharacter: opponent,
        arena,
        screen: 'battle',
      };
    });
  }, []);

  // Handle battle end
  const handleBattleEnd = useCallback((winner: 'p1' | 'p2') => {
    setState(prev => {
      if (prev.mode === 'campaign') {
        if (winner === 'p1' && prev.opponentCharacter) {
          // Player won — mark opponent as defeated
          const newDefeatedIds = [...prev.defeatedIds, prev.opponentCharacter.id];
          const newUsedArenaIds = prev.arena ? [...prev.usedArenaIds, prev.arena.id] : prev.usedArenaIds;

          return {
            ...prev,
            defeatedIds: newDefeatedIds,
            usedArenaIds: newUsedArenaIds,
            opponentCharacter: null,
            arena: null,
            screen: 'arcade_progress',
          };
        } else {
          // Player lost — back to arcade progress (can retry)
          return {
            ...prev,
            opponentCharacter: null,
            arena: null,
            screen: 'arcade_progress',
          };
        }
      }

      // VS Local — back to menu
      return {
        ...prev,
        screen: 'main_menu',
        playerCharacter: null,
        player2Character: null,
        vsLocalStep: 'p1_select',
      };
    });
  }, []);

  // Navigate to VS Local mode
  const handleVsLocal = useCallback(() => {
    setState(prev => ({
      ...prev,
      mode: 'vs_local',
      vsLocalStep: 'p1_select',
      playerCharacter: null,
      player2Character: null,
      screen: 'character_select',
    }));
  }, []);

  // Start Online Battle
  const handleStartOnlineBattle = useCallback((matchData: OnlineMatchData) => {
    setState(prev => ({
      ...prev,
      mode: 'online',
      onlineMatch: matchData,
      screen: 'online_battle',
    }));
  }, []);

  // Render current screen
  const renderScreen = () => {
    switch (state.screen) {
      case 'main_menu':
        return (
          <MainMenu
            onNavigate={(screen) => {
              if (screen === 'character_select') {
                navigate('character_select', 'campaign');
              } else if (screen === 'multiplayer_lobby') {
                navigate('multiplayer_lobby', 'online');
              } else {
                navigate(screen);
              }
            }}
          />
        );

      case 'character_select':
        return (
          <CharacterSelect
            onSelect={handleCharacterSelect}
            onBack={() => navigate('main_menu')}
            mode={
              state.mode === 'campaign'
                ? 'campaign'
                : state.vsLocalStep === 'p2_select'
                  ? 'vs_local_p2'
                  : 'vs_local_p1'
            }
            defeatedIds={state.defeatedIds}
            selectedP1={state.mode === 'vs_local' && state.vsLocalStep === 'p2_select' ? state.playerCharacter : null}
          />
        );

      case 'arcade_progress':
        if (!state.playerCharacter) return null;
        return (
          <ArcadeProgress
            playerCharacter={state.playerCharacter}
            defeatedIds={state.defeatedIds}
            onNextFight={handleNextFight}
            onBack={() => navigate('main_menu')}
          />
        );

      case 'battle':
        if (!state.arena) return null;

        if (state.mode === 'campaign' && state.playerCharacter && state.opponentCharacter) {
          return (
            <BattleArena
              player1={state.playerCharacter}
              player2={state.opponentCharacter}
              arena={state.arena}
              isVsAi={true}
              onBattleEnd={handleBattleEnd}
              onBack={() => navigate('arcade_progress')}
            />
          );
        }

        if (state.mode === 'vs_local' && state.playerCharacter && state.player2Character) {
          return (
            <BattleArena
              player1={state.playerCharacter}
              player2={state.player2Character}
              arena={state.arena}
              isVsAi={false}
              onBattleEnd={handleBattleEnd}
              onBack={() => navigate('main_menu')}
            />
          );
        }

        return null;

      case 'multiplayer_lobby':
        return (
          <MultiplayerLobby
            onBack={() => navigate('main_menu')}
            onStartOnlineBattle={handleStartOnlineBattle}
          />
        );

      case 'online_battle':
        if (!state.onlineMatch) return null;
        return (
          <OnlineBattle
            roomCode={state.onlineMatch.roomCode}
            playerId={state.onlineMatch.playerId}
            playerName={state.onlineMatch.playerName}
            player1Char={state.onlineMatch.p1Char}
            player2Char={state.onlineMatch.p2Char}
            arenaId={state.onlineMatch.arenaId}
            initialGameState={state.onlineMatch.initialGameState}
            initialEvents={state.onlineMatch.initialEvents}
            onBackToMenu={() => navigate('main_menu')}
          />
        );

      case 'how_to_play':
        return <HowToPlay onBack={() => navigate('main_menu')} />;

      default:
        return <MainMenu onNavigate={handleMenuNavigate} />;
    }
  };

  return (
    <>
      {renderScreen()}
      <div className="crt-overlay" />
    </>
  );
}

export default App;
