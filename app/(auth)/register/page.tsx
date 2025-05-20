"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";
import Link from "next/link";
import { useState } from "react";
import { register } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

const RegisterPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: ""
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (response) => {
      toast({
        title: "Đăng ký thành công",
        description: response.data.message,
      });
      router.push("/login");
    },
    onError: (error: any) => {
      console.log("Register error response:", error.response?.data);
      
      toast({
        variant: "destructive",
        title: "Đăng ký thất bại",
        description: error.response?.data?.message || "Có lỗi xảy ra khi đăng ký",
      });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <AuthLayout>
      <form className="p-6 md:p-8" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Đăng ký tài khoản</h1>
            <p className="text-balance text-muted-foreground">
              Tạo tài khoản mới để bắt đầu
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              type="text" 
              required 
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập username"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fullname">Họ và tên</Label>
            <Input 
              id="fullname" 
              type="text" 
              required 
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Mật khẩu</Label>
            </div>
            <Input 
              id="password" 
              type="password" 
              required 
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Đang xử lý..." : "Đăng ký"}
          </Button>

          <div className="text-center text-sm">
            Đã có tài khoản?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Đăng nhập
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
