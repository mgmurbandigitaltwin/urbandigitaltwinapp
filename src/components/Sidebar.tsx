import React from 'react';
import { Building2, Map as MapIcon, Briefcase, Calendar, AlertTriangle, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  role: 'admin' | 'business';
  activeScenario: string | null;
  setActiveScenario: (scenario: string | null) => void;
}

export default function Sidebar({ role, activeScenario, setActiveScenario }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const scenarios = [
    { id: 'road-closure', name: 'Road Closure', icon: AlertTriangle, color: 'text-orange-500' },
    { id: 'new-business', name: 'New Business', icon: Briefcase, color: 'text-emerald-500' },
    { id: 'public-event', name: 'Public Event', icon: Calendar, color: 'text-indigo-500' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <Building2 className="w-6 h-6 text-indigo-400 mr-3" />
        <span className="text-white font-semibold text-lg tracking-tight truncate">MGM Digital Twin</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="mb-8">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Simulations
          </p>
          <div className="space-y-1">
            {scenarios.map((scenario) => {
              const Icon = scenario.icon;
              const isActive = activeScenario === scenario.id;
              return (
                <button
                  key={scenario.id}
                  onClick={() => setActiveScenario(isActive ? null : scenario.id)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-400' : scenario.color}`} />
                  {scenario.name}
                </button>
              );
            })}
          </div>
        </div>

        {role === 'admin' && (
          <div className="mb-8">
            <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Admin Tools
            </p>
            <div className="space-y-1">
              <button className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                <Settings className="w-5 h-5 mr-3 text-slate-400" />
                Bright Data Manager
              </button>
              <button className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                <MapIcon className="w-5 h-5 mr-3 text-slate-400" />
                Data Sources
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
            {role === 'admin' ? 'A' : 'B'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white capitalize">{role} User</p>
            <p className="text-xs text-slate-500 truncate">
              {role === 'admin' ? 'Full Access' : 'Read-only Access'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </button>
      </div>
    </div>
  );
}
