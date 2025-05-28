"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getContacts } from "@/services/user";
import { createConversation } from "@/services/conversation";
import { useRouter } from "next/navigation";
import { IconSearch } from "../icons/search";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateGroupDialog({
  open,
  onOpenChange,
}: CreateGroupDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");

  const { data: contacts } = useQuery({
    queryKey: ["contacts", searchQuery],
    queryFn: () => getContacts({ q: searchQuery }),
  });

  // Filter out current user from contacts list
  const filteredContacts = contacts?.data?.data?.users?.filter(
    (users: any) => users.id !== user?.data?.id
  );

  const handleParticipantSelect = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (selectedParticipants.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }

    try {
      const response = await createConversation({
        type: "group",
        name: groupName.trim(),
        description: description.trim(),
        participants: selectedParticipants,
      });

      // Invalidate conversations query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // Navigate to the new group chat
      router.push(`/chat/${response.data._id}`);
      onOpenChange(false);

      // Reset form
      setGroupName("");
      setDescription("");
      setSelectedParticipants([]);
      setSearchQuery("");

      toast.success("Group created successfully!");
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description"
            />
          </div>
          <div className="grid gap-2">
            <Label>Add Participants</Label>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search users"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="mt-2 max-h-[200px] overflow-y-auto space-y-2">
              {filteredContacts?.map((user: any) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedParticipants.includes(user.id)
                      ? "bg-primary/10"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => handleParticipantSelect(user.id)}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.username}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateGroup}>Create Group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
