"use client";

import { IconSearch } from "@/components/icons/search";
import { IconUsergroupAdd } from "@/components/icons/usergroup-add";
import MainLayout from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSocket } from "@/contexts/SocketContext";
import { useDebounce } from "@/hooks/use-debounce";
import { createConversation, getConversations } from "@/services/conversation";
import { getContacts } from "@/services/user";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

const ContactPage = () => {
  const router = useRouter();
  const { onlineUsers } = useSocket();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts", debouncedSearch],
    queryFn: () => getContacts({ q: debouncedSearch }),
  });

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleContactClick = async (contactId: string) => {
    try {
      const response = await getConversations({ type: "direct" });
      const conversations = response.data.conversations;

      // Check if conversation already exists
      const existingConversation = conversations.find((conv: any) => {
        const participants = conv.participants.map((p: any) => p.user._id);
        return participants.includes(contactId);
      });

      if (existingConversation) {
        router.push(`/`);
        return;
      }

      await createConversation({
        type: "direct",
        participants: [contactId],
      });

      // Navigate to the new conversation
      router.push(`/`);
    } catch (error) {
      console.error("Error handling contact click:", error);
    }
  };

  return (
    <MainLayout>
      <div className="lg:w-[390px] tab-content">
        <div className="p-6 flex justify-between">
          <h4 className="mb-0 font-bold text-foreground">Contacts</h4>
          <IconUsergroupAdd />
        </div>

        <div className="mx-6 px-2 my-6 h-[48px] rounded-lg flex items-center gap-3 border-2">
          <IconSearch />
          <input
            placeholder="Search messages or users"
            className="border-none outline-none focus:outline-none bg-transparent flex-grow h-full"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="px-6">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : (
            <ul className="space-y-2">
              {contacts?.data?.data?.users?.map((contact: any) => (
                <li
                  onClick={() => handleContactClick(contact?.id)}
                  key={contact.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage
                        src={contact.avatar || "https://github.com/shadcn.png"}
                      />
                      <AvatarFallback>
                        {contact.fullname?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {onlineUsers.some((user) => user.userId === contact.id) && (
                      <span className="absolute w-3 h-3 bg-green-500 border-2 border-background rounded-full top-0 right-0 z-50"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium truncate">
                      {contact.username}
                    </h5>
                    <p className="text-xs text-muted-foreground truncate">
                      {contact.email}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
