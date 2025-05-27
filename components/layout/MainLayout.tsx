"use client";

import Header from "@/components/layout/Header";
import SideBar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import ChatContent from "@/components/card/ChatContent";
import { useState, useEffect } from "react";
import { Conversation } from "@/types/conversation";
import NavBar from "./Navbar";

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
      <div className="lg:w-[390px] tab-content bg-background border-r border-border">
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
