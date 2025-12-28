from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
import json

class ConnectionManager:
    def __init__(self):
        # group_id -> List[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, group_id: str):
        await websocket.accept()
        if group_id not in self.active_connections:
            self.active_connections[group_id] = []
        self.active_connections[group_id].append(websocket)
        print(f"WebSocket Connected: Group {group_id}, Total connections: {len(self.active_connections[group_id])}")

    def disconnect(self, websocket: WebSocket, group_id: str):
        if group_id in self.active_connections:
            if websocket in self.active_connections[group_id]:
                self.active_connections[group_id].remove(websocket)
                print(f"WebSocket Disconnected: Group {group_id}, Remaining: {len(self.active_connections[group_id])}")
            if not self.active_connections[group_id]:
                del self.active_connections[group_id]

    async def broadcast(self, group_id: str, message: dict):
        if group_id in self.active_connections:
            # Iterate over a copy in case connections drop during broadcast
            for connection in self.active_connections[group_id][:]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    print(f"Error broadcasting to client in group {group_id}: {e}")
                    # Optionally disconnect broken connections here
                    # self.disconnect(connection, group_id)


    async def close_group(self, group_id: str):
        if group_id in self.active_connections:
            # Create a copy of the list to iterate safely while modifying
            for connection in self.active_connections[group_id][:]:
                try:
                    await connection.close(code=1000, reason="Session Expired")
                except Exception as e:
                    print(f"Error closing connection in group {group_id}: {e}")
            
            # Ensure the group is removed from active connections
            if group_id in self.active_connections:
                del self.active_connections[group_id]
            print(f"Closed all connections for group {group_id}")

manager = ConnectionManager()
