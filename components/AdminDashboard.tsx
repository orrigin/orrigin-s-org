
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { DoctorApplication, Doctor } from '../types';

interface AdminDashboardProps {
  onBack: () => void;
}

interface BroadcastMessage {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [applications, setApplications] = useState<DoctorApplication[]>([]);
  const [liveDoctors, setLiveDoctors] = useState<Doctor[]>([]);
  const [broadcastMessages, setBroadcastMessages] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [view, setView] = useState<'pending' | 'history' | 'manual' | 'registry' | 'messages'>('pending');
  const [confirmDelete, setConfirmDelete] = useState<{id: string, name: string} | null>(null);
  
  const [manualDoc, setManualDoc] = useState({
    name: '', specialization: 'General Physician', experience: '', region: '', 
    location: '', clinic: '', phone: '', timing: '10:00 AM - 07:00 PM', fees: '₹500'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, docsRes, msgsRes] = await Promise.all([
        supabase.from('applications').select('*').order('created_at', { ascending: false }),
        supabase.from('doctors').select('*').order('name', { ascending: true }),
        supabase.from('broadcast_messages').select('*').order('created_at', { ascending: false })
      ]);

      if (appsRes.error) throw appsRes.error;
      if (docsRes.error) throw docsRes.error;
      if (msgsRes.error) throw msgsRes.error;

      setApplications(appsRes.data || []);
      setLiveDoctors(docsRes.data || []);
      setBroadcastMessages(msgsRes.data || []);
    } catch (err: any) {
      console.error("Sync Failure:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app: DoctorApplication) => {
    setProcessingId(app.id);
    try {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('id', app.id);
      
      if (updateError) throw updateError;

      const doctorData = { 
        name: app.full_name, 
        specialization: app.specialization, 
        experience: app.experience, 
        region: app.region, 
        location: app.region, 
        clinic: 'Verified Clinical Hub', 
        phone: app.phone, 
        timing: app.timing || '10:00 AM - 07:00 PM', 
        fees: '₹500'
      };
      
      const { error: insertError } = await supabase.from('doctors').insert([doctorData]);
      if (insertError) throw insertError;
      
      await fetchData();
      setView('registry');
    } catch (err: any) {
      console.error("Verification Rejected:", err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('doctors').insert([manualDoc]);
      if (error) throw error;
      setManualDoc({ name: '', specialization: 'General Physician', experience: '', region: '', location: '', clinic: '', phone: '', timing: '10:00 AM - 07:00 PM', fees: '₹500' });
      await fetchData();
      setView('registry');
    } catch (err: any) {
      console.error("Injection Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeDeletion = async () => {
    if (!confirmDelete) return;
    const { id } = confirmDelete;
    setConfirmDelete(null);
    setProcessingId(id);
    
    try {
      const { error } = await supabase.from('doctors').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      console.error("Decommission Error:", err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingApps = applications.filter(a => a.status === 'pending');
  const historyApps = applications.filter(a => a.status !== 'pending');

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Processing data flux...</p>
        </div>
      );
    }

    if (view === 'manual') {
      return (
        <div className="p-8 lg:p-12 max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter uppercase">Manual Node Injection</h2>
          <form onSubmit={handleManualSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Doctor Name</label>
                <input required type="text" value={manualDoc.name} onChange={e => setManualDoc({...manualDoc, name: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-white font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Specialization</label>
                <input required type="text" value={manualDoc.specialization} onChange={e => setManualDoc({...manualDoc, specialization: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-white font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Experience</label>
                <input required type="text" value={manualDoc.experience} onChange={e => setManualDoc({...manualDoc, experience: e.target.value})} placeholder="e.g. 15 Years" className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-white font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Region</label>
                <input required type="text" value={manualDoc.region} onChange={e => setManualDoc({...manualDoc, region: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-white font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Phone</label>
                <input required type="text" value={manualDoc.phone} onChange={e => setManualDoc({...manualDoc, phone: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-white font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Consultation Fee</label>
                <input required type="text" value={manualDoc.fees} onChange={e => setManualDoc({...manualDoc, fees: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-white font-bold" />
              </div>
            </div>
            <button type="submit" className="w-full py-4 bg-emerald-500 text-white dark:text-slate-950 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-emerald-400 shadow-xl shadow-emerald-500/10">Activate Registry Node</button>
            <button type="button" onClick={() => setView('registry')} className="w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 dark:hover:bg-white/10">Cancel</button>
          </form>
        </div>
      );
    }

    if (view === 'messages') {
      return (
        <div className="p-8 lg:p-12 space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter uppercase">Citizen Broadcasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {broadcastMessages.map(msg => (
              <div key={msg.id} className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{msg.name}</p>
                  <p className="text-[9px] text-slate-500 font-mono">{new Date(msg.created_at).toLocaleString()}</p>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{msg.message}</p>
              </div>
            ))}
          </div>
          {broadcastMessages.length === 0 && <p className="text-center py-20 text-slate-500 font-black uppercase tracking-widest text-[10px]">No messages broadcasted.</p>}
        </div>
      );
    }

    if (view === 'registry') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-white/5">
                <th className="px-8 py-6 text-[9px] font-black uppercase text-emerald-600 tracking-widest">Live registry Node</th>
                <th className="px-8 py-6 text-[9px] font-black uppercase text-emerald-600 tracking-widest">Location</th>
                <th className="px-8 py-6 text-[9px] font-black uppercase text-emerald-600 tracking-widest text-right">Maintenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {liveDoctors.map(doc => (
                <tr key={doc.id} className="hover:bg-emerald-500/5 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-900 dark:text-white text-base tracking-tight mb-1">{doc.name}</p>
                    <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">{doc.specialization}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">{doc.region}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => setConfirmDelete({ id: doc.id, name: doc.name })} className="bg-red-500/10 text-red-500 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Decommission</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {liveDoctors.length === 0 && <p className="text-center py-20 text-slate-500 font-black uppercase tracking-widest text-[10px]">Registry is empty.</p>}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-white/5">
              <th className="px-8 py-6 text-[9px] font-black uppercase text-emerald-600 tracking-widest">Medical Identity</th>
              <th className="px-8 py-6 text-[9px] font-black uppercase text-emerald-600 tracking-widest">Experience</th>
              <th className="px-8 py-6 text-[9px] font-black uppercase text-emerald-600 tracking-widest text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {(view === 'pending' ? pendingApps : historyApps).map(app => (
              <tr key={app.id} className="hover:bg-emerald-500/5 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-black text-slate-900 dark:text-white text-base mb-1">{app.full_name}</p>
                  <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">{app.specialization}</p>
                </td>
                <td className="px-8 py-6">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">{app.experience}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  {app.status === 'pending' ? (
                    <button 
                      onClick={() => handleApprove(app)} 
                      disabled={processingId === app.id}
                      className="bg-emerald-500 text-white dark:text-slate-950 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg disabled:opacity-50"
                    >
                      {processingId === app.id ? <i className="fas fa-circle-notch animate-spin"></i> : "Verify Node"}
                    </button>
                  ) : (
                    <span className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase border ${app.status === 'accepted' ? 'text-emerald-600 border-emerald-500/20 bg-emerald-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>{app.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(view === 'pending' ? pendingApps : historyApps).length === 0 && (
          <p className="text-center py-20 text-slate-500 font-black uppercase tracking-widest text-[10px]">No applications found.</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16 animate-in fade-in duration-700 relative">
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in zoom-in-95">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] p-10 border border-slate-200 dark:border-white/10 shadow-2xl text-center">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-3xl border border-red-500/20 animate-pulse">
              <i className="fas fa-radiation"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">Purge Confirmation</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 leading-relaxed uppercase text-[10px] tracking-widest">
              Permanently decommission <span className="text-red-500 underline decoration-red-500/20 underline-offset-4">{confirmDelete.name}</span>?
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={executeDeletion} className="w-full py-5 bg-red-500 text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-red-400 transition-all shadow-xl shadow-red-500/20">Execute Purge</button>
              <button onClick={() => setConfirmDelete(null)} className="w-full py-5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 dark:hover:bg-white/10 transition-all">Abort Protocol</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start mb-8 lg:mb-12 gap-6 lg:gap-8">
        <div>
          <div className="flex items-center space-x-4 mb-3">
            <div className="bg-emerald-500 w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
              <i className="fas fa-user-shield text-white dark:text-slate-950 text-xl lg:text-2xl"></i>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Clinical Terminal</h1>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            Registry Governance v3.4.2
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-end gap-3 lg:gap-4 w-full lg:w-auto">
          <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl flex border border-slate-200 dark:border-white/5 shadow-sm overflow-x-auto hide-scrollbar w-full sm:w-auto">
            <button onClick={() => setView('pending')} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'pending' ? 'bg-emerald-500 text-white dark:text-slate-950 shadow-lg' : 'text-slate-400'}`}>Pending ({pendingApps.length})</button>
            <button onClick={() => setView('registry')} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'registry' ? 'bg-emerald-500 text-white dark:text-slate-950 shadow-lg' : 'text-slate-400'}`}>Registry ({liveDoctors.length})</button>
            <button onClick={() => setView('messages')} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'messages' ? 'bg-emerald-500 text-white dark:text-slate-950 shadow-lg' : 'text-slate-400'}`}>Messages ({broadcastMessages.length})</button>
            <button onClick={() => setView('history')} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'history' ? 'bg-emerald-500 text-white dark:text-slate-950 shadow-lg' : 'text-slate-400'}`}>Logbook</button>
          </div>
          <button 
            onClick={() => setView('manual')} 
            className={`bg-white dark:bg-white/5 text-slate-600 dark:text-white border border-slate-200 dark:border-white/10 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-emerald-500 transition-all ${view === 'manual' ? 'border-emerald-500 text-emerald-500' : ''}`}
          >
            <i className="fas fa-plus mr-2"></i> Inject Node
          </button>
          <button onClick={onBack} className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 transition-all">Disconnect</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/40 rounded-[32px] md:rounded-[48px] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden backdrop-blur-3xl min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
