"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CheckSquare, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { getAttendanceStatusColor } from "@/lib/utils";
import type { Batch, Enrollment } from "@/types";

type AttendanceStatus = "present" | "absent" | "late" | "leave";

interface AttendanceRecord {
  student_id: string;
  student_name: string;
  student_phone: string;
  status: AttendanceStatus;
  remarks: string;
}

export default function TeacherAttendancePage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/batches")
      .then((r) => r.json())
      .then((d) => setBatches(d.data ?? []));
  }, []);

  const loadStudents = useCallback(async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      // Get enrolled students
      const res = await fetch(`/api/enrollments?batch_id=${selectedBatch}`);
      const json = await res.json();
      const enrollments: Enrollment[] = json.data ?? [];

      // Get existing attendance for this date
      const attRes = await fetch(`/api/attendance?batch_id=${selectedBatch}&date=${selectedDate}`);
      const attJson = await attRes.json();
      const existing: Record<string, AttendanceStatus> = {};
      (attJson.data ?? []).forEach((a: { student_id: string; status: AttendanceStatus }) => {
        existing[a.student_id] = a.status;
      });

      setRecords(
        enrollments.map((e) => ({
          student_id: e.student_id,
          student_name: (e.student as { full_name: string })?.full_name ?? "—",
          student_phone: (e.student as { phone: string })?.phone ?? "",
          status: existing[e.student_id] ?? "present",
          remarks: "",
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [selectedBatch, selectedDate]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const updateRecord = (studentId: string, field: "status" | "remarks", value: string) => {
    setRecords((prev) =>
      prev.map((r) => r.student_id === studentId ? { ...r, [field]: value } : r)
    );
  };

  const markAll = (status: AttendanceStatus) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSave = async () => {
    if (!selectedBatch || records.length === 0) {
      toast.error("Select a batch and load students first.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_id: selectedBatch,
          attendance_date: selectedDate,
          records: records.map(({ student_id, status, remarks }) => ({ student_id, status, remarks })),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Attendance saved for ${records.length} students!`);
    } catch {
      toast.error("Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500 text-sm">Select batch and date, then mark each student</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Select Batch</Label>
            <Select value={selectedBatch} onValueChange={(v) => setSelectedBatch(v ?? "")}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.batch_name} ({(b.course as { course_name: string })?.course_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date</Label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {records.length > 0 && (
            <div className="flex items-end gap-2">
              <Button variant="outline" size="sm" onClick={() => markAll("present")} className="text-green-600 hover:bg-green-50">
                All Present
              </Button>
              <Button variant="outline" size="sm" onClick={() => markAll("absent")} className="text-red-600 hover:bg-red-50">
                All Absent
              </Button>
            </div>
          )}
        </div>

        {/* Summary */}
        {records.length > 0 && (
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100 text-sm">
            <span className="text-gray-500">Total: <strong>{records.length}</strong></span>
            <span className="text-green-600">Present: <strong>{presentCount}</strong></span>
            <span className="text-red-600">Absent: <strong>{absentCount}</strong></span>
          </div>
        )}
      </div>

      {/* Student list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
      ) : records.length === 0 && selectedBatch ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-400">
          <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No students enrolled in this batch.</p>
        </div>
      ) : records.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Attendance</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((record, idx) => (
                  <tr key={record.student_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{record.student_name}</p>
                      <p className="text-xs text-gray-500">{record.student_phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {(["present", "absent", "late", "leave"] as AttendanceStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateRecord(record.student_id, "status", s)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all
                              ${record.status === s
                                ? getAttendanceStatusColor(s)
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <input
                        type="text"
                        placeholder="Optional remark..."
                        value={record.remarks}
                        onChange={(e) => updateRecord(record.student_id, "remarks", e.target.value)}
                        className="text-xs border border-gray-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-4 border-t border-gray-100 flex justify-end">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Attendance</>}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
