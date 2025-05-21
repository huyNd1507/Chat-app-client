"use client";

import { IconSearch } from "@/components/icons/search";
import { IconUsergroupAdd } from "@/components/icons/usergroup-add";
import MainLayout from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { getConversations } from "@/services/conversation";
import { useEffect, useState } from "react";
import { Conversation } from "@/types/conversation";

const RoomPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await getConversations({ type: "group" });
        setConversations(response.data.conversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return (
    <MainLayout>
      <div>
        <div className="p-6 flex justify-between">
          <h4 className="mb-0 font-bold text-foreground">Groups</h4>

          <Dialog>
            <DialogTrigger>
              <IconUsergroupAdd />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="pb-3">Create New Group</DialogTitle>
                <Separator />
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mx-6 px-2 my-6 h-[48px] rounded-lg flex items-center gap-3 border-2">
          <IconSearch />
          <input
            placeholder="Search messages or users"
            className="border-none outline-none focus:outline-none bg-transparent flex-grow h-full"
          />
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No groups yet
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation._id}
                className="flex px-4 items-center justify-between py-4 cursor-pointer hover:bg-accent transition-all ease-in-out border-b border-border rounded-md"
              >
                <div className="flex items-center flex-1 gap-3">
                  <Avatar className="border-[1px] border-blue-200">
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback>
                      {conversation.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-foreground">#{conversation.name}</p>
                </div>
                {conversation.unreadCount?.length > 0 && (
                  <span className="w-5 h-5 bg-red-400 rounded-full float-right text-white text-xs flex items-center justify-center">
                    {conversation.unreadCount[0].count}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default RoomPage;
