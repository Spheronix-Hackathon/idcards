import { StudentForm } from '../../components/StudentForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="spheronix-mesh min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Left Navigation: Back to Home */}
        <div className="flex items-center justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm transition-all transform hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Generate Student ID Card
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete the registration form below. Your official student ID card will be issued immediately upon submission.
          </p>
        </div>

        <StudentForm />
      </div>
    </div>
  );
}
