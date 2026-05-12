import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      { count: completedStudents },
    ] = await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("students").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("students").select("*", { count: "exact", head: true }).gte("admission_date", thisMonthStart),
      supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("batches").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("attendance").select("*", { count: "exact", head: true }).eq("attendance_date", today).eq("status", "present"),
      supabase.from("fees").select("balance_amount").in("payment_status", ["not_paid", "partial"]),
      supabase.from("students").select("*", { count: "exact", head: true }).eq("status", "completed"),
    ]);

    const totalPendingFee = pendingFeeData?.reduce((s, f) => s + (f.balance_amount || 0), 0) ?? 0;

    return NextResponse.json({
      totalStudents: totalStudents ?? 0,
      activeStudents: activeStudents ?? 0,
      newAdmissionsThisMonth: newAdmissions ?? 0,
      totalCourses: totalCourses ?? 0,
      activeBatches: activeBatches ?? 0,
      attendanceToday: attendanceToday ?? 0,
      totalPendingFee,
      completedStudents: completedStudents ?? 0,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
