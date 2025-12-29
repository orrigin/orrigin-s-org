
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface JoinDoctorPageProps {
  onBack: () => void;
}

const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedic', 'Neurologist', 'Gynecologist', 'ENT Specialist', 'Psychiatrist', 'Gastroenterologist', 'Oncologist', 'Ophthalmologist', 'Physiotherapist', 'Other'
];

const JoinDoctorPage: React.FC<JoinDoctorPageProps> = ({ onBack }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtherSpec, setShowOtherSpec] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '', registration_no: '', email: '', specialization: 'General Physician', other_specialization: '', experience: '', phone: '', region: '', timing: '', clinic_name: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'specialization') setShowOtherSpec(value === 'Other');
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const finalSpecialization = formData.specialization === 'Other' ? formData.other_specialization : formData.specialization;
    try {
      const payload = { 
        full_name: formData.full_name, 
        registration_no: formData.registration_no, 
        email: formData.email, 
        specialization: finalSpecialization, 
        experience: formData.experience + ' Years', 
        region: formData.region, 
        phone: formData.phone, 
        timing: formData.timing, 
        // Note: 'clinic' column is missing from DB, omitting from payload
        status: 'pending' 
      };
      const { error: insertError } = await supabase.from('applications').insert([payload]);
      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-16 animate-in slide-in-from-right-6 duration-700">
      <button onClick={onBack} className="mb-8 lg:mb-12 text-slate-500 hover:text-emerald-500 font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center transition-all group">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center mr-4 group-hover:bg-emerald-500/10 group-hover:border-emerald-500 transition-all">
          <i className="fas fa-chevron-left"></i>
        </div>
        Back to Home
      </button>

      {!submitted ? (
        <div className="bg-white dark:bg-slate-900/60 rounded-[32px] md:rounded-[56px] p-8 md:p-16 shadow-2xl border border-slate-200 dark:border-white/5 backdrop-blur-3xl relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Doctor Registry</h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-12 text-base lg:text-lg leading-relaxed">Provide your clinical credentials to join our verified health navigation map.</p>
            
            {error && <div className="mb-8 p-6 bg-red-500/10 text-red-600 dark:text-red-400 rounded-3xl text-sm border border-red-500/20 flex items-center font-bold">
              <i className="fas fa-biohazard mr-4 text-xl"></i>
              {error}
            </div>}

            <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">Full Clinical Name</label>
                  <input type="text" name="full_name" required className="w-full p-5 lg:p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold placeholder:text-slate-400" placeholder="e.g. Dr. Samir Iyer" onChange={handleChange} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">Medical Reg. Number</label>
                  <input type="text" name="registration_no" required className="w-full p-5 lg:p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold placeholder:text-slate-400" placeholder="MCI-12345" onChange={handleChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">Email Address</label>
                  <input type="email" name="email" required className="w-full p-5 lg:p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold placeholder:text-slate-400" placeholder="doctor@example.com" onChange={handleChange} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">Encrypted Contact</label>
                  <input type="tel" name="phone" required className="w-full p-5 lg:p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold placeholder:text-slate-400" placeholder="9876543210" onChange={handleChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">Specialization</label>
                  <select name="specialization" className="w-full p-5 lg:p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-black appearance-none" onChange={handleChange}>
                    {SPECIALIZATIONS.map(spec => <option key={spec} value={spec} className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">{spec}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">Clinical Experience</label>
                  <div className="relative">
                    <input type="number" name="experience" required min="0" max="60" className="w-full p-5 lg:p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold placeholder:text-slate-400" placeholder="e.g. 10" onChange={handleChange} />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest">Years</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">Clinic Name</label>
                  <input type="text" name="clinic_name" required className="w-full p-5 lg:p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold placeholder:text-slate-400" placeholder="Clinic/Hospital Name" onChange={handleChange} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">Region/City</label>
                  <input type="text" name="region" required className="w-full p-5 lg:p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold placeholder:text-slate-400" placeholder="e.g. Palghar" onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.4em] ml-2">Consultation Timings</label>
                <input type="text" name="timing" required className="w-full p-5 lg:p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold placeholder:text-slate-400" placeholder="e.g. Mon-Sat: 10 AM - 6 PM" onChange={handleChange} />
              </div>

              <button type="submit" disabled={loading} className="w-full py-5 lg:py-6 bg-emerald-500 text-white dark:text-slate-950 rounded-2xl lg:rounded-3xl font-black uppercase tracking-widest text-[10px] lg:text-sm hover:bg-emerald-400 shadow-2xl shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 lg:mt-8">
                {loading ? <i className="fas fa-satellite-dish animate-spin mr-4"></i> : 'Submit for Board Verification'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="text-center py-24 lg:py-32 bg-white dark:bg-slate-900/60 rounded-[40px] md:rounded-[64px] shadow-2xl border border-slate-200 dark:border-white/5 backdrop-blur-3xl animate-in zoom-in-95">
          <div className="w-20 h-20 lg:w-24 lg:h-24 bg-emerald-500/10 text-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 text-3xl lg:text-4xl shadow-2xl shadow-emerald-500/10 border border-emerald-500/20">
            <i className="fas fa-check"></i>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">Application Archived</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-12 max-w-md mx-auto leading-relaxed text-base lg:text-lg">Our medical board will review your credentials. System sync expected within 48 clinical hours.</p>
          <button onClick={onBack} className="bg-emerald-500 text-white dark:text-slate-950 px-10 lg:px-12 py-4 lg:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all active:scale-95 shadow-xl">Return to Network Home</button>
        </div>
      )}
    </div>
  );
};

export default JoinDoctorPage;
