'use client';

import React, { useState } from 'react';
import { IDCardPreview } from '../../components/IDCardPreview';
import { DownloadButtons } from '../../components/DownloadButtons';
import { StatusBadge } from '../../components/StatusBadge';
import { api } from '../../lib/api';
import Link from 'next/link';
import { Search, AlertCircle, Loader2, CreditCard, Building2, Mail, Phone, ArrowLeft } from 'lucide-react';

export default function RetrieveIdPage() {
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<any | null>(null);

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStudent(null);
    setLoading(true);

    try {
      const result = await api.retrieveStudent(studentId, email);

      if (!result.success) {
        setError(result.message || 'Student ID or email address is incorrect.');
        setLoading(false);
        return;
      }

      setStudent(result.data);
    } catch (err) {
      setError('An error occurred while connecting to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Retrieve Student ID Card
          </h1>
          <p className="text-sm text-slate-500">
            Enter your assigned Student ID and registered email address to access your ID card.
          </p>
        </div>

        {/* Retrieval Form */}
        <form
          onSubmit={handleRetrieve}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-5"
        >
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-semibold">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Student ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. SPXEST-TE0001"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Registered Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rohit.kumar@example.com"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Finding your ID card...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>RETRIEVE ID CARD</span>
              </>
            )}
          </button>
        </form>

        {/* Retrieved Student Result */}
        {student && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
                  Verified Record
                </span>
                <h2 className="text-2xl font-bold text-slate-900">{student.fullName}</h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">ID: {student.studentId}</p>
              </div>
              <StatusBadge status={student.status} size="lg" />
            </div>

            {/* Student metadata grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>{student.mobile}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 sm:col-span-2">
                <Building2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="truncate">{student.collegeName} • {student.branch}</span>
              </div>
            </div>

            {/* Card Preview */}
            <div className="py-2">
              <IDCardPreview
                studentId={student.studentId}
                fullName={student.fullName}
                version={student.cardVersion || 1}
              />
            </div>

            {/* Downloads */}
            <div className="flex justify-center pt-2">
              <DownloadButtons studentId={student.studentId} size="large" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
