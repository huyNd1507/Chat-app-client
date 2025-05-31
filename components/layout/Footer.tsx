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
import { IconTrash } from "../icons/trash";
import Image from "next/image";
import { IconImage } from "../icons/image";

interface FooterProps {
  selectedConversation: Conversation | null;
}

const Footer = ({ selectedConversation }: FooterProps) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { sendMessage, startTyping, stopTyping, socket } = useSocket();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
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

  // Handle clicking outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !selectedConversation) return;
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !selectedConversation) return;
    // Filter only image files
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    setSelectedFiles((prev) => [...prev, ...imageFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !socket?.connected || !user?.data?.id) return;

    try {
      // Stop typing when sending message
      stopTyping(selectedConversation._id);

      if (selectedFiles.length > 0) {
        // Upload all files
        const uploadPromises = selectedFiles.map((file) => uploadFile(file));
        const uploadResults = await Promise.all(uploadPromises);

        // Check if all uploads were successful
        const failedUploads = uploadResults.filter((result) => !result.success);
        if (failedUploads.length > 0) {
          throw new Error("Some files failed to upload");
        }

        // Send messages for each file
        const sendPromises = uploadResults.map((result, index) => {
          const file = selectedFiles[index];
          return sendMessage({
            conversationId: selectedConversation._id,
            content: {
              media: {
                url: result.files[0].webViewLink,
                mimeType: file.type,
                size: file.size,
                caption: file.name,
              },
            },
            type: "file",
          });
        });

        await Promise.all(sendPromises);

        // Update conversation cache
        queryClient.setQueryData(
          ["conversations"],
          (
            oldData: { data: { conversations: Conversation[] } } | undefined
          ) => {
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
                          _id: Date.now().toString(),
                          content: {
                            media: {
                              url: uploadResults[uploadResults.length - 1]
                                .files[0].webViewLink,
                              caption:
                                selectedFiles[selectedFiles.length - 1].name,
                            },
                          },
                          type: "file",
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

        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }

      if (message.trim()) {
        sendMessage({
          conversationId: selectedConversation._id,
          content: message.trim(),
          type: "text",
        });

        // Update conversation cache
        queryClient.setQueryData(
          ["conversations"],
          (
            oldData: { data: { conversations: Conversation[] } } | undefined
          ) => {
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
                          _id: Date.now().toString(),
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
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="p-4 border-t border-border lg:p-6">
      <form onSubmit={handleSendMessage} className="relative">
        {selectedFiles.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-2">
            <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent p-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 bg-muted/50 rounded-lg relative p-2"
                >
                  <div className="flex flex-col w-full h-full">
                    {file.type.startsWith("image/") ? (
                      <div className="w-[60px] aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={URL.createObjectURL(file)}
                          width={60}
                          height={60}
                          alt="File preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="bg-muted/80 rounded-lg p-2 min-w-[120px]">
                        <p className="text-[10px] font-medium truncate max-w-[120px]">
                          {file.name}
                        </p>
                        <p className="text-[8px] text-muted-foreground mt-0.5">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute -top-2 -right-2 text-destructive hover:text-destructive/80 bg-background/90 rounded-full p-1.5 shadow-sm"
                      aria-label="Remove file"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
              <div ref={emojiPickerRef} className="absolute bottom-full mb-2">
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
              multiple
              aria-label="Upload files"
            />
            <input
              type="file"
              ref={imageInputRef}
              className="hidden"
              onChange={handleImageUpload}
              disabled={!selectedConversation}
              multiple
              accept="image/*"
              aria-label="Upload images"
            />
            <button
              type="button"
              className="text-xl text-muted-foreground border-0 btn hover:text-foreground transition-colors"
              disabled={!selectedConversation}
              onClick={() => imageInputRef.current?.click()}
              aria-label="Upload images"
            >
              <IconImage />
            </button>
            <button
              type="button"
              className="text-xl text-muted-foreground border-0 btn hover:text-foreground transition-colors"
              disabled={!selectedConversation}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload files"
            >
              <IconFile />
            </button>
            <button
              type="button"
              className="text-xl text-muted-foreground border-0 btn hover:text-foreground transition-colors"
              disabled={!selectedConversation}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              aria-label="Open emoji picker"
            >
              <IconIconEmotionHappy />
            </button>
            <button
              type="submit"
              className="text-xl text-muted-foreground border-0 btn hover:text-foreground transition-colors"
              disabled={
                !selectedConversation ||
                (!message.trim() && selectedFiles.length === 0)
              }
              aria-label="Send message"
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
