/* eslint-disable */
'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import {
  Star, Zap, Award, Info, TrendingUp, FileText, Map as MapIcon, Users, Target, AlertTriangle
} from 'lucide-react';
import { PollingStation } from '@/types/data';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { processLocalPollingData } from '@/utils/dataProcessing';

const CARD_ICONS: Record<string, any> = {
  star: Star,
  zap: Zap,
  award: Award,
  info: Info,
  trending: TrendingUp,
  file: FileText,
  map: MapIcon,
  users: Users,
  target: Target,
  alert: AlertTriangle
};

interface CustomCard {
  id?: string;
  assemblyId: string;
  heading: string;
  content: string;
  cardType: 'text' | 'note' | 'info';
  icon?: string;
  order: number;
}

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">Loading map...</div>
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

import { useWidgetConfig, WidgetConfigProvider } from '@/components/admin/WidgetConfigContext';

// Election years available
const ELECTION_YEARS = ['2021', '2016', '2011'];

// MLA interface matching the database
interface MLA {
  id?: string;
  assemblyId: string;
  year: string;
  name: string;
  party: string;
  voteShare?: number;
  votes?: number;
  margin?: number;
  image?: string;
}

// Wrap the main export
export default function AssemblyOverviewWrapper(props: { selectedAssembly: string }) {
  return (
    <WidgetConfigProvider>
      <AssemblyOverview {...props} />
    </WidgetConfigProvider>
  );
}

function AssemblyOverview({ selectedAssembly }: { selectedAssembly: string }) {
  const { config } = useWidgetConfig();
  const [data, setData] = useState<PollingStation[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('2021');
  const [mlas, setMlas] = useState<MLA[]>([]);
  const [stats, setStats] = useState<{
    totalBooths: number;
    totalVoters: number;
    totalPolled: number;
    turnout: string;
    partyData: { party: string; rawVotes: number; percentage: string; share: number }[];
    categoryData: { category: string; value: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [customCards, setCustomCards] = useState<CustomCard[]>([]);
  const [partyConfig, setPartyConfig] = useState<{ selectedParties: string[] } | null>(null);

  // Get current MLA for selected year
  const currentMLA = mlas.find(m => m.year === selectedYear);

  // Helper to get election data for selected year
  const getElectionData = (booth: PollingStation, year: string) => {
    switch (year) {
      case '2021': return booth.election2021;
      case '2016': return booth.election2016;
      case '2011': return booth.election2011;
      default: return booth.election2021;
    }
  };

  const calculateStats = (booths: PollingStation[], year: string) => {
    // 1. Calculate Total Polled for selected year
    const totalPolled = booths.reduce((sum, b) => {
      const election = getElectionData(b, year);
      return sum + (election?.total_votes || 0);
    }, 0);

    // 2. Estimate Total Voters (Turnout ~83%)
    const totalVoters = Math.round(totalPolled * 1.25);
    const turnout = totalVoters > 0 ? (totalPolled / totalVoters) * 100 : 0;

    // 3. Calculate Assembly-Wide Vote Share for selected year
    const partyVotesRaw: { [key: string]: number } = {};
    booths.forEach((booth) => {
      const election = getElectionData(booth, year);
      if (election?.candidates && election.total_votes) {
        Object.entries(election.candidates).forEach(([party, share]) => {
          const votes = election.total_votes! * share;
          partyVotesRaw[party] = (partyVotesRaw[party] || 0) + votes;
        });
      }
    });

    let partyData = Object.entries(partyVotesRaw)
      .map(([party, rawVotes]) => ({
        party,
        rawVotes: Math.round(rawVotes),
        percentage: ((rawVotes / totalPolled) * 100).toFixed(1),
        share: parseFloat(((rawVotes / totalPolled) * 100).toFixed(1))
      }))
      .sort((a, b) => b.share - a.share);

    // Filter based on party configuration or default to top 5 (excluding VOTERS)
    if (partyConfig?.selectedParties && partyConfig.selectedParties.length > 0) {
      partyData = partyData.filter(p => partyConfig.selectedParties.includes(p.party));
    } else {
      // Default: top 5 parties, excluding VOTERS
      partyData = partyData.filter(p => p.party !== 'VOTERS').slice(0, 5);
    }

    // 4. Category Distribution
    const categoryDist = booths.reduce((acc: { [key: string]: number }, b) => {
      const cat = b.category || 'Unknown';
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
      turnout: turnout.toFixed(1),
      partyData,
      categoryData,
    });
  };

  // Recalculate when year changes
  useEffect(() => {
    if (data.length > 0) {
      calculateStats(data, selectedYear);
    }
  }, [selectedYear, data]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // 1. Polling Stations (Local)
        const pollingStations = processLocalPollingData(null); // Fetch all to filter later? Or fetch specific?
        // Logic below filters: const assemblyData = pollingStations.filter(...)
        // Let's pass null to get all, OR better, pass selectedAssembly if util supports it properly.
        // Util supports filtering! Let's just fetch for this assembly.
        const assemblyData = processLocalPollingData(selectedAssembly);
        console.log('Loaded data for assembly', selectedAssembly, 'booths:', assemblyData.length);
        setData(assemblyData);
        calculateStats(assemblyData, selectedYear);

        // 2. Fetch MLAs
        let mlasData: any[] = [];
        try {
          const q = query(collection(db, 'mlas'), where('assemblyId', '==', selectedAssembly));
          const snap = await getDocs(q);
          mlasData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
          console.warn('Error fetching MLAs', e);
        }
        setMlas(mlasData);

        // 3. Assembly Meta
        let metaData: any = {};
        try {
          const metaRef = doc(db, 'assemblyMeta', selectedAssembly);
          const metaSnap = await getDoc(metaRef);
          if (metaSnap.exists()) metaData = metaSnap.data();
        } catch (e) { console.warn('Meta fetch error', e); }

        // Process map URL
        if (metaData?.assemblyMapUrl) {
          setMapUrl(metaData.assemblyMapUrl);
        } else {
          setMapUrl(null);
        }

        // 4. Custom Cards
        let cardsData: any[] = [];
        try {
          // Previous API: /api/customCards?assemblyId=...&section=overview
          const q = query(collection(db, 'customCards'), where('assemblyId', '==', selectedAssembly), where('section', '==', 'overview'));
          const snap = await getDocs(q);
          cardsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) { console.warn('Cards fetch error', e); }

        const sortedCards = Array.isArray(cardsData) ? [...cardsData].sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) : [];
        setCustomCards(sortedCards);

        // 5. Load Party Configuration
        let configData: any = {};
        try {
          const configRef = doc(db, 'pageConfig', `assemblyOverview_${selectedAssembly}`);
          const configSnap = await getDoc(configRef);
          if (configSnap.exists()) configData = configSnap.data();
        } catch (e) { console.warn('Config fetch error', e); }

        if (configData?.selectedParties) {
          setPartyConfig({ selectedParties: configData.selectedParties });
        } else {
          setPartyConfig(null); // Use default behavior
        }

        setLoading(false);

      } catch (err: any) {
        console.error('Error loading data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedAssembly]);

  // Helper for party colors
  const getPartyColor = (party: string) => {
    switch (party) {
      case 'BJP': return 'from-orange-500 to-orange-600';
      case 'DMK': return 'from-red-600 to-red-700';
      case 'AIADMK': return 'from-green-600 to-green-700';
      case 'INC': return 'from-blue-500 to-blue-600';
      default: return 'from-blue-600 to-blue-700';
    }
  };

  if (loading) {
    return <div className="p-8 text-center bg-white rounded shadow">Loading assembly data...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600 bg-white rounded shadow">Error loading data: {error}</div>;
  }


  return (
    <div className="p-6 space-y-6">
      {/* Header with Year Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Assembly {selectedAssembly} - Overview</h2>

        {/* Election Year Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Election Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
          >
            {ELECTION_YEARS.map(year => (
              <option key={year} value={year}>{year} Election</option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Statistics */}
      {config.showVoterTurnout && (
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
      )}

      {/* MLA / Winner Section */}
      {currentMLA ? (
        <div className={`bg-gradient-to-r ${getPartyColor(currentMLA.party)} p-6 rounded-lg shadow-lg text-white`}>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
              {currentMLA.image ? (
                <img src={currentMLA.image} alt={currentMLA.name} className="w-full h-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm opacity-80 uppercase tracking-wide">
                {selectedYear === '2021' ? 'Current MLA' : 'Winner'} ({selectedYear} Election)
              </div>
              <div className="text-2xl font-bold">{currentMLA.name}</div>
              <div className="text-lg opacity-90">
                {currentMLA.party}
                {currentMLA.voteShare && ` • ${currentMLA.voteShare}% Vote Share`}
                {currentMLA.votes && ` • ${currentMLA.votes.toLocaleString()} Votes`}
              </div>
              {currentMLA.margin && (
                <div className="text-sm opacity-80 mt-1">
                  Victory Margin: {currentMLA.margin.toLocaleString()} votes
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">#{1}</div>
              <div className="text-sm opacity-80">Winner</div>
            </div>
          </div>
        </div>
      ) : stats?.partyData && stats.partyData.length > 0 ? (
        // Fallback to calculated data if no MLA record exists
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm opacity-80 uppercase tracking-wide">
                Leading Party ({selectedYear} - No MLA Data)
              </div>
              <div className="text-2xl font-bold">{stats.partyData[0].party}</div>
              <div className="text-lg opacity-90">
                {stats.partyData[0].percentage}% Vote Share • {stats.partyData[0].rawVotes.toLocaleString()} Votes
              </div>
              <div className="text-xs opacity-60 mt-1">
                ⚠️ Add MLA data in Admin Dashboard for accurate display
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">#{1}</div>
              <div className="text-sm opacity-80">Rank</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Party Performance */}
        {config.showPartyPerformance && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Party Vote Share (%) - {selectedYear}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.partyData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" unit="%" />
                <YAxis type="category" dataKey="party" width={60} />
                <Tooltip
                  formatter={(value: any, name: any, props: any) => [`${value}% (${props.payload.rawVotes.toLocaleString()} votes)`, 'Vote Share']}
                />
                <Legend />
                <Bar dataKey="share" name="Vote Share %" fill="#0088FE">
                  {stats?.partyData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>


      {/* Map Section */}
      {config.showPollingStationMap && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Polling Locations (Interactive)</h3>
            <MapComponent data={data} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Constituency Map (Reference)</h3>
            <div className="border rounded-lg overflow-hidden h-96 flex items-center justify-center bg-gray-50">
              <div className="flex flex-col gap-4 w-full h-full p-2 overflow-auto">
                <img
                  src={mapUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Puducherry_Electoral_Constituencies_Map.svg/1024px-Puducherry_Electoral_Constituencies_Map.svg.png"}
                  alt="Constituency Map"
                  className="w-full object-contain border rounded"
                  title={mapUrl ? "Uploaded Assembly Map" : "State Wide Reference Map"}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x600?text=Map+Not+Found";
                  }}
                />
                <div className="text-center text-sm text-gray-500 italic">
                  Map of Assembly {selectedAssembly} {mapUrl ? '(Custom)' : '(Reference)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Cards Section */}
      {customCards.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Key Insights & Information</h3>
          <div className="space-y-6">
            {customCards.map((card) => (
              <div
                key={card.id}
                className={`p-8 rounded-2xl border-2 transition-all hover:shadow-lg ${card.cardType === 'note' ? 'bg-yellow-50 border-yellow-100 shadow-yellow-100/30' :
                  card.cardType === 'info' ? 'bg-blue-50 border-blue-100 shadow-blue-100/30' :
                    'bg-white border-gray-100 shadow-gray-100/30'
                  }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  {card.icon && CARD_ICONS[card.icon] && (
                    <div className={`p-4 rounded-xl ${card.cardType === 'note' ? 'bg-yellow-100 text-yellow-700' :
                      card.cardType === 'info' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                      {(() => {
                        const Icon = CARD_ICONS[card.icon];
                        return <Icon size={28} strokeWidth={2.5} />;
                      })()}
                    </div>
                  )}
                  <h4 className="font-extrabold text-gray-900 text-2xl tracking-tight leading-tight">{card.heading}</h4>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap break-words pl-1" dangerouslySetInnerHTML={{ __html: card.content }} />
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
}
