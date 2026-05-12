import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Papa from "papaparse";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? "students";

    let csvData: Record<string, unknown>[] = [];
    let filename = "export.csv";

    if (type === "students") {
      const { data } = await supabase
        .from("students")
        .select("full_name, gender, age, phone, email, city, state, education_level, status, admission_date")
        .order("full_name");
      csvData = data ?? [];
      filename = `students_export_${new Date().toISOString().split("T")[0]}.csv`;
    } else if (type === "fees_pending") {
      const { data } = await supabase
        .from("fees")
        .select("student:students(full_name, phone), total_fee, discount, final_fee, amount_paid, balance_amount, payment_status, payment_date")
        .in("payment_status", ["not_paid", "partial"]);
      csvData = (data ?? []).map((f: Record<string, unknown>) => ({
        student_name: (f.student as { full_name: string })?.full_name,
        phone: (f.student as { phone: string })?.phone,
        total_fee: f.total_fee,
        discount: f.discount,
        final_fee: f.final_fee,
        amount_paid: f.amount_paid,
        balance_amount: f.balance_amount,
        payment_status: f.payment_status,
      }));
      filename = `pending_fees_${new Date().toISOString().split("T")[0]}.csv`;
    } else if (type === "attendance") {
      const { data } = await supabase
        .from("attendance")
        .select("attendance_date, status, student:students(full_name, phone), batch:batches(batch_name)")
        .order("attendance_date", { ascending: false })
        .limit(1000);
      csvData = (data ?? []).map((a: Record<string, unknown>) => ({
        date: a.attendance_date,
        student: (a.student as { full_name: string })?.full_name,
        phone: (a.student as { phone: string })?.phone,
        batch: (a.batch as { batch_name: string })?.batch_name,
        status: a.status,
      }));
      filename = `attendance_${new Date().toISOString().split("T")[0]}.csv`;
    }

    const csv = Papa.unparse(csvData);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
