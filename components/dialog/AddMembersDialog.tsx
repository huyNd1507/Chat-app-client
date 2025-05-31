"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconSearch } from "@/components/icons/search";
import { IconX } from "@/components/icons/x";
import { getContacts } from "@/services/user";
import { AddParticipantConversation } from "@/services/conversation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/user";
import { useToast } from "../ui/use-toast";

interface AddMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  existingMembers: string[];
  isOwner: boolean;
}

export default function AddMembersDialog({
  isOpen,
  onClose,
  conversationId,
  existingMembers,
  isOwner,
}: AddMembersDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => getContacts(),
  });

  const addMembersMutation = useMutation({
    mutationFn: (participants: string[]) =>
      AddParticipantConversation(conversationId, { participants }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
      toast({
        variant: "default",
        title: "Thêm thành viên thành công!",
      });
      setSelectedUsers([]);
      setSearchQuery("");
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Thêm thành viên thất bại",
        description:
          error.response?.data?.message || "Có lỗi xảy ra khi thêm thành viên",
      });
    },
  });

  const users = Array.isArray(contacts?.data?.data?.users)
    ? contacts.data?.data?.users
    : [];
  const filteredUsers = users.filter(
    (user: User) =>
      !existingMembers.includes(user.id) &&
      (user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMembers = () => {
    if (selectedUsers.length > 0) {
      addMembersMutation.mutate(selectedUsers);
    }
  };

  if (!isOwner) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Members
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <IconX className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-4 max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user: User) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-2 hover:bg-accent rounded-lg cursor-pointer"
                    onClick={() => handleSelectUser(user.id)}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border ${
                        selectedUsers.includes(user.id)
                          ? "bg-primary border-primary"
                          : "border-input"
                      }`}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.fullname}</p>
                      <p className="text-xs text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMembers}
              disabled={
                selectedUsers.length === 0 || addMembersMutation.isPending
              }
            >
              {addMembersMutation.isPending
                ? "Adding..."
                : `Add ${
                    selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""
                  }`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
