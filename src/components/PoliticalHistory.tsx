'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface BoothData {
  [key: string]: any;
}

export default function PoliticalHistory({ selectedAssembly }: { selectedAssembly: string }) {
  const [data, setData] = useState<BoothData[]>([]);
  const [trends, setTrends] = useState<any>(null);
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
        analyzeTrends(assemblyData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [selectedAssembly]);

  const analyzeTrends = (booths: BoothData[]) => {
    // Calculate party vote shares across years
    const years = ['2011', '2016', '2021'];
    const parties = ['NRC', 'DMK', 'AIADMK', 'BJP', 'PMK', 'IND', 'OTHERS'];

    const trendData = years.map((year) => {
      const yearData: any = { year };
      
      parties.forEach((party) => {
        const key = `${party}_${year}_pct`;
        const totalPct = booths.reduce((sum, b) => sum + (b[key] || 0), 0);
        yearData[party] = ((totalPct / booths.length) * 100).toFixed(2);
      });

      return yearData;
    });

    // Swing analysis
    const swing2011to2016 = calculateSwing(booths, '2011', '2016');
    const swing2016to2021 = calculateSwing(booths, '2016', '2021');

    setTrends({
      trendData,
      swing2011to2016,
      swing2016to2021,
    });
  };

  const calculateSwing = (booths: BoothData[], year1: string, year2: string) => {
    const parties = ['NRC', 'DMK', 'AIADMK', 'BJP', 'PMK'];
    return parties.map((party) => {
      const avg1 = booths.reduce((sum, b) => sum + (b[`${party}_${year1}_pct`] || 0), 0) / booths.length;
      const avg2 = booths.reduce((sum, b) => sum + (b[`${party}_${year2}_pct`] || 0), 0) / booths.length;
      const swing = ((avg2 - avg1) * 100).toFixed(2);
      return { party, swing: parseFloat(swing) };
    }).filter(p => p.swing !== 0);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading political history...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error loading data: {error}</div>;
  }

  if (!data.length || !trends) {
    return <div className="p-8 text-center">No data available for Assembly {selectedAssembly}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Assembly {selectedAssembly} - Political History & Dynamics</h2>

      {/* Electoral Trends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Electoral Trends (2011-2021)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trends.trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis label={{ value: 'Vote Share %', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="BJP" stroke="#FF6B35" strokeWidth={2} />
            <Line type="monotone" dataKey="DMK" stroke="#E63946" strokeWidth={2} />
            <Line type="monotone" dataKey="AIADMK" stroke="#06A77D" strokeWidth={2} />
            <Line type="monotone" dataKey="NRC" stroke="#0077B6" strokeWidth={2} />
            <Line type="monotone" dataKey="PMK" stroke="#FFC300" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Swing Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Vote Swing (2011 → 2016)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends.swing2011to2016}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="party" />
              <YAxis label={{ value: 'Swing %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="swing" fill="#8884d8">
                {trends.swing2011to2016.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.swing > 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Vote Swing (2016 → 2021)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends.swing2016to2021}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="party" />
              <YAxis label={{ value: 'Swing %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="swing" fill="#8884d8">
                {trends.swing2016to2021.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.swing > 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Qualitative Analysis */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Key Dynamics & Insights</h3>
        <div className="prose max-w-none">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-semibold mr-2">•</span>
              <span>
                <strong>2011-2016:</strong> Major shifts in party preferences with{' '}
                {trends.swing2011to2016.find((s: any) => s.swing > 0)?.party || 'multiple parties'} gaining ground.
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">•</span>
              <span>
                <strong>2016-2021:</strong> BJP's emergence as a significant force with substantial vote share gains.
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">•</span>
              <span>
                <strong>Historical Pattern:</strong> The constituency shows fluid voter behavior with no single party dominance across all three elections.
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">•</span>
              <span>
                <strong>Vote Bank Analysis:</strong> Traditional vote banks are fragmenting, creating opportunities for multi-cornered contests.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
