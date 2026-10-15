'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IDCardPreview } from './IDCardPreview';
import { DownloadButtons } from './DownloadButtons';
import { CheckCircle, Sparkles, ExternalLink, UserPlus } from 'lucide-react';

interface SuccessCardProps {
  studentId: string;
  fullName?: string;
  cardVersion?: number;
}

export const SuccessCard: React.FC<SuccessCardProps> = ({
  studentId,
  fullName,
  cardVersion = 1
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(studentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl text-center space-y-5 max-w-2xl mx-auto">
      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Registration Successful</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          STUDENT ID CARD GENERATED
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Your credentials have been authenticated and your official student ID card is ready.
        </p>
      </div>

      {/* ID Badge Display */}
      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 max-w-md mx-auto flex items-center justify-between gap-3">
        <div className="text-left">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            Your Student ID
          </span>
          <span className="text-2xl font-black text-blue-900 font-mono tracking-wider">
            {studentId}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="px-3.5 py-1.5 bg-white hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 shadow-sm transition-all"
        >
          {copied ? 'Copied!' : 'Copy ID'}
        </button>
      </div>

      {/* Card Preview */}
      <div className="py-2">
        <IDCardPreview
          studentId={studentId}
          fullName={fullName}
          version={cardVersion}
        />
      </div>

      {/* Action Group */}
      <div className="flex flex-col items-center gap-4 pt-2">
        <DownloadButtons studentId={studentId} size="large" />

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100 w-full">
          <Link
            href={`/id-card/${studentId}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <span>View Dedicated Card Page</span>
            <ExternalLink className="w-4 h-4" />
          </Link>

          <span className="text-slate-300">•</span>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Another Student</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
