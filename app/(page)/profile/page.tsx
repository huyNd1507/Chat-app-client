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
import { IconX } from "@/components/icons/x";
import { IconCopy } from "@/components/icons/copy";
import { toast } from "sonner";
import { IconCamera } from "@/components/icons/camera";
import { uploadFile } from "@/services/upload";
import ProfileHeader from "@/components/layout/ProfileHeader";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullname: user?.data?.fullname || "",
    socialLinks: user?.data?.socialLinks || [],
    avatar: user?.data?.avatar || "",
  });
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => updateProfile(user?.data?.id || "", data),
    onSuccess: async () => {
      try {
        const response = await getMe();
        setUser(response.data);
        queryClient.invalidateQueries({ queryKey: ["user"] });
        setIsEditing(false);

        toast({
          title: "Profile updated successfully",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching updated profile",
          description:
            error.response?.data?.message || "Failed to refresh profile data",
        });
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error fetching updated profile",
        description:
          error.response?.data?.message || "Failed to refresh profile data",
      });
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
        toast({
          title: "Link copied to clipboard",
        });
      },
      () => {
        toast({
          title: "Failed to copy link",
        });
      }
    );
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Please select an image file",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File size should be less than 5MB",
      });
      return;
    }

    try {
      const uploadResponse = await uploadFile(file);
      if (!uploadResponse.success || !uploadResponse.files[0]) {
        throw new Error("Upload failed");
      }

      setTempAvatar(uploadResponse.files[0].webViewLink);
      setFormData((prev) => ({
        ...prev,
        avatar: uploadResponse.files[0].webViewLink,
      }));

      toast({
        title: "Avatar uploaded successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to upload avatar",
        description: error.response?.data?.message || "Failed to upload avatar",
      });
    }
  };

  return (
    <MainLayout>
      <div className="h-full overflow-y-auto">
        <ProfileHeader
          title="My Profile"
          isEditing={isEditing}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
        />
        <div className="p-6">
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
              placeholder=""
              aria-label="Upload profile image"
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
