import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    let query = supabase.from("users").select("*").order("full_name");
    if (role) query = query.eq("role", role);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only admin can create users
    const { data: profile } = await supabase
      .from("users").select("role").eq("auth_id", user.id).single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { full_name, email, phone, password } = await request.json();

    // Create auth user using admin client
    const { createAdminClient } = await import("@/lib/supabase-server");
    const adminClient = createAdminClient();

    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Create user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .insert({ full_name, email, phone, role: "teacher", auth_id: authUser.user.id })
      .select()
      .single();

    if (profileError) throw profileError;
    return NextResponse.json({ data: userProfile }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
