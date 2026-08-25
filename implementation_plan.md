# The Kanjers — 2D Arcade Fighting Game

A Tekken-inspired 2D turn-based fighting game with a world map campaign, pixel-art sprite animations, 11 unique characters, and online multiplayer via WebSocket rooms.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | **React (Vite)** | Fast dev, component-based UI for menus/HUD |
| Game Rendering | **HTML5 Canvas + `requestAnimationFrame`** | Performant sprite animation, pixel-art rendering |
| Backend | **Python FastAPI** | Lightweight, async WebSocket support for rooms |
| Multiplayer | **WebSocket rooms** | Real-time turn exchange between two players |
| Styling | **Vanilla CSS** | Full control over arcade aesthetic |

---

## User Review Required

> [!IMPORTANT]
> **Sprite Assets**: The system will be built with a sprite-sheet loader. Initially, characters will use **procedurally-drawn pixel figures on canvas** (blocky colored fighters). You can drop in real `.png` sprite sheets later — the animation system will swap them in seamlessly.

> [!IMPORTANT]
> **Online Multiplayer Scope**: The FastAPI backend handles room creation/joining and turn exchange via WebSockets. This is **NOT** a real-time frame-synced fighter — it's turn-based, so WebSocket latency is perfectly fine. No database or auth is planned for v1.

> [!WARNING]
> **Deployment**: The backend needs to be hosted separately (e.g., Railway, Render, or a VPS). For local dev, both servers run simultaneously. We'll use environment variables for the WebSocket URL.

---

## Open Questions

> [!IMPORTANT]
> **Multiplayer Room System**: For online play, should rooms be:
> - **Quick Match** (auto-matchmake with a random opponent), or
> - **Room Code** (create a room, share a 4-digit code with a friend), or
> - **Both**?

---

## Game Design Document

### Core Gameplay Loop

```
┌─────────────────────────────────────────────┐
│              COMBAT ROUND                    │
│                                              │
│  Attacker picks attack (1-4)  ──────►       │
│  Defender guesses which one   ──────►       │
│                                              │
│  IF guess matches → DODGE (no damage)       │
│  IF guess wrong   → HIT (attack damage)     │
│                                              │
│  Then roles swap.                            │
│  until one player has zero hp left   │ 
└─────────────────────────────────────────────┘
```

### The 11 Characters

| # | Name | Archetype | HP | Attacks (1-4 damage) | Special Power |
|---|------|-----------|-----|---------------------|---------------|
| 1 | **Raze** | Berserker | 80 | 25, 20, 15, 30 | *Blood Fury*: Gains +5 dmg when below 40% HP |
| 2 | **Kova** | Tank | 120 | 12, 15, 10, 18 | *Iron Wall*: 30% chance to reduce incoming damage by half |
| 3 | **Jinx** | Trickster | 85 | 18, 22, 14, 20 | *Misdirect*: Swaps attack slots randomly once per fight |
| 4 | **Echo** | Counter | 90 | 15, 18, 20, 16 | *Mirror Strike*: If dodged, reflects 10 dmg back to attacker |
| 5 | **Sage** | Healer | 95 | 14, 16, 12, 15 | *Mend*: Heals 8 HP after each successful attack |
| 6 | **Volt** | Speedster | 75 | 20, 24, 18, 22 | *Lightning Reflex*: Gets a hint (eliminates 1 wrong guess) when defending |
| 7 | **Grim** | Brute | 110 | 22, 18, 28, 14 | *Crushing Blow*: Attack 3 has +10 bonus if enemy HP > 80% |
| 8 | **Nyx** | Assassin | 70 | 28, 22, 20, 35 | *Execute*: +15 bonus damage when enemy HP < 25% |
| 9 | **Atlas** | Guardian | 105 | 14, 16, 12, 18 | *Aegis*: Blocks 5 flat damage from every incoming hit |
| 10 | **Chaos** | Wildcard | 90 | ??, ??, ??, ?? | *Dice Roll*: Attack damages are randomized each turn (10-30) |
| 11 | **Zenith** | Champion | 100 | 20, 20, 20, 20 | *Perfect Balance*: All attacks equal; gains +3 dmg each consecutive hit |

### Arcade Mode (Single Player Campaign)

- Player picks their fighter
- Fights all 10 other characters in **random order**
- Each fight takes place in a **random arena** (Street Fighter style)
- No world map, no linear progression — pure arcade
- After beating all 10, you win the arcade run
- Progress tracker shows which opponents are defeated

### Arenas (Random Stage Select)

| # | Arena Name | Theme | Background Style |
|---|-----------|-------|------------------|
| 1 | **Neon Alley** | Cyberpunk city | Neon signs, rain, puddle reflections |
| 2 | **Volcano Rim** | Lava / fire | Glowing lava, floating embers |
| 3 | **Frozen Dojo** | Ice temple | Snowfall, icy floor, blue tones |
| 4 | **Rooftop Sunset** | Urban skyline | Orange sky, city silhouette |
| 5 | **Dark Forest** | Haunted woods | Fog, glowing eyes in background |
| 6 | **Colosseum** | Ancient arena | Crowd silhouettes, torches |
| 7 | **Sky Platform** | Floating stage | Clouds below, wind particles |
| 8 | **Underground Lab** | Sci-fi bunker | Screens, sparking wires |
| 9 | **Desert Ruins** | Sandy wasteland | Sandstorm, crumbling pillars |
| 10 | **Temple Gardens** | Zen garden | Cherry blossoms, water |
| 11 | **The Void** | Final stage | Pure black, glowing grid floor |

### Animation System

Each character has these sprite animation states:

| State | Frames | Description |
|-------|--------|-------------|
| `idle` | 4 frames | Breathing/bobbing loop |
| `attack_1` | 6 frames | Punch animation |
| `attack_2` | 6 frames | Kick animation |
| `attack_3` | 8 frames | Heavy/special attack |
| `attack_4` | 8 frames | Signature move |
| `dodge` | 5 frames | Sidestep/duck animation |
| `hit` | 4 frames | Recoil/stagger |
| `victory` | 6 frames | Win pose |
| `defeat` | 5 frames | Knocked out |

**Initial Implementation**: Procedural pixel-art drawn on canvas (colored blocky humanoid shapes with limb animations). Each character gets a unique color palette and proportions matching their archetype.

**Upgrade Path**: Drop `.png` sprite sheets into `/public/sprites/{character}/` with a matching JSON frame-data file → the system auto-loads them.

### Visual Effects

- **Screen shake** on hit
- **Flash white** on impact frame
- **Particle burst** (colored pixels scatter) on hit
- **Slow-motion** on final KO blow
- **HP bar drain animation** (smooth, not instant)
- **Dodge afterimage** (ghost trail on sidestep)
- **Arena-specific backgrounds** per world map node
- **CRT scanline filter** overlay for retro arcade feel

---

## Proposed Changes

### Project Structure

```
d:\tekkenkanj\
├── README.md                          # Full game documentation
├── frontend/                          # React + Vite app
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   │   └── sprites/                   # Sprite sheets (future PNGs)
│   │       └── placeholder/           # Generated placeholder data
│   └── src/
│       ├── main.jsx                   # React entry point
│       ├── App.jsx                    # Router + top-level layout
│       ├── index.css                  # Global styles + design tokens
│       │
│       ├── config/
│       │   ├── characters.js          # All 11 character definitions
│       │   ├── arenas.js              # 11 arena definitions + backgrounds
│       │   └── constants.js           # Game tuning constants
│       │
│       ├── engine/
│       │   ├── GameEngine.js          # Core turn-based combat logic
│       │   ├── SpriteRenderer.js      # Canvas sprite drawing + animation
│       │   ├── ProceduralSprites.js   # Generate pixel-art characters in code
│       │   ├── ParticleSystem.js      # Hit particles, effects
│       │   └── SoundManager.js        # SFX placeholders (hit, dodge, KO)
│       │
│       ├── components/
│       │   ├── MainMenu.jsx           # Title screen
│       │   ├── CharacterSelect.jsx    # Pick your fighter grid
│       │   ├── ArcadeProgress.jsx     # Defeated opponents tracker
│       │   ├── BattleArena.jsx        # The main fight screen (canvas)
│       │   ├── AttackPanel.jsx        # 4 attack buttons for attacker
│       │   ├── DefendPanel.jsx        # 4 guess buttons for defender
│       │   ├── HUD.jsx                # HP bars, turn counter, names
│       │   ├── BattleLog.jsx          # Scrolling combat narration
│       │   ├── ResultScreen.jsx       # Win/Lose screen
│       │   ├── MultiplayerLobby.jsx   # Room create/join UI
│       │   └── OnlineBattle.jsx       # Battle screen for online play
│       │
│       ├── hooks/
│       │   ├── useGameLoop.js         # requestAnimationFrame hook
│       │   ├── useWebSocket.js        # WebSocket connection hook
│       │   └── useBattle.js           # Battle state management
│       │
│       └── utils/
│           ├── spriteLoader.js        # Load & parse sprite sheets
│           └── helpers.js             # Damage calc, RNG, etc.
│
├── backend/                           # Python FastAPI server
│   ├── requirements.txt               # fastapi, uvicorn, websockets
│   ├── main.py                        # FastAPI app entry
│   ├── models.py                      # Pydantic models for game state
│   ├── game_logic.py                  # Server-side combat validation
│   ├── connection_manager.py          # WebSocket room manager
│   └── rooms.py                       # Room CRUD + matchmaking
│
└── .gitignore
```

---

### Frontend — React + Vite

#### [NEW] `frontend/` (initialized via `npx create-vite`)

React app with the following key components:

---

#### [NEW] [`index.css`](file:///d:/tekkenkanj/frontend/src/index.css)
- Dark arcade theme with CRT-style aesthetic
- Custom pixel font imports (Press Start 2P from Google Fonts)
- CSS variables for character color palettes
- Screen shake, flash, and transition animations
- Responsive layout (works on desktop + mobile)
- Neon glow effects for menus and buttons

---

#### [NEW] [`config/characters.js`](file:///d:/tekkenkanj/frontend/src/config/characters.js)
- Exports array of 11 character objects
- Each character: `{ id, name, archetype, hp, attacks: [dmg1-4], specialPower, color, bodyProportions }`
- Used by character select, battle engine, and sprite renderer

#### [NEW] [`config/arenas.js`](file:///d:/tekkenkanj/frontend/src/config/arenas.js)
- Array of 11 arena definitions
- Each arena: `{ id, name, theme, bgColors, particleType, ambientEffect }`
- Random selection each fight (no repeats in a single arcade run)

#### [NEW] [`config/constants.js`](file:///d:/tekkenkanj/frontend/src/config/constants.js)
- `TURNS_PER_PLAYER = 5`
- `CANVAS_WIDTH`, `CANVAS_HEIGHT`
- Animation frame rates, particle counts
- WebSocket URL (from env var)

---

#### [NEW] [`engine/GameEngine.js`](file:///d:/tekkenkanj/frontend/src/engine/GameEngine.js)
- Pure game logic class (no React dependency)
- `startBattle(char1, char2)` → initializes HP, turns
- `executeAttack(attackIndex)` → returns damage value + special power triggers
- `attemptDodge(guessIndex, actualAttack)` → returns hit/dodge result
- `checkSpecialPower(attacker, defender, context)` → applies passive abilities
- `getBattleState()` → current HP, turn count, phase

#### [NEW] [`engine/ProceduralSprites.js`](file:///d:/tekkenkanj/frontend/src/engine/ProceduralSprites.js)
- Draws pixel-art characters directly on canvas using rectangles
- Each character type → different body shape (brute = wide, assassin = slim, etc.)
- Generates all animation frames procedurally:
  - **Idle**: body bobs up/down, arms sway
  - **Attack 1-4**: arm extends (punch), leg swings (kick), full body lunge (heavy), special pose (signature)
  - **Dodge**: body shifts sideways, afterimage trail
  - **Hit**: body recoils backward, flash white
  - **Victory/Defeat**: arms up / collapse

#### [NEW] [`engine/SpriteRenderer.js`](file:///d:/tekkenkanj/frontend/src/engine/SpriteRenderer.js)
- Canvas rendering pipeline
- `drawCharacter(ctx, character, state, frame, x, y, facing)`
- Checks for PNG sprite sheet first → falls back to procedural
- Handles screen shake offset, white flash overlay, particle layer

#### [NEW] [`engine/ParticleSystem.js`](file:///d:/tekkenkanj/frontend/src/engine/ParticleSystem.js)
- Lightweight particle emitter for hit effects
- Colored pixel particles that burst outward and fade
- Dust puffs for dodge, sparks for block

---

#### [NEW] [`components/MainMenu.jsx`](file:///d:/tekkenkanj/frontend/src/components/MainMenu.jsx)
- Animated title "THE KANJERS" with pixel font + glow
- Arcade-style menu: `CAMPAIGN` / `VS LOCAL` / `ONLINE` / `HOW TO PLAY`
- Background: animated pixel cityscape or fighting silhouettes
- Retro CRT scanline overlay

#### [NEW] [`components/CharacterSelect.jsx`](file:///d:/tekkenkanj/frontend/src/components/CharacterSelect.jsx)
- Grid of 11 character portraits (canvas-rendered previews)
- Hover → shows stats (HP, attack range, special power description)
- Click → selects with arcade "CHOOSE YOUR FIGHTER" voice-style text
- In campaign mode: greyed-out defeated enemies
- In VS/Online: both players pick

#### [NEW] [`components/ArcadeProgress.jsx`](file:///d:/tekkenkanj/frontend/src/components/ArcadeProgress.jsx)
- Shows grid of 10 opponent portraits
- Defeated opponents crossed out / greyed
- "X/10 defeated" counter
- "NEXT FIGHT" button picks random remaining opponent + random arena

#### [NEW] [`components/BattleArena.jsx`](file:///d:/tekkenkanj/frontend/src/components/BattleArena.jsx)
- Main game canvas: two fighters facing each other
- Arena-specific background (parallax pixel art)
- Renders both characters with current animation state
- Particle effects layer on top
- Integrates with HUD overlay

#### [NEW] [`components/AttackPanel.jsx`](file:///d:/tekkenkanj/frontend/src/components/AttackPanel.jsx)
- 4 attack buttons with names/icons per character
- Shows damage value for each attack
- Arcade-style button press animation
- Disabled during opponent's turn

#### [NEW] [`components/DefendPanel.jsx`](file:///d:/tekkenkanj/frontend/src/components/DefendPanel.jsx)
- 4 guess buttons labeled 1-4
- "PREDICT THE ATTACK!" header
- Timer pressure (optional: 5 second countdown)
- Visual feedback on correct/wrong guess

#### [NEW] [`components/HUD.jsx`](file:///d:/tekkenkanj/frontend/src/components/HUD.jsx)
- Character names + portraits at top
- Animated HP bars with damage drain
- Turn counter: "ROUND 3/5"
- Phase indicator: "ATTACKING" / "DEFENDING"
- Special power status indicator

#### [NEW] [`components/BattleLog.jsx`](file:///d:/tekkenkanj/frontend/src/components/BattleLog.jsx)
- Scrolling text log of combat events
- "RAZE used FURY PUNCH! 25 damage!"
- "KOVA DODGED the attack!"
- Color-coded by event type

#### [NEW] [`components/MultiplayerLobby.jsx`](file:///d:/tekkenkanj/frontend/src/components/MultiplayerLobby.jsx)
- Create Room → generates 4-character room code
- Join Room → enter code + connect
- Waiting room with "Waiting for opponent..." animation
- Character select phase once both players join

#### [NEW] [`components/OnlineBattle.jsx`](file:///d:/tekkenkanj/frontend/src/components/OnlineBattle.jsx)
- Same battle UI as local, but actions sent via WebSocket
- "Waiting for opponent..." overlay during their turn
- Connection status indicator
- Auto-reconnect on disconnect

---

#### [NEW] [`hooks/useGameLoop.js`](file:///d:/tekkenkanj/frontend/src/hooks/useGameLoop.js)
- `requestAnimationFrame` loop with delta time
- Calls sprite renderer each frame
- Manages animation state transitions

#### [NEW] [`hooks/useWebSocket.js`](file:///d:/tekkenkanj/frontend/src/hooks/useWebSocket.js)
- Connects to FastAPI WebSocket endpoint
- Handles room join/create messages
- Sends/receives turn actions as JSON
- Auto-reconnect with exponential backoff

#### [NEW] [`hooks/useBattle.js`](file:///d:/tekkenkanj/frontend/src/hooks/useBattle.js)
- React state management for a battle
- Wraps `GameEngine` with React state
- Manages phase transitions (attack → animate → result → switch)

---

### Backend — FastAPI + WebSockets

#### [NEW] [`backend/main.py`](file:///d:/tekkenkanj/backend/main.py)
- FastAPI app with CORS middleware
- WebSocket endpoint: `ws://host/ws/{room_id}/{player_id}`
- REST endpoints:
  - `POST /rooms` → create room, returns `{ room_id }`
  - `GET /rooms/{room_id}` → room status (waiting/full/in-game)
- Health check endpoint

#### [NEW] [`backend/connection_manager.py`](file:///d:/tekkenkanj/backend/connection_manager.py)
- `ConnectionManager` class
- `active_rooms: Dict[str, Room]` — maps room codes to room objects
- `connect(ws, room_id, player_id)` → accept + register
- `disconnect(ws, room_id)` → cleanup
- `send_to_player(room_id, player_id, message)` → targeted message
- `broadcast(room_id, message)` → send to both players

#### [NEW] [`backend/rooms.py`](file:///d:/tekkenkanj/backend/rooms.py)
- Room lifecycle management
- `create_room()` → generates unique 4-char code
- `join_room(room_id, player_id)` → validates room exists & not full
- Room states: `WAITING` → `CHARACTER_SELECT` → `IN_GAME` → `FINISHED`

#### [NEW] [`backend/game_logic.py`](file:///d:/tekkenkanj/backend/game_logic.py)
- Server-side validation of moves
- Prevents cheating (validates attack index 1-4, checks turn order)
- Calculates damage with special powers
- Determines winner

#### [NEW] [`backend/models.py`](file:///d:/tekkenkanj/backend/models.py)
- Pydantic models:
  - `Player(id, character_id, hp, is_attacker)`
  - `GameState(players, current_turn, phase, round_number)`
  - `AttackAction(player_id, attack_index)`
  - `DefendAction(player_id, guess_index)`
  - `GameEvent(type, data, timestamp)`

---

### Root Files

#### [MODIFY] [`README.md`](file:///d:/tekkenkanj/README.md)
- Full game documentation (will be updated with the complete plan below)

#### [NEW] [`.gitignore`](file:///d:/tekkenkanj/.gitignore)
- Standard React + Python ignores
- `node_modules/`, `__pycache__/`, `.env`, `dist/`, `venv/`

---

## Verification Plan

### Automated Tests
```bash
# Frontend: build check
cd frontend && npm run build

# Backend: startup check  
cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000

# WebSocket test
# Connect two browser tabs to same room, verify turn exchange
```

### Manual Verification
1. **Main Menu** → all 4 options navigate correctly
2. **Character Select** → all 11 characters render with unique visuals and stats
3. **Arcade Mode** → random opponents, random arenas, progress tracker works
4. **Battle** → full 10-turn fight plays out with animations, damage, special powers
5. **Online Multiplayer** → create room in tab 1, join with code in tab 2, play full match
6. **Animations** → idle, attack, dodge, hit, victory, defeat all play smoothly
7. **Visual Effects** → screen shake, particles, HP drain animation all fire correctly

---

## Build Order (Execution Phases)

### Phase 1: Foundation
1. Initialize Vite + React project
2. Set up global CSS (arcade theme, fonts, design tokens)
3. Create character config + game constants
4. Build `GameEngine` (pure logic, no UI)

### Phase 2: Core UI
5. `MainMenu` with navigation
6. `CharacterSelect` screen
7. `BattleArena` canvas setup
8. `HUD` (HP bars, turn counter)

### Phase 3: Animation Engine
9. `ProceduralSprites` — draw all 11 characters
10. `SpriteRenderer` — animation state machine
11. `ParticleSystem` — hit/dodge effects
12. `useGameLoop` hook — animation frame loop

### Phase 4: Battle Flow
13. `AttackPanel` + `DefendPanel` — player input
14. `useBattle` hook — state management
15. `BattleLog` — combat narration
16. `ResultScreen` — win/lose

### Phase 5: Arcade Mode
17. `ArcadeProgress` — defeated tracker
18. Random opponent + random arena selection
19. Arena procedural backgrounds (11 themes)

### Phase 6: Online Multiplayer
20. FastAPI backend setup
21. `ConnectionManager` + `Room` system
22. `useWebSocket` hook
23. `MultiplayerLobby` — create/join rooms
24. `OnlineBattle` — networked gameplay

### Phase 7: Polish
25. Sound effects (optional placeholders)
26. CRT overlay filter
27. Screen transitions
28. Final testing + bug fixes
