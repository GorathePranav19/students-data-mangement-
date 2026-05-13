"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Download, Edit, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate, getPaymentStatusColor } from "@/lib/utils";
import type { Fee } from "@/types";

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    total_fee: 0, discount: 0, amount_paid: 0,
    payment_mode: "", payment_date: "", receipt_number: "", notes: "",
  });

  const fetchFees = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/fees?${params}`);
    const json = await res.json();
    setFees(json.data ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchFees(); }, [fetchFees]);

  const openEdit = (fee: Fee) => {
    setEditingFee(fee);
    setForm({
      total_fee: fee.total_fee, discount: fee.discount, amount_paid: fee.amount_paid,
      payment_mode: fee.payment_mode ?? "", payment_date: fee.payment_date ?? "",
      receipt_number: fee.receipt_number ?? "", notes: fee.notes ?? "",
    });
  };

  const handleSave = async () => {
    if (!editingFee) return;
    setSaving(true);
    try {
      const res = await fetch("/api/fees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingFee.id, ...form }),
      });
      if (!res.ok) throw new Error();
      toast.success("Fee updated!");
      setEditingFee(null);
      fetchFees();
    } catch {
      toast.error("Failed to update fee.");
    } finally {
      setSaving(false);
    }
  };

  const finalFee = Math.max(0, (form.total_fee || 0) - (form.discount || 0));
  const balance = Math.max(0, finalFee - (form.amount_paid || 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-500 text-sm">{fees.length} records</p>
        </div>
        <Button variant="outline" onClick={() => window.open("/api/reports/export?type=fees_pending", "_blank")}>
          <Download className="w-4 h-4 mr-1.5" /> Export Pending Fees
        </Button>
      </div>

      {/* Filter */}
      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
        <SelectTrigger className="w-full sm:w-52">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payments</SelectItem>
          <SelectItem value="not_paid">Not Paid</SelectItem>
          <SelectItem value="partial">Partially Paid</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="free_sponsored">Free / Sponsored</SelectItem>
        </SelectContent>
      </Select>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
        ) : fees.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No fee records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Course</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Total Fee</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Paid</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Balance</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{(fee.student as { full_name: string })?.full_name}</p>
                      <p className="text-xs text-gray-500">{(fee.student as { phone: string })?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                      {(fee.enrollment as { course?: { course_name: string } })?.course?.course_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{formatCurrency(fee.final_fee)}</td>
                    <td className="px-4 py-3 text-green-600 font-medium hidden md:table-cell">{formatCurrency(fee.amount_paid)}</td>
                    <td className="px-4 py-3 font-semibold text-red-600">{formatCurrency(fee.balance_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`status-pill capitalize ${getPaymentStatusColor(fee.payment_status)}`}>
                        {fee.payment_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-indigo-600"
                        onClick={() => openEdit(fee)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Fee Dialog */}
      <Dialog open={!!editingFee} onOpenChange={(o) => !o && setEditingFee(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Fee — {(editingFee?.student as { full_name: string })?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Fee (₹)</Label>
                <Input type="number" value={form.total_fee}
                  onChange={(e) => setForm({ ...form, total_fee: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <Label>Discount (₹)</Label>
                <Input type="number" value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <Label>Amount Paid (₹)</Label>
                <Input type="number" value={form.amount_paid}
                  onChange={(e) => setForm({ ...form, amount_paid: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <Label>Payment Mode</Label>
                <Input value={form.payment_mode}
                  onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
                  placeholder="Cash / UPI / Online" className="mt-1" />
              </div>
              <div>
                <Label>Payment Date</Label>
                <Input type="date" value={form.payment_date}
                  onChange={(e) => setForm({ ...form, payment_date: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Receipt No.</Label>
                <Input value={form.receipt_number}
                  onChange={(e) => setForm({ ...form, receipt_number: e.target.value })} className="mt-1" />
              </div>
            </div>
            {/* Auto-calculated summary */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Final Fee</span>
                <span className="font-semibold">{formatCurrency(finalFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Balance</span>
                <span className={`font-bold ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(balance)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFee(null)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
