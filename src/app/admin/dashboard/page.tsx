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
  TrendingUp,
  Shield
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
import { ADMIN_SECTIONS } from '@/data/admin-navigation';

const ICONS: Record<string, any> = {
  stations: Map,
  users: Users,
  mlas: Trophy,
  elections: Calendar,
  candidates: Users,
  survey: FileText,
  meta: FileText,
  retrobooths: Map,
  politicalhistory: TrendingUp,
  assemblyoverview: LayoutDashboard,
  widgets: Settings
};

function AdminDashboardContent() {
  const { logout, user, loading } = useAuth();
  const isAuthenticated = !!user;
  const [activeTab, setActiveTab] = useState(ADMIN_SECTIONS[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Filter sections based on user role
  const visibleSections = ADMIN_SECTIONS.filter(section => {
    if (user?.role === 'super_admin') return true;
    if (user?.role === 'admin') {
      if (section.superAdminOnly) return false;
      // If accessibleAdminSections is undefined/empty, maybe default to none or all? 
      // Let's default to restricting everything if array exists but empty, 
      // but for backward compatibility if field is missing, maybe show all (except super admin)?
      // Better secure by default: if array exists, use it. If not, maybe show all for now until migration complete.
      // Going with: if accessibleAdminSections is defined, use it.
      if (user.accessibleAdminSections) {
        return user.accessibleAdminSections.includes(section.id);
      }
      return true; // Fallback for existing admins without this field set yet
    }
    return false;
  });

  // Ensure active tab is valid
  useEffect(() => {
    if (visibleSections.length > 0 && !visibleSections.find(s => s.id === activeTab)) {
      setActiveTab(visibleSections[0].id);
    }
  }, [visibleSections, activeTab]);

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
            {visibleSections.map(section => {
              const Icon = ICONS[section.id] || FileText;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === section.id ? 'bg-blue-600' : 'hover:bg-slate-800'
                    }`}
                >
                  <Icon size={24} />
                  {isSidebarOpen && <span className="ml-3">{section.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-700">
            {/* User Profile */}
            {isSidebarOpen && user && (
              <div className="mb-4 p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{user.displayName || 'User'}</div>
                    <div className="text-xs text-slate-400 truncate">{user.email}</div>
                    <div className="text-xs text-blue-400 font-medium mt-0.5">
                      {user.role === 'super_admin' ? 'Super Admin' : (user.role?.charAt(0).toUpperCase() + user.role?.slice(1))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={logout}
              className="w-full flex items-center p-3 rounded-lg hover:bg-red-900/50 text-red-300 transition-colors"
            >
              <LogOut size={24} />
              {isSidebarOpen && <span className="ml-3">Sign Out</span>}
            </button>
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