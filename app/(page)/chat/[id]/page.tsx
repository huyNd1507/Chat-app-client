"use client";

import ChatContent from "@/components/card/ChatContent";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import MainLayout from "@/components/layout/MainLayout";
import Sidebar from "@/components/layout/Sidebar";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getConversationDetail } from "@/services/conversation";
import { Conversation } from "@/types/conversation";
import { useState, useEffect } from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );
};

const ConversationDetail = () => {
  const params = useParams();
  const { id } = params;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: conversation, isLoading } = useQuery<{ data: Conversation }>({
    queryKey: ["conversation", id],
    queryFn: () => getConversationDetail(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else if (conversation) {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [conversation]);

  return (
    <MainLayout>
      {isLoading ? (
        <LoadingSpinner />
      ) : conversation ? (
        <div className="flex h-[calc(100vh)] w-full">
          <div
            className={`flex flex-col w-full transition-all duration-300 ease-in-out ${
              isSidebarOpen ? "lg:w-[calc(100%-320px)]" : "w-full"
            }`}
          >
            <Header
              conversation={conversation.data}
              onInfoClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1">
                <ChatContent selectedConversation={conversation.data} />
              </div>
              <Footer selectedConversation={conversation.data} />
            </div>
          </div>
          <div
            className={`fixed right-0 h-full transition-all duration-300 ease-in-out ${
              isSidebarOpen ? "w-[320px]" : "w-0"
            }`}
          >
            <Sidebar
              conversation={conversation.data}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] text-muted-foreground">
          <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
          <p>Choose a conversation from the list to start chatting</p>
        </div>
      )}
    </MainLayout>
  );
};

export default ConversationDetail;
