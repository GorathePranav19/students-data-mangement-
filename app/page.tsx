import Link from "next/link";
import {
  BookOpen,
  Users,
  Calendar,
  BarChart3,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  ClipboardList,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Computer Class Student Management System",
  description:
    "Manage student admissions, courses, batches, attendance, and fees for your computer training center.",
};

const features = [
  {
    icon: Users,
    title: "Student Admissions",
    description: "Digital admission form with no age limit. Manage all student profiles from one place.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: BookOpen,
    title: "Course Management",
    description: "Add multiple courses like Basic Computer, MS Office, Web Development, and more.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Calendar,
    title: "Batch Management",
    description: "Create batches with timings, assign teachers, and manage student enrollment.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: ClipboardList,
    title: "Attendance Tracking",
    description: "Mark daily attendance batch-wise. View attendance percentage and reports.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: DollarSign,
    title: "Fee Management",
    description: "Track fee payments, discounts, and pending balances with instant reports.",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "Generate student, course, and batch reports. Export data as CSV.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

const stats = [
  { label: "Students Managed", value: "500+" },
  { label: "Courses Supported", value: "20+" },
  { label: "Centers Using", value: "10+" },
  { label: "Attendance Records", value: "10K+" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm sm:text-base">Computer Class Manager</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-gray-600">
                Staff Login
              </Button>
            </Link>
            <Link href="/admission">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-hero text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 text-sm mb-6">
            <GraduationCap className="w-4 h-4" />
            <span>Apni Pathshala — Computer Education for All</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Smart Student Management
            <br />
            <span className="text-indigo-200">for Computer Classes</span>
          </h1>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto mb-8">
            Digitize admissions, track attendance, manage fees, and monitor student progress —
            all from one simple dashboard. No age limit for students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admission">
              <Button
                size="lg"
                className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold px-8"
              >
                Apply for Admission
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 px-8"
              >
                Staff Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              A complete system for managing your computer class — from admission to course completion.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all stat-card"
                >
                  <div className={`w-11 h-11 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why No Age Limit section */}
      <section className="py-16 px-4 bg-indigo-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-4">🎓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Learning Has No Age Limit</h2>
          <p className="text-gray-600 leading-relaxed">
            Whether you&apos;re a child learning Scratch, a young adult mastering Web Development,
            or a senior learning Basic Computer — our system welcomes everyone. No minimum or maximum
            age requirement.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {["Children", "Teenagers", "Adults", "Senior Citizens", "Working Professionals", "Homemakers"].map((g) => (
              <span
                key={g}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-700 text-sm font-medium rounded-full border border-indigo-100"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {g}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gray-900 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Join?</h2>
        <p className="text-gray-400 mb-8">
          Fill out the online admission form and start your computer learning journey today.
        </p>
        <Link href="/admission">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10">
            Apply for Admission
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 text-center text-sm text-gray-500">
        <p>© 2025 Computer Class Management System. All rights reserved.</p>
        <p className="mt-1">
          <Link href="/login" className="text-indigo-600 hover:underline">
            Staff Login
          </Link>{" "}
          ·{" "}
          <Link href="/admission" className="text-indigo-600 hover:underline">
            Student Admission
          </Link>
        </p>
      </footer>
    </div>
  );
}
