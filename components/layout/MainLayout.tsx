"use client";

import Header from "@/components/layout/Header";
import SideBar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import ChatContent from "@/components/card/ChatContent";
import { useState } from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: AuthLayoutProps) => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  const handleChatToggle = () => {
    setIsChatVisible((prev) => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />

      <div
        className="lg:w-[390px] tab-content bg-gray-50"
        onClick={handleChatToggle}
      >
        {children}
      </div>

      <div
        className={`w-full overflow-hidden bg-white transition-all duration-150 user-chat ${
          isChatVisible ? "user-chat-show" : ""
        }`}
      >
        <div className="lg:flex">
          <div className="relative w-full overflow-hidden">
            <Header
              isChatVisible={isChatVisible}
              toggleChat={handleChatToggle}
            />
            <ChatContent />
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
