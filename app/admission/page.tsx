"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { admissionSchema, type AdmissionFormValues } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { BookOpen, ChevronRight, ChevronLeft, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { Course } from "@/types";

const STEPS = [
  { title: "Personal Info", fields: ["full_name", "gender", "date_of_birth", "age"] },
  { title: "Contact", fields: ["phone", "email", "address", "city", "state", "pin_code"] },
  { title: "Guardian", fields: ["guardian_name", "guardian_relation", "guardian_phone"] },
  { title: "Course", fields: ["selected_course_id", "preferred_batch_time"] },
];

export default function AdmissionPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors },
    watch,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<any>({
    resolver: zodResolver(admissionSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => setCourses((d.data ?? []).filter((c: Course) => c.status === "active")));
  }, []);

  const nextStep = async () => {
    const fields = STEPS[step].fields as (keyof AdmissionFormValues)[];
    const valid = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = async (data: AdmissionFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Submission failed. Please try again.");
        return;
      }
      router.push("/admission/success");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const progressPct = ((step) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">Computer Class</h1>
            <p className="text-xs text-gray-500">Student Admission Form</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            {STEPS.map((s, i) => (
              <span key={i} className={i <= step ? "text-indigo-600 font-medium" : ""}>{s.title}</span>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPct + (100 / STEPS.length)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Step {step + 1} of {STEPS.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{STEPS[step].title}</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 0: Personal */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input id="full_name" {...register("full_name")} placeholder="Enter full name" className="mt-1" />
                  {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message as string}</p>}
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Controller name="gender" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="gender" className="mt-1">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                  {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message as string}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input id="date_of_birth" type="date" {...register("date_of_birth")} className="mt-1" />
                    {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth.message as string}</p>}
                  </div>
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input id="age" type="number" {...register("age")} placeholder="Age (no limit!)" className="mt-1" />
                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message as string}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="education_level">Education Level *</Label>
                  <Controller name="education_level" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="education_level" className="mt-1">
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Below 5th", "5th Pass", "8th Pass", "10th Pass", "12th Pass", "Graduate", "Post Graduate", "Dropout", "Never Studied"].map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                  {errors.education_level && <p className="text-red-500 text-xs mt-1">{errors.education_level.message as string}</p>}
                </div>
                <div>
                  <Label htmlFor="school_college_work_status">Current Status</Label>
                  <Input id="school_college_work_status" {...register("school_college_work_status")} placeholder="e.g. 10th Student at XYZ School" className="mt-1" />
                </div>
                <div>
                  <p className="text-xs bg-indigo-50 text-indigo-700 rounded-lg px-3 py-2">
                    🎓 <strong>No age limit!</strong> Students of all ages are welcome — from children to senior citizens.
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Contact */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Mobile Number *</Label>
                  <Input id="phone" {...register("phone")} placeholder="10-digit mobile number" className="mt-1" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message as string}</p>}
                </div>
                <div>
                  <Label htmlFor="alternate_phone">Alternate Mobile</Label>
                  <Input id="alternate_phone" {...register("alternate_phone")} placeholder="Optional" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...register("email")} placeholder="Optional" className="mt-1" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
                </div>
                <div>
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea id="address" {...register("address")} placeholder="House no., street, area..." className="mt-1" rows={2} />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message as string}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" {...register("city")} placeholder="City" className="mt-1" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message as string}</p>}
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" {...register("state")} placeholder="State" className="mt-1" />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message as string}</p>}
                  </div>
                  <div>
                    <Label htmlFor="pin_code">PIN Code</Label>
                    <Input id="pin_code" {...register("pin_code")} placeholder="6-digit PIN" className="mt-1" />
                    {errors.pin_code && <p className="text-red-500 text-xs mt-1">{errors.pin_code.message as string}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Guardian */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="guardian_name">Guardian Name *</Label>
                  <Input id="guardian_name" {...register("guardian_name")} placeholder="Parent/Guardian full name" className="mt-1" />
                  {errors.guardian_name && <p className="text-red-500 text-xs mt-1">{errors.guardian_name.message as string}</p>}
                </div>
                <div>
                  <Label htmlFor="guardian_relation">Relation *</Label>
                  <Controller name="guardian_relation" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="guardian_relation" className="mt-1">
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Father", "Mother", "Brother", "Sister", "Spouse", "Grandparent", "Self", "Other"].map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                  {errors.guardian_relation && <p className="text-red-500 text-xs mt-1">{errors.guardian_relation.message as string}</p>}
                </div>
                <div>
                  <Label htmlFor="guardian_phone">Guardian Mobile *</Label>
                  <Input id="guardian_phone" {...register("guardian_phone")} placeholder="10-digit mobile" className="mt-1" />
                  {errors.guardian_phone && <p className="text-red-500 text-xs mt-1">{errors.guardian_phone.message as string}</p>}
                </div>
                <div>
                  <Label htmlFor="guardian_alternate_phone">Alternate Mobile</Label>
                  <Input id="guardian_alternate_phone" {...register("guardian_alternate_phone")} placeholder="Optional" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <Input id="emergency_contact" {...register("emergency_contact")} placeholder="Emergency contact number" className="mt-1" />
                </div>
              </div>
            )}

            {/* Step 3: Course */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="selected_course_id">Select Course *</Label>
                  <Controller name="selected_course_id" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="selected_course_id" className="mt-1">
                        <SelectValue placeholder="Choose your course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.course_name} — ₹{c.fee_amount} ({c.duration})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                  {errors.selected_course_id && <p className="text-red-500 text-xs mt-1">{errors.selected_course_id.message as string}</p>}
                </div>
                <div>
                  <Label htmlFor="preferred_batch_time">Preferred Batch Time</Label>
                  <Controller name="preferred_batch_time" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="preferred_batch_time" className="mt-1">
                        <SelectValue placeholder="Select time preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Morning (6 AM - 10 AM)", "Forenoon (10 AM - 12 PM)", "Afternoon (12 PM - 3 PM)", "Evening (3 PM - 6 PM)", "Night (6 PM - 9 PM)", "Weekend Only", "Flexible"].map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div>
                  <Label htmlFor="referral_source">How did you hear about us?</Label>
                  <Controller name="referral_source" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="referral_source" className="mt-1">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Friend/Family", "Social Media", "Pamphlet/Banner", "Walk-in", "Website", "WhatsApp", "Other"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea id="notes" {...register("notes")} placeholder="Any special requirements or questions..." className="mt-1" rows={3} />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={nextStep} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-2" />Submit Admission</>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
