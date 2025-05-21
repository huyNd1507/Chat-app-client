"use client";

import Header from "@/components/layout/Header";
import SideBar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import ChatContent from "@/components/card/ChatContent";
import { useState, useEffect } from "react";
import { Conversation } from "@/types/conversation";

interface MainLayoutProps {
  children: React.ReactNode;
  selectedConversation?: Conversation | null;
}

const MainLayout = ({ children, selectedConversation }: MainLayoutProps) => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  useEffect(() => {
    if (selectedConversation) {
      setIsChatVisible(true);
    }
  }, [selectedConversation]);

  const handleBack = () => {
    setIsChatVisible(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className={`lg:block ${isChatVisible ? "hidden" : "block"}`}>
        <SideBar />
      </div>

      <div className="lg:w-[390px] tab-content bg-background">{children}</div>

      <div
        className={`fixed lg:relative w-full h-full overflow-hidden bg-background transition-transform duration-300 ease-in-out ${
          isChatVisible ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="lg:flex">
          <div className="relative w-full overflow-hidden">
            {selectedConversation ? (
              <>
                <Header
                  selectedConversation={selectedConversation}
                  handleBack={handleBack}
                />
                <ChatContent selectedConversation={selectedConversation} />
                <Footer selectedConversation={selectedConversation} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] text-muted-foreground">
                <h3 className="text-xl font-semibold mb-2">
                  Select a conversation
                </h3>
                <p>Choose a conversation from the list to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
