'use client';

import Image from 'next/image';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export function DashboardHeader({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-4">
          {/* JCM Logo */}
          <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
            <Image
              src="/logo/jcm-logo.svg"
              alt="JCM Logo"
              width={80}
              height={80}
              priority
            />
          </div>
          
          {/* Title Section */}
          <div>
            <h1 className="text-4xl font-bold">{title}</h1>
            <p className="text-blue-100 mt-2">{subtitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
