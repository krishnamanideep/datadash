/* eslint-disable */
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type WidgetType = 'bar' | 'pie' | 'line';

export interface WidgetConfig {
    showPollingStationMap: boolean;
    showPartyPerformance: boolean;
    showCategoryDistribution: boolean;
    showVoterTurnout: boolean;
    partyPerformanceChartType: WidgetType;
    categoryDistributionChartType: WidgetType;
}

const defaultConfig: WidgetConfig = {
    showPollingStationMap: true,
    showPartyPerformance: true,
    showCategoryDistribution: true,
    showVoterTurnout: true,
    partyPerformanceChartType: 'bar',
    categoryDistributionChartType: 'pie',
};

const WidgetConfigContext = createContext<{
    config: WidgetConfig;
    updateConfig: (key: keyof WidgetConfig, value: any) => void;
    saveConfig: () => Promise<void>;
}>({
    config: defaultConfig,
    updateConfig: () => { },
    saveConfig: async () => { },
});

export function WidgetConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<WidgetConfig>(defaultConfig);

    // Load config from Server (Firestore)
    useEffect(() => {
        fetch('/api/admin/config')
            .then(res => res.json())
            .then(data => {
                if (data && Object.keys(data).length > 0) {
                    setConfig(prev => ({ ...prev, ...data }));
                }
            })
            .catch(console.error);
    }, []);

    const updateConfig = (key: keyof WidgetConfig, value: boolean | WidgetType) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
    };

    const saveConfig = async () => {
        try {
            await fetch('/api/admin/config', {
                method: 'POST',
                body: JSON.stringify(config),
                headers: { 'Content-Type': 'application/json' }
            });
            alert('Configuration saved globally!');
        } catch (e) {
            console.error("Failed to save config remotely", e);
            alert('Failed to save configuration');
        }
    };

    return (
        <WidgetConfigContext.Provider value={{ config, updateConfig, saveConfig }}>
            {children}
        </WidgetConfigContext.Provider>
    );
}

export const useWidgetConfig = () => useContext(WidgetConfigContext);
