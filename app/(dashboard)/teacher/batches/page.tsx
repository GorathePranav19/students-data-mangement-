import { getUserProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";
import { Calendar, Clock, Users } from "lucide-react";
import type { Batch, Course } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Batches" };

export default async function TeacherBatchesPage() {
  const profile = await getUserProfile();
  if (!profile) return null;

  const supabase = await createServerSupabaseClient();
  const { data: batches } = await supabase
    .from("batches")
    .select("*, course:courses(*)")
    .eq("teacher_id", profile.id)
    .order("created_at", { ascending: false });

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Batches</h1>
        <p className="text-gray-500 text-sm">{batches?.length ?? 0} batches assigned to you</p>
      </div>

      {batches && batches.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch: Batch) => (
            <div key={batch.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <span className={`status-pill capitalize ${statusColor[batch.status]}`}>
                  {batch.status}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">{batch.batch_name}</h3>
              <p className="text-indigo-600 text-xs mt-0.5">{(batch.course as Course)?.course_name}</p>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {batch.batch_time ?? "—"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {batch.days_of_week ?? "—"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Max {batch.max_students} students
                </div>
              </div>
              <Link
                href="/teacher/attendance"
                className="mt-4 block text-center text-xs bg-indigo-50 text-indigo-600 font-medium py-2 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Mark Attendance →
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-400">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No batches assigned</p>
          <p className="text-sm mt-1">Contact your admin to get batches assigned to you.</p>
        </div>
      )}
    </div>
  );
}
