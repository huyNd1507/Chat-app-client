"use client";

import { useState, useEffect } from "react";
import { Conversation } from "@/types/conversation";
import NavBar from "./Navbar";
import { usePathname } from "next/navigation";

interface MainLayoutProps {
  children: React.ReactNode;
  selectedConversation?: Conversation | null;
}

const MainLayout = ({ children, selectedConversation }: MainLayoutProps) => {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const pathname = usePathname();

  // Detect if we're in a chat route or any other non-main route (like profile)
  useEffect(() => {
    if (pathname) {
      // Check if we're in a chat route or any other route that's not the main page
      const isDetailRoute =
        pathname.includes("/chat/") ||
        pathname.includes("/profile") ||
        pathname.includes("/contact");

      setIsChatVisible(isDetailRoute);
    }
  }, [pathname]);

  useEffect(() => {
    if (selectedConversation) {
      setIsChatVisible(true);
    }
  }, [selectedConversation]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div
        className={`w-full lg:w-[390px] bg-background border-r border-border transition-transform duration-300 ease-in-out ${
          isChatVisible ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
        }`}
      >
        <NavBar />
      </div>
      <div
        className={`fixed lg:relative w-full h-full overflow-hidden bg-background transition-transform duration-300 ease-in-out ${
          isChatVisible ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="lg:flex">
          <div className="relative w-full overflow-hidden">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
