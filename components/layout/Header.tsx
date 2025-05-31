import { IconTelephone } from "@/components/icons/phone";
import { IconVideoCamera } from "@/components/icons/video-camera";
import { IconEllipsis } from "@/components/icons/ellipsis";
import { IconInfo } from "@/components/icons/info";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Conversation } from "@/types/conversation";
import { useUser } from "@/contexts/UserContext";
import { IconArrowLeft } from "../icons/arrow-left";
import { useRouter } from "next/navigation";

interface HeaderProps {
  conversation: Conversation;
  onInfoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ conversation, onInfoClick }) => {
  const { user } = useUser();
  const router = useRouter();

  const otherParticipant = conversation.participants.find(
    (p) => p.user._id !== user?.data?.id
  );

  const name =
    conversation.type === "direct"
      ? otherParticipant?.user.username
      : conversation.name || "Unnamed Group";

  const avatar =
    conversation.type === "direct"
      ? otherParticipant?.user.avatar
      : conversation.avatar;

  const status =
    conversation.type === "direct"
      ? otherParticipant?.user.status
      : conversation.metadata?.onlineCount > 0
      ? "online"
      : "offline";

  const handleBackClick = () => {
    router.push("/");
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <button
            onClick={handleBackClick}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-accent transition-colors"
            aria-label="Back to conversations"
          >
            <IconArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="relative">
          <Avatar className="border-[1px] border-blue-200">
            <AvatarImage src={avatar || ""} />
            <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
          </Avatar>
          {status === "online" && (
            <span className="absolute w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full top-7 right-0"></span>
          )}
        </div>
        <div>
          <h5 className="mb-0 text-base font-semibold text-foreground">
            {name}
          </h5>
          <p className="text-muted-foreground text-sm">{status}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          title="Call"
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconTelephone />
        </button>
        <button
          title="Video Call"
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconVideoCamera />
        </button>
        <button
          title="Info"
          onClick={onInfoClick}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconInfo />
        </button>
        <button
          title="More"
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconEllipsis />
        </button>
      </div>
    </div>
  );
};

export default Header;
