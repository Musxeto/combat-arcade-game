// All 11 character definitions for The Kanjers

export interface Attack {
  name: string;
  damage: number;
  type: 'punch' | 'kick' | 'heavy' | 'signature';
}

export interface SpecialPower {
  name: string;
  description: string;
  trigger: 'passive' | 'on_hit' | 'on_dodge' | 'on_attack' | 'on_defend';
}

export interface BodyProportions {
  width: number;      // relative width (1 = normal)
  height: number;     // relative height (1 = normal)
  headSize: number;   // relative head size
  armLength: number;  // relative arm length
  legLength: number;  // relative leg length
  bulk: number;       // body thickness
}

export interface Character {
  id: number;
  name: string;
  archetype: string;
  hp: number;
  attacks: Attack[];
  specialPower: SpecialPower;
  color: string;
  colorSecondary: string;
  bodyProportions: BodyProportions;
}

export const CHARACTERS: Character[] = [
  {
    id: 1,
    name: 'Raze',
    archetype: 'Berserker',
    hp: 80,
    attacks: [
      { name: 'Fury Punch', damage: 25, type: 'punch' },
      { name: 'Rage Kick', damage: 20, type: 'kick' },
      { name: 'Wild Slam', damage: 15, type: 'heavy' },
      { name: 'Blood Rush', damage: 30, type: 'signature' },
    ],
    specialPower: {
      name: 'Blood Fury',
      description: 'Gains +5 dmg when below 40% HP',
      trigger: 'on_attack',
    },
    color: '#e53935',
    colorSecondary: '#b71c1c',
    bodyProportions: { width: 1.1, height: 1.0, headSize: 1.0, armLength: 1.1, legLength: 1.0, bulk: 1.15 },
  },
  {
    id: 2,
    name: 'Kova',
    archetype: 'Tank',
    hp: 120,
    attacks: [
      { name: 'Shield Bash', damage: 12, type: 'punch' },
      { name: 'Iron Kick', damage: 15, type: 'kick' },
      { name: 'Guard Crush', damage: 10, type: 'heavy' },
      { name: 'Fortress', damage: 18, type: 'signature' },
    ],
    specialPower: {
      name: 'Iron Wall',
      description: '30% chance to reduce incoming damage by half',
      trigger: 'on_dodge',
    },
    color: '#546e7a',
    colorSecondary: '#37474f',
    bodyProportions: { width: 1.4, height: 1.1, headSize: 0.9, armLength: 0.9, legLength: 0.9, bulk: 1.5 },
  },
  {
    id: 3,
    name: 'Jinx',
    archetype: 'Trickster',
    hp: 85,
    attacks: [
      { name: 'Trick Shot', damage: 18, type: 'punch' },
      { name: 'Feint Kick', damage: 22, type: 'kick' },
      { name: 'Chaos Spin', damage: 14, type: 'heavy' },
      { name: 'Wild Card', damage: 20, type: 'signature' },
    ],
    specialPower: {
      name: 'Misdirect',
      description: 'Swaps attack slots randomly once per fight',
      trigger: 'passive',
    },
    color: '#ab47bc',
    colorSecondary: '#7b1fa2',
    bodyProportions: { width: 0.85, height: 1.0, headSize: 1.1, armLength: 1.0, legLength: 1.05, bulk: 0.8 },
  },
  {
    id: 4,
    name: 'Echo',
    archetype: 'Counter',
    hp: 90,
    attacks: [
      { name: 'Mirror Jab', damage: 15, type: 'punch' },
      { name: 'Reflect Kick', damage: 18, type: 'kick' },
      { name: 'Echo Slam', damage: 20, type: 'heavy' },
      { name: 'Resonance', damage: 16, type: 'signature' },
    ],
    specialPower: {
      name: 'Mirror Strike',
      description: 'If dodged, reflects 10 dmg back to attacker',
      trigger: 'on_dodge',
    },
    color: '#29b6f6',
    colorSecondary: '#0288d1',
    bodyProportions: { width: 0.95, height: 1.05, headSize: 1.0, armLength: 1.05, legLength: 1.0, bulk: 0.95 },
  },
  {
    id: 5,
    name: 'Sage',
    archetype: 'Healer',
    hp: 95,
    attacks: [
      { name: 'Life Tap', damage: 14, type: 'punch' },
      { name: 'Verdant Kick', damage: 16, type: 'kick' },
      { name: 'Nature Strike', damage: 12, type: 'heavy' },
      { name: 'Bloom', damage: 15, type: 'signature' },
    ],
    specialPower: {
      name: 'Mend',
      description: 'Heals 8 HP after each successful attack',
      trigger: 'on_hit',
    },
    color: '#66bb6a',
    colorSecondary: '#388e3c',
    bodyProportions: { width: 0.9, height: 1.05, headSize: 1.05, armLength: 1.1, legLength: 1.0, bulk: 0.85 },
  },
  {
    id: 6,
    name: 'Volt',
    archetype: 'Speedster',
    hp: 75,
    attacks: [
      { name: 'Spark Jab', damage: 20, type: 'punch' },
      { name: 'Thunder Kick', damage: 24, type: 'kick' },
      { name: 'Bolt Strike', damage: 18, type: 'heavy' },
      { name: 'Lightning Rush', damage: 22, type: 'signature' },
    ],
    specialPower: {
      name: 'Lightning Reflex',
      description: 'Gets a hint (eliminates 1 wrong guess) when defending',
      trigger: 'on_defend',
    },
    color: '#fdd835',
    colorSecondary: '#f9a825',
    bodyProportions: { width: 0.8, height: 1.0, headSize: 0.95, armLength: 1.0, legLength: 1.15, bulk: 0.75 },
  },
  {
    id: 7,
    name: 'Grim',
    archetype: 'Brute',
    hp: 110,
    attacks: [
      { name: 'Brute Fist', damage: 22, type: 'punch' },
      { name: 'Stomp', damage: 18, type: 'kick' },
      { name: 'Crushing Blow', damage: 28, type: 'heavy' },
      { name: 'Devastate', damage: 14, type: 'signature' },
    ],
    specialPower: {
      name: 'Crushing Blow',
      description: 'Attack 3 has +10 bonus if enemy HP > 80%',
      trigger: 'on_attack',
    },
    color: '#6d4c41',
    colorSecondary: '#4e342e',
    bodyProportions: { width: 1.5, height: 1.15, headSize: 0.85, armLength: 1.0, legLength: 0.85, bulk: 1.6 },
  },
  {
    id: 8,
    name: 'Nyx',
    archetype: 'Assassin',
    hp: 70,
    attacks: [
      { name: 'Shadow Strike', damage: 28, type: 'punch' },
      { name: 'Phantom Kick', damage: 22, type: 'kick' },
      { name: 'Void Slash', damage: 20, type: 'heavy' },
      { name: 'Execute', damage: 35, type: 'signature' },
    ],
    specialPower: {
      name: 'Execute',
      description: '+15 bonus damage when enemy HP < 25%',
      trigger: 'on_attack',
    },
    color: '#4a148c',
    colorSecondary: '#1a1a2e',
    bodyProportions: { width: 0.75, height: 1.05, headSize: 0.9, armLength: 1.15, legLength: 1.1, bulk: 0.7 },
  },
  {
    id: 9,
    name: 'Atlas',
    archetype: 'Guardian',
    hp: 105,
    attacks: [
      { name: 'Guard Punch', damage: 14, type: 'punch' },
      { name: 'Barrier Kick', damage: 16, type: 'kick' },
      { name: 'Aegis Strike', damage: 12, type: 'heavy' },
      { name: 'Titan Slam', damage: 18, type: 'signature' },
    ],
    specialPower: {
      name: 'Aegis',
      description: 'Blocks 5 flat damage from every incoming hit',
      trigger: 'passive',
    },
    color: '#f57c00',
    colorSecondary: '#e65100',
    bodyProportions: { width: 1.3, height: 1.2, headSize: 0.95, armLength: 0.95, legLength: 0.95, bulk: 1.4 },
  },
  {
    id: 10,
    name: 'Chaos',
    archetype: 'Wildcard',
    hp: 90,
    attacks: [
      { name: 'Random Punch', damage: 0, type: 'punch' },
      { name: 'Random Kick', damage: 0, type: 'kick' },
      { name: 'Random Slam', damage: 0, type: 'heavy' },
      { name: 'Random Burst', damage: 0, type: 'signature' },
    ],
    specialPower: {
      name: 'Dice Roll',
      description: 'Attack damages are randomized each turn (10-30)',
      trigger: 'on_attack',
    },
    color: '#ff1744',
    colorSecondary: '#00e5ff',
    bodyProportions: { width: 1.0, height: 1.0, headSize: 1.1, armLength: 1.0, legLength: 1.0, bulk: 1.0 },
  },
  {
    id: 11,
    name: 'Zenith',
    archetype: 'Champion',
    hp: 100,
    attacks: [
      { name: 'Balanced Strike', damage: 20, type: 'punch' },
      { name: 'Perfect Kick', damage: 20, type: 'kick' },
      { name: 'True Slam', damage: 20, type: 'heavy' },
      { name: 'Apex', damage: 20, type: 'signature' },
    ],
    specialPower: {
      name: 'Perfect Balance',
      description: 'All attacks equal; gains +3 dmg each consecutive hit',
      trigger: 'on_hit',
    },
    color: '#e0e0e0',
    colorSecondary: '#9e9e9e',
    bodyProportions: { width: 1.0, height: 1.1, headSize: 1.0, armLength: 1.0, legLength: 1.0, bulk: 1.05 },
  },
];

export function getCharacterById(id: number): Character | undefined {
  return CHARACTERS.find(c => c.id === id);
}
