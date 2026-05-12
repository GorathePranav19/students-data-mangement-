import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const student_id = searchParams.get("student_id");
    const enrollment_id = searchParams.get("enrollment_id");

    let query = supabase
      .from("progress_logs")
      .select("*, student:students(full_name), enrollment:enrollments(*, course:courses(course_name))")
      .order("created_at", { ascending: false });

    if (student_id) query = query.eq("student_id", student_id);
    if (enrollment_id) query = query.eq("enrollment_id", enrollment_id);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // Get user profile for updated_by
    const { data: profile } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    const { data, error } = await supabase
      .from("progress_logs")
      .insert({ ...body, updated_by: profile?.id ?? null })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
