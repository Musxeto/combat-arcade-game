import { CHARACTERS } from '../config/characters';
import type { Character } from '../config/characters';
import { API_URL, WS_URL } from '../config/constants';
import { useWebSocket } from '../hooks/useWebSocket';
import { CharacterSelect } from './CharacterSelect';
import './MultiplayerLobby.css';

interface MultiplayerLobbyProps {
  onBack: () => void;
  onStartOnlineBattle: (params: {
    roomCode: string;
    playerId: string;
    playerName: string;
    p1Char: Character;
    p2Char: Character;
    arenaId: number;
    initialGameState: any;
    initialEvents: any[];
  }) => void;
}

export function MultiplayerLobby({ onBack, onStartOnlineBattle }: MultiplayerLobbyProps) {
  const [playerId] = useState(() => 'p_' + Math.random().toString(36).substring(2, 9));
  const [playerName, setPlayerName] = useState(() => 'Fighter_' + Math.floor(Math.random() * 900 + 100));
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [opponentSelected, setOpponentSelected] = useState(false);

  const wsUrl = activeRoomCode
    ? `${WS_URL}/${activeRoomCode}/${playerId}`
    : null;

  const { isConnected, lastMessage, sendMessage, connectionError } = useWebSocket(wsUrl);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'room_update':
        setRoomData(lastMessage.data);
        break;

      case 'character_selected':
        const selections = lastMessage.data?.selections || {};
        const otherPlayerId = Object.keys(selections).find(id => id !== playerId);
        if (otherPlayerId && selections[otherPlayerId]) {
          setOpponentSelected(true);
        }
        break;

      case 'game_start':
        const { game_state, events, arena_id } = lastMessage.data;
        const p1Char = CHARACTERS.find(c => c.id === game_state.player1.character_id) || CHARACTERS[0];
        const p2Char = CHARACTERS.find(c => c.id === game_state.player2.character_id) || CHARACTERS[1];

        onStartOnlineBattle({
          roomCode: activeRoomCode!,
          playerId,
          playerName,
          p1Char,
          p2Char,
          arenaId: arena_id || 1,
          initialGameState: game_state,
          initialEvents: events,
        });
        break;

      case 'player_left':
        setErrorMsg('Opponent disconnected.');
        setRoomData(lastMessage.data?.room || null);
        setSelectedCharacter(null);
        setOpponentSelected(false);
        break;

      case 'error':
        setErrorMsg(lastMessage.message || 'Room error');
        break;
    }
  }, [lastMessage, playerId, playerName, activeRoomCode, onStartOnlineBattle]);

  const handleCreateRoom = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId, player_name: playerName }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveRoomCode(data.code);
        setRoomData(data.room);
      } else {
        setErrorMsg(data.detail || 'Could not create room.');
      }
    } catch (e: any) {
      setErrorMsg(`Could not connect to backend at ${API_URL}. Make sure FastAPI is running on port 8001.`);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCodeInput.trim()) {
      setErrorMsg('Please enter a 4-character room code.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const code = roomCodeInput.trim().toUpperCase();
      const res = await fetch(`${API_URL}/api/rooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, player_id: playerId, player_name: playerName }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveRoomCode(data.code);
        setRoomData(data.room);
      } else {
        setErrorMsg(data.detail || 'Could not join room.');
      }
    } catch (e: any) {
      setErrorMsg(`Could not connect to backend at ${API_URL}. Make sure FastAPI is running on port 8001.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    sendMessage('select_character', { character_id: character.id });
  };

  // If in room and both players present, show character selection
  if (activeRoomCode && roomData && (roomData.player2_id || roomData.status === 'CHARACTER_SELECT')) {
    return (
      <div className="multiplayer-lobby">
        <div className="multiplayer-lobby__status-bar">
          <span className="pixel-text-sm text-glow-cyan">ROOM: {activeRoomCode}</span>
          <span className="pixel-text-sm text-glow-magenta">
            {selectedCharacter
              ? (opponentSelected ? 'FIGHT STARTING...' : 'WAITING FOR OPPONENT...')
              : 'CHOOSE YOUR FIGHTER'}
          </span>
        </div>
        <CharacterSelect
          onSelect={handleCharacterSelect}
          onBack={() => {
            setActiveRoomCode(null);
            setRoomData(null);
            setSelectedCharacter(null);
          }}
          mode="campaign"
        />
      </div>
    );
  }

  return (
    <div className="multiplayer-lobby">
      <div className="multiplayer-lobby__header">
        <button className="neon-btn pixel-text-sm" onClick={onBack}>
          ← MENU
        </button>
        <h1 className="multiplayer-lobby__title pixel-text">ONLINE MULTIPLAYER</h1>
        <div style={{ width: 80 }} />
      </div>

      <div className="multiplayer-lobby__content">
        {/* Name input */}
        <div className="multiplayer-lobby__card game-card">
          <label className="pixel-text-sm text-glow-cyan">FIGHTER NAME</label>
          <input
            type="text"
            className="multiplayer-lobby__input"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={16}
          />
        </div>

        {errorMsg && (
          <div className="multiplayer-lobby__error pixel-text-sm">
            ⚠ {errorMsg}
          </div>
        )}

        {!activeRoomCode ? (
          <div className="multiplayer-lobby__grid">
            {/* Create Room */}
            <div className="multiplayer-lobby__card game-card">
              <h2 className="pixel-text-sm text-glow-magenta">HOST MATCH</h2>
              <p className="multiplayer-lobby__desc">
                Create a room code and share it with a friend.
              </p>
              <button
                className="neon-btn neon-btn--magenta"
                onClick={handleCreateRoom}
                disabled={loading}
              >
                {loading ? 'CREATING...' : 'CREATE ROOM'}
              </button>
            </div>

            {/* Join Room */}
            <div className="multiplayer-lobby__card game-card">
              <h2 className="pixel-text-sm text-glow-cyan">JOIN MATCH</h2>
              <p className="multiplayer-lobby__desc">
                Enter the 4-digit code provided by your rival.
              </p>
              <div className="multiplayer-lobby__join-row">
                <input
                  type="text"
                  className="multiplayer-lobby__input multiplayer-lobby__input--code"
                  placeholder="CODE"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <button
                  className="neon-btn"
                  onClick={handleJoinRoom}
                  disabled={loading}
                >
                  JOIN
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Waiting Room */
          <div className="multiplayer-lobby__waiting game-card">
            <h2 className="pixel-text-sm text-glow-yellow">ROOM CODE</h2>
            <div className="multiplayer-lobby__code pixel-text-lg text-glow-cyan">
              {activeRoomCode}
            </div>
            <p className="multiplayer-lobby__status pixel-text-sm">
              {isConnected ? '⚡ WAITING FOR PLAYER 2 TO JOIN...' : 'Connecting...'}
            </p>
            <div className="multiplayer-lobby__spinner" />
            <button
              className="neon-btn neon-btn--red"
              style={{ marginTop: '16px' }}
              onClick={() => {
                setActiveRoomCode(null);
                setRoomData(null);
              }}
            >
              LEAVE ROOM
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
