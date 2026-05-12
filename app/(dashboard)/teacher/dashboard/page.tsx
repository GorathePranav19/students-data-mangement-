import { requireAdmin, getUserProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import StatCard from "@/components/dashboard/StatCard";
import { Calendar, Users, CheckSquare, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { Batch } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Teacher Dashboard" };

export default async function TeacherDashboardPage() {
  const profile = await getUserProfile();
  if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
    return <div>Unauthorized</div>;
  }

  const supabase = await createServerSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  const [
    { data: myBatches },
    { count: myStudentsCount },
    { count: attendancePending },
  ] = await Promise.all([
    supabase
      .from("batches")
      .select("*, course:courses(course_name)")
      .eq("teacher_id", profile.id)
      .eq("status", "active"),
    supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .in(
        "batch_id",
        (await supabase.from("batches").select("id").eq("teacher_id", profile.id)).data?.map((b) => b.id) ?? []
      ),
    supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .in(
        "batch_id",
        (await supabase.from("batches").select("id").eq("teacher_id", profile.id)).data?.map((b) => b.id) ?? []
      ),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back, {profile.full_name}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Batches"
          value={myBatches?.length ?? 0}
          icon={Calendar}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="My Students"
          value={myStudentsCount ?? 0}
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Attendance Today"
          value="Mark Now"
          icon={CheckSquare}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          subtitle="Go to Attendance tab"
        />
        <StatCard
          title="Progress Updates"
          value="Update"
          icon={TrendingUp}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          subtitle="Go to Progress tab"
        />
      </div>

      {/* My Batches */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">My Active Batches</h2>
          <Link href="/teacher/attendance" className="text-sm text-indigo-600 hover:underline font-medium">
            Mark Attendance →
          </Link>
        </div>
        {myBatches && myBatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myBatches.map((batch: Batch) => (
              <div key={batch.id} className="border border-gray-100 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{batch.batch_name}</p>
                <p className="text-indigo-600 text-sm">{(batch.course as { course_name: string })?.course_name}</p>
                <p className="text-xs text-gray-500 mt-2">{batch.batch_time} · {batch.days_of_week}</p>
                <Link href="/teacher/attendance"
                  className="mt-3 block text-center text-xs bg-indigo-50 text-indigo-600 font-medium py-1.5 rounded-md hover:bg-indigo-100 transition-colors">
                  Mark Attendance
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No batches assigned yet. Contact admin.</p>
        )}
      </div>
    </div>
  );
}
