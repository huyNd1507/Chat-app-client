"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";

const LoginPage = () => {
  const router = useRouter();
  return (
    <AuthLayout>
      <form className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-balance text-muted-foreground">
              Login to your Acme Inc account
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">User name</Label>
            <Input id="username" type="text" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button
            type="submit"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Sign Up
          </Button>

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <a href="#" className="underline underline-offset-4">
              Sign in
            </a>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};
export default LoginPage;
