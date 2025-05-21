"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/services/auth";
import { AxiosResponse } from "axios";

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

interface UserData {
  id: string;
  username: string;
  email: string;
  fullname: string;
  avatar: string;
  coverPhoto: string;
  status: string;
  lastSeen: string;
  bio: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  contacts: any[];
  privacy: UserPrivacy;
  settings: UserSettings;
  socialLinks: any[];
  badges: any[];
}

interface User {
  id: string;
  email: string;
  fullname: string;
  username: string;
  avatar?: string;
  phoneNumber?: string;
  bio?: string;
  settings?: UserSettings;
}

interface ApiResponse {
  data: User;
  message: string;
  status: number;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: any;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useQuery<AxiosResponse<ApiResponse>>({
    queryKey: ["user"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: false,
  });

  const value: UserContextType = {
    user: data?.data?.data || null,
    isLoading,
    error,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
