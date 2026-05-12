"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Bell, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopBarProps {
  userName: string;
  userEmail: string;
  role: "admin" | "teacher";
  pageTitle?: string;
}

export default function TopBar({ userName, userEmail, role, pageTitle }: TopBarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Page title */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">{pageTitle ?? "Dashboard"}</h2>
      </div>

      {/* Right: User actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell (UI only for MVP) */}
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
          <Bell className="w-5 h-5" />
        </Button>

        {/* User avatar + name */}
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-800 leading-tight">{userName}</p>
            <p className="text-xs text-gray-500 capitalize">{role}</p>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-1.5" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
