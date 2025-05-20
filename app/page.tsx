import MainLayout from "@/components/layout/MainLayout";
import { IconSearch } from "@/components/icons/search";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatItemProps {
  avatarSrc: string;
  fallbackText: string;
  name: string;
  message: string;
  time: string;
  unreadCount: number;
}

const ChatItem: React.FC<ChatItemProps> = ({
  avatarSrc,
  fallbackText,
  name,
  message,
  time,
  unreadCount,
}) => {
  return (
    <li className="px-5 py-4 cursor-pointer hover:bg-accent transition-all ease-in-out border-b border-border">
      <div className="flex gap-3">
        <div className="relative self-center">
          <Avatar>
            <AvatarImage src={avatarSrc} />
            <AvatarFallback>{fallbackText}</AvatarFallback>
          </Avatar>
          <span className="absolute w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full top-7 right-0"></span>
        </div>
        <div className="flex-grow overflow-hidden">
          <h5 className="mb-1 text-base truncate font-semibold text-foreground">{name}</h5>
          <p className="text-muted-foreground truncate text-sm">{message}</p>
        </div>
        <div className="text-muted-foreground text-right text-xs">
          <p className="text-nowrap">{time}</p>
          {unreadCount > 0 && (
            <span className="w-5 h-5 bg-red-400 rounded-full float-right text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

export default function Home() {
  const chatList: ChatItemProps[] = [
    {
      avatarSrc: "https://github.com/shadcn.png",
      fallbackText: "CN",
      name: "Quang Huy",
      message: "Where is the police station and how can I get there?",
      time: "12 phút",
      unreadCount: 1,
    },
    {
      avatarSrc: "https://github.com/shadcn.png",
      fallbackText: "CN",
      name: "Quang Huy",
      message: "Where is the police station and how can I get there?",
      time: "12 phút",
      unreadCount: 1,
    },
  ];

  return (
    <MainLayout>
      <div className="w-full">
        <div>
          <div className="px-6 pt-6">
            <h4 className="mb-0 font-bold text-foreground">Chats</h4>
          </div>
          <div className="mx-6 px-2 my-6 h-12 rounded-lg flex items-center gap-3 border-2">
            <IconSearch />
            <input
              placeholder="Search messages or users"
              className="border-none outline-none bg-transparent flex-grow h-full"
            />
          </div>
        </div>
        <Separator />
        <div className="h-screen overflow-y-scroll box-chat px-6 pt-6">
          <h4 className="mb-0 font-bold text-foreground">Recent</h4>
          <ul className="mt-6">
            {chatList.map((chat, index) => (
              <ChatItem key={index} {...chat} />
            ))}
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
