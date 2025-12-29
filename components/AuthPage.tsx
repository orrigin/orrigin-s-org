
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    email: '', 
    full_name: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        // Strict verification: Check both email and password
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('email', formData.email)
          .eq('password', formData.password)
          .single();

        if (fetchError || !data) {
          throw new Error("Invalid credentials. Please verify your registry email and password.");
        }

        localStorage.setItem('aarogya_user', JSON.stringify({
          id: data.id,
          full_name: data.full_name,
          email: data.email
        }));
        onAuthSuccess(data);
      } else {
        // Registration: Store all fields including password
        const { data, error: insertError } = await supabase
          .from('users')
          .insert([{ 
            email: formData.email, 
            full_name: formData.full_name,
            password: formData.password 
          }])
          .select()
          .single();

        if (insertError) {
          if (insertError.code === '23505') throw new Error("This email is already registered in the network.");
          throw insertError;
        }

        localStorage.setItem('aarogya_user', JSON.stringify({
          id: data.id,
          full_name: data.full_name,
          email: data.email
        }));
        onAuthSuccess(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 lg:py-24 animate-in fade-in zoom-in-95 duration-700">
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl rounded-[48px] p-8 lg:p-12 shadow-2xl border border-slate-200 dark:border-white/5 relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="text-center mb-10 lg:mb-12 relative z-10">
          <div className="bg-emerald-500/10 w-16 h-16 lg:w-20 lg:h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 lg:mb-8 text-emerald-500 text-2xl lg:text-3xl shadow-2xl shadow-emerald-500/10 border border-emerald-500/20">
            <i className={isLogin ? "fas fa-fingerprint" : "fas fa-user-plus"}></i>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
            {isLogin ? "Secure Access" : "Initialize Identity"}
          </h1>
          <p className="text-slate-500 text-[10px] font-black mt-3 uppercase tracking-widest leading-relaxed">
            {isLogin ? "Verify clinical credentials" : "Create your personal health node"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl text-[10px] border border-red-500/20 flex items-center font-bold animate-in shake duration-500">
            <i className="fas fa-exclamation-triangle mr-3 text-lg"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6 relative z-10">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">Display Name</label>
              <input 
                type="text" 
                required 
                className="w-full p-4 lg:p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold placeholder:text-slate-400" 
                placeholder="Full Legal Name" 
                value={formData.full_name} 
                onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">Registry Email</label>
            <input 
              type="email" 
              required 
              className="w-full p-4 lg:p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold placeholder:text-slate-400" 
              placeholder="id@network.com" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">Access PIN / Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                className="w-full p-4 lg:p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold placeholder:text-slate-400" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 lg:py-5 bg-emerald-500 text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 shadow-2xl shadow-emerald-500/20 transition-all active:scale-[0.98] mt-6"
          >
            {loading ? <i className="fas fa-circle-notch animate-spin mr-3"></i> : (isLogin ? "Decrypt & Enter" : "Establish Secure Node")}
          </button>
        </form>

        <div className="mt-8 lg:mt-12 pt-8 lg:pt-10 border-t border-slate-200 dark:border-white/5 text-center relative z-10">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {isLogin ? "Not in the registry?" : "Identity already exists?"}
            <button onClick={() => {setIsLogin(!isLogin); setError(null);}} className="ml-3 text-emerald-600 dark:text-emerald-500 font-black hover:text-emerald-400 transition-colors">
              {isLogin ? "Initialize Now" : "Authenticate"}
            </button>
          </p>
          <button onClick={onBack} className="mt-8 text-slate-400 dark:text-slate-700 text-[9px] font-black uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center mx-auto">
            <i className="fas fa-arrow-left mr-3"></i> Back to Navigation
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
