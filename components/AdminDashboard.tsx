import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { DoctorApplication } from '../types';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [applications, setApplications] = useState<DoctorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [view, setView] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setApplications(data || []);
    } catch (err: any) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app: DoctorApplication) => {
    if (!confirm(`Verify and activate ${app.full_name}'s profile?`)) return;
    
    setProcessingId(app.id);
    
    const originalApps = [...applications];
    setApplications(prev => prev.map(item => 
      item.id === app.id ? { ...item, status: 'approved' } : item
    ));

    try {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', app.id);

      if (updateError) throw updateError;

      const doctorData = {
        name: app.full_name,
        specialization: app.specialization,
        experience: app.experience,
        region: app.region, 
        location: app.region, 
        clinic: 'AarogyaAI Verified Clinic',
        phone: app.phone,
        timing: app.timing || 'Mon-Sat: 10 AM - 7 PM',
        fees: '₹500',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        rating: '4.8'
      };
      
      const { error: docError } = await supabase
        .from('doctors')
        .insert([doctorData]);

      if (docError) throw docError;

      alert("Doctor approved! Their profile is now live for patients.");
    } catch (err: any) {
      console.error("Approve Error:", err);
      alert("Database error: " + err.message);
      setApplications(originalApps);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this doctor? They will be removed from your review list.")) return;
    
    setProcessingId(id);
    const originalApps = [...applications];
    setApplications(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'rejected' } : item
    ));

    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      alert("Application rejected and moved to archive.");
    } catch (err: any) {
      console.error("Reject Error:", err);
      alert("Rejection failed: " + err.message);
      setApplications(originalApps);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application record forever?")) return;
    
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setApplications(prev => prev.filter(item => item.id !== id));
      alert("Record deleted.");
    } catch (err: any) {
      console.error("Delete Error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingApps = applications.filter(a => a.status === 'pending');
  const historyApps = applications.filter(a => a.status !== 'pending');
  const displayApps = view === 'pending' ? pendingApps : historyApps;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
        <div>
          <div className="flex items-center space-x-4 mb-3">
            <div className="bg-emerald-500 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
              <i className="fas fa-user-shield text-slate-950 text-2xl"></i>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Medical Board Review</h1>
          </div>
          <p className="text-slate-500 text-sm font-black uppercase tracking-[0.2em] ml-1">Validate credentials and manage doctor applications.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="bg-slate-900 p-1.5 rounded-2xl flex border border-white/5">
            <button 
              onClick={() => setView('pending')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'pending' ? 'bg-emerald-500 text-slate-950 shadow-xl' : 'text-slate-500 hover:text-emerald-500'}`}
            >
              New Requests ({pendingApps.length})
            </button>
            <button 
              onClick={() => setView('history')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'history' ? 'bg-emerald-500 text-slate-950 shadow-xl' : 'text-slate-500 hover:text-emerald-500'}`}
            >
              Archive ({historyApps.length})
            </button>
          </div>
          <button 
            onClick={onBack} 
            className="bg-white/5 text-white border border-white/10 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all shadow-xl active:scale-95"
          >
            Exit Terminal
          </button>
        </div>
      </div>

      <div className="bg-slate-900/40 rounded-[64px] border border-white/5 shadow-2xl overflow-hidden min-h-[600px] backdrop-blur-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40">
                <th className="px-12 py-10 text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em] border-b border-white/5">Practitioner Domain</th>
                <th className="px-12 py-10 text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em] border-b border-white/5">Verification Node</th>
                <th className="px-12 py-10 text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em] border-b border-white/5">Expertise</th>
                <th className="px-12 py-10 text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em] border-b border-white/5 text-right">Decision Engine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayApps.map(app => (
                <tr key={app.id} className="hover:bg-emerald-500/5 transition-colors animate-in slide-in-from-left-4">
                  <td className="px-12 py-10">
                    <p className="font-black text-white text-xl mb-1 tracking-tight">{app.full_name}</p>
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em]">{app.specialization}</p>
                    <div className="flex items-center mt-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <i className="fas fa-map-marker-alt mr-2 text-emerald-500"></i>
                      {app.region}
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <p className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 inline-block px-4 py-1.5 rounded-lg border border-emerald-500/20 mb-3 tracking-widest uppercase">
                      {app.registration_no}
                    </p>
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs text-slate-400 font-bold">{app.email}</p>
                      <p className="text-xs text-slate-400 font-bold">{app.phone}</p>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <div className="inline-flex items-center px-5 py-2.5 bg-slate-950 text-white rounded-2xl border border-white/5 shadow-inner">
                      <i className="fas fa-award mr-3 text-emerald-500 text-xs"></i>
                      <p className="text-xs font-black uppercase tracking-widest">{app.experience || '0+ Years'}</p>
                    </div>
                  </td>
                  <td className="px-12 py-10 text-right">
                    {app.status === 'pending' ? (
                      <div className="flex justify-end space-x-4">
                        <button 
                          onClick={() => handleApprove(app)}
                          disabled={!!processingId}
                          className="bg-emerald-500 text-slate-950 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-2xl shadow-emerald-500/10 active:scale-95"
                        >
                          {processingId === app.id ? (
                            <i className="fas fa-satellite-dish animate-spin"></i>
                          ) : (
                            'Verify & Activate'
                          )}
                        </button>
                        <button 
                          onClick={() => handleReject(app.id)}
                          disabled={!!processingId}
                          className="bg-transparent text-red-500 border border-red-500/20 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all active:scale-95"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end space-x-5">
                        <span className={`inline-flex items-center px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-inner ${
                          app.status === 'approved' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          <i className={`fas ${app.status === 'approved' ? 'fa-check-circle' : 'fa-times-circle'} mr-3`}></i>
                          {app.status === 'approved' ? 'Active node' : 'Purged'}
                        </span>
                        <button 
                          onClick={() => handleDelete(app.id)}
                          className="text-slate-700 hover:text-red-500 transition-colors p-3"
                          title="Erase Entry"
                        >
                          <i className="fas fa-trash-alt text-base"></i>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="p-48 text-center">
              <div className="relative inline-block mb-10">
                <div className="w-20 h-20 border-4 border-white/5 border-t-emerald-500 rounded-full animate-spin"></div>
                <i className="fas fa-shield-alt absolute inset-0 flex items-center justify-center text-emerald-500/20 text-2xl"></i>
              </div>
              <p className="text-slate-500 font-black tracking-[0.4em] text-[10px] uppercase animate-pulse">Establishing Secure Uplink...</p>
            </div>
          )}
          
          {!loading && displayApps.length === 0 && (
            <div className="p-48 text-center">
              <div className="w-28 h-28 bg-slate-950 rounded-[48px] flex items-center justify-center mx-auto mb-10 border-2 border-dashed border-white/5 shadow-2xl">
                <i className="fas fa-clipboard-check text-slate-800 text-5xl"></i>
              </div>
              <h3 className="text-white font-black text-3xl mb-4 tracking-tighter">Queue Synchronized</h3>
              <p className="text-slate-500 text-lg max-w-sm mx-auto mb-12 font-medium leading-relaxed">No medical board actions required at this timestamp.</p>
              {view === 'pending' && historyApps.length > 0 && (
                <button 
                  onClick={() => setView('history')}
                  className="bg-emerald-500 text-slate-950 px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20"
                >
                  Access Archival Registry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-16 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-700 font-black uppercase tracking-[0.4em] px-8">
        <div className="flex items-center space-x-12">
          <span className="flex items-center"><i className="fas fa-lock mr-3 text-emerald-500"></i> Quantum Encrypted</span>
          <span className="flex items-center"><i className="fas fa-database mr-3 text-emerald-500"></i> Cloud Registry Live</span>
        </div>
        <p>AarogyaAI Medical OS v4.1 - Terminal Access Restricted</p>
      </div>
    </div>
  );
};

export default AdminDashboard;