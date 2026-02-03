'use client';

import { Users, TrendingUp, MapPin, Award, Shield, Target, AlertTriangle, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Candidate } from '@/types/data';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ASSEMBLIES } from '@/data/assemblies';

export default function CandidatePanel({ selectedAssembly, previewData }: { selectedAssembly: string, previewData?: Candidate[] }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);

  const getAssemblyName = (id: string) => {
    return ASSEMBLIES.find(a => a.id === id)?.name || `Assembly ${id}`;
  };

  useEffect(() => {
    if (previewData) {
      setCandidates(previewData);
      setLoading(false);
      return;
    }
    setLoading(true);

    const fetchCandidates = async () => {
      try {
        const q = query(collection(db, 'candidates'), where('assemblyId', '==', selectedAssembly));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Candidate));
        setCandidates(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching candidates from Firestore:", err);
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [selectedAssembly, previewData]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading candidates...</div>;
  if (!candidates.length) return <div className="p-8 text-center text-gray-500">No candidate profile data available for this assembly.</div>;

  const getPartyColor = (party: string) => {
    switch (party) {
      case 'BJP': return 'bg-orange-500';
      case 'DMK': return 'bg-red-500';
      case 'AIADMK': return 'bg-green-600';
      case 'INC': return 'bg-blue-600';
      case 'AINRC': case 'NRC': return 'bg-teal-600';
      case 'PMK': return 'bg-amber-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">{getAssemblyName(selectedAssembly)} - Candidate Panel</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {candidates.map((candidate, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100">
            {/* Header */}
            <div className={`p-6 ${getPartyColor(candidate.party)} text-white`}>
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
                <span>{candidate.constituency?.startsWith('Assembly') ? getAssemblyName(candidate.assemblyId || selectedAssembly) : (candidate.constituency || getAssemblyName(candidate.assemblyId || selectedAssembly))}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-500 text-xs uppercase tracking-wide">Caste</div>
                  <div className="font-bold text-gray-800 text-lg">{candidate.caste || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-500 text-xs uppercase tracking-wide">Designation</div>
                  <div className="font-bold text-gray-800 text-lg">{candidate.designation || 'N/A'}</div>
                </div>
              </div>

              {/* Show detailed info only if expanded */}
              {expandedCandidateId === (candidate.id || '') && (
                <>
                  {/* Strengths */}
                  {candidate.strengths?.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={18} className="text-green-600" />
                        <span className="font-semibold text-green-800">Strengths</span>
                      </div>
                      <ul className="space-y-1">
                        {candidate.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                            <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                            <span dangerouslySetInnerHTML={{ __html: strength }} className="break-words" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {candidate.weaknesses?.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Award size={18} className="text-red-600" />
                        <span className="font-semibold text-red-800">Challenges</span>
                      </div>
                      <ul className="space-y-1">
                        {candidate.weaknesses.map((weakness, i) => (
                          <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                            <span className="text-red-600 font-bold flex-shrink-0">!</span>
                            <span dangerouslySetInnerHTML={{ __html: weakness }} className="break-words" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Advantages */}
                  {candidate.advantages?.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield size={18} className="text-blue-600" />
                        <span className="font-semibold text-blue-800">Advantages</span>
                      </div>
                      <ul className="space-y-1">
                        {candidate.advantages.map((advantage, i) => (
                          <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                            <span className="text-blue-600 font-bold flex-shrink-0">★</span>
                            <span dangerouslySetInnerHTML={{ __html: advantage }} className="break-words" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Opportunities */}
                  {candidate.opportunities?.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={18} className="text-purple-600" />
                        <span className="font-semibold text-purple-800">Opportunities</span>
                      </div>
                      <ul className="space-y-1">
                        {candidate.opportunities.map((opportunity, i) => (
                          <li key={i} className="text-sm text-purple-700 flex items-start gap-2">
                            <span className="text-purple-600 font-bold flex-shrink-0">→</span>
                            <span dangerouslySetInnerHTML={{ __html: opportunity }} className="break-words" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Threats */}
                  {candidate.threats?.length > 0 && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={18} className="text-orange-600" />
                        <span className="font-semibold text-orange-800">Threats</span>
                      </div>
                      <ul className="space-y-1">
                        {candidate.threats.map((threat, i) => (
                          <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                            <span className="text-orange-600 font-bold flex-shrink-0">⚠</span>
                            <span dangerouslySetInnerHTML={{ __html: threat }} className="break-words" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Custom Cards */}
                  {candidate.customCards?.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard size={18} className="text-indigo-600" />
                        <span className="font-semibold text-indigo-800">Additional Information</span>
                      </div>
                      {candidate.customCards.map((card, i) => (
                        <div key={i} className={`p-4 rounded-lg border ${card.type === 'highlight' ? 'bg-emerald-50 border-emerald-200' :
                          card.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                            'bg-indigo-50 border-indigo-200'
                          }`}>
                          <div className={`font-semibold text-sm ${card.type === 'highlight' ? 'text-emerald-800' :
                            card.type === 'warning' ? 'text-amber-800' :
                              'text-indigo-800'
                            }`}>{card.title}</div>
                          <div className={`text-sm mt-1 ${card.type === 'highlight' ? 'text-emerald-700' :
                            card.type === 'warning' ? 'text-amber-700' :
                              'text-indigo-700'
                            }`}>{card.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t">
              <button
                onClick={() => setExpandedCandidateId(expandedCandidateId === (candidate.id || '') ? null : (candidate.id || ''))}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                {expandedCandidateId === (candidate.id || '') ? 'Hide Details' : 'View Detailed Profile'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparative Analysis */}
      {candidates.length > 1 && (
        <div className="bg-white p-6 rounded-xl shadow-lg mt-6 border border-gray-100">
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
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">Party</td>
                  {candidates.map((c, idx) => (
                    <td key={idx} className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-white text-xs ${getPartyColor(c.party)}`}>{c.party}</span>
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">Caste</td>
                  {candidates.map((c, idx) => (
                    <td key={idx} className="px-6 py-4">{c.caste || 'N/A'}</td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">Designation</td>
                  {candidates.map((c, idx) => (
                    <td key={idx} className="px-6 py-4">{c.designation || 'N/A'}</td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">Key Strength</td>
                  {candidates.map((c, idx) => (
                    <td key={idx} className="px-6 py-4 text-green-600">{c.strengths?.[0] || '-'}</td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">Key Advantage</td>
                  {candidates.map((c, idx) => (
                    <td key={idx} className="px-6 py-4 text-blue-600">{c.advantages?.[0] || '-'}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
