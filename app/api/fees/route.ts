import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("fees")
      .select("*, student:students(full_name, phone, city), enrollment:enrollments(*, course:courses(course_name))")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("payment_status", status);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch fees" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { total_fee, discount = 0, amount_paid = 0 } = body;
    const final_fee = Math.max(0, total_fee - discount);
    const balance_amount = Math.max(0, final_fee - amount_paid);
    const payment_status =
      balance_amount === 0 && final_fee > 0
        ? "paid"
        : amount_paid > 0
        ? "partial"
        : "not_paid";

    const { data, error } = await supabase
      .from("fees")
      .insert({ ...body, final_fee, balance_amount, payment_status })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create fee record" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, total_fee, discount = 0, amount_paid = 0, ...rest } = body;
    const final_fee = Math.max(0, total_fee - discount);
    const balance_amount = Math.max(0, final_fee - amount_paid);
    const payment_status =
      balance_amount === 0 && final_fee > 0
        ? "paid"
        : amount_paid > 0
        ? "partial"
        : "not_paid";

    const { data, error } = await supabase
      .from("fees")
      .update({ total_fee, discount, amount_paid, final_fee, balance_amount, payment_status, ...rest, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update fee" }, { status: 500 });
  }
}
