import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";

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

  useEffect(() => {
    // Initialize socket connection
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
        setMessages((prev) => {
          const newMap = new Map(prev);
          const conversationMessages = newMap.get(data.conversationId) || [];
          newMap.set(data.conversationId, [
            ...conversationMessages,
            data.message,
          ]);
          return newMap;
        });
      }
    );

    // Typing events
    socketRef.current.on("typing:start", (data: TypingUser) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.userId, data);
        return newMap;
      });
    });

    socketRef.current.on("typing:stop", (data: TypingUser) => {
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
  }, []);

  // Socket actions
  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("join:conversation", conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("leave:conversation", conversationId);
  }, []);

  const sendMessage = useCallback(
    (data: { conversationId: string; content: any; type: string }) => {
      socketRef.current?.emit("message:send", data);
    },
    []
  );

  const markMessageAsRead = useCallback(
    (data: { conversationId: string; messageId: string }) => {
      socketRef.current?.emit("message:read", data);
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
