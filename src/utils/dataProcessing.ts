import { PollingStation } from '@/types/data';
import rawPollingData from '@/data/Form20_Localities_Pct.json';

export const processLocalPollingData = (targetAssemblyId: string | null): PollingStation[] => {
    let allStations: any[] = [];
    const jsonData = rawPollingData as any;

    Object.keys(jsonData).forEach(key => {
        if (key.startsWith('AC_') && key.endsWith('_FINAL')) {
            const acId = key.replace('AC_', '').replace('_FINAL', '');

            // Skip if specific assembly requested and doesn't match
            if (targetAssemblyId && acId !== targetAssemblyId) return;

            const stations = jsonData[key].map((station: any, index: number) => {
                const candidates2021: Record<string, number> = {};
                const candidates2016: Record<string, number> = {};
                const candidates2011: Record<string, number> = {};

                Object.keys(station).forEach(k => {
                    if (k.endsWith('_2021_pct')) candidates2021[k.replace('_2021_pct', '')] = station[k];
                    else if (k.endsWith('_2016_pct')) candidates2016[k.replace('_2016_pct', '')] = station[k];
                    else if (k.endsWith('_2011_pct')) candidates2011[k.replace('_2011_pct', '')] = station[k];
                });

                return {
                    id: `${acId}_${station.PS_NO_2021 || index}`,
                    ac_id: acId,
                    ps_no: station.PS_NO_2021,
                    ps_name: station.PS_NO_2021,
                    locality: station.LOCALITY_EXTRACTED,
                    latitude: station.Latitude,
                    longitude: station.Longitude,
                    category: station.TOP_SCORE_CATEGORY,
                    strongestParty: station.TOP_SCORE_PARTY,
                    election2021: { year: 2021, total_votes: station.POLLED_2021, candidates: candidates2021 },
                    election2016: { year: 2016, total_votes: station.POLLED_2016, candidates: candidates2016 },
                    election2011: { year: 2011, total_votes: station.POLLED_2011, candidates: candidates2011 }
                };
            });
            allStations = [...allStations, ...stations];
        }
    });
    return allStations;
};
