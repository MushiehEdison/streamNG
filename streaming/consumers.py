import json
from channels.generic.websocket import AsyncWebsocketConsumer


class StreamSignalingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "main"
        self.room_group_name = f"stream_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"Client connected: {self.channel_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print(f"Client disconnected: {self.channel_name}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "relay_message",
                "message": data,
                "sender": self.channel_name,
            }
        )

    async def relay_message(self, event):
        if event["sender"] != self.channel_name:
            await self.send(text_data=json.dumps(event["message"]))