'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { generateElectionData } from '@/lib/data';
import { DashboardHeader } from '@/components/DashboardHeader';
import { PollingLocationFilter } from '@/components/PollingLocationFilter';
import { ElectionSummaryStats } from '@/components/StatCard';
import { CandidateComparisonChart, ElectionTrendChart, CandidateVotePieChart } from '@/components/Charts';
import { LocationTable } from '@/components/LocationTable';
import { GIDashboard } from '@/components/GIDashboard';
import { SurveyReport } from '@/components/SurveyReport';
import { FileUpload } from '@/components/FileUpload';
import { LocalityAnalysis } from '@/components/LocalityAnalysis';
import { DashboardData, PollingStation } from '@/types/data';

// Dynamically import MapComponent to handle Leaflet SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
});

const TAB_VIEWS = {
  OVERVIEW: 'overview',
  MAPS: 'maps',
  CANDIDATES: 'candidates',
  LOCALITY: 'locality',
  TABLE: 'table',
  GI_DASHBOARD: 'gi',
  SURVEY: 'survey',
  UPLOAD: 'upload',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState(TAB_VIEWS.OVERVIEW);
  const [selectedYear, setSelectedYear] = useState<2011 | 2016 | 2021>(2021);
  const [selectedAssembly, setSelectedAssembly] = useState(24);
  const [filteredStations, setFilteredStations] = useState<PollingStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const generatedData = generateElectionData();
      setData(generatedData);
      setFilteredStations(generatedData.pollingStations);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = (file: File, type: string) => {
    console.log(`Uploading ${type} file:`, file.name);
  };

  const handleLocationFilter = (stations: PollingStation[]) => {
    setFilteredStations(stations);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Election Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Logo */}
      <DashboardHeader
        title="Election Dashboard"
        subtitle=""
      />

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex space-x-4 md:space-x-8">
            {Object.entries(TAB_VIEWS).map(([key, value]) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap transition-colors ${
                  activeTab === value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {key.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === TAB_VIEWS.OVERVIEW && (
          <div>
            <ElectionSummaryStats summary={data.summary} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <CandidateComparisonChart data={data.candidatePerformance} />
              <ElectionTrendChart data={data.regionalStats} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <CandidateVotePieChart data={data.candidatePerformance} year={2011} />
              <CandidateVotePieChart data={data.candidatePerformance} year={2016} />
              <CandidateVotePieChart data={data.candidatePerformance} year={2021} />
            </div>
          </div>
        )}

        {/* Maps Tab */}
        {activeTab === TAB_VIEWS.MAPS && (
          <div>
            <PollingLocationFilter
              pollingStations={data.pollingStations}
              onSelect={handleLocationFilter}
            />
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Polling Stations Map</h2>
                <p className="text-gray-600 mt-1">Showing {filteredStations.length} of {data.pollingStations.length} polling stations</p>
              </div>
              <div style={{ height: '600px' }}>
                <MapComponent pollingStations={filteredStations} />
              </div>
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === TAB_VIEWS.CANDIDATES && (
          <div>
            <div className="mb-6 flex gap-4">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                Select Year:
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value) as 2011 | 2016 | 2021)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2011}>2011</option>
                  <option value={2016}>2016</option>
                  <option value={2021}>2021</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <CandidateVotePieChart data={data.candidatePerformance} year={selectedYear} />
              <div className="lg:col-span-2">
                <CandidateComparisonChart data={data.candidatePerformance} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Candidate Performance Trend</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Candidate</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">2011 %</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">2016 %</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">2021 %</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.candidatePerformance.map((candidate) => (
                      <tr key={candidate.name} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{candidate.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{candidate.votes_2011.toFixed(2)}%</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{candidate.votes_2016.toFixed(2)}%</td>
                        <td className="px-6 py-4 text-sm font-semibold text-blue-600">{candidate.votes_2021.toFixed(2)}%</td>
                        <td className={`px-6 py-4 text-sm font-semibold ${candidate.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {candidate.trend >= 0 ? '+' : ''}{candidate.trend.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Locality Analysis Tab */}
        {activeTab === TAB_VIEWS.LOCALITY && (
          <LocalityAnalysis pollingStations={filteredStations} />
        )}

        {/* Table Tab */}
        {activeTab === TAB_VIEWS.TABLE && (
          <LocationTable pollingStations={filteredStations} />
        )}

        {/* GI Dashboard Tab */}
        {activeTab === TAB_VIEWS.GI_DASHBOARD && data.giData && (
          <GIDashboard giData={data.giData} />
        )}

        {/* Survey Tab */}
        {activeTab === TAB_VIEWS.SURVEY && data.surveyData && (
          <SurveyReport surveyData={data.surveyData} />
        )}

        {/* Upload Tab */}
        {activeTab === TAB_VIEWS.UPLOAD && (
          <FileUpload onFileUpload={handleFileUpload} />
        )}
      </main>
    </div>
  );
}
