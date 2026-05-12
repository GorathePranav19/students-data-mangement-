"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Search, Loader2, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Student } from "@/types";

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchAdmissions = async () => {
    const params = new URLSearchParams({ status: "pending", limit: "50" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/students?${params}`);
    const json = await res.json();
    setAdmissions(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAdmissions(); }, [search]);

  const approveAdmission = async (id: string) => {
    const res = await fetch(`/api/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
    if (res.ok) {
      toast.success("Student approved and activated!");
      fetchAdmissions();
    } else {
      toast.error("Failed to approve admission.");
    }
  };

  const rejectAdmission = async (id: string) => {
    const res = await fetch(`/api/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "dropped" }),
    });
    if (res.ok) {
      toast.success("Admission rejected.");
      fetchAdmissions();
    } else {
      toast.error("Failed to reject admission.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Admissions</h1>
          <p className="text-gray-500 text-sm">{admissions.length} admissions awaiting review</p>
        </div>
        <a href="/admission" target="_blank"
          className="text-sm text-indigo-600 font-medium hover:underline">
          Open Admission Form →
        </a>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search admissions..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
        ) : admissions.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No pending admissions</p>
            <p className="text-gray-400 text-sm mt-1">All caught up! Share the admission form to get new students.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">City</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Applied</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {admissions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{s.full_name}</p>
                      <p className="text-xs text-gray-500">{s.email ?? "No email"}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{s.phone}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{s.city ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(s.admission_date)}</td>
                    <td className="px-4 py-3">
                      <span className="status-pill bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 h-7"
                          onClick={() => approveAdmission(s.id)}
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 border-red-200 text-xs px-3 h-7"
                          onClick={() => rejectAdmission(s.id)}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
