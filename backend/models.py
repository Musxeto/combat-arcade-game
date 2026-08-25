from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

class RoomStatus(str, Enum):
    WAITING = "WAITING"
    CHARACTER_SELECT = "CHARACTER_SELECT"
    IN_GAME = "IN_GAME"
    FINISHED = "FINISHED"

class TurnPhase(str, Enum):
    ATTACK_SELECT = "attack_select"
    DEFEND_SELECT = "defend_select"
    ANIMATING = "animating"
    RESULT = "result"
    KO = "ko"
    VICTORY = "victory"

class EventType(str, Enum):
    INFO = "info"
    HIT = "hit"
    DODGE = "dodge"
    SPECIAL = "special"
    HEAL = "heal"
    REFLECT = "reflect"
    KO = "ko"

class BattleEvent(BaseModel):
    type: EventType
    message: string = Field(..., alias="message") if False else str
    damage: Optional[int] = None
    healing: Optional[int] = None
    attacker: Optional[str] = None
    defender: Optional[str] = None

class PlayerData(BaseModel):
    id: str
    name: str = "Player"
    character_id: Optional[int] = None
    current_hp: int = 100
    max_hp: int = 100
    is_attacker: bool = False
    consecutive_hits: int = 0
    attack_order: List[int] = [0, 1, 2, 3]

class GameState(BaseModel):
    player1: Optional[PlayerData] = None
    player2: Optional[PlayerData] = None
    turn_count: int = 1
    phase: TurnPhase = TurnPhase.ATTACK_SELECT
    arena_id: int = 1
    current_attack_index: Optional[int] = None
    pending_damage: int = 0
    last_damage: int = 0
    last_dodged: bool = False
    volt_hint: Optional[int] = None
    winner_id: Optional[str] = None
    is_over: bool = False

class Room(BaseModel):
    code: str
    status: RoomStatus = RoomStatus.WAITING
    host_id: str
    player1_id: Optional[str] = None
    player2_id: Optional[str] = None
    player_names: Dict[str, str] = Field(default_factory=dict)
    game_state: Optional[GameState] = None

class WSMessage(BaseModel):
    type: str
    data: Optional[Dict[str, Any]] = None
