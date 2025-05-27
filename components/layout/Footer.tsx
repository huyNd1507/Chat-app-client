"use client";

import { IconSend } from "../icons/send";
import { Conversation } from "@/types/conversation";
import { useState, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/services/message";
import { uploadFile } from "@/services/upload";
import { IconFile } from "../icons/file";
import { IconIconEmotionHappy } from "../icons/icon-emotion-happy";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { toast } from "sonner";

interface FooterProps {
  selectedConversation: Conversation | null;
}

const Footer = ({ selectedConversation }: FooterProps) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { socket, sendMessage: socketSendMessage } = useSocket();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    try {
      socketSendMessage({
        conversationId: selectedConversation._id,
        content: message.trim(),
        type: "text",
      });

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
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

      socketSendMessage({
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
