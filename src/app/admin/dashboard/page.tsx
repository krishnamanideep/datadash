/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Map,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  Trophy,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { WidgetConfigProvider } from '../../../components/admin/WidgetConfigContext';
import PollingStationEditor from '../../../components/admin/PollingStationEditor';
import SurveyEditor from '../../../components/admin/SurveyEditor';
import WidgetSettings from '../../../components/admin/WidgetSettings';
import SessionProviderWrapper from '../../../components/admin/SessionProviderWrapper';
import CandidateEditor from '../../../components/admin/CandidateEditor';
import AssemblyMetaEditor from '../../../components/admin/AssemblyMetaEditor';
import RetroBoothsEditor from '../../../components/admin/RetroBoothsEditor';
import MLAEditor from '../../../components/admin/MLAEditor';
import ElectionDataEditor from '../../../components/admin/ElectionDataEditor';
import PoliticalHistoryEditor from '../../../components/admin/PoliticalHistoryEditor';
import AssemblyOverviewEditor from '../../../components/admin/AssemblyOverviewEditor';
import UserManagement from '../../../components/admin/UserManagement';

function AdminDashboardContent() {
  const { logout, user, loading } = useAuth();
  const isAuthenticated = !!user;
  const [activeTab, setActiveTab] = useState<'stations' | 'survey' | 'widgets' | 'candidates' | 'meta' | 'retrobooths' | 'mlas' | 'elections' | 'politicalhistory' | 'assemblyoverview' | 'users'>('stations');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <WidgetConfigProvider>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <aside
          className={`bg-slate-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'
            } flex flex-col fixed h-full z-20`}
        >
          <div className="p-4 flex items-center justify-between border-b border-slate-700">
            {isSidebarOpen && <span className="font-bold text-xl">AdminPortal</span>}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button
              onClick={() => setActiveTab('stations')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'stations' ? 'bg-blue-600' : 'hover:bg-slate-800'
                }`}
            >
              <Map size={24} />
              {isSidebarOpen && <span className="ml-3">Polling Stations</span>}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-blue-600' : 'hover:bg-slate-800'
                }`}
            >
              <Users size={24} />
              {isSidebarOpen && <span className="ml-3">User Management</span>}
            </button>

            <button
              onClick={() => setActiveTab('mlas')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'mlas' ? 'bg-blue-600' : 'hover:bg-slate-800'
                }`}
            >
              <Trophy size={24} />
              {isSidebarOpen && <span className="ml-3">MLAs / Winners</span>}
            </button>

            <button
              onClick={() => setActiveTab('elections')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'elections' ? 'bg-blue-600' : 'hover:bg-slate-800'
                }`}
            >
              <Calendar size={24} />
              {isSidebarOpen && <span className="ml-3">Election Data</span>}
            </button>

            <button
              onClick={() => setActiveTab('candidates')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'candidates' ? 'bg-blue-600' : 'hover:bg-slate-800'
                }`}
            >
              <Users size={24} />
              {isSidebarOpen && <span className="ml-3">Candidates</span>}
            </button>

            <button
              onClick={() => setActiveTab('survey')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'survey' ? 'bg-blue-600' : 'hover:bg-slate-800'
                }`}
            >
              <FileText size={24} />
              {isSidebarOpen && <span className="ml-3">Survey Data</span>}
            </button>

            <button
              onClick={() => setActiveTab('meta')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'meta' ? 'bg-blue-600' : 'hover:bg-slate-800'
                }`}
            >
              <FileText size={24} />
              {isSidebarOpen && <span className="ml-3">Assembly Data</span>}
            </button>

            <button
              onClick={() => setActiveTab('retrobooths')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'retrobooths' ? 'bg-blue-600' : 'hover:bg-slate-800'
                }`}
            >
              <Map size={24} />
              {isSidebarOpen && <span className="ml-3">Retro Booths Page</span>}
            </button>

            <button
              onClick={() => setActiveTab('politicalhistory')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'politicalhistory' ? 'bg-blue-600' : 'hover:bg-slate-800'
                }`}
            >
              <TrendingUp size={24} />
              {isSidebarOpen && <span className="ml-3">Political History</span>}
            </button>

            <button
              onClick={() => setActiveTab('assemblyoverview')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'assemblyoverview' ? 'bg-blue-600' : 'hover:bg-slate-800'
                }`}
            >
              <LayoutDashboard size={24} />
              {isSidebarOpen && <span className="ml-3">Assembly Overview</span>}
            </button>

            <button
              onClick={() => setActiveTab('widgets')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'widgets' ? 'bg-blue-600' : 'hover:bg-slate-800'
                }`}
            >
              <Settings size={24} />
              {isSidebarOpen && <span className="ml-3">Widget Config</span>}
            </button>
          </nav>

          <div className="p-4 border-t border-slate-700">
            <button
              onClick={logout}
              className="w-full flex items-center p-3 rounded-lg hover:bg-red-900/50 text-red-300 transition-colors"
            >
              <LogOut size={24} />
              {isSidebarOpen && <span className="ml-3">Sign Out</span>}
            </button>
            {isSidebarOpen && (
              <div className="mt-4 text-xs text-slate-500 text-center">
                Logged in as Admin User
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="bg-white min-h-screen border border-gray-200 overflow-hidden">
            {activeTab === 'stations' && <PollingStationEditor />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'survey' && <SurveyEditor />}
            {activeTab === 'widgets' && <WidgetSettings />}
            {activeTab === 'candidates' && <CandidateEditor />}
            {activeTab === 'meta' && <AssemblyMetaEditor />}
            {activeTab === 'retrobooths' && <RetroBoothsEditor />}
            {activeTab === 'mlas' && <MLAEditor />}
            {activeTab === 'elections' && <ElectionDataEditor />}
            {activeTab === 'politicalhistory' && <PoliticalHistoryEditor />}
            {activeTab === 'assemblyoverview' && <AssemblyOverviewEditor />}
          </div>
        </main>
      </div>
    </WidgetConfigProvider>
  );
}

export default function AdminDashboard() {
  return (
    <AdminDashboardContent />
  );
}