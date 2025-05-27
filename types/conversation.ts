export interface Participant {
  user: {
    _id: string;
    username: string;
    avatar: string;
    status: "online" | "offline" | "away";
  };
  role: string;
  joinedAt: string;
  isMuted: boolean;
  isBlocked: boolean;
}

export interface LastMessage {
  _id: string;
  content: {
    text?: string;
    media?: {
      url: string;
      caption?: string;
    };
  };
  type: string;
  sender: string;
  createdAt: string;
}

interface Admin {
  user: string;
  role: string;
  assignedAt: string;
  _id: string;
}

export interface Conversation {
  _id: string;
  type: "direct" | "group" | "channel" | "broadcast";
  name: string;
  participants: Participant[];
  lastMessage?: LastMessage;
  avatar: string;
  description: string;
  metadata: {
    memberCount: number;
    onlineCount: number;
  };
  unreadCount: any[];
  admins?: Admin[];
  isActive: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
