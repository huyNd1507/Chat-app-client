import { useEffect, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { Phone, PhoneOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface Props {
  callerId: string;
  offer: RTCSessionDescriptionInit;
  callerInfo: {
    name: string;
    avatar?: string;
  };
  groupInfo?: {
    name: string;
    avatar?: string;
    type: string;
  };
  onClose: () => void;
  onAccept: () => void;
  conversationId: string | any;
}

const IncomingCallModal = ({
  callerId,
  offer,
  callerInfo,
  onClose,
  onAccept,
  conversationId,
  groupInfo,
}: Props) => {
  const { sendAnswer, sendIceCandidate, rejectCall } = useSocket();
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  console.log("conversationId inCome", conversationId);

  useEffect(() => {
    audioRef.current = new Audio("/call.mp3");
    audioRef.current.loop = true;
    audioRef.current.play().catch((err) => {
      console.error("Không thể phát âm thanh cuộc gọi:", err);
    });

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendIceCandidate(callerId, event.candidate);
      }
    };

    return peer;
  };

  const handleAccept = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      const peer = createPeer();
      peerRef.current = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      sendAnswer(callerId, answer);
      onAccept();
      onClose();
    } catch (err) {
      alert("Không thể truy cập camera/microphone.");
      onClose();
    }
  };

  const handleReject = () => {
    rejectCall({
      to: callerId,
      conversationId: conversationId,
    });

    console.log("Rejected call from", conversationId);
    onClose();
  };

  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      peerRef.current?.close();
      peerRef.current = null;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-xl font-bold mb-4">📞 Có cuộc gọi đến</h2>
        {/* Avatar */}
        <Avatar className="mx-auto mb-2 w-16 h-16 border border-blue-300 shadow">
          <AvatarImage src={groupInfo?.avatar || callerInfo?.avatar} />
          <AvatarFallback>
            {/* Add null check for name */}
            {groupInfo?.name ? groupInfo.name[0] : callerInfo?.name?.[0] || "?"}
          </AvatarFallback>
        </Avatar>

        {/* Hiển thị thông tin cuộc gọi */}
        {groupInfo ? (
          <>
            <h2 className="text-xl font-semibold mb-1">{groupInfo.name}</h2>
            <p className="text-muted-foreground text-sm mb-4">
              {callerInfo?.name} đang gọi trong nhóm
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-1">{callerInfo?.name}</h2>
            <p className="text-muted-foreground text-sm mb-4">
              đang gọi cho bạn...
            </p>
          </>
        )}

        <div className="flex justify-center gap-6">
          <button
            type="button"
            onClick={handleAccept}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full flex items-center gap-2 transition"
          >
            <Phone size={20} /> Chấp nhận
          </button>
          <button
            type="button"
            onClick={handleReject}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full flex items-center gap-2 transition"
          >
            <PhoneOff size={20} /> Từ chối
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
