import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

interface OnlineUser {
  userId: string;
  status: "online" | "offline";
}

interface Message {
  _id: string;
  conversation: string;
  sender: string;
  type: string;
  content: any;
  status: string;
  readBy: Array<{
    user: string;
    readAt: Date;
  }>;
  createdAt: Date;
}

interface TypingUser {
  userId: string;
  conversationId: string;
}

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
  messages: Record<string, Message[]>;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (data: {
    conversationId: string;
    content: any;
    type: string;
  }) => void;
  markMessageAsRead: (data: {
    conversationId: string;
    messageId: string;
  }) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(
    new Map()
  );
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";
    console.log("Connecting to socket server at:", serverUrl);

    socketRef.current = io(serverUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    socketRef.current.on("connect", () => {
      console.log("Socket connected successfully!");
      console.log("Socket ID:", socketRef.current?.id);
      setIsConnected(true);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    // User status events
    socketRef.current.on("users:online", (users: OnlineUser[]) => {
      console.log("Received online users:", users);
      setOnlineUsers(users);
    });

    socketRef.current.on("user:status", (data: OnlineUser) => {
      console.log("User status changed:", data);
      setOnlineUsers((prev) => {
        const userIndex = prev.findIndex((user) => user.userId === data.userId);
        if (userIndex === -1) {
          return [...prev, data];
        }
        const newUsers = [...prev];
        newUsers[userIndex] = data;
        return newUsers;
      });
    });

    // Message events
    socketRef.current.on(
      "message:new",
      (data: { message: Message; conversationId: string }) => {
        console.log("New message received:", data);

        // Update messages state
        setMessages((prev) => {
          const newMap = new Map(prev);
          const conversationMessages = newMap.get(data.conversationId) || [];
          newMap.set(data.conversationId, [
            ...conversationMessages,
            data.message,
          ]);
          return newMap;
        });

        // Update messages cache for the specific conversation
        queryClient.setQueryData(
          ["messages", data.conversationId],
          (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: any, index: number) => {
                if (index === 0) {
                  // Check if message already exists in the cache
                  const messageExists = page.data.messages.some(
                    (msg: Message) => msg._id === data.message._id
                  );
                  if (messageExists) return page;

                  return {
                    ...page,
                    data: {
                      ...page.data,
                      messages: [data.message, ...page.data.messages],
                    },
                  };
                }
                return page;
              }),
            };
          }
        );

        // Update conversations cache to show new message in conversation list
        queryClient.setQueryData(["conversations"], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              conversations: oldData.data.conversations.map((conv: any) =>
                conv._id === data.conversationId
                  ? {
                      ...conv,
                      lastMessage: data.message,
                      updatedAt: new Date().toISOString(),
                    }
                  : conv
              ),
            },
          };
        });

        // Force refetch conversations to ensure real-time updates
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    );

    // Message read status events
    socketRef.current.on(
      "message:read",
      (data: { messageId: string; userId: string; readAt: Date; conversationId: string }) => {
        console.log("Message read status updated:", data);

        // Update messages in the current state
        setMessages((prev) => {
          const newMap = new Map(prev);
          const conversationMessages = newMap.get(data.conversationId) || [];
          
          const updatedMessages = conversationMessages.map((msg) => {
            if (msg._id === data.messageId) {
              // Check if user already read the message
              const alreadyRead = msg.readBy.some(
                (read) => read.user === data.userId
              );
              if (alreadyRead) return msg;

              return {
                ...msg,
                readBy: [
                  ...msg.readBy,
                  {
                    user: data.userId,
                    readAt: data.readAt,
                  },
                ],
              };
            }
            return msg;
          });
          
          newMap.set(data.conversationId, updatedMessages);
          return newMap;
        });

        // Update query cache for specific conversation
        queryClient.setQueryData(
          ["messages", data.conversationId],
          (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                data: {
                  ...page.data,
                  messages: page.data.messages.map((msg: Message) => {
                    if (msg._id === data.messageId) {
                      // Check if user already read the message
                      const alreadyRead = msg.readBy.some(
                        (read) => read.user === data.userId
                      );
                      if (alreadyRead) return msg;

                      return {
                        ...msg,
                        readBy: [
                          ...msg.readBy,
                          {
                            user: data.userId,
                            readAt: data.readAt,
                          },
                        ],
                      };
                    }
                    return msg;
                  }),
                },
              })),
            };
          }
        );

        // Update conversations list to reflect read status
        queryClient.setQueryData(["conversations"], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              conversations: oldData.data.conversations.map((conv: any) => {
                if (conv._id === data.conversationId && conv.lastMessage?._id === data.messageId) {
                  return {
                    ...conv,
                    lastMessage: {
                      ...conv.lastMessage,
                      readBy: [...(conv.lastMessage.readBy || []), {
                        user: data.userId,
                        readAt: data.readAt
                      }]
                    }
                  };
                }
                return conv;
              }),
            },
          };
        });
      }
    );

    // Typing events
    socketRef.current.on("typing:start", (data: TypingUser) => {
      console.log("User started typing:", data);
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.userId, data);
        return newMap;
      });
    });

    socketRef.current.on("typing:stop", (data: TypingUser) => {
      console.log("User stopped typing:", data);
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(data.userId);
        return newMap;
      });
    });

    // Error events
    socketRef.current.on("error", (error: { message: string }) => {
      console.error("Socket error:", error);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [queryClient]);

  // Socket actions
  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("join:conversation", conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("leave:conversation", conversationId);
  }, []);

  const sendMessage = useCallback(
    (data: { conversationId: string; content: any; type: string }) => {
      if (!socketRef.current?.connected) {
        console.error("Socket is not connected");
        return;
      }
      console.log("Sending message:", data);
      socketRef.current.emit("message:send", data);
    },
    []
  );

  const markMessageAsRead = useCallback(
    (data: { conversationId: string; messageId: string }) => {
      if (!socketRef.current?.connected) {
        console.error("Socket is not connected, can't mark message as read");
        return;
      }
      console.log("Marking message as read:", data);
      socketRef.current.emit("message:read", data);
    },
    []
  );

  const startTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit("typing:start", { conversationId });
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit("typing:stop", { conversationId });
  }, []);

  const value = {
    socket: socketRef.current,
    onlineUsers,
    typingUsers: Array.from(typingUsers.values()),
    messages: Object.fromEntries(messages),
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessageAsRead,
    startTyping,
    stopTyping,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
