import string
import random
from typing import Dict, Optional, Tuple
from models import Room, RoomStatus, GameState

class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, Room] = {}

    def generate_code(self, length: int = 4) -> str:
        chars = string.ascii_uppercase + string.digits
        while True:
            code = "".join(random.choice(chars) for _ in range(length))
            if code not in self.rooms:
                return code

    def create_room(self, host_id: str, host_name: str) -> Room:
        code = self.generate_code()
        room = Room(
            code=code,
            status=RoomStatus.WAITING,
            host_id=host_id,
            player1_id=host_id,
            player_names={host_id: host_name}
        )
        self.rooms[code] = room
        return room

    def join_room(self, code: str, player_id: str, player_name: str) -> Tuple[Optional[Room], Optional[str]]:
        code = code.upper()
        if code not in self.rooms:
            return None, "Room not found."
        
        room = self.rooms[code]
        if player_id in room.player_names:
            # Reconnecting player
            room.player_names[player_id] = player_name
            return room, None

        if room.player2_id is not None:
            return None, "Room is full."

        room.player2_id = player_id
        room.player_names[player_id] = player_name
        room.status = RoomStatus.CHARACTER_SELECT
        return room, None

    def get_room(self, code: str) -> Optional[Room]:
        return self.rooms.get(code.upper())

    def remove_player(self, code: str, player_id: str) -> Optional[Room]:
        code = code.upper()
        if code not in self.rooms:
            return None
        room = self.rooms[code]
        
        # If host leaves and nobody else, delete room
        if player_id == room.host_id:
            if room.player2_id:
                # Promote player 2 to host
                room.host_id = room.player2_id
                room.player1_id = room.player2_id
                room.player2_id = None
                room.status = RoomStatus.WAITING
                room.game_state = None
                return room
            else:
                del self.rooms[code]
                return None
        elif player_id == room.player2_id:
            room.player2_id = None
            room.status = RoomStatus.WAITING
            room.game_state = None
            return room

        return room
