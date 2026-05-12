import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const teacher_id = searchParams.get("teacher_id");

    let query = supabase
      .from("batches")
      .select("*, course:courses(*), teacher:users(*)")
      .order("created_at", { ascending: false });

    if (teacher_id) {
      query = query.eq("teacher_id", teacher_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { data, error } = await supabase
      .from("batches")
      .insert(body)
      .select("*, course:courses(*), teacher:users(*)")
      .single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create batch" }, { status: 500 });
  }
}
