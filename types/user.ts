interface UserSettings {
  notifications: {
    messages: boolean;
    groups: boolean;
    calls: boolean;
    mentions: boolean;
  };
  theme: string;
  language: string;
  fontSize: number;
  messagePreview: boolean;
  enterToSend: boolean;
  mediaAutoDownload: boolean;
}

interface UserPrivacy {
  lastSeen: string;
  profilePhoto: string;
  status: string;
}

export interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  avatar: string;
  coverPhoto: string;
  status: "online" | "offline" | "away";
  lastSeen: string;
  privacy: UserPrivacy;
  settings: UserSettings;
  socialLinks: any[];
  badges: any[];
}
