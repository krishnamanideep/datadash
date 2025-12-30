'use client';

import { Users, TrendingUp, MapPin, Award } from 'lucide-react';

interface Candidate {
  name: string;
  party: string;
  image?: string;
  age: number;
  education: string;
  experience: string;
  strengths: string[];
  weaknesses: string[];
  constituency: string;
}

export default function CandidatePanel({ selectedAssembly }: { selectedAssembly: string }) {
  // Sample candidate data - replace with actual data
  const candidates: Candidate[] = [
    {
      name: 'Candidate A',
      party: 'BJP',
      age: 45,
      education: 'MBA, IIM Bangalore',
      experience: '10 years in public service',
      strengths: ['Strong grassroots network', 'Development focus', 'Youth appeal'],
      weaknesses: ['New to electoral politics', 'Limited name recognition'],
      constituency: `Assembly ${selectedAssembly}`,
    },
    {
      name: 'Candidate B',
      party: 'DMK',
      age: 52,
      education: 'MA Political Science',
      experience: '15 years in party organization',
      strengths: ['Incumbent advantage', 'Welfare schemes', 'Local connections'],
      weaknesses: ['Anti-incumbency factors', 'Age perception'],
      constituency: `Assembly ${selectedAssembly}`,
    },
    {
      name: 'Candidate C',
      party: 'AIADMK',
      age: 48,
      education: 'B.Tech, Engineering',
      experience: '8 years MLA',
      strengths: ['Administrative experience', 'Infrastructure projects'],
      weaknesses: ['Party fragmentation', 'Leadership issues'],
      constituency: `Assembly ${selectedAssembly}`,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Assembly {selectedAssembly} - Candidate Panel</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {candidates.map((candidate, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className={`p-6 ${
              candidate.party === 'BJP' ? 'bg-orange-500' :
              candidate.party === 'DMK' ? 'bg-red-500' :
              'bg-green-500'
            } text-white`}>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                  <Users size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{candidate.name}</h3>
                  <p className="text-lg opacity-90">{candidate.party}</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin size={20} className="text-gray-400" />
                <span>{candidate.constituency}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Age</div>
                  <div className="font-semibold text-gray-800">{candidate.age} years</div>
                </div>
                <div>
                  <div className="text-gray-500">Experience</div>
                  <div className="font-semibold text-gray-800">{candidate.experience.split(' ')[0]} years</div>
                </div>
              </div>

              <div>
                <div className="text-gray-500 text-sm mb-1">Education</div>
                <div className="font-medium text-gray-800">{candidate.education}</div>
              </div>

              {/* Strengths */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} className="text-green-600" />
                  <span className="font-semibold text-gray-800">Strengths</span>
                </div>
                <ul className="space-y-1">
                  {candidate.strengths.map((strength, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award size={18} className="text-orange-600" />
                  <span className="font-semibold text-gray-800">Challenges</span>
                </div>
                <ul className="space-y-1">
                  {candidate.weaknesses.map((weakness, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-orange-600">!</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                View Detailed Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparative Analysis */}
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h3 className="text-xl font-semibold mb-4">Comparative Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                {candidates.map((c, idx) => (
                  <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 font-medium">Party</td>
                {candidates.map((c, idx) => (
                  <td key={idx} className="px-6 py-4">{c.party}</td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Age</td>
                {candidates.map((c, idx) => (
                  <td key={idx} className="px-6 py-4">{c.age}</td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Experience</td>
                {candidates.map((c, idx) => (
                  <td key={idx} className="px-6 py-4">{c.experience}</td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Key Strength</td>
                {candidates.map((c, idx) => (
                  <td key={idx} className="px-6 py-4 text-green-600">{c.strengths[0]}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
