import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr?: string | null, fmt = "dd MMM yyyy"): string {
  if (!dateStr) return "—";
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, fmt) : "—";
  } catch {
    return "—";
  }
}

export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function calculateFeeBalance(
  totalFee: number,
  discount: number,
  amountPaid: number
): { finalFee: number; balance: number; status: "not_paid" | "partial" | "paid" } {
  const finalFee = Math.max(0, totalFee - discount);
  const balance = Math.max(0, finalFee - amountPaid);
  const status = balance === 0 && finalFee > 0 ? "paid" : amountPaid > 0 ? "partial" : "not_paid";
  return { finalFee, balance, status };
}

export function getStudentStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-700",
    completed: "bg-blue-100 text-blue-800",
    dropped: "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

export function getPaymentStatusColor(status: string): string {
  const map: Record<string, string> = {
    not_paid: "bg-red-100 text-red-800",
    partial: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    free_sponsored: "bg-purple-100 text-purple-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

export function getAttendanceStatusColor(status: string): string {
  const map: Record<string, string> = {
    present: "bg-green-100 text-green-800",
    absent: "bg-red-100 text-red-800",
    late: "bg-yellow-100 text-yellow-800",
    leave: "bg-blue-100 text-blue-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

export function getPerformanceColor(level: string): string {
  const map: Record<string, string> = {
    excellent: "bg-green-100 text-green-800",
    good: "bg-blue-100 text-blue-800",
    average: "bg-yellow-100 text-yellow-800",
    needs_support: "bg-red-100 text-red-800",
  };
  return map[level] ?? "bg-gray-100 text-gray-700";
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}
