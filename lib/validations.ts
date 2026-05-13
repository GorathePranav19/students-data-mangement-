import { z } from 'zod';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// ─── Admission Form ───────────────────────────────────────────────────────────
export const admissionSchema = z.object({
  // Personal
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  gender: z.string().min(1, 'Please select a gender'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  age: z.coerce.number().min(1, 'Age must be at least 1').max(120, 'Please enter a valid age'),
  // Contact
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  alternate_phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid mobile number').optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pin_code: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit PIN code').optional().or(z.literal('')),
  // Education
  education_level: z.string().min(1, 'Education level is required'),
  school_college_work_status: z.string().optional().or(z.literal('')),
  // Guardian
  guardian_name: z.string().min(2, 'Guardian name is required'),
  guardian_relation: z.string().min(1, 'Relation is required'),
  guardian_phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid guardian mobile number'),
  guardian_alternate_phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid mobile number').optional().or(z.literal('')),
  emergency_contact: z.string().optional().or(z.literal('')),
  // Course
  selected_course_id: z.string().min(1, 'Please select a course'),
  preferred_batch_time: z.string().optional().or(z.literal('')),
  referral_source: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type AdmissionFormValues = z.infer<typeof admissionSchema>;

// ─── Course ───────────────────────────────────────────────────────────────────
export const courseSchema = z.object({
  course_name: z.string().min(2, 'Course name is required'),
  course_code: z.string().optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  duration: z.string().optional().or(z.literal('')),
  fee_amount: z.coerce.number().min(0, 'Fee cannot be negative'),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced']),
  syllabus: z.string().optional().or(z.literal('')),
  required_tools: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

// ─── Batch ────────────────────────────────────────────────────────────────────
export const batchSchema = z.object({
  batch_name: z.string().min(2, 'Batch name is required'),
  course_id: z.string().min(1, 'Please select a course'),
  teacher_id: z.string().min(1, 'Please assign a teacher'),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  batch_time: z.string().min(1, 'Batch timing is required'),
  days_of_week: z.string().optional().or(z.literal('')),
  max_students: z.coerce.number().min(1, 'Max students must be at least 1').max(200).transform((v) => Number(v)),
  status: z.enum(['active', 'inactive', 'completed']).default('active'),
});

export type BatchFormValues = z.infer<typeof batchSchema>;

// ─── Enrollment ───────────────────────────────────────────────────────────────
export const enrollmentSchema = z.object({
  student_id: z.string().min(1, 'Student is required'),
  course_id: z.string().min(1, 'Course is required'),
  batch_id: z.string().optional().or(z.literal('')),
  status: z.enum(['pending', 'active', 'completed', 'dropped', 'on_hold']).default('active'),
  start_date: z.string().optional().or(z.literal('')),
});

export type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendanceRecordSchema = z.object({
  student_id: z.string(),
  status: z.enum(['present', 'absent', 'late', 'leave']),
  remarks: z.string().optional().or(z.literal('')),
});

export const attendanceBatchSchema = z.object({
  batch_id: z.string().min(1, 'Batch is required'),
  attendance_date: z.string().min(1, 'Date is required'),
  records: z.array(attendanceRecordSchema),
});

export type AttendanceBatchValues = z.infer<typeof attendanceBatchSchema>;

// ─── Fee ─────────────────────────────────────────────────────────────────────
export const feeSchema = z.object({
  total_fee: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  amount_paid: z.coerce.number().min(0).default(0),
  payment_mode: z.string().optional().or(z.literal('')),
  payment_date: z.string().optional().or(z.literal('')),
  receipt_number: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  payment_status: z.enum(['not_paid', 'partial', 'paid', 'free_sponsored']),
});

export type FeeFormValues = z.infer<typeof feeSchema>;

// ─── Progress ─────────────────────────────────────────────────────────────────
export const progressSchema = z.object({
  enrollment_id: z.string().min(1, 'Enrollment is required'),
  module_name: z.string().optional().or(z.literal('')),
  completion_percentage: z.coerce.number().min(0).max(100).default(0),
  skills_learned: z.string().optional().or(z.literal('')),
  assignment_status: z.string().optional().or(z.literal('')),
  performance_level: z.enum(['excellent', 'good', 'average', 'needs_support']).optional(),
  teacher_remarks: z.string().optional().or(z.literal('')),
});

export type ProgressFormValues = z.infer<typeof progressSchema>;

// ─── Create Teacher ───────────────────────────────────────────────────────────
export const createTeacherSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type CreateTeacherFormValues = z.infer<typeof createTeacherSchema>;
