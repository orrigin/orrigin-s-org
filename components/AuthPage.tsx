import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';

interface AuthPageProps {
  onBack: () => void;
  onAuthSuccess: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('email', formData.email)
          .single();

        if (fetchError || !data) throw new Error("Registry node not found. Please create an account.");
        
        localStorage.setItem('aarogya_user', JSON.stringify(data));
        onAuthSuccess(data);
      } else {
        const { data, error: insertError } = await supabase
          .from('users')
          .insert([{ email: formData.email, full_name: formData.full_name }])
          .select()
          .single();

        if (insertError) throw insertError;
        
        alert(`Registry entry created! System welcome sent to ${formData.email}.`);
        
        localStorage.setItem('aarogya_user', JSON.stringify(data));
        onAuthSuccess(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24 animate-in fade-in zoom-in-95 duration-700">
      <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[48px] p-10 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="text-center mb-12 relative z-10">
          <div className="bg-emerald-500/10 w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-8 text-emerald-500 text-3xl shadow-2xl shadow-emerald-500/10 border border-emerald-500/20">
            <i className={isLogin ? "fas fa-shield-alt" : "fas fa-user-astronaut"}></i>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            {isLogin ? "Access Registry" : "Initialize Account"}
          </h1>
          <p className="text-slate-500 text-sm font-bold mt-3 uppercase tracking-widest">
            {isLogin ? "Authenticate to access medical OS" : "Join the AI health navigation map"}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-500/10 text-red-400 rounded-2xl text-xs border border-red-500/20 flex items-center font-bold">
            <i className="fas fa-biohazard mr-3 text-lg"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] ml-2">Display Name</label>
              <input 
                type="text" 
                required
                className="w-full p-5 bg-slate-950 border border-white/10 rounded-2xl text-white outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold placeholder:text-slate-800"
                placeholder="Citizen Name"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] ml-2">Registry Email</label>
            <input 
              type="email" 
              required
              className="w-full p-5 bg-slate-950 border border-white/10 rounded-2xl text-white outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold placeholder:text-slate-800"
              placeholder="id@network.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 shadow-2xl shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-10"
          >
            {loading ? <i className="fas fa-satellite-dish animate-spin mr-3"></i> : (isLogin ? "Authenticate" : "Register Node")}
          </button>
        </form>

        <div className="mt-12 pt-10 border-t border-white/5 text-center relative z-10">
          <p className="text-xs text-slate-500 font-bold">
            {isLogin ? "New to the network?" : "Already authenticated?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-3 text-emerald-500 font-black uppercase tracking-widest hover:text-emerald-400 transition-colors"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
          <button 
            onClick={onBack}
            className="mt-8 text-slate-700 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center mx-auto"
          >
            <i className="fas fa-chevron-left mr-3"></i> Return Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;