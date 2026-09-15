'use client';

import React, { useState } from 'react';
import { Maximize2, ShieldCheck, Download, X } from 'lucide-react';
import { api } from '../lib/api';

interface IDCardPreviewProps {
  studentId: string;
  fullName?: string;
  className?: string;
  version?: number;
}

export const IDCardPreview: React.FC<IDCardPreviewProps> = ({
  studentId,
  fullName,
  className = '',
  version = 1
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVertical, setIsVertical] = useState(true);
  const [mountTime] = useState(() => Date.now());

  // Cache-busting query parameter on version and mount change
  const imageUrl = `${api.getStudentCardImageUrl(studentId)}?v=${version}&t=${mountTime}`;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className={`relative group ${
          isVertical ? 'max-w-[360px]' : 'max-w-[540px]'
        } w-full rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200/80 bg-white`}
      >
        {/* Loading Skeleton */}
        {isLoading && (
          <div
            className={`w-full ${
              isVertical ? 'aspect-[638/1012]' : 'aspect-[1012/638]'
            } bg-slate-100 animate-pulse flex items-center justify-center`}
          >
            <span className="text-xs font-semibold text-slate-400">Loading card preview...</span>
          </div>
        )}

        {/* Card Image with Dynamic Aspect Detection */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={`Student ID Card - ${fullName || studentId}`}
          className={`w-full h-auto object-contain transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={(e) => {
            setIsLoading(false);
            const img = e.currentTarget;
            setIsVertical(img.naturalHeight > img.naturalWidth);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />

        {hasError && (
          <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-6 text-center min-h-[220px]">
            <span className="text-sm font-semibold text-slate-700 mb-1">
              Card Preview Unavailable
            </span>
            <span className="text-xs text-slate-500">
              Please click download below to retrieve the generated ID card.
            </span>
          </div>
        )}

        {/* Quick Zoom Overlay on Hover */}
        {!hasError && !isLoading && (
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/95 hover:bg-white text-slate-900 text-xs font-bold rounded-xl shadow-lg transition-transform transform hover:scale-105"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Full View</span>
            </button>
            <a
              href={api.getStudentCardImageUrl(studentId, true)}
              download={`SPHERONIX-ID-${studentId}.png`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg transition-transform transform hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </a>
          </div>
        )}
      </div>

      {/* Security Guarantee Note */}
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-medium">
        <ShieldCheck className="w-4 h-4 text-blue-600" />
        <span>Official Spheronix Student ID • Security Validated</span>
      </div>

      {/* Fullscreen Zoom Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <div
            className={`relative ${
              isVertical ? 'max-w-md' : 'max-w-4xl'
            } w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 flex flex-col items-center`}
          >
            <div className="w-full flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Spheronix Student ID Card
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  ID: {studentId} • Version {version}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`Full size preview of ${studentId}`}
              className="w-full h-auto rounded-xl shadow-inner max-h-[75vh] object-contain border border-slate-200"
            />

            <div className="w-full flex justify-end gap-3 mt-5">
              <a
                href={api.getStudentCardImageUrl(studentId, true)}
                download={`SPHERONIX-ID-${studentId}.png`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
