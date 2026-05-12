"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { TrendingUp, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getPerformanceColor, formatDate } from "@/lib/utils";
import type { Enrollment, ProgressLog } from "@/types";

export default function TeacherProgressPage() {
  const [batches, setBatches] = useState<{ id: string; batch_name: string }[]>([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressLogs, setProgressLogs] = useState<Record<string, ProgressLog[]>>({});
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    module_name: "", completion_percentage: 0, skills_learned: "",
    assignment_status: "", performance_level: "", teacher_remarks: "",
  });

  useEffect(() => {
    fetch("/api/batches")
      .then((r) => r.json())
      .then((d) => setBatches(d.data ?? []));
  }, []);

  const loadEnrollments = useCallback(async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/enrollments?batch_id=${selectedBatch}`);
      const json = await res.json();
      const items: Enrollment[] = json.data ?? [];
      setEnrollments(items);

      // Load progress for each enrollment
      const logs: Record<string, ProgressLog[]> = {};
      await Promise.all(items.map(async (e) => {
        const pRes = await fetch(`/api/progress?enrollment_id=${e.id}`);
        const pJson = await pRes.json();
        logs[e.id] = pJson.data ?? [];
      }));
      setProgressLogs(logs);
    } finally {
      setLoading(false);
    }
  }, [selectedBatch]);

  useEffect(() => { loadEnrollments(); }, [loadEnrollments]);

  const openProgress = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    const latestLog = progressLogs[enrollment.id]?.[0];
    setForm({
      module_name: latestLog?.module_name ?? "",
      completion_percentage: latestLog?.completion_percentage ?? 0,
      skills_learned: latestLog?.skills_learned ?? "",
      assignment_status: latestLog?.assignment_status ?? "",
      performance_level: latestLog?.performance_level ?? "",
      teacher_remarks: latestLog?.teacher_remarks ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedEnrollment) return;
    setSaving(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedEnrollment.student_id,
          enrollment_id: selectedEnrollment.id,
          ...form,
          completion_percentage: Number(form.completion_percentage),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Progress updated!");
      setDialogOpen(false);
      loadEnrollments();
    } catch {
      toast.error("Failed to save progress.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Progress</h1>
        <p className="text-gray-500 text-sm">Update module progress and add remarks for each student</p>
      </div>

      {/* Batch selector */}
      <div className="max-w-xs">
        <Label>Select Batch</Label>
        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Choose a batch" />
          </SelectTrigger>
          <SelectContent>
            {batches.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.batch_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
      ) : enrollments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {enrollments.map((enrollment) => {
            const latestLog = progressLogs[enrollment.id]?.[0];
            const pct = latestLog?.completion_percentage ?? 0;
            return (
              <div key={enrollment.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 stat-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {(enrollment.student as { full_name: string })?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(enrollment.student as { phone: string })?.phone}
                    </p>
                  </div>
                  {latestLog?.performance_level && (
                    <span className={`status-pill capitalize text-xs ${getPerformanceColor(latestLog.performance_level)}`}>
                      {latestLog.performance_level.replace("_", " ")}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{latestLog?.module_name ?? "Not started"}</span>
                    <span>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>

                {latestLog?.teacher_remarks && (
                  <p className="text-xs text-gray-500 italic mb-3 line-clamp-2">
                    &ldquo;{latestLog.teacher_remarks}&rdquo;
                  </p>
                )}

                {latestLog && (
                  <p className="text-xs text-gray-400 mb-3">
                    Last updated: {formatDate(latestLog.created_at)}
                  </p>
                )}

                <Button variant="outline" size="sm" className="w-full" onClick={() => openProgress(enrollment)}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {latestLog ? "Update Progress" : "Add Progress"}
                </Button>
              </div>
            );
          })}
        </div>
      ) : selectedBatch ? (
        <div className="text-center py-12 text-gray-400">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No students in this batch.</p>
        </div>
      ) : null}

      {/* Progress Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && setDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Update Progress — {(selectedEnrollment?.student as { full_name: string })?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Module / Topic</Label>
              <Input value={form.module_name}
                onChange={(e) => setForm({ ...form, module_name: e.target.value })}
                placeholder="e.g. Word Processing - Chapter 3" className="mt-1" />
            </div>
            <div>
              <Label>Completion % ({form.completion_percentage}%)</Label>
              <input type="range" min={0} max={100} value={form.completion_percentage}
                onChange={(e) => setForm({ ...form, completion_percentage: Number(e.target.value) })}
                className="w-full mt-2 accent-indigo-600" />
            </div>
            <div>
              <Label>Performance Level</Label>
              <Select value={form.performance_level} onValueChange={(v) => setForm({ ...form, performance_level: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="needs_support">Needs Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Skills Learned</Label>
              <Input value={form.skills_learned}
                onChange={(e) => setForm({ ...form, skills_learned: e.target.value })}
                placeholder="e.g. Typing, Excel basics" className="mt-1" />
            </div>
            <div>
              <Label>Assignment Status</Label>
              <Input value={form.assignment_status}
                onChange={(e) => setForm({ ...form, assignment_status: e.target.value })}
                placeholder="e.g. Completed, Pending" className="mt-1" />
            </div>
            <div>
              <Label>Teacher Remarks</Label>
              <Textarea value={form.teacher_remarks}
                onChange={(e) => setForm({ ...form, teacher_remarks: e.target.value })}
                placeholder="Add remarks about the student's progress..." className="mt-1" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Progress"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
