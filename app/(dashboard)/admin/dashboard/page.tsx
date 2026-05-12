import { requireAdmin, getUserProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import StatCard from "@/components/dashboard/StatCard";
import {
  Users,
  UserPlus,
  BookOpen,
  Calendar,
  DollarSign,
  CheckSquare,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  // ── Fetch stats in parallel ────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [
    { count: totalStudents },
    { count: activeStudents },
    { count: newAdmissions },
    { count: totalCourses },
    { count: activeBatches },
    { count: attendanceToday },
    { data: pendingFeeData },
    { data: recentAdmissions },
  ] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("students").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .gte("admission_date", thisMonthStart),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("batches").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("attendance_date", today)
      .eq("status", "present"),
    supabase
      .from("fees")
      .select("balance_amount")
      .in("payment_status", ["not_paid", "partial"]),
    supabase
      .from("students")
      .select("id, full_name, phone, status, admission_date, city")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalPendingFee = pendingFeeData?.reduce((sum, f) => sum + (f.balance_amount || 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of your computer class — {formatDate(today)}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents ?? 0}
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Active Students"
          value={activeStudents ?? 0}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          title="New This Month"
          value={newAdmissions ?? 0}
          icon={UserPlus}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Active Courses"
          value={totalCourses ?? 0}
          icon={BookOpen}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Active Batches"
          value={activeBatches ?? 0}
          icon={Calendar}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
        <StatCard
          title="Present Today"
          value={attendanceToday ?? 0}
          icon={CheckSquare}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Pending Fees"
          value={formatCurrency(totalPendingFee)}
          icon={DollarSign}
          iconColor="text-red-600"
          iconBg="bg-red-50"
          subtitle="Total outstanding balance"
        />
        <StatCard
          title="Completed Students"
          value="—"
          icon={GraduationCap}
          iconColor="text-gray-500"
          iconBg="bg-gray-100"
        />
      </div>

      {/* Recent Admissions + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Admissions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Admissions</h2>
            <Link
              href="/admin/admissions"
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              View all →
            </Link>
          </div>
          {recentAdmissions && recentAdmissions.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {recentAdmissions.map((s: { id: string; full_name: string; phone: string; status: string; admission_date?: string; city?: string }) => (
                <div key={s.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.full_name}</p>
                    <p className="text-xs text-gray-500">{s.phone} · {s.city}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize
                      ${s.status === "active" ? "bg-green-100 text-green-700" :
                        s.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"}`}
                    >
                      {s.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(s.admission_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No admissions yet.</p>
              <Link href="/admission" className="text-indigo-600 text-xs hover:underline mt-1 block">
                Share admission form →
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: "View All Students", href: "/admin/students", icon: Users, color: "text-indigo-600 bg-indigo-50" },
              { label: "Pending Admissions", href: "/admin/admissions", icon: UserPlus, color: "text-yellow-600 bg-yellow-50" },
              { label: "Manage Courses", href: "/admin/courses", icon: BookOpen, color: "text-purple-600 bg-purple-50" },
              { label: "Manage Batches", href: "/admin/batches", icon: Calendar, color: "text-green-600 bg-green-50" },
              { label: "Fee Reports", href: "/admin/fees", icon: DollarSign, color: "text-red-600 bg-red-50" },
              { label: "Export Reports", href: "/admin/reports", icon: TrendingUp, color: "text-gray-600 bg-gray-50" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
