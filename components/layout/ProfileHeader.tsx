"use client";

import { IconArrowLeft } from "@/components/icons/arrow-left";
import { IconEdit } from "@/components/icons/edit";
import { IconCheck } from "@/components/icons/check";
import { IconX } from "@/components/icons/x";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ProfileHeaderProps {
  title: string;
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  title,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    router.push("/");
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <button
            onClick={handleBackClick}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-accent transition-colors"
            aria-label="Back to conversations"
          >
            <IconArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <h4 className="mb-0 font-bold text-foreground">{title}</h4>
      </div>
      <div>
        {!isEditing ? (
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <IconEdit className="w-4 h-4" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onSave}>
              <IconCheck className="w-4 h-4 text-green-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <IconX className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
