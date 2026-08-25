from typing import Dict, List, Any
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps room_code -> Dict[player_id, WebSocket]
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, room_code: str, player_id: str, websocket: WebSocket):
        await websocket.accept()
        room_code = room_code.upper()
        if room_code not in self.active_connections:
            self.active_connections[room_code] = {}
        self.active_connections[room_code][player_id] = websocket

    def disconnect(self, room_code: str, player_id: str):
        room_code = room_code.upper()
        if room_code in self.active_connections:
            self.active_connections[room_code].pop(player_id, None)
            if not self.active_connections[room_code]:
                del self.active_connections[room_code]

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception:
            pass

    async def send_to_player(self, room_code: str, player_id: str, message: Dict[str, Any]):
        room_code = room_code.upper()
        if room_code in self.active_connections:
            ws = self.active_connections[room_code].get(player_id)
            if ws:
                try:
                    await ws.send_json(message)
                except Exception:
                    pass

    async def broadcast_room(self, room_code: str, message: Dict[str, Any]):
        room_code = room_code.upper()
        if room_code in self.active_connections:
            for ws in list(self.active_connections[room_code].values()):
                try:
                    await ws.send_json(message)
                except Exception:
                    pass
