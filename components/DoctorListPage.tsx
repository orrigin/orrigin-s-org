
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Doctor } from '../types';
import { MOCK_DOCTORS } from '../constants';

interface DoctorListPageProps {
  onBack: () => void;
}

const DoctorListPage: React.FC<DoctorListPageProps> = ({ onBack }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionTerm, setRegionTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const specializations = ['All', 'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedic', 'Neurologist', 'ENT Specialist', 'Physiotherapist'];

  useEffect(() => {
    fetchDoctors();
  }, [searchTerm, regionTerm, activeFilter]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let query = supabase.from('doctors').select('*');

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%`);
      }
      
      if (regionTerm) {
        query = query.or(`region.ilike.%${regionTerm}%,location.ilike.%${regionTerm}%`);
      }

      if (activeFilter !== 'All') {
        query = query.eq('specialization', activeFilter);
      }

      const { data: dbData, error } = await query;
      if (error) throw error;
      
      let filteredMock = MOCK_DOCTORS.filter(doc => {
        const matchesSearch = !searchTerm || 
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRegion = !regionTerm || 
          doc.region.toLowerCase().includes(regionTerm.toLowerCase()) || 
          doc.location.toLowerCase().includes(regionTerm.toLowerCase());
        
        const matchesSpec = activeFilter === 'All' || doc.specialization === activeFilter;
        
        return matchesSearch && matchesRegion && matchesSpec;
      });

      const combined = [...(dbData || [])];
      
      filteredMock.forEach(mockDoc => {
        if (!combined.some(dbDoc => dbDoc.name.toLowerCase() === mockDoc.name.toLowerCase())) {
          combined.push(mockDoc);
        }
      });

      // Sort by experience: numerical extraction from string "X Years"
      const sortedByExperience = combined.sort((a, b) => {
        const expA = parseInt(a.experience) || 0;
        const expB = parseInt(b.experience) || 0;
        return expB - expA; // Descending
      });

      setDoctors(sortedByExperience);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      const filteredMock = MOCK_DOCTORS.filter(d => 
        (activeFilter === 'All' || d.specialization === activeFilter) &&
        (!regionTerm || d.region.toLowerCase().includes(regionTerm.toLowerCase()))
      );
      
      const sortedMock = filteredMock.sort((a, b) => {
        const expA = parseInt(a.experience) || 0;
        const expB = parseInt(b.experience) || 0;
        return expB - expA;
      });

      setDoctors(sortedMock);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in duration-700 overflow-x-hidden">
      <button onClick={onBack} className="mb-12 text-slate-500 hover:text-emerald-500 font-black text-xs uppercase tracking-widest flex items-center transition-all group">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center mr-4 group-hover:bg-emerald-500/10 group-hover:border-emerald-500 transition-all">
          <i className="fas fa-chevron-left"></i>
        </div>
        Back to Home
      </button>

      <div className="mb-20">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">Find Your Doctor</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mb-12 text-base sm:text-lg">Look through our list of verified and trusted doctors available in your area. Experts with the highest experience are shown first.</p>
        
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">Search by Name or Type</label>
              <div className="relative">
                <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder="Doctor name or specialty..."
                  className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-[28px] text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner font-bold placeholder:text-slate-400 dark:placeholder:text-slate-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">Your Location</label>
              <div className="relative">
                <i className="fas fa-map-marker-alt absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500"></i>
                <input 
                  type="text" 
                  placeholder="Region, City (e.g. Palghar)"
                  className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-[28px] text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner font-bold placeholder:text-slate-400 dark:placeholder:text-slate-700"
                  value={regionTerm}
                  onChange={(e) => setRegionTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
             <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2 block">Filter by Specialization</label>
             <div className="relative">
               {/* Fixed alignment for mobile scroll container */}
               <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex overflow-x-auto gap-3 items-center hide-scrollbar pb-2">
                {specializations.map(spec => (
                  <button
                    key={spec}
                    onClick={() => setActiveFilter(spec)}
                    className={`px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                      activeFilter === spec 
                        ? 'bg-emerald-500 text-white dark:text-slate-950 border-emerald-500 shadow-xl shadow-emerald-500/20' 
                        : 'bg-white dark:bg-slate-900/80 text-slate-500 border-slate-200 dark:border-white/5 hover:border-emerald-500/30 hover:text-emerald-500'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
             </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-48 text-center">
          <div className="inline-block relative">
            <div className="w-20 h-20 border-4 border-slate-200 dark:border-white/5 border-t-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-satellite text-emerald-500/20 text-2xl"></i>
            </div>
          </div>
          <p className="mt-10 text-slate-500 dark:text-slate-600 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Loading Doctor List...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {doctors.map((doc) => (
            <div 
              key={doc.id} 
              onClick={() => setSelectedDoctor(doc)}
              className="bg-white dark:bg-slate-900/60 p-8 sm:p-10 rounded-[40px] sm:rounded-[56px] border border-slate-200 dark:border-white/5 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all cursor-pointer group flex flex-col h-full relative backdrop-blur-3xl overflow-hidden"
            >
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] group-hover:bg-emerald-500/10 transition-colors"></div>
              
              <div className="mb-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">{doc.specialization}</span>
                  {doc.rating && (
                    <span className="flex items-center text-emerald-600 dark:text-emerald-400 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl text-[10px] font-black border border-slate-200 dark:border-white/5 shadow-inner">
                      <i className="fas fa-star mr-2 text-emerald-500 text-[8px]"></i> {doc.rating}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors leading-tight tracking-tight">{doc.name}</h3>
                <p className="text-slate-500 text-xs font-bold mt-3 flex items-center">
                  <i className="fas fa-award mr-3 text-emerald-500"></i> {doc.experience} Experience
                </p>
              </div>
              
              <div className="flex-grow space-y-4 mb-10 relative z-10">
                <div className="flex items-start text-sm font-medium text-slate-600 dark:text-slate-400">
                  <i className="fas fa-map-marker-alt mt-1 mr-4 text-emerald-500 w-4"></i>
                  <span className="leading-snug">{doc.location}</span>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex justify-between items-center relative z-10">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">View Details</span>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-[18px] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-slate-950 group-hover:border-emerald-500 transition-all shadow-xl">
                  <i className="fas fa-chevron-right text-xs"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDoctor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] sm:rounded-[48px] overflow-hidden shadow-2xl animate-in zoom-in-95 border-4 border-slate-200 dark:border-white/5">
            <div className="bg-slate-50 dark:bg-slate-950 p-8 sm:p-10 text-slate-900 dark:text-white relative">
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-8 right-8 w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all text-xl border border-slate-200 dark:border-white/5"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                {selectedDoctor.specialization}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter leading-tight">{selectedDoctor.name}</h2>
              <div className="flex items-center space-x-4 mt-4 text-emerald-600 dark:text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                <span>{selectedDoctor.experience} Exp.</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <span className="text-slate-500 dark:text-white/60">Verified Doctor</span>
              </div>
            </div>
            
            <div className="p-8 sm:p-10 space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.3em]">Clinic Location</h4>
                  <div className="flex items-center">
                    <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 border border-emerald-500/10">
                      <i className="fas fa-clinic-medical text-xs"></i>
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-base leading-tight">{selectedDoctor.clinic}</p>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">{selectedDoctor.location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.3em]">Opening Times</h4>
                  <div className="flex items-center">
                    <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 border border-emerald-500/10">
                      <i className="fas fa-clock text-xs"></i>
                    </div>
                    <p className="font-bold text-slate-600 dark:text-slate-300 text-sm leading-snug">{selectedDoctor.timing || 'Mon-Sat: 10 AM - 6 PM'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.3em]">Phone Number</h4>
                  <div className="flex items-center">
                    <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 border border-emerald-500/10">
                      <i className="fas fa-phone-alt text-xs"></i>
                    </div>
                    <p className="font-black text-slate-900 dark:text-white text-xl tracking-tight leading-none">{selectedDoctor.phone || '9876543210'}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedDoctor(null)}
                className="w-full py-5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white dark:hover:text-slate-950 transition-all border border-slate-200 dark:border-white/10 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && doctors.length === 0 && (
        <div className="text-center py-32 sm:py-40 bg-white dark:bg-slate-900/40 rounded-[40px] sm:rounded-[80px] border-4 border-dashed border-slate-200 dark:border-white/5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-[32px] sm:rounded-[48px] flex items-center justify-center mx-auto mb-10 shadow-2xl">
            <i className="fas fa-search-minus text-slate-300 dark:text-slate-700 text-4xl sm:text-5xl"></i>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">No Doctors Found</h3>
          <p className="text-slate-500 font-medium mb-12 max-w-xs mx-auto text-base sm:text-lg leading-relaxed">We couldn't find any verified doctors matching your search in this area.</p>
          <button 
            onClick={() => {setSearchTerm(''); setRegionTerm(''); setActiveFilter('All');}}
            className="bg-emerald-500 text-white dark:text-slate-950 px-10 sm:px-12 py-4 sm:py-5 rounded-3xl font-black hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20 text-sm uppercase tracking-widest"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorListPage;
