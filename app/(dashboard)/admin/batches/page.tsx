"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit, Calendar, Users, Loader2, Clock } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { batchSchema, type BatchFormValues } from "@/lib/validations";
import { toast } from "sonner";
import type { Batch, Course, User } from "@/types";
import { formatDate } from "@/lib/utils";

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } =
    useForm<BatchFormValues>({ resolver: zodResolver(batchSchema) });

  const fetchData = async () => {
    const [bRes, cRes, tRes] = await Promise.all([
      fetch("/api/batches"),
      fetch("/api/courses"),
      fetch("/api/users?role=teacher"),
    ]);
    const [bJson, cJson, tJson] = await Promise.all([bRes.json(), cRes.json(), tRes.json()]);
    setBatches(bJson.data ?? []);
    setCourses((cJson.data ?? []).filter((c: Course) => c.status === "active"));
    setTeachers(tJson.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditingBatch(null);
    reset({ max_students: 30, status: "active" });
    setDialogOpen(true);
  };

  const openEdit = (batch: Batch) => {
    setEditingBatch(batch);
    reset({
      batch_name: batch.batch_name,
      course_id: batch.course_id,
      teacher_id: batch.teacher_id ?? "",
      start_date: batch.start_date ?? "",
      end_date: batch.end_date ?? "",
      batch_time: batch.batch_time ?? "",
      days_of_week: batch.days_of_week ?? "",
      max_students: batch.max_students,
      status: batch.status,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: BatchFormValues) => {
    setSaving(true);
    try {
      const method = editingBatch ? "PATCH" : "POST";
      const url = editingBatch ? `/api/batches/${editingBatch.id}` : "/api/batches";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success(editingBatch ? "Batch updated!" : "Batch created!");
      setDialogOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to save batch.");
    } finally {
      setSaving(false);
    }
  };

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
          <p className="text-gray-500 text-sm">{batches.length} batches</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Batch
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <div key={batch.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <span className={`status-pill capitalize ${statusColor[batch.status] ?? ""}`}>
                  {batch.status}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">{batch.batch_name}</h3>
              <p className="text-xs text-indigo-600 mt-0.5">{(batch.course as Course)?.course_name}</p>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {batch.batch_time ?? "—"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {(batch.teacher as User)?.full_name ?? "No teacher"} · Max {batch.max_students}
                </div>
                {batch.start_date && (
                  <div>{formatDate(batch.start_date)} → {batch.end_date ? formatDate(batch.end_date) : "Ongoing"}</div>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => openEdit(batch)}>
                <Edit className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBatch ? "Edit Batch" : "Add New Batch"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Batch Name *</Label>
                <Input {...register("batch_name")} placeholder="e.g. Morning Batch A" className="mt-1" />
                {errors.batch_name && <p className="text-red-500 text-xs mt-1">{errors.batch_name.message}</p>}
              </div>
              <div className="col-span-2">
                <Label>Course *</Label>
                <Controller name="course_id" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.course_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
                {errors.course_id && <p className="text-red-500 text-xs mt-1">{errors.course_id.message}</p>}
              </div>
              <div className="col-span-2">
                <Label>Teacher *</Label>
                <Controller name="teacher_id" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Assign teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
                {errors.teacher_id && <p className="text-red-500 text-xs mt-1">{errors.teacher_id.message}</p>}
              </div>
              <div>
                <Label>Batch Timing *</Label>
                <Input {...register("batch_time")} placeholder="e.g. 9:00 AM - 10:00 AM" className="mt-1" />
                {errors.batch_time && <p className="text-red-500 text-xs mt-1">{errors.batch_time.message}</p>}
              </div>
              <div>
                <Label>Days of Week</Label>
                <Input {...register("days_of_week")} placeholder="e.g. Mon, Wed, Fri" className="mt-1" />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" {...register("start_date")} className="mt-1" />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" {...register("end_date")} className="mt-1" />
              </div>
              <div>
                <Label>Max Students</Label>
                <Input type="number" {...register("max_students")} defaultValue={30} className="mt-1" />
              </div>
              <div>
                <Label>Status</Label>
                <Controller name="status" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Batch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
