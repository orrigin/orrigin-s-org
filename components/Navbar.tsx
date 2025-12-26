import React from 'react';
import { ViewState, User } from '../types';

interface NavbarProps {
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, user, onLogout }) => {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-emerald-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => onNavigate('home')}
          >
            <div className="bg-emerald-500 p-2 rounded-xl mr-3 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-stethoscope text-slate-950 text-lg"></i>
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">Aarogya<span className="text-emerald-500">AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center space-x-10">
            <button onClick={() => onNavigate('home')} className={`text-xs font-black uppercase tracking-widest transition-all ${currentView === 'home' ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-400'}`}>Home</button>
            <button onClick={() => onNavigate('find-doctor')} className={`text-xs font-black uppercase tracking-widest transition-all ${currentView === 'find-doctor' ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-400'}`}>Symptom Navigator</button>
            <button onClick={() => onNavigate('doctor-list')} className={`text-xs font-black uppercase tracking-widest transition-all ${currentView === 'doctor-list' ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-400'}`}>Doctors</button>
          </div>

          <div className="flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-4 bg-slate-900/50 p-1.5 pl-4 rounded-2xl border border-white/5">
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-tighter leading-none">{user.full_name}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  title="Sign Out"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('auth')}
                className="text-xs font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Sign In
              </button>
            )}
            <button 
              onClick={() => onNavigate('find-doctor')}
              className="bg-emerald-500 text-slate-950 px-7 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 shadow-xl shadow-emerald-500/10 transition-all active:scale-95"
            >
              Get Guidance
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;