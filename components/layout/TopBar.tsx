"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Bell, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/layout/Sidebar";

interface TopBarProps {
  userName: string;
  userEmail: string;
  role: "admin" | "teacher";
  pageTitle?: string;
}

export default function TopBar({ userName, userEmail, role, pageTitle }: TopBarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      {/* Left: Mobile Menu + Page title */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="-ml-2 text-gray-500" />}>
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-none">
              <Sidebar 
                role={role} 
                userName={userName} 
                isMobile={true} 
                onNavigate={() => setMobileMenuOpen(false)} 
              />
            </SheetContent>
          </Sheet>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">{pageTitle ?? "Dashboard"}</h2>
      </div>

      {/* Right: User actions */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Notification bell (UI only for MVP) */}
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
          <Bell className="w-5 h-5" />
        </Button>

        {/* User avatar + name */}
        <div className="flex items-center gap-2 ml-1 sm:ml-0">
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
          className="text-gray-500 hover:text-red-600 hover:bg-red-50 ml-1 sm:ml-0"
        >
          <LogOut className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

