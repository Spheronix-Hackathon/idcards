'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Check, X, Move, UserCheck } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedFile: File, previewUrl: string) => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const VIEW_SIZE = 340; // Viewport width and height in px
  const CROP_RADIUS = 130; // 260px diameter crop circle

  // Reset state on modal open or image change
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [isOpen, imageSrc]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const nw = imageRef.current.naturalWidth;
      const nh = imageRef.current.naturalHeight;
      setNaturalSize({ width: nw, height: nh });
      setImageLoaded(true);

      // Default positioning: if vertical portrait photo, align head towards top
      if (nh > nw) {
        // Shift image slightly down so the head (top 20-35%) is centered in the circle
        const baseFitSize = 2 * CROP_RADIUS;
        const scaledHeight = (nh / nw) * baseFitSize;
        const extraHeight = (scaledHeight - baseFitSize) / 2;
        // Shift down by approx 25% of extra height to frame the face
        setPan({ x: 0, y: Math.min(extraHeight * 0.45, 80) });
      } else {
        setPan({ x: 0, y: 0 });
      }
    }
  };

  // Base scale calculation: image must at least cover the crop diameter
  const getBaseScale = useCallback(() => {
    if (!naturalSize.width || !naturalSize.height) return 1;
    const minDim = Math.min(naturalSize.width, naturalSize.height);
    return (2 * CROP_RADIUS) / minDim;
  }, [naturalSize, CROP_RADIUS]);

  // Handle Drag / Pan with Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle Touch Drag for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Handle Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(Math.max(1, prev + delta), 3.5));
  };

  const handleReset = () => {
    setZoom(1);
    if (naturalSize.height > naturalSize.width) {
      const baseFitSize = 2 * CROP_RADIUS;
      const scaledHeight = (naturalSize.height / naturalSize.width) * baseFitSize;
      const extraHeight = (scaledHeight - baseFitSize) / 2;
      setPan({ x: 0, y: Math.min(extraHeight * 0.45, 80) });
    } else {
      setPan({ x: 0, y: 0 });
    }
  };

  // Generate cropped output canvas and export as high-res File
  const handleApplyCrop = () => {
    if (!imageRef.current || !naturalSize.width || !naturalSize.height) return;

    const exportSize = 800; // High-resolution square output
    const canvas = document.createElement('canvas');
    canvas.width = exportSize;
    canvas.height = exportSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, exportSize, exportSize);

    const baseScale = getBaseScale();
    const currentScale = baseScale * zoom;

    // Export scale factor from viewport to 800x800 canvas
    const exportMultiplier = exportSize / (2 * CROP_RADIUS);

    // Center coordinates in export canvas
    const cx = exportSize / 2;
    const cy = exportSize / 2;

    ctx.save();
    ctx.translate(cx + pan.x * exportMultiplier, cy + pan.y * exportMultiplier);
    ctx.scale(currentScale * exportMultiplier, currentScale * exportMultiplier);

    // Draw the image centered around the origin
    ctx.drawImage(
      imageRef.current,
      -naturalSize.width / 2,
      -naturalSize.height / 2,
      naturalSize.width,
      naturalSize.height
    );
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], 'student-photo-cropped.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        const previewUrl = URL.createObjectURL(blob);
        onCropComplete(croppedFile, previewUrl);
        onClose();
      },
      'image/jpeg',
      0.95
    );
  };

  if (!isOpen) return null;

  const baseScale = getBaseScale();
  const currentScale = baseScale * zoom;
  const displayWidth = naturalSize.width ? naturalSize.width * currentScale : 0;
  const displayHeight = naturalSize.height ? naturalSize.height * currentScale : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Crop & Frame Headshot</h3>
              <p className="text-xs text-slate-500">Position your face inside the ID card frame</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Cropper Viewport */}
        <div className="p-6 flex flex-col items-center bg-slate-100/60 select-none">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            style={{ width: VIEW_SIZE, height: VIEW_SIZE }}
            className={`relative overflow-hidden rounded-2xl bg-slate-950 shadow-inner cursor-${
              isDragging ? 'grabbing' : 'grab'
            } flex items-center justify-center`}
          >
            {/* The Image being transformed */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              onLoad={handleImageLoad}
              draggable={false}
              style={{
                width: displayWidth || 'auto',
                height: displayHeight || 'auto',
                maxWidth: 'none',
                maxHeight: 'none',
                transform: `translate(${pan.x}px, ${pan.y}px)`,
                pointerEvents: 'none'
              }}
              className="absolute transition-transform duration-75 select-none"
            />

            {/* Circular Mask & Overlay */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={VIEW_SIZE}
              height={VIEW_SIZE}
              viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
            >
              <defs>
                <mask id="circle-cutout-mask">
                  {/* Fill entire canvas with white */}
                  <rect width={VIEW_SIZE} height={VIEW_SIZE} fill="#FFFFFF" />
                  {/* Cut out the center circle with black */}
                  <circle cx={VIEW_SIZE / 2} cy={VIEW_SIZE / 2} r={CROP_RADIUS} fill="#000000" />
                </mask>
              </defs>

              {/* Darkened backdrop outside the circle */}
              <rect
                width={VIEW_SIZE}
                height={VIEW_SIZE}
                fill="#0F172A"
                fillOpacity="0.65"
                mask="url(#circle-cutout-mask)"
              />

              {/* Spheronix ID Card Double Framing Rings */}
              <circle
                cx={VIEW_SIZE / 2}
                cy={VIEW_SIZE / 2}
                r={CROP_RADIUS}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3.5"
              />
              <circle
                cx={VIEW_SIZE / 2}
                cy={VIEW_SIZE / 2}
                r={CROP_RADIUS + 2}
                fill="none"
                stroke="#0066FF"
                strokeWidth="2"
              />

              {/* Subtle Rule-of-Thirds Crosshairs to guide face centering */}
              <circle
                cx={VIEW_SIZE / 2}
                cy={VIEW_SIZE / 2}
                r={CROP_RADIUS}
                fill="none"
                stroke="#60A5FA"
                strokeWidth="1"
                strokeDasharray="4 6"
                opacity="0.4"
              />
            </svg>

            {/* Helper Drag Badge */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-200 flex items-center gap-1 pointer-events-none shadow">
              <Move className="w-3 h-3 text-blue-400" />
              <span>Drag to position face</span>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="w-full max-w-[340px] mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(1, prev - 0.2))}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-200/70 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="1"
              max="3.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-grow h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(3.5, prev + 0.2))}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-200/70 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-200/70 rounded-lg transition-colors ml-1"
              title="Reset Position"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            Zoom: {Math.round(zoom * 100)}% • Use scroll wheel or slider to zoom
          </span>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={!imageLoaded}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Apply Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
