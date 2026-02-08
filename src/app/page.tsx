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
  const [selectedAssembly, setSelectedAssembly] = useState('1');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {ASSEMBLIES.map((ac) => (
                  <option key={ac.id} value={ac.id}>
                    {ac.id}. {ac.name}
                  </option>
                ))}
              </select>
            </div>
            <PDFDownloader selectedAssembly={selectedAssembly} onPageChange={setCurrentPage} />
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
