import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Star, Zap, Award, Info, TrendingUp, FileText } from 'lucide-react';

const COLORS = ['#FF6B35', '#E63946', '#06A77D', '#FFC300', '#0077B6'];

export default function Survey({ selectedAssembly, previewData }: { selectedAssembly: string, previewData?: any }) {
  const [surveyData, setSurveyData] = useState<any>(null);

  useEffect(() => {
    if (previewData) {
      setSurveyData(previewData);
      return;
    }

    fetch(`/api/surveyData?assemblyId=${selectedAssembly}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setSurveyData(data);
        }
      })
      .catch(err => console.error("Failed to load survey data", err));
  }, [selectedAssembly, previewData]);

  const getCardIcon = (iconName: string) => {
    switch (iconName) {
      case 'star': return <Star size={20} />;
      case 'zap': return <Zap size={20} />;
      case 'award': return <Award size={20} />;
      case 'info': return <Info size={20} />;
      case 'trend': return <TrendingUp size={20} />;
      case 'file': return <FileText size={20} />;
      default: return <Star size={20} />;
    }
  };

  const getCardColorClass = (colorName: string) => {
    switch (colorName) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'purple': return 'bg-purple-500';
      case 'orange': return 'bg-orange-500';
      case 'red': return 'bg-red-500';
      case 'indigo': return 'bg-indigo-500';
      default: return 'bg-blue-500';
    }
  };

  if (!surveyData) {
    return <div className="p-8 text-center">Loading survey data...</div>;
  }

  const {
    showVotingIntention = true,
    showIssues = true,
    showLeaderApproval = true,
    showDemographics = true,
    showKeyFindings = true,
    customCards = []
  } = surveyData;

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
      {showVotingIntention && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Voting Intention</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={surveyData.votingIntention || []}
                  dataKey="percentage"
                  nameKey="party"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                >
                  {surveyData.votingIntention?.map((entry: any, index: number) => (
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
              <BarChart data={surveyData.votingIntention || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="party" />
                <YAxis label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="percentage" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Key Issues */}
      {showIssues && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Top Issues for Voters</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={surveyData.issuesPriority || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="issue" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="score" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Leader Approval */}
      {showLeaderApproval && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Leader Approval Ratings</h3>
          <div className="space-y-6">
            {surveyData.leaderApproval?.map((leader: any, idx: number) => (
              <div key={idx}>
                <div className="mb-2 font-medium text-gray-700">{leader.leader}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden flex">
                    <div
                      className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${leader.approval}%` }}
                    >
                      {leader.approval}% Approve
                    </div>
                    <div
                      className="bg-gray-400 flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${leader.neutral}%` }}
                    >
                      {leader.neutral > 8 && `${leader.neutral}%`}
                    </div>
                    <div
                      className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${leader.disapproval}%` }}
                    >
                      {leader.disapproval}% Disapprove
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demographic Breakdown */}
      {showDemographics && surveyData.demographicBreakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Age-wise Voting Pattern</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={surveyData.demographicBreakdown?.age || []}>
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
              <BarChart data={surveyData.demographicBreakdown?.gender || []}>
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
      )}

      {/* Key Findings */}
      {showKeyFindings && (
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
      )}

      {/* Custom Cards */}
      {customCards && customCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customCards.map((card: any, index: number) => (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
              <div className={`p-3 ${getCardColorClass(card.color)} text-white flex items-center gap-2`}>
                {getCardIcon(card.icon)}
                <span className="font-semibold">{card.title}</span>
              </div>
              <div className="p-4 text-gray-700 whitespace-pre-wrap">{card.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

