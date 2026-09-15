import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  Search,
  CreditCard,
  CheckCircle
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="spheronix-mesh w-full min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      {/* Full Page Open Hero Layout */}
      <div className="max-w-4xl w-full mx-auto text-center space-y-8">
        {/* Official Portal Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-sm">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Official Student ID Portal</span>
        </div>

        {/* Unique Stylized Typography Brand Header (100% Vector Text) */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative inline-block">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight select-none">
              <span className="text-slate-900">SPHER</span>
              <span className="text-blue-600">ONIX</span>
            </h1>
            <div className="h-1.5 w-16 bg-blue-600 rounded-full mx-auto mt-2.5"></div>
          </div>

          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold tracking-[0.25em] text-slate-500 uppercase">
            <span>Technologies</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>Pvt. Ltd.</span>
          </div>

          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-600 text-white text-xs sm:text-sm font-extrabold tracking-widest uppercase shadow-md shadow-blue-500/25">
            <CreditCard className="w-4 h-4" />
            <span>STUDENT ID CARD</span>
          </div>
        </div>

        {/* Clear Professional Description */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Register your details and generate your official Spheronix Student ID Card.
          Instant verification, atomic ID assignment, and one-click PNG &amp; PDF downloads.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
          >
            <span>GENERATE STUDENT ID</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/retrieve-id"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm sm:text-base shadow-sm hover:shadow active:scale-[0.98] transition-all"
          >
            <Search className="w-5 h-5 text-blue-600" />
            <span>RETRIEVE ID CARD</span>
          </Link>
        </div>

        {/* Simple Trust Verification Line */}
        <div className="pt-6 flex items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Verified Credential
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            High-DPI Print Ready
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Instant Download
          </span>
        </div>
      </div>
    </div>
  );
}
