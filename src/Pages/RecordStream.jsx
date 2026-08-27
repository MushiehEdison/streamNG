import { useEffect, useRef, useState } from 'react';

export default function RecordStream() {
  const videoRef = useRef();
  const pcRef = useRef();
  const wsRef = useRef();
  const pendingCandidates = useRef([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/stream/');
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('Connected');
      startBroadcast();
    };

    ws.onclose = () => {
      setStatus('Disconnected');
      setIsStreaming(false);
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.answer) {
          await pcRef.current.setRemoteDescription(data.answer);

          // flush any ICE candidates that arrived before the answer
          for (const c of pendingCandidates.current) {
            await pcRef.current.addIceCandidate(c);
          }
          pendingCandidates.current = [];
        } else if (data.ice) {
          if (pcRef.current?.remoteDescription) {
            await pcRef.current.addIceCandidate(data.ice);
          } else {
            pendingCandidates.current.push(data.ice);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    return () => {
      ws.close();
      pcRef.current?.close();
    };
  }, []);

  async function startBroadcast() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      videoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (e) => {
        if (e.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ ice: e.candidate }));
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setIsStreaming(true);
          setStatus('Live');
        } else if (['disconnected', 'failed'].includes(pc.connectionState)) {
          setIsStreaming(false);
          setStatus('Disconnected');
        }
      };

      const offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      });
      await pc.setLocalDescription(offer);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ offer }));
      }
    } catch (error) {
      console.error('Broadcast error:', error);
      setStatus('Error: ' + error.message);
    }
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover block [transform:scaleX(-1)]"
      />

      <div className="absolute top-5 left-0 right-0 flex justify-center pointer-events-none px-5">
        <div className="flex items-center gap-2.5 px-5 py-2.5 bg-black/70 border border-white/20 rounded backdrop-blur-md">
          <span
            className={`w-2 h-2 rounded-full inline-block animate-pulse ${
              isStreaming ? 'bg-black' : 'bg-gray-500'
            }`}
          />
          <span className="text-white text-sm font-light tracking-wide">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}