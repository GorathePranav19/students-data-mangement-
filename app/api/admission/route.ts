import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { admissionSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = admissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    // Check for duplicate phone number
    const { data: existing } = await supabase
      .from("students")
      .select("id")
      .eq("phone", data.phone)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "A student with this phone number already exists." },
        { status: 409 }
      );
    }

    // Insert student
    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        full_name: data.full_name,
        gender: data.gender,
        date_of_birth: data.date_of_birth || null,
        age: data.age,
        phone: data.phone,
        alternate_phone: data.alternate_phone || null,
        email: data.email || null,
        address: data.address,
        city: data.city,
        state: data.state,
        pin_code: data.pin_code || null,
        education_level: data.education_level,
        school_college_work_status: data.school_college_work_status || null,
        referral_source: data.referral_source || null,
        notes: data.notes || null,
        status: "pending",
        admission_date: new Date().toISOString().split("T")[0],
      })
      .select("id")
      .single();

    if (studentError || !student) {
      console.error("Student insert error:", studentError);
      return NextResponse.json({ error: "Failed to submit admission." }, { status: 500 });
    }

    // Insert guardian
    const { error: guardianError } = await supabase.from("guardians").insert({
      student_id: student.id,
      guardian_name: data.guardian_name,
      relation: data.guardian_relation,
      phone: data.guardian_phone,
      alternate_phone: data.guardian_alternate_phone || null,
      emergency_contact: data.emergency_contact || null,
    });

    if (guardianError) {
      console.error("Guardian insert error:", guardianError);
      // Don't fail the whole request — student was created
    }

    // If course selected, create an enrollment record in pending state
    if (data.selected_course_id) {
      await supabase.from("enrollments").insert({
        student_id: student.id,
        course_id: data.selected_course_id,
        status: "pending",
        enrollment_date: new Date().toISOString().split("T")[0],
      });
    }

    return NextResponse.json(
      { success: true, studentId: student.id, message: "Admission submitted successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admission API error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
