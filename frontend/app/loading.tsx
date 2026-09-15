import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="spheronix-mesh min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Loading Spheronix Portal...
        </p>
      </div>
    </div>
  );
}
