'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IDCardPreview } from '../../components/IDCardPreview';
import { DownloadButtons } from '../../components/DownloadButtons';
import { CheckCircle, ArrowRight, UserPlus, Sparkles, ExternalLink, ArrowLeft } from 'lucide-react';
import { api } from '../../lib/api';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId') || '';
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    if (studentId) {
      api.getStudent(studentId).then((res) => {
        if (res.success) {
          setStudent(res.data);
        }
      });
    }
  }, [studentId]);

  if (!studentId) {
    return (
      <div className="spheronix-mesh min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xl">
          <p className="text-base font-semibold text-slate-800">No Student ID Specified</p>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Please register your details to generate your student ID card.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm"
          >
            Go to Registration
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="spheronix-mesh min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
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

        {/* Success Header Box */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generation Complete</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              STUDENT ID CARD GENERATED
            </h1>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Your ID card has been issued successfully with official Spheronix credentials.
            </p>
          </div>

          {/* Student ID Highlight Box */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wider block">
                Your Student ID
              </span>
              <span className="text-2xl font-black text-blue-900 font-mono tracking-wider">
                {studentId}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(studentId)}
              className="px-3.5 py-1.5 bg-white hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 shadow-sm transition-all"
            >
              Copy ID
            </button>
          </div>

          {/* Card Preview */}
          <div className="py-4">
            <IDCardPreview
              studentId={studentId}
              fullName={student?.fullName}
              version={student?.cardVersion || 1}
            />
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col items-center gap-4 pt-2">
            <DownloadButtons studentId={studentId} size="large" />

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100 w-full">
              <Link
                href={`/id-card/${studentId}`}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                <span>VIEW CARD PAGE</span>
                <ExternalLink className="w-4 h-4" />
              </Link>

              <span className="text-slate-300">•</span>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900"
              >
                <UserPlus className="w-4 h-4" />
                <span>REGISTER ANOTHER STUDENT</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
