// import { IconPaperclip } from "../icons/paperclip";
// import { IconEmoji } from "../icons/emoji";
import { IconSend } from "../icons/send";
import { Conversation } from "@/types/conversation";
import { useState } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/services/message";

interface FooterProps {
  selectedConversation: Conversation | null;
}

const Footer = ({ selectedConversation }: FooterProps) => {
  const [message, setMessage] = useState("");
  const { socket, sendMessage: socketSendMessage } = useSocket();
  const queryClient = useQueryClient();

  console.log("selectedConversation", selectedConversation);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    try {
      // Gửi tin nhắn qua API
      const response = await sendMessage({
        conversationId: selectedConversation._id,
        content: message.trim(),
        type: "text",
      });

      // Cập nhật UI ngay lập tức với dữ liệu từ API
      queryClient.setQueryData(
        ["messages", selectedConversation._id],
        (oldData: any) => {
          if (!oldData) return oldData;
          const newMessage = response.data;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any, index: number) => {
              if (index === 0) {
                return {
                  ...page,
                  data: {
                    ...page.data,
                    messages: [newMessage, ...page.data.messages],
                  },
                };
              }
              return page;
            }),
          };
        }
      );

      // Gửi tin nhắn qua socket để thông báo cho các client khác
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

  return (
    <div className="p-4 border-t border-border lg:p-6 ">
      <form onSubmit={handleSendMessage}>
        <div className="flex items-center gap-2">
          <div className="flex-grow">
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
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-xl text-muted-foreground border-0 btn hover:text-foreground transition-colors"
              disabled={!selectedConversation}
            >
              {/* <IconPaperclip /> */}
            </button>
            <button
              type="button"
              className="text-xl text-muted-foreground border-0 btn hover:text-foreground transition-colors"
              disabled={!selectedConversation}
            >
              {/* <IconEmoji /> */}
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
