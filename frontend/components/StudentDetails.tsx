'use client';

import React from 'react';
import { IDCardPreview } from './IDCardPreview';
import { DownloadButtons } from './DownloadButtons';
import { StatusBadge } from './StatusBadge';
import { Student, StudentStatus } from '../types';
import { api } from '../lib/api';
import { RotateCw, Mail, Phone, Building2, Calendar, GraduationCap } from 'lucide-react';

interface StudentDetailsProps {
  student: Student;
  cards?: any[];
  onStatusChange: (status: StudentStatus) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

export const StudentDetails: React.FC<StudentDetailsProps> = ({
  student,
  cards = [],
  onStatusChange,
  onRegenerate,
  isRegenerating = false
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500/30 shadow-sm bg-slate-100 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={api.getStudentPhotoUrl(student.studentId)}
              alt={student.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {student.fullName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                {student.studentId}
              </span>
              <StatusBadge status={student.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <select
            value={student.status}
            onChange={(e) => onStatusChange(e.target.value as StudentStatus)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="PENDING">PENDING</option>
            <option value="ACTIVE">ACTIVE (Approved)</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="DEACTIVATED">DEACTIVATED</option>
          </select>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate Card</span>
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-400 font-medium block uppercase tracking-wider text-[10px]">
            Email Address
          </span>
          <span className="font-semibold text-slate-800 text-sm mt-0.5 block truncate">
            {student.email}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-400 font-medium block uppercase tracking-wider text-[10px]">
            Mobile Number
          </span>
          <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
            {student.mobile}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-400 font-medium block uppercase tracking-wider text-[10px]">
            College Name
          </span>
          <span className="font-semibold text-slate-800 text-sm mt-0.5 block truncate">
            {student.collegeName}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-400 font-medium block uppercase tracking-wider text-[10px]">
            Branch / Department
          </span>
          <span className="font-semibold text-slate-800 text-sm mt-0.5 block truncate">
            {student.branch}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-400 font-medium block uppercase tracking-wider text-[10px]">
            Academic Details
          </span>
          <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
            {student.course || 'N/A'} • {student.rollNumber || 'No roll #'} (Grad: {student.graduationYear || 'N/A'})
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-400 font-medium block uppercase tracking-wider text-[10px]">
            Registration Date
          </span>
          <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
            {new Date(student.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Card Preview & Download Section */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Active Student ID Card
        </h3>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <IDCardPreview
            studentId={student.studentId}
            fullName={student.fullName}
            version={cards[0]?.version || 1}
          />
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Official Spheronix card rendering. Strictly zero QR codes or barcodes.
            </p>
            <DownloadButtons studentId={student.studentId} size="default" />
          </div>
        </div>
      </div>
    </div>
  );
};
