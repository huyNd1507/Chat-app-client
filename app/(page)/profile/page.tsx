"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { updateProfile, getMe } from "@/services/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconEdit } from "@/components/icons/edit";
import { IconCheck } from "@/components/icons/check";
import { IconX } from "@/components/icons/x";
import { IconCopy } from "@/components/icons/copy";
import { toast } from "sonner";
import { IconCamera } from "@/components/icons/camera";
import { uploadFile } from "@/services/upload";

interface UserSettings {
  notifications: {
    messages: boolean;
    groups: boolean;
    calls: boolean;
    mentions: boolean;
  };
  theme: string;
  language: string;
  fontSize: number;
  messagePreview: boolean;
  enterToSend: boolean;
  mediaAutoDownload: boolean;
}

interface UserPrivacy {
  lastSeen: string;
  profilePhoto: string;
  status: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  fullname: string;
  avatar: string;
  coverPhoto: string;
  status: string;
  lastSeen: string;
  contacts: any[];
  privacy: UserPrivacy;
  settings: UserSettings;
  socialLinks: any[];
  badges: any[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: User;
}

interface SocialLink {
  platform: string;
  url: string;
}

const ProfilePage = () => {
  const { user, setUser } = useUser();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullname: user?.data?.fullname || "",
    socialLinks: user?.data?.socialLinks || [],
    avatar: user?.data?.avatar || "",
  });
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);

  console.log("avatar:", user?.data?.avatar);
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => updateProfile(user?.data?.id || "", data),
    onSuccess: async () => {
      // Fetch latest user data after successful update
      try {
        const response = await getMe();
        setUser(response.data);
        queryClient.invalidateQueries({ queryKey: ["user"] });
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } catch (error) {
        console.error("Error fetching updated profile:", error);
        toast.error("Failed to refresh profile data");
      }
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      fullname: user?.data?.fullname || "",
      socialLinks: user?.data?.socialLinks || [],
      avatar: user?.data?.avatar || "",
    });
    setTempAvatar(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialLinkChange = (
    index: number,
    field: keyof SocialLink,
    value: string
  ) => {
    setFormData((prev) => {
      const newSocialLinks = [...prev.socialLinks];
      newSocialLinks[index] = {
        ...newSocialLinks[index],
        [field]: value,
      };
      return {
        ...prev,
        socialLinks: newSocialLinks,
      };
    });
  };

  const addSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "", url: "" }],
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success("Link copied to clipboard");
      },
      () => {
        toast.error("Failed to copy link");
      }
    );
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    try {
      // Upload file first
      const uploadResponse = await uploadFile(file);
      if (!uploadResponse.success || !uploadResponse.files[0]) {
        throw new Error("Upload failed");
      }

      // Set temporary avatar for preview
      setTempAvatar(uploadResponse.files[0].webViewLink);
      // Update formData with new avatar URL
      setFormData((prev) => ({
        ...prev,
        avatar: uploadResponse.files[0].webViewLink,
      }));

      toast.success("Avatar uploaded successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    }
  };

  return (
    <MainLayout>
      <div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h4 className="mb-0 font-bold text-foreground">My Profile</h4>
            {!isEditing ? (
              <Button variant="ghost" size="icon" onClick={handleEdit}>
                <IconEdit className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={handleSave}>
                  <IconCheck className="w-4 h-4 text-green-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <IconX className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>
          <div className="relative w-[150px] h-[150px] mx-auto mt-6">
            <Avatar className="w-[150px] h-[150px] border-2 border-border">
              <AvatarImage
                src={
                  user?.data?.avatar ||
                  tempAvatar ||
                  formData.avatar ||
                  "https://github.com/shadcn.png"
                }
              />
              <AvatarFallback>
                {user?.data?.fullname?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-0 right-0 rounded-full w-8 h-8"
              onClick={handleAvatarClick}
            >
              <IconCamera className="w-4 h-4" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          {isEditing ? (
            <Input
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="mt-3 text-center"
            />
          ) : (
            <h4 className="mb-0 font-bold text-foreground pt-3 text-center">
              {user?.data?.fullname}
            </h4>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div>
            <Label htmlFor="username" className="text-muted-foreground">
              Username
            </Label>
            <h4 className="scroll-m-20 text-[16px] font-[500] tracking-tight text-foreground">
              {user?.data?.username}
            </h4>
          </div>
          <div>
            <Label htmlFor="email" className="text-muted-foreground">
              Email
            </Label>
            <h4 className="scroll-m-20 text-[16px] font-[500] tracking-tight text-foreground">
              {user?.data?.email}
            </h4>
          </div>
          <div>
            <Label htmlFor="status" className="text-muted-foreground">
              Status
            </Label>
            <h4 className="scroll-m-20 text-[16px] font-[500] tracking-tight text-foreground">
              {user?.data?.status}
            </h4>
          </div>
          <div>
            <Label htmlFor="lastSeen" className="text-muted-foreground">
              Last Seen
            </Label>
            <h4 className="scroll-m-20 text-[16px] font-[500] tracking-tight text-foreground">
              {new Date(user?.data?.lastSeen || "").toLocaleString()}
            </h4>
          </div>
          <div>
            <Label htmlFor="theme" className="text-muted-foreground">
              Theme
            </Label>
            <h4 className="scroll-m-20 text-[16px] font-[500] tracking-tight text-foreground">
              {user?.data?.settings?.theme}
            </h4>
          </div>
          <div>
            <Label htmlFor="language" className="text-muted-foreground">
              Language
            </Label>
            <h4 className="scroll-m-20 text-[16px] font-[500] tracking-tight text-foreground">
              {user?.data?.settings?.language}
            </h4>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="socialLinks" className="text-muted-foreground">
                Social Links
              </Label>
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={addSocialLink}>
                  Add Link
                </Button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                {formData.socialLinks.map((link, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={link.platform}
                        onChange={(e) =>
                          handleSocialLinkChange(
                            index,
                            "platform",
                            e.target.value
                          )
                        }
                        placeholder="Platform (e.g. Facebook, Twitter)"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSocialLink(index)}
                      >
                        <IconX className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <Input
                      value={link.url}
                      onChange={(e) =>
                        handleSocialLinkChange(index, "url", e.target.value)
                      }
                      placeholder="URL (e.g. https://facebook.com/username)"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {user?.data?.socialLinks?.map((link, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="scroll-m-20 text-[16px] font-[500] tracking-tight text-foreground">
                        {link.platform}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(link.url)}
                      >
                        <IconCopy className="w-4 h-4" />
                      </Button>
                    </div>
                    <h4 className="scroll-m-20 text-[14px] font-[400] tracking-tight text-muted-foreground">
                      {link.url}
                    </h4>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
