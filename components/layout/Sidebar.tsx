"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  ClipboardList,
  DollarSign,
  BarChart3,
  UserCog,
  FileText,
  GraduationCap,
  TrendingUp,
  CheckSquare,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Admissions", href: "/admin/admissions", icon: FileText },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Batches", href: "/admin/batches", icon: Calendar },
  { label: "Attendance", href: "/admin/attendance", icon: CheckSquare },
  { label: "Fees", href: "/admin/fees", icon: DollarSign },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Teachers", href: "/admin/users", icon: UserCog },
];

const teacherNavItems: NavItem[] = [
  { label: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
  { label: "My Batches", href: "/teacher/batches", icon: GraduationCap },
  { label: "Attendance", href: "/teacher/attendance", icon: ClipboardList },
  { label: "Progress", href: "/teacher/progress", icon: TrendingUp },
];

interface SidebarProps {
  role: "admin" | "teacher";
  userName: string;
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "admin" ? adminNavItems : teacherNavItems;

  return (
    <aside className="w-64 flex-shrink-0 gradient-sidebar min-h-screen flex flex-col">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Computer Class</h1>
            <p className="text-indigo-300 text-xs">Management System</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3 border-b border-white/10">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/30 text-indigo-200 capitalize">
          {role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive && "sidebar-link-active"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-400/30 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{userName}</p>
            <p className="text-indigo-300 text-xs capitalize">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
