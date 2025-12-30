'use client';

import { TrendingUp, AlertCircle, Target, Users } from 'lucide-react';

export default function CurrentScenario({ selectedAssembly }: { selectedAssembly: string }) {
  const scenarios = [
    {
      title: 'Coalition Dynamics',
      icon: <Users className="w-8 h-8 text-blue-600" />,
      content: 'BJP-led NDA alliance is focusing on development narrative and welfare schemes. DMK-led alliance emphasizing social justice and anti-incumbency factors.',
      status: 'Active',
      color: 'blue',
    },
    {
      title: 'Key Issues',
      icon: <AlertCircle className="w-8 h-8 text-orange-600" />,
      content: 'Unemployment, infrastructure development, water scarcity, and educational facilities are dominating the electoral discourse.',
      status: 'Critical',
      color: 'orange',
    },
    {
      title: 'Vote Bank Analysis',
      icon: <Target className="w-8 h-8 text-green-600" />,
      content: 'Urban-rural divide evident. Youth voters (35% of electorate) showing preference for development agenda. Traditional caste equations showing signs of change.',
      status: 'Evolving',
      color: 'green',
    },
    {
      title: 'Campaign Momentum',
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      content: 'BJP gaining ground in urban pockets. DMK maintaining rural stronghold. AIADMK facing organizational challenges.',
      status: 'Shifting',
      color: 'purple',
    },
  ];

  const groundReports = [
    {
      date: '2025-12-20',
      locality: 'Manalipet Region',
      observation: 'Strong BJP presence observed. Youth rallies gaining traction. Development works being highlighted.',
      sentiment: 'Positive for BJP',
    },
    {
      date: '2025-12-22',
      locality: 'Chettipet Area',
      observation: 'DMK organizing corner meetings. Focus on social welfare schemes. Good reception among traditional supporters.',
      sentiment: 'Positive for DMK',
    },
    {
      date: '2025-12-25',
      locality: 'Central Localities',
      observation: 'Voters concerned about infrastructure and employment. Mixed reactions to all parties. Undecided voters significant.',
      sentiment: 'Neutral/Swing',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Assembly {selectedAssembly} - Current Political Scenario</h2>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-lg p-6 border-l-4" style={{ borderColor: `var(--${scenario.color}-600, #3b82f6)` }}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                {scenario.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{scenario.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${scenario.color}-100 text-${scenario.color}-800`}>
                    {scenario.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{scenario.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ground Reports */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Ground Reports</h3>
        <div className="space-y-4">
          {groundReports.map((report, idx) => (
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
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Key Deciding Factors</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
              <div>
                <div className="font-medium text-gray-800">Caste Equations</div>
                <div className="text-sm text-gray-600">Traditional caste alliances showing signs of realignment</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
              <div>
                <div className="font-medium text-gray-800">Development vs Welfare</div>
                <div className="text-sm text-gray-600">Voters weighing infrastructure against social schemes</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
              <div>
                <div className="font-medium text-gray-800">Youth Vote</div>
                <div className="text-sm text-gray-600">First-time voters (18-25) could swing 15-20% of result</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
              <div>
                <div className="font-medium text-gray-800">Anti-Incumbency</div>
                <div className="text-sm text-gray-600">Localized anti-incumbency in certain pockets</div>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Electoral Outlook</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">BJP</span>
                <span className="text-sm text-gray-600">35-40%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-orange-500 h-3 rounded-full" style={{ width: '38%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">DMK</span>
                <span className="text-sm text-gray-600">30-35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full" style={{ width: '33%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">AIADMK</span>
                <span className="text-sm text-gray-600">15-20%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Others</span>
                <span className="text-sm text-gray-600">10-15%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gray-500 h-3 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
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
