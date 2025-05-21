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

  // List of paths that don't require authentication
  const publicPaths = ["/login", "/register", "/forgot-password"];

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return;

    // If not authenticated and trying to access protected route
    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.push("/login");
    }

    // If authenticated and trying to access auth pages
    if (isAuthenticated && publicPaths.includes(pathname)) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show children while loading
  if (isLoading) {
    return <>{children}</>;
  }

  // Allow access to public paths without authentication
  if (!isAuthenticated && publicPaths.includes(pathname)) {
    return <>{children}</>;
  }

  // For protected routes, check authentication
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
