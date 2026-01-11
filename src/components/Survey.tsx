'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#FF6B35', '#E63946', '#06A77D', '#FFC300', '#0077B6'];

export default function Survey({ selectedAssembly }: { selectedAssembly: string }) {
  const [surveyData, setSurveyData] = useState<{
    totalRespondents: number;
    sampleDate: string;
    votingIntention: { party: string; percentage: number; votes: number }[];
    issuesPriority: { issue: string; score: number }[];
    leaderApproval: { leader: string; approval: number; disapproval: number; neutral: number }[];
    demographicBreakdown: {
      age: { group: string; BJP: number; DMK: number; AIADMK: number; Others: number }[];
      gender: { category: string; BJP: number; DMK: number; AIADMK: number; Others: number }[];
    };
  } | null>(null);

  useEffect(() => {
    // Simulate survey data - replace with actual survey API call
    const mockSurveyData = {
      totalRespondents: 1500,
      sampleDate: '2025-12-28',
      votingIntention: [
        { party: 'BJP', percentage: 38, votes: 570 },
        { party: 'DMK', percentage: 32, votes: 480 },
        { party: 'AIADMK', percentage: 18, votes: 270 },
        { party: 'Others', percentage: 8, votes: 120 },
        { party: 'Undecided', percentage: 4, votes: 60 },
      ],
      issuesPriority: [
        { issue: 'Employment', score: 85 },
        { issue: 'Infrastructure', score: 72 },
        { issue: 'Education', score: 68 },
        { issue: 'Healthcare', score: 65 },
        { issue: 'Water Supply', score: 58 },
      ],
      leaderApproval: [
        { leader: 'Leader A (BJP)', approval: 62, disapproval: 28, neutral: 10 },
        { leader: 'Leader B (DMK)', approval: 58, disapproval: 32, neutral: 10 },
        { leader: 'Leader C (AIADMK)', approval: 45, disapproval: 40, neutral: 15 },
      ],
      demographicBreakdown: {
        age: [
          { group: '18-25', BJP: 42, DMK: 28, AIADMK: 15, Others: 15 },
          { group: '26-40', BJP: 40, DMK: 32, AIADMK: 18, Others: 10 },
          { group: '41-60', BJP: 35, DMK: 35, AIADMK: 20, Others: 10 },
          { group: '60+', BJP: 30, DMK: 38, AIADMK: 22, Others: 10 },
        ],
        gender: [
          { category: 'Male', BJP: 40, DMK: 30, AIADMK: 18, Others: 12 },
          { category: 'Female', BJP: 36, DMK: 34, AIADMK: 18, Others: 12 },
        ],
      },
    };
    setSurveyData(mockSurveyData);
  }, [selectedAssembly]);

  if (!surveyData) {
    return <div className="p-8 text-center">Loading survey data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Assembly {selectedAssembly} - Survey Analysis</h2>
        <div className="text-right">
          <div className="text-sm text-gray-500">Sample Size</div>
          <div className="text-2xl font-bold text-blue-600">{surveyData.totalRespondents}</div>
          <div className="text-xs text-gray-500">as of {surveyData.sampleDate}</div>
        </div>
      </div>

      {/* Voting Intention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Voting Intention</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={surveyData.votingIntention}
                dataKey="percentage"
                nameKey="party"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                {surveyData.votingIntention.map((entry: { party: string; percentage: number }, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Vote Share Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={surveyData.votingIntention}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="party" />
              <YAxis label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="percentage" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Issues */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Top Issues for Voters</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={surveyData.issuesPriority} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="issue" type="category" width={120} />
            <Tooltip />
            <Bar dataKey="score" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leader Approval */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Leader Approval Ratings</h3>
        <div className="space-y-6">
          {surveyData.leaderApproval.map((leader: { leader: string; approval: number }, idx: number) => (
            <div key={idx}>
              <div className="mb-2 font-medium text-gray-700">{leader.leader}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden flex">
                  <div
                    className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${(leader as any).approval}%` }}
                  >
                    {(leader as any).approval}% Approve
                  </div>
                  <div
                    className="bg-gray-400 flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${(leader as any).neutral}%` }}
                  >
                    {(leader as any).neutral > 8 && `${(leader as any).neutral}%`}
                  </div>
                  <div
                    className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${(leader as any).disapproval}%` }}
                  >
                    {(leader as any).disapproval}% Disapprove
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demographic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Age-wise Voting Pattern</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={surveyData.demographicBreakdown.age}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="BJP" fill="#FF6B35" />
              <Bar dataKey="DMK" fill="#E63946" />
              <Bar dataKey="AIADMK" fill="#06A77D" />
              <Bar dataKey="Others" fill="#94A3B8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Gender-wise Voting Pattern</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={surveyData.demographicBreakdown.gender}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="BJP" fill="#FF6B35" />
              <Bar dataKey="DMK" fill="#E63946" />
              <Bar dataKey="AIADMK" fill="#06A77D" />
              <Bar dataKey="Others" fill="#94A3B8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Findings */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold mb-4 text-blue-900">Key Survey Findings</h3>
        <ul className="space-y-2 text-gray-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>BJP leads with 38% vote intention, followed by DMK at 32%</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Employment emerges as the top priority issue (85% importance)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Youth voters (18-25) show stronger preference for BJP (42%)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Gender gap is minimal, with women voters slightly favoring DMK</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>4% voters remain undecided - could be decisive in close contest</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
