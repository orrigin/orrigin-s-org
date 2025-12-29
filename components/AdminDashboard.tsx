
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { DoctorApplication, Doctor } from '../types';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [applications, setApplications] = useState<DoctorApplication[]>([]);
  const [liveDoctors, setLiveDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [view, setView] = useState<'pending' | 'history' | 'manual' | 'registry'>('pending');
  const [systemLogs, setSystemLogs] = useState<{msg: string, type: 'info' | 'error' | 'success'}[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{id: string, name: string} | null>(null);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  const [manualDoc, setManualDoc] = useState({
    name: '', specialization: 'General Physician', experience: '', region: '', 
    location: '', clinic: '', phone: '', timing: '10:00 AM - 07:00 PM', fees: '₹500'
  });

  const addLog = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
    setSystemLogs(prev => [...prev, { msg: `[${new Date().toLocaleTimeString()}] ${msg}`, type }].slice(-15));
  };

  // Auto-scroll terminal
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [systemLogs]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    addLog("SYNCHRONIZING RECOGNITION BUFFERS...", "info");
    try {
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data: docData, error: docError } = await supabase
        .from('doctors')
        .select('*')
        .order('name', { ascending: true });

      if (appError) throw appError;
      if (docError) throw docError;

      setApplications(appData || []);
      setLiveDoctors(docData || []);
      addLog(`GATEWAY ONLINE: ${docData?.length || 0} registry nodes active.`, "success");
    } catch (err: any) {
      addLog(`SYNC FAILURE: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app: DoctorApplication) => {
    setProcessingId(app.id);
    addLog(`INITIATING VERIFICATION: ${app.full_name}...`);
    try {
      // 1. Update Application Status
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('id', app.id);
      
      if (updateError) throw updateError;

      // 2. Prepare Doctor Record 
      // Note: 'clinic' column is missing in applications, using placeholder or region
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
      
      addLog(`NODE ACTIVATED: Dr. ${app.full_name} is now live.`, "success");
      await fetchData();
      setView('registry');
    } catch (err: any) {
      addLog(`VERIFICATION REJECTED: ${err.message}`, "error");
      console.error("Verification Error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    addLog("INJECTING MANUAL NODE...");
    try {
      const { error } = await supabase.from('doctors').insert([manualDoc]);
      if (error) throw error;
      addLog("MANUAL INJECTION COMPLETE.", "success");
      setManualDoc({ name: '', specialization: 'General Physician', experience: '', region: '', location: '', clinic: '', phone: '', timing: '10:00 AM - 07:00 PM', fees: '₹500' });
      await fetchData();
      setView('registry');
    } catch (err: any) {
      addLog(`INJECTION ERROR: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const executeDeletion = async () => {
    if (!confirmDelete) return;
    const { id, name } = confirmDelete;
    setConfirmDelete(null);
    setProcessingId(id);
    
    addLog(`EXECUTION COMMAND: Purge ID ${id}`, "info");

    try {
      const { error, status, statusText } = await supabase
        .from('doctors')
        .delete()
        .eq('id', id);

      if (error) {
        addLog(`DB ERROR: ${error.message} (Code: ${error.code})`, "error");
      } else {
        addLog(`DB SUCCESS: Row purged. Status ${status} (${statusText || 'OK'})`, "success");
        setLiveDoctors(prev => prev.filter(d => d.id !== id));
        setTimeout(() => fetchData(), 500);
      }
    } catch (err: any) {
      addLog(`CRITICAL SYSTEM ERROR: ${err.message}`, "error");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingApps = applications.filter(a => a.status === 'pending');
  const historyApps = applications.filter(a => a.status !== 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16 animate-in fade-in duration-700 relative">
      
      {/* 0. Custom Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in zoom-in-95">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] p-10 border border-slate-200 dark:border-white/10 shadow-2xl text-center">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-3xl border border-red-500/20 animate-pulse">
              <i className="fas fa-radiation"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">Purge Confirmation</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 leading-relaxed uppercase text-[10px] tracking-widest">
              Are you sure you want to permanently decommission <span className="text-red-500 underline decoration-red-500/20 underline-offset-4">{confirmDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={executeDeletion}
                className="w-full py-5 bg-red-500 text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-red-400 transition-all shadow-xl shadow-red-500/20"
              >
                Execute Purge
              </button>
              <button 
                onClick={() => setConfirmDelete(null)}
                className="w-full py-5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
              >
                Abort Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Header Section */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 justify-between items-start mb-8 lg:mb-12 gap-6 lg:gap-8">
        <div>
          <div className="flex items-center space-x-4 mb-3">
            <div className="bg-emerald-500 w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <i className="fas fa-user-shield text-white dark:text-slate-950 text-xl lg:text-2xl"></i>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Clinical Terminal</h1>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            Registry Governance v3.4.2
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-end gap-3 lg:gap-4 w-full">
          <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl flex border border-slate-200 dark:border-white/5 shadow-sm overflow-x-auto hide-scrollbar w-full sm:w-auto">
            <button onClick={() => setView('pending')} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'pending' ? 'bg-emerald-500 text-white dark:text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-emerald-500'}`}>Pending ({pendingApps.length})</button>
            <button onClick={() => setView('registry')} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'registry' ? 'bg-emerald-500 text-white dark:text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-emerald-500'}`}>Registry ({liveDoctors.length})</button>
            <button onClick={() => setView('history')} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'history' ? 'bg-emerald-500 text-white dark:text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-emerald-500'}`}>Logbook</button>
          </div>
          <button onClick={onBack} className="bg-white dark:bg-white/5 text-slate-600 dark:text-white border border-slate-200 dark:border-white/10 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all">Disconnect</button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar Log Terminal */}
        <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
          <div className="bg-slate-950 rounded-[32px] p-6 border border-white/5 shadow-2xl h-[400px] lg:h-[600px] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent animate-scan"></div>
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 flex items-center">
              <i className="fas fa-terminal mr-2 animate-pulse"></i> System Output
            </h3>
            <div className="flex-grow space-y-3 overflow-y-auto pr-2 custom-scrollbar font-mono">
              {systemLogs.map((log, i) => (
                <div key={i} className={`text-[10px] leading-relaxed break-words animate-in slide-in-from-left-2 duration-300 ${
                  log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  <span className="opacity-40 mr-1">></span> {log.msg}
                </div>
              ))}
              <div ref={logEndRef} />
              {systemLogs.length === 0 && <p className="text-slate-700 text-[10px] italic">Awaiting clinical input...</p>}
            </div>
          </div>
          
          <button 
            onClick={() => setView('manual')}
            className="w-full bg-emerald-500 text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 shadow-xl shadow-emerald-500/10 transition-all active:scale-95 flex items-center justify-center group"
          >
            <i className="fas fa-plus mr-3 group-hover:rotate-90 transition-transform"></i> Manual Node injection
          </button>
        </div>

        {/* Dynamic Viewport */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          {view === 'manual' ? (
            <div className="bg-white dark:bg-slate-900/40 rounded-[48px] border border-slate-200 dark:border-white/5 p-8 lg:p-12 shadow-2xl animate-in zoom-in-95 backdrop-blur-3xl">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tighter">Manual injection</h2>
              <form onSubmit={handleManualSubmit} className="grid md:grid-cols-2 gap-6">
                <input type="text" placeholder="Full Name" required className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none font-bold" value={manualDoc.name} onChange={e => setManualDoc({...manualDoc, name: e.target.value})} />
                <select className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none font-black uppercase text-[11px] tracking-widest" value={manualDoc.specialization} onChange={e => setManualDoc({...manualDoc, specialization: e.target.value})}>
                  <option>General Physician</option>
                  <option>Cardiologist</option>
                  <option>Dermatologist</option>
                  <option>Pediatrician</option>
                  <option>Orthopedic</option>
                  <option>Neurologist</option>
                  <option>ENT Specialist</option>
                  <option>Physiotherapist</option>
                </select>
                <input type="text" placeholder="Clinic/Hospital Name" required className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none font-bold" value={manualDoc.clinic} onChange={e => setManualDoc({...manualDoc, clinic: e.target.value})} />
                <input type="text" placeholder="Region (e.g. Palghar)" required className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none font-bold" value={manualDoc.region} onChange={e => setManualDoc({...manualDoc, region: e.target.value})} />
                <input type="text" placeholder="Phone Number" required className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none font-bold" value={manualDoc.phone} onChange={e => setManualDoc({...manualDoc, phone: e.target.value})} />
                <input type="text" placeholder="Experience (e.g. 10 Years)" required className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none font-bold" value={manualDoc.experience} onChange={e => setManualDoc({...manualDoc, experience: e.target.value})} />
                
                <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 mt-6">
                  <button type="submit" disabled={loading} className="flex-grow py-5 bg-emerald-500 text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-emerald-400 shadow-2xl transition-all">Confirm Injection</button>
                  <button type="button" onClick={() => setView('registry')} className="px-10 py-5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[11px]">Abort</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900/40 rounded-[32px] md:rounded-[48px] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden backdrop-blur-3xl min-h-[500px] relative">
              {loading && !processingId ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-950/50 z-20">
                  <div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Processing data flux...</p>
                </div>
              ) : view === 'registry' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-white/5">
                        <th className="px-8 py-6 text-[9px] font-black uppercase text-emerald-600 tracking-widest">Live registry Node</th>
                        <th className="px-8 py-6 text-[9px] font-black uppercase text-emerald-600 tracking-widest hidden md:table-cell">Coordinates</th>
                        <th className="px-8 py-6 text-[9px] font-black uppercase text-emerald-600 tracking-widest text-right">Maintenance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {liveDoctors.map(doc => (
                        <tr key={doc.id} className="hover:bg-emerald-500/5 transition-colors group">
                          <td className="px-8 py-6">
                            <p className="font-black text-slate-900 dark:text-white text-base tracking-tight mb-1">{doc.name}</p>
                            <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">{doc.specialization}</p>
                          </td>
                          <td className="px-8 py-6 hidden md:table-cell">
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{doc.clinic}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{doc.phone} • {doc.region}</p>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => {
                                addLog(`UI EVENT: Delete click for ${doc.name}`, "info");
                                setConfirmDelete({ id: doc.id, name: doc.name });
                              }}
                              disabled={processingId === doc.id}
                              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all inline-flex items-center shadow-sm ${
                                processingId === doc.id 
                                  ? 'bg-slate-200 text-slate-400' 
                                  : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white'
                              }`}
                            >
                              {processingId === doc.id ? (
                                <i className="fas fa-circle-notch animate-spin"></i>
                              ) : (
                                <><i className="fas fa-trash-alt mr-2"></i> Decommission</>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {liveDoctors.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-32 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">Registry empty. Local database offline or no nodes injected.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-white/5">
                        <th className="px-8 py-6 text-[9px] font-black uppercase text-emerald-600 tracking-widest">Medical Identity</th>
                        <th className="px-8 py-6 text-[9px] font-black uppercase text-emerald-600 tracking-widest text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {(view === 'pending' ? pendingApps : historyApps).map(app => (
                        <tr key={app.id} className="hover:bg-emerald-500/5 transition-colors">
                          <td className="px-8 py-6">
                            <p className="font-black text-slate-900 dark:text-white text-base tracking-tight mb-1">{app.full_name}</p>
                            <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">{app.specialization}</p>
                          </td>
                          <td className="px-8 py-6 text-right">
                            {app.status === 'pending' ? (
                              <button 
                                onClick={() => handleApprove(app)} 
                                disabled={!!processingId} 
                                className="bg-emerald-500 text-white dark:text-slate-950 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg"
                              >
                                {processingId === app.id ? <i className="fas fa-circle-notch animate-spin text-[9px]"></i> : "Verify Node"}
                              </button>
                            ) : (
                              <span className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border ${app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {app.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {(view === 'pending' ? pendingApps : historyApps).length === 0 && (
                        <tr>
                          <td colSpan={2} className="p-32 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">No packets in buffer.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
