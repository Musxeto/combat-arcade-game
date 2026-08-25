// Arena definitions for The Kanjers
// Each arena has a procedural background drawn on canvas

export interface ArenaParticle {
  type: 'rain' | 'embers' | 'snow' | 'leaves' | 'fog' | 'dust' | 'sparks' | 'clouds' | 'sand' | 'petals' | 'grid';
  color: string;
  count: number;
  speed: number;
}

export interface Arena {
  id: number;
  name: string;
  theme: string;
  bgGradient: [string, string, string];  // top, middle, bottom colors
  groundColor: string;
  ambientColor: string;
  particle: ArenaParticle;
  elements: string[];  // descriptive tags for procedural bg elements
}

export const ARENAS: Arena[] = [
  {
    id: 1,
    name: 'Neon Alley',
    theme: 'Cyberpunk city',
    bgGradient: ['#0d0221', '#150734', '#1a0a3e'],
    groundColor: '#1a1a2e',
    ambientColor: '#ff00e5',
    particle: { type: 'rain', color: 'rgba(0, 245, 255, 0.4)', count: 80, speed: 6 },
    elements: ['neon_signs', 'buildings', 'puddles'],
  },
  {
    id: 2,
    name: 'Volcano Rim',
    theme: 'Lava / fire',
    bgGradient: ['#1a0000', '#330000', '#661a00'],
    groundColor: '#2d1100',
    ambientColor: '#ff6600',
    particle: { type: 'embers', color: 'rgba(255, 100, 0, 0.8)', count: 40, speed: 2 },
    elements: ['lava_flow', 'rocks', 'smoke'],
  },
  {
    id: 3,
    name: 'Frozen Dojo',
    theme: 'Ice temple',
    bgGradient: ['#0a1628', '#142d4c', '#1a3a5c'],
    groundColor: '#a8d8ea',
    ambientColor: '#80d4ff',
    particle: { type: 'snow', color: 'rgba(255, 255, 255, 0.7)', count: 60, speed: 1.5 },
    elements: ['ice_pillars', 'dojo_roof', 'frozen_floor'],
  },
  {
    id: 4,
    name: 'Rooftop Sunset',
    theme: 'Urban skyline',
    bgGradient: ['#ff6b35', '#ff8c42', '#ffd166'],
    groundColor: '#2d2d2d',
    ambientColor: '#ff8c42',
    particle: { type: 'dust', color: 'rgba(255, 200, 100, 0.3)', count: 20, speed: 0.5 },
    elements: ['city_silhouette', 'sun', 'clouds'],
  },
  {
    id: 5,
    name: 'Dark Forest',
    theme: 'Haunted woods',
    bgGradient: ['#0a0f0a', '#1a2e1a', '#0d1f0d'],
    groundColor: '#1a1a0e',
    ambientColor: '#39ff14',
    particle: { type: 'fog', color: 'rgba(100, 200, 100, 0.15)', count: 15, speed: 0.3 },
    elements: ['trees', 'glowing_eyes', 'mushrooms'],
  },
  {
    id: 6,
    name: 'Colosseum',
    theme: 'Ancient arena',
    bgGradient: ['#1a1408', '#2e2210', '#3d2e14'],
    groundColor: '#c4a35a',
    ambientColor: '#ff9800',
    particle: { type: 'dust', color: 'rgba(200, 170, 100, 0.3)', count: 25, speed: 0.8 },
    elements: ['arches', 'crowd_silhouettes', 'torches'],
  },
  {
    id: 7,
    name: 'Sky Platform',
    theme: 'Floating stage',
    bgGradient: ['#1a237e', '#42a5f5', '#90caf9'],
    groundColor: '#455a64',
    ambientColor: '#64b5f6',
    particle: { type: 'clouds', color: 'rgba(255, 255, 255, 0.3)', count: 10, speed: 0.4 },
    elements: ['floating_rocks', 'clouds_below', 'wind_lines'],
  },
  {
    id: 8,
    name: 'Underground Lab',
    theme: 'Sci-fi bunker',
    bgGradient: ['#0d0d1a', '#1a1a2e', '#1f1f3d'],
    groundColor: '#263238',
    ambientColor: '#00e5ff',
    particle: { type: 'sparks', color: 'rgba(0, 229, 255, 0.6)', count: 30, speed: 3 },
    elements: ['screens', 'wires', 'pipes'],
  },
  {
    id: 9,
    name: 'Desert Ruins',
    theme: 'Sandy wasteland',
    bgGradient: ['#ff8f00', '#e6a23c', '#c4956a'],
    groundColor: '#d4a76a',
    ambientColor: '#ffab40',
    particle: { type: 'sand', color: 'rgba(210, 170, 100, 0.5)', count: 50, speed: 4 },
    elements: ['pillars', 'ruins', 'tumbleweeds'],
  },
  {
    id: 10,
    name: 'Temple Gardens',
    theme: 'Zen garden',
    bgGradient: ['#1b2631', '#2e4053', '#566573'],
    groundColor: '#5d6d7e',
    ambientColor: '#f8bbd0',
    particle: { type: 'petals', color: 'rgba(255, 150, 180, 0.7)', count: 35, speed: 1 },
    elements: ['cherry_tree', 'water', 'stones'],
  },
  {
    id: 11,
    name: 'The Void',
    theme: 'Final stage',
    bgGradient: ['#000000', '#050510', '#000000'],
    groundColor: '#0a0a1a',
    ambientColor: '#b54aff',
    particle: { type: 'grid', color: 'rgba(181, 74, 255, 0.3)', count: 0, speed: 0 },
    elements: ['grid_floor', 'void_particles', 'energy_pillars'],
  },
];

/**
 * Get a random arena, optionally excluding already-used arenas.
 */
export function getRandomArena(excludeIds: number[] = []): Arena {
  const available = ARENAS.filter(a => !excludeIds.includes(a.id));
  if (available.length === 0) return ARENAS[Math.floor(Math.random() * ARENAS.length)];
  return available[Math.floor(Math.random() * available.length)];
}
