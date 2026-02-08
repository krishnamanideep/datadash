'use client';

import { useState } from 'react';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';

import { DASHBOARD_PAGES } from '@/data/navigation';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  allowedPages?: string[];
  user?: {
    displayName?: string;
    email?: string;
    role?: string;
  };
  onLogout?: () => void;
}

export default function Navigation({ currentPage, onPageChange, allowedPages, user, onLogout }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  // If allowedPages is provided, filter the pages. Otherwise show all (backward compatibility/admin)
  const visiblePages = allowedPages
    ? DASHBOARD_PAGES.filter(page => allowedPages.includes(page.id))
    : DASHBOARD_PAGES;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600">DataDash</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {visiblePages.map((page) => (
              <button
                key={page.id}
                onClick={() => onPageChange(page.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === page.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-blue-50'
                  }`}
              >
                {page.label}
              </button>
            ))}

            {/* User Profile */}
            {user && (
              <div className="ml-4 flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">{user.displayName || 'User'}</div>
                    <div className="text-xs text-gray-500">{user.role?.replace('_', ' ').toUpperCase()}</div>
                  </div>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            {visiblePages.map((page) => (
              <button
                key={page.id}
                onClick={() => {
                  onPageChange(page.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === page.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-blue-50'
                  }`}
              >
                {page.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
