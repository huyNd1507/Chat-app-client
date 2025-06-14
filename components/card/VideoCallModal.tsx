import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

interface Props {
  targetUserId: string;
  isCaller: boolean;
  onClose: () => void;
  conversationId: string;
}

const VideoCallModal = ({
  targetUserId,
  isCaller,
  onClose,
  conversationId,
}: Props) => {
  const { initiateCall, sendAnswer, sendIceCandidate, onCallEvents, endCall } =
    useSocket();

  const [rejected, setRejected] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [hasInit, setHasInit] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const [startTime] = useState(Date.now());

  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendIceCandidate(targetUserId, event.candidate);
      }
    };

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return peer;
  };

  const initCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peer = createPeer();
      peerRef.current = peer;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      if (isCaller) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        initiateCall(targetUserId, offer, conversationId);
      }

      setHasInit(true);
    } catch (err) {
      console.error("getUserMedia failed", err);
      alert("Không thể truy cập camera/mic.");
      onClose();
    }
  };

  const cleanup = (shouldClose = false) => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerRef.current?.close();
    peerRef.current = null;
    localStreamRef.current = null;
    if (shouldClose) onClose();
  };

  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()?.[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()?.[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraEnabled(videoTrack.enabled);
    }
  };

  useEffect(() => {
    if (!hasInit) {
      initCall();
    }

    onCallEvents({
      onAnswer: async ({ answer }) => {
        if (!peerRef.current) return;
        await peerRef.current.setRemoteDescription(answer);
        setIsConnected(true);
      },
      onOffer: async ({ offer, from }) => {
        if (from !== targetUserId) return;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const peer = createPeer();
        peerRef.current = peer;
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        sendAnswer(from, answer);
        setIsConnected(true);
      },
      onCandidate: async ({ candidate }) => {
        await peerRef.current?.addIceCandidate(candidate);
      },
      onRejected: ({ from }) => {
        if (from === targetUserId) {
          setRejected(true);
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      },
      onEnded: () => {
        cleanup(true);
      },
    });

    return () => {
      cleanup();
    };
  }, [hasInit]);

  const handleEndCall = () => {
    endCall(targetUserId, {
      conversationId,
      duration: Math.floor((Date.now() - startTime) / 1000), // Thêm duration
    });
    cleanup(true);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-4xl flex flex-col gap-4">
        <h3 className="text-xl font-semibold text-center">
          {isConnected
            ? "🎥 Đang video call"
            : isCaller
            ? "📞 Đang gọi..."
            : "📥 Đang nhận cuộc gọi..."}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-64 bg-black rounded-lg object-cover"
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-64 bg-black rounded-lg object-cover"
          />
        </div>

        <div className="flex justify-center gap-6 mt-4">
          <button
            onClick={toggleMic}
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            title={micEnabled ? "Tắt mic" : "Bật mic"}
          >
            {micEnabled ? (
              <Mic className="text-green-600" />
            ) : (
              <MicOff className="text-red-600" />
            )}
          </button>

          <button
            onClick={toggleCamera}
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            title={cameraEnabled ? "Tắt camera" : "Bật camera"}
          >
            {cameraEnabled ? (
              <Video className="text-green-600" />
            ) : (
              <VideoOff className="text-red-600" />
            )}
          </button>

          <button
            // onClick={() => {
            //   endCall(targetUserId);
            //   cleanup(true);
            // }}
            onClick={handleEndCall}
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition"
            title="Kết thúc cuộc gọi"
          >
            <PhoneOff />
          </button>
        </div>

        {rejected && (
          <div className="text-center text-red-500 font-semibold">
            Người kia đã từ chối cuộc gọi
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallModal;
