import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const student_id = searchParams.get("student_id");
    const batch_id = searchParams.get("batch_id");
    const date = searchParams.get("date");

    let query = supabase
      .from("attendance")
      .select("*, student:students(full_name, phone)")
      .order("attendance_date", { ascending: false });

    if (student_id) query = query.eq("student_id", student_id);
    if (batch_id) query = query.eq("batch_id", batch_id);
    if (date) query = query.eq("attendance_date", date);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { batch_id, attendance_date, records } = body;

    if (!batch_id || !attendance_date || !Array.isArray(records)) {
      return NextResponse.json({ error: "batch_id, attendance_date, and records are required" }, { status: 400 });
    }

    // Get user profile for marked_by
    const { data: profile } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    // Upsert attendance records (handles re-marking)
    const payload = records.map((r: { student_id: string; status: string; remarks?: string }) => ({
      student_id: r.student_id,
      batch_id,
      attendance_date,
      status: r.status,
      remarks: r.remarks ?? null,
      marked_by: profile?.id ?? null,
    }));

    const { data, error } = await supabase
      .from("attendance")
      .upsert(payload, { onConflict: "student_id,batch_id,attendance_date" })
      .select();

    if (error) throw error;
    return NextResponse.json({ data, count: data.length }, { status: 201 });
  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
