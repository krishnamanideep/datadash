'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import AssemblyOverview from '@/components/AssemblyOverview';
import PoliticalHistory from '@/components/PoliticalHistory';
import RetroBoothsAnalysis from '@/components/RetroBoothsAnalysis';
import CandidatePanel from '@/components/CandidatePanel';
import CurrentScenario from '@/components/CurrentScenario';
import Survey from '@/components/Survey';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState('overview');
  const [selectedAssembly, setSelectedAssembly] = useState('1');

  const assemblies = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '15', '17', '18', '19', '20', '21', '22', '23'
  ];

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
      
      {/* Assembly Selector */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <label className="font-semibold text-gray-700">Select Assembly:</label>
            <select
              value={selectedAssembly}
              onChange={(e) => setSelectedAssembly(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {assemblies.map((ac) => (
                <option key={ac} value={ac}>
                  Assembly {ac}
                </option>
              ))}
            </select>
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
