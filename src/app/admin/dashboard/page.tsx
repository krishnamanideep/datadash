'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PollingStation {
  id: string;
  ps_no: string;
  ps_name: string;
  locality: string;
  latitude: number;
  longitude: number;
  // Add more fields
}

export default function AdminDashboard() {
  const router = useRouter();
  const [pollingStations, setPollingStations] = useState<PollingStation[]>([]);
  const [selected, setSelected] = useState<PollingStation | null>(null);

  const fetchPollingStations = async () => {
    const res = await fetch('/api/pollingStations');
    const data = await res.json();
    setPollingStations(data);
  };

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      router.push('/admin');
    } else {
      fetchPollingStations();
    }
  }, [router]);

  const handleSave = async () => {
    if (selected) {
      await fetch('/api/pollingStations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selected),
      });
      fetchPollingStations();
      setSelected(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl mb-4">Polling Stations</h2>
          <ul className="space-y-2">
            {pollingStations.map((ps) => (
              <li key={ps.id} className="p-4 bg-white rounded shadow cursor-pointer" onClick={() => setSelected(ps)}>
                {ps.ps_name} - {ps.locality}
              </li>
            ))}
          </ul>
          <button onClick={() => setSelected({} as PollingStation)} className="mt-4 bg-green-500 text-white p-2 rounded">Add New</button>
        </div>
        {selected && (
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg mb-4">Edit Polling Station</h3>
            <input
              type="text"
              placeholder="PS No"
              value={selected.ps_no || ''}
              onChange={(e) => setSelected({ ...selected, ps_no: e.target.value })}
              className="w-full p-2 border mb-2"
            />
            <input
              type="text"
              placeholder="PS Name"
              value={selected.ps_name || ''}
              onChange={(e) => setSelected({ ...selected, ps_name: e.target.value })}
              className="w-full p-2 border mb-2"
            />
            <input
              type="text"
              placeholder="Locality"
              value={selected.locality || ''}
              onChange={(e) => setSelected({ ...selected, locality: e.target.value })}
              className="w-full p-2 border mb-2"
            />
            <input
              type="number"
              placeholder="Latitude"
              value={selected.latitude || ''}
              onChange={(e) => setSelected({ ...selected, latitude: parseFloat(e.target.value) })}
              className="w-full p-2 border mb-2"
            />
            <input
              type="number"
              placeholder="Longitude"
              value={selected.longitude || ''}
              onChange={(e) => setSelected({ ...selected, longitude: parseFloat(e.target.value) })}
              className="w-full p-2 border mb-2"
            />
            <button onClick={handleSave} className="bg-blue-500 text-white p-2 rounded">Save</button>
            <button onClick={() => setSelected(null)} className="ml-2 bg-gray-500 text-white p-2 rounded">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}