// TypeScript interfaces matching the Supabase database schema

export type UserRole = 'admin' | 'teacher';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  auth_id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export type StudentStatus = 'pending' | 'active' | 'inactive' | 'completed' | 'dropped';

export interface Student {
  id: string;
  full_name: string;
  gender?: string;
  date_of_birth?: string;
  age?: number;
  phone: string;
  alternate_phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  education_level?: string;
  school_college_work_status?: string;
  photo_url?: string;
  admission_date?: string;
  status: StudentStatus;
  referral_source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // joined relations
  guardians?: Guardian[];
  enrollments?: Enrollment[];
}

export interface Guardian {
  id: string;
  student_id: string;
  guardian_name: string;
  relation?: string;
  phone: string;
  alternate_phone?: string;
  emergency_contact?: string;
  created_at: string;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'active' | 'inactive';

export interface Course {
  id: string;
  course_name: string;
  course_code?: string;
  category?: string;
  description?: string;
  duration?: string;
  fee_amount: number;
  skill_level: SkillLevel;
  syllabus?: string;
  required_tools?: string;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
}

export type BatchStatus = 'active' | 'inactive' | 'completed';

export interface Batch {
  id: string;
  course_id: string;
  teacher_id?: string;
  batch_name: string;
  start_date?: string;
  end_date?: string;
  batch_time?: string;
  days_of_week?: string;
  max_students: number;
  status: BatchStatus;
  created_at: string;
  updated_at: string;
  // joined
  course?: Course;
  teacher?: User;
  enrollment_count?: number;
}

export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'dropped' | 'on_hold';

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  batch_id?: string;
  enrollment_date?: string;
  start_date?: string;
  completion_date?: string;
  status: EnrollmentStatus;
  created_at: string;
  updated_at: string;
  // joined
  course?: Course;
  batch?: Batch;
  student?: Student;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export interface Attendance {
  id: string;
  student_id: string;
  batch_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  marked_by?: string;
  remarks?: string;
  created_at: string;
  // joined
  student?: Student;
  batch?: Batch;
}

export type PaymentStatus = 'not_paid' | 'partial' | 'paid' | 'free_sponsored';

export interface Fee {
  id: string;
  student_id: string;
  enrollment_id: string;
  total_fee: number;
  discount: number;
  final_fee: number;
  amount_paid: number;
  balance_amount: number;
  payment_status: PaymentStatus;
  payment_mode?: string;
  payment_date?: string;
  receipt_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // joined
  student?: Student;
  enrollment?: Enrollment;
}

export type PerformanceLevel = 'excellent' | 'good' | 'average' | 'needs_support';

export interface ProgressLog {
  id: string;
  student_id: string;
  enrollment_id: string;
  module_name?: string;
  completion_percentage?: number;
  skills_learned?: string;
  assignment_status?: string;
  performance_level?: PerformanceLevel;
  teacher_remarks?: string;
  updated_by?: string;
  created_at: string;
}

export interface Document {
  id: string;
  student_id: string;
  document_type?: string;
  file_name?: string;
  file_url?: string;
  uploaded_at: string;
}

// Dashboard stats
export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  newAdmissionsThisMonth: number;
  totalCourses: number;
  activeBatches: number;
  pendingFees: number;
  completedStudents: number;
  attendanceToday: number;
}

// Admission form data (combines student + guardian)
export interface AdmissionFormData {
  // Personal
  full_name: string;
  gender: string;
  date_of_birth: string;
  age: number;
  // Contact
  phone: string;
  alternate_phone?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pin_code?: string;
  // Education
  education_level: string;
  school_college_work_status?: string;
  // Guardian
  guardian_name: string;
  guardian_relation: string;
  guardian_phone: string;
  guardian_alternate_phone?: string;
  emergency_contact?: string;
  // Course
  selected_course_id: string;
  preferred_batch_time?: string;
  referral_source?: string;
  notes?: string;
}
