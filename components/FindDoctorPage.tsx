import React, { useState } from 'react';
import { getDoctorSpecialization } from '../services/geminiService';
import { SuggestionResponse, Doctor } from '../types';
import { MOCK_DOCTORS } from '../constants';
import { supabase } from '../services/supabaseClient';

interface FindDoctorPageProps {
  onBack: () => void;
}

const FindDoctorPage: React.FC<FindDoctorPageProps> = ({ onBack }) => {
  const [symptoms, setSymptoms] = useState('');
  const [userRegion, setUserRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestionResponse | null>(null);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchStatus, setSearchStatus] = useState<'specialist' | 'fallback' | 'empty' | null>(null);

  const performDoctorSearch = async (specialization: string, region: string) => {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .ilike('specialization', `%${specialization}%`)
      .or(`region.ilike.%${region}%,location.ilike.%${region}%`);
    
    if (error) return [];
    return data || [];
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRegion = userRegion.trim();
    const cleanSymptoms = symptoms.trim();
    
    if (!cleanSymptoms || !cleanRegion) return;

    setLoading(true);
    setSearchStatus(null);
    try {
      const res = await getDoctorSpecialization(cleanSymptoms);
      setSuggestion(res);
      
      let matches = await performDoctorSearch(res.specialization, cleanRegion);
      
      if (matches.length > 0) {
        setFilteredDoctors(matches);
        setSearchStatus('specialist');
      } else {
        matches = await performDoctorSearch('General Physician', cleanRegion);
        
        if (matches.length > 0) {
          setFilteredDoctors(matches);
          setSearchStatus('fallback');
        } else {
          const { data: anyDoc } = await supabase
            .from('doctors')
            .select('*')
            .or(`region.ilike.%${cleanRegion}%,location.ilike.%${cleanRegion}%`)
            .limit(3);
            
          if (anyDoc && anyDoc.length > 0) {
            setFilteredDoctors(anyDoc);
            setSearchStatus('fallback');
          } else {
            const mockMatches = MOCK_DOCTORS.filter(d => {
              const regionMatch = d.region.toLowerCase().includes(cleanRegion.toLowerCase());
              return d.specialization.includes(res.specialization) && regionMatch;
            });

            if (mockMatches.length > 0) {
              setFilteredDoctors(mockMatches);
              setSearchStatus('specialist');
            } else {
              const mockFallback = MOCK_DOCTORS.filter(d => 
                d.region.toLowerCase().includes(cleanRegion.toLowerCase()) && 
                d.specialization === 'General Physician'
              );
              setFilteredDoctors(mockFallback);
              setSearchStatus(mockFallback.length > 0 ? 'fallback' : 'empty');
            }
          }
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSymptoms('');
    setSuggestion(null);
    setFilteredDoctors([]);
    setSearchStatus(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 animate-in slide-in-from-bottom-6 duration-700">
      <button 
        onClick={onBack}
        className="mb-12 flex items-center text-slate-500 hover:text-emerald-500 font-black text-xs uppercase tracking-widest transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center mr-4 group-hover:bg-emerald-500/10 group-hover:border-emerald-500 transition-all">
          <i className="fas fa-chevron-left"></i>
        </div>
        Back to Dashboard
      </button>

      {!suggestion ? (
        <div className="bg-slate-900/60 rounded-[56px] p-10 md:p-16 shadow-2xl border border-white/5 backdrop-blur-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="text-center mb-16 relative z-10">
            <div className="bg-emerald-500/10 text-emerald-500 px-6 py-2 rounded-full inline-block border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Clinical Intelligence</div>
            <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">AI Health Navigator</h1>
            <p className="text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">Describe your physical discomfort or symptoms for a medically-vetted specialty mapping.</p>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-10 relative z-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] ml-2">1. Clinical Observation</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms in detail..."
                className="w-full h-48 p-8 rounded-[32px] bg-slate-950 border border-white/10 text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-lg resize-none placeholder:text-slate-700 shadow-inner"
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] ml-2">2. Geographic Node</label>
              <div className="relative">
                <i className="fas fa-map-marker-alt absolute left-8 top-1/2 -translate-y-1/2 text-emerald-500"></i>
                <input
                  type="text"
                  value={userRegion}
                  onChange={(e) => setUserRegion(e.target.value)}
                  placeholder="Region or City (e.g. Palghar)"
                  className="w-full pl-20 pr-8 py-6 rounded-3xl bg-slate-950 border border-white/10 text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-lg placeholder:text-slate-700 shadow-inner"
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || symptoms.length < 5 || !userRegion}
              className={`w-full py-6 rounded-3xl text-sm font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-2xl ${
                loading || symptoms.length < 5 || !userRegion
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5' 
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-[0.98] shadow-emerald-500/20'
              }`}
            >
              {loading ? (
                <>
                  <i className="fas fa-satellite-dish animate-spin mr-4"></i>
                  Processing Neural Map...
                </>
              ) : (
                <>
                  <i className="fas fa-brain mr-4"></i>
                  Generate Specialist Map
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
          <div className={`bg-slate-900/60 rounded-[56px] overflow-hidden shadow-2xl border-2 transition-all backdrop-blur-3xl ${
            suggestion.urgency === 'high' ? 'border-red-500/50 shadow-red-500/10' : 'border-emerald-500/20'
          }`}>
            <div className={`p-12 ${
              suggestion.urgency === 'high' ? 'bg-red-500/10' : suggestion.urgency === 'medium' ? 'bg-amber-500/10' : 'bg-emerald-500/10'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] ${
                      suggestion.urgency === 'high' ? 'bg-red-500 text-white animate-pulse' : suggestion.urgency === 'medium' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                    }`}>
                      {suggestion.urgency === 'high' ? <i className="fas fa-exclamation-circle mr-2"></i> : ''} Priority: {suggestion.urgency}
                    </span>
                    <span className="bg-slate-950 text-slate-400 border border-white/5 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                      <i className="fas fa-map-marker-alt mr-2 text-emerald-500"></i> {userRegion}
                    </span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                    Consult a <span className="text-emerald-500 underline decoration-emerald-500/20 underline-offset-8">{suggestion.specialization}</span>
                  </h2>
                  <p className="text-slate-400 text-xl leading-relaxed max-w-3xl font-medium">{suggestion.reason}</p>
                </div>
                <div className="flex-shrink-0">
                   <button 
                    onClick={reset}
                    className="bg-white/5 text-white px-8 py-4 rounded-2xl border border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all shadow-xl active:scale-95"
                  >
                    Reset Analysis
                  </button>
                </div>
              </div>
            </div>

            {suggestion.redFlags.length > 0 && (
              <div className="p-12 border-t border-white/5 bg-slate-950/40">
                <h3 className="font-black text-red-400 mb-6 flex items-center text-[10px] uppercase tracking-[0.4em]">
                  <i className="fas fa-biohazard mr-3 text-red-500"></i> 
                  CRITICAL SYMPTOMS ARCHIVE
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {suggestion.redFlags.map((flag, i) => (
                    <div key={i} className="flex items-center space-x-4 bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50 flex-shrink-0"></div>
                      <span className="text-sm font-black text-red-100/70 tracking-tight uppercase tracking-widest text-[10px]">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {searchStatus === 'fallback' && (
              <div className="p-8 bg-amber-500/5 border-l-4 border-amber-500 text-amber-200/80 rounded-r-[32px] animate-in slide-in-from-left-6 backdrop-blur-xl">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle mt-1 mr-4 text-amber-500 text-lg"></i>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-widest mb-1">Target Specialist Offline in {userRegion}</h4>
                    <p className="text-xs font-medium leading-relaxed opacity-70">
                      No verified {suggestion.specialization} nodes detected. Displaying **General Physician** alternates for clinical triage.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-8 px-4">
              <h3 className="text-3xl font-black text-white tracking-tighter">
                {searchStatus === 'fallback' ? 'Recommended Medical Nodes' : `Verified ${suggestion.specialization}s`}
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {filteredDoctors.map(doc => (
                <div key={doc.id} className={`bg-slate-900/60 p-10 rounded-[48px] border transition-all shadow-xl group hover:shadow-emerald-500/5 relative overflow-hidden ${
                  searchStatus === 'fallback' ? 'border-amber-500/20' : 'border-white/5 hover:border-emerald-500'
                }`}>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px]"></div>
                  <div className="relative z-10 flex justify-between items-start mb-8">
                    <div>
                      <h4 className="font-black text-white text-2xl group-hover:text-emerald-500 transition-colors tracking-tight">{doc.name}</h4>
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
                        {doc.specialization}
                      </p>
                    </div>
                    <div className="bg-slate-950 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black border border-white/5 uppercase tracking-widest shadow-inner">
                      {doc.experience}
                    </div>
                  </div>
                  
                  <div className="relative z-10 space-y-4 mb-8">
                    <div className="flex items-start text-sm text-slate-400 font-medium">
                      <i className="fas fa-clinic-medical mt-1 mr-4 text-emerald-500/50 w-4"></i>
                      <span className="leading-snug">{doc.clinic}</span>
                    </div>
                    <div className="flex items-start text-sm text-slate-400 font-medium">
                      <i className="fas fa-map-marker-alt mt-1 mr-4 text-emerald-500/50 w-4"></i>
                      <span className="leading-snug">{doc.location}</span>
                    </div>
                    <div className="flex items-start text-sm text-slate-400 font-medium">
                      <i className="fas fa-clock mt-1 mr-4 text-emerald-500/50 w-4"></i>
                      <span>{doc.timing || 'Mon-Sat: 10 AM - 6 PM'}</span>
                    </div>
                  </div>

                  <div className="relative z-10 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div>
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Direct Registry Node</p>
                       <p className="text-xl font-black text-white tracking-tight leading-none">{doc.phone}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                      <i className="fas fa-id-card text-lg"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {searchStatus === 'empty' && (
              <div className="bg-slate-900/60 p-24 rounded-[64px] text-center border-2 border-dashed border-white/5 backdrop-blur-3xl">
                <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-red-500/10 border border-red-500/20">
                  <i className="fas fa-radiation text-4xl"></i>
                </div>
                <h4 className="font-black text-white text-3xl mb-4 tracking-tighter">Zero Nodes Found</h4>
                <p className="text-slate-500 font-medium max-w-sm mx-auto mb-12 text-lg leading-relaxed">
                  The clinical registry for "{userRegion}" is empty. Proceed to the nearest public health facility immediately for emergency triage.
                </p>
                <button 
                  onClick={() => {
                    setSuggestion(null);
                    setFilteredDoctors([]);
                  }}
                  className="bg-emerald-500 text-slate-950 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-400 shadow-2xl shadow-emerald-500/20 transition-all active:scale-95"
                >
                  Query Alternative Region
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FindDoctorPage;