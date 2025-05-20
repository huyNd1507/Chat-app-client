import { useMutation, useQuery } from "@tanstack/react-query";
import { login, logout, getMe } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AxiosResponse } from "axios";
import { queryClient } from "@/lib/react-query";
import { useToast } from "@/components/ui/use-toast";

interface UserData {
  id: string;
  username: string;
  email: string;
  fullname: string;
  avatar: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: UserData;
}

export const useAuth = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Query to check authentication status
  const { data: userData, isLoading } = useQuery<AxiosResponse<AuthResponse>>({
    queryKey: ["user"],
    queryFn: getMe,
    retry: false,
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Update authentication state when user data changes
  useEffect(() => {
    if (userData?.data?.data) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [userData]);

  // Login mutation
  const loginMutation = useMutation<AxiosResponse<AuthResponse>, Error, { email: string; password: string }>({
    mutationFn: login,
    onSuccess: (response) => {
  
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: "Đăng nhập thành công",
        description: response.data.message,
      });
      router.push("/");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Đăng nhập thất bại",
        description: error.response?.message || "Có lỗi xảy ra khi đăng nhập",
      });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {

      await queryClient.resetQueries();
    
      queryClient.setQueryData(["user"], null);
      setIsAuthenticated(false);
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống",
      });
      router.push("/login");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Đăng xuất thất bại",
        description: error.response?.data?.message || "Có lỗi xảy ra khi đăng xuất",
      });
    }
  });

  return {
    user: userData?.data?.data,
    isAuthenticated,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
  };
}; 