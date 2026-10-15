import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import companyLogo from '../image/company logo.png';
import { ShieldCheck } from 'lucide-react';
import { NavbarButtons } from '../components/NavbarButtons';

export const metadata: Metadata = {
  title: 'Spheronix Student ID Card Generator',
  description:
    'Official Spheronix Technologies Pvt. Ltd. portal for student ID registration, verification, and instant card download.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* Navigation Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Official Company Logo */}
            <Link href="/" className="flex items-center group py-1.5">
              <Image
                src={companyLogo}
                alt="SPHERONIX Technologies Pvt. Ltd."
                className="h-9 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                priority
              />
            </Link>

            {/* Nav Action Buttons */}
            <NavbarButtons />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Global Footer */}
        <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>SPHERONIX TECHNOLOGIES PVT. LTD. • Official ID Generator</span>
            </div>
            <p className="text-slate-500">
              © {new Date().getFullYear()} Spheronix Technologies Pvt. Ltd. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
