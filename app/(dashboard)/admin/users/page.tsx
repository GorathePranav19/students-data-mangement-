"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Loader2, UserCog } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTeacherSchema, type CreateTeacherFormValues } from "@/lib/validations";
import { toast } from "sonner";
import type { User } from "@/types";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateTeacherFormValues>({
    resolver: zodResolver(createTeacherSchema),
  });

  const fetchTeachers = async () => {
    const res = await fetch("/api/users?role=teacher");
    const json = await res.json();
    setTeachers(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const onSubmit = async (data: CreateTeacherFormValues) => {
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Failed to create teacher.");
        return;
      }
      toast.success("Teacher account created!");
      setDialogOpen(false);
      reset();
      fetchTeachers();
    } catch {
      toast.error("Failed to create teacher.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-500 text-sm">{teachers.length} teacher accounts</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Teacher
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {teachers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <UserCog className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No teachers added yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Phone</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-600 text-xs font-bold">
                              {teacher.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900">{teacher.full_name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{teacher.email}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{teacher.phone ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`status-pill capitalize ${teacher.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {teacher.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(teacher.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Teacher Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div>
              <Label>Full Name *</Label>
              <Input {...register("full_name")} placeholder="Teacher's full name" className="mt-1" />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" {...register("email")} placeholder="teacher@email.com" className="mt-1" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label>Phone</Label>
              <Input {...register("phone")} placeholder="Mobile number" className="mt-1" />
            </div>
            <div>
              <Label>Password *</Label>
              <Input type="password" {...register("password")} placeholder="Min 8 characters" className="mt-1" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div className="bg-yellow-50 rounded-lg px-3 py-2 text-xs text-yellow-700">
              ⚠️ This will create a Supabase Auth account. The teacher can use these credentials to log in.
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
