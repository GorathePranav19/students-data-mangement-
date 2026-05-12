-- ============================================================
-- Computer Class Student Data Management System
-- Full PostgreSQL Schema for Supabase
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users (Admin + Teachers) ──────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT CHECK (role IN ('admin', 'teacher')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Students ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  gender TEXT,
  date_of_birth DATE,
  age INTEGER,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pin_code TEXT,
  education_level TEXT,
  school_college_work_status TEXT,
  photo_url TEXT,
  admission_date DATE DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('pending', 'active', 'inactive', 'completed', 'dropped')) DEFAULT 'pending',
  referral_source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Guardians ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  guardian_name TEXT NOT NULL,
  relation TEXT,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Courses ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name TEXT NOT NULL,
  course_code TEXT UNIQUE,
  category TEXT,
  description TEXT,
  duration TEXT,
  fee_amount NUMERIC DEFAULT 0,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  syllabus TEXT,
  required_tools TEXT,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Batches ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id),
  batch_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  batch_time TEXT,
  days_of_week TEXT,
  max_students INTEGER DEFAULT 30,
  status TEXT CHECK (status IN ('active', 'inactive', 'completed')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Enrollments ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id),
  batch_id UUID REFERENCES batches(id),
  enrollment_date DATE DEFAULT CURRENT_DATE,
  start_date DATE,
  completion_date DATE,
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'dropped', 'on_hold')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Attendance ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id),
  attendance_date DATE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'leave')) NOT NULL,
  marked_by UUID REFERENCES users(id),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, batch_id, attendance_date)
);

-- ── Fees ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  total_fee NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  final_fee NUMERIC DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  balance_amount NUMERIC DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('not_paid', 'partial', 'paid', 'free_sponsored')) DEFAULT 'not_paid',
  payment_mode TEXT,
  payment_date DATE,
  receipt_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Progress Logs ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  module_name TEXT,
  completion_percentage INTEGER CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  skills_learned TEXT,
  assignment_status TEXT,
  performance_level TEXT CHECK (performance_level IN ('excellent', 'good', 'average', 'needs_support')),
  teacher_remarks TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Documents ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  document_type TEXT,
  file_name TEXT,
  file_url TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_students_phone ON students(phone);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_batch ON enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_batch ON attendance(batch_id);
CREATE INDEX IF NOT EXISTS idx_fees_student ON fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(payment_status);

-- ── Row Level Security ────────────────────────────────────
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow all for authenticated users (adjust per role in production)
CREATE POLICY "Allow authenticated access" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON students FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON guardians FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow public insert admissions" ON students FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert guardians" ON guardians FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON enrollments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON attendance FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON fees FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON progress_logs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON documents FOR ALL TO authenticated USING (true);

-- Courses are publicly readable (shown in admission form)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read courses" ON courses FOR SELECT TO anon USING (status = 'active');
CREATE POLICY "Allow authenticated manage courses" ON courses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage batches" ON batches FOR ALL TO authenticated USING (true);
