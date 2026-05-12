"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit, UserCheck, Loader2, Plus } from "lucide-react";
import {
  formatDate, formatCurrency, getStudentStatusColor,
  getPaymentStatusColor, getPerformanceColor, getAttendanceStatusColor,
} from "@/lib/utils";
import { toast } from "sonner";
import type { Student, Enrollment, Course, Batch, Fee, ProgressLog } from "@/types";

interface FullStudent extends Student {
  guardians: { id: string; guardian_name: string; relation?: string; phone: string; alternate_phone?: string; emergency_contact?: string }[];
  enrollments: (Enrollment & { course: Course; batch: Batch })[];
  fees: Fee[];
  progress_logs: ProgressLog[];
  documents: { id: string; document_type?: string; file_name?: string }[];
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<FullStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [enrollForm, setEnrollForm] = useState({ course_id: "", batch_id: "" });
  const [enrolling, setEnrolling] = useState(false);

  const fetchStudent = async () => {
    const res = await fetch(`/api/students/${params.id}`);
    if (!res.ok) { router.push("/admin/students"); return; }
    const json = await res.json();
    setStudent(json.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudent();
    fetch("/api/courses").then((r) => r.json()).then((d) => setCourses(d.data ?? []));
    fetch("/api/batches").then((r) => r.json()).then((d) => setBatches(d.data ?? []));
  }, []);

  const updateStatus = async (status: string) => {
    await fetch(`/api/students/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast.success("Status updated!");
    fetchStudent();
  };

  const handleEnroll = async () => {
    if (!enrollForm.course_id) { toast.error("Please select a course."); return; }
    setEnrolling(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: params.id,
          course_id: enrollForm.course_id,
          batch_id: enrollForm.batch_id || null,
          status: "active",
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Enrolled successfully!");
      setEnrollDialogOpen(false);
      fetchStudent();
    } catch {
      toast.error("Failed to enroll.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 animate-spin text-indigo-600" /></div>;
  }

  if (!student) return null;

  const guardian = student.guardians?.[0];
  const latestEnrollment = student.enrollments?.[0];
  const attendancePct = 0; // Would need separate attendance fetch

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{student.full_name}</h1>
          <p className="text-gray-500 text-sm">{student.phone} · Joined {formatDate(student.admission_date)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`status-pill capitalize ${getStudentStatusColor(student.status)}`}>
            {student.status}
          </span>
          <Select value={student.status} onValueChange={updateStatus}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["pending", "active", "inactive", "completed", "dropped"].map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basic">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="guardian">Guardian</TabsTrigger>
          <TabsTrigger value="courses">Courses ({student.enrollments?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="fees">Fees ({student.fees?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Basic Info */}
        <TabsContent value="basic">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Gender", value: student.gender },
                { label: "Date of Birth", value: formatDate(student.date_of_birth) },
                { label: "Age", value: student.age ? `${student.age} years` : "—" },
                { label: "Phone", value: student.phone },
                { label: "Alternate Phone", value: student.alternate_phone ?? "—" },
                { label: "Email", value: student.email ?? "—" },
                { label: "Address", value: student.address ?? "—" },
                { label: "City", value: student.city ?? "—" },
                { label: "State", value: student.state ?? "—" },
                { label: "PIN Code", value: student.pin_code ?? "—" },
                { label: "Education", value: student.education_level ?? "—" },
                { label: "School/Work Status", value: student.school_college_work_status ?? "—" },
                { label: "Referral Source", value: student.referral_source ?? "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                  <p className="font-medium text-gray-900">{value}</p>
                </div>
              ))}
              {student.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-0.5">Notes</p>
                  <p className="text-gray-700">{student.notes}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Guardian */}
        <TabsContent value="guardian">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {guardian ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Guardian Name", value: guardian.guardian_name },
                  { label: "Relation", value: guardian.relation ?? "—" },
                  { label: "Mobile", value: guardian.phone },
                  { label: "Alternate Mobile", value: guardian.alternate_phone ?? "—" },
                  { label: "Emergency Contact", value: guardian.emergency_contact ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className="font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No guardian information.</p>
            )}
          </div>
        </TabsContent>

        {/* Courses / Enrollments */}
        <TabsContent value="courses">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => setEnrollDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-1" /> Enroll in Course
              </Button>
            </div>
            {student.enrollments?.length > 0 ? (
              <div className="space-y-3">
                {student.enrollments.map((e) => (
                  <div key={e.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{(e.course as Course)?.course_name}</p>
                      <p className="text-xs text-gray-500">{(e.batch as Batch)?.batch_name ?? "No batch"} · {formatDate(e.enrollment_date)}</p>
                    </div>
                    <span className={`status-pill capitalize text-xs ${
                      e.status === "active" ? "bg-green-100 text-green-700" :
                      e.status === "completed" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"}`}>
                      {e.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm">Not enrolled in any course yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Fees */}
        <TabsContent value="fees">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {student.fees?.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Total Fee</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Paid</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Balance</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {student.fees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{formatCurrency(fee.final_fee)}</td>
                      <td className="px-4 py-3 text-green-600">{formatCurrency(fee.amount_paid)}</td>
                      <td className="px-4 py-3 text-red-600 font-medium">{formatCurrency(fee.balance_amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`status-pill capitalize ${getPaymentStatusColor(fee.payment_status)}`}>
                          {fee.payment_status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">No fee records yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Progress */}
        <TabsContent value="progress">
          <div className="space-y-3">
            {student.progress_logs?.length > 0 ? (
              student.progress_logs.map((log) => (
                <div key={log.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 text-sm">{log.module_name ?? "General"}</p>
                    {log.performance_level && (
                      <span className={`status-pill text-xs capitalize ${getPerformanceColor(log.performance_level)}`}>
                        {log.performance_level.replace("_", " ")}
                      </span>
                    )}
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Completion</span><span>{log.completion_percentage ?? 0}%</span>
                    </div>
                    <Progress value={log.completion_percentage ?? 0} className="h-2" />
                  </div>
                  {log.teacher_remarks && (
                    <p className="text-xs text-gray-500 italic">&ldquo;{log.teacher_remarks}&rdquo;</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatDate(log.created_at)}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm">No progress logs yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Enroll Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Enroll in Course</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Course *</Label>
              <Select value={enrollForm.course_id} onValueChange={(v) => setEnrollForm({ ...enrollForm, course_id: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.filter((c) => c.status === "active").map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.course_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Batch (Optional)</Label>
              <Select value={enrollForm.batch_id} onValueChange={(v) => setEnrollForm({ ...enrollForm, batch_id: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select batch" /></SelectTrigger>
                <SelectContent>
                  {batches.filter((b) => b.status === "active" && (!enrollForm.course_id || b.course_id === enrollForm.course_id)).map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.batch_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollDialogOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enrolling...</> : "Enroll"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
