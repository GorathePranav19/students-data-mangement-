"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit, BookOpen, Loader2, Power } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema, type CourseFormValues } from "@/lib/validations";
import { toast } from "sonner";
import type { Course } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<any>({ resolver: zodResolver(courseSchema) });

  const fetchCourses = async () => {
    const res = await fetch("/api/courses");
    const json = await res.json();
    setCourses(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const openAdd = () => {
    setEditingCourse(null);
    reset({ skill_level: "beginner", status: "active", fee_amount: 0 });
    setDialogOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    reset({
      course_name: course.course_name,
      course_code: course.course_code ?? "",
      category: course.category ?? "",
      description: course.description ?? "",
      duration: course.duration ?? "",
      fee_amount: course.fee_amount,
      skill_level: course.skill_level,
      status: course.status,
      syllabus: course.syllabus ?? "",
      required_tools: course.required_tools ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: CourseFormValues) => {
    setSaving(true);
    try {
      const method = editingCourse ? "PATCH" : "POST";
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : "/api/courses";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success(editingCourse ? "Course updated!" : "Course created!");
      setDialogOpen(false);
      fetchCourses();
    } catch {
      toast.error("Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (course: Course) => {
    const newStatus = course.status === "active" ? "inactive" : "active";
    await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    toast.success(`Course ${newStatus === "active" ? "activated" : "deactivated"}`);
    fetchCourses();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 text-sm">{courses.length} courses available</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Course
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <Badge variant={course.status === "active" ? "default" : "secondary"}
                  className={course.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                  {course.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900">{course.course_name}</h3>
              {course.course_code && (
                <p className="text-xs text-gray-400 mt-0.5">Code: {course.course_code}</p>
              )}
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{course.description ?? "No description"}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>⏱ {course.duration ?? "—"}</span>
                <span className="font-semibold text-gray-800">{formatCurrency(course.fee_amount)}</span>
                <span className="capitalize">{course.skill_level}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(course)}>
                  <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toggleStatus(course)}
                  className={course.status === "active" ? "text-red-500 hover:text-red-700 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}>
                  <Power className="w-3.5 h-3.5 mr-1" />
                  {course.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Course Name *</Label>
                <Input {...register("course_name")} placeholder="e.g. Basic Computer" className="mt-1" />
                {errors.course_name && <p className="text-red-500 text-xs mt-1">{errors.course_name.message as string}</p>}
              </div>
              <div>
                <Label>Course Code</Label>
                <Input {...register("course_code")} placeholder="e.g. BC101" className="mt-1" />
              </div>
              <div>
                <Label>Category</Label>
                <Input {...register("category")} placeholder="e.g. Fundamentals" className="mt-1" />
              </div>
              <div>
                <Label>Duration</Label>
                <Input {...register("duration")} placeholder="e.g. 3 Months" className="mt-1" />
              </div>
              <div>
                <Label>Fee Amount (₹) *</Label>
                <Input type="number" {...register("fee_amount")} className="mt-1" />
                {errors.fee_amount && <p className="text-red-500 text-xs mt-1">{errors.fee_amount.message as string}</p>}
              </div>
              <div>
                <Label>Skill Level *</Label>
                <Select onValueChange={(v) => setValue("skill_level", v as CourseFormValues["skill_level"])}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select defaultValue="active" onValueChange={(v) => setValue("status", v as "active" | "inactive")}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea {...register("description")} placeholder="Course description..." className="mt-1" rows={2} />
              </div>
              <div className="col-span-2">
                <Label>Syllabus</Label>
                <Textarea {...register("syllabus")} placeholder="Topics covered..." className="mt-1" rows={2} />
              </div>
              <div className="col-span-2">
                <Label>Required Tools / Software</Label>
                <Input {...register("required_tools")} placeholder="e.g. MS Office 2021, Chrome" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Course"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
