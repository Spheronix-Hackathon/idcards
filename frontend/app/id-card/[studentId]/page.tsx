'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { IDCardPreview } from '../../../components/IDCardPreview';
import { DownloadButtons } from '../../../components/DownloadButtons';
import { StatusBadge } from '../../../components/StatusBadge';
import { api } from '../../../lib/api';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function StudentCardPage() {
  const params = useParams();
  const studentId = (params.studentId as string) || '';
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      api.getStudent(studentId).then((res) => {
        if (res.success) {
          setStudent(res.data);
        }
        setLoading(false);
      });
    }
  }, [studentId]);

  return (
    <div className="spheronix-mesh min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Spheronix Verified Credential</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {student?.fullName || studentId}
              </h1>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                Public Student ID: <span className="text-blue-700 font-bold">{studentId}</span>
              </p>
            </div>
            {student?.status && <StatusBadge status={student.status} size="lg" />}
          </div>

          {/* ID Card Display */}
          <div className="py-2">
            <IDCardPreview
              studentId={studentId}
              fullName={student?.fullName}
              version={student?.cardVersion || 1}
            />
          </div>

          {/* Action Downloads */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Valid for official student verification.
            </div>
            <DownloadButtons studentId={studentId} size="large" />
          </div>
        </div>
      </div>
    </div>
  );
}
