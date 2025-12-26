import React, { useState } from 'react';
import { ViewState } from '../types';

interface FooterProps {
  onNavigate: (view: ViewState) => void;
  onAdminLogin: (pin: string) => boolean;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, onAdminLogin }) => {
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAdminLogin(pin);
    if (success) {
      setShowPinInput(false);
      setPin('');
      setError(false);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-24 pb-12 overflow-hidden relative">
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center mb-8 cursor-pointer group" onClick={() => onNavigate('home')}>
              <div className="bg-emerald-500 p-2 rounded-xl mr-3 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <i className="fas fa-stethoscope text-slate-950 text-lg"></i>
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">Aarogya<span className="text-emerald-500">AI</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
              Empowering India with AI-driven health navigation. Find the right specialist for your symptoms, quickly and easily through verified regional clinical nodes.
            </p>
          </div>

          <div>
            <h4 className="font-black text-white text-[10px] uppercase tracking-[0.4em] mb-8">Navigation Map</h4>
            <ul className="space-y-5 text-xs font-black uppercase tracking-widest">
              <li><button onClick={() => onNavigate('home')} className="text-slate-500 hover:text-emerald-500 transition-colors">Registry Home</button></li>
              <li><button onClick={() => onNavigate('find-doctor')} className="text-slate-500 hover:text-emerald-500 transition-colors">Check Symptoms</button></li>
              <li><button onClick={() => onNavigate('doctor-list')} className="text-slate-500 hover:text-emerald-500 transition-colors">Verified Doctors</button></li>
              <li><button onClick={() => onNavigate('join-doctor')} className="text-slate-500 hover:text-emerald-500 transition-colors">Join Registry</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white text-[10px] uppercase tracking-[0.4em] mb-8">Clinical Policy</h4>
            <ul className="space-y-5 text-xs font-black uppercase tracking-widest text-slate-500">
              <li className="hover:text-emerald-500 cursor-pointer transition-colors">Privacy Protocol</li>
              <li className="hover:text-emerald-500 cursor-pointer transition-colors">Terms of Node</li>
              <li className="hover:text-emerald-500 cursor-pointer transition-colors">Medical Disclaimer</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white text-[10px] uppercase tracking-[0.4em] mb-8">Global Uplink</h4>
            <ul className="space-y-5 text-xs font-black uppercase tracking-widest text-slate-500">
              <li className="flex items-start"><i className="fas fa-satellite mr-4 mt-0.5 text-emerald-500/50"></i> aarogya.ai.india@gmail.com</li>
              <li className="flex items-start"><i className="fas fa-broadcast-tower mr-4 mt-0.5 text-emerald-500/50"></i> 1800-AAROGYA-AI</li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">&copy; {new Date().getFullYear()} AarogyaAI Network. All verified clinical nodes reserved.</p>
          
          <div className="mt-12 flex flex-col items-center justify-center">
            {!showPinInput ? (
              <button 
                onClick={() => setShowPinInput(true)}
                className="text-[9px] text-slate-600 hover:text-emerald-500 transition-all flex items-center px-6 py-3 rounded-full bg-white/5 hover:bg-emerald-500/10 border border-white/5 font-black uppercase tracking-[0.3em]"
              >
                <i className="fas fa-fingerprint mr-3 text-emerald-500"></i>
                Terminal Administrator
              </button>
            ) : (
              <form onSubmit={handlePinSubmit} className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center space-x-3 bg-slate-900 p-2 rounded-2xl border border-white/10 shadow-2xl">
                  <input 
                    type="password"
                    placeholder="ADMIN PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    autoFocus
                    className={`text-xs px-4 py-2 bg-slate-950 outline-none w-36 rounded-xl transition-all border font-black tracking-widest ${error ? 'border-red-500 text-red-500 shadow-[0_0_20px_-5px_rgba(239,68,68,0.5)]' : 'border-emerald-500/30 text-white focus:border-emerald-500'}`}
                  />
                  <button 
                    type="submit"
                    className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10"
                  >
                    Auth
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowPinInput(false)}
                    className="text-slate-500 hover:text-white p-2 transition-colors"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
                {error && <p className="text-[10px] text-red-500 mt-4 font-black uppercase tracking-widest animate-pulse">Access Denied</p>}
                <p className="text-[9px] text-slate-700 mt-4 font-bold uppercase tracking-[0.2em]">Prototype Security PIN: 1234</p>
              </form>
            )}
            
            <div className="mt-8 flex items-center space-x-2 text-[9px] text-slate-800 font-black uppercase tracking-[0.5em]">
              <i className="fas fa-shield-virus"></i>
              <span>Network Gateway Alpha v3.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;