'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import AssemblyOverview from '@/components/AssemblyOverview';
import PoliticalHistory from '@/components/PoliticalHistory';
import RetroBoothsAnalysis from '@/components/RetroBoothsAnalysis';
import CandidatePanel from '@/components/CandidatePanel';
import CurrentScenario from '@/components/CurrentScenario';
import Survey from '@/components/Survey';
import PDFDownloader from '@/components/PDFDownloader';
import { ASSEMBLIES } from '@/data/assemblies';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState('overview');
  const [selectedAssembly, setSelectedAssembly] = useState('');

  // Calculate allowed assemblies based on user role
  const allowedAssemblies = user?.role === 'admin'
    ? ASSEMBLIES
    : ASSEMBLIES.filter(a => user?.accessibleAssemblies?.includes(a.id));

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Set initial selected assembly when filtered list is ready
  useEffect(() => {
    if (allowedAssemblies && allowedAssemblies.length > 0) {
      // If currently selected assembly is not in the allowed list, select the first one
      const isCurrentValid = allowedAssemblies.find(a => a.id === selectedAssembly);
      if (!isEmpty(selectedAssembly) && !isCurrentValid) {
        setSelectedAssembly(allowedAssemblies[0].id);
      } else if (isEmpty(selectedAssembly)) {
        setSelectedAssembly(allowedAssemblies[0].id);
      }
    } else if (!loading && user && (!allowedAssemblies || allowedAssemblies.length === 0)) {
      // No access
      setSelectedAssembly('');
    }
  }, [allowedAssemblies, user, loading]);

  const isEmpty = (str: string) => !str || str.length === 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If user has no access to any assembly
  if (allowedAssemblies && allowedAssemblies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Access Restricted</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              You do not have access to any Assembly data yet. Please contact the administrator to request access.
            </p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => router.push('/login')}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <AssemblyOverview selectedAssembly={selectedAssembly} />;
      case 'political-history':
        return <PoliticalHistory selectedAssembly={selectedAssembly} />;
      case 'retro-booths':
        return <RetroBoothsAnalysis selectedAssembly={selectedAssembly} />;
      case 'candidates':
        return <CandidatePanel selectedAssembly={selectedAssembly} />;
      case 'current-scenario':
        return <CurrentScenario selectedAssembly={selectedAssembly} />;
      case 'survey':
        return <Survey selectedAssembly={selectedAssembly} />;
      default:
        return <AssemblyOverview selectedAssembly={selectedAssembly} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Assembly Selector & Actions */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="font-semibold text-gray-700">Select Assembly:</label>
              <select
                value={selectedAssembly}
                onChange={(e) => setSelectedAssembly(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {allowedAssemblies?.map((ac) => (
                  <option key={ac.id} value={ac.id}>
                    {ac.id}. {ac.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Show Logout for quick access if needed, or PDF Downloader */}
            <div className="flex gap-2">
              <PDFDownloader selectedAssembly={selectedAssembly} onPageChange={setCurrentPage} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {renderPage()}
      </main>
    </div>
  );
}
