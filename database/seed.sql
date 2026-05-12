-- ============================================================
-- Seed Data — Dummy data for development/testing
-- Run AFTER schema.sql
-- NOTE: You must create auth users in Supabase Auth manually
--       and then update the auth_id values below.
-- ============================================================

-- ── Courses ───────────────────────────────────────────────
INSERT INTO courses (course_name, course_code, category, description, duration, fee_amount, skill_level, status) VALUES
('Basic Computer', 'BC101', 'Fundamentals', 'Introduction to computers, hardware, software, and basic operations.', '2 Months', 1500, 'beginner', 'active'),
('MS Office', 'MSO201', 'Productivity', 'Word, Excel, PowerPoint and basic office tools.', '3 Months', 2500, 'beginner', 'active'),
('Web Development', 'WD301', 'Development', 'HTML, CSS, JavaScript basics and website creation.', '6 Months', 6000, 'intermediate', 'active'),
('Canva Designing', 'CD401', 'Design', 'Graphic design using Canva for social media, posters, and presentations.', '1 Month', 1000, 'beginner', 'active'),
('Digital Marketing', 'DM501', 'Marketing', 'SEO, social media marketing, Google Ads basics.', '4 Months', 4000, 'intermediate', 'active'),
('Tally Prime', 'TP601', 'Accounting', 'Tally accounting software for GST, billing, and accounts.', '3 Months', 3000, 'beginner', 'active'),
('Typing', 'TY101', 'Fundamentals', 'Hindi and English typing speed course.', '2 Months', 1200, 'beginner', 'active'),
('Scratch Programming', 'SP201', 'Programming', 'Visual programming for beginners and children using Scratch.', '2 Months', 1500, 'beginner', 'active')
ON CONFLICT DO NOTHING;

-- ── Users (Admin + Teachers) ──────────────────────────────
-- NOTE: auth_id will be null until linked with Supabase Auth user
INSERT INTO users (full_name, email, phone, role, status) VALUES
('Center Admin', 'admin@computercenter.com', '9876543210', 'admin', 'active'),
('Priya Sharma', 'priya.teacher@computercenter.com', '9876543211', 'teacher', 'active'),
('Rahul Verma', 'rahul.teacher@computercenter.com', '9876543212', 'teacher', 'active')
ON CONFLICT DO NOTHING;

-- ── Students ──────────────────────────────────────────────
INSERT INTO students (full_name, gender, date_of_birth, age, phone, email, address, city, state, pin_code, education_level, status, referral_source, admission_date) VALUES
('Aarav Patel', 'Male', '2008-05-15', 16, '9812345601', 'aarav@example.com', '12 MG Road', 'Ahmedabad', 'Gujarat', '380001', '10th Pass', 'active', 'Friend', '2025-01-10'),
('Sneha Joshi', 'Female', '2005-08-22', 19, '9812345602', 'sneha@example.com', '45 Park Street', 'Surat', 'Gujarat', '395001', '12th Pass', 'active', 'Social Media', '2025-01-12'),
('Mohan Das', 'Male', '1985-03-10', 40, '9812345603', NULL, '78 Gandhi Nagar', 'Vadodara', 'Gujarat', '390001', 'Graduate', 'active', 'Walk-in', '2025-02-01'),
('Kavya Singh', 'Female', '2010-11-30', 14, '9812345604', NULL, '33 Lake View', 'Rajkot', 'Gujarat', '360001', '8th Standard', 'pending', 'Pamphlet', '2025-03-05'),
('Deepak Yadav', 'Male', '1998-07-18', 27, '9812345605', 'deepak@example.com', '99 Station Road', 'Ahmedabad', 'Gujarat', '380002', 'Graduate', 'completed', 'Friend', '2024-06-01')
ON CONFLICT DO NOTHING;

-- ── Guardians ─────────────────────────────────────────────
-- (Will be linked after student IDs are generated)
-- Run manually or use the application to add guardians.
