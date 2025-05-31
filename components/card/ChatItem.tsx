"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "../ui/use-toast";

// Icons
import { IconTrash } from "@/components/icons/trash";
import { IconEllipsisVertical } from "@/components/icons/ellipsis-vertical";
import { IconUser } from "@/components/icons/user";

// Services and Contexts
import { deleteConversation } from "@/services/conversation";
import { useUser } from "@/contexts/UserContext";
import { useSocket } from "@/contexts/SocketContext";

// Types
import { Conversation } from "@/types/conversation";

interface ChatItemProps {
  conversation: Conversation;
}

export default function ChatItem({ conversation }: ChatItemProps) {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { socket, typingUsers, onlineUsers } = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  const [typingNames, setTypingNames] = useState<string[]>([]);

  const isSelected = pathname === `/chat/${conversation._id}`;
  const userId = user?.data?.id;

  // Find the other participant in direct conversations
  const otherParticipant = conversation.participants.find(
    (p) => p.user._id !== userId
  );

  // Conversation metadata helpers
  const conversationInfo = {
    title:
      conversation.type === "direct"
        ? otherParticipant?.user.username || "Unknown User"
        : `# ${conversation.name || "Unnamed Group"}`,

    avatar:
      conversation.type === "direct"
        ? otherParticipant?.user.avatar
        : conversation.avatar,

    status:
      conversation.type === "direct"
        ? otherParticipant?.user.status
        : conversation.metadata.onlineCount > 0
        ? "online"
        : "offline",

    time: conversation.lastMessage
      ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
          addSuffix: true,
        })
      : "",
  };

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: (conversationId: string) => deleteConversation(conversationId),
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Xóa cuộc trò chuyện thất bại",
        description:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi xóa cuộc trò chuyện",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Event handlers
  const handleDeleteConversation = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      try {
        await deleteConversationMutation.mutateAsync(conversation._id);
        if (isSelected) {
          router.push("/");
        }
        toast({
          variant: "default",
          title: "Xóa cuộc trò chuyện thành công",
        });
      } catch (error: any) {
        console.error("Error deleting conversation:", error);
      }
    }
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    if (otherParticipant) {
      router.push(`/profile/${otherParticipant.user._id}`);
    }
  };

  // Socket event listener for conversation updates
  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdate = (data: { conversation: Conversation }) => {
      if (data.conversation._id === conversation._id) {
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

  // Typing indicator effect
  useEffect(() => {
    const typingUsersInConversation = typingUsers.filter(
      (typingUser) =>
        typingUser.conversationId === conversation._id &&
        typingUser.userId !== userId
    );

    setIsTyping(typingUsersInConversation.length > 0);

    const names = typingUsersInConversation.map((typingUser) => {
      const participant = conversation.participants.find(
        (p) => p.user._id === typingUser.userId
      );
      return participant?.user.username || "Someone";
    });

    setTypingNames(names);
  }, [typingUsers, conversation._id, userId, conversation.participants]);

  // Get the last message or typing indicator text
  const getLastMessageText = () => {
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

    switch (conversation.lastMessage.type) {
      case "text":
        return conversation.lastMessage.content.text;
      case "file":
        return "Sent a file";
      default:
        return "Sent a message";
    }
  };

  return (
    <Link href={`/chat/${conversation?._id}`}>
      <li
        className={`px-5 py-4 cursor-pointer transition-all ease-in-out border-b border-border hover:bg-accent/50 ${
          isSelected ? "bg-accent" : "bg-background"
        }`}
      >
        <div className="flex gap-3">
          {/* Avatar with online status indicator */}
          <div className="relative self-center">
            <Avatar className="border-[1px] border-blue-200">
              <AvatarImage src={conversationInfo.avatar} />
              <AvatarFallback>
                {conversationInfo.title.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {conversationInfo.status === "online" && (
              <span className="absolute w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full top-7 right-0"></span>
            )}
          </div>

          {/* Conversation details */}
          <div className="flex-grow overflow-hidden">
            <h5 className="mb-1 text-base truncate font-semibold text-foreground">
              {conversationInfo.title}
            </h5>
            <p
              className={`text-sm truncate ${
                isTyping ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {getLastMessageText()}
            </p>
          </div>

          {/* Time and actions dropdown */}
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground text-right text-xs">
              <p className="text-nowrap">{conversationInfo.time}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="More options"
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
