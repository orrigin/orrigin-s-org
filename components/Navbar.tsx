import React from 'react';
import { ViewState, User } from '../types';

interface NavbarProps {
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
  user: User | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, user, onLogout, theme, onToggleTheme }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-emerald-500/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div 
            className="flex items-center cursor-pointer group shrink-0" 
            onClick={() => onNavigate('home')}
          >
            <div className="bg-emerald-500 p-2 rounded-xl mr-2 sm:mr-3 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-stethoscope text-white dark:text-slate-950 text-lg"></i>
            </div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">Aarogya<span className="text-emerald-500">AI</span></span>
          </div>
          
          <div className="hidden lg:flex items-center space-x-10">
            <button onClick={() => onNavigate('home')} className={`text-xs font-black uppercase tracking-widest transition-all ${currentView === 'home' ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-400'}`}>Home</button>
            <button onClick={() => onNavigate('find-doctor')} className={`text-xs font-black uppercase tracking-widest transition-all ${currentView === 'find-doctor' ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-400'}`}>Symptom Navigator</button>
            <button onClick={() => onNavigate('doctor-list')} className={`text-xs font-black uppercase tracking-widest transition-all ${currentView === 'doctor-list' ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-400'}`}>Doctors</button>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={onToggleTheme}
              className="p-2 sm:p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-all active:scale-90"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-sm sm:text-base`}></i>
            </button>

            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-4 bg-slate-100 dark:bg-slate-900/50 p-1.5 pl-3 sm:pl-4 rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="hidden sm:block text-right max-w-[100px] truncate">
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-tighter leading-none">{user.full_name}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-red-500/20 hover:text-red-500 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all"
                  title="Sign Out"
                >
                  <i className="fas fa-sign-out-alt text-xs sm:text-base"></i>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('auth')}
                className="hidden sm:block text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Sign In
              </button>
            )}
            <button 
              onClick={() => onNavigate('find-doctor')}
              className="bg-emerald-500 text-white dark:text-slate-950 px-4 sm:px-7 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-400 shadow-xl shadow-emerald-500/10 transition-all active:scale-95"
            >
              <span className="hidden sm:inline">Get Guidance</span>
              <span className="sm:hidden"><i className="fas fa-search"></i></span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;