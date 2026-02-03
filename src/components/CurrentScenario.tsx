import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, Target, Users, Zap, BarChart3, Flag, MessageCircle } from 'lucide-react';
import { getAssemblyName } from '@/data/assemblies';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';

const ICON_MAP: any = {
  users: <Users className="w-8 h-8" />,
  alert: <AlertCircle className="w-8 h-8" />,
  target: <Target className="w-8 h-8" />,
  trending: <TrendingUp className="w-8 h-8" />,
  zap: <Zap className="w-8 h-8" />,
  bar: <BarChart3 className="w-8 h-8" />,
  flag: <Flag className="w-8 h-8" />,
  message: <MessageCircle className="w-8 h-8" />
};

export default function CurrentScenario({ selectedAssembly, previewData }: { selectedAssembly: string, previewData?: any }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (previewData) {
      setData(previewData);
      return;
    }

    const fetchData = async () => {
      try {
        const docRef = doc(db, 'assemblyMeta', selectedAssembly);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          setData(null);
        }
      } catch (error) {
        console.error('Error fetching scenario data:', error);
      }
    };

    fetchData();
  }, [selectedAssembly, previewData]);

  const scenarios = data?.scenarios || [
    { title: 'Coalition Dynamics', icon: 'users', content: 'BJP-led NDA alliance...', status: 'Active', color: 'blue' },
    { title: 'Key Issues', icon: 'alert', content: 'Unemployment...', status: 'Critical', color: 'red' },
    { title: 'Vote Bank Analysis', icon: 'target', content: 'Urban-rural divide...', status: 'Evolving', color: 'green' },
    { title: 'Campaign Momentum', icon: 'trending', content: 'BJP gaining ground...', status: 'Shifting', color: 'orange' }
  ];

  const groundReports = data?.groundReports || []; // Empty by default


  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">{getAssemblyName(selectedAssembly)} - {data?.headers?.pageTitle || 'Current Political Scenario'}</h2>

      {/* Scenario Cards */}
      <h3 className="text-xl font-semibold mb-2 text-gray-700 hidden">{data?.headers?.scenariosTitle || 'Current Scenarios'}</h3>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {scenarios.map((scenario: any, idx: number) => (
          <div key={idx} className="bg-white rounded-lg shadow-lg p-6 border-l-4 flex flex-col max-h-[500px]" style={{ borderColor: `var(--${scenario.color}-600, #3b82f6)` }}>
            <div className="flex items-start gap-4 flex-shrink-0">
              <div className={`p-3 rounded-lg bg-${scenario.color}-50 text-${scenario.color}-600 flex-shrink-0`}>
                {ICON_MAP[scenario.icon] || <Users className="w-8 h-8" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">{scenario.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${scenario.color}-100 text-${scenario.color}-800 flex-shrink-0`}>
                    {scenario.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 overflow-y-auto flex-1 min-h-0">
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap break-words">{scenario.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ground Reports */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">{data?.headers?.reportsTitle || 'Recent Ground Reports'}</h3>
        <div className="space-y-4">
          {data?.groundReports?.map((report: any, idx: number) => (
            <div key={idx} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-gray-800">{report.locality}</div>
                  <div className="text-xs text-gray-500">{report.date}</div>
                </div>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm">
                  {report.sentiment}
                </span>
              </div>
              <p className="text-sm text-gray-700">{report.observation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Predictions & Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">{data?.headers?.factorsTitle || 'Key Deciding Factors'}</h3>
          <ul className="space-y-3">
            {(data?.decidingFactors || [
              { title: 'Caste Equations', description: 'Traditional caste alliances showing signs of realignment' },
              { title: 'Development vs Welfare', description: 'Voters weighing infrastructure against social schemes' },
              { title: 'Youth Vote', description: 'First-time voters (18-25) could swing 15-20% of result' },
              { title: 'Anti-Incumbency', description: 'Localized anti-incumbency in certain pockets' }
            ]).map((factor: any, idx: number) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                <div>
                  <div className="font-bold text-gray-800">{factor.title}</div>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap break-words">{factor.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">{data?.headers?.outlookTitle || 'Electoral Outlook'}</h3>
          <div className="space-y-4">
            {(data?.electoralOutlook || [
              { party: 'BJP', range: '35-40%', value: 38, color: 'orange' },
              { party: 'DMK', range: '30-35%', value: 33, color: 'red' },
              { party: 'AIADMK', range: '15-20%', value: 18, color: 'green' },
              { party: 'Others', range: '10-15%', value: 12, color: 'gray' }
            ]).map((outlook: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{outlook.party}</span>
                  <span className="text-sm text-gray-600">{outlook.range}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${outlook.color === 'orange' ? 'bg-orange-500' : outlook.color === 'red' ? 'bg-red-500' : outlook.color === 'green' ? 'bg-green-500' : 'bg-gray-500'}`}
                    style={{ width: `${outlook.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Projections based on current trends. Final outcome subject to campaign effectiveness and voter turnout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
