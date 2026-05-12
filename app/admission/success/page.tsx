import Link from "next/link";
import { CheckCircle, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admission Submitted" };

export default function AdmissionSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Admission Submitted! 🎉
          </h1>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Your admission form has been submitted successfully. Our team will review it and
            contact you within 1–2 working days to confirm your enrollment.
          </p>

          <div className="bg-indigo-50 rounded-xl p-4 text-left mb-6">
            <p className="text-indigo-700 font-semibold text-sm mb-2">What happens next?</p>
            <ol className="text-indigo-600 text-xs space-y-1.5 list-decimal list-inside">
              <li>Admin reviews your admission</li>
              <li>You will be contacted to confirm course &amp; batch</li>
              <li>Fee payment and batch assignment</li>
              <li>Classes begin as per your batch schedule</li>
            </ol>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                <ArrowRight className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/admission">
              <Button variant="outline" className="w-full">
                Submit Another Application
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
