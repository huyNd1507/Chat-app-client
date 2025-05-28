"use client";

import MainLayout from "@/components/layout/MainLayout";
import { IconSearch } from "@/components/icons/search";
import { IconTrash } from "@/components/icons/trash";
import { IconEllipsisVertical } from "@/components/icons/ellipsis-vertical";
import { IconUser } from "@/components/icons/user";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getConversations, deleteConversation } from "@/services/conversation";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Conversation } from "@/types/conversation";
import { useUser } from "@/contexts/UserContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useSocket } from "@/contexts/SocketContext";
import { toast } from "sonner";

interface ChatItemProps {
  conversation: Conversation;
}

export default function ChatItem({ conversation }: ChatItemProps) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { socket, typingUsers, onlineUsers } = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  const [typingNames, setTypingNames] = useState<string[]>([]);

  const isSelected = pathname === `/chat/${conversation._id}`;

  const deleteConversationMutation = useMutation({
    mutationFn: (conversationId: string) => deleteConversation(conversationId),
    onMutate: async (conversationId) => {},
    onError: (err, newTodo, context) => {},
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const handleDeleteConversation = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      try {
        await deleteConversationMutation.mutateAsync(conversation._id);
        if (isSelected) {
          router.push("/");
        }
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        toast.success("Conversation deleted successfully");
      } catch (error) {
        console.error("Error deleting conversation:", error);
        toast.error("Failed to delete conversation");
      }
    }
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    if (otherParticipant) {
      router.push(`/profile/${otherParticipant.user._id}`);
    }
  };

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
      : conversation.metadata.onlineCount > 0
      ? "online"
      : "offline";

  const lastMessage =
    conversation.lastMessage?.content?.text || "No messages yet";
  const time = conversation.lastMessage
    ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
        addSuffix: true,
      })
    : "";

  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdate = (data: { conversation: Conversation }) => {
      if (data.conversation._id === conversation._id) {
        // Cập nhật conversation trong cache
        queryClient.setQueryData(
          ["conversations"],
          (
            oldData: { data: { conversations: Conversation[] } } | undefined
          ) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              data: {
                ...oldData.data,
                conversations: oldData.data.conversations.map((conv) =>
                  conv._id === data.conversation._id ? data.conversation : conv
                ),
              },
            };
          }
        );
      }
    };

    socket.on("conversation:updated", handleConversationUpdate);

    return () => {
      socket.off("conversation:updated", handleConversationUpdate);
    };
  }, [socket, conversation._id, queryClient]);

  useEffect(() => {
    const typingUsersInConversation = typingUsers.filter(
      (typingUser) =>
        typingUser.conversationId === conversation._id &&
        typingUser.userId !== user?.data?.id
    );

    setIsTyping(typingUsersInConversation.length > 0);

    // Get names of typing users
    const names = typingUsersInConversation.map((typingUser) => {
      const participant = conversation.participants.find(
        (p) => p.user._id === typingUser.userId
      );
      return participant?.user.username || "Someone";
    });

    setTypingNames(names);
  }, [
    typingUsers,
    conversation._id,
    user?.data?.id,
    conversation.participants,
  ]);

  const handleClick = () => {
    router.push(`/chat/${conversation._id}`);
  };

  const getTitle = () => {
    if (conversation.type === "direct") {
      return otherParticipant?.user.username || "Unknown User";
    }
    return `# ${conversation.name}`;
  };

  const getAvatar = () => {
    if (conversation.type === "direct") {
      return otherParticipant?.user.avatar;
    }
    return conversation.avatar;
  };

  const getStatus = () => {
    if (conversation.type === "direct") {
      return otherParticipant?.user.status;
    }
    return conversation.metadata.onlineCount > 0 ? "online" : "offline";
  };

  const getLastMessage = () => {
    if (isTyping) {
      if (typingNames.length === 1) {
        return `${typingNames[0]} is typing...`;
      } else if (typingNames.length === 2) {
        return `${typingNames[0]} and ${typingNames[1]} are typing...`;
      } else if (typingNames.length > 2) {
        return `${typingNames[0]} and ${
          typingNames.length - 1
        } others are typing...`;
      }
      return "Someone is typing...";
    }
    if (!conversation.lastMessage) {
      return "No messages yet";
    }
    if (conversation.lastMessage.type === "text") {
      return conversation.lastMessage.content.text;
    }
    if (conversation.lastMessage.type === "file") {
      return "Sent a file";
    }
    return "Sent a message";
  };

  return (
    <Link href={`/chat/${conversation?._id}`}>
      <li
        className={`px-5 py-4 cursor-pointer transition-all ease-in-out border-b border-border hover:bg-accent/50 ${
          isSelected ? "bg-accent" : "bg-background"
        }`}
      >
        <div className="flex gap-3">
          <div className="relative self-center">
            <Avatar className="border-[1px] border-blue-200">
              <AvatarImage src={getAvatar()} />
              <AvatarFallback>
                {getTitle().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {getStatus() === "online" && (
              <span className="absolute w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full top-7 right-0"></span>
            )}
          </div>
          <div className="flex-grow overflow-hidden">
            <h5 className="mb-1 text-base truncate font-semibold text-foreground">
              {getTitle()}
            </h5>
            <p
              className={`text-sm truncate ${
                isTyping ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {getLastMessage()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground text-right text-xs">
              <p className="text-nowrap">{time}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 hover:bg-accent rounded-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconEllipsisVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {conversation.type === "direct" && (
                  <DropdownMenuItem
                    onClick={handleViewProfile}
                    className="cursor-pointer"
                  >
                    <IconUser className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDeleteConversation}
                  className="cursor-pointer"
                >
                  <IconTrash className="w-4 h-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </li>
    </Link>
  );
}
