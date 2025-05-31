"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <SocketProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SocketProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
