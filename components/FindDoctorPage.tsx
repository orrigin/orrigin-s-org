
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

  const sortDoctorsByExperience = (docs: Doctor[]) => {
    return [...docs].sort((a, b) => {
      const expA = parseInt(a.experience) || 0;
      const expB = parseInt(b.experience) || 0;
      return expB - expA;
    });
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
        setFilteredDoctors(sortDoctorsByExperience(matches));
        setSearchStatus('specialist');
      } else {
        matches = await performDoctorSearch('General Physician', cleanRegion);
        
        if (matches.length > 0) {
          setFilteredDoctors(sortDoctorsByExperience(matches));
          setSearchStatus('fallback');
        } else {
          const { data: anyDoc } = await supabase
            .from('doctors')
            .select('*')
            .or(`region.ilike.%${cleanRegion}%,location.ilike.%${cleanRegion}%`)
            .limit(3);
            
          if (anyDoc && anyDoc.length > 0) {
            setFilteredDoctors(sortDoctorsByExperience(anyDoc));
            setSearchStatus('fallback');
          } else {
            const mockMatches = MOCK_DOCTORS.filter(d => {
              const regionMatch = d.region.toLowerCase().includes(cleanRegion.toLowerCase());
              return d.specialization.includes(res.specialization) && regionMatch;
            });

            if (mockMatches.length > 0) {
              setFilteredDoctors(sortDoctorsByExperience(mockMatches));
              setSearchStatus('specialist');
            } else {
              const mockFallback = MOCK_DOCTORS.filter(d => 
                d.region.toLowerCase().includes(cleanRegion.toLowerCase()) && 
                d.specialization === 'General Physician'
              );
              setFilteredDoctors(sortDoctorsByExperience(mockFallback));
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
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-16 animate-in slide-in-from-bottom-6 duration-700">
      <button 
        onClick={onBack}
        className="mb-8 lg:mb-12 flex items-center text-slate-500 hover:text-emerald-500 font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all group"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center mr-4 group-hover:bg-emerald-500/10 group-hover:border-emerald-500 transition-all">
          <i className="fas fa-chevron-left"></i>
        </div>
        Back to Dashboard
      </button>

      {!suggestion ? (
        <div className="bg-white dark:bg-slate-900/60 rounded-[32px] lg:rounded-[56px] p-8 lg:p-16 shadow-2xl border border-slate-200 dark:border-white/5 backdrop-blur-3xl relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="text-center mb-10 lg:mb-16 relative z-10">
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 px-6 py-2 rounded-full inline-block border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Clinical Intelligence</div>
            <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">AI Health Navigator</h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">Describe your physical discomfort or symptoms for a specialty mapping.</p>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-8 lg:space-y-10 relative z-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">1. Clinical Observation</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms (e.g., 'Persistent headache and blurry vision')..."
                className="w-full h-40 lg:h-48 p-6 lg:p-8 rounded-[24px] lg:rounded-[32px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-base lg:text-lg resize-none placeholder:text-slate-400 dark:placeholder:text-slate-700 shadow-inner"
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">2. Geographic Node</label>
              <div className="relative">
                <i className="fas fa-map-marker-alt absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 text-emerald-500"></i>
                <input
                  type="text"
                  value={userRegion}
                  onChange={(e) => setUserRegion(e.target.value)}
                  placeholder="Region or City (e.g. Palghar)"
                  className="w-full pl-16 lg:pl-20 pr-8 py-5 lg:py-6 rounded-2xl lg:rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-base lg:text-lg placeholder:text-slate-400 dark:placeholder:text-slate-700 shadow-inner"
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || symptoms.length < 5 || !userRegion}
              className={`w-full py-5 lg:py-6 rounded-2xl lg:rounded-3xl text-xs lg:text-sm font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-2xl ${
                loading || symptoms.length < 5 || !userRegion
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-white/5' 
                  : 'bg-emerald-500 text-white dark:text-slate-950 hover:bg-emerald-400 active:scale-[0.98] shadow-emerald-500/20'
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
        <div className="space-y-8 lg:space-y-10 animate-in fade-in zoom-in-95 duration-700">
          <div className={`bg-white dark:bg-slate-900/60 rounded-[32px] lg:rounded-[56px] overflow-hidden shadow-2xl border-2 transition-all backdrop-blur-3xl ${
            suggestion.urgency === 'high' ? 'border-red-500/50 shadow-red-500/10' : 'border-emerald-500/20'
          }`}>
            <div className={`p-8 lg:p-12 ${
              suggestion.urgency === 'high' ? 'bg-red-500/10' : suggestion.urgency === 'medium' ? 'bg-amber-500/10' : 'bg-emerald-500/10'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-start gap-8 lg:gap-10">
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] ${
                      suggestion.urgency === 'high' ? 'bg-red-500 text-white animate-pulse' : suggestion.urgency === 'medium' ? 'bg-amber-500 text-slate-900' : 'bg-emerald-500 text-white dark:text-slate-950'
                    }`}>
                      {suggestion.urgency === 'high' ? <i className="fas fa-exclamation-circle mr-2"></i> : ''} Priority: {suggestion.urgency}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                      <i className="fas fa-map-marker-alt mr-2 text-emerald-500"></i> {userRegion}
                    </span>
                  </div>
                  <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter leading-tight">
                    Consult a <span className="text-emerald-500 underline decoration-emerald-500/20 underline-offset-8">{suggestion.specialization}</span>
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-lg lg:text-xl leading-relaxed max-w-3xl font-medium">{suggestion.reason}</p>
                </div>
                <div className="shrink-0 w-full md:w-auto">
                   <button 
                    onClick={reset}
                    className="w-full md:w-auto bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white px-8 py-4 rounded-2xl border border-slate-200 dark:border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-md active:scale-95"
                  >
                    Reset Analysis
                  </button>
                </div>
              </div>
            </div>

            {suggestion.redFlags.length > 0 && (
              <div className="p-8 lg:p-12 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/40">
                <h3 className="font-black text-red-600 dark:text-red-400 mb-6 flex items-center text-[10px] uppercase tracking-[0.4em]">
                  <i className="fas fa-biohazard mr-3 text-red-500"></i> 
                  CRITICAL SYMPTOMS ARCHIVE
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {suggestion.redFlags.map((flag, i) => (
                    <div key={i} className="flex items-center space-x-4 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50 flex-shrink-0"></div>
                      <span className="text-[10px] font-black text-red-700 dark:text-red-100/70 tracking-widest uppercase">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {filteredDoctors.map(doc => (
              <div key={doc.id} className="bg-white dark:bg-slate-900/60 p-8 lg:p-10 rounded-3xl lg:rounded-[48px] border transition-all shadow-md dark:shadow-xl group hover:shadow-emerald-500/5 relative overflow-hidden border-slate-200 dark:border-white/5 hover:border-emerald-500">
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px]"></div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-xl lg:text-2xl group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors tracking-tight">{doc.name}</h4>
                    <p className="text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
                      {doc.specialization}
                    </p>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black border border-slate-200 dark:border-white/5 uppercase tracking-widest shadow-inner">
                    {doc.experience}
                  </div>
                </div>
                
                <div className="relative z-10 space-y-4 mb-8">
                  <div className="flex items-start text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <i className="fas fa-clinic-medical mt-1 mr-4 text-emerald-500/50 w-4"></i>
                    <span className="leading-snug">{doc.clinic}</span>
                  </div>
                  <div className="flex items-start text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <i className="fas fa-map-marker-alt mt-1 mr-4 text-emerald-500/50 w-4"></i>
                    <span className="leading-snug">{doc.location}</span>
                  </div>
                </div>

                <div className="relative z-10 pt-6 lg:pt-8 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest mb-1">Direct Registry Node</p>
                    <p className="text-lg lg:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{doc.phone}</p>
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-emerald-500 text-white dark:text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <i className="fas fa-id-card text-base lg:text-lg"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FindDoctorPage;
