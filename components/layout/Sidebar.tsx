"use client";

import { Conversation } from "@/types/conversation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconImage } from "@/components/icons/image";
import { IconFile } from "@/components/icons/file";
import { IconLink } from "@/components/icons/link";
import { IconUser } from "@/components/icons/user";
import { IconTrash } from "@/components/icons/trash";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import {
  deleteParticipantConversation,
  LeaveConversation,
} from "@/services/conversation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AddMembersDialog from "../dialog/AddMembersDialog";
import { IconX } from "@/components/icons/x";

interface SidebarProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ conversation, isOpen, onClose }: SidebarProps) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);

  const otherParticipant = conversation.participants.find(
    (p) => p.user._id !== user?.data?.id
  );

  const name =
    conversation.type === "direct"
      ? otherParticipant?.user.username
      : conversation.name || "Unnamed Group";

  const avatar =
    conversation.type === "direct"
      ? otherParticipant?.user.avatar
      : conversation.avatar;

  const isOwner = conversation.admins?.some(
    (admin) => admin.user === user?.data?.id && admin.role === "owner"
  );

  const removeMemberMutation = useMutation({
    mutationFn: (participantId: string) =>
      deleteParticipantConversation(conversation._id, {
        participants: [participantId],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversation._id],
      });
      toast.success("Member removed successfully");
    },
    onError: (error) => {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: () => LeaveConversation(conversation._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push("/chat");
      toast.success("Left group successfully");
    },
    onError: (error) => {
      console.error("Error leaving group:", error);
      toast.error("Failed to leave group");
    },
  });

  const handleRemoveMember = (participantId: string) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      removeMemberMutation.mutate(participantId);
    }
  };

  const handleLeaveGroup = () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      leaveGroupMutation.mutate();
    }
  };

  return (
    <div
      className={`fixed lg:relative right-0 top-0 h-[calc(100vh)] w-[320px] bg-background border-l border-border transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition-colors lg:hidden"
          aria-label="Close sidebar"
        >
          <IconX className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-border">
          <div className="flex flex-col items-center">
            <Avatar className="w-20 h-20 mb-4 border-2 border-primary">
              <AvatarImage src={avatar} />
              <AvatarFallback>{name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{name}</h3>
            <p className="text-muted-foreground">
              {conversation.type === "direct" ? "Direct Message" : "Group Chat"}
            </p>
            {conversation.type === "group" && user?.data?.id && !isOwner && (
              <Button
                variant="destructive"
                className="mt-4"
                onClick={handleLeaveGroup}
                disabled={leaveGroupMutation.isPending}
              >
                {leaveGroupMutation.isPending ? "Leaving..." : "Leave Group"}
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">
                  <IconUser className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="media">
                  <IconImage className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="files">
                  <IconFile className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="links">
                  <IconLink className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">About</h4>
                    <p className="text-sm text-muted-foreground">
                      {conversation.description || "No description available"}
                    </p>
                  </div>
                  {conversation.type === "group" && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Members</h4>
                        {conversation.admins?.some(
                          (admin) =>
                            admin.user === user?.data?.id &&
                            admin.role === "owner"
                        ) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAddMembersOpen(true)}
                          >
                            Add Members
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {conversation.participants.map((participant) => {
                          const isParticipantOwner = conversation.admins?.some(
                            (admin) =>
                              admin.user === participant.user._id &&
                              admin.role === "owner"
                          );
                          return (
                            <div
                              key={participant.user._id}
                              className="flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={participant.user.avatar} />
                                  <AvatarFallback>
                                    {participant.user.username
                                      ?.charAt(0)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm">
                                    {participant.user.username}
                                  </span>
                                  {isParticipantOwner && (
                                    <span className="text-xs text-primary">
                                      Owner
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isOwner && !isParticipantOwner && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() =>
                                    handleRemoveMember(participant.user._id)
                                  }
                                  disabled={removeMemberMutation.isPending}
                                >
                                  <IconTrash className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="media" className="mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm text-muted-foreground">
                    No media shared yet
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="files" className="mt-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No files shared yet
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="links" className="mt-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No links shared yet
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <AddMembersDialog
        isOpen={isAddMembersOpen}
        onClose={() => setIsAddMembersOpen(false)}
        conversationId={conversation._id}
        existingMembers={conversation.participants.map((p) => p.user._id)}
        isOwner={!!isOwner}
      />
    </div>
  );
};

export default Sidebar;
