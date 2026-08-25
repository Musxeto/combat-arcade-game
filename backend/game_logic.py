import random
from typing import Dict, Any, List, Tuple, Optional
from models import PlayerData, GameState, TurnPhase, BattleEvent, EventType

CHARACTERS_DATA: Dict[int, Dict[str, Any]] = {
    1: {
        "name": "Raze",
        "archetype": "Berserker",
        "hp": 80,
        "attacks": [25, 20, 15, 30],
        "special": "Blood Fury",
    },
    2: {
        "name": "Kova",
        "archetype": "Tank",
        "hp": 120,
        "attacks": [12, 15, 10, 18],
        "special": "Iron Wall",
    },
    3: {
        "name": "Jinx",
        "archetype": "Trickster",
        "hp": 85,
        "attacks": [18, 22, 14, 20],
        "special": "Misdirect",
    },
    4: {
        "name": "Echo",
        "archetype": "Counter",
        "hp": 90,
        "attacks": [15, 18, 20, 16],
        "special": "Mirror Strike",
    },
    5: {
        "name": "Sage",
        "archetype": "Healer",
        "hp": 95,
        "attacks": [14, 16, 12, 15],
        "special": "Mend",
    },
    6: {
        "name": "Volt",
        "archetype": "Speedster",
        "hp": 75,
        "attacks": [20, 24, 18, 22],
        "special": "Lightning Reflex",
    },
    7: {
        "name": "Grim",
        "archetype": "Brute",
        "hp": 110,
        "attacks": [22, 18, 28, 14],
        "special": "Crushing Blow",
    },
    8: {
        "name": "Nyx",
        "archetype": "Assassin",
        "hp": 70,
        "attacks": [28, 22, 20, 35],
        "special": "Execute",
    },
    9: {
        "name": "Atlas",
        "archetype": "Guardian",
        "hp": 105,
        "attacks": [14, 16, 12, 18],
        "special": "Aegis",
    },
    10: {
        "name": "Chaos",
        "archetype": "Wildcard",
        "hp": 90,
        "attacks": [0, 0, 0, 0],
        "special": "Dice Roll",
    },
    11: {
        "name": "Zenith",
        "archetype": "Champion",
        "hp": 100,
        "attacks": [20, 20, 20, 20],
        "special": "Perfect Balance",
    },
}

class ServerGameEngine:
    @staticmethod
    def init_player(player_id: str, name: str, character_id: int, is_attacker: bool) -> PlayerData:
        char_data = CHARACTERS_DATA.get(character_id, CHARACTERS_DATA[1])
        attack_order = [0, 1, 2, 3]
        if char_data["name"] == "Jinx":
            random.shuffle(attack_order)
            
        return PlayerData(
            id=player_id,
            name=name,
            character_id=character_id,
            current_hp=char_data["hp"],
            max_hp=char_data["hp"],
            is_attacker=is_attacker,
            consecutive_hits=0,
            attack_order=attack_order,
        )

    @staticmethod
    def init_game(p1_id: str, p1_name: str, p1_char_id: int,
                  p2_id: str, p2_name: str, p2_char_id: int, arena_id: int) -> Tuple[GameState, List[BattleEvent]]:
        p1 = ServerGameEngine.init_player(p1_id, p1_name, p1_char_id, is_attacker=True)
        p2 = ServerGameEngine.init_player(p2_id, p2_name, p2_char_id, is_attacker=False)
        
        char1_name = CHARACTERS_DATA[p1_char_id]["name"]
        char2_name = CHARACTERS_DATA[p2_char_id]["name"]

        events = [
            BattleEvent(
                type=EventType.INFO,
                message=f"{p1_name} ({char1_name}) vs {p2_name} ({char2_name}) — FIGHT!"
            )
        ]

        if char1_name == "Jinx":
            events.append(BattleEvent(
                type=EventType.SPECIAL,
                message=f"Misdirect! {p1_name}'s attacks have been shuffled!",
                attacker=char1_name
            ))
        if char2_name == "Jinx":
            events.append(BattleEvent(
                type=EventType.SPECIAL,
                message=f"Misdirect! {p2_name}'s attacks have been shuffled!",
                attacker=char2_name
            ))

        game_state = GameState(
            player1=p1,
            player2=p2,
            turn_count=1,
            phase=TurnPhase.ATTACK_SELECT,
            arena_id=arena_id,
        )
        return game_state, events

    @staticmethod
    def execute_attack(game_state: GameState, attack_slot: int) -> Tuple[int, int, List[BattleEvent]]:
        attacker = game_state.player1 if game_state.player1.is_attacker else game_state.player2
        defender = game_state.player2 if game_state.player1.is_attacker else game_state.player1

        char_data = CHARACTERS_DATA[attacker.character_id]
        actual_index = attacker.attack_order[attack_slot % 4]
        damage = char_data["attacks"][actual_index]
        events = []

        # Chaos: Dice Roll
        if char_data["name"] == "Chaos":
            damage = random.randint(10, 30)
            events.append(BattleEvent(
                type=EventType.SPECIAL,
                message=f"Dice Roll! {attacker.name} rolls {damage} damage!",
                attacker=char_data["name"]
            ))

        # Raze: Blood Fury (+5 dmg below 40% HP)
        if char_data["name"] == "Raze" and (attacker.current_hp / attacker.max_hp) < 0.4:
            damage += 5
            events.append(BattleEvent(
                type=EventType.SPECIAL,
                message=f"Blood Fury! {attacker.name} gains +5 damage!",
                attacker=char_data["name"]
            ))

        # Grim: Crushing Blow (attack 3 +10 if enemy HP > 80%)
        if char_data["name"] == "Grim" and actual_index == 2 and (defender.current_hp / defender.max_hp) > 0.8:
            damage += 10
            events.append(BattleEvent(
                type=EventType.SPECIAL,
                message=f"Crushing Blow! {attacker.name} hits hard against high HP!",
                attacker=char_data["name"]
            ))

        # Nyx: Execute (+15 when enemy HP < 25%)
        if char_data["name"] == "Nyx" and (defender.current_hp / defender.max_hp) < 0.25:
            damage += 15
            events.append(BattleEvent(
                type=EventType.SPECIAL,
                message=f"Execute! {attacker.name} strikes for lethal damage!",
                attacker=char_data["name"]
            ))

        # Zenith: Perfect Balance (+3 per consecutive hit)
        if char_data["name"] == "Zenith" and attacker.consecutive_hits > 0:
            bonus = attacker.consecutive_hits * 3
            damage += bonus
            events.append(BattleEvent(
                type=EventType.SPECIAL,
                message=f"Perfect Balance! +{bonus} dmg from combo!",
                attacker=char_data["name"]
            ))

        # Volt hint if defender is Volt
        def_char = CHARACTERS_DATA[defender.character_id]
        volt_hint = None
        if def_char["name"] == "Volt":
            wrong_choices = [i for i in range(4) if i != actual_index]
            volt_hint = random.choice(wrong_choices)

        game_state.current_attack_index = actual_index
        game_state.pending_damage = damage
        game_state.volt_hint = volt_hint
        game_state.phase = TurnPhase.DEFEND_SELECT

        return actual_index, damage, events

    @staticmethod
    def execute_defense(game_state: GameState, guess_index: int) -> Tuple[bool, int, List[BattleEvent]]:
        attacker = game_state.player1 if game_state.player1.is_attacker else game_state.player2
        defender = game_state.player2 if game_state.player1.is_attacker else game_state.player1

        actual_attack = game_state.current_attack_index or 0
        damage = game_state.pending_damage
        dodged = (guess_index == actual_attack)
        final_damage = damage
        events = []

        atk_char = CHARACTERS_DATA[attacker.character_id]
        def_char = CHARACTERS_DATA[defender.character_id]

        if dodged:
            final_damage = 0
            attacker.consecutive_hits = 0
            events.append(BattleEvent(
                type=EventType.DODGE,
                message=f"{defender.name} ({def_char['name']}) DODGED the attack!",
                defender=def_char["name"]
            ))

            # Echo: Mirror Strike (reflects 10 dmg back on dodge)
            if def_char["name"] == "Echo":
                reflect_dmg = 10
                attacker.current_hp = max(0, attacker.current_hp - reflect_dmg)
                events.append(BattleEvent(
                    type=EventType.REFLECT,
                    message=f"Mirror Strike! Reflected {reflect_dmg} damage back to {attacker.name}!",
                    damage=reflect_dmg,
                    defender=def_char["name"]
                ))
                if attacker.current_hp <= 0:
                    game_state.winner_id = defender.id
                    game_state.is_over = True
                    events.append(BattleEvent(
                        type=EventType.KO,
                        message=f"{attacker.name} was KO'd by reflected damage!"
                    ))
        else:
            # Kova: Iron Wall (30% chance to halve damage)
            if def_char["name"] == "Kova" and random.random() < 0.3:
                final_damage = final_damage // 2
                events.append(BattleEvent(
                    type=EventType.SPECIAL,
                    message=f"Iron Wall! {defender.name} halved incoming damage to {final_damage}!",
                    defender=def_char["name"]
                ))

            # Atlas: Aegis (blocks 5 flat damage)
            if def_char["name"] == "Atlas":
                final_damage = max(0, final_damage - 5)
                events.append(BattleEvent(
                    type=EventType.SPECIAL,
                    message=f"Aegis! {defender.name} blocked 5 damage!",
                    defender=def_char["name"]
                ))

            defender.current_hp = max(0, defender.current_hp - final_damage)
            attacker.consecutive_hits += 1

            events.append(BattleEvent(
                type=EventType.HIT,
                message=f"{attacker.name} landed a hit! Dealt {final_damage} damage to {defender.name}!",
                damage=final_damage,
                attacker=atk_char["name"],
                defender=def_char["name"]
            ))

            # Sage: Mend (heals 8 HP after hit)
            if atk_char["name"] == "Sage":
                heal = min(8, attacker.max_hp - attacker.current_hp)
                if heal > 0:
                    attacker.current_hp += heal
                    events.append(BattleEvent(
                        type=EventType.HEAL,
                        message=f"Mend! {attacker.name} healed {heal} HP!",
                        healing=heal,
                        attacker=atk_char["name"]
                    ))

            if defender.current_hp <= 0:
                game_state.winner_id = attacker.id
                game_state.is_over = True
                events.append(BattleEvent(
                    type=EventType.KO,
                    message=f"{defender.name} has been K.O.'d!"
                ))

        game_state.last_damage = final_damage
        game_state.last_dodged = dodged
        game_state.phase = TurnPhase.RESULT

        return dodged, final_damage, events

    @staticmethod
    def switch_turns(game_state: GameState) -> None:
        if game_state.is_over:
            game_state.phase = TurnPhase.VICTORY
            return

        game_state.player1.is_attacker = not game_state.player1.is_attacker
        game_state.player2.is_attacker = not game_state.player2.is_attacker
        game_state.turn_count += 1
        game_state.current_attack_index = None
        game_state.volt_hint = None
        game_state.phase = TurnPhase.ATTACK_SELECT
