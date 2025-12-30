'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  POLLED_2021: number;
  VOTERS_2021: number;
  TOP_SCORE_PARTY: string;
  TOP_SCORE_CATEGORY: string;
  [key: string]: any;
}

interface AssemblyData {
  [key: string]: BoothData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AssemblyOverview({ selectedAssembly }: { selectedAssembly: string }) {
  const [data, setData] = useState<BoothData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const basePath = process.env.NODE_ENV === 'production' ? '/datadash' : '';
    fetch(`${basePath}/data.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((jsonData: AssemblyData) => {
        const assemblyKey = `AC_${selectedAssembly}_FINAL`;
        const assemblyData = jsonData[assemblyKey] || [];
        console.log('Loaded data for', assemblyKey, 'booths:', assemblyData.length);
        setData(assemblyData);
        calculateStats(assemblyData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [selectedAssembly]);

  const calculateStats = (booths: BoothData[]) => {
    const totalPolled = booths.reduce((sum, b) => sum + (b.POLLED_2021 || 0), 0);
    const totalVoters = booths.reduce((sum, b) => sum + (b.VOTERS_2021 || 0), 0);
    const turnout = totalVoters > 0 ? (totalPolled / totalVoters) * 100 : 0;

    const partyVotes: { [key: string]: number } = {};
    booths.forEach((booth) => {
      const match = booth.TOP_SCORE_PARTY?.match(/^(\w+)/);
      if (match) {
        const party = match[1];
        partyVotes[party] = (partyVotes[party] || 0) + 1;
      }
    });

    const partyData = Object.entries(partyVotes).map(([party, count]) => ({
      party,
      booths: count,
      percentage: ((count / booths.length) * 100).toFixed(1),
    }));

    const categoryDist = booths.reduce((acc: any, b) => {
      const cat = b.TOP_SCORE_CATEGORY || 'Unknown';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const categoryData = Object.entries(categoryDist).map(([category, count]) => ({
      category,
      value: count,
    }));

    setStats({
      totalBooths: booths.length,
      totalVoters,
      totalPolled,
      turnout: turnout.toFixed(2),
      partyData,
      categoryData,
    });
  };

  if (loading) {
    return <div className="p-8 text-center">Loading assembly data...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error loading data: {error}</div>;
  }

  if (!data.length) {
    return <div className="p-8 text-center">No data available for Assembly {selectedAssembly}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Assembly {selectedAssembly} - Overview</h2>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="text-sm text-gray-600">Total Booths</div>
          <div className="text-3xl font-bold text-blue-600">{stats?.totalBooths}</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="text-sm text-gray-600">Total Voters</div>
          <div className="text-3xl font-bold text-green-600">{stats?.totalVoters?.toLocaleString()}</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="text-sm text-gray-600">Votes Polled</div>
          <div className="text-3xl font-bold text-purple-600">{stats?.totalPolled?.toLocaleString()}</div>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg">
          <div className="text-sm text-gray-600">Voter Turnout</div>
          <div className="text-3xl font-bold text-orange-600">{stats?.turnout}%</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Party Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Party Performance (Booths Won)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.partyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="party" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="booths" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Booth Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.categoryData}
                dataKey="value"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {stats?.categoryData?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Polling Locations Map</h3>
        <MapComponent data={data} />
      </div>
    </div>
  );
}
