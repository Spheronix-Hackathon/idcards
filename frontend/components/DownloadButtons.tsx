'use client';

import React, { useState } from 'react';
import { Download, FileText, Camera as ImageIcon, Check, Copy } from 'lucide-react';
import { api } from '../lib/api';

interface DownloadButtonsProps {
  studentId: string;
  size?: 'default' | 'large';
  showCopy?: boolean;
}

export const DownloadButtons: React.FC<DownloadButtonsProps> = ({
  studentId,
  size = 'default',
  showCopy = true
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(studentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLarge = size === 'large';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Download PNG Button */}
      <a
        href={api.getStudentCardImageUrl(studentId, true)}
        download={`SPHERONIX-ID-${studentId}.png`}
        className={`inline-flex items-center justify-center gap-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
          isLarge ? 'px-6 py-3 text-base' : 'px-4 py-2.5 text-sm'
        }`}
      >
        <ImageIcon className={isLarge ? 'w-5 h-5' : 'w-4 h-4'} />
        <span>DOWNLOAD PNG</span>
      </a>

      {/* Download PDF Button */}
      <a
        href={api.getStudentCardPdfUrl(studentId)}
        download={`SPHERONIX-ID-${studentId}.pdf`}
        className={`inline-flex items-center justify-center gap-2 font-semibold text-slate-800 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
          isLarge ? 'px-6 py-3 text-base' : 'px-4 py-2.5 text-sm'
        }`}
      >
        <FileText className={isLarge ? 'w-5 h-5 text-rose-600' : 'w-4 h-4 text-rose-600'} />
        <span>DOWNLOAD PDF</span>
      </a>

      {/* Copy Student ID Button */}
      {showCopy && (
        <button
          type="button"
          onClick={handleCopyId}
          className={`inline-flex items-center justify-center gap-2 font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors ${
            isLarge ? 'px-5 py-3 text-base' : 'px-3.5 py-2.5 text-sm'
          }`}
          title="Copy Student ID"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy ID</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
