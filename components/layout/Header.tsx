import { IconTelephone } from "@/components/icons/phone";
import { IconVideoCamera } from "@/components/icons/video-camera";
import { IconEllipsis } from "@/components/icons/ellipsis";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Conversation } from "@/types/conversation";
import { useUser } from "@/contexts/UserContext";
import { IconArrowLeft } from "../icons/arrow-left";

interface HeaderProps {
  selectedConversation: Conversation;
  handleBack: () => void;
}

const Header: React.FC<HeaderProps> = ({
  selectedConversation,
  handleBack,
}) => {
  const { user } = useUser();

  // Lấy người tham gia không phải là người dùng hiện tại
  const otherParticipant = selectedConversation.participants.find(
    (p) => p.user._id !== user?.id
  );

  const name =
    selectedConversation.type === "direct"
      ? otherParticipant?.user.username
      : selectedConversation.name || "Unnamed Group";

  const avatar =
    selectedConversation.type === "direct"
      ? otherParticipant?.user.avatar
      : selectedConversation.avatar;

  const status =
    selectedConversation.type === "direct"
      ? otherParticipant?.user.status
      : selectedConversation.metadata.onlineCount > 0
      ? "online"
      : "offline";

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <button
            onClick={handleBack}
            className=" left-4 top-4 z-10 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconArrowLeft />
          </button>
        </div>
        <div className="relative">
          <Avatar className="border-[1px] border-blue-200">
            <AvatarImage src={avatar} />
            <AvatarFallback>{name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {status === "online" && (
            <span className="absolute w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full top-7 right-0"></span>
          )}
        </div>
        <div>
          <h5 className="mb-0 text-base font-semibold text-foreground">
            {name}
          </h5>
          <p className="text-muted-foreground text-sm">
            {status === "online" ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <IconTelephone />
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <IconVideoCamera />
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <IconEllipsis />
        </button>
      </div>
    </div>
  );
};

export default Header;
