import { getUserProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar role={profile.role} userName={profile.full_name} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          userName={profile.full_name}
          userEmail={profile.email}
          role={profile.role}
        />
        <main className="flex-1 overflow-y-auto p-6 fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
