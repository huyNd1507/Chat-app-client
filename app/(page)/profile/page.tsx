"use client"

import MainLayout from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/services/auth";
import { AxiosResponse } from "axios";

interface User {
  id: string;
  email: string;
  fullname: string;
  avatar?: string;
  phoneNumber?: string;
  bio?: string;
}

interface ApiResponse {
  data: User;
  message: string;
  status: number;
}

const ProfilePage = () => {
  const { data: userData } = useQuery<AxiosResponse<ApiResponse>>({
    queryKey: ['user'],
    queryFn: getMe,
    staleTime: 0,
    gcTime: 0,
  });

  const { user } = useUser();

  return (
    <MainLayout>
      <div className="lg:w-[390px]">
        <div className="p-6">
          <h4 className="mb-0 font-bold text-foreground">My Profile</h4>
          <Avatar className="w-[90px] h-[90px] mx-auto border-2 border-border mt-6">
            <AvatarImage src={user?.avatar || "https://github.com/shadcn.png"} />
            <AvatarFallback>{user?.fullname?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <h4 className="mb-0 font-bold text-foreground pt-3 text-center">
            {user?.fullname}
          </h4>
        </div>

        <Separator />

        <div className="p-6 space-y-6">
          <div>
            <Label htmlFor="name" className="text-muted-foreground">
              Name
            </Label>
            <h4 className="scroll-m-20 text-[16px] font-[500] tracking-tight text-foreground">
              {user?.fullname}
            </h4>
          </div>
          <div>
            <Label htmlFor="email" className="text-muted-foreground">
              Email
            </Label>
            <h4 className="scroll-m-20 text-[16px] font-[500] tracking-tight text-foreground">
              {user?.email}
            </h4>
          </div>
          <div>
            <Label htmlFor="phone" className="text-muted-foreground">
              Phone Number
            </Label>
            <h4 className="scroll-m-20 text-[16px] font-[500] tracking-tight text-foreground">
              {user?.phoneNumber}
            </h4>
          </div>
          <div>
            <Label htmlFor="bio" className="text-muted-foreground">
              Bio
            </Label>
            <h4 className="scroll-m-20 text-[16px] font-[500] tracking-tight text-foreground">
              {user?.bio}
            </h4>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
