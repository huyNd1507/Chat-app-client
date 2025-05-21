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
import { useRouter } from "next/navigation";

interface ChatItemProps {
  conversation: Conversation;
  selectedConversation: Conversation | null;
  onSelect: (conversation: Conversation | null) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  conversation,
  selectedConversation,
  onSelect,
}) => {
  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteConversationMutation = useMutation({
    mutationFn: (conversationId: string) => deleteConversation(conversationId),
    onMutate: async (conversationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["conversations"] });

      // Snapshot the previous value
      const previousConversations = queryClient.getQueryData(["conversations"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["conversations"], (old: any) => ({
        ...old,
        data: {
          ...old.data,
          conversations: old.data.conversations.filter(
            (c: Conversation) => c._id !== conversationId
          ),
        },
      }));

      // If the deleted conversation was selected, clear the selection
      if (selectedConversation?._id === conversationId) {
        onSelect(null);
      }

      return { previousConversations };
    },
    onError: (err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        ["conversations"],
        context?.previousConversations
      );
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const handleDeleteConversation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversationMutation.mutateAsync(conversation._id);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversation.type === "direct") {
      const otherParticipant = conversation.participants.find(
        (p) => p.user._id !== user?.id
      );
      if (otherParticipant) {
        router.push(`/profile/${otherParticipant.user._id}`);
      }
    }
  };

  // Lấy người tham gia không phải là người dùng hiện tại
  const otherParticipant = conversation.participants.find(
    (p) => p.user._id !== user?.id
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

  return (
    <li
      className={`px-5 py-4 cursor-pointer transition-all ease-in-out border-b border-border ${
        selectedConversation?._id === conversation._id
          ? "bg-accent"
          : "hover:bg-accent/50"
      }`}
      onClick={() => onSelect(conversation)}
    >
      <div className="flex gap-3">
        <div className="relative self-center">
          <Avatar className="border-[1px] border-blue-200">
            <AvatarImage src={avatar} />
            <AvatarFallback>{name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {status === "online" && (
            <span className="absolute w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full top-7 right-0"></span>
          )}
        </div>
        <div className="flex-grow overflow-hidden">
          <h5 className="mb-1 text-base truncate font-semibold text-foreground">
            {name}
          </h5>
          <p className="text-muted-foreground truncate text-sm">
            {lastMessage}
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
                <DropdownMenuItem onClick={handleViewProfile}>
                  <IconUser className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDeleteConversation}>
                <IconTrash className="w-4 h-4 mr-2" />
                Delete Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </li>
  );
};

export default function Home() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations({ type: "direct" }),
  });

  const handleSelectConversation = (conversation: Conversation | null) => {
    setSelectedConversation(conversation);
  };

  return (
    <MainLayout selectedConversation={selectedConversation}>
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
        <Separator />
        <div className="h-[calc(100vh-180px)] overflow-y-auto">
          {isLoading ? (
            <div className="mt-6 text-center text-muted-foreground">
              Loading...
            </div>
          ) : !conversationsData?.data.conversations.length ? (
            <div className="mt-6 text-center text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            <ul>
              {conversationsData.data.conversations.map(
                (conversation: Conversation) => (
                  <ChatItem
                    key={conversation._id}
                    conversation={conversation}
                    selectedConversation={selectedConversation}
                    onSelect={handleSelectConversation}
                  />
                )
              )}
            </ul>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
