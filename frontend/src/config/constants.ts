// Game constants and tuning values

// Canvas dimensions
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

// Animation
export const SPRITE_FRAME_RATE = 10;       // frames per second for sprite animations
export const IDLE_FRAMES = 4;
export const ATTACK_FRAMES = 6;
export const HEAVY_ATTACK_FRAMES = 8;
export const DODGE_FRAMES = 5;
export const HIT_FRAMES = 4;
export const VICTORY_FRAMES = 6;
export const DEFEAT_FRAMES = 5;

// Particle system
export const MAX_PARTICLES = 100;
export const HIT_PARTICLE_COUNT = 20;
export const DODGE_PARTICLE_COUNT = 8;

// Game tuning
export const AI_THINK_DELAY_MS = 800;      // delay before AI picks attack/defense
export const PHASE_TRANSITION_DELAY = 1200; // ms between phases
export const HIT_PAUSE_DURATION = 400;      // slow-mo on hit
export const KO_SLOW_MO_DURATION = 1500;    // slow-mo on final KO

// Character sizing on canvas
export const CHAR_BASE_WIDTH = 60;
export const CHAR_BASE_HEIGHT = 100;
export const CHAR_SCALE = 2.5;

// Positions on canvas
export const P1_X = 200;
export const P2_X = 760;
export const GROUND_Y = 400;

// Backend API & WebSocket
export const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '8001';
export const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:${BACKEND_PORT}`;
export const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:${BACKEND_PORT}/ws`;

// Game modes
export type GameMode = 'campaign' | 'vs_local' | 'online';

// Battle phases
export type BattlePhase =
  | 'intro'
  | 'attack_select'
  | 'defend_select'
  | 'animating'
  | 'result'
  | 'switch_turns'
  | 'ko'
  | 'victory';

// Animation states
export type AnimationState =
  | 'idle'
  | 'attack_1'
  | 'attack_2'
  | 'attack_3'
  | 'attack_4'
  | 'dodge'
  | 'hit'
  | 'victory'
  | 'defeat';

// Screen states
export type Screen =
  | 'main_menu'
  | 'character_select'
  | 'arcade_progress'
  | 'battle'
  | 'result'
  | 'multiplayer_lobby'
  | 'online_battle'
  | 'how_to_play';
