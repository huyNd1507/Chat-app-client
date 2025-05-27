"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ["/login", "/register", "/forgot-password"];

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.push("/login");
    }

    if (isAuthenticated && publicPaths.includes(pathname)) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return <>{children}</>;
  }

  if (!isAuthenticated && publicPaths.includes(pathname)) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
