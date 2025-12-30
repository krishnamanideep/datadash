'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">Loading map...</div>
});

interface BoothData {
  PS_NO_2021: string;
  LOCALITY_EXTRACTED: string;
  Latitude: number;
  Longitude: number;
  BJP_2021_pct: number;
  DMK_2021_pct: number;
  AIADMK_2016_pct: number;
  TOP_SCORE_PARTY: string;
  TOP_SCORE_CATEGORY: string;
  IND_2011_pct: number;
  [key: string]: any;
}

export default function RetroBoothsAnalysis({ selectedAssembly }: { selectedAssembly: string }) {
  const [data, setData] = useState<BoothData[]>([]);
  const [retroBooths, setRetroBooths] = useState<BoothData[]>([]);
  const [weakBooths, setWeakBooths] = useState<any>({});
  const [independentHotspots, setIndependentHotspots] = useState<BoothData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/data.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((jsonData) => {
        const assemblyKey = `AC_${selectedAssembly}_FINAL`;
        const assemblyData = jsonData[assemblyKey] || [];
        setData(assemblyData);
        analyzeBooths(assemblyData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [selectedAssembly]);

  const analyzeBooths = (booths: BoothData[]) => {
    // Retro Booths: Booths with consistent performance for a party
    const retro = booths.filter((b) => {
      const bjpConsistent = (b.BJP_2021_pct || 0) > 0.4;
      const dmkConsistent = (b.DMK_2021_pct || 0) > 0.4 && (b.DMK_2016_pct || 0) > 0.3;
      return bjpConsistent || dmkConsistent;
    });
    setRetroBooths(retro);

    // Independent Hotspots: High independent votes
    const indHotspots = booths.filter((b) => (b.IND_2011_pct || 0) > 0.1).slice(0, 20);
    setIndependentHotspots(indHotspots);

    // Weak Booths Analysis
    const parties = ['BJP', 'DMK', 'AIADMK'];
    const weak: any = {};
    
    parties.forEach((party) => {
      weak[party] = booths
        .map((b) => ({
          ...b,
          score: b[`${party}_2021_pct`] || b[`${party}_2016_pct`] || 0,
        }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 10);
    });
    
    setWeakBooths(weak);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading booth analysis...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error loading data: {error}</div>;
  }

  if (!data.length) {
    return <div className="p-8 text-center">No data available for Assembly {selectedAssembly}</div>;
  }

  const heatMapData = data.map((booth) => ({
    x: booth.BJP_2021_pct * 100,
    y: booth.DMK_2021_pct * 100,
    locality: booth.LOCALITY_EXTRACTED,
    category: booth.TOP_SCORE_CATEGORY,
  }));

  const getCategoryColor = (category: string) => {
    const colors: any = {
      A: '#10b981',
      B: '#3b82f6',
      C: '#f59e0b',
      D: '#ef4444',
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Assembly {selectedAssembly} - Retro-Booths & Heat Maps</h2>

      {/* Heat Map */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">BJP vs DMK Performance Heat Map</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="BJP Vote %"
              label={{ value: 'BJP Vote Share %', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="DMK Vote %"
              label={{ value: 'DMK Vote Share %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Polling Booths" data={heatMapData} fill="#8884d8">
              {heatMapData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
            <span>Category A (Strong)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
            <span>Category B</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>Category C</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Category D (Weak)</span>
          </div>
        </div>
      </div>

      {/* Retro Booths */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Retro Booths ({retroBooths.length} booths)</h3>
        <p className="text-gray-600 mb-4">Booths with consistent strong performance for a party</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Locality</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">BJP 2021</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DMK 2021</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {retroBooths.slice(0, 10).map((booth, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm">{booth.LOCALITY_EXTRACTED}</td>
                  <td className="px-4 py-3 text-sm">{((booth.BJP_2021_pct || 0) * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-sm">{((booth.DMK_2021_pct || 0) * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      booth.TOP_SCORE_CATEGORY === 'A' ? 'bg-green-100 text-green-800' :
                      booth.TOP_SCORE_CATEGORY === 'B' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {booth.TOP_SCORE_CATEGORY}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weak Booths by Party */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(weakBooths).map(([party, booths]: [string, any]) => (
          <div key={party} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-red-600">{party} - Weak Booths</h3>
            <div className="space-y-2">
              {booths.slice(0, 5).map((booth: any, idx: number) => (
                <div key={idx} className="p-3 bg-red-50 rounded">
                  <div className="text-sm font-medium">{booth.LOCALITY_EXTRACTED}</div>
                  <div className="text-xs text-gray-600">Score: {(booth.score * 100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Independent Hotspots */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Independent Candidate Hotspots</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {independentHotspots.map((booth, idx) => (
            <div key={idx} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="font-medium text-gray-800">{booth.LOCALITY_EXTRACTED}</div>
              <div className="text-sm text-gray-600 mt-1">
                Independent Votes: {((booth.IND_2011_pct || 0) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
