from django.urls import re_path
from .consumers import StreamSignalingConsumer

websocket_urlpatterns = [
    re_path(r'ws/stream/$', StreamSignalingConsumer.as_asgi()),
]