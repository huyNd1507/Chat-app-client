"use client";

import { IconSend } from "../icons/send";
import { Conversation } from "@/types/conversation";
import { useState, useRef, useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { uploadFile } from "@/services/upload";
import { IconFile } from "../icons/file";
import { IconIconEmotionHappy } from "../icons/icon-emotion-happy";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

interface FooterProps {
  selectedConversation: Conversation | null;
}

const Footer = ({ selectedConversation }: FooterProps) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { sendMessage, startTyping, stopTyping, socket } = useSocket();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { user } = useUser();

  // Handle typing events
  useEffect(() => {
    if (!selectedConversation) return;

    if (message.trim()) {
      startTyping(selectedConversation._id);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedConversation._id);
      }, 2000);
    } else {
      stopTyping(selectedConversation._id);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, selectedConversation, startTyping, stopTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !message.trim() ||
      !selectedConversation ||
      !socket?.connected ||
      !user?.data?.id
    )
      return;

    try {
      // Stop typing when sending message
      stopTyping(selectedConversation._id);

      // Gửi tin nhắn qua socket
      sendMessage({
        conversationId: selectedConversation._id,
        content: message.trim(),
        type: "text",
      });

      // Cập nhật cache của conversation để hiển thị tin nhắn mới ngay lập tức
      queryClient.setQueryData(
        ["conversations"],
        (oldData: { data: { conversations: Conversation[] } } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              conversations: oldData.data.conversations.map((conv) =>
                conv._id === selectedConversation._id
                  ? {
                      ...conv,
                      lastMessage: {
                        _id: Date.now().toString(), // Temporary ID
                        content: { text: message.trim() },
                        type: "text",
                        sender: user.data.id,
                        createdAt: new Date().toISOString(),
                      },
                    }
                  : conv
              ),
            },
          };
        }
      );

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;

    try {
      const uploadResponse = await uploadFile(file);
      if (!uploadResponse.success || !uploadResponse.files[0]) {
        throw new Error("Upload failed");
      }

      sendMessage({
        conversationId: selectedConversation._id,
        content: {
          media: {
            url: uploadResponse.files[0].webViewLink,
            mimeType: file.type,
            size: file.size,
            caption: file.name,
          },
        },
        type: "file",
      });

      // Cập nhật cache của conversation để hiển thị file mới ngay lập tức
      queryClient.setQueryData(
        ["conversations"],
        (oldData: { data: { conversations: Conversation[] } } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              conversations: oldData.data.conversations.map((conv) =>
                conv._id === selectedConversation._id
                  ? {
                      ...conv,
                      lastMessage: {
                        _id: Date.now().toString(), // Temporary ID
                        content: {
                          media: {
                            url: uploadResponse.files[0].webViewLink,
                            caption: file.name,
                          },
                        },
                        type: "file",
                        sender: selectedConversation.participants[0].user._id,
                        createdAt: new Date().toISOString(),
                      },
                    }
                  : conv
              ),
            },
          };
        }
      );

      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    }
  };

  return (
    <div className="p-4 border-t border-border lg:p-6">
      <form onSubmit={handleSendMessage}>
        <div className="flex items-center gap-2">
          <div className="flex-grow relative">
            <input
              type="text"
              className="w-full px-4 py-2 text-foreground bg-muted border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={
                selectedConversation
                  ? "Type a message..."
                  : "Select a conversation to start chatting"
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!selectedConversation}
            />
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              disabled={!selectedConversation}
            />
            <button
              type="button"
              className="text-xl text-muted-foreground border-0 btn hover:text-foreground transition-colors"
              disabled={!selectedConversation}
              onClick={() => fileInputRef.current?.click()}
            >
              <IconFile />
            </button>
            <button
              type="button"
              className="text-xl text-muted-foreground border-0 btn hover:text-foreground transition-colors"
              disabled={!selectedConversation}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <IconIconEmotionHappy />
            </button>
            <button
              type="submit"
              className="text-xl text-muted-foreground border-0 btn hover:text-foreground transition-colors"
              disabled={!selectedConversation || !message.trim()}
            >
              <IconSend />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Footer;
