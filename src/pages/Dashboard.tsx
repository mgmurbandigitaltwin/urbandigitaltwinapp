import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.tsx';
import Header from '../components/Header.tsx';
import MapView from '../components/Map.tsx';
import ScenarioPanel from '../components/ScenarioPanel.tsx';
import AIAssistant from '../components/AIAssistant.tsx';
import ApprovalsPanel from '../components/ApprovalsPanel.tsx';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function Dashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'admin' | 'business' | 'super_admin'>('business');
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('map');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedRole = localStorage.getItem('userRole');
      
      // If we have a stored role (from demo accounts or previous login), use it
      if (storedRole) {
        setRole(storedRole as 'admin' | 'business' | 'super_admin');
        setIsLoading(false);
        return;
      }

      // Otherwise, check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
      } else {
        // Default to business role for Supabase users if no role is stored
        setRole('business');
      }
      setIsLoading(false);
    };

    checkAuth();

    // Simulate updating dashboard every 30 mins
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      <Sidebar 
        role={role} 
        activeScenario={activeScenario} 
        setActiveScenario={setActiveScenario} 
        activeView={activeView}
        setActiveView={setActiveView}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header role={role} lastUpdated={lastUpdated} />
        
        <main className="flex-1 overflow-hidden relative flex flex-col md:flex-row">
          {activeView === 'approvals' && role === 'super_admin' ? (
            <div className="flex-1 h-full bg-slate-50 relative z-0">
              <ApprovalsPanel />
            </div>
          ) : (
            <>
              {/* Map Area */}
              <div className="flex-1 h-full relative z-0">
                <MapView activeScenario={activeScenario} />
                
                {/* Default City Stats Overlay */}
                {!activeScenario && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-6 right-6 z-[1000] w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
                  >
                    <div className="bg-slate-900 p-4">
                      <h3 className="text-white font-semibold flex items-center">
                        <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-[#0055A4] mr-3 shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        Montgomery Overview
                      </h3>
                      <p className="text-slate-400 text-xs mt-1">Live City Metrics</p>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Active Businesses</span>
                        <span className="font-bold text-slate-900">12,450</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Current Traffic</span>
                        <span className="font-bold text-emerald-600">Normal</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Available Properties</span>
                        <span className="font-bold text-indigo-600">342</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Upcoming Events</span>
                        <span className="font-bold text-orange-600">5</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 text-xs text-center text-slate-500 border-t border-slate-100">
                      Select a simulation from the sidebar to begin.
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Scenario Panel */}
              {activeScenario && (
                <motion.div 
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="w-full md:w-96 h-full bg-white border-l border-slate-200 shadow-2xl z-10 overflow-y-auto"
                >
                  <ScenarioPanel role={role} scenario={activeScenario} onClose={() => setActiveScenario(null)} />
                </motion.div>
              )}
            </>
          )}
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-500 z-20">
          <p className="mb-1">© 2026 City of Montgomery, Alabama | Urban Digital Twin Platform</p>
          <p>Powered by Montgomery Open Data Initiative</p>
        </footer>
      </div>
      
      {/* AI Assistant Chat Widget */}
      <AIAssistant role={role} activeScenario={activeScenario} />
    </div>
  );
}
