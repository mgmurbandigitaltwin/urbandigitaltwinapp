import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Check, X, User, MapPin, Phone, Mail, ShieldAlert, Loader2 } from 'lucide-react';

export default function ApprovalsPanel() {
  const [pendingAdmins, setPendingAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    let fetched: any[] = [];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .eq('status', 'pending');
      
      if (data) {
        fetched = data;
      }
    } catch (err) {
      console.warn("Failed to fetch profiles from Supabase, using local storage");
    }

    // Fallback to local storage
    const localProfiles = JSON.parse(localStorage.getItem('demo_profiles') || '[]');
    const localPending = localProfiles.filter((p: any) => p.role === 'admin' && p.status === 'pending');

    // Merge avoiding duplicates by email
    const combined = [...fetched];
    localPending.forEach((lp: any) => {
      if (!combined.find(c => c.email === lp.email)) combined.push(lp);
    });

    setPendingAdmins(combined);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', id);
    } catch (err) {
      console.warn("Error approving user in Supabase:", err);
    }

    // Update local storage
    const localProfiles = JSON.parse(localStorage.getItem('demo_profiles') || '[]');
    const updated = localProfiles.map((p: any) => p.id === id || p.email === id ? { ...p, status: 'active' } : p);
    localStorage.setItem('demo_profiles', JSON.stringify(updated));

    setPendingAdmins(prev => prev.filter(admin => admin.id !== id && admin.email !== id));
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('id', id);
    } catch (err) {
      console.warn("Error rejecting user in Supabase:", err);
    }

    // Update local storage
    const localProfiles = JSON.parse(localStorage.getItem('demo_profiles') || '[]');
    const updated = localProfiles.map((p: any) => p.id === id || p.email === id ? { ...p, status: 'rejected' } : p);
    localStorage.setItem('demo_profiles', JSON.stringify(updated));

    setPendingAdmins(prev => prev.filter(admin => admin.id !== id && admin.email !== id));
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center text-[#0055A4] shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          Pending Admin Approvals
        </h2>
        <p className="text-slate-500 mt-1">Review and approve new administrator accounts.</p>
      </div>

      {pendingAdmins.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">All caught up!</h3>
          <p className="text-slate-500">There are no pending admin requests to review.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingAdmins.map((admin) => (
            <div key={admin.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#FFD700] text-[#0055A4] rounded-full flex items-center justify-center shrink-0 font-bold text-lg">
                  {admin.first_name?.charAt(0) || admin.email?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {admin.first_name} {admin.last_name}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-slate-500 gap-2">
                      <Mail className="w-4 h-4" /> {admin.email}
                    </div>
                    <div className="flex items-center text-sm text-slate-500 gap-2">
                      <Phone className="w-4 h-4" /> {admin.phone || 'N/A'}
                    </div>
                    <div className="flex items-center text-sm text-slate-500 gap-2">
                      <MapPin className="w-4 h-4" /> {admin.city || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 md:flex-col lg:flex-row shrink-0">
                <button
                  onClick={() => handleReject(admin.id)}
                  disabled={actionLoading === admin.id}
                  className="flex-1 lg:flex-none px-4 py-2 rounded-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => handleApprove(admin.id)}
                  disabled={actionLoading === admin.id}
                  className="flex-1 lg:flex-none px-4 py-2 rounded-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {actionLoading === admin.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
