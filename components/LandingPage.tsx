import React, { useEffect, useState } from 'react';
import { ViewState, Doctor } from '../types';
import { MOCK_DOCTORS } from '../constants';
import { supabase } from '../services/supabaseClient';

interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [featuredDoctors, setFeaturedDoctors] = useState<Doctor[]>(MOCK_DOCTORS.slice(0, 4));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .ilike('region', '%Palghar%')
          .limit(4);
        
        if (error) throw error;
        
        const combined = [...(data || [])];
        MOCK_DOCTORS.forEach(mockDoc => {
          if (combined.length < 4 && !combined.some(d => d.name === mockDoc.name)) {
            combined.push(mockDoc);
          }
        });

        setFeaturedDoctors(combined.slice(0, 4));
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setFeaturedDoctors(MOCK_DOCTORS.slice(0, 4));
      } finally {
        setLoading(false);
      }
    };

    fetchTopDoctors();
  }, []);

  return (
    <div className="animate-in fade-in duration-700 bg-slate-950">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 py-20 lg:py-32 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>AarogyaAI: Health Navigator for India</span>
            </div>
            <h1 className="text-4xl lg:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
              Confused about which doctor to visit? <br/>
              <span className="text-emerald-500">Let AI guide you.</span>
            </h1>
            <p className="text-xl text-slate-400 mb-12 max-w-xl leading-relaxed font-medium">
              Describe your symptoms in simple language. Our AI suggests the right specialist and connects you with verified clinics nearby.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <button 
                onClick={() => onNavigate('find-doctor')}
                className="bg-emerald-500 text-slate-950 text-lg px-10 py-5 rounded-2xl font-black hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center uppercase tracking-widest"
              >
                Find the Right Doctor
                <i className="fas fa-arrow-right ml-3"></i>
              </button>
              <button 
                onClick={() => onNavigate('doctor-list')}
                className="bg-white/5 text-white text-lg px-10 py-5 rounded-2xl font-black border border-white/10 hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center uppercase tracking-widest"
              >
                Browse All Doctors
              </button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full"></div>
            <div className="relative p-4 bg-slate-900/50 backdrop-blur-3xl rounded-[48px] border border-white/10 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800" 
                alt="Medical Consultation" 
                className="relative rounded-[32px] object-cover h-[540px] w-full grayscale-[0.2] brightness-75"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. How it works */}
      <section className="py-32 bg-slate-900/50 px-4 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-black text-white mb-6 tracking-tighter">How it works</h2>
            <p className="text-slate-400 text-lg font-medium">Navigation made simple in 3 easy steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Enter Symptoms', desc: 'Type your symptoms in Hindi, English or simple language.', icon: 'fa-keyboard' },
              { step: '02', title: 'AI Analysis', desc: 'Our AI suggests the best medical specialization for your needs.', icon: 'fa-brain' },
              { step: '03', title: 'Connect Nearby', desc: 'Book an appointment with verified specialists in your area.', icon: 'fa-map-marker-alt' }
            ].map((item, idx) => (
              <div key={idx} className="relative group p-10 rounded-[40px] bg-slate-950 border border-white/5 hover:border-emerald-500/50 transition-all shadow-inner">
                <div className="text-7xl font-black text-emerald-500/5 absolute top-6 right-8 group-hover:text-emerald-500/10 transition-colors">
                  {item.step}
                </div>
                <div className="bg-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <i className={`fas ${item.icon} text-slate-950 text-2xl`}></i>
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Doctor Profiles Preview */}
      <section className="py-32 bg-slate-950 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Verified Doctors in Palghar</h2>
              <p className="text-slate-400 text-lg font-medium">Trusted medical professionals available in your region</p>
            </div>
            <button 
              onClick={() => onNavigate('doctor-list')}
              className="text-emerald-500 font-black uppercase tracking-widest text-xs hover:text-emerald-400 transition-colors flex items-center group"
            >
              See all doctors <i className="fas fa-chevron-right ml-3 group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredDoctors.map((doc) => (
              <div 
                key={doc.id} 
                onClick={() => onNavigate('doctor-list')}
                className="bg-slate-900/40 p-10 rounded-[48px] border border-white/5 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all cursor-pointer group flex flex-col relative overflow-hidden backdrop-blur-xl"
              >
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] group-hover:bg-emerald-500/10 transition-colors"></div>
                <div className="relative z-10">
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-3">{doc.specialization}</p>
                  <h3 className="text-xl font-black text-white mb-3 group-hover:text-emerald-500 transition-colors leading-tight">{doc.name}</h3>
                  <p className="text-sm text-slate-500 font-bold mb-8">{doc.experience} Experience</p>
                  <div className="pt-6 border-t border-white/5 flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    View Profile <i className="fas fa-arrow-right ml-3 group-hover:translate-x-2 transition-transform text-emerald-500"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Trust & Safety Section */}
      <section className="py-24 bg-red-950/20 px-4 border-y border-red-500/10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-3 text-red-400 mb-6 bg-red-500/10 px-6 py-2 rounded-full border border-red-500/20">
            <i className="fas fa-exclamation-triangle"></i>
            <span className="font-black text-[10px] tracking-[0.4em] uppercase">Safety Protocol</span>
          </div>
          <h2 className="text-4xl font-black text-white mb-8 tracking-tighter">Medical Disclaimer</h2>
          <p className="text-xl text-slate-400 leading-relaxed mb-8 font-medium italic">
            "AarogyaAI is an informational tool only. Suggestions provided are based on general medical data and NOT a professional diagnosis. If you are experiencing a medical emergency, please visit the nearest hospital or call emergency services immediately."
          </p>
        </div>
      </section>

      {/* 8. Bottom CTA */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 blur-[120px]"></div>
        <div className="max-w-5xl mx-auto bg-emerald-500 rounded-[64px] p-16 lg:p-24 text-center text-slate-950 shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-900/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-6xl font-black mb-8 tracking-tighter leading-tight">Ready to find the right care?</h2>
            <p className="text-slate-950/70 text-xl mb-12 max-w-2xl mx-auto font-bold leading-relaxed">
              Stop guessing. Start knowing. Join thousands of Indians using AarogyaAI to navigate their healthcare journey.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-8">
              <button 
                onClick={() => onNavigate('find-doctor')}
                className="bg-slate-950 text-emerald-500 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-2xl shadow-slate-950/30 active:scale-95"
              >
                Find the Right Doctor
              </button>
              <button 
                onClick={() => onNavigate('join-doctor')}
                className="bg-emerald-600 text-slate-950 border border-emerald-700/30 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all active:scale-95"
              >
                Join as a Doctor
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;