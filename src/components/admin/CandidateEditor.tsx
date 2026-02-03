/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { Candidate, CandidateCard } from '@/types/data';
import { ASSEMBLIES } from '@/data/assemblies';
import CandidatePanel from '../CandidatePanel';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function CandidateEditor() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Candidate>>({});
    const [assemblyId, setAssemblyId] = useState('1');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [newCard, setNewCard] = useState<Partial<CandidateCard>>({ title: '', content: '', type: 'info' });

    useEffect(() => {
        fetchCandidates();
    }, [assemblyId]);

    const fetchCandidates = async () => {
        try {
            const q = query(collection(db, 'candidates'), where('assemblyId', '==', assemblyId));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Candidate));
            setCandidates(data);
        } catch (error) {
            console.error("Error fetching candidates:", error);
        }
    };

    const getAssemblyName = (id: string) => {
        return ASSEMBLIES.find(a => a.id === id)?.name || `Assembly ${id}`;
    };

    const handleEdit = (candidate: Candidate) => {
        setEditingId(candidate.id!);
        setFormData({
            ...candidate,
            advantages: candidate.advantages || [],
            opportunities: candidate.opportunities || [],
            threats: candidate.threats || [],
            customCards: candidate.customCards || []
        });
    };

    const handleNew = () => {
        setEditingId('new');
        setFormData({
            assemblyId,
            name: '',
            party: '',
            age: 0,
            education: '',
            experience: '',
            strengths: [],
            weaknesses: [],
            advantages: [],
            opportunities: [],
            threats: [],
            customCards: [],
            constituency: getAssemblyName(assemblyId)
        });
    };

    const saveCandidate = async () => {
        try {
            if (editingId === 'new') {
                await addDoc(collection(db, 'candidates'), formData);
            } else if (editingId) {
                await updateDoc(doc(db, 'candidates', editingId), formData);
            }
            setEditingId(null);
            fetchCandidates();
        } catch (e) {
            alert('Failed to save');
            console.error(e);
        }
    };

    const deleteCandidate = async (id: string) => {
        if (!confirm("Are you sure you want to delete this candidate?")) return;

        try {
            await deleteDoc(doc(db, 'candidates', id));
            setEditingId(null);
            fetchCandidates();
        } catch (e) {
            alert('Failed to delete');
            console.error(e);
        }
    };

    const addCustomCard = () => {
        if (!newCard.title || !newCard.content) return;
        const card: CandidateCard = {
            id: `card_${Date.now()}`,
            title: newCard.title,
            content: newCard.content,
            type: newCard.type || 'info'
        };
        setFormData({
            ...formData,
            customCards: [...(formData.customCards || []), card]
        });
        setNewCard({ title: '', content: '', type: 'info' });
    };

    const removeCustomCard = (cardId: string) => {
        setFormData({
            ...formData,
            customCards: (formData.customCards || []).filter(c => c.id !== cardId)
        });
    };

    // Preview Data
    const previewCandidates = candidates.map(c =>
        c.id === editingId ? { ...c, ...formData } as Candidate : c
    );
    if (editingId === 'new') {
        previewCandidates.push(formData as Candidate);
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Left: Editor List */}
            <div className="w-1/2 p-6 overflow-y-auto border-r bg-white z-10 shadow-xl">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white py-2 border-b z-20">
                    <h2 className="text-xl font-bold">Candidates Editor</h2>
                    <button onClick={handleNew} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
                        <Plus size={16} /> Add Candidate
                    </button>
                </div>

                {/* Assembly Selector */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="block text-sm font-semibold text-blue-800 mb-2">Select Assembly</label>
                    <select
                        value={assemblyId}
                        onChange={(e) => {
                            setAssemblyId(e.target.value);
                            setEditingId(null);
                        }}
                        className="w-full border border-blue-300 p-3 rounded-lg bg-white text-gray-800 font-medium"
                    >
                        {ASSEMBLIES.map(a => (
                            <option key={a.id} value={a.id}>{a.id}. {a.name}</option>
                        ))}
                    </select>
                </div>

                {editingId ? (
                    <div className="p-4 border rounded bg-gray-50 shadow-inner space-y-4">
                        <h3 className="text-lg font-bold">{editingId === 'new' ? 'New Candidate' : 'Edit Candidate'}</h3>

                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <input className="border p-2 rounded" placeholder="Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <select className="border p-2 rounded" value={formData.party || ''} onChange={e => setFormData({ ...formData, party: e.target.value })}>
                                <option value="">Select Party</option>
                                <option value="BJP">BJP</option>
                                <option value="DMK">DMK</option>
                                <option value="AIADMK">AIADMK</option>
                                <option value="INC">INC</option>
                                <option value="PMK">PMK</option>
                                <option value="NRC">NRC</option>
                                <option value="AINRC">AINRC</option>
                                <option value="IND">Independent</option>
                                <option value="Others">Others</option>
                            </select>
                            <input className="border p-2 rounded" type="number" placeholder="Age" value={formData.age || ''} onChange={e => setFormData({ ...formData, age: Number(e.target.value) })} />
                            <input className="border p-2 rounded" placeholder="Education" value={formData.education || ''} onChange={e => setFormData({ ...formData, education: e.target.value })} />
                            <input className="border p-2 rounded" placeholder="Experience" value={formData.experience || ''} onChange={e => setFormData({ ...formData, experience: e.target.value })} />
                            <select
                                className="border p-2 rounded bg-white"
                                value={formData.assemblyId || assemblyId}
                                onChange={e => {
                                    const newAssemblyId = e.target.value;
                                    setFormData({
                                        ...formData,
                                        assemblyId: newAssemblyId,
                                        constituency: getAssemblyName(newAssemblyId)
                                    });
                                }}
                            >
                                {ASSEMBLIES.map(a => (
                                    <option key={a.id} value={a.id}>{a.id}. {a.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Strengths */}
                        <div>
                            <label className="block text-sm font-bold text-green-700 mb-1">Strengths (comma separated)</label>
                            <textarea className="w-full border border-green-300 p-2 rounded" rows={2} value={formData.strengths?.join(', ') || ''} onChange={e => setFormData({ ...formData, strengths: e.target.value.split(',').map(s => s.trim()).filter(s => s) })} />
                        </div>

                        {/* Weaknesses */}
                        <div>
                            <label className="block text-sm font-bold text-red-700 mb-1">Weaknesses/Challenges (comma separated)</label>
                            <textarea className="w-full border border-red-300 p-2 rounded" rows={2} value={formData.weaknesses?.join(', ') || ''} onChange={e => setFormData({ ...formData, weaknesses: e.target.value.split(',').map(s => s.trim()).filter(s => s) })} />
                        </div>

                        {/* Advantages */}
                        <div>
                            <label className="block text-sm font-bold text-blue-700 mb-1">Advantages (comma separated)</label>
                            <textarea className="w-full border border-blue-300 p-2 rounded" rows={2} value={formData.advantages?.join(', ') || ''} onChange={e => setFormData({ ...formData, advantages: e.target.value.split(',').map(s => s.trim()).filter(s => s) })} />
                        </div>

                        {/* Advanced Section Toggle */}
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-between p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                        >
                            <span className="font-semibold">Advanced Fields (Opportunities, Threats, Custom Cards)</span>
                            {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {showAdvanced && (
                            <div className="space-y-4 p-4 bg-gray-100 rounded-lg border">
                                {/* Opportunities */}
                                <div>
                                    <label className="block text-sm font-bold text-purple-700 mb-1">Opportunities (comma separated)</label>
                                    <textarea className="w-full border border-purple-300 p-2 rounded" rows={2} value={formData.opportunities?.join(', ') || ''} onChange={e => setFormData({ ...formData, opportunities: e.target.value.split(',').map(s => s.trim()).filter(s => s) })} />
                                </div>

                                {/* Threats */}
                                <div>
                                    <label className="block text-sm font-bold text-orange-700 mb-1">Threats (comma separated)</label>
                                    <textarea className="w-full border border-orange-300 p-2 rounded" rows={2} value={formData.threats?.join(', ') || ''} onChange={e => setFormData({ ...formData, threats: e.target.value.split(',').map(s => s.trim()).filter(s => s) })} />
                                </div>

                                {/* Custom Cards */}
                                <div className="border-t pt-4">
                                    <h4 className="font-bold flex items-center gap-2 mb-3">
                                        <CreditCard size={18} /> Custom Cards
                                    </h4>

                                    {/* Existing Cards */}
                                    {(formData.customCards || []).length > 0 && (
                                        <div className="space-y-2 mb-4">
                                            {formData.customCards?.map(card => (
                                                <div key={card.id} className={`p-3 rounded-lg border flex justify-between items-start ${card.type === 'highlight' ? 'bg-green-50 border-green-200' :
                                                    card.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                                        'bg-blue-50 border-blue-200'
                                                    }`}>
                                                    <div>
                                                        <div className="font-semibold text-sm">{card.title}</div>
                                                        <div className="text-xs text-gray-600">{card.content}</div>
                                                    </div>
                                                    <button onClick={() => removeCustomCard(card.id!)} className="text-red-500 hover:bg-red-100 p-1 rounded">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add New Card */}
                                    <div className="p-3 bg-white rounded-lg border space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                className="border p-2 rounded text-sm"
                                                placeholder="Card Title"
                                                value={newCard.title || ''}
                                                onChange={e => setNewCard({ ...newCard, title: e.target.value })}
                                            />
                                            <select
                                                className="border p-2 rounded text-sm"
                                                value={newCard.type || 'info'}
                                                onChange={e => setNewCard({ ...newCard, type: e.target.value as CandidateCard['type'] })}
                                            >
                                                <option value="info">Info (Blue)</option>
                                                <option value="highlight">Highlight (Green)</option>
                                                <option value="warning">Warning (Yellow)</option>
                                                <option value="custom">Custom</option>
                                            </select>
                                        </div>
                                        <textarea
                                            className="w-full border p-2 rounded text-sm"
                                            rows={2}
                                            placeholder="Card Content"
                                            value={newCard.content || ''}
                                            onChange={e => setNewCard({ ...newCard, content: e.target.value })}
                                        />
                                        <button
                                            onClick={addCustomCard}
                                            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                        >
                                            <Plus size={14} /> Add Card
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t">
                            <button onClick={saveCandidate} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"><Save size={16} /> Save</button>
                            <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2"><X size={16} /> Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {candidates.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No candidates for {getAssemblyName(assemblyId)}</p>
                                <p className="text-sm text-gray-400 mt-1">Click &quot;Add Candidate&quot; to create one</p>
                            </div>
                        ) : (
                            candidates.map(c => (
                                <div key={c.id} className="border rounded p-4 shadow-sm hover:shadow-md transition-shadow bg-white flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-lg">{c.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded text-white ${c.party === 'BJP' ? 'bg-orange-500' : c.party === 'DMK' ? 'bg-red-500' : c.party === 'AIADMK' ? 'bg-green-600' : c.party === 'INC' ? 'bg-blue-500' : c.party === 'AINRC' ? 'bg-teal-600' : 'bg-gray-500'}`}>{c.party}</span>
                                            <span className="text-xs text-gray-500">{c.constituency || getAssemblyName(c.assemblyId || assemblyId)}</span>
                                            {(c.customCards?.length || 0) > 0 && (
                                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{c.customCards?.length} cards</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(c)} className="text-blue-600 hover:bg-blue-50 p-2 rounded" title="Edit">
                                            <Edit size={20} />
                                        </button>
                                        <button onClick={() => deleteCandidate(c.id!)} className="text-red-600 hover:bg-red-50 p-2 rounded" title="Delete">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Right: Preview */}
            <div className="w-1/2 overflow-y-auto bg-gray-100 p-8">
                <div className="sticky top-0 bg-gray-100 z-10 pb-4 mb-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-600">Live Preview</h2>
                    {editingId && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded animate-pulse">Editing Now...</span>}
                </div>
                <div className="transform scale-90 origin-top">
                    <CandidatePanel selectedAssembly={assemblyId} previewData={previewCandidates} />
                </div>
            </div>
        </div>
    );
}
