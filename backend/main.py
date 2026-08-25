import random
from typing import Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models import Room, RoomStatus, TurnPhase
from rooms import RoomManager
from connection_manager import ConnectionManager
from game_logic import ServerGameEngine

app = FastAPI(title="The Kanjers Arcade Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

room_manager = RoomManager()
manager = ConnectionManager()

# Store selected characters during selection phase: room_code -> {player_id: char_id}
selected_characters: Dict[str, Dict[str, int]] = {}

class CreateRoomRequest(BaseModel):
    player_id: str
    player_name: str = "Player 1"

class JoinRoomRequest(BaseModel):
    code: str
    player_id: str
    player_name: str = "Player 2"

@app.get("/")
def root():
    return {"message": "The Kanjers Arcade Game Backend Running"}

@app.get("/health")
def health():
    return {"status": "ok", "active_rooms": len(room_manager.rooms)}

@app.post("/api/rooms")
def create_room(req: CreateRoomRequest):
    room = room_manager.create_room(req.player_id, req.player_name)
    selected_characters[room.code] = {}
    return {"code": room.code, "room": room.dict()}

@app.post("/api/rooms/join")
def join_room(req: JoinRoomRequest):
    room, err = room_manager.join_room(req.code, req.player_id, req.player_name)
    if err:
        raise HTTPException(status_code=400, detail=err)
    return {"code": room.code, "room": room.dict()}

@app.get("/api/rooms/{code}")
def get_room(code: str):
    room = room_manager.get_room(code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"code": room.code, "room": room.dict()}

@app.websocket("/ws/{room_code}/{player_id}")
async def websocket_endpoint(websocket: WebSocket, room_code: str, player_id: str):
    room_code = room_code.upper()
    await manager.connect(room_code, player_id, websocket)

    room = room_manager.get_room(room_code)
    if not room:
        await websocket.send_json({"type": "error", "message": "Room not found"})
        await websocket.close()
        return

    # Notify room about connection
    await manager.broadcast_room(room_code, {
        "type": "room_update",
        "data": room.dict()
    })

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            payload = data.get("data", {})

            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})

            elif msg_type == "select_character":
                char_id = payload.get("character_id")
                if room_code not in selected_characters:
                    selected_characters[room_code] = {}
                selected_characters[room_code][player_id] = char_id

                # Broadcast selection update
                await manager.broadcast_room(room_code, {
                    "type": "character_selected",
                    "data": {
                        "player_id": player_id,
                        "character_id": char_id,
                        "selections": selected_characters[room_code]
                    }
                })

                # If both players selected characters, start the match
                if (room.player1_id in selected_characters[room_code] and
                    room.player2_id in selected_characters[room_code]):
                    
                    p1_id = room.player1_id
                    p2_id = room.player2_id
                    p1_name = room.player_names.get(p1_id, "Player 1")
                    p2_name = room.player_names.get(p2_id, "Player 2")
                    p1_char = selected_characters[room_code][p1_id]
                    p2_char = selected_characters[room_code][p2_id]
                    arena_id = random.randint(1, 11)

                    game_state, events = ServerGameEngine.init_game(
                        p1_id, p1_name, p1_char,
                        p2_id, p2_name, p2_char,
                        arena_id
                    )
                    room.game_state = game_state
                    room.status = RoomStatus.IN_GAME

                    await manager.broadcast_room(room_code, {
                        "type": "game_start",
                        "data": {
                            "game_state": game_state.dict(),
                            "events": [e.dict() for e in events],
                            "arena_id": arena_id
                        }
                    })

            elif msg_type == "attack":
                if not room.game_state or room.game_state.is_over:
                    continue
                
                # Verify sender is attacker
                attacker = room.game_state.player1 if room.game_state.player1.is_attacker else room.game_state.player2
                if attacker.id != player_id:
                    await websocket.send_json({"type": "error", "message": "Not your turn to attack!"})
                    continue

                slot = payload.get("attack_slot", 0)
                actual_idx, dmg, events = ServerGameEngine.execute_attack(room.game_state, slot)

                # Send attack event to both players (animates attacker)
                await manager.broadcast_room(room_code, {
                    "type": "attack_executed",
                    "data": {
                        "attacker_id": player_id,
                        "attack_slot": slot,
                        "actual_index": actual_idx,
                        "damage": dmg,
                        "volt_hint": room.game_state.volt_hint,
                        "phase": room.game_state.phase.value,
                        "events": [e.dict() for e in events]
                    }
                })

            elif msg_type == "defend":
                if not room.game_state or room.game_state.is_over:
                    continue

                # Verify sender is defender
                defender = game_state_defender = room.game_state.player2 if room.game_state.player1.is_attacker else room.game_state.player1
                if defender.id != player_id:
                    await websocket.send_json({"type": "error", "message": "Not your turn to defend!"})
                    continue

                guess = payload.get("guess_index", 0)
                dodged, final_dmg, events = ServerGameEngine.execute_defense(room.game_state, guess)

                # Broadcast defense result (animates hit/dodge)
                await manager.broadcast_room(room_code, {
                    "type": "defense_resolved",
                    "data": {
                        "defender_id": player_id,
                        "guess_index": guess,
                        "dodged": dodged,
                        "damage": final_dmg,
                        "game_state": room.game_state.dict(),
                        "events": [e.dict() for e in events]
                    }
                })

            elif msg_type == "switch_turns":
                if room.game_state and not room.game_state.is_over:
                    ServerGameEngine.switch_turns(room.game_state)
                    await manager.broadcast_room(room_code, {
                        "type": "turn_switched",
                        "data": {
                            "game_state": room.game_state.dict()
                        }
                    })

            elif msg_type == "rematch":
                if room_code in selected_characters:
                    selected_characters[room_code] = {}
                room.status = RoomStatus.CHARACTER_SELECT
                room.game_state = None
                await manager.broadcast_room(room_code, {
                    "type": "rematch_start",
                    "data": room.dict()
                })

    except WebSocketDisconnect:
        manager.disconnect(room_code, player_id)
        room_after = room_manager.remove_player(room_code, player_id)
        if room_after:
            await manager.broadcast_room(room_code, {
                "type": "player_left",
                "data": {
                    "player_id": player_id,
                    "room": room_after.dict()
                }
            })
