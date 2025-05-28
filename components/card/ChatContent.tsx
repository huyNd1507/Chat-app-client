"use client";

import { IconEllipsisVertical } from "@/components/icons/ellipsis-vertical";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Conversation } from "@/types/conversation";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getMessages, deleteMessage } from "@/services/message";
import { formatDistanceToNow } from "date-fns";
import { useRef, useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSocket } from "@/contexts/SocketContext";
import { IconTrash } from "../icons/trash";

interface ChatContentProps {
  selectedConversation: Conversation;
}

const ChatContent: React.FC<ChatContentProps> = ({ selectedConversation }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { socket, joinConversation, leaveConversation, typingUsers } =
    useSocket();
  const [typingUsersInConversation, setTypingUsersInConversation] = useState<
    string[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingNames, setTypingNames] = useState<string[]>([]);

  // Join conversation when component mounts
  useEffect(() => {
    if (!socket?.connected || !selectedConversation?._id) return;

    console.log("Joining conversation:", selectedConversation._id);
    joinConversation(selectedConversation._id);

    return () => {
      console.log("Leaving conversation:", selectedConversation._id);
      leaveConversation(selectedConversation._id);
    };
  }, [
    socket?.connected,
    selectedConversation?._id,
    joinConversation,
    leaveConversation,
  ]);

  // Handle typing users
  useEffect(() => {
    const typingUsersInThisConversation = typingUsers
      .filter(
        (typingUser) =>
          typingUser.conversationId === selectedConversation._id &&
          typingUser.userId !== user?.data?.id
      )
      .map((typingUser) => typingUser.userId);

    setTypingUsersInConversation(typingUsersInThisConversation);
  }, [typingUsers, selectedConversation._id, user?.data?.id]);

  // Handle typing status
  useEffect(() => {
    if (!socket || !selectedConversation) return;

    const handleTypingStart = (data: {
      userId: string;
      conversationId: string;
    }) => {
      if (
        data.conversationId === selectedConversation._id &&
        data.userId !== user?.data?.id
      ) {
        const typingUser = selectedConversation.participants.find(
          (p) => p.user._id === data.userId
        );
        if (typingUser) {
          setTypingNames((prev) => {
            if (!prev.includes(typingUser.user.username)) {
              return [...prev, typingUser.user.username];
            }
            return prev;
          });
          setIsTyping(true);
        }
      }
    };

    const handleTypingStop = (data: {
      userId: string;
      conversationId: string;
    }) => {
      if (
        data.conversationId === selectedConversation._id &&
        data.userId !== user?.data?.id
      ) {
        const typingUser = selectedConversation.participants.find(
          (p) => p.user._id === data.userId
        );
        if (typingUser) {
          setTypingNames((prev) =>
            prev.filter((name) => name !== typingUser.user.username)
          );
          setIsTyping(typingNames.length > 1);
        }
      }
    };

    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket, selectedConversation, user?.data?.id, typingNames]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["messages", selectedConversation._id],
      queryFn: ({ pageParam = 1 }) =>
        getMessages({
          conversationId: selectedConversation._id,
          page: pageParam,
          limit: 20,
        }),
      getNextPageParam: (lastPage) => {
        if (lastPage.data.messages.length < 20) return undefined;
        return lastPage.data.currentPage + 1;
      },
      initialPageParam: 1,
    });

  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", selectedConversation._id],
      });
    },
  });

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMessageMutation.mutate(messageId);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.pages]);

  // Load more messages when scrolling to top
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Handle new messages
  useEffect(() => {
    if (!socket?.connected || !selectedConversation?._id) return;

    const handleNewMessage = (data: {
      message: any;
      conversationId: string;
    }) => {
      console.log("New message received in ChatContent:", data);
      if (data.conversationId === selectedConversation._id) {
        // Scroll to bottom when new message arrives in current conversation
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [socket?.connected, selectedConversation?._id]);

  const getTypingText = () => {
    if (typingNames.length === 1) {
      return `${typingNames[0]} is typing...`;
    } else if (typingNames.length === 2) {
      return `${typingNames[0]} and ${typingNames[1]} are typing...`;
    } else if (typingNames.length > 2) {
      return `${typingNames[0]} and ${
        typingNames.length - 1
      } others are typing...`;
    }
    return "";
  };

  if (status === "pending") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Error loading messages</p>
      </div>
    );
  }

  const reversedPages = [...(data?.pages || [])].reverse();

  return (
    <div
      className="h-[calc(100vh-180px)] flex-1 p-4 lg:p-6 overflow-y-auto box-chat bg-background"
      onScroll={handleScroll}
    >
      {isFetchingNextPage && (
        <div className="text-center py-2">
          <p className="text-muted-foreground">Loading more messages...</p>
        </div>
      )}

      <div className="space-y-4">
        {reversedPages.map((page) =>
          [...page.data.messages].reverse().map((message: any) => {
            const isOwnMessage = message.sender._id === user?.data?.id;

            return (
              <div
                key={message._id}
                className={`flex items-end gap-3 ${
                  isOwnMessage ? "flex-row-reverse" : ""
                }`}
              >
                {selectedConversation.type !== "direct" && (
                  <div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.sender.avatar} />
                      <AvatarFallback>
                        {message.sender.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}

                <div className={isOwnMessage ? "order-1" : ""}>
                  <div
                    className={`flex gap-2 mb-2 ${
                      isOwnMessage ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`relative px-3 text-[0.8rem] md:text-[0.9rem] py-1 rounded-lg ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground ltr:rounded-br-none rtl:rounded-bl-none"
                          : "bg-muted text-foreground ltr:rounded-bl-none rtl:rounded-br-none"
                      }`}
                    >
                      <p className="mb-0">{message.content.text}</p>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <p
                          className={`text-xs ${
                            isOwnMessage
                              ? "text-primary-foreground/50"
                              : "text-muted-foreground"
                          }`}
                        >
                          <i className="align-middle ri-time-line"></i>{" "}
                          <span className="align-middle text-[0.6rem] md:text-[0.7rem]">
                            {formatDistanceToNow(new Date(message.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </p>
                      </div>
                    </div>
                    {isOwnMessage && (
                      <div
                        className={`relative self-start ${
                          isOwnMessage ? "order-1" : ""
                        }`}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <IconEllipsisVertical className="text-muted-foreground hover:text-foreground transition-colors" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => handleDeleteMessage(message._id)}
                            >
                              <IconTrash className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                  {selectedConversation.type !== "direct" && (
                    <div
                      className={`font-medium text-foreground text-14 hidden lg:block ${
                        isOwnMessage ? "text-right" : ""
                      }`}
                    >
                      {message.sender.username}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="mt-4 text-sm text-muted-foreground">
          {getTypingText()}
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContent;
