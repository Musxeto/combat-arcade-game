import type { Character } from '../config/characters';

export interface BattleEvent {
  type: 'hit' | 'dodge' | 'special' | 'heal' | 'reflect' | 'ko' | 'info';
  message: string;
  damage?: number;
  healing?: number;
  attacker?: string;
  defender?: string;
}

export interface PlayerState {
  character: Character;
  currentHp: number;
  maxHp: number;
  isAttacker: boolean;
  consecutiveHits: number;
  misdirectUsed: boolean;
  // Shuffled attack indices for Jinx's Misdirect
  attackOrder: number[];
}

export interface BattleState {
  player1: PlayerState;
  player2: PlayerState;
  turnCount: number;
  phase: 'attack_select' | 'defend_select' | 'animating' | 'result' | 'ko';
  events: BattleEvent[];
  winner: PlayerState | null;
  isOver: boolean;
  currentAttackIndex: number | null;
  lastDamage: number;
  lastDodged: boolean;
}

export class GameEngine {
  private player1: PlayerState;
  private player2: PlayerState;
  private turnCount: number;
  private events: BattleEvent[];
  private winner: PlayerState | null;
  private currentAttackIndex: number | null;
  private lastDamage: number;
  private lastDodged: boolean;

  constructor(char1: Character, char2: Character) {
    this.player1 = this.createPlayerState(char1, true);
    this.player2 = this.createPlayerState(char2, false);
    this.turnCount = 1;
    this.events = [];
    this.winner = null;
    this.currentAttackIndex = null;
    this.lastDamage = 0;
    this.lastDodged = false;
  }

  private createPlayerState(character: Character, isAttacker: boolean): PlayerState {
    return {
      character,
      currentHp: character.hp,
      maxHp: character.hp,
      isAttacker,
      consecutiveHits: 0,
      misdirectUsed: false,
      attackOrder: [0, 1, 2, 3],
    };
  }

  /**
   * Start a new battle — reset state
   */
  startBattle(): BattleState {
    this.events = [{
      type: 'info',
      message: `${this.player1.character.name} vs ${this.player2.character.name} — FIGHT!`,
    }];

    // If Jinx is playing, shuffle attack order once
    this.applyMisdirect(this.player1);
    this.applyMisdirect(this.player2);

    return this.getBattleState();
  }

  /**
   * Attacker picks an attack (0-3 index).
   * Returns the actual attack index (after Misdirect shuffling).
   */
  executeAttack(attackIndex: number): { actualIndex: number; damage: number; events: BattleEvent[] } {
    const attacker = this.getAttacker();
    const defender = this.getDefender();
    const newEvents: BattleEvent[] = [];

    // Resolve actual attack via shuffle order (for Jinx's Misdirect)
    const actualIndex = attacker.attackOrder[attackIndex];

    // Get base damage
    let damage = attacker.character.attacks[actualIndex].damage;

    // Chaos: randomize damage
    if (attacker.character.name === 'Chaos') {
      damage = Math.floor(Math.random() * 21) + 10; // 10-30
      newEvents.push({
        type: 'special',
        message: `Dice Roll! ${attacker.character.name}'s attack deals ${damage} damage!`,
        attacker: attacker.character.name,
      });
    }

    // Raze: Blood Fury (+5 dmg below 40% HP)
    if (attacker.character.name === 'Raze' && attacker.currentHp / attacker.maxHp < 0.4) {
      damage += 5;
      newEvents.push({
        type: 'special',
        message: `Blood Fury! ${attacker.character.name} rages for +5 damage!`,
        attacker: attacker.character.name,
      });
    }

    // Grim: Crushing Blow (attack 3 +10 if enemy HP > 80%)
    if (attacker.character.name === 'Grim' && actualIndex === 2 && defender.currentHp / defender.maxHp > 0.8) {
      damage += 10;
      newEvents.push({
        type: 'special',
        message: `Crushing Blow! ${attacker.character.name} hits harder against a healthy foe!`,
        attacker: attacker.character.name,
      });
    }

    // Nyx: Execute (+15 when enemy HP < 25%)
    if (attacker.character.name === 'Nyx' && defender.currentHp / defender.maxHp < 0.25) {
      damage += 15;
      newEvents.push({
        type: 'special',
        message: `Execute! ${attacker.character.name} senses the kill!`,
        attacker: attacker.character.name,
      });
    }

    // Zenith: Perfect Balance (+3 per consecutive hit)
    if (attacker.character.name === 'Zenith' && attacker.consecutiveHits > 0) {
      const bonus = attacker.consecutiveHits * 3;
      damage += bonus;
      newEvents.push({
        type: 'special',
        message: `Perfect Balance! +${bonus} dmg from ${attacker.consecutiveHits} consecutive hits!`,
        attacker: attacker.character.name,
      });
    }

    this.currentAttackIndex = actualIndex;
    this.events.push(...newEvents);

    return { actualIndex, damage, events: newEvents };
  }

  /**
   * Defender guesses which attack (0-3).
   * Returns whether it was a dodge or hit, plus the final damage.
   */
  attemptDodge(guessIndex: number, actualAttack: number, attackDamage: number): {
    dodged: boolean;
    finalDamage: number;
    events: BattleEvent[];
  } {
    const attacker = this.getAttacker();
    const defender = this.getDefender();
    const newEvents: BattleEvent[] = [];
    const dodged = guessIndex === actualAttack;
    let finalDamage = attackDamage;

    if (dodged) {
      // DODGE
      finalDamage = 0;
      attacker.consecutiveHits = 0;
      newEvents.push({
        type: 'dodge',
        message: `${defender.character.name} DODGED the attack!`,
        defender: defender.character.name,
      });

      // Echo: Mirror Strike (reflects 10 dmg back on dodge)
      if (defender.character.name === 'Echo') {
        const reflectDmg = 10;
        attacker.currentHp = Math.max(0, attacker.currentHp - reflectDmg);
        newEvents.push({
          type: 'reflect',
          message: `Mirror Strike! ${defender.character.name} reflects ${reflectDmg} damage!`,
          damage: reflectDmg,
          defender: defender.character.name,
        });

        if (attacker.currentHp <= 0) {
          this.winner = defender;
          newEvents.push({
            type: 'ko',
            message: `${attacker.character.name} was KO'd by reflected damage!`,
          });
        }
      }
    } else {
      // HIT
      // Kova: Iron Wall (30% chance to halve damage)
      if (defender.character.name === 'Kova' && Math.random() < 0.3) {
        finalDamage = Math.floor(finalDamage / 2);
        newEvents.push({
          type: 'special',
          message: `Iron Wall! ${defender.character.name} reduces damage to ${finalDamage}!`,
          defender: defender.character.name,
        });
      }

      // Atlas: Aegis (blocks 5 flat damage)
      if (defender.character.name === 'Atlas') {
        finalDamage = Math.max(0, finalDamage - 5);
        newEvents.push({
          type: 'special',
          message: `Aegis! ${defender.character.name} blocks 5 damage!`,
          defender: defender.character.name,
        });
      }

      // Apply damage
      defender.currentHp = Math.max(0, defender.currentHp - finalDamage);
      attacker.consecutiveHits++;

      const attackName = attacker.character.attacks[actualAttack].name;
      newEvents.push({
        type: 'hit',
        message: `${attacker.character.name} used ${attackName}! ${finalDamage} damage!`,
        damage: finalDamage,
        attacker: attacker.character.name,
        defender: defender.character.name,
      });

      // Sage: Mend (heals 8 HP after successful attack)
      if (attacker.character.name === 'Sage') {
        const healAmount = Math.min(8, attacker.maxHp - attacker.currentHp);
        if (healAmount > 0) {
          attacker.currentHp += healAmount;
          newEvents.push({
            type: 'heal',
            message: `Mend! ${attacker.character.name} heals ${healAmount} HP!`,
            healing: healAmount,
            attacker: attacker.character.name,
          });
        }
      }

      // Check KO
      if (defender.currentHp <= 0) {
        this.winner = attacker;
        newEvents.push({
          type: 'ko',
          message: `${defender.character.name} has been KO'd!`,
        });
      }
    }

    this.lastDamage = finalDamage;
    this.lastDodged = dodged;
    this.events.push(...newEvents);
    return { dodged, finalDamage, events: newEvents };
  }

  /**
   * Volt's special: returns a hint (one wrong attack index to eliminate)
   */
  getVoltHint(actualAttackIndex: number): number {
    const wrongIndices = [0, 1, 2, 3].filter(i => i !== actualAttackIndex);
    return wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
  }

  /**
   * Switch attacker/defender roles, increment turn
   */
  switchTurns(): void {
    this.player1.isAttacker = !this.player1.isAttacker;
    this.player2.isAttacker = !this.player2.isAttacker;
    this.turnCount++;
    this.currentAttackIndex = null;
  }

  /**
   * Get the current attacker
   */
  getAttacker(): PlayerState {
    return this.player1.isAttacker ? this.player1 : this.player2;
  }

  /**
   * Get the current defender
   */
  getDefender(): PlayerState {
    return this.player1.isAttacker ? this.player2 : this.player1;
  }

  /**
   * Apply Jinx's Misdirect — shuffle attack order once per fight
   */
  private applyMisdirect(player: PlayerState): void {
    if (player.character.name === 'Jinx' && !player.misdirectUsed) {
      player.attackOrder = this.shuffleArray([0, 1, 2, 3]);
      player.misdirectUsed = true;
      this.events.push({
        type: 'special',
        message: `Misdirect! ${player.character.name}'s attacks have been shuffled!`,
        attacker: player.character.name,
      });
    }
  }

  private shuffleArray<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get full battle state snapshot
   */
  getBattleState(): BattleState {
    return {
      player1: { ...this.player1 },
      player2: { ...this.player2 },
      turnCount: this.turnCount,
      phase: this.winner ? 'ko' : 'attack_select',
      events: [...this.events],
      winner: this.winner ? { ...this.winner } : null,
      isOver: this.winner !== null,
      currentAttackIndex: this.currentAttackIndex,
      lastDamage: this.lastDamage,
      lastDodged: this.lastDodged,
    };
  }
}
