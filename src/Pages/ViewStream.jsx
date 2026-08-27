import { useEffect, useRef, useState } from 'react';

export default function ViewStream() {
  const videoRef = useRef();
  const pcRef = useRef();
  const wsRef = useRef();
  const pendingCandidates = useRef([]);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/stream/');
    wsRef.current = ws;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    pcRef.current = pc;

    ws.onopen = () => setStatus('Connected');
    ws.onclose = () => {
      setStatus('Disconnected');
      setIsConnected(false);
    };

    pc.ontrack = (e) => {
      videoRef.current.srcObject = e.streams[0];
      setIsConnected(true);
      setStatus('Live');
    };

    pc.oniceconnectionstatechange = () => {
      if (['disconnected', 'failed'].includes(pc.iceConnectionState)) {
        setIsConnected(false);
        setStatus('Disconnected');
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ ice: e.candidate }));
      }
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.offer) {
          await pc.setRemoteDescription(data.offer);

          // flush any ICE candidates that arrived before the offer
          for (const c of pendingCandidates.current) {
            await pc.addIceCandidate(c);
          }
          pendingCandidates.current = [];

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ answer }));
          }
        } else if (data.ice) {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(data.ice);
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
      pc.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain block"
      />

      <div className="absolute top-5 left-0 right-0 flex justify-center pointer-events-none px-5">
        <div className="flex items-center gap-2.5 px-5 py-2.5 bg-black/70 border border-white/20 rounded backdrop-blur-md">
          <span
            className={`w-2 h-2 rounded-full inline-block animate-pulse ${
              isConnected ? 'bg-black' : 'bg-gray-500'
            }`}
          />
          <span className="text-white text-sm font-light tracking-wide">
            {status}
          </span>
        </div>
      </div>

      {!isConnected && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-5 pointer-events-none">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/30 opacity-50"
          >
            <rect x="2" y="2" width="20" height="20" rx="2.18" />
            <line x1="8" y1="2" x2="8" y2="22" />
            <line x1="16" y1="2" x2="16" y2="22" />
            <line x1="2" y1="8" x2="22" y2="8" />
            <line x1="2" y1="16" x2="22" y2="16" />
          </svg>
          <p className="text-white/50 text-base font-light tracking-widest m-0">
            Waiting for stream...
          </p>
        </div>
      )}
    </div>
  );
}