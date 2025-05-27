"use client";

import { getConversations } from "@/services/conversation";
import { Conversation } from "@/types/conversation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChatItem } from "../card/ChatItem";
import { IconSearch } from "../icons/search";
import { IconUsergroupAdd } from "../icons/usergroup-add";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSocket } from "@/contexts/SocketContext";
import { useDebounce } from "@/hooks/use-debounce";
import {
  createConversation,
  getConversations as getConversationsService,
} from "@/services/conversation";
import { getContacts } from "@/services/user";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { IconSettings } from "../icons/settings";
import { IconLogout } from "../icons/logout";
import { IconUser } from "../icons/user";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { ThemeToggle } from "../theme/ThemeToggle";
import { IconSettings } from "../icons/settings";

const NavBar = () => {
  const router = useRouter();
  const { onlineUsers } = useSocket();
  const { theme } = useTheme();
  const { user, logout } = useUser();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const queryClient = useQueryClient();

  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(),
  });

  console.log("conversationsData", conversationsData);

  const { data: contacts, isLoading: isContactsLoading } = useQuery({
    queryKey: ["contacts", debouncedSearch],
    queryFn: () => getContacts({ q: debouncedSearch }),
    enabled: isSearchModalOpen,
  });

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleContactClick = async (contactId: string) => {
    try {
      // If clicking on self, redirect to profile
      if (contactId === user?.data?.id) {
        router.push("/profile");
        setIsSearchModalOpen(false);
        return;
      }

      const response = await getConversationsService({ type: "direct" });
      const conversations = response.data.conversations;

      const existingConversation = conversations.find((conv: any) => {
        const participants = conv.participants.map((p: any) => p.user._id);
        return participants.includes(contactId);
      });

      if (existingConversation) {
        router.push(`/chat/${existingConversation._id}`);
        return;
      }

      const newConversation = await createConversation({
        type: "direct",
        participants: [contactId],
      });

      // Invalidate conversations query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });

      router.push(`/chat/${newConversation.data._id}`);
      setIsSearchModalOpen(false);
    } catch (error) {
      console.error("Error handling contact click:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div>
      <div className="px-6 pt-6 flex items-center justify-between">
        <h4 className="mb-0 font-bold text-foreground">Chats</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <IconUsergroupAdd className="w-5 h-5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-accent rounded-full transition-colors">
                <IconSettings className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="cursor-pointer"
              >
                <IconUser className="w-4 h-4 mr-2 " />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <IconSettings className="w-4 h-4 mr-2" />
                    <span>Theme</span>
                  </div>
                  <ThemeToggle />
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 cursor-pointer"
              >
                <IconLogout className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mx-6 px-2 my-6 h-12 rounded-lg flex items-center gap-3 border-2">
        <IconSearch />
        <input
          placeholder="Search messages or users"
          className="border-none outline-none bg-transparent flex-grow h-full"
        />
      </div>
      <Separator />
      <div className="h-[calc(100vh-180px)] overflow-y-auto">
        {isLoading ? (
          <div className="mt-6 text-center text-muted-foreground">
            Loading...
          </div>
        ) : !conversationsData?.data.conversations.length ? (
          <div className="mt-6 text-center text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          <ul>
            {conversationsData.data.conversations.map(
              (conversation: Conversation) => (
                <ChatItem key={conversation._id} conversation={conversation} />
              )
            )}
          </ul>
        )}
      </div>

      <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Find Users</DialogTitle>
          </DialogHeader>
          <div className="px-2 my-4 h-[48px] rounded-lg flex items-center gap-3 border-2">
            <IconSearch />
            <input
              placeholder="Search users"
              className="border-none outline-none focus:outline-none bg-transparent flex-grow h-full"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="mt-4">
            {isContactsLoading ? (
              <div className="text-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <ul className="space-y-2">
                {contacts?.data?.data?.users?.map((contact: any) => (
                  <li
                    onClick={() => handleContactClick(contact?.id)}
                    key={`contact-${contact.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage
                          src={
                            contact.avatar || "https://github.com/shadcn.png"
                          }
                        />
                        <AvatarFallback>
                          {contact.fullname?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {onlineUsers.some(
                        (user) => user.userId === contact.id
                      ) && (
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NavBar;
