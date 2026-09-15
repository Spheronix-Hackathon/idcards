'use client';

import React from 'react';
import Link from 'next/link';
import { StatusBadge } from './StatusBadge';
import { Student, StudentStatus } from '../types';
import {
  Eye,
  Download,
  RotateCw,
  CheckCircle2,
  XCircle,
  Slash,
  Calendar,
  Building2,
  FileText
} from 'lucide-react';
import { api } from '../lib/api';

interface StudentTableProps {
  students: Student[];
  onStatusChange: (id: string, newStatus: StudentStatus) => void;
  onRegenerate: (studentId: string) => void;
  loading?: boolean;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onStatusChange,
  onRegenerate,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden p-8 text-center">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading students...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden p-12 text-center">
        <p className="text-base font-semibold text-slate-700">No students found</p>
        <p className="text-xs text-slate-500 mt-1">
          Try adjusting your search criteria or filter options.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Student</th>
              <th className="py-3.5 px-4">Student ID</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4">College & Branch</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-slate-50/70 transition-colors">
                {/* Photo & Name */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={api.getStudentPhotoUrl(student.studentId)}
                        alt={student.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://ui-avatars.com/api/?name=' + encodeURIComponent(student.fullName);
                        }}
                      />
                    </div>
                    <div>
                      <Link
                        href={`/admin/students/${student._id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {student.fullName}
                      </Link>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {student.rollNumber || 'No roll #'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Student ID */}
                <td className="py-3 px-4 font-mono font-bold text-blue-700">
                  <span className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {student.studentId}
                  </span>
                </td>

                {/* Contact */}
                <td className="py-3 px-4 text-slate-600">
                  <div className="line-clamp-1">{student.email}</div>
                  <div className="text-[11px] text-slate-400">{student.mobile}</div>
                </td>

                {/* College & Branch */}
                <td className="py-3 px-4 text-slate-600 max-w-[220px]">
                  <div className="font-medium line-clamp-1 text-slate-800">{student.collegeName}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{student.branch}</div>
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <StatusBadge status={student.status} size="sm" />
                </td>

                {/* Date */}
                <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                  {new Date(student.createdAt).toLocaleDateString()}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    {/* View Details */}
                    <Link
                      href={`/admin/students/${student._id}`}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Student Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {/* Download PNG */}
                    <a
                      href={api.getStudentCardImageUrl(student.studentId, true)}
                      download={`SPHERONIX-ID-${student.studentId}.png`}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Download ID Card PNG"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    {/* Download PDF */}
                    <a
                      href={api.getStudentCardPdfUrl(student.studentId)}
                      download={`SPHERONIX-ID-${student.studentId}.pdf`}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Download ID Card PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </a>

                    {/* Regenerate Card */}
                    <button
                      type="button"
                      onClick={() => onRegenerate(student.studentId)}
                      className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Regenerate ID Card"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>

                    {/* Status Toggle Quick Actions */}
                    {student.status === StudentStatus.PENDING && (
                      <button
                        type="button"
                        onClick={() => onStatusChange(student._id, StudentStatus.ACTIVE)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Approve Student"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}

                    {student.status === StudentStatus.ACTIVE && (
                      <button
                        type="button"
                        onClick={() => onStatusChange(student._id, StudentStatus.DEACTIVATED)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Deactivate Card"
                      >
                        <Slash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
