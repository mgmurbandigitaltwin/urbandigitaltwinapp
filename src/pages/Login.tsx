import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, MapPin, BarChart2, Briefcase, Target, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'business'>('business');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check demo accounts first
      if (email === 'admin@montgomery-twin.local' && password === 'Admin123!') {
        localStorage.setItem('userRole', 'admin');
        navigate('/dashboard');
        return;
      } else if (email === 'business@montgomery-twin.local' && password === 'Business123!') {
        localStorage.setItem('userRole', 'business');
        navigate('/dashboard');
        return;
      } else if (email === 'nileshnaphade15@gmail.com' && password === 'Admin123#') {
        localStorage.setItem('userRole', 'super_admin');
        navigate('/dashboard');
        return;
      }

      // If not demo accounts, use Supabase
      if (activeTab === 'signup') {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phone)) {
          setError('Please enter a valid phone number (at least 10 digits).');
          setIsLoading(false);
          return;
        }

        const status = role === 'admin' ? 'pending' : 'active';
        
        let supabaseUserId = null;
        let isSupabaseSuccess = false;

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                role: role,
                first_name: firstName,
                last_name: lastName,
                city: city,
                phone: phone,
                status: status
              }
            }
          });
          
          if (error) {
            if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
              setError('User already registered with this email address.');
              setIsLoading(false);
              return;
            }
            throw error;
          }

          if (data?.user) {
            // If email confirmation is enabled, Supabase returns a fake user with empty identities if the email already exists
            if (data.user.identities && data.user.identities.length === 0) {
              setError('User already registered with this email address.');
              setIsLoading(false);
              return;
            }
            
            supabaseUserId = data.user.id;
            isSupabaseSuccess = true;
          }
        } catch (err: any) {
          if (err.message && (err.message.toLowerCase().includes('already registered') || err.message.toLowerCase().includes('already exists'))) {
            setError('User already registered with this email address.');
            setIsLoading(false);
            return;
          }
          console.warn("Supabase signup failed or not configured, using local demo mode.");
        }

        // Fallback to local storage for demo purposes
        const localProfiles = JSON.parse(localStorage.getItem('demo_profiles') || '[]');
        
        if (!isSupabaseSuccess && localProfiles.some((p: any) => p.email === email)) {
          setError('User already registered with this email address.');
          setIsLoading(false);
          return;
        }

        const newProfile = {
          id: supabaseUserId || Date.now().toString(),
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          city,
          phone,
          role,
          status
        };

        localProfiles.push(newProfile);
        localStorage.setItem('demo_profiles', JSON.stringify(localProfiles));

        if (isSupabaseSuccess) {
          // Attempt to insert into profiles table
          try {
            await supabase.from('profiles').insert([newProfile]);
          } catch (profileErr) {
            console.warn("Could not insert profile, table might not exist yet.", profileErr);
          }
        }

        if (status === 'pending') {
          await supabase.auth.signOut();
          setError('Account created successfully. Your admin account is pending approval by the super admin.');
          setActiveTab('signin');
          setIsLoading(false);
          return;
        }

        localStorage.setItem('userRole', role);
        navigate('/dashboard');
      } else {
        // Check local profiles first for demo
        const localProfiles = JSON.parse(localStorage.getItem('demo_profiles') || '[]');
        const localProfile = localProfiles.find((p: any) => p.email === email && p.password === password);

        if (localProfile) {
          if (localProfile.role === 'admin' && localProfile.status === 'pending') {
            setError('Your admin account is pending approval by the super admin.');
            setIsLoading(false);
            return;
          } else if (localProfile.role === 'admin' && localProfile.status === 'rejected') {
            setError('Your admin account request was rejected.');
            setIsLoading(false);
            return;
          }
          localStorage.setItem('userRole', localProfile.role);
          navigate('/dashboard');
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          // Check profile for status
          let userStatus = data.user.user_metadata?.status || 'active';
          let userRole = data.user.user_metadata?.role || 'business';

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('status, role')
              .eq('id', data.user.id)
              .single();
            
            if (profile) {
              userStatus = profile.status;
              userRole = profile.role;
            }
          } catch (err) {
            console.warn("Could not fetch profile, falling back to metadata");
          }

          if (userRole === 'admin' && userStatus === 'pending') {
            await supabase.auth.signOut();
            setError('Your admin account is pending approval by the super admin.');
            return;
          }

          localStorage.setItem('userRole', userRole);
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #003366 0%, #0055A4 100%)' }}>
      {/* Background Effects */}
      <div 
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,133.3C960,128,1056,96,1152,90.7C1248,85,1344,107,1392,117.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>')`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom',
          backgroundSize: 'cover'
        }}
      />
      
      {/* Floating Shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-20 h-20 rounded-full bg-white/10 top-[20%] left-[10%]" 
        />
        <motion.div 
          animate={{ y: [0, -30, 0], rotate: [0, -180, -360] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute w-32 h-32 rounded-full bg-white/10 top-[60%] right-[10%]" 
        />
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [0, 90, 180] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 10 }}
          className="absolute w-16 h-16 rounded-full bg-white/10 bottom-[20%] left-[30%]" 
        />
      </div>

      {/* Header */}
      <header className="relative z-50 bg-white/10 backdrop-blur-md border-b border-white/20 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="#" className="flex items-center gap-3 text-white no-underline">
            <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center font-bold text-[#0055A4] text-xl">
              M
            </div>
            <div className="text-lg font-semibold tracking-wide">Montgomery Urban Digital Twin</div>
          </a>
          <nav className="hidden md:block">
            <ul className="flex gap-8 list-none m-0 p-0">
              <li><a href="#" className="text-white font-medium opacity-100 transition-opacity hover:opacity-100">Home</a></li>
              <li><a href="#about" className="text-white font-medium opacity-90 transition-opacity hover:opacity-100">About</a></li>
              <li><a href="#features" className="text-white font-medium opacity-90 transition-opacity hover:opacity-100">Features</a></li>
              <li><a href="#contact" className="text-white font-medium opacity-90 transition-opacity hover:opacity-100">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Side - Information */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-white"
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Welcome to Montgomery Urban Digital Twin
            </h1>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Empowering businesses with data-driven insights for workforce and economic growth in Montgomery, Alabama
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                { icon: MapPin, text: 'Advanced location scoring and analysis' },
                { icon: BarChart2, text: 'Real-time market and competition insights' },
                { icon: Briefcase, text: 'Comprehensive labor market analysis' },
                { icon: Target, text: 'AI-powered business recommendations' },
                { icon: TrendingUp, text: 'Economic growth forecasting tools' }
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-4 text-lg">
                  <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-[#0055A4] shrink-0">
                    <feature.icon size={16} strokeWidth={2.5} />
                  </div>
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-10">
              <h3 className="text-2xl font-semibold mb-4">Why Choose Our Platform?</h3>
              <p className="opacity-90 leading-relaxed text-lg">
                Join hundreds of businesses already using our platform to make data-driven decisions 
                about site selection, workforce planning, and economic development in Montgomery.
              </p>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="bg-white rounded-[20px] shadow-[0_25px_50px_rgba(0,0,0,0.2)] p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-[#0055A4] via-[#4A90E2] to-[#FFD700]" />
              
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#003366] mb-2">Sign In</h2>
                <p className="text-slate-500">Access your business intelligence dashboard</p>
              </div>

              {/* Form Tabs */}
              <div className="flex gap-4 mb-8 border-b-2 border-slate-100">
                <button 
                  onClick={() => { setActiveTab('signin'); setError(''); }}
                  className={`flex-1 pb-4 font-semibold transition-all border-b-[3px] ${activeTab === 'signin' ? 'text-[#0055A4] border-[#0055A4]' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setActiveTab('signup'); setError(''); }}
                  className={`flex-1 pb-4 font-semibold transition-all border-b-[3px] ${activeTab === 'signup' ? 'text-[#0055A4] border-[#0055A4]' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                {activeTab === 'signup' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#003366] mb-1.5 text-sm">First Name</label>
                        <input 
                          type="text" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full p-3 border-2 border-slate-100 rounded-xl text-base transition-all focus:outline-none focus:border-[#0055A4] focus:ring-4 focus:ring-[#0055A4]/10"
                          placeholder="John"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#003366] mb-1.5 text-sm">Last Name</label>
                        <input 
                          type="text" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full p-3 border-2 border-slate-100 rounded-xl text-base transition-all focus:outline-none focus:border-[#0055A4] focus:ring-4 focus:ring-[#0055A4]/10"
                          placeholder="Doe"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#003366] mb-1.5 text-sm">City</label>
                        <input 
                          type="text" 
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full p-3 border-2 border-slate-100 rounded-xl text-base transition-all focus:outline-none focus:border-[#0055A4] focus:ring-4 focus:ring-[#0055A4]/10"
                          placeholder="Montgomery"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#003366] mb-1.5 text-sm">Phone Number</label>
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full p-3 border-2 border-slate-100 rounded-xl text-base transition-all focus:outline-none focus:border-[#0055A4] focus:ring-4 focus:ring-[#0055A4]/10"
                          placeholder="(555) 123-4567"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-semibold text-[#003366] mb-1.5 text-sm">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border-2 border-slate-100 rounded-xl text-base transition-all focus:outline-none focus:border-[#0055A4] focus:ring-4 focus:ring-[#0055A4]/10"
                    placeholder="Enter your email address"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-[#003366] mb-1.5 text-sm">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 border-2 border-slate-100 rounded-xl text-base transition-all focus:outline-none focus:border-[#0055A4] focus:ring-4 focus:ring-[#0055A4]/10 pr-12"
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0055A4] transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {activeTab === 'signup' && (
                  <div>
                    <label className="block font-semibold text-[#003366] mb-1.5 text-sm">Select Role</label>
                    <div className="relative">
                      <select 
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'admin' | 'business')}
                        className="w-full p-3 border-2 border-slate-100 rounded-xl text-base transition-all focus:outline-none focus:border-[#0055A4] focus:ring-4 focus:ring-[#0055A4]/10 appearance-none bg-white font-medium text-slate-700"
                        disabled={isLoading}
                      >
                        <option value="business">Business User</option>
                        <option value="admin">Administrator (Requires Approval)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'signin' && (
                  <div className="flex justify-between items-center text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-500">
                      <input type="checkbox" className="rounded text-[#0055A4] focus:ring-[#0055A4] w-4 h-4" />
                      <span>Remember me for 30 days</span>
                    </label>
                    <a href="#" className="text-[#0055A4] font-medium hover:underline">Forgot password?</a>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl text-lg font-semibold text-white bg-gradient-to-br from-[#0055A4] to-[#4A90E2] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,85,164,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    activeTab === 'signin' ? '🔐 Sign In' : '✨ Create Account'
                  )}
                </button>

                <div className="text-center pt-6 border-t border-slate-100 text-slate-500">
                  {activeTab === 'signin' ? (
                    <>Don't have an account? <button type="button" onClick={() => { setActiveTab('signup'); setError(''); }} className="text-[#0055A4] font-medium hover:underline">Sign up for free</button></>
                  ) : (
                    <>Already have an account? <button type="button" onClick={() => { setActiveTab('signin'); setError(''); }} className="text-[#0055A4] font-medium hover:underline">Sign in</button></>
                  )}
                </div>
              </form>

              {/* Demo Accounts */}
              <div className="mt-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h4 className="text-[#003366] font-semibold mb-4 text-center">Demo Accounts</h4>
                <div className="flex flex-col gap-3">
                  <div className="bg-white p-3 rounded-lg text-sm font-mono border border-slate-200 shadow-sm">
                    <strong className="font-sans text-slate-700">Super Admin:</strong><br/>
                    <span className="text-slate-600">nileshnaphade15@gmail.com</span><br/>
                    <span className="text-slate-500">Admin123#</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-sm font-mono border border-slate-200 shadow-sm">
                    <strong className="font-sans text-slate-700">Admin:</strong><br/>
                    <span className="text-slate-600">admin@montgomery-twin.local</span><br/>
                    <span className="text-slate-500">Admin123!</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-sm font-mono border border-slate-200 shadow-sm">
                    <strong className="font-sans text-slate-700">Business:</strong><br/>
                    <span className="text-slate-600">business@montgomery-twin.local</span><br/>
                    <span className="text-slate-500">Business123!</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-50 bg-black/30 backdrop-blur-md border-t border-white/10 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Montgomery Urban Digital Twin</h3>
              <p className="text-white/80 leading-relaxed mb-2">Empowering businesses with data-driven insights for workforce and economic growth in Montgomery, Alabama.</p>
              <p className="text-white/80">© 2024 City of Montgomery. All rights reserved.</p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">Home</a></li>
                <li><a href="#features" className="text-white/80 hover:text-[#FFD700] transition-colors">Features</a></li>
                <li><a href="#about" className="text-white/80 hover:text-[#FFD700] transition-colors">About</a></li>
                <li><a href="#contact" className="text-white/80 hover:text-[#FFD700] transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">Documentation</a></li>
                <li><a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">API Reference</a></li>
                <li><a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">Support</a></li>
                <li><a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">Twitter</a></li>
                <li><a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">GitHub</a></li>
                <li><a href="#" className="text-white/80 hover:text-[#FFD700] transition-colors">Newsletter</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-white/60 text-sm">
            <p className="mb-2">© 2026 City of Montgomery, Alabama | Urban Digital Twin Platform</p>
            <p>Powered by Montgomery Open Data Initiative</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

