import React, { useState, useEffect } from 'react';
import { X, Play, RefreshCw, BarChart3, Users, AlertCircle, TrendingUp, MapPin, Building, ShieldAlert, Facebook, Download, Search, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMontgomeryEvents, analyzeNewBusinessOpportunity } from '../services/brightDataService.ts';

interface ScenarioPanelProps {
  role: 'admin' | 'business' | 'super_admin';
  scenario: string;
  onClose: () => void;
}

export default function ScenarioPanel({ role, scenario, onClose }: ScenarioPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Bright Data state for events
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [isFetchingEvents, setIsFetchingEvents] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [customAttendees, setCustomAttendees] = useState<number>(5000);

  // Bright Data state for new business
  const [isAnalyzingBusiness, setIsAnalyzingBusiness] = useState(false);
  const [businessAddress, setBusinessAddress] = useState<string>('123 Commerce St');

  useEffect(() => {
    if (scenario === 'public-event') {
      handleFetchEvents();
    }
  }, [scenario]);

  const handleFetchEvents = async () => {
    setIsFetchingEvents(true);
    try {
      const events = await fetchMontgomeryEvents();
      setLiveEvents(events);
      if (events.length > 0) {
        setSelectedEventId(events[0].id);
        setCustomAttendees(events[0].attendees);
      }
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setIsFetchingEvents(false);
    }
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedEventId(id);
    const selected = liveEvents.find(evt => evt.id === id);
    if (selected) {
      setCustomAttendees(selected.attendees);
    }
  };

  const runSimulation = async () => {
    setIsRunning(true);
    setResults(null);
    
    if (scenario === 'new-business') {
      setIsAnalyzingBusiness(true);
      try {
        const analysis = await analyzeNewBusinessOpportunity(businessAddress);
        setResults(analysis);
      } catch (error) {
        console.error("Failed to analyze business opportunity", error);
      } finally {
        setIsAnalyzingBusiness(false);
        setIsRunning(false);
      }
      return;
    }

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
        const selectedEvent = liveEvents.find(evt => evt.id === selectedEventId);
        const attendees = selectedEvent ? selectedEvent.attendees : customAttendees;
        
        let trafficSpike = '+120%';
        let safetyNeeds = 'High (15 officers needed)';
        let economicBenefit = '$250,000 estimated';
        let parkingCapacity = '95% full';

        if (attendees < 1000) {
          trafficSpike = '+20%';
          safetyNeeds = 'Low (2 officers needed)';
          economicBenefit = '$15,000 estimated';
          parkingCapacity = '40% full';
        } else if (attendees < 5000) {
          trafficSpike = '+65%';
          safetyNeeds = 'Medium (8 officers needed)';
          economicBenefit = '$85,000 estimated';
          parkingCapacity = '75% full';
        } else if (attendees > 10000) {
          trafficSpike = '+250%';
          safetyNeeds = 'Critical (35 officers needed)';
          economicBenefit = '$850,000 estimated';
          parkingCapacity = '100% full (Overflow required)';
        }

        setResults({
          eventName: selectedEvent ? selectedEvent.name : 'Custom Event',
          location: selectedEvent ? selectedEvent.location : 'Selected Location',
          attendees: attendees,
          trafficSpike,
          safetyNeeds,
          economicBenefit,
          parkingCapacity,
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
              <select className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5 border">
                <option>Dexter Avenue (Downtown)</option>
                <option>Eastern Blvd</option>
                <option>Atlanta Highway</option>
              </select>
            </div>
          )}
          {scenario === 'new-business' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-emerald-900 flex items-center">
                  <Search className="w-4 h-4 mr-2 text-emerald-600" />
                  Bright Data Analysis Engine
                </h4>
              </div>
              <p className="text-xs text-emerald-700 mb-3">
                Powered by Bright Data Deep Lookup & Web Scraper APIs. Analyzes nearby businesses, foot-traffic proxies (reviews), and demographics in Montgomery.
              </p>
              
              <div>
                <label className="block text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">Select Target Area (Montgomery Only)</label>
                <div className="flex flex-col gap-2">
                  <select 
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="w-full border-emerald-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm p-2.5 border bg-white"
                    disabled={isAnalyzingBusiness}
                  >
                    <option value="123 Commerce St">123 Commerce St (Downtown)</option>
                    <option value="456 Zelda Rd">456 Zelda Rd</option>
                    <option value="789 Taylor Rd">789 Taylor Rd</option>
                    <option value="Custom">-- Custom Address --</option>
                  </select>
                  
                  {businessAddress === 'Custom' && (
                    <input 
                      type="text" 
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      className="w-full border-emerald-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm p-2.5 border bg-white" 
                      disabled={isAnalyzingBusiness}
                      placeholder="Enter custom Montgomery address..."
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          {scenario === 'public-event' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-blue-900 flex items-center">
                    <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                    Live Facebook Events
                  </h4>
                  <button 
                    onClick={handleFetchEvents} 
                    disabled={isFetchingEvents}
                    className="text-xs flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${isFetchingEvents ? 'animate-spin' : ''}`} />
                    Sync Bright Data
                  </button>
                </div>
                <p className="text-xs text-blue-700 mb-3">
                  Powered by Bright Data Web Scraper API. Fetching real-time event data from Montgomery Facebook pages.
                </p>
                
                {isFetchingEvents ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                    <span className="ml-2 text-sm text-blue-600">Scraping Facebook Data...</span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2">Select Scraped Event</label>
                    <select 
                      className="w-full border-blue-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5 border bg-white" 
                      disabled={liveEvents.length === 0}
                      value={selectedEventId}
                      onChange={handleEventChange}
                    >
                      {liveEvents.length === 0 && <option>No events found</option>}
                      {liveEvents.map(evt => (
                        <option key={evt.id} value={evt.id}>
                          {evt.name} ({evt.date}) - {evt.location}
                        </option>
                      ))}
                      <option value="custom">-- Custom Event --</option>
                    </select>
                  </div>
                )}
              </div>

              {selectedEventId === 'custom' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Event Location</label>
                  <select className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5 border">
                    <option>Riverfront Park</option>
                    <option>Cramton Bowl</option>
                    <option>Multiplex at Cramton Bowl</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Expected Attendees</label>
                <input 
                  type="number" 
                  value={customAttendees} 
                  onChange={(e) => setCustomAttendees(parseInt(e.target.value) || 0)}
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5 border" 
                />
              </div>
            </>
          )}

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
            {isRunning ? (scenario === 'new-business' ? 'Scraping & Analyzing Data...' : 'Running AI Model...') : (scenario === 'new-business' ? 'Run Opportunity Analysis' : 'Run Simulation')}
          </button>
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

              {scenario === 'new-business' && results && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
                    <p className="text-xs text-emerald-600 font-semibold uppercase mb-2 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" /> Top Recommendation
                    </p>
                    <p className="text-2xl font-bold text-emerald-900">{results.recommendations[0].type}</p>
                    <div className="mt-2 flex items-center">
                      <div className="bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full mr-2">
                        Score: {results.recommendations[0].score}/100
                      </div>
                      <p className="text-xs text-emerald-700">{results.recommendations[0].reason}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Demographics</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Pop. Density</span>
                          <span className="text-xs font-semibold text-slate-800">{results.demographics.populationDensity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Median Income</span>
                          <span className="text-xs font-semibold text-slate-800">{results.demographics.medianIncome}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Key Age Group</span>
                          <span className="text-xs font-semibold text-slate-800">{results.demographics.ageDistribution.split(',')[0]}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Business Density (1km)</p>
                      <div className="space-y-2">
                        {Object.entries(results.businessDensity).slice(0, 3).map(([category, count]: any) => (
                          <div key={category} className="flex justify-between items-center">
                            <span className="text-xs text-slate-600">{category}</span>
                            <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-3">Nearby Competitors & Foot Traffic Proxies</p>
                    <div className="space-y-3">
                      {results.existingBusinesses.slice(0, 3).map((biz: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{biz.name}</p>
                            <p className="text-xs text-slate-500">{biz.category}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end text-amber-500">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="text-xs font-bold ml-1 text-slate-700">{biz.rating}</span>
                            </div>
                            <p className="text-xs text-slate-500">{biz.reviews} reviews</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {scenario === 'public-event' && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-2">
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Event Details</p>
                    <p className="text-lg font-bold text-slate-800">{results.eventName}</p>
                    <p className="text-sm text-slate-600">{results.location} • {results.attendees.toLocaleString()} Attendees</p>
                  </div>
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
                      <div className="bg-red-500 h-2.5 rounded-full" style={{ width: results.parkingCapacity.includes('100') ? '100%' : results.parkingCapacity.includes('95') ? '95%' : results.parkingCapacity.includes('75') ? '75%' : '40%' }}></div>
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
