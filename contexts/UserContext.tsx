"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getMe, logout as logoutApi } from "@/services/auth";
import { AxiosError } from "axios";
import { useRouter, usePathname } from "next/navigation";

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

interface ApiResponse {
  success: boolean;
  message: string;
  data: UserData;
}

interface UserContextType {
  user: ApiResponse | null;
  setUser: (user: ApiResponse | null) => void;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ["/login", "/register", "/forgot-password"];
  const isPublicPath = publicPaths.some((path) => pathname?.startsWith(path));

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setError(null);
        const response = await getMe();
        setUser(response.data);
        setIsAuthenticated(true);

        if (isPublicPath) {
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
        setIsAuthenticated(false);

        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            if (!isPublicPath) {
              router.push("/login");
            }
          } else {
            setError(error.message);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router, isPublicPath, pathname]);

  const logout = async () => {
    try {
      await logoutApi();
      setUser(null);
      setIsAuthenticated(false);
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{ user, setUser, isLoading, error, logout, isAuthenticated }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
