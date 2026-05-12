"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, Users, DollarSign, CalendarCheck, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface Stats {
  totalStudents: number;
  activeStudents: number;
  newAdmissionsThisMonth: number;
  totalCourses: number;
  activeBatches: number;
  attendanceToday: number;
  totalPendingFee: number;
  completedStudents: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const exportCSV = (type: string, label: string) => {
    toast.info(`Exporting ${label}...`);
    window.open(`/api/reports/export?type=${type}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 text-sm">Download data exports and view summary statistics</p>
      </div>

      {/* Summary Cards */}
      {!loading && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-indigo-600 bg-indigo-50" },
            { label: "Active Students", value: stats.activeStudents, icon: Users, color: "text-green-600 bg-green-50" },
            { label: "Active Batches", value: stats.activeBatches, icon: CalendarCheck, color: "text-purple-600 bg-purple-50" },
            { label: "Pending Fees", value: formatCurrency(stats.totalPendingFee), icon: DollarSign, color: "text-red-600 bg-red-50" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 stat-card">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Export Sections */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        <div className="p-5">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" /> Available Reports
          </h2>
          <p className="text-xs text-gray-500">Click to download as CSV</p>
        </div>

        {[
          {
            title: "Student List Report",
            desc: "All students with contact, city, education level, and status.",
            type: "students",
            icon: Users,
          },
          {
            title: "Pending Fees Report",
            desc: "Students with outstanding fee balance — partial and unpaid.",
            type: "fees_pending",
            icon: DollarSign,
          },
          {
            title: "Attendance Report",
            desc: "Last 1000 attendance records by date, batch, and status.",
            type: "attendance",
            icon: CalendarCheck,
          },
        ].map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.type} className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{report.title}</p>
                  <p className="text-xs text-gray-500">{report.desc}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCSV(report.type, report.title)}
                className="shrink-0"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download CSV
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
