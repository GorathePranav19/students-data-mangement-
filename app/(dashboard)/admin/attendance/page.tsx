"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Download, Loader2, CheckSquare } from "lucide-react";
import { getAttendanceStatusColor, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminAttendancePage() {
  const [attendance, setAttendance] = useState<{ id: string; attendance_date: string; status: string; student: { full_name: string; phone: string }; batch: { batch_name: string } }[]>([]);
  const [batches, setBatches] = useState<{ id: string; batch_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchFilter, setBatchFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (batchFilter !== "all") params.set("batch_id", batchFilter);
    if (dateFilter) params.set("date", dateFilter);

    const [attRes, batchRes] = await Promise.all([
      fetch(`/api/attendance?${params}`),
      fetch("/api/batches"),
    ]);
    const [attJson, batchJson] = await Promise.all([attRes.json(), batchRes.json()]);
    setAttendance(attJson.data ?? []);
    setBatches(batchJson.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [batchFilter, dateFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
          <p className="text-gray-500 text-sm">{attendance.length} records</p>
        </div>
        <Button variant="outline" onClick={() => window.open("/api/reports/export?type=attendance", "_blank")}>
          <Download className="w-4 h-4 mr-1.5" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={batchFilter} onValueChange={(v) => setBatchFilter(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All Batches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {batches.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.batch_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-44"
        />
        {dateFilter && (
          <Button variant="ghost" size="sm" onClick={() => setDateFilter("")} className="text-gray-500">
            Clear Date
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
        ) : attendance.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No attendance records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Batch</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {attendance.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{formatDate(a.attendance_date)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{a.student?.full_name}</p>
                      <p className="text-xs text-gray-500">{a.student?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{a.batch?.batch_name}</td>
                    <td className="px-4 py-3">
                      <span className={`status-pill capitalize ${getAttendanceStatusColor(a.status)}`}>{a.status}</span>
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
