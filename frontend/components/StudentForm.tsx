'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { PhotoUpload } from './PhotoUpload';
import { api } from '../lib/api';
import { Loader2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface FormData {
  fullName: string;
  email: string;
  mobile: string;
  collegeName: string;
  branch: string;
  course?: string;
  rollNumber?: string;
  graduationYear?: string;
}

export const StudentForm: React.FC = () => {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setPhotoError(null);

    if (!photoFile) {
      setPhotoError('Student photograph is required. Please upload your photo.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      formData.append('email', data.email);
      formData.append('mobile', data.mobile);
      formData.append('collegeName', data.collegeName);
      formData.append('branch', data.branch);
      if (data.course) formData.append('course', data.course);
      if (data.rollNumber) formData.append('rollNumber', data.rollNumber);
      if (data.graduationYear) formData.append('graduationYear', data.graduationYear);
      formData.append('photo', photoFile);

      const result = await api.createStudent(formData);

      if (!result.success) {
        setServerError(result.message || 'Registration failed. Please check your details.');
        setIsSubmitting(false);
        return;
      }

      // Redirect to success page with studentId
      router.push(`/success?studentId=${result.data.studentId}`);
    } catch (err: any) {
      setServerError('A network error occurred while connecting to the server. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-6 max-w-2xl mx-auto"
    >
      {/* Top Banner */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Official Registration</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Student Information
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Fill in your details accurately. Your official student ID card will be issued automatically.
        </p>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <div>
            <p className="text-sm font-semibold">Registration Issue</p>
            <p className="text-xs mt-0.5 text-rose-600">{serverError}</p>
          </div>
        </div>
      )}

      {/* Mandatory Personal Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Rohit Kumar"
            {...register('fullName', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
          {errors.fullName && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            placeholder="e.g. rohit.kumar@example.com"
            {...register('email', {
              required: 'Email address is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
          {errors.email && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Mobile Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            placeholder="e.g. +91 98765 43210"
            {...register('mobile', {
              required: 'Mobile number is required',
              minLength: { value: 10, message: 'Mobile must be at least 10 digits' }
            })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
          {errors.mobile && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.mobile.message}</p>
          )}
        </div>

        {/* College Name */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            College Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. ABC Engineering College"
            {...register('collegeName', { required: 'College name is required' })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
          {errors.collegeName && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.collegeName.message}</p>
          )}
        </div>

        {/* Branch / Department */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Branch / Department <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Computer Science and Engineering"
            {...register('branch', { required: 'Branch / Department is required' })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
          {errors.branch && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.branch.message}</p>
          )}
        </div>
      </div>

      {/* Optional Academic Fields */}
      <div className="border-t border-slate-100 pt-5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Optional Academic Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Course / Degree
            </label>
            <input
              type="text"
              placeholder="e.g. B.Tech"
              {...register('course')}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Roll / Reg. Number
            </label>
            <input
              type="text"
              placeholder="e.g. 21CS042"
              {...register('rollNumber')}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Graduation Year
            </label>
            <input
              type="text"
              placeholder="e.g. 2026"
              {...register('graduationYear')}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Photo Upload Section */}
      <div className="border-t border-slate-100 pt-5">
        <PhotoUpload onPhotoSelected={setPhotoFile} error={photoError || undefined} />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating your temporary ID card...</span>
            </>
          ) : (
            <>
              <span>GENERATE STUDENT ID</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
