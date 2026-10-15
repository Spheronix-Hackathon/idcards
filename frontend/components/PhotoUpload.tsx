'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, RefreshCw, Camera, AlertCircle, Crop } from 'lucide-react';
import { ImageCropperModal } from './ImageCropperModal';

interface PhotoUploadProps {
  onPhotoSelected: (file: File | null) => void;
  error?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoSelected, error }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setLocalError(null);

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setLocalError('Only JPG, JPEG, PNG, and WEBP formats are accepted.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setLocalError('Photograph must be under 8 MB in size.');
      return;
    }

    // Revoke previous raw image source if any
    if (rawImageSrc) {
      URL.revokeObjectURL(rawImageSrc);
    }

    const objectUrl = URL.createObjectURL(file);
    setRawImageSrc(objectUrl);
    // Automatically open interactive circular crop modal
    setIsCropModalOpen(true);
  };

  const handleCropComplete = (croppedFile: File, croppedPreviewUrl: string) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(croppedPreviewUrl);
    onPhotoSelected(croppedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (rawImageSrc) {
      URL.revokeObjectURL(rawImageSrc);
    }
    setPreviewUrl(null);
    setRawImageSrc(null);
    setLocalError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onPhotoSelected(null);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        Student Photograph <span className="text-rose-500">*</span>
      </label>
      <p className="text-xs text-slate-500 mb-3">
        Upload your portrait photo (you can drag and zoom to crop your face perfectly).
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
        id="student-photo-input"
      />

      {/* Interactive Circular Cropper Modal */}
      {rawImageSrc && (
        <ImageCropperModal
          isOpen={isCropModalOpen}
          imageSrc={rawImageSrc}
          onClose={() => setIsCropModalOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}

      {!previewUrl ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[180px] ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center mb-3">
            <Camera className="w-7 h-7" />
          </div>
          <span className="text-sm font-semibold text-slate-800">
            Click to upload or drag & drop photo
          </span>
          <span className="text-xs text-slate-500 mt-1">
            Full portrait or headshot (interactive crop tool included)
          </span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl border border-slate-200 bg-slate-50/70">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-blue-600/40 flex-shrink-0 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Cropped student preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-2 text-center sm:text-left flex-grow">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-sm font-bold text-slate-800">
                Photo Framed & Ready
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                Cropped
              </span>
            </div>
            <span className="text-xs text-slate-500">
              Face positioned for the official Spheronix circular ID card badge.
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => setIsCropModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100/70 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Crop className="w-3.5 h-3.5" />
                Adjust Crop
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200/70 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change Photo
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {(localError || error) && (
        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-rose-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{localError || error}</span>
        </div>
      )}
    </div>
  );
};
