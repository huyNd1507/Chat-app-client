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
import { useRef, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSocket } from "@/contexts/SocketContext";

interface ChatContentProps {
  selectedConversation: Conversation;
}

const ChatContent: React.FC<ChatContentProps> = ({ selectedConversation }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

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
            // Tin nhắn của người dùng hiện tại luôn hiển thị bên phải
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
                      <p
                        className={`mt-1 mb-0 text-xs text-right ${
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

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContent;
