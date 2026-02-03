import { useState, useEffect, useCallback } from 'react';
import { Save, Plus, Trash2, Settings, Edit2, Star, Zap, Award, Info, TrendingUp, FileText, Map, Users, Target, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import CurrentScenario from '../CurrentScenario';
import PoliticalHistory from '../PoliticalHistory';
import AssemblyOverview from '../AssemblyOverview';
import { ASSEMBLIES } from '@/data/assemblies';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';

const CARD_ICONS = [
    { id: 'star', icon: Star, label: 'Star' },
    { id: 'zap', icon: Zap, label: 'Zap' },
    { id: 'award', icon: Award, label: 'Award' },
    { id: 'info', icon: Info, label: 'Info' },
    { id: 'trending', icon: TrendingUp, label: 'Trend' },
    { id: 'file', icon: FileText, label: 'File' },
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'target', icon: Target, label: 'Target' },
    { id: 'alert', icon: AlertTriangle, label: 'Alert' },
];

export default function AssemblyMetaEditor() {
    const [assemblyId, setAssemblyId] = useState('1');
    const [activeTab, setActiveTab] = useState<'scenario' | 'history' | 'cards'>('scenario');
    const [loading, setLoading] = useState(false);
    const [customCards, setCustomCards] = useState<any[]>([]);
    const [editingCard, setEditingCard] = useState<any | null>(null);
    const [savingCard, setSavingCard] = useState(false);
    const [previewKey, setPreviewKey] = useState(0);
    const [data, setData] = useState<any>({
        headers: {
            pageTitle: 'Current Political Scenario',
            scenariosTitle: 'Current Scenarios',
            reportsTitle: 'Recent Ground Reports',
            factorsTitle: 'Key Deciding Factors',
            outlookTitle: 'Electoral Outlook'
        },
        scenarios: [],
        groundReports: [],
        decidingFactors: [],
        electoralOutlook: [],
        historyNarrative: ''
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetchData();
        fetchCards();
    }, [assemblyId]);

    const refreshPreview = useCallback(() => {
        setPreviewKey(prev => prev + 1);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'assemblyMeta', assemblyId);
            const docSnap = await getDoc(docRef);
            const fetched = docSnap.exists() ? docSnap.data() : null;

            if (fetched && Object.keys(fetched).length > 0) {
                // Ensure headers exist
                if (!fetched.headers) {
                    fetched.headers = {
                        pageTitle: 'Current Political Scenario',
                        scenariosTitle: 'Current Scenarios',
                        reportsTitle: 'Recent Ground Reports',
                        factorsTitle: 'Key Deciding Factors',
                        outlookTitle: 'Electoral Outlook'
                    };
                }
                setData(fetched);
            } else {
                // Defaults
                setData({
                    headers: {
                        pageTitle: 'Current Political Scenario',
                        scenariosTitle: 'Current Scenarios',
                        reportsTitle: 'Recent Ground Reports',
                        factorsTitle: 'Key Deciding Factors',
                        outlookTitle: 'Electoral Outlook'
                    },
                    scenarios: [
                        { title: 'Coalition Dynamics', icon: 'users', content: '', status: 'Active', color: 'blue' },
                        { title: 'Key Issues', icon: 'alert', content: '', status: 'Critical', color: 'red' },
                        { title: 'Vote Bank Analysis', icon: 'target', content: '', status: 'Evolving', color: 'green' },
                        { title: 'Campaign Momentum', icon: 'trending', content: '', status: 'Shifting', color: 'orange' }
                    ],
                    groundReports: [],
                    decidingFactors: [],
                    electoralOutlook: [
                        { party: 'BJP', range: '0-0%', value: 0, color: 'orange' },
                        { party: 'DMK', range: '0-0%', value: 0, color: 'red' },
                        { party: 'AIADMK', range: '0-0%', value: 0, color: 'green' },
                        { party: 'Others', range: '0-0%', value: 0, color: 'gray' }
                    ],
                    historyNarrative: '<h3>Political History</h3><p>Enter history details here...</p>'
                });
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const fetchCards = async () => {
        try {
            const q = query(
                collection(db, 'customCards'),
                where('assemblyId', '==', assemblyId),
                where('section', '==', 'overview')
            );
            const snapshot = await getDocs(q);
            const cardsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const sorted = cardsData.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
            setCustomCards(sorted);
        } catch (e) { console.error(e); }
    };

    const saveCard = async () => {
        if (!editingCard) return;
        setSavingCard(true);
        try {
            const payload = { ...editingCard, assemblyId, section: 'overview' };
            if (editingCard.id) {
                await updateDoc(doc(db, 'customCards', editingCard.id), payload);
            } else {
                await addDoc(collection(db, 'customCards'), payload);
            }
            setEditingCard(null);
            fetchCards();
            refreshPreview();
        } catch (e) {
            console.error(e);
            alert('Failed to save card');
        }
        setSavingCard(false);
    };

    const deleteCard = async (id: string) => {
        if (!confirm('Delete this card?')) return;
        try {
            await deleteDoc(doc(db, 'customCards', id));
            fetchCards();
            refreshPreview();
        } catch (e) { alert('Failed to delete'); }
    };

    const saveData = async () => {
        try {
            await setDoc(doc(db, 'assemblyMeta', assemblyId), data);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            console.error(e);
            alert('Failed to save');
        }
    };

    const updateArrayItem = (arrayField: string, index: number, field: string | null, value: any) => {
        const newArray = [...(data[arrayField] || [])];
        if (field) {
            newArray[index] = { ...newArray[index], [field]: value };
        } else {
            newArray[index] = value;
        }
        setData({ ...data, [arrayField]: newArray });
    };

    const addArrayItem = (arrayField: string, template: any) => {
        setData({ ...data, [arrayField]: [...(data[arrayField] || []), template] });
    };

    const removeArrayItem = (arrayField: string, index: number) => {
        const newArray = [...(data[arrayField] || [])];
        newArray.splice(index, 1);
        setData({ ...data, [arrayField]: newArray });
    };

    const updateHeader = (key: string, value: string) => {
        setData({ ...data, headers: { ...data.headers, [key]: value } });
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Left: Editor Panel */}
            <div className="w-1/2 flex flex-col border-r bg-white shadow-xl z-20">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="font-bold text-lg">Meta Editor</h2>
                        <select
                            value={assemblyId}
                            onChange={(e) => setAssemblyId(e.target.value)}
                        >
                            {ASSEMBLIES.map(a => (
                                <option key={a.id} value={a.id}>{a.id}. {a.name}</option>
                            ))}
                        </select>
                        <div className="flex bg-gray-200 rounded p-1">
                            <button
                                onClick={() => setActiveTab('scenario')}
                                className={`px-3 py-1 rounded text-sm font-medium ${activeTab === 'scenario' ? 'bg-white shadow text-blue-600' : ''}`}
                            >
                                Current Scenario
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-3 py-1 rounded text-sm font-medium ${activeTab === 'history' ? 'bg-white shadow text-blue-600' : ''}`}
                            >
                                History
                            </button>
                            <button
                                onClick={() => setActiveTab('cards')}
                                className={`px-3 py-1 rounded text-sm font-medium ${activeTab === 'cards' ? 'bg-white shadow text-blue-600' : ''}`}
                            >
                                Overview Cards
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={saveData}
                        className={`px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-colors ${saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        <Save size={18} /> {saved ? 'Saved!' : 'Save'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {activeTab === 'scenario' ? (
                        <>
                            {/* Page Config */}
                            <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-4 space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-blue-800 block mb-1">Page Title</label>
                                    <input
                                        className="w-full text-sm border-blue-200 rounded p-1"
                                        value={data.headers?.pageTitle || ''}
                                        onChange={e => updateHeader('pageTitle', e.target.value)}
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="text-xs font-bold text-blue-800 block mb-1">Assembly Map Image</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            className="flex-1 text-sm border-blue-200 rounded p-1"
                                            value={data.assemblyMapUrl || ''}
                                            onChange={e => setData({ ...data, assemblyMapUrl: e.target.value })}
                                            placeholder="Image URL or upload..."
                                        />
                                        <label className="cursor-pointer bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">
                                            Upload
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    // Upload logic
                                                    try {
                                                        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                                                        const { storage } = await import('@/lib/firebase/client');

                                                        const storageRef = ref(storage, `assembly-maps/${assemblyId}/${file.name}`);
                                                        await uploadBytes(storageRef, file);
                                                        const url = await getDownloadURL(storageRef);

                                                        setData((prev: any) => ({ ...prev, assemblyMapUrl: url }));
                                                        alert('Image uploaded successfully!');
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert('Upload failed. Check console.');
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                    {data.assemblyMapUrl && (
                                        <div className="mt-2 text-xs text-blue-800">
                                            <a href={data.assemblyMapUrl} target="_blank" className="underline">View Current Map</a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Scenarios */}
                            <section className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-700">Scenario Cards</h3>
                                        <button onClick={() => addArrayItem('scenarios', { title: 'New', icon: 'users', content: '', status: 'Active', color: 'blue' })} className="text-xs text-blue-600 flex items-center gap-1"><Plus size={14} /> Add</button>
                                    </div>
                                    <input
                                        className="w-full text-sm border-gray-200 bg-gray-50 rounded p-1 text-gray-600 italic"
                                        value={data.headers?.scenariosTitle || ''}
                                        onChange={e => updateHeader('scenariosTitle', e.target.value)}
                                        placeholder="Section Header Text..."
                                    />
                                </div>

                                {data.scenarios?.map((s: any, i: number) => (
                                    <div key={i} className="border p-4 rounded bg-gray-50 text-sm">
                                        <div className="flex justify-between mb-2 gap-2">
                                            <input className="font-bold border rounded p-1 flex-1" value={s.title} onChange={e => updateArrayItem('scenarios', i, 'title', e.target.value)} placeholder="Title" />
                                            <select className="border rounded p-1" value={s.icon} onChange={e => updateArrayItem('scenarios', i, 'icon', e.target.value)}>
                                                <option value="users">Icon: Users</option>
                                                <option value="alert">Icon: Alert</option>
                                                <option value="target">Icon: Target</option>
                                                <option value="trending">Icon: Trend</option>
                                                <option value="zap">Icon: Zap</option>
                                                <option value="bar">Icon: Bar</option>
                                                <option value="flag">Icon: Flag</option>
                                                <option value="message">Icon: Msg</option>
                                            </select>
                                            <select className="border rounded p-1" value={s.status} onChange={e => updateArrayItem('scenarios', i, 'status', e.target.value)}>
                                                <option>Active</option><option>Critical</option><option>Evolving</option><option>Shifting</option>
                                            </select>
                                            <select className="border rounded p-1" value={s.color} onChange={e => updateArrayItem('scenarios', i, 'color', e.target.value)}>
                                                <option value="blue">Blue</option><option value="red">Red</option><option value="green">Green</option><option value="orange">Orange</option>
                                            </select>
                                            <button onClick={() => removeArrayItem('scenarios', i)} className="text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                        <textarea className="w-full border rounded p-2" rows={2} value={s.content} onChange={e => updateArrayItem('scenarios', i, 'content', e.target.value)} placeholder="Content..." />
                                    </div>
                                ))}
                            </section>

                            {/* Ground Reports */}
                            <section className="space-y-4 pt-4 border-t">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-700">Ground Reports</h3>
                                        <button onClick={() => addArrayItem('groundReports', { locality: 'Locality', date: new Date().toISOString().split('T')[0], sentiment: 'Neutral', observation: '' })} className="text-xs text-blue-600 flex items-center gap-1"><Plus size={14} /> Add</button>
                                    </div>
                                    <input
                                        className="w-full text-sm border-gray-200 bg-gray-50 rounded p-1 text-gray-600 italic"
                                        value={data.headers?.reportsTitle || ''}
                                        onChange={e => updateHeader('reportsTitle', e.target.value)}
                                        placeholder="Section Header Text..."
                                    />
                                </div>
                                {data.groundReports?.map((r: any, i: number) => (
                                    <div key={i} className="border p-4 rounded bg-gray-50 text-sm">
                                        <div className="flex justify-between mb-2 gap-2">
                                            <input className="border rounded p-1 flex-1" value={r.locality} onChange={e => updateArrayItem('groundReports', i, 'locality', e.target.value)} placeholder="Locality" />
                                            <input type="date" className="border rounded p-1" value={r.date} onChange={e => updateArrayItem('groundReports', i, 'date', e.target.value)} />
                                            <select className="border rounded p-1" value={r.sentiment} onChange={e => updateArrayItem('groundReports', i, 'sentiment', e.target.value)}>
                                                <option>Positive for BJP</option><option>Positive for DMK</option><option>Neutral/Swing</option>
                                            </select>
                                            <button onClick={() => removeArrayItem('groundReports', i)} className="text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                        <textarea className="w-full border rounded p-2" rows={2} value={r.observation} onChange={e => updateArrayItem('groundReports', i, 'observation', e.target.value)} placeholder="Observation..." />
                                    </div>
                                ))}
                            </section>

                            {/* Deciding Factors */}
                            <section className="space-y-4 pt-4 border-t">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-700">Key Deciding Factors</h3>
                                        <button onClick={() => addArrayItem('decidingFactors', { title: 'Factor', description: '' })} className="text-xs text-blue-600 flex items-center gap-1"><Plus size={14} /> Add</button>
                                    </div>
                                    <input
                                        className="w-full text-sm border-gray-200 bg-gray-50 rounded p-1 text-gray-600 italic"
                                        value={data.headers?.factorsTitle || ''}
                                        onChange={e => updateHeader('factorsTitle', e.target.value)}
                                        placeholder="Section Header Text..."
                                    />
                                </div>
                                {data.decidingFactors?.map((f: any, i: number) => (
                                    <div key={i} className="border p-3 rounded bg-gray-50 text-sm">
                                        <div className="flex justify-between gap-2 mb-1">
                                            <input className="font-bold border rounded p-1 flex-1" value={f.title} onChange={e => updateArrayItem('decidingFactors', i, 'title', e.target.value)} placeholder="Title" />
                                            <button onClick={() => removeArrayItem('decidingFactors', i)} className="text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                        <input className="w-full border rounded p-1" value={f.description} onChange={e => updateArrayItem('decidingFactors', i, 'description', e.target.value)} placeholder="Description" />
                                    </div>
                                ))}
                            </section>

                            {/* Electoral Outlook */}
                            <section className="space-y-4 pt-4 border-t">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-700">Electoral Outlook</h3>
                                        <button onClick={() => addArrayItem('electoralOutlook', { party: 'Party', range: '0-0%', value: 0, color: 'gray' })} className="text-xs text-blue-600 flex items-center gap-1"><Plus size={14} /> Add</button>
                                    </div>
                                    <input
                                        className="w-full text-sm border-gray-200 bg-gray-50 rounded p-1 text-gray-600 italic"
                                        value={data.headers?.outlookTitle || ''}
                                        onChange={e => updateHeader('outlookTitle', e.target.value)}
                                        placeholder="Section Header Text..."
                                    />
                                </div>
                                {data.electoralOutlook?.map((o: any, i: number) => (
                                    <div key={i} className="border p-3 rounded bg-gray-50 flex gap-2 items-center text-sm">
                                        <input className="w-20 border rounded p-1 font-bold" value={o.party} onChange={e => updateArrayItem('electoralOutlook', i, 'party', e.target.value)} placeholder="Party" />
                                        <input className="w-20 border rounded p-1" value={o.range} onChange={e => updateArrayItem('electoralOutlook', i, 'range', e.target.value)} placeholder="Range" />
                                        <input type="number" className="w-16 border rounded p-1" value={o.value} onChange={e => updateArrayItem('electoralOutlook', i, 'value', Number(e.target.value))} placeholder="%" />
                                        <select className="border rounded p-1" value={o.color} onChange={e => updateArrayItem('electoralOutlook', i, 'color', e.target.value)}>
                                            <option value="orange">Orange</option><option value="red">Red</option><option value="green">Green</option><option value="gray">Gray</option>
                                        </select>
                                        <button onClick={() => removeArrayItem('electoralOutlook', i)} className="text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </section>
                        </>
                    ) : activeTab === 'history' ? (
                        /* History Narrative Editor */
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700">Political History & Dynamics</h3>
                            <p className="text-xs text-gray-500">HTML Supported</p>
                            <textarea
                                className="w-full h-96 border rounded p-4 font-mono text-sm"
                                value={data.historyNarrative}
                                onChange={e => setData({ ...data, historyNarrative: e.target.value })}
                                placeholder="<h3>Title</h3><p>Content...</p>"
                            />
                        </div>
                    ) : (
                        /* Overview Cards Editor */
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Overview Custom Cards ({customCards.length})</h3>
                                <button
                                    onClick={() => setEditingCard({ assemblyId, heading: '', content: '', cardType: 'text', section: 'overview', order: customCards.length + 1 })}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                                >
                                    <Plus size={18} /> Add Card
                                </button>
                            </div>

                            <div className="space-y-3">
                                {customCards.map(card => (
                                    <div key={card.id} className="flex items-start justify-between p-4 border rounded-lg bg-gray-50">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {card.icon && CARD_ICONS.find(i => i.id === card.icon) && (() => {
                                                    const Icon = CARD_ICONS.find(i => i.id === card.icon)!.icon;
                                                    return <Icon size={16} className="text-gray-500" />;
                                                })()}
                                                <div className="font-medium">{card.heading}</div>
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1 truncate max-w-md">{card.content}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingCard(card)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18} /></button>
                                            <button onClick={() => deleteCard(card.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                                {customCards.length === 0 && <p className="text-gray-500 text-center py-8">No overview cards yet.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {editingCard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110]">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl overflow-y-auto max-h-[90vh]">
                        <h3 className="text-lg font-semibold mb-4">{editingCard.id ? 'Edit Card' : 'New Card'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Heading</label>
                                <input
                                    type="text"
                                    value={editingCard.heading}
                                    onChange={(e) => setEditingCard({ ...editingCard, heading: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Content</label>
                                <textarea
                                    value={editingCard.content}
                                    onChange={(e) => setEditingCard({ ...editingCard, content: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    rows={4}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Icon</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {CARD_ICONS.map(item => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setEditingCard({ ...editingCard, icon: item.id })}
                                                className={`p-2 border rounded-lg flex flex-col items-center gap-1 transition-colors ${editingCard.icon === item.id ? 'bg-blue-600 border-blue-600 text-white' : 'hover:bg-gray-100 border-gray-200'}`}
                                            >
                                                <Icon size={20} />
                                                <span className="text-[10px] uppercase font-bold">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select
                                        value={editingCard.cardType}
                                        onChange={(e) => setEditingCard({ ...editingCard, cardType: e.target.value as any })}
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option value="text">Text</option>
                                        <option value="note">Note (Yellow)</option>
                                        <option value="info">Info (Blue)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Order</label>
                                    <input
                                        type="number"
                                        value={editingCard.order}
                                        onChange={(e) => setEditingCard({ ...editingCard, order: parseInt(e.target.value) || 1 })}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 sticky bottom-0 bg-white pt-2 border-t">
                            <button onClick={() => setEditingCard(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={saveCard} disabled={savingCard} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                {savingCard ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Right: Preview Panel */}
            <div className="w-1/2 overflow-y-auto bg-gray-200 p-8">
                <div className="sticky top-0 bg-gray-200 z-10 pb-4 mb-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-600">Live Preview ({activeTab === 'scenario' ? 'Current Scenario' : activeTab === 'history' ? 'History' : 'Overview'})</h2>
                    <div className="flex gap-2">
                        <button onClick={refreshPreview} className="p-1 hover:bg-gray-300 rounded"><RefreshCw size={18} /></button>
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Live Preview</span>
                    </div>
                </div>
                <div className="transform scale-90 origin-top">
                    {activeTab === 'scenario' ? (
                        <CurrentScenario selectedAssembly={assemblyId} previewData={data} />
                    ) : activeTab === 'history' ? (
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <PoliticalHistory selectedAssembly={assemblyId} previewData={data} />
                        </div>
                    ) : (
                        <AssemblyOverview key={previewKey} selectedAssembly={assemblyId} />
                    )}
                </div>
            </div>
        </div>
    );
}
