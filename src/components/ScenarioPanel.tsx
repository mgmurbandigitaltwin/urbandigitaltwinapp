import React, { useState } from 'react';
import { X, Play, RefreshCw, BarChart3, Users, AlertCircle, TrendingUp, MapPin, Building, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScenarioPanelProps {
  role: 'admin' | 'business';
  scenario: string;
  onClose: () => void;
}

export default function ScenarioPanel({ role, scenario, onClose }: ScenarioPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runSimulation = () => {
    setIsRunning(true);
    setResults(null);
    setTimeout(() => {
      setIsRunning(false);
      if (scenario === 'road-closure') {
        setResults({
          trafficIncrease: '+45%',
          congestionAreas: ['Commerce St', 'Madison Ave'],
          altRoutes: ['I-85 N', 'Perry St'],
          impactScore: 78,
        });
      } else if (scenario === 'new-business') {
        setResults({
          bestType: 'Coffee Shop / Cafe',
          successProb: '73%',
          footTraffic: '1,200/day',
          competitors: 2,
          demographics: 'Young Professionals (65%)',
        });
      } else if (scenario === 'public-event') {
        setResults({
          trafficSpike: '+120%',
          safetyNeeds: 'High (15 officers needed)',
          economicBenefit: '$250,000 estimated',
          parkingCapacity: '95% full',
        });
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
        <h2 className="text-lg font-bold text-slate-800 flex items-center">
          {scenario === 'road-closure' && <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />}
          {scenario === 'new-business' && <Building className="w-5 h-5 mr-2 text-emerald-500" />}
          {scenario === 'public-event' && <Users className="w-5 h-5 mr-2 text-indigo-500" />}
          {scenario === 'road-closure' ? 'Road Closure' : scenario === 'new-business' ? 'New Business' : 'Public Event'}
        </h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="mb-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            {scenario === 'road-closure' && 'Simulate the impact of closing a major road for construction. AI predicts traffic changes, congestion areas, and alternative routes.'}
            {scenario === 'new-business' && 'Analyze a vacant property to determine the best business type based on nearby population, foot traffic, and existing businesses.'}
            {scenario === 'public-event' && 'Add a large public event (e.g., 5,000 attendees) to predict traffic spikes, public safety needs, and economic benefits.'}
          </p>
        </div>

        {/* Input Form */}
        <div className="space-y-4 mb-8">
          {scenario === 'road-closure' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Road</label>
              <select className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5 border" disabled={role === 'business'}>
                <option>Dexter Avenue (Downtown)</option>
                <option>Eastern Blvd</option>
                <option>Atlanta Highway</option>
              </select>
            </div>
          )}
          {scenario === 'new-business' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Vacant Property</label>
              <select className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5 border" disabled={role === 'business'}>
                <option>123 Commerce St (Downtown)</option>
                <option>456 Zelda Rd</option>
                <option>789 Taylor Rd</option>
              </select>
            </div>
          )}
          {scenario === 'public-event' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Event Location</label>
                <select className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5 border" disabled={role === 'business'}>
                  <option>Riverfront Park</option>
                  <option>Cramton Bowl</option>
                  <option>Multiplex at Cramton Bowl</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Expected Attendees</label>
                <input type="number" defaultValue={5000} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5 border" disabled={role === 'business'} />
              </div>
            </>
          )}

          {role === 'admin' ? (
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70"
            >
              {isRunning ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Play className="w-5 h-5 mr-2" />
              )}
              {isRunning ? 'Running AI Model...' : 'Run Simulation'}
            </button>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start">
              <ShieldAlert className="w-5 h-5 mr-2 flex-shrink-0 text-amber-500" />
              <p>You have read-only access. Viewing pre-computed simulation results provided by the city administration.</p>
            </div>
          )}
          
          {role === 'business' && !results && !isRunning && (
            <button
              onClick={runSimulation}
              className="w-full flex items-center justify-center py-3 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              View Pre-computed Results
            </button>
          )}
        </div>

        {/* Results Area */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-indigo-500" />
                AI Prediction Results
              </h3>

              {scenario === 'road-closure' && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <p className="text-xs text-red-600 font-semibold uppercase mb-1">Traffic Increase</p>
                    <p className="text-2xl font-bold text-red-700">{results.trafficIncrease}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Congestion Areas</p>
                    <ul className="list-disc list-inside text-sm text-slate-700 font-medium">
                      {results.congestionAreas.map((area: string) => <li key={area}>{area}</li>)}
                    </ul>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-semibold uppercase mb-2">Alternative Routes</p>
                    <ul className="list-disc list-inside text-sm text-emerald-700 font-medium">
                      {results.altRoutes.map((route: string) => <li key={route}>{route}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {scenario === 'new-business' && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <p className="text-xs text-indigo-600 font-semibold uppercase mb-1">Best Business Type</p>
                    <p className="text-xl font-bold text-indigo-900">{results.bestType}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <p className="text-xs text-emerald-600 font-semibold uppercase mb-1">Success Prob.</p>
                      <p className="text-2xl font-bold text-emerald-700">{results.successProb}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Foot Traffic</p>
                      <p className="text-xl font-bold text-blue-700">{results.footTraffic}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Key Demographics</p>
                    <p className="text-sm font-medium text-slate-800">{results.demographics}</p>
                  </div>
                </div>
              )}

              {scenario === 'public-event' && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-semibold uppercase mb-1">Economic Benefit</p>
                    <p className="text-2xl font-bold text-emerald-700">{results.economicBenefit}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <p className="text-xs text-orange-600 font-semibold uppercase mb-1">Traffic Spike</p>
                      <p className="text-xl font-bold text-orange-700">{results.trafficSpike}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                      <p className="text-xs text-red-600 font-semibold uppercase mb-1">Safety Needs</p>
                      <p className="text-sm font-bold text-red-700">{results.safetyNeeds}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Parking Capacity</p>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                      <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                    <p className="text-xs text-right mt-1 font-medium text-slate-600">{results.parkingCapacity}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
