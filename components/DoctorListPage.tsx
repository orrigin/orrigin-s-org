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
  const [regionTerm, setRegionTerm] = useState('Palghar');
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

      setDoctors(combined);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      const filteredMock = MOCK_DOCTORS.filter(d => 
        (activeFilter === 'All' || d.specialization === activeFilter) &&
        (!regionTerm || d.region.toLowerCase().includes(regionTerm.toLowerCase()))
      );
      setDoctors(filteredMock);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in duration-700">
      <button onClick={onBack} className="mb-12 text-slate-500 hover:text-emerald-500 font-black text-xs uppercase tracking-widest flex items-center transition-all group">
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center mr-4 group-hover:bg-emerald-500/10 group-hover:border-emerald-500 transition-all">
          <i className="fas fa-chevron-left"></i>
        </div>
        Back to Dashboard
      </button>

      <div className="mb-20">
        <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">Practitioner Registry</h1>
        <p className="text-slate-400 font-medium max-w-2xl mb-16 text-lg">Browse our medically-vetted network across high-growth Indian regions.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 items-end">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] ml-2">Search Specialty</label>
            <div className="relative">
              <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-500"></i>
              <input 
                type="text" 
                placeholder="Name or Specialization..."
                className="w-full pl-16 pr-8 py-5 bg-slate-900/60 border border-white/5 rounded-[28px] text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner font-bold placeholder:text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] ml-2">Locality</label>
            <div className="relative">
              <i className="fas fa-map-marker-alt absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500"></i>
              <input 
                type="text" 
                placeholder="Region, City..."
                className="w-full pl-16 pr-8 py-5 bg-slate-900/60 border border-white/5 rounded-[28px] text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner font-bold placeholder:text-slate-700"
                value={regionTerm}
                onChange={(e) => setRegionTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="relative pb-1">
             <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] ml-2 mb-6 block">Filter Mapping</label>
             <div className="flex overflow-x-auto gap-3 items-center hide-scrollbar pb-2">
              {specializations.map(spec => (
                <button
                  key={spec}
                  onClick={() => setActiveFilter(spec)}
                  className={`px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                    activeFilter === spec 
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-xl shadow-emerald-500/20' 
                      : 'bg-slate-900/80 text-slate-500 border-white/5 hover:border-emerald-500/30 hover:text-emerald-500'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-48 text-center">
          <div className="inline-block relative">
            <div className="w-20 h-20 border-4 border-white/5 border-t-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-satellite text-emerald-500/20 text-2xl"></i>
            </div>
          </div>
          <p className="mt-10 text-slate-600 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Syncing Registry Nodes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {doctors.map((doc) => (
            <div 
              key={doc.id} 
              onClick={() => setSelectedDoctor(doc)}
              className="bg-slate-900/60 p-10 rounded-[56px] border border-white/5 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all cursor-pointer group flex flex-col h-full relative backdrop-blur-3xl overflow-hidden"
            >
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] group-hover:bg-emerald-500/10 transition-colors"></div>
              
              <div className="mb-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">{doc.specialization}</span>
                  {doc.rating && (
                    <span className="flex items-center text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl text-[10px] font-black border border-white/5 shadow-inner">
                      <i className="fas fa-star mr-2 text-emerald-500 text-[8px]"></i> {doc.rating}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-white group-hover:text-emerald-500 transition-colors leading-tight tracking-tight">{doc.name}</h3>
                <p className="text-slate-500 text-xs font-bold mt-3 flex items-center">
                  <i className="fas fa-award mr-3 text-emerald-500"></i> {doc.experience} Experience
                </p>
              </div>
              
              <div className="flex-grow space-y-4 mb-10 relative z-10">
                <div className="flex items-start text-sm font-medium text-slate-400">
                  <i className="fas fa-map-marker-alt mt-1 mr-4 text-emerald-500 w-4"></i>
                  <span className="leading-snug">{doc.location}</span>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex justify-between items-center relative z-10">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Profile</span>
                <div className="w-12 h-12 rounded-[18px] bg-slate-950 border border-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 group-hover:border-emerald-500 transition-all shadow-xl">
                  <i className="fas fa-chevron-right text-xs"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDoctor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-sm rounded-[48px] overflow-hidden shadow-[0_0_100px_-20px_rgba(16,185,129,0.15)] animate-in zoom-in-95 border-4 border-white/5">
            <div className="bg-slate-950 p-10 text-white relative">
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-8 right-8 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-slate-950 transition-all text-xl border border-white/5"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                {selectedDoctor.specialization}
              </div>
              <h2 className="text-3xl font-black tracking-tighter leading-tight">{selectedDoctor.name}</h2>
              <div className="flex items-center space-x-4 mt-4 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                <span>{selectedDoctor.experience} Exp.</span>
                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                <span className="text-white/60">Verified Professional</span>
              </div>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Facility Location</h4>
                  <div className="flex items-center">
                    <div className="bg-emerald-500/10 text-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 border border-emerald-500/10">
                      <i className="fas fa-clinic-medical text-xs"></i>
                    </div>
                    <div>
                      <p className="font-black text-white text-base leading-tight">{selectedDoctor.clinic}</p>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">{selectedDoctor.location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Operational Hours</h4>
                  <div className="flex items-center">
                    <div className="bg-emerald-500/10 text-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 border border-emerald-500/10">
                      <i className="fas fa-clock text-xs"></i>
                    </div>
                    <p className="font-bold text-slate-300 text-sm leading-snug">{selectedDoctor.timing || 'Mon-Sat: 10 AM - 6 PM'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Direct Contact</h4>
                  <div className="flex items-center">
                    <div className="bg-emerald-500/10 text-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 border border-emerald-500/10">
                      <i className="fas fa-phone-alt text-xs"></i>
                    </div>
                    <p className="font-black text-white text-xl tracking-tight leading-none">{selectedDoctor.phone || 'Registry Locked'}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedDoctor(null)}
                className="w-full py-5 bg-white/5 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-slate-950 transition-all border border-white/10 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && doctors.length === 0 && (
        <div className="text-center py-40 bg-slate-900/40 rounded-[80px] border-4 border-dashed border-white/5">
          <div className="w-28 h-28 bg-slate-950 border border-white/5 rounded-[48px] flex items-center justify-center mx-auto mb-10 shadow-2xl">
            <i className="fas fa-search-minus text-slate-700 text-5xl"></i>
          </div>
          <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Registry Node Offline</h3>
          <p className="text-slate-500 font-medium mb-12 max-w-xs mx-auto text-lg leading-relaxed">The search parameters yielded zero active verified practitioners.</p>
          <button 
            onClick={() => {setSearchTerm(''); setRegionTerm(''); setActiveFilter('All');}}
            className="bg-emerald-500 text-slate-950 px-12 py-5 rounded-3xl font-black hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20 text-sm uppercase tracking-widest"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorListPage;